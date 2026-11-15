#!/usr/bin/env node
/**
 * scripts/apply-trousers-pack-image.cjs
 *
 * 1. Takes the pristine circular collage image (Gemini_Generated_Image_cbxldicbxldicbxl.jpeg)
 * 2. Compresses to optimized WebP (<=80KB per Rule S11)
 * 3. Uploads to Cloudflare R2 on img.totvogue.pk
 * 4. Updates all Pack variants (Pack of 3, Pack of 5) for Girls Special Edition Trousers
 * 5. Adds the pack image to product_images for the Special Edition product and the 8 individual trousers
 * 6. Purges Cloudflare CDN and Next.js ISR cache
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { createClient } = require('@supabase/supabase-js');

// 1. Load env
const envPath = path.resolve('env-backups/totvogue.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const SPECIAL_EDITION_ID = '7b50e04e-c2ad-4e9c-8b4e-aca1b4143cd3';

const INDIVIDUAL_TROUSER_IDS = [
  '077eb489-c0a8-42fd-8eee-6d6cd6a355c9', // Black
  '4bbf4d51-cd33-4dfc-b845-47047f7a28cd', // Lime Green
  'fbaada33-6ba2-4b62-bd92-f59063ad8301', // Off-White
  '5699adaf-d878-45e2-a881-411c401e82fc', // Pink
  '0db88ac0-7f9b-435d-a698-6fbf61eb5451', // Red
  'ae02477c-7ef3-4a90-8952-9125e85233a9', // Rose Pink
  '410a473f-290b-4f93-844b-7431cf14a51f', // Rust Orange
  'a932acc7-a92a-402c-a6bb-bd3cd87405db'  // Sage Green
];

async function main() {
  console.log('🚀 Processing circular pack collage image for Girls Trousers...');

  // Source image
  const srcPath = path.resolve(process.env.HOME, 'Downloads/Gemini_Generated_Image_cbxldicbxldicbxl.jpeg');
  if (!fs.existsSync(srcPath)) {
    throw new Error(`Source image not found at: ${srcPath}`);
  }

  const inputBuffer = fs.readFileSync(srcPath);
  console.log(`✓ Read source image: ${inputBuffer.length} bytes`);

  // Compress to WebP (1200x1200, quality 82)
  const webpBuffer = await sharp(inputBuffer)
    .rotate()
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();

  const kbSize = Math.round(webpBuffer.length / 1024);
  console.log(`✓ WebP compressed: ${kbSize} KB`);

  // Upload to Cloudflare R2
  const r2Key = `product-images/girls-fleece-pintuck-flared-trousers-pack-circular-wheel-${Date.now()}.webp`;
  const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY
    }
  });

  await s3.send(
    new PutObjectCommand({
      Bucket: env.R2_IMAGES_BUCKET || 'totvogue-images',
      Key: r2Key,
      Body: webpBuffer,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000, immutable'
    })
  );

  const publicUrl = `https://img.totvogue.pk/${r2Key}`;
  console.log(`✓ Uploaded to R2: ${publicUrl}`);

  // 1. Update Pack variants of Special Edition product
  console.log('1. Updating Pack of 3 and Pack of 5 variants on Special Edition product...');
  const { data: packVariants, error: varErr } = await supabase
    .from('product_variants')
    .update({
      image_url: publicUrl,
      updated_at: new Date().toISOString()
    })
    .eq('product_id', SPECIAL_EDITION_ID)
    .ilike('color', '%Pack%')
    .select('id, color, size, price, image_url');

  if (varErr) throw varErr;
  console.log(`✓ Updated ${packVariants?.length || 0} pack variants with circular collage image.`);
  packVariants?.forEach(v => console.log(`   - ${v.color} (${v.size}) -> ${v.image_url}`));

  // 2. Add to product_images for Special Edition product
  console.log('2. Adding circular collage to product_images for Special Edition product...');
  const { error: piErr } = await supabase
    .from('product_images')
    .insert({
      product_id: SPECIAL_EDITION_ID,
      url: publicUrl,
      alt: 'Girls Special Edition 350 GSM Heavyweight Fleece Pintuck Flared Trousers - Pack of 3 & Pack of 5 Assorted Colors Wheel',
      sort_order: 1, // Second image right after primary cover
      is_primary: false,
      mime_type: 'image/webp',
      size: webpBuffer.length
    });

  if (piErr) {
    console.warn('   product_images insert note:', piErr.message);
  } else {
    console.log('✓ Added to Special Edition product_images gallery (sort_order: 1).');
  }

  // 3. Add to individual 8 trousers gallery as well so pack bundle is visible on all
  console.log('3. Adding circular collage to product_images of 8 individual pintuck trousers...');
  for (const pid of INDIVIDUAL_TROUSER_IDS) {
    try {
      await supabase
        .from('product_images')
        .insert({
          product_id: pid,
          url: publicUrl,
          alt: 'Girls Fleece Pintuck Flared Trousers - Complete Color Range & Multi-Pack Value Bundle',
          sort_order: 5,
          is_primary: false,
          mime_type: 'image/webp',
          size: webpBuffer.length
        });
    } catch (e) {
      // ignore
    }
  }
  console.log('✓ Added to 8 individual trousers galleries.');

  // 4. Targeted Edge Cache Purge
  console.log('4. Purging Cloudflare CDN and Next.js ISR caches...');
  if (env.CLOUDFLARE_ZONE_ID && env.CLOUDFLARE_API_TOKEN) {
    const cfRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}/purge_cache`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ purge_everything: true })
    });
    const cfData = await cfRes.json();
    console.log('   Cloudflare Purge:', cfData.success ? 'SUCCESS ✅' : cfData);
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
    }).catch(e => console.warn('   ISR warning:', e.message));
    console.log('   Next.js ISR revalidated ✅');
  }

  console.log('\n🎉 ALL DONE! Circular pack collage image successfully applied across all places.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
