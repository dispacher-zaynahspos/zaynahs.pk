#!/usr/bin/env node
/**
 * seed-brand.mjs — Brand setup script (DB ONLY, no code changes)
 * Usage (from repo root, current store's .env.local active):
 *   BRAND_NAME="Zaynahs.pk" BRAND_TYPE="Premium Fashion & Jewelry Store" \
 *   BRAND_TAGLINE="Pakistan's Most Trusted Fashion Store — Premium Jewelry & Clothes" \
 *   BRAND_PRODUCTS="Jewellery, Necklaces, Earrings, Rings, Clothes, Fashion Apparel" \
 *   BRAND_AUDIENCES="Women, Men" \
 *   BRAND_KEYWORDS="premium jewelry, fashion clothes, COD Pakistan" \
 *   node scripts/seed-brand.mjs
 *
 * Pushes brand info to: store_settings, ai_settings, seo_meta (all rows).
 * Guide: docs/BRAND_SETUP_GUIDE.md
 */
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env.local', 'utf8').split('\n');
const get = (k) => {
  const m = env.find((l) => l.startsWith(k + '='));
  return m ? m.split('=').slice(1).join('=').trim() : '';
};
const supabase = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY'));

const brand = process.env.BRAND_NAME || '';
const type = process.env.BRAND_TYPE || 'Fashion Store';
const tagline = process.env.BRAND_TAGLINE || `${brand} — Premium Fashion Store`;
const products = process.env.BRAND_PRODUCTS || 'Jewellery, Clothes, Fashion Accessories';
const audiences = process.env.BRAND_AUDIENCES || 'Women, Men';
const keywords = process.env.BRAND_KEYWORDS || `${brand} ${type}`;

if (!brand) {
  console.error('ERROR: BRAND_NAME required. Set env vars first — see docs/BRAND_SETUP_GUIDE.md');
  process.exit(1);
}

const year = new Date().getFullYear();
const SETTINGS_ID = '00000000-0000-4000-8000-000000000001';
const AI_ID = '00000000-0000-4000-8000-000000000002';

const faq = `<div class="space-y-6">
  <div>
    <h3 class="text-base font-bold text-gray-900 dark:text-white">1. Why is ${brand} Pakistan\u2019s most trusted store?</h3>
    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">${brand} is ${tagline}. Thousands of happy customers trust us for genuine quality, fair pricing, and reliable Cash on Delivery nationwide.</p>
  </div>
  <div>
    <h3 class="text-base font-bold text-gray-900 dark:text-white">2. How long does delivery take?</h3>
    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Standard Cash on Delivery (COD) orders across Pakistan are processed within 24 hours and delivered in 2-4 business days.</p>
  </div>
  <div>
    <h3 class="text-base font-bold text-gray-900 dark:text-white">3. What payment methods do you offer?</h3>
    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">We offer Cash on Delivery (COD) nationwide, as well as EasyPaisa, JazzCash, and Bank Transfer options.</p>
  </div>
  <div>
    <h3 class="text-base font-bold text-gray-900 dark:text-white">4. What do you sell?</h3>
    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">We specialize in ${products}. Every piece is curated for premium quality and durability.</p>
  </div>
  <div>
    <h3 class="text-base font-bold text-gray-900 dark:text-white">5. Can I exchange or return an item?</h3>
    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">We offer a 7-day hassle-free exchange guarantee. If your order arrives damaged or incorrect, contact us on WhatsApp for an immediate replacement.</p>
  </div>
</div>`;

const returns = `<div class="space-y-4 text-sm text-gray-700 dark:text-gray-300">
  <h2 class="text-lg font-bold text-gray-900 dark:text-white">${brand} Exchange &amp; Return Policy</h2>
  <p>At ${brand} \u2014 ${tagline} \u2014 your satisfaction is our priority. If your order has any issues, we provide a smooth 7-day exchange window.</p>
  <ul class="list-disc pl-5 space-y-2">
    <li><strong>Transit Damage Protection:</strong> Inspect your parcel upon arrival. If an item is damaged or defective, WhatsApp us within 48 hours for a free replacement.</li>
    <li><strong>Size or Style Exchange:</strong> If you\u2019d like a different size or design, send the item back to our hub in original unused condition.</li>
    <li><strong>Cash Refunds:</strong> Refunds are provided via JazzCash/EasyPaisa/Bank Transfer in case an item is out of stock.</li>
  </ul>
</div>`;

