#!/usr/bin/env node
/**
 * Dynamic Multi-Store Variable Listing Script (RULE TITLE-CHARACTER-PRINT)
 * Every product title MUST explicitly mention the print/character name:
 * 'Spider-Man', 'Mickey Mouse', 'Minnie Mouse', 'Plain Solid'
 *
 * Rules:
 * - Separation white images skipped
 * - Products have variable swatches: variation_order = ['color', 'size']
 * - Prices: Tracksuits = Rs. 1,799 (compare: Rs. 2,450), Shirts = Rs. 950 (compare: Rs. 1,450)
 * - Sizes: 4-5y, 5-6y, 7-8y, 9-10y, 11-12y (100 stock per size per color)
 * - Strict gender isolation (Girls vs Boys categories)
 * - Size chart attached to gallery and size_guide_id
 * - Edge purge & ISR revalidation on completion
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
  if (m) env[m[1].trim()] = m[2].trim().replace(/^[\"']|[\"']$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const SIZE_CHART_IMAGE = 'https://img.totvogue.pk/product-images/photo-2026-11-01-09-46-43-1793508433015.webp';
const SIZE_GUIDE_ID = '148d729f-ce6b-4169-b13e-476e3602d940';
const SIZES = ['4-5y', '5-6y', '7-8y', '9-10y', '11-12y'];

const CATS = {
  shop: '00000000-0000-4000-8000-000000000099',
  winter: '1adc152a-63e3-45ba-b70c-09bf66e4d7a0',
  tracksuits: '637e5a74-1fbc-4401-97f5-175d3dda8875',
  sweatshirts: 'd14e4746-8546-47cd-b05a-c9070ce8b2ba',
  girls: 'b15adda3-3e09-4647-bacc-433b22ded3e7',
  girlsCoord: '9f5d810c-dada-4e91-9b57-c4aab8197d7d',
  girlsWinter: 'cc52eb0e-1bc3-461a-92ce-2bdce8b28893',
  boys: '57b8c355-0e38-4748-9c42-0c7c760dc759',
  boysCoord: 'adbd5753-20da-457e-a761-8b462cbcc7eb',
  boysWinter: '9cd5c9dd-b194-4d19-8147-9b6a303d3fb4'
};

const GIRLS_TRACKSUIT_CATS = [CATS.shop, CATS.girls, CATS.girlsCoord, CATS.tracksuits, CATS.girlsWinter, CATS.winter];
const BOYS_TRACKSUIT_CATS = [CATS.shop, CATS.boys, CATS.boysCoord, CATS.tracksuits, CATS.boysWinter, CATS.winter];
const GIRLS_SWEATSHIRT_CATS = [CATS.shop, CATS.girls, CATS.sweatshirts, CATS.girlsWinter, CATS.winter];
const BOYS_SWEATSHIRT_CATS = [CATS.shop, CATS.boys, CATS.sweatshirts, CATS.boysWinter, CATS.winter];
const UNISEX_SWEATSHIRT_CATS = [CATS.shop, CATS.boys, CATS.girls, CATS.sweatshirts, CATS.boysWinter, CATS.girlsWinter, CATS.winter];

function slugify(text) {
  return text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+|-+$/g, '');
}

async function apiRequest(endpoint, method = 'GET', body = null) {
  const url = new URL(endpoint, config.supabaseUrl);
  const headers = {
    apikey: config.serviceKey,
    Authorization: 'Bearer ' + config.serviceKey,
    'Content-Type': 'application/json',
    Prefer: 'return=representation'
  };
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method, headers }, res => {
      let data = '';
      res.on('data', c => (data += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function purgeCache(slugs) {
  console.log(`[Cache] Revalidating storefront at ${config.siteUrl}...`);
  if (config.revalidateSecret) {
    for (const slug of slugs) {
      await fetch(`${config.siteUrl}/api/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': config.revalidateSecret },
        body: JSON.stringify({ type: 'INSERT', table: 'products', record: { slug } })
      }).catch(e => console.warn(`Revalidate failed for ${slug}:`, e.message));
    }
  }

  if (config.cfZone && config.cfToken) {
    const cfUrls = [
      `${config.siteUrl}/`,
      `${config.siteUrl}/shop`,
      ...slugs.map(s => `${config.siteUrl}/product/${s}`)
    ];
    await fetch(`https://api.cloudflare.com/client/v4/zones/${config.cfZone}/purge_cache`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.cfToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: cfUrls })
    }).then(r => r.json()).then(res => {
      console.log('[Cache] Cloudflare purge completed:', res.success ? 'SUCCESS' : res.errors);
    }).catch(e => console.warn('CF Purge failed:', e.message));
  }
}

async function run() {
  console.log('Fetching media library for image URLs...');
  const { data: mediaRows } = await supabase
    .from('media_library')
    .select('id, original_filename, file_url')
    .order('created_at', { ascending: false })
    .limit(70);

  const urlMap = {};
  for (const row of mediaRows || []) {
    const m = row.original_filename?.match(/^(\d+)\.webp$/);
    if (m) {
      urlMap[parseInt(m[1])] = row.file_url;
    }
  }

  // 15 Variable Products with Explicit Print Names
  const productsDef = [
    // --- GIRLS TRACKSUITS (Rs. 1,799 / 2,450) ---
    {
      title: 'Girls Minnie Mouse Dancing Graphic Sweatshirt & Flared Trousers Tracksuit Set (4-12y)',
      description: 'Charming girls winter loungewear tracksuit set featuring a signature dancing ballerina Minnie Mouse graphic on an off-white fleece crewneck sweatshirt, paired with cozy front-seam flared fleece trousers available in multiple rich colors.',
      price: 1799,
      comparePrice: 2450,
      gender: 'girls',
      category_id: CATS.girlsCoord,
      category_ids: GIRLS_TRACKSUIT_CATS,
      colors: [
        { name: 'Orange Trouser', num: 2 },
        { name: 'Lime Green Trouser', num: 3 },
        { name: 'Red Trouser', num: 4 },
        { name: 'Pink Trouser', num: 5 }
      ]
    },
    {
      title: 'Girls Spider-Man Graphic Off-White Sweatshirt & Flared Trousers Tracksuit Set (4-12y)',
      description: 'Trendy streetwear tracksuit set for girls featuring an eye-catching Spider-Man graphic on an off-white fleece sweatshirt paired with front-seam flared trousers in versatile colorways.',
      price: 1799,
      comparePrice: 2450,
      gender: 'girls',
      category_id: CATS.girlsCoord,
      category_ids: GIRLS_TRACKSUIT_CATS,
      colors: [
        { name: 'Black Trouser + Red Spider', num: 7 },
        { name: 'Pink Trouser + Pink Spider', num: 8 },
        { name: 'Black Trouser + Pink Spider', num: 9 },
        { name: 'Red Trouser + Red Spider', num: 10 }
      ]
    },
    {
      title: 'Girls Spider-Man Spiderweb Graphic Hot Pink Sweatshirt & Wide-Leg Trousers Tracksuit Set (4-12y)',
      description: 'Bold and stylish girls two-piece winter loungewear set featuring a statement white Spider-Man spiderweb graphic on a vibrant hot pink fleece sweatshirt paired with elegant wide-leg trousers.',
      price: 1799,
      comparePrice: 2450,
      gender: 'girls',
      category_id: CATS.girlsCoord,
      category_ids: GIRLS_TRACKSUIT_CATS,
      colors: [
        { name: 'Ivory Cream Trouser', num: 12 },
        { name: 'Black Trouser', num: 13 },
        { name: 'Off-White Trouser', num: 14 }
      ]
    },
    {
      title: 'Girls Minnie Mouse Dancing Red Sweatshirt & Wide-Leg Trousers Tracksuit Set (4-12y)',
      description: 'Festive red fleece sweatshirt with a dancing Minnie Mouse cartoon print paired with comfortable wide-leg fleece trousers for girls.',
      price: 1799,
      comparePrice: 2450,
      gender: 'girls',
      category_id: CATS.girlsCoord,
      category_ids: GIRLS_TRACKSUIT_CATS,
      colors: [
        { name: 'Off-White Trouser', num: 16 },
        { name: 'Black Trouser', num: 17 }
      ]
    },
    {
      title: 'Girls Minnie Mouse Dancing Hot Pink Sweatshirt & Flared Trousers Tracksuit Set (4-12y)',
      description: 'Vibrant hot pink fleece sweatshirt featuring a playful dancing Minnie Mouse graphic paired with front-seam flared fleece trousers.',
      price: 1799,
      comparePrice: 2450,
      gender: 'girls',
      category_id: CATS.girlsCoord,
      category_ids: GIRLS_TRACKSUIT_CATS,
      colors: [
        { name: 'Pink Trouser', num: 19 },
        { name: 'Black Trouser', num: 20 },
        { name: 'Cream Trouser', num: 21 }
      ]
    },
    {
      title: 'Girls Mickey Mouse Peeking Hot Pink Sweatshirt & Wide-Leg Trousers Tracksuit Set (4-12y)',
      description: 'Cute cartoon winter set featuring an inquisitive peeking Mickey Mouse chest graphic on a hot pink fleece sweatshirt with wide-leg trousers.',
      price: 1799,
      comparePrice: 2450,
      gender: 'girls',
      category_id: CATS.girlsCoord,
      category_ids: GIRLS_TRACKSUIT_CATS,
      colors: [
        { name: 'Black Trouser', num: 23 },
        { name: 'Cream Trouser', num: 24 }
      ]
    },
    {
      title: 'Girls Spider-Man Red Graphic Off-White Sweatshirt & Black Wide-Leg Trousers Tracksuit Set (4-12y)',
      description: 'Urban streetwear fleece set for girls featuring a Spider-Man red chest graphic on an off-white sweatshirt paired with black wide-leg front-seam fleece trousers.',
      price: 1799,
      comparePrice: 2450,
      gender: 'girls',
      category_id: CATS.girlsCoord,
      category_ids: GIRLS_TRACKSUIT_CATS,
      colors: [
        { name: 'Black Trouser', num: 26 }
      ]
    },

    // --- BOYS TRACKSUITS (Rs. 1,799 / 2,450) ---
    {
      title: 'Boys Spider-Man Spiderweb Graphic Sweatshirt & Fleece Sweatpants Tracksuit Set (4-12y)',
      description: 'Action-ready boys winter tracksuit set featuring statement Spider-Man spiderweb graphics on fleece crewneck sweatshirts paired with straight-leg fleece sweatpants with elastic drawstring waistband.',
      price: 1799,
      comparePrice: 2450,
      gender: 'boys',
      category_id: CATS.boysCoord,
      category_ids: BOYS_TRACKSUIT_CATS,
      colors: [
        { name: 'Red Shirt + White Trouser', num: 29 },
        { name: 'Red Shirt + Grey Heather Trouser', num: 30 },
        { name: 'Off-White Shirt + Grey Heather Trouser', num: 27 }
      ]
    },
    {
      title: 'Boys Mickey Mouse Peeking Graphic Sweatshirt & Fleece Sweatpants Tracksuit Set (4-12y)',
      description: 'Classic and cheerful boys winter tracksuit set featuring a playful peeking Mickey Mouse graphic on a fleece top paired with durable fleece sweatpants.',
      price: 1799,
      comparePrice: 2450,
      gender: 'boys',
      category_id: CATS.boysCoord,
      category_ids: BOYS_TRACKSUIT_CATS,
      colors: [
        { name: 'Red Shirt + White Trouser', num: 32 },
        { name: 'Red Shirt + Grey Heather Trouser', num: 33 },
        { name: 'Off-White Shirt + Black Trouser', num: 35 }
      ]
    },

    // --- SHIRTS / SWEATSHIRTS (Rs. 950 / 1,450) ---
    {
      title: 'Kids Classic Plain Solid Crewneck Fleece Sweatshirt (4-12y)',
      description: 'Essential everyday minimalist crewneck sweatshirt for kids crafted from warm, brushed premium fleece in timeless solid colors with ribbed collar and cuffs.',
      price: 950,
      comparePrice: 1450,
      gender: 'unisex',
      category_id: CATS.sweatshirts,
      category_ids: UNISEX_SWEATSHIRT_CATS,
      colors: [
        { name: 'Hot Pink', num: 40 },
        { name: 'Off-White', num: 41 },
        { name: 'Vibrant Red', num: 42 }
      ]
    },
    {
      title: 'Girls Minnie Mouse Dancing Crewneck Fleece Sweatshirt (4-12y)',
      description: 'Charming girls fleece crewneck sweatshirt featuring a dancing ballerina Minnie Mouse graphic on soft fleece fabric in versatile colors.',
      price: 950,
      comparePrice: 1450,
      gender: 'girls',
      category_id: CATS.sweatshirts,
      category_ids: GIRLS_SWEATSHIRT_CATS,
      colors: [
        { name: 'Off-White', num: 38 },
        { name: 'Vibrant Red', num: 44 },
        { name: 'Hot Pink', num: 50 }
      ]
    },
    {
      title: 'Girls Mickey Mouse Peeking Graphic Hot Pink Crewneck Sweatshirt (4-12y)',
      description: 'Adorable winter fleece crewneck sweatshirt for girls in vibrant hot pink featuring a cheerful peeking Mickey Mouse chest graphic.',
      price: 950,
      comparePrice: 1450,
      gender: 'girls',
      category_id: CATS.sweatshirts,
      category_ids: GIRLS_SWEATSHIRT_CATS,
      colors: [
        { name: 'Hot Pink', num: 48 }
      ]
    },
    {
      title: 'Girls Spider-Man Spiderweb Graphic Hot Pink Crewneck Sweatshirt (4-12y)',
      description: 'Eye-catching girls winter fleece sweatshirt in bright hot pink featuring an intricate white Spider-Man spiderweb chest graphic.',
      price: 950,
      comparePrice: 1450,
      gender: 'girls',
      category_id: CATS.sweatshirts,
      category_ids: GIRLS_SWEATSHIRT_CATS,
      colors: [
        { name: 'Hot Pink', num: 49 }
      ]
    },
    {
      title: 'Boys Mickey Mouse Peeking Graphic Crewneck Sweatshirt (4-12y)',
      description: 'Cozy fleece crewneck sweatshirt for boys featuring a smiling peeking Mickey Mouse illustration on the chest in classic colorways.',
      price: 950,
      comparePrice: 1450,
      gender: 'boys',
      category_id: CATS.sweatshirts,
      category_ids: BOYS_SWEATSHIRT_CATS,
      colors: [
        { name: 'Off-White', num: 37 },
        { name: 'Vibrant Red', num: 45 }
      ]
    },
    {
      title: 'Boys Spider-Man White Spiderweb Graphic Red Crewneck Sweatshirt (4-12y)',
      description: 'Statement Spider-Man streetwear crewneck sweatshirt for boys in bold red fleece with an intricate white spiderweb chest graphic.',
      price: 950,
      comparePrice: 1450,
      gender: 'boys',
      category_id: CATS.sweatshirts,
      category_ids: BOYS_SWEATSHIRT_CATS,
      colors: [
        { name: 'Vibrant Red', num: 46 }
      ]
    }
  ];

  console.log(`\n🚀 Preparing to list ${productsDef.length} variable products with explicit print names...`);

  const productRows = [];
  const variantRows = [];
  const imageRows = [];
  const categoryRows = [];
  const productIds = [];

  for (const def of productsDef) {
    const productId = crypto.randomUUID();
    productIds.push(productId);

    // Primary image is first color's image
    const primaryImgUrl = urlMap[def.colors[0].num];
    if (!primaryImgUrl) {
      throw new Error(`Missing image for color ${def.colors[0].name} (num: ${def.colors[0].num})`);
    }

    const totalVariants = def.colors.length * SIZES.length;
    const slug = slugify(def.title);

    productRows.push({
      id: productId,
      name: def.title,
      slug: slug,
      description: def.description,
      short_description: def.description.slice(0, 150) + '...',
      price: def.price,
      compare_price: def.comparePrice,
      cost: Math.round(def.price * 0.6),
      category_id: def.category_id,
      stock: totalVariants * 100,
      has_variants: true,
      is_featured: true,
      is_service: false,
      enable_swatches: true,
      show_swatches_on_archive: true,
      tags: [def.title, def.gender === 'girls' ? 'Girls Wear' : 'Boys Wear', 'Winter Wear', 'Kids Fashion'],
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
    });

    // Images: each unique color image + size chart at the end
    def.colors.forEach((c, idx) => {
      const imgUrl = urlMap[c.num];
      imageRows.push({
        id: crypto.randomUUID(),
        product_id: productId,
        url: imgUrl,
        alt: `${def.title} - ${c.name}`,
        sort_order: idx,
        is_primary: idx === 0,
        mime_type: 'image/webp'
      });
    });

    // Size chart image
    imageRows.push({
      id: crypto.randomUUID(),
      product_id: productId,
      url: SIZE_CHART_IMAGE,
      alt: 'Kids Clothing Size Guide Chart',
      sort_order: def.colors.length,
      is_primary: false,
      mime_type: 'image/webp'
    });

    // Variants: Color x Size matrix
    let vSort = 1;
    for (const c of def.colors) {
      const colorImgUrl = urlMap[c.num];
      for (const s of SIZES) {
        variantRows.push({
          id: crypto.randomUUID(),
          product_id: productId,
          size: s,
          color: c.name,
          price: def.price,
          compare_price: def.comparePrice,
          stock: 100,
          active: true,
          sort_order: vSort++,
          inventory_threshold: 0,
          image_url: colorImgUrl,
          show_image_swatch: true
        });
      }
    }

    // Category mappings
    def.category_ids.forEach((cid, idx) => {
      categoryRows.push({
        product_id: productId,
        category_id: cid,
        position: idx + 1
      });
    });
  }

  // Cross-link FBT within same gender pool
  for (let i = 0; i < productRows.length; i++) {
    const cur = productRows[i];
    const def = productsDef[i];
    const sameGenderIds = productIds.filter((id, idx) => {
      if (id === cur.id) return false;
      const otherGender = productsDef[idx].gender;
      if (def.gender === 'unisex' || otherGender === 'unisex') return true;
      return def.gender === otherGender;
    });
    cur.frequently_bought_together_ids = sameGenderIds.slice(0, 5);
  }

  console.log(`[DB] Inserting ${productRows.length} variable products...`);
  const pRes = await apiRequest('/rest/v1/products', 'POST', productRows);
  if (pRes.status !== 201) throw new Error('Failed to insert products: ' + JSON.stringify(pRes.body));

  console.log(`[DB] Inserting ${variantRows.length} variants across all products...`);
  const vRes = await apiRequest('/rest/v1/product_variants', 'POST', variantRows);
  if (vRes.status !== 201) throw new Error('Failed to insert variants: ' + JSON.stringify(vRes.body));

  console.log(`[DB] Inserting ${imageRows.length} product images...`);
  const iRes = await apiRequest('/rest/v1/product_images', 'POST', imageRows);
  if (iRes.status !== 201) throw new Error('Failed to insert images: ' + JSON.stringify(iRes.body));

  console.log(`[DB] Inserting ${categoryRows.length} category mappings...`);
  const cRes = await apiRequest('/rest/v1/product_categories', 'POST', categoryRows);
  if (cRes.status !== 201) throw new Error('Failed to insert category mappings: ' + JSON.stringify(cRes.body));

  console.log('\n[Purge] Purging edge cache and revalidating...');
  await purgeCache(productRows.map(p => p.slug));

  console.log('\n=======================================================');
  console.log(`🎉 SUCCESS! Listed ${productRows.length} VARIABLE PRODUCTS WITH PRINT NAMES:`);
  productsDef.forEach((def, idx) => {
    const p = productRows[idx];
    console.log(`\n📦 ${p.name} (Rs. ${p.price})`);
    console.log(`   URL: ${config.siteUrl}/product/${p.slug}`);
    console.log(`   Color Swatches (${def.colors.length}): ${def.colors.map(c => c.name).join(', ')}`);
    console.log(`   Sizes (${SIZES.length}): ${SIZES.join(', ')}`);
    console.log(`   Total Variants: ${def.colors.length * SIZES.length}`);
  });
  console.log('=======================================================\n');
}

run().catch(err => {
  console.error('❌ Error listing variable products:', err);
  process.exit(1);
});
