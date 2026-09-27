/**
 * apply-schema-sync.mjs — brings every store in env-backups/ up to the current
 * SUPER_MASTER_SCHEMA state (snake_case). Applies the two additive/idempotent
 * migrations and verifies. Safe + non-destructive. READ the migration files for details.
 *
 *   1) 20260926120000  — orders.customer_email + shop_products_per_page[_desktop/tablet/mobile]
 *   2) 20260926130000  — orders/abandoned_carts JSONB camelCase → snake_case backfill
 *
 * Usage: node scripts/apply-schema-sync.mjs
 */

import { readFileSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const backupsDir = resolve(root, 'env-backups');

const migrations = [
  'supabase/migrations/20260926120000_add_missing_order_email_and_shop_perpage.sql',
  'supabase/migrations/20260926130000_backfill_order_jsonb_snakecase.sql',
].map(p => ({ name: p.split('/').pop(), sql: readFileSync(resolve(root, p), 'utf-8') }));

const verifySql = `
  SELECT
    (SELECT COUNT(*) FROM information_schema.columns
       WHERE table_name='orders' AND column_name='customer_email') AS has_order_email,
    (SELECT COUNT(*) FROM information_schema.columns
       WHERE table_name='store_settings' AND column_name LIKE 'shop_products_per_page%') AS perpage_cols,
    (SELECT COUNT(*) FROM orders
       WHERE items::text ~ '(selectedVariant|selectedModifiers|unitPrice|discountAmount|addedLater)') AS orders_camel_left;
`;

function parseEnv(content) {
  const vars = {};
  for (const line of content.split('\n')) {
    const t = line.trim();
    if (t && !t.startsWith('#')) { const i = t.indexOf('='); if (i > 0) vars[t.slice(0, i).trim()] = t.slice(i + 1).trim(); }
  }
  return vars;
}
async function query(ref, token, sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ query: sql }),
  });
  return { ok: res.ok, status: res.status, text: await res.text() };
}

const files = readdirSync(backupsDir).filter(f => f.endsWith('.env.local'));
const summary = [];

for (const file of files) {
  const store = file.replace('.env.local', '');
  const env = parseEnv(readFileSync(resolve(backupsDir, file), 'utf-8'));
  const { SUPABASE_PROJECT_REF: ref, SUPABASE_MGMT_TOKEN: token } = env;
  console.log(`\n▶ [${store}] ref=${ref}`);
  if (!ref || !token) { console.log('  SKIP — missing ref/token'); summary.push({ store, status: 'SKIP' }); continue; }

  let failed = false;
  for (const m of migrations) {
    const r = await query(ref, token, m.sql);
    console.log(`  ${r.ok ? '✅' : '❌'} ${m.name}${r.ok ? '' : ' — ' + r.text.slice(0, 160)}`);
    if (!r.ok) failed = true;
  }
  const v = await query(ref, token, verifySql);
  if (v.ok) {
    const [row] = JSON.parse(v.text);
    console.log(`     verify: order_email=${row.has_order_email} perpage_cols=${row.perpage_cols} orders_camel_left=${row.orders_camel_left}`);
    summary.push({ store, status: failed ? 'PARTIAL' : 'SYNCED', order_email: row.has_order_email, perpage: row.perpage_cols, camel_left: row.orders_camel_left });
  } else {
    summary.push({ store, status: failed ? 'PARTIAL' : 'applied, verify-failed' });
  }
}

console.log('\n================= SCHEMA SYNC SUMMARY =================');
console.table(summary);
