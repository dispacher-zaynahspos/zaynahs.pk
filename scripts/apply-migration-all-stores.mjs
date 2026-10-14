import fs from 'fs';
import path from 'path';

/**
 * Fast & Parallel Migration Runner Across All Stores (RULE CRED-ENVBACKUP)
 * Applies a .sql migration file or raw SQL query to ALL stores in env-backups/
 * via the Supabase Management API.
 *
 * Usage:
 *   node scripts/apply-migration-all-stores.mjs <path-to-sql-file> [verifyColumn]
 *   node scripts/apply-migration-all-stores.mjs --sql "SELECT 1"
 *   node scripts/apply-migration-all-stores.mjs <file> --store=lobo
 */

const envBackupsDir = path.resolve(process.cwd(), 'env-backups');
let envFiles = fs.readdirSync(envBackupsDir).filter(f => f.endsWith('.env.local'));

const specificStore = process.argv.find(a => a.startsWith('--store='))?.split('=')[1];
if (specificStore) {
  envFiles = envFiles.filter(f => f.replace('.env.local', '') === specificStore);
}

const sqlArgIndex = process.argv.indexOf('--sql');
let migrationSql = '';
let verifyColumn = '';

if (sqlArgIndex !== -1 && process.argv[sqlArgIndex + 1]) {
  migrationSql = process.argv[sqlArgIndex + 1];
} else if (process.argv[2] && !process.argv[2].startsWith('--')) {
  const sqlPath = path.resolve(process.cwd(), process.argv[2]);
  if (!fs.existsSync(sqlPath)) {
    console.error(`❌ Migration file not found: ${sqlPath}`);
    process.exit(1);
  }
  migrationSql = fs.readFileSync(sqlPath, 'utf8');
  verifyColumn = process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : '';
} else {
  console.error('Usage: node scripts/apply-migration-all-stores.mjs <sql-file> [verifyColumn] [--store=<name>]');
  console.error('   or: node scripts/apply-migration-all-stores.mjs --sql "<query>" [--store=<name>]');
  process.exit(1);
}

async function query(ref, token, sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ query: sql }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function runOnStore(file) {
  const content = fs.readFileSync(path.join(envBackupsDir, file), 'utf8');
  const ref = (content.match(/SUPABASE_PROJECT_REF=([^\r\n]+)/) || [])[1]?.trim();
  let token = (content.match(/SUPABASE_MGMT_TOKEN=([^\r\n]+)/) || [])[1]?.trim();

  // Fallback for zaynahs local token
  if ((!token || token.includes('placeholder')) && file.includes('zaynahs')) {
    const localEnv = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(localEnv)) {
      token = (fs.readFileSync(localEnv, 'utf8').match(/SUPABASE_MGMT_TOKEN=([^\r\n]+)/) || [])[1]?.trim();
    }
  }

  const name = file.replace('.env.local', '');
  if (!ref || !token) {
    return { Store: name, Ref: ref || 'N/A', Status: 'SKIPPED (no ref/token)' };
  }

  try {
    const mig = await query(ref, token, migrationSql);
    if (!mig.ok) {
      return {
        Store: name,
        Ref: ref,
        Status: `FAILED HTTP ${mig.status}`,
        Error: JSON.stringify(mig.data).slice(0, 80)
      };
    }

    if (verifyColumn) {
      const ver = await query(ref, token, `SELECT column_name FROM information_schema.columns WHERE table_name='store_settings' AND column_name='${verifyColumn}';`);
      const found = Array.isArray(ver.data) && ver.data.some(r => r.column_name === verifyColumn);
      return {
        Store: name,
        Ref: ref,
        Status: found ? 'APPLIED & VERIFIED ✅' : 'APPLIED (verify column not found) ⚠️'
      };
    }

    return { Store: name, Ref: ref, Status: 'APPLIED ✅' };
  } catch (err) {
    return { Store: name, Ref: ref, Status: `FAILED: ${err.message.slice(0, 50)}` };
  }
}

async function main() {
  console.log(`\n===============================================================`);
  console.log(`🚀 RUNNING MIGRATION ACROSS ${envFiles.length} STORE(S) (PARALLEL)`);
  console.log(`===============================================================\n`);

  const results = await Promise.all(envFiles.map(runOnStore));
  console.table(results);
}

main().catch(console.error);
