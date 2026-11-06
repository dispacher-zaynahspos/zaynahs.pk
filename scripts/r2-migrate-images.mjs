#!/usr/bin/env node
/**
 * r2-migrate-images.mjs — copy Supabase Storage → Cloudflare R2.
 *
 * Prefix-preserving: `product-images/foo.webp` in Supabase becomes the same key
 * in R2, so `/storage/*` keeps resolving after the rewrite is switched.
 * Idempotent (HEAD before PUT), batched, resumable.
 *
 *   node scripts/r2-migrate-images.mjs --env=.env.local --dry-run
 *   node scripts/r2-migrate-images.mjs --env=.env.local --apply --batch=20
 *
 * Never prints secret values. Writes a manifest to scratch/ (git-ignored).
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { AwsClient } from 'aws4fetch';

const ROOT = resolve(process.cwd());
const BUCKETS = ['product-images'];
const IMAGE_EXT = /\.(jpg|jpeg|png|webp|gif|svg|avif|ico)$/i;
const PAGE = 1000;

function parseArgs(argv) {
  const args = {};
  for (const raw of argv.slice(2)) {
    const [k, v] = raw.replace(/^--/, '').split('=');
    args[k] = v === undefined ? true : v;
  }
  return args;
}

function loadEnv(filePath) {
  const env = {};
  for (const line of readFileSync(filePath, 'utf8').split('\n')) {
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

function required(env, key) {
  const value = (env[key] || '').trim();
  if (!value) throw new Error(`Missing env: ${key}`);
  return value;
}

function contentTypeFor(path) {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  return (
    {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      avif: 'image/avif',
      ico: 'image/x-icon',
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      webm: 'video/webm',
    }[ext] || 'application/octet-stream'
  );
}

async function listAll(supabaseUrl, serviceKey, bucket) {
  const out = [];
  const queue = [''];

  while (queue.length > 0) {
    const prefix = queue.shift();
    let offset = 0;

    for (;;) {
      const res = await fetch(`${supabaseUrl}/storage/v1/object/list/${bucket}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prefix,
          limit: PAGE,
          offset,
          sortBy: { column: 'name', order: 'asc' },
        }),
      });
      if (!res.ok) throw new Error(`list ${bucket}/${prefix}: ${res.status}`);
      const rows = await res.json();
      if (!Array.isArray(rows) || rows.length === 0) break;

      for (const row of rows) {
        const full = prefix ? `${prefix}/${row.name}` : row.name;
        const isFolder = row.id === null && !row.metadata;
        if (isFolder) {
          queue.push(full);
        } else {
          out.push({
            path: full,
            size: row.metadata?.size ?? 0,
            contentType: row.metadata?.mimetype || contentTypeFor(full),
          });
        }
      }

      if (rows.length < PAGE) break;
      offset += PAGE;
    }
  }

  return out;
}

function human(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

async function main() {
  const args = parseArgs(process.argv);
  const envPath = resolve(ROOT, typeof args.env === 'string' ? args.env : '.env.local');
  const env = loadEnv(envPath);

  const supabaseUrl = required(env, 'NEXT_PUBLIC_SUPABASE_URL').replace(/\/+$/, '');
  const serviceKey = required(env, 'SUPABASE_SERVICE_ROLE_KEY');
  const accountId = required(env, 'R2_ACCOUNT_ID');
  const accessKeyId = required(env, 'R2_ACCESS_KEY_ID');
  const secretAccessKey = required(env, 'R2_SECRET_ACCESS_KEY');
  const r2Bucket = required(env, 'R2_IMAGES_BUCKET');
  const endpoint =
    (env.R2_ENDPOINT || '').trim() || `https://${accountId}.r2.cloudflarestorage.com`;

  const apply = Boolean(args.apply);
  const batchSize = Number(args.batch || 20);

  const client = new AwsClient({
    accessKeyId,
    secretAccessKey,
    service: 's3',
    region: 'auto',
  });

  const s3Url = (key) => `${endpoint}/${r2Bucket}/${encodeURI(key)}`;

  let total = 0;
  let totalBytes = 0;
  const manifest = { started_at: new Date().toISOString(), buckets: {}, copied: [], skipped: [], failed: [] };

  for (const bucket of BUCKETS) {
    const objects = await listAll(supabaseUrl, serviceKey, bucket);
    const bytes = objects.reduce((sum, o) => sum + (o.size || 0), 0);
    total += objects.length;
    totalBytes += bytes;
    console.log(
      `${bucket.padEnd(16)} ${String(objects.length).padStart(6)} objects  ${human(bytes)}`
    );
    manifest.buckets[bucket] = { count: objects.length, bytes };

    if (!apply) continue;

    let done = 0;
    for (let i = 0; i < objects.length; i += batchSize) {
      const slice = objects.slice(i, i + batchSize);
      await Promise.all(
        slice.map(async (obj) => {
          const key = `${bucket}/${obj.path}`;
          try {
            const head = await client.fetch(s3Url(key), { method: 'HEAD' });
            if (head.ok) {
              manifest.skipped.push(key);
              return;
            }
            const sourceUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${encodeURI(obj.path)}`;
            const download = await fetch(sourceUrl);
            if (!download.ok) throw new Error(`download ${download.status}`);
            const body = Buffer.from(await download.arrayBuffer());
            const put = await client.fetch(s3Url(key), {
              method: 'PUT',
              body,
              headers: {
                'Content-Type': obj.contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
              },
            });
            if (!put.ok) throw new Error(`put ${put.status}`);
            manifest.copied.push(key);
            done += 1;
          } catch (error) {
            manifest.failed.push({ key, error: String(error.message || error) });
          }
        })
      );
      console.log(`  ${bucket}: ${Math.min(i + batchSize, objects.length)}/${objects.length}`);
    }
    console.log(`  ${bucket}: copied=${done}`);
  }

  if (!apply) {
    console.log(`\nDRY RUN — ${total} objects, ${human(totalBytes)}. Nothing copied.`);
    console.log('Run with --apply to copy.');
    return;
  }

  const outDir = join(ROOT, 'scratch', 'r2-migration');
  mkdirSync(outDir, { recursive: true });
  const manifestPath = join(outDir, `manifest-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  if (!existsSync(dirname(manifestPath))) mkdirSync(dirname(manifestPath), { recursive: true });

  console.log(
    `\nDONE — copied=${manifest.copied.length} skipped=${manifest.skipped.length} failed=${manifest.failed.length}`
  );
  console.log(`manifest: ${manifestPath}`);
  if (manifest.failed.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`\n✖ ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
