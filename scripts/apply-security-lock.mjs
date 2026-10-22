#!/usr/bin/env node

/**
 * apply-security-lock.mjs — deploy the public-PII / privilege-escalation lock.
 *
 * WHAT IT DOES (per store, idempotent, safe to re-run):
 *   1. Creates `public.admin_users` + `public.is_admin()` (additive, no policy change yet).
 *   2. Seeds admin_users from NEXT_PUBLIC_ADMIN_EMAIL.
 *   3. Tags those auth users with app_metadata.role = 'admin' (belt & braces).
 *   4. Disables public Supabase signup (closes the "authenticated = admin" path).
 *   5. Applies `supabase/migrations/20261022000000_security_lock_public_pii.sql`
 *      (orders PII, reviews PII, store_settings secrets, is_admin() policies).
 *   6. Verifies with the PUBLIC anon key that the leaks are actually closed.
 *
 * Usage:
 *   node scripts/apply-security-lock.mjs                # all stores
 *   node scripts/apply-security-lock.mjs --store=zaynahs
 *   node scripts/apply-security-lock.mjs --dry-run      # plan only
 *
 * Never prints tokens, keys or customer data.
 */

import fs from 'node:fs';
import path from 'node:path';

const ENV_DIR = path.resolve('env-backups');
const MIGRATION = path.resolve(
  'supabase/migrations/20261022000000_security_lock_public_pii.sql'
);
const SPLIT_MARKER = '-- ── 2. orders';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const onlyStore = args.find((a) => a.startsWith('--store='))?.split('=')[1]?.trim();
const envFile = args.find((a) => a.startsWith('--env='))?.split('=')[1]?.trim();

function loadEnv(filePath) {
  const env = {};
  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq > 0) {
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      env[trimmed.slice(0, eq).trim()] = value;
    }
  }
  return env;
}

function discoverStores() {
  if (envFile) {
    const resolved = path.resolve(envFile);
    if (!fs.existsSync(resolved)) {
      console.error(`Env file not found: ${resolved}`);
      process.exit(1);
    }
    return [
      {
        name: path.basename(resolved).replace(/^\.env\.local$/, 'current') || 'current',
        env: loadEnv(resolved),
      },
    ];
  }
  return fs
    .readdirSync(ENV_DIR)
    .filter((f) => f.endsWith('.env.local'))
    .map((f) => ({ name: f.replace('.env.local', ''), env: loadEnv(path.join(ENV_DIR, f)) }))
    .filter((s) => s.env.SUPABASE_PROJECT_REF && s.env.SUPABASE_MGMT_TOKEN)
    .filter((s) => (onlyStore ? s.name === onlyStore : true));
}

async function mgmtQuery(env, sql) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${env.SUPABASE_PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.SUPABASE_MGMT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    }
  );
  const body = await res.text();
  let parsed = null;
  try {
    parsed = JSON.parse(body);
  } catch {
    /* non-JSON */
  }
  return { ok: res.ok, status: res.status, data: parsed, raw: body };
}

function adminEmails(env) {
  return (env.NEXT_PUBLIC_ADMIN_EMAIL || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

async function tagAdminUsers(env, emails) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || emails.length === 0) {
    return { updated: 0, note: 'no service role / no admin emails' };
  }

  // List users (paginated enough for this app's small admin set).
  const listRes = await fetch(`${url}/auth/v1/admin/users?page=1&per_page=200`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!listRes.ok) return { updated: 0, note: `list failed (${listRes.status})` };
  const list = await listRes.json();
  const users = Array.isArray(list?.users) ? list.users : [];

  let updated = 0;
  for (const user of users) {
    const email = String(user.email || '').toLowerCase();
    if (!emails.includes(email)) continue;
    const appMeta = { ...(user.app_metadata || {}), role: 'admin' };
    const res = await fetch(`${url}/auth/v1/admin/users/${user.id}`, {
      method: 'PUT',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ app_metadata: appMeta }),
    });
    if (res.ok) updated += 1;
  }
  return { updated, note: `${users.length} auth users scanned` };
}

async function disableSignup(env) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${env.SUPABASE_PROJECT_REF}/config/auth`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${env.SUPABASE_MGMT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ disable_signup: true }),
    }
  );
  return { ok: res.ok, status: res.status };
}

async function anonProbe(env, table, select = 'id', extra = '') {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const res = await fetch(`${url}/rest/v1/${table}?select=${select}${extra}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  const text = await res.text();
  return { status: res.status, body: text, closed: res.status === 401 || res.status === 403 };
}

