/**
 * POST /api/upload-image
 *
 * Server-side image upload.
 *
 * Runtime strategy:
 *  - Node (Vercel/local): Sharp converts any format (incl. HEIC) → WebP < 50KB.
 *  - Edge (Cloudflare Workers): Sharp is unavailable, so the original file is
 *    stored unchanged. This keeps the Worker bundle buildable; compression at
 *    the edge is a follow-up (Cloudflare Image Resizing).
 *
 * Storage: R2 when enabled, Supabase otherwise (fallback keeps uploads alive).
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { createClient } from '@supabase/supabase-js';
import { isR2UploadEnabled, uploadObjectToR2 } from '@/lib/platform/r2';
import { loadSharp } from '@/lib/platform/sharp-loader';

const MAX_KB = 50;
const MAX_DIM = 1200;

function extensionOf(fileName: string, fallback = 'bin'): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  return ext && ext !== fileName ? ext : fallback;
}

export async function POST(request: NextRequest) {
  const _denied = await requireAdmin(request);
  if (_denied) return _denied;

  // Initialize inside handler so env vars are read at runtime, not at build time
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: 'Storage is not configured (Supabase env missing)' },
      { status: 500 }
    );
  }
  const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'uploads';
    const type = formData.get('type') as string | null;
    const isOverwrite = formData.get('is_overwrite') === 'true' || formData.get('overwrite') === 'true';
    const exactKey = ((formData.get('exact_key') as string | null) || (formData.get('exact_path') as string | null))?.trim();
    const customName = (formData.get('custom_name') as string | null)?.trim();
    const mediaId = (formData.get('media_id') as string | null)?.trim();

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);
    const isFavicon = type === 'favicon';
    const isVideo =
      file.type.startsWith('video/') ||
      /\.(mp4|mov|webm|m4v|avi|mkv|ogv)$/i.test(file.name);

    const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9_\-]/gi, '_');
    const stamp = Date.now();

    let outputBuffer: Buffer = inputBuffer;
    let outputFormat = extensionOf(file.name);
    let contentType = file.type || 'application/octet-stream';
    let processed = false;

    if (!isVideo) {
      const sharp = await loadSharp();

      if (sharp) {
        // ---- Node path: Sharp conversion (HEIC/HEIF supported via libvips) ----
        const meta = await sharp(inputBuffer, { failOnError: false }).metadata();
        const origW = meta.width ?? 800;
        const origH = meta.height ?? 800;

        const targetMaxDim = isFavicon ? 128 : MAX_DIM;
        let targetW = origW;
        let targetH = origH;
        if (targetW > targetMaxDim || targetH > targetMaxDim) {
          if (targetW >= targetH) {
            targetH = Math.round((targetH * targetMaxDim) / targetW);
            targetW = targetMaxDim;
          } else {
            targetW = Math.round((targetW * targetMaxDim) / targetH);
            targetH = targetMaxDim;
          }
        }

        outputFormat = isFavicon ? 'png' : 'webp';
        contentType = isFavicon ? 'image/png' : 'image/webp';

        // Iterative quality reduction to hit < MAX_KB
        let quality = 85;
        let converted: Buffer | null = null;

        for (let pass = 0; pass < 8; pass++) {
          const passW =
            pass >= 3
              ? Math.max(isFavicon ? 16 : 80, Math.round(targetW * Math.pow(0.8, pass - 2)))
              : targetW;
          const passH =
            pass >= 3
              ? Math.max(isFavicon ? 16 : 80, Math.round(targetH * Math.pow(0.8, pass - 2)))
              : targetH;

          const pipe = sharp(inputBuffer, { failOnError: false })
            .rotate() // auto-rotate from EXIF
            .resize(passW, passH, { fit: 'inside', withoutEnlargement: true });

          converted = isFavicon
            ? await pipe.png({ compressionLevel: 9 }).toBuffer()
            : await pipe.webp({ quality, effort: 4 }).toBuffer();

          if (converted.length / 1024 <= MAX_KB) break;
          quality = Math.max(10, quality - 12);
        }

        if (!converted) {
          return NextResponse.json({ error: 'Conversion failed' }, { status: 500 });
        }

        outputBuffer = converted;
        processed = true;
      } else {
        // ---- Edge path: store the original bytes (no native codecs) ----
        console.warn(
          `[api/upload-image] sharp unavailable on this runtime — storing original (${file.name})`
        );
      }
    }

    let fileName: string;
    let r2StorageKey: string;
    let supabaseStoragePath: string;

    if (isOverwrite && exactKey) {
      // IN-PLACE OVERWRITE: keep exact same storage key
      const cleanKey = exactKey.replace(/^\/+/, '');
      if (cleanKey.startsWith('product-images/')) {
        r2StorageKey = cleanKey;
        supabaseStoragePath = cleanKey.slice('product-images/'.length);
      } else {
        r2StorageKey = `product-images/${cleanKey}`;
        supabaseStoragePath = cleanKey;
      }
      fileName = supabaseStoragePath;
    } else {
      // NEW UPLOAD OR SAVE AS COPY
      const nameToUse = customName 
        ? customName.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9_\-]/gi, '_')
        : baseName;
      const resolvedBase = customName ? nameToUse : `${nameToUse}_${stamp}`;
      const rawPath = folder ? `${folder}/${resolvedBase}.${outputFormat}` : `${resolvedBase}.${outputFormat}`;
      fileName = rawPath.replace(/^\/+/, '').replace(/\/+/g, '/');
      r2StorageKey = `product-images/${fileName}`;
      supabaseStoragePath = fileName;
    }

    // R2 first (when enabled). Under S5 mode, Supabase Storage is strictly BANNED.
    if (isR2UploadEnabled()) {
      const r2 = await uploadObjectToR2({
        key: r2StorageKey,
        body: new Uint8Array(outputBuffer),
        contentType,
        cacheControl: isOverwrite ? 'public, max-age=3600, must-revalidate' : 'public, max-age=31536000, immutable',
      });
      if (r2.ok) {
        const finalSizeKb = Math.round(outputBuffer.length / 1024);
        console.log(`[api/upload-image] ✓ →R2 (${isOverwrite ? 'IN-PLACE' : 'COPY'}): ${file.name} → ${r2.key} (${finalSizeKb} KB)`);

        let mediaRecordId = mediaId || null;
        if (isOverwrite) {
          // Update existing row in place (NO duplicate row!)
          if (mediaId && !mediaId.startsWith('virtual-')) {
            try {
              await supabaseAdmin.from('media_library').update({
                file_size: outputBuffer.length,
                file_url: r2.url,
                mime_type: contentType,
                updated_at: new Date().toISOString(),
              }).eq('id', mediaId);
            } catch (dbErr) {
              console.warn('[api/upload-image] Media library in-place update notice:', dbErr);
            }
          }
        } else {
          // Register in media_library as a new copy
          try {
            const { data: newRow } = await supabaseAdmin.from('media_library').insert({
              original_filename: file.name,
              seo_filename: fileName.split('/').pop() || fileName,
              file_url: r2.url,
              alt_text: (customName || baseName).replace(/[-_]/g, ' '),
              title: (customName || baseName).replace(/[-_]/g, ' '),
              bucket: 'product-images',
              ai_generated: false,
              ai_enabled: true,
              file_size: outputBuffer.length,
              mime_type: contentType,
            }).select('id').single();
            if (newRow?.id) mediaRecordId = newRow.id;
          } catch (dbErr) {
            console.warn('[api/upload-image] Media library copy insert notice:', dbErr);
          }
        }

        return NextResponse.json({
          url: r2.url,
          sizeKb: finalSizeKb,
          format: outputFormat,
          storage: 'r2',
          processed,
          mediaId: mediaRecordId,
        });
      }

      // RULE S10: Strict S5 Storage Ban — NEVER silently fall back to Supabase Storage!
      console.error('[api/upload-image] R2 upload failed in S5 mode:', r2.error);
      return NextResponse.json(
        { error: `R2 upload failed: ${r2.error || 'Unknown R2 error'}` },
        { status: 500 }
      );
    }

    // Mode B (Legacy Vercel Free Mode only): Fallback to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('product-images')
      .upload(supabaseStoragePath, outputBuffer, { contentType, upsert: true });

    if (uploadError) {
      console.error('[api/upload-image] Supabase upload failed:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data } = supabaseAdmin.storage.from('product-images').getPublicUrl(supabaseStoragePath);
    const finalSizeKb = Math.round(outputBuffer.length / 1024);
    console.log(`[api/upload-image] ✓ →Supabase (${isOverwrite ? 'IN-PLACE' : 'COPY'}): ${file.name} → ${supabaseStoragePath} (${finalSizeKb} KB)`);

    let mediaRecordId = mediaId || null;
    if (isOverwrite) {
      if (mediaId && !mediaId.startsWith('virtual-')) {
        try {
          await supabaseAdmin.from('media_library').update({
            file_size: outputBuffer.length,
            file_url: data.publicUrl,
            mime_type: contentType,
            updated_at: new Date().toISOString(),
          }).eq('id', mediaId);
        } catch (dbErr) {
          console.warn('[api/upload-image] Media library in-place update notice:', dbErr);
        }
      }
    } else {
      try {
        const { data: newRow } = await supabaseAdmin.from('media_library').insert({
          original_filename: file.name,
          seo_filename: fileName.split('/').pop() || fileName,
          file_url: data.publicUrl,
          alt_text: (customName || baseName).replace(/[-_]/g, ' '),
          title: (customName || baseName).replace(/[-_]/g, ' '),
          bucket: 'product-images',
          ai_generated: false,
          ai_enabled: true,
          file_size: outputBuffer.length,
          mime_type: contentType,
        }).select('id').single();
        if (newRow?.id) mediaRecordId = newRow.id;
      } catch (dbErr) {
        console.warn('[api/upload-image] Media library copy insert notice:', dbErr);
      }
    }

    return NextResponse.json({
      url: data.publicUrl,
      sizeKb: finalSizeKb,
      format: outputFormat,
      storage: 'supabase',
      processed,
      mediaId: mediaRecordId,
    });
  } catch (err) {
    console.error('[api/upload-image] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upload failed' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const maxDuration = 60;
