#!/usr/bin/env node
/**
 * create-admin.mjs — create the FIRST (or an additional) admin account for a store.
 *
 * Reads Supabase credentials from an env file (default `.env.local`, or pass a
 * path / an env-backups file). Admin email+password come from env vars,
 * CLI args, or an interactive prompt.
 *
 * Usage:
 *   node scripts/create-admin.mjs                       # uses .env.local, prompts for email/pass
 *   node scripts/create-admin.mjs --env env-backups/zaynahs.env.local
 *   ADMIN_EMAIL=a@b.com ADMIN_PASSWORD=secret node scripts/create-admin.mjs --env .env.local
 *   node scripts/create-admin.mjs --email a@b.com --password secret
 *
 * It creates a confirmed Supabase Auth user (service role, no email verification).
 * REMEMBER: also add the email to NEXT_PUBLIC_ADMIN_EMAIL (Vercel env) — that
 * allow-list is the authorization layer enforced by middleware.ts + requireAdmin.
 */
import fs from 'fs';
import readline from 'readline';

function arg(flag) {
  const i = process.argv.indexOf(flag);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

function readEnv(file) {
  const out = {};
  if (!fs.existsSync(file)) return out;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

function prompt(q, { mask = false } = {}) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    if (mask) {
      process.stdout.write(q);
      const onData = (ch) => {
        ch = ch.toString();
        if (ch === '\n' || ch === '\r' || ch === '\u0004') process.stdin.removeListener('data', onData);
        else process.stdout.write('*');
      };
      process.stdin.on('data', onData);
    }
    rl.question(mask ? '' : q, (a) => { rl.close(); if (mask) process.stdout.write('\n'); resolve(a.trim()); });
  });
}

async function main() {
  const envFile = arg('--env') || '.env.local';
  const env = { ...readEnv(envFile), ...process.env };

  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error(`❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in ${envFile}`);
    process.exit(1);
  }

  const email = arg('--email') || env.ADMIN_EMAIL || (await prompt('Admin email: '));
  const password = arg('--password') || env.ADMIN_PASSWORD || (await prompt('Admin password: ', { mask: true }));
  if (!email || !password || password.length < 6) {
    console.error('❌ Email required and password must be ≥ 6 chars.');
    process.exit(1);
  }

  const res = await fetch(`${url}/auth/v1/admin/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Already-exists is fine for idempotency
    const msg = (data && (data.msg || data.message || JSON.stringify(data))) || `HTTP ${res.status}`;
    if (/already.*registered|already been registered|email_exists/i.test(msg)) {
      console.log(`ℹ️  User ${email} already exists — no change.`);
    } else {
      console.error(`❌ Failed to create admin: ${msg}`);
      process.exit(1);
    }
  } else {
    console.log(`✅ Admin auth user created: ${email} (email confirmed).`);
  }

  const allow = (env.NEXT_PUBLIC_ADMIN_EMAIL || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (!allow.includes(email.toLowerCase())) {
    console.log('\n⚠️  NEXT STEP (authorization layer):');
    console.log(`   Add "${email}" to NEXT_PUBLIC_ADMIN_EMAIL in your Vercel/env settings,`);
    console.log('   otherwise login will show "Access denied: Not authorized for admin portal."');
  } else {
    console.log('✅ Email is already in NEXT_PUBLIC_ADMIN_EMAIL allow-list.');
  }
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
