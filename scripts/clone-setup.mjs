#!/usr/bin/env node
/**
 * clone-setup.mjs — ONE-COMMAND CLONE SETUP ("100% first time" bring-up).
 * ════════════════════════════════════════════════════════════════════════
 * Runs the full new-store bring-up in the correct order, reusing the existing
 * single-purpose scripts (SSOT — no duplicated logic):
 *
 *   1. preflight     — validate required env keys + no-redirect site URL
 *   2. db:schema     — scripts/init-db.mjs           (SUPER_MASTER_SCHEMA.sql)
 *   3. db:webhooks   — scripts/setup-triggers.mjs    (21 revalidate triggers, real URL+secret)
 *   4. db:admin      — scripts/create-admin.mjs      (Supabase Auth admin user)
 *   5. db:brand      — scripts/seed-brand.mjs        (brand text in settings/ai/seo)
 *   6. vercel        — scripts/vercel-setup.mjs      (push ALL env vars [+ --deploy])
 *   7. cf:dns        — scripts/cloudflare-dns.mjs    (A @ + CNAME www, proxied)
 *   8. cf:rules      — scripts/deploy-cloudflare-rules.js (4 cache rules + proxy)
 *   9. verify        — HTTP 200 checks + webhook test
 *
 * ENV SELECTION (one store at a time):
 *   --store=lobo        → uses env-backups/lobo.env.local (temp-swaps .env.local, restores after)
 *   --env=path/to.env   → uses that file
 *   (default)           → uses root .env.local as-is
 *
 * ⚠️  INTENDED FOR A FRESH CLONE. Step 5 (db:brand / seed-brand.mjs) OVERWRITES the
 *     store_settings/ai_settings/seo_meta brand text with generated defaults. On an
 *     ALREADY-LIVE store use --skip-db (or run only the phases you need) so you don't
 *     clobber customized brand content.
 *
 * FLAGS:
 *   --deploy            → also trigger a Vercel production deploy in step 6
 *   --skip-db --skip-vercel --skip-cloudflare --skip-verify
 *   --only=db|vercel|cloudflare|verify   → run just one phase
 *   --yes               → no confirmation prompt
 *
 * USAGE:
 *   node scripts/clone-setup.mjs --store=lobo --deploy --yes
 *   npm run clone:setup -- --store=lobo --deploy --yes
 */
import { readFileSync, writeFileSync, existsSync, copyFileSync, unlinkSync } from 'fs';
import { resolve } from 'path';
import { spawnSync } from 'child_process';
import readline from 'readline';

const ROOT = process.cwd();
const ENV_LOCAL = resolve(ROOT, '.env.local');

function arg(name) {
  const pfx = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(pfx));
  return hit ? hit.slice(pfx.length) : undefined;
}
const has = (f) => process.argv.includes(`--${f}`);

function parseEnv(file) {
  const out = {};
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 0) continue;
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

// ── Resolve the env source file ───────────────────────────────────────────
const store = arg('store');
const envArg = arg('env');
let sourceEnvFile = ENV_LOCAL;
if (store) sourceEnvFile = resolve(ROOT, 'env-backups', `${store}.env.local`);
else if (envArg) sourceEnvFile = resolve(ROOT, envArg);

if (!existsSync(sourceEnvFile)) {
  console.error(`❌ Env file not found: ${sourceEnvFile}`);
  process.exit(1);
}
const ENV = parseEnv(sourceEnvFile);

const REQUIRED = [
  'SUPABASE_PROJECT_REF', 'SUPABASE_MGMT_TOKEN', 'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SITE_URL', 'REVALIDATE_SECRET', 'NEXT_PUBLIC_BRAND_NAME',
  'VERCEL_TOKEN', 'VERCEL_PROJECT_NAME',
  'CLOUDFLARE_ZONE_ID', 'CLOUDFLARE_API_TOKEN',
];

// Phase gating
const only = arg('only');
const run = (phase) => (only ? only === phase : !has(`skip-${phase}`));

const childEnv = {
  ...process.env,
  ...ENV,
  // Brand vars for seed-brand.mjs
  BRAND_NAME: ENV.NEXT_PUBLIC_BRAND_NAME || '',
  // Admin bootstrap for create-admin.mjs (password overridable)
  ADMIN_EMAIL: (ENV.NEXT_PUBLIC_ADMIN_EMAIL || '').split(',')[0].trim(),
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || ENV.ADMIN_PASSWORD || 'admin123',
};

function step(label, cmd, args, { optional = false } = {}) {
  console.log(`\n──────── ${label} ────────`);
  console.log(`$ ${cmd} ${args.join(' ')}`);
  const r = spawnSync(cmd, args, { stdio: 'inherit', env: childEnv, cwd: ROOT });
  if (r.status !== 0) {
    if (optional) { console.warn(`⚠️  ${label} failed (non-fatal) — continuing.`); return false; }
    console.error(`\n❌ ${label} FAILED (exit ${r.status}). Aborting.`);
    cleanup();
    process.exit(1);
  }
  return true;
}

