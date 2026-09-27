/**
 * apply-s1-rls.mjs — applies the S1 RLS migration to EVERY store in env-backups/
 * and re-verifies RLS status after. Idempotent + non-breaking (only enables RLS with
 * access-preserving policies; service-role bypasses RLS). Rollback available:
 *   supabase/migrations/20260926140001_rollback_enable_rls_unprotected_tables.sql
 *
 * Usage: node scripts/apply-s1-rls.mjs
 */

import { readFileSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const backupsDir = resolve(root, 'env-backups');

const migrationSql = readFileSync(
  resolve(root, 'supabase/migrations/20260926140000_enable_rls_unprotected_tables.sql'),
  'utf-8'
);

const verifySql = `
  SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled,
         COUNT(p.polname) AS policy_count
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  LEFT JOIN pg_policy p ON p.polrelid = c.oid
  WHERE n.nspname = 'public'
    AND c.relname IN ('homepage_sections','whatsapp_subscribers','email_templates','schema_version')
  GROUP BY c.relname, c.relrowsecurity
  ORDER BY c.relname;
`;

function parseEnv(content) {
  const vars = {};
  for (const line of content.split('\n')) {
    const t = line.trim();
    if (t && !t.startsWith('#')) {
      const i = t.indexOf('=');
      if (i > 0) vars[t.slice(0, i).trim()] = t.slice(i + 1).trim();
    }
  }
  return vars;
}

async function query(ref, token, sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ query: sql }),
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, text };
}

const files = readdirSync(backupsDir).filter(f => f.endsWith('.env.local'));
const summary = [];

for (const file of files) {
  const store = file.replace('.env.local', '');
  const env = parseEnv(readFileSync(resolve(backupsDir, file), 'utf-8'));
  const ref = env.SUPABASE_PROJECT_REF;
  const token = env.SUPABASE_MGMT_TOKEN;
  console.log(`\n▶ [${store}] ref=${ref}`);
  if (!ref || !token) { console.log('  SKIP — missing ref/token'); summary.push({ store, status: 'SKIP' }); continue; }

  const applied = await query(ref, token, migrationSql);
  if (!applied.ok) {
    console.log(`  ❌ apply failed (HTTP ${applied.status}): ${applied.text.slice(0, 200)}`);
    summary.push({ store, status: `FAIL ${applied.status}` });
    continue;
  }
  console.log('  ✅ S1 migration applied');

  const ver = await query(ref, token, verifySql);
  if (ver.ok) {
    const rows = JSON.parse(ver.text);
    const allOn = rows.every(r => r.rls_enabled);
    for (const r of rows) {
      console.log(`     ${r.table_name.padEnd(22)} rls=${r.rls_enabled ? '✓' : '✗'} policies=${r.policy_count}`);
    }
    summary.push({ store, status: allOn ? 'RLS ON ✓' : 'CHECK' });
  } else {
    summary.push({ store, status: 'applied, verify-failed' });
  }
}

console.log('\n================= SUMMARY =================');
console.table(summary);
