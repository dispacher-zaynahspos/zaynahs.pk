import fs from 'fs';
import path from 'path';

const envBackupsDir = path.resolve(process.cwd(), 'env-backups');
const envFiles = fs.readdirSync(envBackupsDir).filter(f => f.endsWith('.env.local'));

const requiredColumns = [
  'enable_product_quick_whatsapp',
  'recently_viewed_columns_desktop',
  'recently_viewed_columns_tablet',
  'recently_viewed_columns_mobile',
  'related_products_enabled',
  'related_products_title',
  'related_products_subtitle',
  'related_products_limit',
  'related_columns_desktop',
  'related_columns_tablet',
  'related_columns_mobile',
  'related_grid_gap',
  'recently_viewed_grid_gap',
  'shop_columns_desktop',
  'shop_columns_tablet',
  'shop_columns_mobile',
  'recently_viewed_title',
  'recently_viewed_subtitle',
  'shop_category_chips_enabled',
  'shop_infinite_scroll',
  'add_to_cart_animation',
  'enable_fly_to_cart',
  'footer_social_icon_color',
  'footer_social_icon_bg',
  'footer_social_hover_color',
  'footer_social_hover_bg',
  'footer_heading_font',
  'footer_body_font',
  'footer_heading_size',
  'footer_body_size',
  'footer_heading_weight',
  'footer_body_weight',
  'footer_align',
  'footer_padding',
  'footer_bg',
  'footer_text_color',
  'footer_border_color',
  'footer_heading_color',
  'footer_link_color',
  'footer_copyright_color'
];

const migrationSql = `
ALTER TABLE store_settings 
  ADD COLUMN IF NOT EXISTS enable_product_quick_whatsapp BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS recently_viewed_columns_desktop INTEGER DEFAULT 4,
  ADD COLUMN IF NOT EXISTS recently_viewed_columns_tablet INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS recently_viewed_columns_mobile INTEGER DEFAULT 2,
  ADD COLUMN IF NOT EXISTS related_products_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS related_products_title TEXT DEFAULT 'Related Products',
  ADD COLUMN IF NOT EXISTS related_products_subtitle TEXT DEFAULT 'You might also like these handpicked recommendations',
  ADD COLUMN IF NOT EXISTS related_products_limit INTEGER DEFAULT 4,
  ADD COLUMN IF NOT EXISTS related_columns_desktop INTEGER DEFAULT 4,
  ADD COLUMN IF NOT EXISTS related_columns_tablet INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS related_columns_mobile INTEGER DEFAULT 2,
  ADD COLUMN IF NOT EXISTS related_grid_gap TEXT DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS recently_viewed_grid_gap TEXT DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS shop_columns_desktop INTEGER DEFAULT 4,
  ADD COLUMN IF NOT EXISTS shop_columns_tablet INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS shop_columns_mobile INTEGER DEFAULT 2,
  ADD COLUMN IF NOT EXISTS recently_viewed_title TEXT DEFAULT 'Recently Viewed',
  ADD COLUMN IF NOT EXISTS recently_viewed_subtitle TEXT DEFAULT 'Products you have recently browsed',
  ADD COLUMN IF NOT EXISTS shop_category_chips_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS shop_infinite_scroll BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS add_to_cart_animation TEXT DEFAULT 'default',
  ADD COLUMN IF NOT EXISTS enable_fly_to_cart BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS footer_social_icon_color TEXT,
  ADD COLUMN IF NOT EXISTS footer_social_icon_bg TEXT,
  ADD COLUMN IF NOT EXISTS footer_social_hover_color TEXT,
  ADD COLUMN IF NOT EXISTS footer_social_hover_bg TEXT,
  ADD COLUMN IF NOT EXISTS footer_heading_font TEXT,
  ADD COLUMN IF NOT EXISTS footer_body_font TEXT,
  ADD COLUMN IF NOT EXISTS footer_heading_size TEXT,
  ADD COLUMN IF NOT EXISTS footer_body_size TEXT,
  ADD COLUMN IF NOT EXISTS footer_heading_weight TEXT,
  ADD COLUMN IF NOT EXISTS footer_body_weight TEXT,
  ADD COLUMN IF NOT EXISTS footer_align TEXT,
  ADD COLUMN IF NOT EXISTS footer_padding TEXT,
  ADD COLUMN IF NOT EXISTS footer_bg TEXT,
  ADD COLUMN IF NOT EXISTS footer_text_color TEXT,
  ADD COLUMN IF NOT EXISTS footer_border_color TEXT,
  ADD COLUMN IF NOT EXISTS footer_heading_color TEXT,
  ADD COLUMN IF NOT EXISTS footer_link_color TEXT,
  ADD COLUMN IF NOT EXISTS footer_copyright_color TEXT;
`;