// ── Temp-swap .env.local so every child script sees the target store ────────
let swapped = false;
let backupPath = null;
function swapEnv() {
  if (resolve(sourceEnvFile) === ENV_LOCAL) return; // already the active env
  if (existsSync(ENV_LOCAL)) {
    backupPath = resolve(ROOT, `.env.local.bak-${Date.now()}`);
    copyFileSync(ENV_LOCAL, backupPath);
  }
  copyFileSync(sourceEnvFile, ENV_LOCAL);
  swapped = true;
  console.log(`🔁 .env.local ← ${sourceEnvFile}${backupPath ? ` (backup: ${backupPath})` : ''}`);
}
function cleanup() {
  if (!swapped) return;
  if (backupPath && existsSync(backupPath)) {
    copyFileSync(backupPath, ENV_LOCAL);
    unlinkSync(backupPath);
    console.log('🔁 .env.local restored.');
  } else if (!backupPath && existsSync(ENV_LOCAL)) {
    unlinkSync(ENV_LOCAL);
  }
  swapped = false;
}
process.on('SIGINT', () => { cleanup(); process.exit(130); });

async function confirm() {
  if (has('yes')) return;
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const site = ENV.NEXT_PUBLIC_SITE_URL;
  const ans = await new Promise((res) =>
    rl.question(`\nSet up store "${ENV.NEXT_PUBLIC_BRAND_NAME}" (${site}) on Supabase ${ENV.SUPABASE_PROJECT_REF}? [y/N] `, (a) => { rl.close(); res(a.trim().toLowerCase()); }));
  if (ans !== 'y' && ans !== 'yes') { console.log('Aborted.'); process.exit(0); }
}

async function main() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   CLONE SETUP — one-command store bring-up   ║');
  console.log('╚════════════════════════════════════════════╝');

  // 1) preflight
  const missing = REQUIRED.filter((k) => !ENV[k]);
  if (missing.length) {
    console.error(`❌ Missing required env keys in ${sourceEnvFile}:\n   ${missing.join(', ')}`);
    process.exit(1);
  }
  // no-redirect site URL guard (intake doc: "koi redirect nahi")
  const siteUrl = ENV.NEXT_PUBLIC_SITE_URL || '';
  if (!/^https:\/\//.test(siteUrl)) {
    console.error(`❌ NEXT_PUBLIC_SITE_URL must start with https:// (got "${siteUrl}")`);
    process.exit(1);
  }
  if (/\/$/.test(siteUrl)) {
    console.error(`❌ NEXT_PUBLIC_SITE_URL must NOT end with a trailing slash (got "${siteUrl}"). Canonical URL must be redirect-free.`);
    process.exit(1);
  }
  console.log(`✓ preflight: all ${REQUIRED.length} required keys present.`);
  console.log(`  Store   : ${ENV.NEXT_PUBLIC_BRAND_NAME}`);
  console.log(`  Site    : ${ENV.NEXT_PUBLIC_SITE_URL}`);
  console.log(`  Supabase: ${ENV.SUPABASE_PROJECT_REF}`);
  console.log(`  Vercel  : ${ENV.VERCEL_PROJECT_NAME}`);
  console.log(`  CF zone : ${ENV.CLOUDFLARE_ZONE_ID}`);

  await confirm();
  swapEnv();

  try {
    // 2–5) Database
    if (run('db')) {
      step('db:schema  (SUPER_MASTER_SCHEMA.sql)', 'node', ['scripts/init-db.mjs']);
      step('db:webhooks (revalidate triggers)', 'node', ['scripts/setup-triggers.mjs']);
      step('db:admin   (Supabase Auth user)', 'node', ['scripts/create-admin.mjs', '--env', '.env.local'], { optional: true });
      step('db:brand   (brand text seed)', 'node', ['scripts/seed-brand.mjs'], { optional: true });
    }

    // 6) Vercel env (+ optional deploy)
    if (run('vercel')) {
      step('vercel     (env push' + (has('deploy') ? ' + deploy' : '') + ')', 'node',
        ['scripts/vercel-setup.mjs', ...(has('deploy') ? ['--deploy'] : [])]);
    }

    // 7–8) Cloudflare
    if (run('cloudflare')) {
      step('cf:dns     (A @ + CNAME www, proxied)', 'node', ['scripts/cloudflare-dns.mjs']);
      step('cf:rules   (cache rules + proxy)', 'node', ['--env-file=.env.local', 'scripts/deploy-cloudflare-rules.js'], { optional: true });
    }

    // 9) Verify
    if (run('verify')) {
      step('verify     (HTTP + webhook)', 'node', ['scripts/post-deploy-fix.mjs'], { optional: true });
    }

    console.log('\n✅ CLONE SETUP COMPLETE.');
    console.log('   Next: if the custom domain shows SERVFAIL, switch nameservers at the registrar');
    console.log('   (PKNIC for .pk) to the Cloudflare NS shown above, then wait for propagation.');
    console.log(`   Test now at the stable Vercel alias: https://${ENV.VERCEL_PROJECT_NAME}.vercel.app`);
  } finally {
    cleanup();
  }
}

main().catch((e) => { console.error('❌', e); cleanup(); process.exit(1); });
