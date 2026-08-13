/**
 * Convert all images in Supabase Storage `product-images` bucket to WebP,
 * targeting 50–100KB per file, while PRESERVING the exact object path
 * (overwrite in place) so every existing URL keeps working — no DB change.
 *
 * Usage: node scripts/convert-images-webp.mjs
 * Reads SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL from .env.local
 *
 * Safety:
 * - Already-small WebP (<= 100KB) are skipped (fast).
 * - Quality starts at 92 and steps down until the file fits <= 100KB
 *   (near-lossless; visually identical for photos).
 * - Uploads use upsert:true → in-place overwrite, path unchanged.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

// Minimal .env.local loader (no dotenv dependency)
const envRaw = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
const envMap = {};
for (const line of envRaw.split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (m) envMap[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const SERVICE_KEY = envMap.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_URL = envMap.NEXT_PUBLIC_SUPABASE_URL;
const BUCKET = 'product-images';
const MAX_BYTES = 100 * 1024; // 100 KB
const TARGET_MIN = 50 * 1024; // 50 KB (soft floor; not enforced if quality would look bad)
const CONCURRENCY = 10;

if (!SERVICE_KEY || !SUPABASE_URL) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
const api = `${SUPABASE_URL}/storage/v1`;
const headers = {
  Authorization: `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
};

async function listObjects(prefix = '') {
  const out = [];
  let offset = 0;
  for (;;) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(prefix, { limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } });
    if (error) throw new Error(`list failed: ${error.message}`);
    if (!data || data.length === 0) break;
    out.push(...data);
    if (data.length < 1000) break;
    offset += 1000;
  }
  return out;
}

async function getAllObjects() {
  const root = await listObjects('');
  const items = [];
  for (const f of root) {
    if (f.id) {
      items.push({ name: f.name, size: f.metadata?.size || 0 });
    } else {
      const folderFiles = await listObjects(f.name);
      for (const ff of folderFiles) items.push({ name: `${f.name}/${ff.name}`, size: ff.metadata?.size || 0 });
    }
  }
  return items;
}

function needConversion(item) {
  const ext = item.name.split('.').pop()?.toLowerCase() || '';
  return !(ext === 'webp' && item.size <= MAX_BYTES); // skip already-small webp only
}

async function convertToWebp(buffer, maxBytes) {
  const qualities = [92, 85, 78, 70, 62, 55, 48, 40];
  const toBuffer = (b, opts) => sharp(b, { animated: false }).rotate().webp({ ...opts, effort: 4, smartSubsample: true }).toBuffer();
  for (const q of qualities) {
    const out = await toBuffer(buffer, { quality: q });
    if (out.length <= maxBytes) return { buffer: out, quality: q };
  }
  // Quality floor reached and still too big — downscale (max 1600px) then re-try
  const meta = await sharp(buffer).metadata();
  const maxDim = Math.max(meta.width || 0, meta.height || 0);
  if (maxDim > 1200) {
    const resized = await sharp(buffer, { animated: false })
      .rotate()
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .toBuffer();
    for (const q of [70, 60, 50, 40]) {
      const out = await toBuffer(resized, { quality: q });
      if (out.length <= maxBytes) return { buffer: out, quality: q, resized: true };
    }
    const out = await toBuffer(resized, { quality: 35 });
    return { buffer: out, quality: 35, resized: true };
  }
  const out = await toBuffer(buffer, { quality: 38 });
  return { buffer: out, quality: 38 };
}

async function download(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function upload(name, buffer, contentType) {
  const { error } = await supabase.storage.from(BUCKET).upload(name, buffer, {
    upsert: true,
    contentType,
    cacheControl: '31536000',
  });
  if (error) throw new Error(`upload: ${error.message}`);
}

async function worker(queue, results) {
  while (queue.length) {
    const item = queue.shift();
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${item.name}`;
    try {
      const buffer = await download(publicUrl);
      const { buffer: webp, quality, resized } = await convertToWebp(buffer, MAX_BYTES);
      await upload(item.name, webp, 'image/webp');
      const saved = ((item.size - webp.length) / item.size) * 100;
      results.converted++;
      console.log(
        `OK  ${item.name}  ${(item.size / 1024).toFixed(0)}KB -> ${(webp.length / 1024).toFixed(0)}KB (q${quality}${resized ? ' resized' : ''}, -${saved.toFixed(0)}%)`
      );
    } catch (err) {
      results.failed++;
      console.error(`FAIL ${item.name}: ${err.message}`);
    }
  }
}

async function main() {
  console.log('Listing objects in', BUCKET, '...');
  const all = await getAllObjects();
  let todo = all.filter(needConversion);
  const skipped = all.length - todo.length;
  if (process.env.TEST_LIMIT) todo = todo.slice(0, Number(process.env.TEST_LIMIT));
  console.log(`Total: ${all.length} | To convert: ${todo.length} | Skipped (already small webp): ${skipped}`);

  if (todo.length === 0) {
    console.log('Nothing to do.');
    return;
  }

  const results = { converted: 0, failed: 0 };
  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) workers.push(worker(todo, results));
  await Promise.all(workers);

  console.log(`\nDone. Converted: ${results.converted} | Failed: ${results.failed}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});