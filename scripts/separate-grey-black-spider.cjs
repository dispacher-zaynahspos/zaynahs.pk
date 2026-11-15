#!/usr/bin/env node
/**
 * Separate Grey/Black Spider Tracksuit into its own dedicated product:
 * "Boys Spider-Man Black Spider Graphic Off-White Sweatshirt & Heather Grey Fleece Sweatpants Tracksuit Set (4-12y)"
 * And keep Red Spider Tracksuit as:
 * "Boys Spider-Man Spiderweb Graphic Red Sweatshirt & Fleece Sweatpants Tracksuit Set (4-12y)" with 2 trouser swatches:
 * - White Trouser
 * - Grey Heather Trouser
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const { resolveConfig } = require('./store-list-product.cjs');

const envPath = path.resolve('env-backups/totvogue.env.local');
const config = resolveConfig({ envFile: envPath });

const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^[\"']|[\"']$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const SIZE_CHART_IMAGE = 'https://img.totvogue.pk/product-images/photo-2026-11-01-09-46-43-1793508433015.webp';
const SIZE_GUIDE_ID = '148d729f-ce6b-4169-b13e-476e3602d940';

const CATS = {
  shop: '00000000-0000-4000-8000-000000000099',
  winter: '1adc152a-63e3-45ba-b70c-09bf66e4d7a0',
  tracksuits: '637e5a74-1fbc-4401-97f5-175d3dda8875',
  boys: '57b8c355-0e38-4748-9c42-0c7c760dc759',
  boysCoord: 'adbd5753-20da-457e-a761-8b462cbcc7eb',
  boysWinter: '9cd5c9dd-b194-4d19-8147-9b6a303d3fb4'
};
const BOYS_TRACKSUIT_CATS = [CATS.shop, CATS.boys, CATS.boysCoord, CATS.tracksuits, CATS.boysWinter, CATS.winter];

async function run() {
  const redProdId = '6dcd608c-e7e9-4ea2-af35-cf8a38c737a0';
  const newProdId = crypto.randomUUID();

  console.log('1. Creating separate product for Grey/Black Spider Tracksuit...');
  const newProd = {
    id: newProdId,
    name: 'Boys Spider-Man Black Spider Graphic Off-White Sweatshirt & Heather Grey Fleece Sweatpants Tracksuit Set (4-12y)',
    slug: 'boys-spider-man-black-spider-graphic-off-white-sweatshirt-heather-grey-fleece-sweatpants-tracksuit-set-4-12y',
    description: 'Streetwear-inspired boys winter tracksuit featuring a bold black Spider-Man spider graphic on an off-white fleece crewneck sweatshirt, paired with premium heather grey straight-leg fleece sweatpants with elastic drawstring waistband.',
    short_description: 'Streetwear-inspired boys winter tracksuit featuring a bold black Spider-Man spider graphic on an off-white fleece sweatshirt with heather grey sweatpants.',
    price: 1799,
    compare_price: 2450,
    cost: 1079,
    category_id: CATS.boysCoord,
    stock: 500,
    has_variants: true,
    is_featured: true,
    is_service: false,
    enable_swatches: true,
    show_swatches_on_archive: true,
    tags: [
      'Boys Spider-Man Black Spider Graphic Off-White Sweatshirt & Heather Grey Fleece Sweatpants Tracksuit Set (4-12y)',
      'Boys Wear',
      'Winter Wear',
      'Kids Fashion'
    ],
    rating: 5,
    reviews_count: 0,
    sort_order: 1,
    badge_enabled: true,
    size_guide_id: SIZE_GUIDE_ID,
    frequently_bought_together_ids: [],
    flash_sale_enabled: false,
    inventory_threshold: 0,
    variation_order: ['color', 'size'],
    is_active: true
  };

  const { error: pErr } = await supabase.from('products').insert([newProd]);
  if (pErr) throw pErr;
  console.log('✓ New product created:', newProd.name);

  console.log('2. Moving Off-White / Grey Heather variants to new product...');
  const { data: variantsToMove } = await supabase
    .from('product_variants')
    .select('id, size')
    .eq('product_id', redProdId)
    .eq('color', 'Off-White Shirt + Grey Heather Trouser');

  for (const v of variantsToMove || []) {
    await supabase
      .from('product_variants')
      .update({
        product_id: newProdId,
        color: 'Heather Grey Trouser'
      })
      .eq('id', v.id);
  }
  console.log(`✓ Moved ${variantsToMove?.length} variants to new product.`);

  console.log('3. Moving Image 27 to new product...');
  await supabase
    .from('product_images')
    .update({
      product_id: newProdId,
      alt: newProd.name,
      sort_order: 0,
      is_primary: true
    })
    .eq('product_id', redProdId)
    .ilike('url', '%27-%');

  // Insert size chart for new product
  await supabase.from('product_images').insert([{
    id: crypto.randomUUID(),
    product_id: newProdId,
    url: SIZE_CHART_IMAGE,
    alt: 'Kids Clothing Size Guide Chart',
    sort_order: 1,
    is_primary: false,
    mime_type: 'image/webp'
  }]);
  console.log('✓ Image 27 and size chart set for new product.');

  console.log('4. Assigning categories to new product...');
  const catRows = BOYS_TRACKSUIT_CATS.map((cid, idx) => ({
    product_id: newProdId,
    category_id: cid,
    position: idx + 1
  }));
  await supabase.from('product_categories').insert(catRows);
  console.log('✓ Categories mapped.');

  console.log('5. Updating existing Red Spider Tracksuit...');
  await supabase
    .from('products')
    .update({
      name: 'Boys Spider-Man Spiderweb Graphic Red Sweatshirt & Fleece Sweatpants Tracksuit Set (4-12y)',
      slug: 'boys-spider-man-spiderweb-graphic-red-sweatshirt-fleece-sweatpants-tracksuit-set-4-12y',
      stock: 1000
    })
    .eq('id', redProdId);

  // Simplify color names on remaining variants
  await supabase
    .from('product_variants')
    .update({ color: 'White Trouser' })
    .eq('product_id', redProdId)
    .eq('color', 'Red Shirt + White Trouser');

  await supabase
    .from('product_variants')
    .update({ color: 'Grey Heather Trouser' })
    .eq('product_id', redProdId)
    .eq('color', 'Red Shirt + Grey Heather Trouser');

  // Update image sort order on Red Spider Tracksuit
  await supabase
    .from('product_images')
    .update({ sort_order: 2 })
    .eq('product_id', redProdId)
    .ilike('url', '%photo-2026-11-01%');

  console.log('✓ Updated Red Spider Tracksuit with clean swatches (White Trouser, Grey Heather Trouser).');
}

run().catch(err => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
