import 'server-only';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { loadSharp } from '@/lib/platform/sharp-loader';
import { isR2UploadEnabled, uploadObjectToR2 } from '@/lib/platform/r2';

/**
 * SERVER-ONLY image upload pipeline (Sharp → WebP → R2 / Supabase Storage).
 *
 * Why this file exists: the browser must never import `@/lib/supabase/admin`.
 * `lib/uploadImage.ts` is the browser-safe entry point and delegates to API
 * routes; route handlers (Node/Edge) import THIS module instead. Keeping the
 * two paths in separate modules is what stops the service-role client from
 * being bundled into client chunks (RULE F7).
 */

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'mp4', 'mov', 'webm', 'ogg'];

function nameParts(file: File | Blob, customName?: string): { extension: string; originalName: string; sanitizedName: string } {
  let extension = 'webp';
  let originalName = 'image';

  if (file instanceof File) {
    extension = file.name.split('.').pop()?.toLowerCase() || '';
    originalName = file.name.replace(/\.[^/.]+$/, '');
  } else if (customName) {
    extension = customName.split('.').pop()?.toLowerCase() || 'webp';
    originalName = customName.replace(/\.[^/.]+$/, '');
  }

  const sanitizedName = originalName
    .replace(/[^a-zA-Z0-9-_\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();

  return { extension, originalName, sanitizedName };
}

/** Sharp → WebP (no-op when Sharp is unavailable, e.g. Cloudflare Workers). */
async function toWebp(file: File | Blob): Promise<{ blob: File | Blob; extension: string }> {
  const sharp = await loadSharp();
  if (!sharp) {
    console.warn('[uploadImageServer] Sharp unavailable on this runtime; preserving uploaded file');
    return { blob: file, extension: file instanceof File ? (file.name.split('.').pop()?.toLowerCase() || 'webp') : 'webp' };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const webpBuffer = await sharp(Buffer.from(arrayBuffer))
      .rotate()
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80, effort: 4 })
      .toBuffer();
    return { blob: new Blob([new Uint8Array(webpBuffer)], { type: 'image/webp' }), extension: 'webp' };
  } catch (err) {
    const sourceIsWebp = file.type === 'image/webp' || (file instanceof File && file.name.toLowerCase().endsWith('.webp'));
    if (sourceIsWebp) return { blob: file, extension: 'webp' };
    throw new Error('WebP image compression failed: ' + (err instanceof Error ? err.message : String(err)));
  }
}

async function storeObject(
  bucket: string,
  fileName: string,
  blob: File | Blob
): Promise<string> {
  if (isR2UploadEnabled()) {
    const arrayBuffer = await blob.arrayBuffer();
    const r2 = await uploadObjectToR2({
      key: `${bucket}/${fileName}`,
      body: new Uint8Array(arrayBuffer),
      contentType: blob.type || 'image/webp',
    });
    if (!r2.ok) throw new Error(`R2 upload failed: ${r2.error}`);
    return r2.url;
  }

  const { error: uploadError } = await supabaseAdmin.storage
    .from(bucket)
    .upload(fileName, blob, { cacheControl: 'public, max-age=31536000', upsert: false });
  if (uploadError) throw uploadError;

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(fileName);
  if (!data?.publicUrl) throw new Error('Failed to retrieve public URL after upload');
  return data.publicUrl;
}

/**
 * Server-side equivalent of `uploadImage()` — validates, converts to WebP and
 * stores the file, then registers it in `media_library`.
 */
export const uploadImageServer = async (
  file: File | Blob,
  bucket: string,
  customName?: string
): Promise<string> => {
  try {
    const { extension, originalName, sanitizedName } = nameParts(file, customName);
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      throw new Error(`Invalid file format. Allowed formats: ${ALLOWED_EXTENSIONS.join(', ')}`);
    }

    const isVideo = file.type.startsWith('video/') || ['mp4', 'mov', 'webm', 'ogg'].includes(extension);

    let webpFile: File | Blob = file;
    let finalExtension = extension;
    if (!isVideo) {
      const converted = await toWebp(file);
      webpFile = converted.blob;
      finalExtension = converted.extension;
    }

    const fileName = `${sanitizedName}-${Date.now()}.${finalExtension}`;
    const fileUrl = await storeObject(bucket, fileName, webpFile);

    try {
      await supabaseAdmin.from('media_library').insert({
        original_filename: file instanceof File ? file.name : (customName || 'unknown'),
        seo_filename: fileName,
        file_url: fileUrl,
        alt_text: originalName.replace(/-/g, ' '),
        title: originalName.replace(/-/g, ' '),
        bucket,
        ai_generated: false,
        ai_enabled: true,
        file_size: webpFile.size,
        mime_type: webpFile.type || 'image/webp',
      });
    } catch (dbError) {
      console.warn('[uploadImageServer] Error saving to media_library table:', dbError);
    }

    return fileUrl;
  } catch (error: unknown) {
    console.error('[uploadImageServer] Image upload process failed:', error);
    throw new Error(error instanceof Error ? error.message : 'Image upload failed');
  }
};

/**
 * Server-side review-photo upload (compressed → R2/Supabase, no media_library row).
 */
export const uploadReviewImageServer = async (file: File): Promise<string> => {
  try {
    const converted = await toWebp(file);
    const fileName = `review-photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.webp`;
    return await storeObject('product-images', fileName, converted.blob);
  } catch (error: unknown) {
    console.error('[uploadImageServer] Failed to upload review photo:', error);
    throw new Error(error instanceof Error ? error.message : 'Review photo upload failed');
  }
};
