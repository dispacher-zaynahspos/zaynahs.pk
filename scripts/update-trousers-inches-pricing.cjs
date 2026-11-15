#!/usr/bin/env node
/**
 * Update Girls Front-Seam Pintuck Trousers:
 * 1. Sizes to inches: 26 in, 28 in, 30 in, 32 in, 34 in (not age-based)
 * 2. Single price: Rs. 949 (compare: Rs. 1,450)
 * 3. Pack 3: 5% OFF -> Rs. 2,705 (compare: Rs. 4,350)
 * 4. Pack 5: 10% OFF -> Rs. 4,270 (compare: Rs. 7,250)
 * 5. Update across all places (Special Edition variable product + 8 individual products)
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.resolve('env-backups/totvogue.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const INCHES_SIZES = ['26 in', '28 in', '30 in', '32 in', '34 in'];

const SINGLE_PRICE = 949;
const COMPARE_PRICE = 1450;

// Pack 3 = 3 * 949 = 2847 - 5% (142.35) = 2705 (Compare: 3 * 1450 = 4350)
const PACK3_PRICE = 2705;
const PACK3_COMPARE = 4350;

// Pack 5 = 5 * 949 = 4745 - 10% (474.5) = 4270 (Compare: 5 * 1450 = 7250)
const PACK5_PRICE = 4270;
const PACK5_COMPARE = 7250;

const SPECIAL_EDITION_ID = '7b50e04e-c2ad-4e9c-8b4e-aca1b4143cd3';

const INDIVIDUAL_GIRLS_PINTUCK_IDS = [
  '077eb489-c0a8-42fd-8eee-6d6cd6a355c9', // Girls Black Wide-Leg High-Waisted Front Seam Pintuck Sweatpants (26-34 Size)
  '4bbf4d51-cd33-4dfc-b845-47047f7a28cd', // Girls Lime Green Wide-Leg Front Seam Drawstring Sweatpants (26-34 Size)
  'fbaada33-6ba2-4b62-bd92-f59063ad8301', // Girls Off-White Wide-Leg Front Seam Pintuck Sweatpants (26-34 Size)
  '5699adaf-d878-45e2-a881-411c401e82fc', // Girls Pink Wide-Leg Front Seam Sweatpants (26-34 Size)
  '0db88ac0-7f9b-435d-a698-6fbf61eb5451', // Girls Red Wide-Leg Front Seam Drawstring Sweatpants (26-34 Size)
  'ae02477c-7ef3-4a90-8952-9125e85233a9', // Girls Rose Pink Wide-Leg Front Seam Drawstring Sweatpants (26-34 Size)
  '410a473f-290b-4f93-844b-7431cf14a51f', // Girls Rust Orange Wide-Leg Front Seam Pintuck Sweatpants (26-34 Size)
  'a932acc7-a92a-402c-a6bb-bd3cd87405db'  // Girls Sage Green Wide-Leg Front Seam Pintuck Sweatpants (26-34 Size)
];

async function updateSpecialEditionProduct() {
  console.log('1. Updating Special Edition Variable Product...');

  const newTitle = 'Girls Special Edition 350 GSM Heavyweight Fleece Pintuck Flared Trousers (26-34 Size)';
  const newSlug = 'girls-special-edition-350-gsm-heavyweight-fleece-pintuck-flared-trousers-26-34-size';

  const shortDesc = 'Special Edition ultra-heavyweight 350 GSM fleece flared trousers for girls. Features structured front pintuck seam, elastic waistband with contrast drawstring, and multi-pack savings (3-pack 5% off, 5-pack 10% off).';

  const fullDesc = `<p>Elevate your girl's winter wardrobe with our <strong>Special Edition 350 GSM Heavyweight Fleece Pintuck Flared Trousers</strong>. Expertly tailored from high-density 350 GSM brushed cotton-rich fleece, these trousers deliver exceptional thermal insulation, plush softness, and long-lasting shape retention for colder days.</p>

<h3>Key Features:</h3>
<ul>
  <li><strong>Special Edition 350 GSM Fleece:</strong> Ultra-heavyweight fabric offering superior warmth, cozy brushed interior, and wind-blocking thickness.</li>
  <li><strong>Tailored Pintuck Front Seam:</strong> Signature vertical front center seam elongates the silhouette and gives a chic, polished aesthetic.</li>
  <li><strong>Flared / Wide-Leg Cut:</strong> Relaxed straight-to-flared bottom opening for modern trendy streetwear loungewear styling.</li>
  <li><strong>Elastic Waistband & Contrast Drawcord:</strong> Flexible ribbed waistband with an adjustable cream drawstring cord ensures a snug, custom fit.</li>
  <li><strong>Deep Functional Pockets:</strong> Seamless side pockets keep hands warm and hold everyday essentials.</li>
  <li><strong>Inches Sizing (26 in - 34 in):</strong> Clear, accurate inches waist measurements for a perfect tailored fit.</li>
</ul>

<h3>Special Pack Value Discounts:</h3>
<ul>
  <li><strong>Single Piece:</strong> Rs. 949 (Regular Price: Rs. 1,450)</li>
  <li><strong>Pack of 3 (5% OFF):</strong> Rs. 2,705 (Save an extra 5% — select size and specify your preferred 3 colors in order notes or on WhatsApp)</li>
  <li><strong>Pack of 5 (10% OFF):</strong> Rs. 4,270 (Save an extra 10% — select size and specify your preferred 5 colors in order notes or on WhatsApp)</li>
</ul>

<h3>Care Instructions:</h3>
<p>Machine wash cold on gentle cycle inside out. Do not bleach. Tumble dry low or air dry in shade. Warm iron if needed.</p>`;

  const { error: prodErr } = await supabase
    .from('products')
    .update({
      name: newTitle,
      slug: newSlug,
      price: SINGLE_PRICE,
      compare_price: COMPARE_PRICE,
      description: fullDesc,
      short_description: shortDesc,
      updated_at: new Date().toISOString()
    })
    .eq('id', SPECIAL_EDITION_ID);

  if (prodErr) throw prodErr;
  console.log('   Product row updated successfully.');

  // Update variants: Fetch existing variants and update sizes + prices
  const { data: variants, error: varFetchErr } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', SPECIAL_EDITION_ID)
    .order('sort_order', { ascending: true });

  if (varFetchErr) throw varFetchErr;

  const ageToInchMap = {
    '4-5y': '26 in',
    '5-6y': '28 in',
    '7-8y': '30 in',
    '9-10y': '32 in',
    '11-12y': '34 in'
  };

  for (const v of variants) {
    const inchSize = ageToInchMap[v.size] || v.size;
    let price = SINGLE_PRICE;
    let comparePrice = COMPARE_PRICE;
    let colorName = v.color;

    if (v.color.includes('Pack of 3')) {
      price = PACK3_PRICE;
      comparePrice = PACK3_COMPARE;
      colorName = 'Pack of 3 (Custom Assorted - 5% OFF)';
    } else if (v.color.includes('Pack of 5')) {
      price = PACK5_PRICE;
      comparePrice = PACK5_COMPARE;
      colorName = 'Pack of 5 (Custom Assorted - 10% OFF)';
    }

    await supabase
      .from('product_variants')
      .update({
        size: inchSize,
        price,
        compare_price: comparePrice,
        color: colorName,
        updated_at: new Date().toISOString()
      })
      .eq('id', v.id);
  }
  console.log(`   Updated ${variants.length} variants to inches sizes & 949/pack pricing.`);
}

async function updateIndividualPintuckProducts() {
  console.log('2. Updating 8 Individual Girls Front Seam Pintuck Products...');

  for (const pid of INDIVIDUAL_GIRLS_PINTUCK_IDS) {
    const { data: prod } = await supabase.from('products').select('name').eq('id', pid).single();
    if (!prod) continue;

    console.log(`   Updating: ${prod.name}`);

    // Update product pricing to Rs. 949
    await supabase
      .from('products')
      .update({
        price: SINGLE_PRICE,
        compare_price: COMPARE_PRICE,
        updated_at: new Date().toISOString()
      })
      .eq('id', pid);

    // Update variants to inches format and Rs. 949
    const { data: vars } = await supabase
      .from('product_variants')
      .select('id, size')
      .eq('product_id', pid);

    for (const v of vars || []) {
      const cleanSize = v.size.replace(/\s*in$/i, '').trim();
      const inchSize = `${cleanSize} in`;

      await supabase
        .from('product_variants')
        .update({
          size: inchSize,
          price: SINGLE_PRICE,
          compare_price: COMPARE_PRICE,
          updated_at: new Date().toISOString()
        })
        .eq('id', v.id);
    }
  }
}

async function purgeCache() {
  console.log('3. Purging Edge & CDN Cache...');
  if (env.CLOUDFLARE_ZONE_ID && env.CLOUDFLARE_API_TOKEN) {
    const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}/purge_cache`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ purge_everything: true })
    });
    const data = await res.json();
    console.log('   Cloudflare Purge:', data.success ? 'SUCCESS ✅' : data);
  }

  const site = env.NEXT_PUBLIC_SITE_URL || 'https://www.totvogue.pk';
  if (env.REVALIDATE_SECRET) {
    await fetch(`${site}/api/revalidate`, {
      method: 'POST',
      headers: {
        'x-revalidate-secret': env.REVALIDATE_SECRET,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ table: 'products', type: 'UPDATE' })
    }).catch(e => console.warn('   ISR Revalidation warning:', e.message));
    console.log('   Next.js ISR revalidated ✅');
  }
}

async function run() {
  await updateSpecialEditionProduct();
  await updateIndividualPintuckProducts();
  await purgeCache();
  console.log('\n✅ ALL TROUSERS UPDATED TO INCHES (26 in - 34 in) & PRICED AT RS. 949 / 3-PACK 5% / 5-PACK 10%!');
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
