const { S3Client, PutObjectCommand } = require('/Users/shoaib/Desktop/zaynahs.pk/node_modules/@aws-sdk/client-s3');
const sharp = require('sharp');

const SUPABASE_URL = 'https://ziucrfpebpxijqhwmqre.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppdWNyZnBlYnB4aWpxaHdtcXJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTYwNTEzNywiZXhwIjoyMDk3MTgxMTM3fQ.EHmWd70KE_D8UhCQpgVYC1w0_wV8nyrjqdoQUUsLgWU';

const s3 = new S3Client({
  region: 'auto',
  endpoint: 'https://c218bd7557331b8360d7085105b732b2.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: 'bfbe155b79836e1bcd28078585520c0b',
    secretAccessKey: 'bb6f66c11f1f2b01b88904873a630d772fece433cf51db61224ba96d0942e7fe',
  }
});

const R2_BUCKET = 'totvogue-images';
const R2_PUBLIC_BASE = 'https://img.totvogue.pk';

async function main() {
  console.log('Fetching recent product images from Supabase...');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/product_images?order=created_at.desc&limit=15&select=*`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });

  const images = await res.json();
  console.log(`Found ${images.length} images to inspect.`);

  for (const img of images) {
    const rawUrl = img.url;
    console.log(`\nProcessing image [${img.id}]: ${rawUrl}`);

    if (rawUrl.startsWith(R2_PUBLIC_BASE)) {
      console.log('Already on R2, skipping.');
      continue;
    }

    try {
      console.log('Downloading from Supabase...');
      const imgRes = await fetch(rawUrl);
      if (!imgRes.ok) throw new Error(`Download failed: ${imgRes.status}`);
      const arrayBuffer = await imgRes.arrayBuffer();
      const inputBuffer = Buffer.from(arrayBuffer);
      console.log(`Original size: ${Math.round(inputBuffer.length / 1024)} KB`);

      // Compress with Sharp to WebP
      const webpBuffer = await sharp(inputBuffer)
        .rotate()
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80, effort: 4 })
        .toBuffer();

      console.log(`Compressed WebP size: ${Math.round(webpBuffer.length / 1024)} KB`);

      // Extract filename
      const urlObj = new URL(rawUrl);
      const originalPath = urlObj.pathname.split('/product-images/')[1] || `image-${Date.now()}`;
      const baseName = originalPath.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
      const r2Key = `product-images/${baseName}.webp`;

      console.log(`Uploading to R2 key: ${r2Key}...`);
      await s3.send(new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: r2Key,
        Body: webpBuffer,
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=31536000, immutable'
      }));

      const newPublicUrl = `${R2_PUBLIC_BASE}/${r2Key}`;
      console.log(`Uploaded! Public URL: ${newPublicUrl}`);

      // Update Supabase DB row
      const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/product_images?id=eq.${img.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          url: newPublicUrl,
          mime_type: 'image/webp',
          size: webpBuffer.length
        })
      });

      if (!patchRes.ok) {
        throw new Error(`DB update failed: ${patchRes.status}`);
      }

      console.log(`✓ DB row updated successfully for [${img.id}]!`);
    } catch (e) {
      console.error(`Error processing image ${img.id}:`, e.message);
    }
  }

  console.log('\nMigration to R2 finished!');
}

main().catch(console.error);
