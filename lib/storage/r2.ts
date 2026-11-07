import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

let s3ClientInstance: S3Client | null = null;

export function getR2Client(): S3Client | null {
  if (s3ClientInstance) return s3ClientInstance;

  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const accountId = process.env.R2_ACCOUNT_ID || process.env.CF_ACCOUNT_ID;
  const endpoint = process.env.R2_ENDPOINT || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);

  if (!accessKeyId || !secretAccessKey || !endpoint) {
    return null;
  }

  s3ClientInstance = new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return s3ClientInstance;
}

export function isR2Enabled(): boolean {
  return Boolean(
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    (process.env.R2_IMAGES_BUCKET || process.env.R2_BUCKET)
  );
}

export interface R2UploadResult {
  url: string;
  key: string;
  sizeKb: number;
  format: string;
}

/**
 * Uploads a buffer directly to Cloudflare R2 with 1-year immutable edge cache headers.
 * Resolves the public URL to https://img.<domain>/<key>.
 */
export async function uploadToR2(params: {
  buffer: Buffer | Uint8Array;
  fileName: string;
  contentType: string;
  bucket?: string;
}): Promise<R2UploadResult> {
  const s3 = getR2Client();
  if (!s3) {
    throw new Error('[R2] S3 Client cannot be initialized — missing R2 credentials');
  }

  const bucket = params.bucket || process.env.R2_IMAGES_BUCKET || 'totvogue-images';
  const cleanKey = params.fileName.replace(/^\/+/, '');

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: cleanKey,
      Body: params.buffer,
      ContentType: params.contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );

  let publicBase = process.env.R2_PUBLIC_BASE;
  if (!publicBase) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.totvogue.pk';
    try {
      const hostname = new URL(siteUrl).hostname.replace(/^www\./, '');
      publicBase = `https://img.${hostname}`;
    } catch {
      publicBase = 'https://img.totvogue.pk';
    }
  }

  const publicUrl = `${publicBase.replace(/\/+$/, '')}/${cleanKey}`;
  const sizeKb = Math.round(params.buffer.length / 1024);

  return {
    url: publicUrl,
    key: cleanKey,
    sizeKb,
    format: params.contentType.split('/').pop() || 'webp',
  };
}
