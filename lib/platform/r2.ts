/**
 * R2 object storage adapter — the ONLY place that talks to R2 directly.
 *
 * Works on Node and on Workers (aws4fetch is fetch-based, no SDK, no Node APIs).
 * Feature code calls these helpers; it never builds S3 URLs itself.
 *
 * Keys are prefix-preserving: `product-images/<folder>/<file>` matches the
 * public path `/storage/product-images/<folder>/<file>`, so old Supabase rows
 * keep working through the `/storage/*` rewrite (reversible mapping).
 */

import { AwsClient } from 'aws4fetch';

export interface R2Config {
  accountId: string;
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBase: string;
}

function readConfig(): R2Config | null {
  const accountId = (process.env.R2_ACCOUNT_ID || '').trim();
  const accessKeyId = (process.env.R2_ACCESS_KEY_ID || '').trim();
  const secretAccessKey = (process.env.R2_SECRET_ACCESS_KEY || '').trim();
  const bucket = (process.env.R2_IMAGES_BUCKET || '').trim();
  const endpoint =
    (process.env.R2_ENDPOINT || '').trim() ||
    (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : '');
  const publicBase = (process.env.R2_PUBLIC_BASE || '').trim();

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !endpoint) return null;
  return { accountId, endpoint, accessKeyId, secretAccessKey, bucket, publicBase };
}

/**
 * Uploads to R2 only when explicitly switched on, so a half-configured
 * deployment keeps writing to the current backend instead of breaking uploads.
 */
export function isR2UploadEnabled(): boolean {
  return process.env.R2_UPLOAD_ENABLED === 'true' && readConfig() !== null;
}

export function r2PublicUrl(key: string): string | null {
  const config = readConfig();
  if (!config || !config.publicBase) return null;
  return `${config.publicBase.replace(/\/+$/, '')}/${key.replace(/^\/+/, '')}`;
}

export interface R2UploadInput {
  key: string;
  body: BodyInit | ArrayBuffer | Uint8Array;
  contentType: string;
  cacheControl?: string;
}

export type R2UploadResult =
  | { ok: true; key: string; url: string }
  | { ok: false; error: string };

export async function uploadObjectToR2(input: R2UploadInput): Promise<R2UploadResult> {
  const config = readConfig();
  if (!config) return { ok: false, error: 'R2 is not configured' };

  const client = new AwsClient({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    service: 's3',
    region: 'auto',
  });

  const key = input.key.replace(/^\/+/, '');
  const url = `${config.endpoint}/${config.bucket}/${encodeURI(key)}`;

  try {
    const response = await client.fetch(url, {
      method: 'PUT',
      body: input.body as BodyInit,
      headers: {
        'Content-Type': input.contentType,
        'Cache-Control': input.cacheControl || 'public, max-age=31536000, immutable',
      },
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      return { ok: false, error: `R2 PUT ${response.status} ${detail}`.trim() };
    }

    return { ok: true, key, url: r2PublicUrl(key) || `/storage/${key}` };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'R2 upload failed',
    };
  }
}
