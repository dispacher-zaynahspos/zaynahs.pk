import fs from 'fs';
import path from 'path';

/**
 * Applies the header announcement-bar social-icons migration to EVERY store in
 * env-backups/*.env.local via the Supabase Management API, then verifies.
 * Idempotent (ADD COLUMN IF NOT EXISTS).
 */
const MIGRATION_FILE = 'supabase/migrations/20261011160000_header_announcement_social_icons.sql';
const NEW_COLUMNS = ['header_social_enabled', 'header_social_show_mobile'];

const envBackupsDir = path.resolve(process.cwd(), 'env-backups');
const envFiles = fs.readdirSync(envBackupsDir).filter((f) => f.endsWith('.env.local'));
const migrationSql = fs.readFileSync(path.resolve(process.cwd(), MIGRATION_FILE), 'utf8');
const verifySql = `
SELECT column_name FROM information_schema.columns
WHERE table_name = 'store_settings'
AND column_name IN (${NEW_COLUMNS.map((c) => `'${c}'`).join(', ')});
`;

async function query(ref, token, sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ query: sql }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function main() {
  console.log(`\n=== Applying ${MIGRATION_FILE} to ${envFiles.length} stores ===\n`);
  const results = [];
  for (const file of envFiles) {
    const content = fs.readFileSync(path.join(envBackupsDir, file), 'utf8');
    const ref = content.match(/SUPABASE_PROJECT_REF=([^\r\n]+)/)?.[1]?.trim();
    let token = content.match(/SUPABASE_MGMT_TOKEN=([^\r\n]+)/)?.[1]?.trim();
    const name = file.replace('.env.local', '');
    if ((!token || token.includes('placeholder')) && file.includes('zaynahs')) {
      const localEnv = path.resolve(process.cwd(), '.env.local');
      if (fs.existsSync(localEnv)) token = fs.readFileSync(localEnv, 'utf8').match(/SUPABASE_MGMT_TOKEN=([^\r\n]+)/)?.[1]?.trim() || token;
    }
    if (!ref || !token) { console.error(`[SKIP] ${name}`); results.push({ project: name, status: 'SKIPPED' }); continue; }
    console.log(`▶ ${name} (${ref})`);
    try {
      const applied = await query(ref, token, migrationSql);
      if (!applied.ok) { console.error(`  ❌ HTTP ${applied.status}`, applied.data); results.push({ project: name, ref, status: `HTTP ${applied.status}` }); continue; }
      console.log(`  ✅ migration applied (HTTP ${applied.status})`);
      const verify = await query(ref, token, verifySql);
      const found = Array.isArray(verify.data) ? verify.data.map((r) => r.column_name) : [];
      const missing = NEW_COLUMNS.filter((c) => !found.includes(c));
      if (missing.length === 0) { console.log(`  🎉 verified all ${NEW_COLUMNS.length} columns`); results.push({ project: name, ref, status: 'SUCCESS', verified: found.length }); }
      else { console.warn(`  ⚠️ missing: ${missing.join(', ')}`); results.push({ project: name, ref, status: 'PARTIAL', missing: missing.join(',') }); }
    } catch (err) { console.error(`  ❌ ${err.message}`); results.push({ project: name, ref, status: 'FAILED', error: err.message }); }
  }
  console.log(`\n=== SUMMARY ===`);
  console.table(results);
}
main();