const privacy = `<div class="space-y-4 text-sm text-gray-700 dark:text-gray-300">
  <h2 class="text-lg font-bold text-gray-900 dark:text-white">Privacy Policy</h2>
  <p>${brand} \u2014 ${tagline} \u2014 respects customer privacy. We collect customer name, phone number, and address strictly for shipping and order confirmation via WhatsApp.</p>
  <p>We do NOT sell or share customer personal information with third parties.</p>
</div>`;

const categoryTemplate = `<p>Explore our exclusively curated <strong>{{category_name}}</strong> collection at ${brand} \u2014 ${tagline}. From everyday elegance to festive statement pieces, our premium ${keywords} are crafted with exquisite quality and delivered with Cash on Delivery nationwide.</p>`;

const productTemplate = `<h2>Premium Quality, Guaranteed</h2>
<p>At ${brand} \u2014 ${tagline} \u2014 each piece in our <strong>{{product_name}}</strong> collection is designed to make you feel radiant and timeless.</p>
<h2>Key Features</h2>
<ul>
<li><strong>Premium Materials:</strong> High-grade stainless steel and premium alloy plating</li>
<li><strong>Durable &amp; Fade-Resistant:</strong> Tarnish-free designs for daily wear</li>
<li><strong>Trusted Nationwide:</strong> Quality guaranteed with Cash on Delivery</li>
</ul>
<h2>Care Instructions</h2>
<ul>
<li>Keep away from water, perfume, and lotion</li>
<li>Store in a dry place away from direct sunlight</li>
<li>Wipe gently with a soft cloth after each use</li>
</ul>`;

const { error: e1 } = await supabase
  .from('store_settings')
  .update({
    store_name: brand,
    tagline,
    meta_title: `${brand} | ${tagline}`,
    meta_description: `${brand} is ${tagline}. Shop ${keywords} with guaranteed quality and Cash on Delivery nationwide.`,
    footer_text: `\u00A9 ${year} ${brand} \u2014 ${tagline}. All Rights Reserved.`,
    faq_content: faq,
    return_policy_content: returns,
    privacy_policy_content: privacy,
  })
  .eq('id', SETTINGS_ID);
console.log('store_settings:', e1 ? 'ERR ' + e1.message : 'OK');

const { error: e2 } = await supabase
  .from('ai_settings')
  .update({
    brand_name: brand,
    store_type: type,
    custom_instructions: `${brand} is ${tagline}. Always emphasize premium quality, trust, and craftsmanship in all generated content.`,
    product_types: products,
    target_audiences: audiences,
    category_default_template: categoryTemplate,
    product_default_template: productTemplate,
  })
  .eq('id', AI_ID);
console.log('ai_settings:', e2 ? 'ERR ' + e2.message : 'OK');

const { data: seo, error: e3 } = await supabase.from('seo_meta').select('id, seo_title, og_title');
if (e3) {
  console.log('seo_meta fetch ERR', e3.message);
} else {
  let updated = 0;
  for (const row of seo || []) {
    const patch = {};
    for (const col of ['seo_title', 'og_title']) {
      if (row[col] && /Your Store|TotVogue|Zaynahs|MiniMahal|LittleMister/i.test(row[col]) && !row[col].includes(brand)) {
        patch[col] = row[col].replace(/Your Store|TotVogue|Zaynahs|MiniMahal|LittleMister/gi, brand);
      }
    }
    if (Object.keys(patch).length) {
      const { error } = await supabase.from('seo_meta').update(patch).eq('id', row.id);
      if (error) console.log('seo row ERR', row.id, error.message);
      else updated++;
    }
  }
  console.log('seo_meta rows fixed:', updated, '/', seo?.length || 0);
}

console.log('\nDone. Verify: curl -s https://<store>/ | grep -o "<title>.*</title>"');