import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { loadSharp } from '@/lib/platform/sharp-loader';

/**
 * Validates, compresses, and uploads an image file to Supabase storage, converting it to WebP.
 * Registers metadata in the media_library table and returns the public URL.
 * Supports both client (browser Canvas) and server (Sharp Node.js) execution.
 * 
 * @param file The image File or Blob to upload
 * @param bucket The Supabase Storage bucket name (e.g., 'product-images')
 * @param customName Optional custom filename for Blobs
 * @returns The public URL of the uploaded image
 */
export const uploadImage = async (file: File | Blob, bucket: string, customName?: string): Promise<string> => {
  try {
    const isBrowser = typeof window !== 'undefined';
    const supabase = isBrowser 
      ? createBrowserClient() 
      : (await import('@/lib/supabase/admin')).supabaseAdmin;

    // 1. Validate file extension
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'mp4', 'mov', 'webm', 'ogg'];
    let fileExtension = 'webp';
    let originalName = 'image';

    if (file instanceof File) {
      fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      originalName = file.name.replace(/\.[^/.]+$/, '');
    } else if (customName) {
      fileExtension = customName.split('.').pop()?.toLowerCase() || 'webp';
      originalName = customName.replace(/\.[^/.]+$/, '');
    }

    if (!allowedExtensions.includes(fileExtension)) {
      throw new Error(`Invalid file format. Allowed formats: ${allowedExtensions.join(', ')}`);
    }

    // 2. Determine if file is a video
    const isVideo = file.type.startsWith('video/') || ['mp4', 'mov', 'webm', 'ogg'].includes(fileExtension);

    // 3. Convert images to WebP
    let webpFile: File | Blob = file;
    const sanitizedName = originalName
      .replace(/[^a-zA-Z0-9-_\s]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .toLowerCase();
    const timestamp = Date.now();

    if (!isVideo) {
      if (isBrowser) {
        // Client-side conversion using imageCompressor fallback chain
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
      } else {
        // Server-side conversion using sharp (MANDATORY WebP)
        try {
          const sharp = await loadSharp();
          if (!sharp) throw new Error('sharp unavailable on this runtime');
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const webpBuffer = await sharp(buffer)
            .rotate()
            .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 80, effort: 4 })
            .toBuffer();
          webpFile = new Blob([new Uint8Array(webpBuffer)], { type: 'image/webp' });
          fileExtension = 'webp';
        } catch (err) {
          console.error('[uploadImage] Server side sharp compression failed:', err);
          throw new Error('WebP image compression failed: ' + (err instanceof Error ? err.message : String(err)));
        }
      }
    }

    // 4. Generate filename
    let webpFileName = `${sanitizedName}-${timestamp}.${fileExtension}`;
    let fileUrl = '';

    // 5. If R2 is enabled on server, upload directly to Cloudflare R2 (RULE S10)
    if (!isBrowser) {
      try {
        const { isR2Enabled, uploadToR2 } = await import('@/lib/storage/r2');
        if (isR2Enabled()) {
          const arrayBuffer = await webpFile.arrayBuffer();
          const r2Key = `${bucket}/${webpFileName}`;
          const r2Result = await uploadToR2({
            buffer: Buffer.from(arrayBuffer),
            fileName: r2Key,
            contentType: webpFile.type || 'image/webp',
          });
          fileUrl = r2Result.url;
        }
      } catch (r2Err) {
        console.warn('[uploadImage] R2 upload failed or unconfigured, falling back to Supabase:', r2Err);
      }
    }

    // Fallback: Upload to Supabase Storage if fileUrl was not set by R2
    if (!fileUrl) {
      const { data: existingFiles, error: listError } = await supabase.storage
        .from(bucket)
        .list('', { search: webpFileName });

      if (listError) {
        console.warn('[uploadImage] Error checking file existence, continuing:', listError);
      }

      const exists = existingFiles?.some(f => f.name === webpFileName);
      if (exists) {
        webpFileName = `${sanitizedName}-${timestamp}-2.${fileExtension}`;
      }

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(webpFileName, webpFile, {
          cacheControl: 'public, max-age=31536000',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(webpFileName);

      if (!data?.publicUrl) {
        throw new Error('Failed to retrieve public URL after upload');
      }

      fileUrl = data.publicUrl;
    }

    if (isBrowser) {
      // Browser delegates to /api/upload-image to ensure R2 routing, secrets protection, and strict WebP
      const formData = new FormData();
      const sendFile = file instanceof File ? file : new File([file], `${sanitizedName}.${fileExtension}`, { type: file.type || 'image/webp' });
      formData.append('file', sendFile);
      formData.append('folder', bucket);
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Upload failed with status ${res.status}`);
      }
      const data = await res.json();
      return data.url;
    }

    // 5. Upload file (R2 primary under S5; Supabase fallback under legacy mode B)
    const { isR2UploadEnabled, uploadObjectToR2 } = await import('@/lib/platform/r2');
    if (isR2UploadEnabled()) {
      const arrayBuffer = await webpFile.arrayBuffer();
      const r2 = await uploadObjectToR2({
        key: `${bucket}/${webpFileName}`,
        body: new Uint8Array(arrayBuffer),
        contentType: webpFile.type || 'image/webp',
      });
      if (!r2.ok) {
        throw new Error(`R2 upload failed: ${r2.error}`);
      }
      const fileUrl = r2.url;

      // Register in media_library (DB only)
      try {
        await supabase
          .from('media_library')
          .insert({
            original_filename: file instanceof File ? file.name : (customName || 'unknown'),
            seo_filename: webpFileName,
            file_url: fileUrl,
            alt_text: originalName.replace(/-/g, ' '),
            title: originalName.replace(/-/g, ' '),
            bucket: bucket,
            ai_generated: false,
            ai_enabled: true,
            file_size: webpFile.size,
            mime_type: webpFile.type || 'image/webp'
          });
      } catch (dbError) {
        console.warn('[uploadImage] Error saving to media_library table:', dbError);
      }

      return fileUrl;
    }

    // Mode B Legacy Vercel mode: Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(webpFileName, webpFile, {
        cacheControl: 'public, max-age=31536000',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // 6. Get public URL
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(webpFileName);

    if (!data?.publicUrl) {
      throw new Error('Failed to retrieve public URL after upload');
    }

    fileUrl = data.publicUrl;

    // 7. Save to media_library table
    const { error: dbError } = await supabase
      .from('media_library')
      .insert({
        original_filename: file instanceof File ? file.name : (customName || 'unknown'),
        seo_filename: webpFileName,
        file_url: fileUrl,
        alt_text: originalName.replace(/-/g, ' '),
        title: originalName.replace(/-/g, ' '),
        bucket: bucket,
        ai_generated: false,
        ai_enabled: true,
        file_size: webpFile.size,
        mime_type: webpFile.type || 'image/webp'
      });

    if (dbError) {
      console.warn('[uploadImage] Error saving to media_library table:', dbError);
    }

    return fileUrl;
  } catch (error: unknown) {
    console.error('[uploadImage] Image upload process failed:', error);
    throw new Error(error instanceof Error ? error.message : 'Image upload failed');
  }
};

/**
 * Specifically uploads customer review photos.
 * Compresses image client-side to WebP <= 20 KB (Judge.me style).
 * Uploads directly to Supabase storage without adding to product media_library table.
 */
export const uploadReviewImage = async (file: File): Promise<string> => {
  try {
    const isBrowser = typeof window !== 'undefined';

    // 1. Client-side compression to WebP under 50 KB
    let webpFile: File | Blob = file;
    if (isBrowser) {
      const { compressImage } = await import('@/lib/utils/imageCompressor');
      try {
        webpFile = await compressImage(file, 50);
      } catch (err) {
        console.warn('[uploadReviewImage] Compression fallback used:', err);
      }
    }

    // 2. Upload via Server API route (uses service role key -> 100% reliable, zero RLS issues)
    if (isBrowser) {
      try {
        const formData = new FormData();
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-]/g, '');
        formData.append('file', webpFile, `${cleanName}.webp`);
        formData.append('bucket', 'product-images');
        formData.append('skipMediaLibrary', 'true');

        const res = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const json = await res.json();
          if (json.url) return json.url;
        }
      } catch (e) {
        console.warn('[uploadReviewImage] API upload failed, falling back to client SDK:', e);
      }
    }

    const supabase = isBrowser 
      ? createBrowserClient() 
      : (await import('@/lib/supabase/admin')).supabaseAdmin;

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 7);
    const fileName = `review-photo-${timestamp}-${randomStr}.webp`;

    const { isR2UploadEnabled, uploadObjectToR2 } = await import('@/lib/platform/r2');
    if (isR2UploadEnabled()) {
      const arrayBuffer = await webpFile.arrayBuffer();
      const r2 = await uploadObjectToR2({
        key: `product-images/${fileName}`,
        body: new Uint8Array(arrayBuffer),
        contentType: 'image/webp',
      });
      if (!r2.ok) {
        throw new Error(`R2 upload failed: ${r2.error}`);
      }
      return r2.url;
    }

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, webpFile, {
        cacheControl: 'public, max-age=31536000',
        contentType: 'image/webp',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    if (!data?.publicUrl) {
      throw new Error('Failed to retrieve public URL for review photo');
    }

    return data.publicUrl;
  } catch (error: unknown) {
    console.error('[uploadReviewImage] Failed to upload review photo:', error);
    throw new Error(error instanceof Error ? error.message : 'Review photo upload failed');
  }
};
