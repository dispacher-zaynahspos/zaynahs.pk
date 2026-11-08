#!/usr/bin/env node
/**
 * switch-db-images-to-r2.mjs — update Supabase DB image URLs to Cloudflare R2 custom domain.
 *
 * Usage:
 *   node scripts/switch-db-images-to-r2.mjs --env=.env.local --dry-run
 *   node scripts/switch-db-images-to-r2.mjs --env=.env.local --apply
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const isApply = args.includes('--apply');
const envArg = args.find((a) => a.startsWith('--env='));
const envFile = envArg ? envArg.split('=')[1] : '.env.local';

function loadEnv(file) {
  const env = {};
  for (const line of readFileSync(resolve(process.cwd(), file), 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[t.slice(0, eq).trim()] = v;
  }
  return env;
}

const env = loadEnv(envFile);
const supabaseUrl = (env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
const projectRef = env.SUPABASE_PROJECT_REF || (supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || '');
const mgmtToken = env.SUPABASE_MGMT_TOKEN;
const r2PublicBase = (env.R2_PUBLIC_BASE || '').replace(/\/+$/, '');

if (!supabaseUrl || !projectRef || !mgmtToken || !r2PublicBase) {
  console.error('❌ Missing required envs: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_PROJECT_REF, SUPABASE_MGMT_TOKEN, R2_PUBLIC_BASE');
  process.exit(1);
}

const supabaseStoragePrefix = `${supabaseUrl}/storage/v1/object/public/`;
console.log(`\n🔄 Switching image URLs in Database:`);
console.log(`   From: ${supabaseStoragePrefix}`);
console.log(`   To  : ${r2PublicBase}/`);

async function runQuery(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${mgmtToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Query failed (${res.status}): ${errText}`);
  }
  return res.json();
}

async function main() {
  const checkSql = `
    SELECT 
      (SELECT count(*) FROM product_images WHERE url LIKE '${supabaseStoragePrefix}%') AS product_images_count,
      (SELECT count(*) FROM product_variants WHERE image_url LIKE '${supabaseStoragePrefix}%') AS variants_count,
      (SELECT count(*) FROM categories WHERE image_url LIKE '${supabaseStoragePrefix}%') AS categories_count,
      (SELECT count(*) FROM store_settings WHERE logo_url LIKE '${supabaseStoragePrefix}%' OR favicon_url LIKE '${supabaseStoragePrefix}%' OR banner_url LIKE '${supabaseStoragePrefix}%') AS settings_count,
      (SELECT count(*) FROM homepage_sections WHERE content_data::text LIKE '%${supabaseStoragePrefix}%') AS sections_count,
      (SELECT count(*) FROM verticals WHERE tile_image_url LIKE '${supabaseStoragePrefix}%' OR banner_url LIKE '${supabaseStoragePrefix}%') AS verticals_count,
      (SELECT count(*) FROM collections WHERE image_url LIKE '${supabaseStoragePrefix}%') AS collections_count,
      (SELECT count(*) FROM social_proof WHERE image_url LIKE '${supabaseStoragePrefix}%') AS social_proof_count,
      (SELECT count(*) FROM reviews WHERE screenshot_url LIKE '${supabaseStoragePrefix}%') AS reviews_count,
      (SELECT count(*) FROM media_library WHERE file_url LIKE '${supabaseStoragePrefix}%') AS media_count;
  `;

  const counts = await runQuery(checkSql);
  const row = counts[0] || {};
  console.log(`\n📊 Found URLs pointing to Supabase Storage:`);
  console.log(`   product_images   : ${row.product_images_count}`);
  console.log(`   product_variants : ${row.variants_count}`);
  console.log(`   categories       : ${row.categories_count}`);
  console.log(`   store_settings   : ${row.settings_count}`);
  console.log(`   homepage_sections: ${row.sections_count}`);
  console.log(`   verticals        : ${row.verticals_count}`);
  console.log(`   collections      : ${row.collections_count}`);
  console.log(`   social_proof     : ${row.social_proof_count}`);
  console.log(`   reviews          : ${row.reviews_count}`);
  console.log(`   media_library    : ${row.media_count}`);

  if (!isApply) {
    console.log(`\n⚠️  DRY RUN complete. Run with --apply to execute the database updates.`);
    return;
  }

  const updateSql = `
    BEGIN;
    UPDATE product_images 
    SET url = replace(url, '${supabaseStoragePrefix}', '${r2PublicBase}/')
    WHERE url LIKE '${supabaseStoragePrefix}%';

    UPDATE product_variants 
    SET image_url = replace(image_url, '${supabaseStoragePrefix}', '${r2PublicBase}/')
    WHERE image_url LIKE '${supabaseStoragePrefix}%';

    UPDATE categories 
    SET image_url = replace(image_url, '${supabaseStoragePrefix}', '${r2PublicBase}/')
    WHERE image_url LIKE '${supabaseStoragePrefix}%';

    UPDATE store_settings 
    SET logo_url = replace(logo_url, '${supabaseStoragePrefix}', '${r2PublicBase}/'),
        favicon_url = replace(favicon_url, '${supabaseStoragePrefix}', '${r2PublicBase}/'),
        banner_url = replace(banner_url, '${supabaseStoragePrefix}', '${r2PublicBase}/')
    WHERE logo_url LIKE '${supabaseStoragePrefix}%' 
       OR favicon_url LIKE '${supabaseStoragePrefix}%' 
       OR banner_url LIKE '${supabaseStoragePrefix}%';

    UPDATE homepage_sections
    SET content_data = replace(content_data::text, '${supabaseStoragePrefix}', '${r2PublicBase}/')::jsonb
    WHERE content_data::text LIKE '%${supabaseStoragePrefix}%';

    UPDATE verticals
    SET tile_image_url = replace(tile_image_url, '${supabaseStoragePrefix}', '${r2PublicBase}/'),
        banner_url = replace(banner_url, '${supabaseStoragePrefix}', '${r2PublicBase}/')
    WHERE tile_image_url LIKE '${supabaseStoragePrefix}%' OR banner_url LIKE '${supabaseStoragePrefix}%';

    UPDATE collections
    SET image_url = replace(image_url, '${supabaseStoragePrefix}', '${r2PublicBase}/')
    WHERE image_url LIKE '${supabaseStoragePrefix}%';

    UPDATE social_proof
    SET image_url = replace(image_url, '${supabaseStoragePrefix}', '${r2PublicBase}/')
    WHERE image_url LIKE '${supabaseStoragePrefix}%';

    UPDATE reviews
    SET screenshot_url = replace(screenshot_url, '${supabaseStoragePrefix}', '${r2PublicBase}/')
    WHERE screenshot_url LIKE '${supabaseStoragePrefix}%';

    UPDATE media_library 
    SET file_url = replace(file_url, '${supabaseStoragePrefix}', '${r2PublicBase}/')
    WHERE file_url LIKE '${supabaseStoragePrefix}%';

    UPDATE abandoned_carts
    SET items = replace(items::text, '${supabaseStoragePrefix}', '${r2PublicBase}/')::jsonb
    WHERE items::text LIKE '%${supabaseStoragePrefix}%';

    UPDATE orders
    SET items = replace(items::text, '${supabaseStoragePrefix}', '${r2PublicBase}/')::jsonb
    WHERE items::text LIKE '%${supabaseStoragePrefix}%';
    COMMIT;
  `;

  console.log(`\n🚀 Executing atomic database update across all tables...`);
  await runQuery(updateSql);

  const verifyCounts = await runQuery(checkSql);
  const vRow = verifyCounts[0] || {};
  console.log(`\n✅ Database update complete! Remaining Supabase URLs:`);
  console.log(`   product_images   : ${vRow.product_images_count}`);
  console.log(`   product_variants : ${vRow.variants_count}`);
  console.log(`   categories       : ${vRow.categories_count}`);
  console.log(`   store_settings   : ${vRow.settings_count}`);
  console.log(`   homepage_sections: ${vRow.sections_count}`);
  console.log(`   verticals        : ${vRow.verticals_count}`);
  console.log(`   collections      : ${vRow.collections_count}`);
  console.log(`   social_proof     : ${vRow.social_proof_count}`);
  console.log(`   reviews          : ${vRow.reviews_count}`);
  console.log(`   media_library    : ${vRow.media_count}`);
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
