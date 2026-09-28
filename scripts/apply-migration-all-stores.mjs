// Generic: apply a .sql migration file to ALL stores in env-backups/ via the
// Supabase Management API, then optionally verify a column exists on store_settings.
// Usage: node scripts/apply-migration-all-stores.mjs <path-to-sql> [verifyColumn]
import fs from 'fs';
import path from 'path';

const sqlPath = process.argv[2];
const verifyColumn = process.argv[3];
if (!sqlPath) { console.error('Usage: node scripts/apply-migration-all-stores.mjs <sql> [verifyColumn]'); process.exit(1); }
const migrationSql = fs.readFileSync(path.resolve(process.cwd(), sqlPath), 'utf8');

const envBackupsDir = path.resolve(process.cwd(), 'env-backups');
const envFiles = fs.readdirSync(envBackupsDir).filter(f => f.endsWith('.env.local'));

async function query(ref, token, sql) {
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
    const ref = (content.match(/SUPABASE_PROJECT_REF=([^\r\n]+)/) || [])[1]?.trim();
    let token = (content.match(/SUPABASE_MGMT_TOKEN=([^\r\n]+)/) || [])[1]?.trim();
    if ((!token || token.includes('placeholder')) && file.includes('zaynahs')) {
      const localEnv = path.resolve(process.cwd(), '.env.local');
      if (fs.existsSync(localEnv)) token = (fs.readFileSync(localEnv, 'utf8').match(/SUPABASE_MGMT_TOKEN=([^\r\n]+)/) || [])[1]?.trim();
    }
    const name = file.replace('.env.local', '');
    if (!ref || !token) { results.push({ name, status: 'SKIPPED (no ref/token)' }); continue; }

    const mig = await query(ref, token, migrationSql);
    if (!mig.ok) { results.push({ name, ref, status: `HTTP ${mig.status}`, err: JSON.stringify(mig.data).slice(0, 120) }); continue; }
    if (verifyColumn) {
      const ver = await query(ref, token, `SELECT column_name FROM information_schema.columns WHERE table_name='store_settings' AND column_name='${verifyColumn}';`);
      const found = Array.isArray(ver.data) && ver.data.some(r => r.column_name === verifyColumn);
      results.push({ name, ref, status: found ? 'SUCCESS ✅' : 'APPLIED (verify?) ⚠️' });
    } else {
      results.push({ name, ref, status: 'APPLIED ✅' });
    }
  }
  console.table(results);
}
main();
