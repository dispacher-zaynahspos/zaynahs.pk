import { createClient as createBrowserClient } from '@/lib/supabase/client';

/**
 * BROWSER upload entry point (client-safe — never imports the service-role client).
 *
 * Server/route-handler code must use `lib/uploadImageServer.ts` instead.
 * Keeping the two paths apart prevents `@/lib/supabase/admin` from being
 * bundled into client chunks (duplicate GoTrueClient / RULE F7).
 */

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'mp4', 'mov', 'webm', 'ogg'];

/**
 * Validates, compresses (WebP) and uploads an image through `/api/upload-image`
 * so R2 routing, secrets and strict WebP enforcement stay server-side.
 *
 * @param file The image File or Blob to upload
 * @param bucket Target folder/bucket (e.g. `product-images`)
 * @param customName Optional custom filename for Blobs
 * @returns The public URL of the uploaded image
 */
export const uploadImage = async (file: File | Blob, bucket: string, customName?: string): Promise<string> => {
  try {
    if (typeof window === 'undefined') {
      throw new Error('uploadImage() is browser-only — use uploadImageServer() on the server');
    }

    let fileExtension = 'webp';
    let originalName = 'image';

    if (file instanceof File) {
      fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      originalName = file.name.replace(/\.[^/.]+$/, '');
    } else if (customName) {
      fileExtension = customName.split('.').pop()?.toLowerCase() || 'webp';
      originalName = customName.replace(/\.[^/.]+$/, '');
    }

    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      throw new Error(`Invalid file format. Allowed formats: ${ALLOWED_EXTENSIONS.join(', ')}`);
    }

    const isVideo = file.type.startsWith('video/') || ['mp4', 'mov', 'webm', 'ogg'].includes(fileExtension);

    let webpFile: File | Blob = file;
    const sanitizedName = originalName
      .replace(/[^a-zA-Z0-9-_\s]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .toLowerCase();

    if (!isVideo) {
      const { compressImage } = await import('@/lib/utils/imageCompressor');
      const fileToCompress = file instanceof File
        ? file
        : new File([file], `${sanitizedName}.${fileExtension}`, { type: file.type });

      try {
        webpFile = await compressImage(fileToCompress, 200);
        fileExtension = 'webp';
      } catch (err) {
        console.warn('[uploadImage] Client side compression failed, using original:', err);
        webpFile = fileToCompress;
      }
    }

    const formData = new FormData();
    const sendFile = webpFile instanceof File
      ? webpFile
      : new File([webpFile], `${sanitizedName}.${fileExtension}`, { type: webpFile.type || 'image/webp' });
    formData.append('file', sendFile);
    formData.append('folder', bucket);

    const res = await fetch('/api/upload-image', { method: 'POST', body: formData });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `Upload failed with status ${res.status}`);
    }
    const data = await res.json();
    return data.url;
  } catch (error: unknown) {
    console.error('[uploadImage] Image upload process failed:', error);
    throw new Error(error instanceof Error ? error.message : 'Image upload failed');
  }
};

/**
 * Customer review photos — compressed client-side to WebP ≤ 50 KB, then
 * uploaded through `/api/media/upload` (service role, no RLS issues) with a
 * direct browser-SDK fallback.
 */
export const uploadReviewImage = async (file: File): Promise<string> => {
  try {
    if (typeof window === 'undefined') {
      throw new Error('uploadReviewImage() is browser-only — use uploadReviewImageServer() on the server');
    }

    let webpFile: File | Blob = file;
    const { compressImage } = await import('@/lib/utils/imageCompressor');
    try {
      webpFile = await compressImage(file, 50);
    } catch (err) {
      console.warn('[uploadReviewImage] Compression fallback used:', err);
    }

    try {
      const formData = new FormData();
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-]/g, '');
      formData.append('file', webpFile, `${cleanName}.webp`);
      formData.append('bucket', 'product-images');
      formData.append('skipMediaLibrary', 'true');

      const res = await fetch('/api/media/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const json = await res.json();
        if (json.url) return json.url;
      }
    } catch (e) {
      console.warn('[uploadReviewImage] API upload failed, falling back to client SDK:', e);
    }

    const supabase = createBrowserClient();
    const fileName = `review-photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.webp`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, webpFile, {
        cacheControl: 'public, max-age=31536000',
        contentType: 'image/webp',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
    if (!data?.publicUrl) throw new Error('Failed to retrieve public URL for review photo');
    return data.publicUrl;
  } catch (error: unknown) {
    console.error('[uploadReviewImage] Failed to upload review photo:', error);
    throw new Error(error instanceof Error ? error.message : 'Review photo upload failed');
  }
};
