#!/usr/bin/env node
/**
 * List Special Edition 350 GSM Fleece Girls Trousers with Pack Discounts
 *
 * Title: Girls Special Edition 350 GSM Heavyweight Fleece Pintuck Flared Trousers (4-12y)
 * 8 Colors:
 *   1. Off-White Cream
 *   2. Jet Black
 *   3. Lime Green
 *   4. Bubblegum Pink
 *   5. Sage Olive Green
 *   6. Peach Blush Pink
 *   7. Vibrant Orange
 *   8. Bold Crimson Red
 *
 * Pack Discounts:
 *   - 3-Pack: 5% OFF -> Rs. 2,560 (Single: Rs. 899 x 3 = 2,697 - 5%)
 *   - 5-Pack: 8% OFF -> Rs. 4,135 (Single: Rs. 899 x 5 = 4,495 - 8%)
 *
 * Sizes: 4-5y, 5-6y, 7-8y, 9-10y, 11-12y
 * Stock: 100 per variant
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { resolveConfig } = require('./store-list-product.cjs');
const https = require('https');

// Load env
const envPath = path.resolve('env-backups/totvogue.env.local');
const config = resolveConfig({ envFile: envPath });

const { createClient } = require('@supabase/supabase-js');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const SIZE_CHART_IMAGE = 'https://img.totvogue.pk/product-images/photo-2026-11-01-09-46-43-1793508433015.webp';
const SIZE_GUIDE_ID = '148d729f-ce6b-4169-b13e-476e3602d940';
const SIZES = ['4-5y', '5-6y', '7-8y', '9-10y', '11-12y'];

const CATS = {
  shop: '00000000-0000-4000-8000-000000000099',
  winter: '1adc152a-63e3-45ba-b70c-09bf66e4d7a0',
  bottoms: '5ead6ca3-c989-4ecd-b7fe-d08ff9c6d5a9',
  girls: 'b15adda3-3e09-4647-bacc-433b22ded3e7',
  girlsWinter: 'cc52eb0e-1bc3-461a-92ce-2bdce8b28893'
};

const CATEGORY_IDS = [CATS.shop, CATS.girls, CATS.bottoms, CATS.girlsWinter, CATS.winter];

const COLORS = [
  {
    name: 'Off-White Cream',
    hex: '#F7F7F2',
    url: 'https://img.totvogue.pk/product-images/img_4728_2-1794615567477.webp'
  },
  {
    name: 'Jet Black',
    hex: '#1A1A1A',
    url: 'https://img.totvogue.pk/product-images/img_4727_2-1794615566416.webp'
  },
  {
    name: 'Lime Green',
    hex: '#84CC16',
    url: 'https://img.totvogue.pk/product-images/img_4726_2-1794615565145.webp'
  },
  {
    name: 'Bubblegum Pink',
    hex: '#EC4899',
    url: 'https://img.totvogue.pk/product-images/img_4721_2-1794615559621.webp'
  },
  {
    name: 'Sage Olive Green',
    hex: '#84937E',
    url: 'https://img.totvogue.pk/product-images/img_4722_2-1794615560611.webp'
  },
  {
    name: 'Peach Blush Pink',
    hex: '#F8B4A6',
    url: 'https://img.totvogue.pk/product-images/img_4723_2-1794615561780.webp'
  },
  {
    name: 'Vibrant Orange',
    hex: '#F97316',
    url: 'https://img.totvogue.pk/product-images/img_4725_2-1794615564097.webp'
  },
  {
    name: 'Bold Crimson Red',
    hex: '#EF4444',
    url: 'https://img.totvogue.pk/product-images/img_4724_2-1794615562844.webp'
  }
];

const PACK_OPTIONS = [
  {
    name: 'Pack of 3 (Custom Assorted - 5% OFF)',
    price: 2560,
    comparePrice: 4197,
    imageUrl: COLORS[0].url
  },
  {
    name: 'Pack of 5 (Custom Assorted - 8% OFF)',
    price: 4135,
    comparePrice: 6995,
    imageUrl: COLORS[0].url
  }
];

const TITLE = 'Girls Special Edition 350 GSM Heavyweight Fleece Pintuck Flared Trousers (4-12y)';
const SLUG = 'girls-special-edition-350-gsm-heavyweight-fleece-pintuck-flared-trousers-4-12y';
const BASE_PRICE = 899;
const BASE_COMPARE_PRICE = 1399;

const SHORT_DESC = 'Special Edition ultra-heavyweight 350 GSM fleece flared trousers for girls. Features a structured front pintuck seam, elastic waistband with contrast drawstring, and multi-pack savings (3-pack 5% off, 5-pack 8% off).';

const FULL_DESC = `<p>Elevate your girl's winter wardrobe with our <strong>Special Edition 350 GSM Heavyweight Fleece Pintuck Flared Trousers</strong>. Expertly tailored from high-density 350 GSM brushed cotton-rich fleece, these trousers deliver exceptional thermal insulation, plush softness, and long-lasting shape retention for colder days.</p>

<h3>Key Features:</h3>
<ul>
  <li><strong>Special Edition 350 GSM Fleece:</strong> Ultra-heavyweight fabric offering superior warmth, cozy brushed interior, and wind-blocking thickness.</li>
  <li><strong>Tailored Pintuck Front Seam:</strong> Signature vertical front center seam elongates the silhouette and gives a chic, polished aesthetic.</li>
  <li><strong>Flared / Wide-Leg Cut:</strong> Relaxed straight-to-flared bottom opening for modern trendy streetwear loungewear styling.</li>
  <li><strong>Elastic Waistband & Contrast Drawcord:</strong> Flexible ribbed waistband with an adjustable cream drawstring cord ensures a snug, custom fit.</li>
  <li><strong>Deep Functional Pockets:</strong> Seamless side pockets keep hands warm and hold everyday essentials.</li>
  <li><strong>Rich Color Palette:</strong> Available in 8 curated vibrant and aesthetic pastel colors designed to mix and match effortlessly with hoodies, crewneck sweatshirts, and winter tees.</li>
</ul>

<h3>Special Pack Value Discounts:</h3>
<ul>
  <li><strong>Single Piece:</strong> Rs. 899 (Regular Price: Rs. 1,399)</li>
  <li><strong>Pack of 3 (5% OFF):</strong> Rs. 2,560 (Save an extra 5% — select size and specify your preferred 3 colors in order notes or on WhatsApp)</li>
  <li><strong>Pack of 5 (8% OFF):</strong> Rs. 4,135 (Save an extra 8% — select size and specify your preferred 5 colors in order notes or on WhatsApp)</li>
</ul>

<h3>Care Instructions:</h3>
<p>Machine wash cold on gentle cycle inside out. Do not bleach. Tumble dry low or air dry in shade. Warm iron if needed.</p>`;

async function run() {
  console.log('🚀 Listing Special Edition 350 GSM Fleece Girls Trousers...');

  const productId = crypto.randomUUID();

  // 1. Prepare Product Record
  const productRow = {
    id: productId,
    name: TITLE,
    slug: SLUG,
    description: FULL_DESC,
    short_description: SHORT_DESC,
    price: BASE_PRICE,
    compare_price: BASE_COMPARE_PRICE,
    cost: Math.round(BASE_PRICE * 0.55),
    category_id: CATS.bottoms,
    stock: (COLORS.length + PACK_OPTIONS.length) * SIZES.length * 100, // 50 * 100 = 5000
    has_variants: true,
    is_featured: true,
    is_service: false,
    enable_swatches: true,
    show_swatches_on_archive: true,
    tags: [
      'Girls Trousers',
      '350 GSM Fleece',
      'Special Edition',
      'Flared Trousers',
      'Pintuck Pants',
      'Girls Winter Wear',
      'Pack Discount',
      'TotVogue Special'
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

  // 2. Prepare Gallery Images
  const imageRows = [];
  COLORS.forEach((c, idx) => {
    imageRows.push({
      id: crypto.randomUUID(),
      product_id: productId,
      url: c.url,
      alt: `${TITLE} - ${c.name}`,
      sort_order: idx,
      is_primary: idx === 0,
      mime_type: 'image/webp'
    });
  });

  // Size chart image at the end
  imageRows.push({
    id: crypto.randomUUID(),
    product_id: productId,
    url: SIZE_CHART_IMAGE,
    alt: 'Kids Clothing Size Guide Chart',
    sort_order: COLORS.length,
    is_primary: false,
    mime_type: 'image/webp'
  });

  // 3. Prepare Variants
  const variantRows = [];
  let sortOrder = 1;

  // 8 Color Variants x 5 Sizes = 40 variants
  for (const c of COLORS) {
    for (const s of SIZES) {
      variantRows.push({
        id: crypto.randomUUID(),
        product_id: productId,
        color: c.name,
        size: s,
        color_hex: c.hex,
        price: BASE_PRICE,
        compare_price: BASE_COMPARE_PRICE,
        stock: 100,
        active: true,
        sort_order: sortOrder++,
        inventory_threshold: 0,
        image_url: c.url,
        show_image_swatch: true
      });
    }
  }

  // Pack Variants x 5 Sizes = 10 variants
  for (const p of PACK_OPTIONS) {
    for (const s of SIZES) {
      variantRows.push({
        id: crypto.randomUUID(),
        product_id: productId,
        color: p.name,
        size: s,
        color_hex: null,
        price: p.price,
        compare_price: p.comparePrice,
        stock: 100,
        active: true,
        sort_order: sortOrder++,
        inventory_threshold: 0,
        image_url: p.imageUrl,
        show_image_swatch: true
      });
    }
  }

  // 4. Prepare Category Mappings
  const categoryRows = CATEGORY_IDS.map((cid, idx) => ({
    product_id: productId,
    category_id: cid,
    position: idx + 1
  }));

  console.log(`Writing product ${TITLE} (ID: ${productId})...`);
  const { error: prodErr } = await supabase.from('products').insert(productRow);
  if (prodErr) {
    console.error('Failed to insert product:', prodErr);
    process.exit(1);
  }

  console.log(`Inserting ${imageRows.length} gallery images...`);
  const { error: imgErr } = await supabase.from('product_images').insert(imageRows);
  if (imgErr) {
    console.error('Failed to insert images:', imgErr);
    process.exit(1);
  }

  console.log(`Inserting ${variantRows.length} product variants...`);
  const { error: varErr } = await supabase.from('product_variants').insert(variantRows);
  if (varErr) {
    console.error('Failed to insert variants:', varErr);
    process.exit(1);
  }

  console.log(`Inserting ${categoryRows.length} category links...`);
  const { error: catErr } = await supabase.from('product_categories').insert(categoryRows);
  if (catErr) {
    console.error('Failed to insert categories:', catErr);
    process.exit(1);
  }

  console.log('✅ Product, images, variants, and categories created successfully!');

  // Purge Caches
  console.log('[Cache] Revalidating edge cache and ISR...');
  try {
    if (config.revalidateSecret) {
      await fetch(`${config.siteUrl}/api/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': config.revalidateSecret },
        body: JSON.stringify({ type: 'INSERT', table: 'products', record: { slug: SLUG } })
      });
      console.log('ISR revalidated.');
    }
    if (config.cfZone && config.cfToken) {
      const cfUrls = [
        `${config.siteUrl}/`,
        `${config.siteUrl}/shop`,
        `${config.siteUrl}/product/${SLUG}`
      ];
      await fetch(`https://api.cloudflare.com/client/v4/zones/${config.cfZone}/purge_cache`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${config.cfToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: cfUrls })
      });
      console.log('Cloudflare edge cache purged.');
    }
  } catch (e) {
    console.warn('Cache purge notice:', e.message);
  }
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