async function applyStore(store) {
  const { name, env } = store;
  const emails = adminEmails(env);
  const report = { store: name, steps: {}, verify: {} };

  if (!env.SUPABASE_MGMT_TOKEN || !env.SUPABASE_PROJECT_REF) {
    report.steps.credentials = 'SKIP — missing management token';
    return report;
  }

  const migrationSql = fs.readFileSync(MIGRATION, 'utf8');
  const splitAt = migrationSql.indexOf(SPLIT_MARKER);
  if (splitAt < 0) throw new Error(`Split marker not found in ${MIGRATION}`);
  const part1 = migrationSql.slice(0, splitAt);
  const part2 = migrationSql.slice(splitAt);

  if (dryRun) {
    report.steps.plan = `part1(${part1.length}b) + ${emails.length} admin email(s) + signup off + part2(${part2.length}b)`;
    return report;
  }

  // 1 — additive schema + predicate
  const r1 = await mgmtQuery(env, part1);
  report.steps.schema = r1.ok ? 'OK' : `FAILED ${r1.status}: ${r1.raw.slice(0, 160)}`;
  if (!r1.ok) return report;

  // 2 — seed admin allow-list (before policies change → no admin lockout)
  if (emails.length === 0) {
    report.steps.adminUsers = 'WARN — NEXT_PUBLIC_ADMIN_EMAIL empty';
  } else {
    const values = emails
      .map((e) => `('${e.replace(/'/g, "''")}')`)
      .join(',');
    const r2 = await mgmtQuery(
      env,
      `INSERT INTO public.admin_users (email) VALUES ${values} ON CONFLICT (email) DO NOTHING;`
    );
    report.steps.adminUsers = r2.ok ? `OK (${emails.length})` : `FAILED ${r2.status}`;
  }

  // 3 — app_metadata.role = 'admin' for those users
  const tag = await tagAdminUsers(env, emails);
  report.steps.appMetadata = `${tag.updated} updated (${tag.note})`;

  // 4 — disable public signup
  const signup = await disableSignup(env);
  report.steps.signup = signup.ok ? 'DISABLED' : `FAILED ${signup.status}`;

  // 5 — tighten policies / revoke public grants
  const r5 = await mgmtQuery(env, part2);
  report.steps.policies = r5.ok ? 'OK' : `FAILED ${r5.status}: ${r5.raw.slice(0, 160)}`;
  if (!r5.ok) return report;

  // 6 — verify with the PUBLIC anon key
  const orders = await anonProbe(env, 'orders');
  const settings = await anonProbe(env, 'store_settings', 'ai_model_credentials');
  const reviewsPii = await anonProbe(env, 'reviews', 'customer_email');
  const reviewsPublic = await anonProbe(env, 'reviews', 'customer_name,rating,comment');

  report.verify = {
    orders: `${orders.status} ${orders.closed ? 'CLOSED' : 'STILL OPEN'}`,
    storeSettingsSecrets: `${settings.status} ${settings.closed ? 'CLOSED' : 'STILL OPEN'}`,
    reviewsPii: `${reviewsPii.status} ${reviewsPii.closed ? 'CLOSED' : 'STILL OPEN'}`,
    reviewsPublic: `${reviewsPublic.status} ${reviewsPublic.status === 200 ? 'OK' : 'BROKEN'}`,
  };

  return report;
}

const stores = discoverStores();
if (stores.length === 0) {
  console.error('No stores found in env-backups/.');
  process.exit(1);
}

console.log(`▶ security lock — ${stores.length} store(s)${dryRun ? ' [DRY RUN]' : ''}`);

const results = [];
for (const store of stores) {
  console.log(`\n=== ${store.name} ===`);
  try {
    const report = await applyStore(store);
    console.log(JSON.stringify(report.steps, null, 1));
    if (Object.keys(report.verify).length) console.log('verify:', JSON.stringify(report.verify));
    results.push(report);
  } catch (err) {
    console.error(`FAILED: ${err.message}`);
    results.push({ store: store.name, error: err.message });
  }
}

const failed = results.filter(
  (r) => r.error || Object.values(r.steps || {}).some((v) => String(v).startsWith('FAILED'))
);
console.log(`\n──────── summary ────────`);
console.log(`stores: ${results.length} | failed: ${failed.length}`);
for (const r of results) {
  console.log(` ${r.store}: ${r.error ? `ERROR ${r.error}` : JSON.stringify(r.verify || r.steps)}`);
}
process.exit(failed.length ? 1 : 0);
