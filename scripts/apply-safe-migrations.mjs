import fs from 'fs';
import path from 'path';

const envBackupsDir = path.resolve(process.cwd(), 'env-backups');
const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations');

// SAFE, additive-only migrations to apply to all live stores.
// (The REVOKE/RLS-secret migration is intentionally EXCLUDED — it needs the paired
//  fetchSettings change + per-store smoke test and could break storefront reads.)
const SAFE_MIGRATIONS = [
  '20260926160000_REVIEW_perf_indexes.sql',
  '20260926170000_add_contact_messages.sql',
];

const envFiles = fs.readdirSync(envBackupsDir).filter(f => f.endsWith('.env.local'));

function readVar(content, key) {
  const m = content.match(new RegExp(`${key}=([^\\r\\n]+)`));
  return m ? m[1].trim() : null;
}

async function runQuery(ref, token, sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ query: sql }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function main() {
  const results = [];
  for (const file of envFiles) {
    const content = fs.readFileSync(path.join(envBackupsDir, file), 'utf8');
    const ref = readVar(content, 'SUPABASE_PROJECT_REF');
    const token = readVar(content, 'SUPABASE_MGMT_TOKEN');
    const project = file.replace('.env.local', '');
    if (!ref || !token || token.includes('placeholder')) {
      results.push({ project, status: 'SKIPPED (no ref/token)' });
      continue;
    }
    for (const mig of SAFE_MIGRATIONS) {
      const sql = fs.readFileSync(path.join(migrationsDir, mig), 'utf8');
      try {
        const r = await runQuery(ref, token, sql);
        results.push({
          project, migration: mig,
          status: r.ok ? 'OK' : `HTTP ${r.status}`,
          error: r.ok ? '' : (r.data.message || JSON.stringify(r.data)).slice(0, 120),
        });
        console.log(`[${project}] ${mig} → ${r.ok ? 'OK' : 'ERR ' + r.status}`);
      } catch (e) {
        results.push({ project, migration: mig, status: 'FAILED', error: e.message });
      }
    }
  }
  console.log('\n=== SUMMARY ===');
  console.table(results);
}
main();
