import { supabaseAdmin } from '@/lib/supabase/admin';
import { isOwnStorageUrl } from '@/lib/services/storage';
import { isR2UploadEnabled, uploadObjectToR2 } from '@/lib/platform/r2';
import { loadSharp } from '@/lib/platform/sharp-loader';

const IMAGE_FETCH_TIMEOUT_MS = 15000;

interface ImportImage {
  originalUrl?: string;
  fileName?: string;
  alt?: string;
  title?: string;
  description?: string;
  caption?: string;
  aiGenerated?: boolean;
  aiEnabled?: boolean;
  fileSize?: number;
  mimeType?: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

interface ImportVariant {
  imageUrl?: string;
  color?: string;
  size?: string;
  material?: string;
  customOption?: string;
  customValue?: string;
  colorHex?: string;
  price?: number;
  comparePrice?: number;
  stock?: number;
  sku?: string;
  showImageSwatch?: boolean;
  active?: boolean;
  sortOrder?: number;
  aiGenerated?: boolean;
  aiEnabled?: boolean;
}

export async function fetchWithTimeout(url: string, timeoutMs: number = IMAGE_FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Uploads an image buffer to the active storage provider (R2 on Mode A, Supabase Storage on Mode B).
 * Respects RULE S10 and RULE DUAL-TARGET.
 */
export async function uploadImportedMedia(
  filePath: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  if (isR2UploadEnabled()) {
    const key = `product-images/${filePath.replace(/^\/+/, '')}`;
    const r2Result = await uploadObjectToR2({
      key,
      body: new Uint8Array(buffer),
      contentType,
      cacheControl: 'public, max-age=31536000, immutable',
    });
    if (!r2Result.ok) {
      throw new Error(`R2 upload failed during catalog import: ${r2Result.error}`);
    }
    return r2Result.url;
  }

  // Mode B (Legacy Vercel Free Mode only): Supabase Storage product-images bucket
  const { error: uploadError } = await supabaseAdmin.storage
    .from('product-images')
    .upload(filePath, buffer, {
      contentType,
      cacheControl: 'public, max-age=31536000',
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Supabase storage upload failed during catalog import: ${uploadError.message}`);
  }

  const { data: pubUrlData } = supabaseAdmin.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return pubUrlData.publicUrl;
}

/**
 * Ensures buffer is WebP if Sharp is available and input is not already WebP.
 */
export async function ensureWebPBuffer(
  buffer: Buffer,
  mimeType: string
): Promise<{ buffer: Buffer; mimeType: string; extension: string }> {
  let finalBuffer = buffer;
  let finalMime = mimeType;
  let ext = mimeType.split('/').pop()?.toLowerCase() || 'webp';
  if (ext === 'jpeg') ext = 'jpg';

  if (!mimeType.includes('webp')) {
    try {
      const sharp = await loadSharp();
      if (sharp) {
        finalBuffer = await sharp(buffer, { failOnError: false })
          .rotate()
          .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80, effort: 4 })
          .toBuffer();
        finalMime = 'image/webp';
        ext = 'webp';
      }
    } catch (sharpErr) {
      console.warn('[Import API] Sharp conversion to WebP failed, preserving original format:', sharpErr);
    }
  }

  return { buffer: finalBuffer, mimeType: finalMime, extension: ext };
}

/**
 * Processes category image URL for catalog import.
 * If external, downloads and uploads to target store's own active storage (R2 or Supabase).
 */
export async function processCategoryImageUrl(
  url?: string | null,
  slug?: string
): Promise<string | null> {
  if (!url) return null;
  if (isOwnStorageUrl(url)) return url;

  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) return url;
    const arrayBuffer = await res.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);
    const rawMime = res.headers.get('content-type') || 'image/webp';
    const { buffer, mimeType, extension } = await ensureWebPBuffer(rawBuffer, rawMime);
    const fileName = `categories/${slug || 'category'}-${Date.now()}.${extension}`;
    return await uploadImportedMedia(fileName, buffer, mimeType);
  } catch (err) {
    console.warn('[Import API] Failed to download category image, falling back to original URL:', err);
    return url;
  }
}

export async function processProductImages(
  productId: string,
  finalName: string,
  slug: string,
  images: ImportImage[]
): Promise<Record<string, string>> {
  const uploadedUrlsMap: Record<string, string> = {};

  for (let i = 0; i < (images || []).length; i++) {
    const img = images[i];
    try {
      let publicUrl = '';

      if (img.originalUrl && isOwnStorageUrl(img.originalUrl)) {
        publicUrl = img.originalUrl;

        const { data: existingMedia } = await supabaseAdmin
          .from('media_library')
          .select('id')
          .eq('file_url', publicUrl)
          .maybeSingle();

        if (!existingMedia) {
          await supabaseAdmin
            .from('media_library')
            .insert({
              original_filename: img.fileName || `${slug}-${i}.webp`,
              file_url: publicUrl,
              alt_text: img.alt || finalName,
              title: img.title || finalName,
              description: img.description || '',
              caption: img.caption || '',
              bucket: 'product-images',
              ai_generated: img.aiGenerated || false,
              ai_enabled: img.aiEnabled ?? true,
              file_size: img.fileSize || 0,
              mime_type: img.mimeType || 'image/webp'
            });
        }
      } else if (img.originalUrl) {
        const imageRes = await fetchWithTimeout(img.originalUrl);
        if (!imageRes.ok) throw new Error('Failed to fetch image from URL');

        const arrayBuffer = await imageRes.arrayBuffer();
        const rawBuffer = Buffer.from(arrayBuffer);
        const rawMime = imageRes.headers.get('content-type') || 'image/webp';

        const { buffer, mimeType, extension } = await ensureWebPBuffer(rawBuffer, rawMime);

        const sanitizedProdName = finalName
          .replace(/[^a-zA-Z0-9-_\s]/g, '')
          .trim()
          .replace(/\s+/g, '-')
          .toLowerCase();
        const timestamp = Date.now();
        const fileName = `products/${productId}/${sanitizedProdName}-${timestamp}-${i}.${extension}`;

        // Upload to active storage (R2 on Mode A, Supabase on Mode B)
        publicUrl = await uploadImportedMedia(fileName, buffer, mimeType);

        await supabaseAdmin
          .from('media_library')
          .insert({
            original_filename: img.fileName || `${sanitizedProdName}-${i}.${extension}`,
            seo_filename: fileName.split('/').pop(),
            file_url: publicUrl,
            alt_text: img.alt || finalName,
            title: img.title || finalName,
            description: img.description || '',
            caption: img.caption || '',
            bucket: 'product-images',
            ai_generated: img.aiGenerated || false,
            ai_enabled: img.aiEnabled ?? true,
            file_size: buffer.length,
            mime_type: mimeType
          });
      } else {
        continue;
      }

      if (img.originalUrl) {
        uploadedUrlsMap[img.originalUrl] = publicUrl;
      }

      await supabaseAdmin
        .from('product_images')
        .insert({
          product_id: productId,
          url: publicUrl,
          alt: img.alt || finalName,
          sort_order: img.sortOrder || 0,
          is_primary: img.isPrimary || false
        });
    } catch (imgErr) {
      console.error(`[Import API] Failed to process image ${i} for ${finalName}:`, imgErr);
    }
  }

  return uploadedUrlsMap;
}

export async function processProductVariants(
  productId: string,
  finalName: string,
  slug: string,
  variants: ImportVariant[],
  uploadedUrlsMap: Record<string, string>
) {
  for (const v of (variants || [])) {
    let varImageUrl = v.imageUrl || null;

    if (v.imageUrl && uploadedUrlsMap[v.imageUrl]) {
      // Re-use already downloaded and uploaded URL from product images
      varImageUrl = uploadedUrlsMap[v.imageUrl];
    } else if (v.imageUrl && isOwnStorageUrl(v.imageUrl)) {
      varImageUrl = v.imageUrl;

      const { data: existingMedia } = await supabaseAdmin
        .from('media_library')
        .select('id')
        .eq('file_url', varImageUrl)
        .maybeSingle();

      if (!existingMedia) {
        const optString = [v.color, v.size, v.material].filter(Boolean).join('-') || 'var';
        await supabaseAdmin
          .from('media_library')
          .insert({
            original_filename: `${slug}-variant-${optString}.webp`,
            file_url: varImageUrl,
            alt_text: `${finalName} Variant`,
            title: `${finalName} Variant`,
            bucket: 'product-images',
            ai_generated: v.aiGenerated || false,
            ai_enabled: v.aiEnabled ?? true,
            file_size: 0,
            mime_type: 'image/webp'
          });
      }
    } else if (v.imageUrl) {
      try {
        const varImgRes = await fetchWithTimeout(v.imageUrl);
        if (varImgRes.ok) {
          const arrayBuffer = await varImgRes.arrayBuffer();
          const rawBuffer = Buffer.from(arrayBuffer);
          const rawMime = varImgRes.headers.get('content-type') || 'image/webp';

          const { buffer, mimeType, extension } = await ensureWebPBuffer(rawBuffer, rawMime);

          const timestamp = Date.now();
          const optString = [v.color, v.size, v.material].filter(Boolean).join('-') || 'var';
          const fileName = `products/${productId}/variants/${optString}-${timestamp}.${extension}`;

          // Upload to active storage (R2 on Mode A, Supabase on Mode B)
          varImageUrl = await uploadImportedMedia(fileName, buffer, mimeType);

          await supabaseAdmin
            .from('media_library')
            .insert({
              original_filename: `${slug}-variant-${optString}.${extension}`,
              seo_filename: fileName.split('/').pop(),
              file_url: varImageUrl,
              alt_text: `${finalName} Variant`,
              title: `${finalName} Variant`,
              bucket: 'product-images',
              ai_generated: v.aiGenerated || false,
              ai_enabled: v.aiEnabled ?? true,
              file_size: buffer.length,
              mime_type: mimeType
            });
        }
      } catch (varImgErr) {
        console.error(`[Import API] Failed to upload variant image for ${finalName}:`, varImgErr);
      }
    }

    await supabaseAdmin
      .from('product_variants')
      .insert({
        product_id: productId,
        color: v.color || null,
        size: v.size || null,
        material: v.material || null,
        custom_option: v.customOption || null,
        custom_value: v.customValue || null,
        color_hex: v.colorHex || null,
        price: v.price || null,
        compare_price: v.comparePrice || null,
        stock: v.stock || 0,
        sku: v.sku || null,
        image_url: varImageUrl,
        show_image_swatch: v.showImageSwatch || false,
        active: v.active ?? true,
        sort_order: v.sortOrder || 0
      });
  }
}
