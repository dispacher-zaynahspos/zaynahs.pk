/**
 * verify-rls-status.mjs  (READ-ONLY — safe, makes no changes)
 *
 * Reports Row-Level-Security status + policies for the security-sensitive tables
 * across every store in env-backups/. Run this BEFORE and AFTER applying the S1
 * migration to confirm the change did exactly what was intended and nothing broke.
 *
 * Usage: node scripts/verify-rls-status.mjs
 *
 * Reads SUPABASE_PROJECT_REF + SUPABASE_MGMT_TOKEN from each env-backups/<store>.env.local.
 * Never prints tokens/secrets — only table names, rls flags and policy names.
 */

import { readFileSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const backupsDir = resolve(__dirname, '..', 'env-backups');

const TABLES = [
  'homepage_sections', 'whatsapp_subscribers', 'email_templates', 'schema_version', // S1
  'store_settings', 'customers', 'orders', // S2
];

const QUERY = `
  SELECT c.relname AS table_name,
         c.relrowsecurity AS rls_enabled,
         COALESCE(json_agg(json_build_object('policy', p.polname, 'cmd', p.polcmd)
                  ) FILTER (WHERE p.polname IS NOT NULL), '[]') AS policies
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  LEFT JOIN pg_policy p ON p.polrelid = c.oid
  WHERE n.nspname = 'public'
    AND c.relname IN (${TABLES.map(t => `'${t}'`).join(',')})
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

const files = readdirSync(backupsDir).filter(f => f.endsWith('.env.local'));
if (files.length === 0) {
  console.error('No <store>.env.local files found in env-backups/');
  process.exit(1);
}

for (const file of files) {
  const store = file.replace('.env.local', '');
  const env = parseEnv(readFileSync(resolve(backupsDir, file), 'utf-8'));
  const ref = env.SUPABASE_PROJECT_REF;
  const token = env.SUPABASE_MGMT_TOKEN;

  console.log(`\n================= ${store} =================`);
  if (!ref || !token) {
    console.log('  SKIP — SUPABASE_PROJECT_REF / SUPABASE_MGMT_TOKEN missing in env file');
    continue;
  }

  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ query: QUERY }),
    });
    const text = await res.text();
    if (!res.ok) {
      console.log(`  ERROR ${res.status}: ${text.slice(0, 200)}`);
      continue;
    }
    const rows = JSON.parse(text);
    for (const r of rows) {
      const pols = Array.isArray(r.policies) ? r.policies : JSON.parse(r.policies || '[]');
      const flag = r.rls_enabled ? 'RLS ✓' : 'RLS ✗ (OPEN)';
      const polList = pols.map(p => `${p.policy}[${p.cmd}]`).join(', ') || '(no policies)';
      console.log(`  ${r.table_name.padEnd(22)} ${flag.padEnd(14)} ${polList}`);
    }
  } catch (err) {
    console.log(`  ERROR: ${err.message}`);
  }
}

console.log('\nDone. RLS ✗ (OPEN) = anyone with the anon key can read/write that table.');
