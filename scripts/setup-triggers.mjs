/**
 * setup-triggers.mjs
 * ──────────────────────────────────────────────────────────────
 * Creates / fixes all 21 Supabase revalidation triggers for a
 * given project.  Run once per Supabase project (new clone OR
 * to fix broken triggers on an existing project).
 *
 * USAGE
 *   node scripts/setup-triggers.mjs
 *
 * Reads from .env.local:
 *   SUPABASE_PROJECT_REF   e.g. unfdpfmjqljbjydgsccr
 *   SUPABASE_MGMT_TOKEN    sbp_xxx
 *   NEXT_PUBLIC_SITE_URL   https://www.zaynahs.pk
 *   REVALIDATE_SECRET      your-secret
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnv() {
  try {
    const envFile = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
    const env = {};
    for (const line of envFile.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx < 0) continue;
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      env[key] = val;
    }
    return env;
  } catch { return {}; }
}

const env = loadEnv();
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || env.SUPABASE_PROJECT_REF;
const MGMT_TOKEN  = process.env.SUPABASE_MGMT_TOKEN  || env.SUPABASE_MGMT_TOKEN;
const SITE_URL    = (process.env.NEXT_PUBLIC_SITE_URL || env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
const SECRET      = process.env.REVALIDATE_SECRET     || env.REVALIDATE_SECRET;

if (!PROJECT_REF || !MGMT_TOKEN || !SITE_URL || !SECRET) {
  console.error('Missing: SUPABASE_PROJECT_REF, SUPABASE_MGMT_TOKEN, NEXT_PUBLIC_SITE_URL, REVALIDATE_SECRET');
  process.exit(1);
}

const WEBHOOK_URL = `${SITE_URL}/api/revalidate`;
console.log(`\n🔧 setup-triggers.mjs`);
console.log(`   Project : ${PROJECT_REF}`);
console.log(`   Webhook : ${WEBHOOK_URL}`);
console.log(`   Secret  : ${SECRET.slice(0, 6)}...`);

// [triggerName, tableName] — names match existing DB (underscore style)
const TRIGGERS = [
  ['revalidate-products',              'products'],
  ['revalidate-categories',            'categories'],
  ['revalidate-reviews',               'reviews'],
  ['revalidate-homepage',              'homepage_sections'],
  ['revalidate-settings',              'store_settings'],
  ['revalidate-product_variants',      'product_variants'],
  ['revalidate-product_images',        'product_images'],
  ['revalidate-product_modifiers',     'product_modifiers'],
  ['revalidate-badges',                'badges'],
  ['revalidate-social_proof',          'social_proof'],
  ['revalidate-social_proof_products', 'social_proof_products'],
  ['revalidate-size_guides',           'size_guides'],
  ['revalidate-coupons',               'coupons'],
  ['revalidate-seo_meta',              'seo_meta'],
  ['revalidate-ai_settings',           'ai_settings'],
  ['revalidate-variant_presets',       'variant_presets'],
  ['revalidate-meta_category_mapping', 'meta_category_mapping'],
  ['revalidate-shipping_methods',      'shipping_methods'],
  ['revalidate-payment_methods',       'payment_methods'],
  ['revalidate-collections',           'collections'],
  ['revalidate-collection_categories', 'collection_categories'],
];

async function runSQL(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${MGMT_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

function buildSQL() {
  const headers = JSON.stringify({ 'Content-Type': 'application/json', 'x-revalidate-secret': SECRET });
  return TRIGGERS.map(([name, table]) => {
    const body = JSON.stringify({ type: 'CHANGE', table });
    return [
      `DROP TRIGGER IF EXISTS "${name}" ON public.${table};`,
      `CREATE TRIGGER "${name}"`,
      `  AFTER INSERT OR UPDATE OR DELETE ON public.${table}`,
      `  FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request(`,
      `    '${WEBHOOK_URL}', 'POST',`,
      `    '${headers}',`,
      `    '${body}', '5000');`,
    ].join('\n');
  }).join('\n\n');
}

async function verify() {
  const rows = await runSQL(`
    SELECT trigger_name, action_statement
    FROM information_schema.triggers
    WHERE trigger_name LIKE 'revalidate%'
    GROUP BY trigger_name, action_statement ORDER BY trigger_name;
  `);
  let good = 0, bad = 0;
  for (const row of rows) {
    const parts = [...row.action_statement.matchAll(/'(\{[^']*\})'/g)].map(m => m[1]);
    const body = parts[1] || '{}';
    let parsed = {}; try { parsed = JSON.parse(body); } catch {}
    if (parsed.type && parsed.table) { good++; }
    else { console.warn(`  ❌ ${row.trigger_name}: body=${body.slice(0, 60)}`); bad++; }
  }
  console.log(`\n  Total: ${rows.length} | ✅ Good: ${good} | ❌ Bad: ${bad}`);
  return bad === 0;
}

(async () => {
  try {
    console.log(`\nCreating/fixing ${TRIGGERS.length} triggers...`);
    await runSQL(buildSQL());
    console.log('SQL executed — verifying...');
    const ok = await verify();
    if (ok) console.log('\n🎉 All triggers correct!\n');
    else { console.error('\n❌ Some triggers still wrong\n'); process.exit(1); }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