const verifySql = `
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'store_settings' 
AND column_name IN (${requiredColumns.map(c => `'${c}'`).join(', ')});
`;

async function main() {
  console.log(`\n===============================================================`);
  console.log(`🚀 RUNNING MIGRATIONS ON ALL PROJECTS IN env-backups/ (${envFiles.length} files)`);
  console.log(`===============================================================\n`);

  const results = [];

  for (const file of envFiles) {
    const filePath = path.join(envBackupsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    const refMatch = content.match(/SUPABASE_PROJECT_REF=([^\r\n]+)/);
    const tokenMatch = content.match(/SUPABASE_MGMT_TOKEN=([^\r\n]+)/);

    const ref = refMatch ? refMatch[1].trim() : null;
    let token = tokenMatch ? tokenMatch[1].trim() : null;

    // Fallback if token placeholder or missing in file
    if ((!token || token.includes('placeholder')) && file.includes('zaynahs')) {
      const localEnv = path.resolve(process.cwd(), '.env.local');
      if (fs.existsSync(localEnv)) {
        const localMatch = fs.readFileSync(localEnv, 'utf8').match(/SUPABASE_MGMT_TOKEN=([^\r\n]+)/);
        if (localMatch) token = localMatch[1].trim();
      }
    }

    const projectName = file.replace('.env.local', '');

    if (!ref || !token) {
      results.push({
        project: projectName,
        ref: ref || 'UNKNOWN',
        status: 'SKIPPED',
        error: `Missing ref (${ref}) or token (${token ? 'PRESENT' : 'MISSING'})`
      });
      continue;
    }

    console.log(`\n▶ [${projectName.toUpperCase()}] Project Ref: ${ref}`);

    // 1. Run Migration
    try {
      const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query: migrationSql })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error(`  ❌ Migration Error (HTTP ${res.status}):`, data);
        results.push({
          project: projectName,
          ref,
          status: `HTTP ${res.status}`,
          error: data.message || JSON.stringify(data)
        });
        continue;
      }

      console.log(`  ✅ Migration SQL applied successfully (HTTP ${res.status}).`);

      // 2. Verify Columns
      const verifyRes = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query: verifySql })
      });

      const verifyData = await verifyRes.json().catch(() => ([]));
      const foundColumns = Array.isArray(verifyData) ? verifyData.map(r => r.column_name) : [];
      const missingColumns = requiredColumns.filter(c => !foundColumns.includes(c));

      if (missingColumns.length === 0) {
        console.log(`  🎉 Verification PASS: All ${requiredColumns.length} columns confirmed present in store_settings.`);
        results.push({
          project: projectName,
          ref,
          status: 'SUCCESS',
          verifiedCount: foundColumns.length,
          totalCount: requiredColumns.length
        });
      } else {
        console.warn(`  ⚠️ Verification WARNING: Missing columns: ${missingColumns.join(', ')}`);
        results.push({
          project: projectName,
          ref,
          status: 'PARTIAL',
          missing: missingColumns
        });
      }

    } catch (err) {
      console.error(`  ❌ Network/Execution Error:`, err.message);
      results.push({
        project: projectName,
        ref,
        status: 'FAILED',
        error: err.message
      });
    }
  }

  console.log(`\n===============================================================`);
  console.log(`📊 FINAL SUMMARY ACROSS ALL PROJECTS`);
  console.log(`===============================================================`);
  console.table(results);
}

main();
