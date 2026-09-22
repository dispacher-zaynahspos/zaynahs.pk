import { supabaseAdmin } from '@/lib/supabase/admin';
import { isOwnStorageUrl } from '@/lib/services/storage';

const IMAGE_FETCH_TIMEOUT_MS = 15000;

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

export async function processProductImages(
  productId: string,
  finalName: string,
  slug: string,
  images: any[]
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
        const buffer = Buffer.from(arrayBuffer);

        const mimeType = imageRes.headers.get('content-type') || 'image/webp';
        const sanitizedProdName = finalName
          .replace(/[^a-zA-Z0-9-_\s]/g, '')
          .trim()
          .replace(/\s+/g, '-')
          .toLowerCase();
        const timestamp = Date.now();
        const extension = mimeType.split('/').pop() || 'webp';
        const fileName = `products/${productId}/${sanitizedProdName}-${timestamp}-${i}.${extension}`;

        const { error: uploadError } = await supabaseAdmin.storage
          .from('product-images')
          .upload(fileName, buffer, {
            contentType: mimeType,
            cacheControl: 'public, max-age=31536000',
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: pubUrlData } = supabaseAdmin.storage
          .from('product-images')
          .getPublicUrl(fileName);
        publicUrl = pubUrlData.publicUrl;

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
            file_size: img.fileSize || buffer.length,
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
  variants: any[],
  uploadedUrlsMap: Record<string, string>
) {
  for (const v of (variants || [])) {
    let varImageUrl = v.imageUrl || null;

    if (v.imageUrl && uploadedUrlsMap[v.imageUrl]) {
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
          const buffer = Buffer.from(arrayBuffer);
          const mimeType = varImgRes.headers.get('content-type') || 'image/webp';

          const varExtension = mimeType.split('/').pop() || 'webp';
          const timestamp = Date.now();
          const optString = [v.color, v.size, v.material].filter(Boolean).join('-') || 'var';
          const fileName = `products/${productId}/variants/${optString}-${timestamp}.${varExtension}`;

          const { error: uploadError } = await supabaseAdmin.storage
            .from('product-images')
            .upload(fileName, buffer, {
              contentType: mimeType,
              cacheControl: 'public, max-age=31536000',
              upsert: true
            });

          if (uploadError) throw uploadError;

          const { data: pubUrlData } = supabaseAdmin.storage
            .from('product-images')
            .getPublicUrl(fileName);
          varImageUrl = pubUrlData.publicUrl;

          await supabaseAdmin
            .from('media_library')
            .insert({
              original_filename: `${slug}-variant-${optString}.${varExtension}`,
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
