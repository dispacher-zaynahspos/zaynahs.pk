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
    const res = await fetch(`${api}/object/list/${BUCKET}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ prefix, limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } }),
    });
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error(`list failed: ${JSON.stringify(data)}`);
    const files = data.filter((x) => x.id); // objects have id; folders don't
    out.push(...files);
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
  if (ext === 'webp' && item.size <= MAX_BYTES) return false; // already small webp
  if (item.size <= MAX_BYTES && ext === 'webp') return false;
  return true;
}

async function convertToWebp(buffer, maxBytes) {
  const qualities = [92, 85, 78, 70, 62, 55, 48, 40];
  for (const q of qualities) {
    const out = await sharp(buffer, { animated: false })
      .rotate() // bake EXIF orientation
      .webp({ quality: q, effort: 4, smartSubsample: true })
      .toBuffer();
    if (out.length <= maxBytes) return { buffer: out, quality: q };
  }
  // Last resort: smallest quality, whatever size
  const out = await sharp(buffer).rotate().webp({ quality: 38, effort: 4 }).toBuffer();
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
      const { buffer: webp, quality } = await convertToWebp(buffer, MAX_BYTES);
      await upload(item.name, webp, 'image/webp');
      const saved = ((item.size - webp.length) / item.size) * 100;
      results.converted++;
      console.log(
        `OK  ${item.name}  ${(item.size / 1024).toFixed(0)}KB -> ${(webp.length / 1024).toFixed(0)}KB (q${quality}, -${saved.toFixed(0)}%)`
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