'use client';

import { useState } from 'react';
import { PixelCrop } from 'react-image-crop';
import { toast } from 'sonner';
import { MediaItem } from '../types';

interface SaveEditedImageOptions {
  previewItem: MediaItem | null;
  setPreviewItem: (item: MediaItem | null) => void;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: number;
  sepia: number;
  invert: number;
  completedCrop: PixelCrop | null;
  imgRef: React.RefObject<HTMLImageElement | null>;
}

function extractStoragePath(fileUrl: string, bucket: string = 'product-images'): {
  bucket: string;
  pathInBucket: string;
  r2Key: string;
} {
  try {
    const url = new URL(fileUrl, 'http://localhost');
    const cleanPath = decodeURIComponent(url.pathname).replace(/^\/+/, '');
    
    const supMatch = cleanPath.match(new RegExp(`(?:storage/v1/object/public|storage)/${bucket}/(.+)`));
    if (supMatch) {
      return { bucket, pathInBucket: supMatch[1], r2Key: `${bucket}/${supMatch[1]}` };
    }

    if (cleanPath.startsWith(`${bucket}/`)) {
      const pathInBucket = cleanPath.slice(bucket.length + 1);
      return { bucket, pathInBucket, r2Key: cleanPath };
    }

    const filename = cleanPath.split('/').pop() || 'image.webp';
    return { bucket, pathInBucket: filename, r2Key: `${bucket}/${filename}` };
  } catch {
    const filename = fileUrl.split('/').pop() || 'image.webp';
    return { bucket, pathInBucket: filename, r2Key: `${bucket}/${filename}` };
  }
}

export function useImageEditorSave({
  previewItem,
  setPreviewItem,
  rotation,
  flipH,
  flipV,
  brightness,
  contrast,
  saturation,
  blur,
  grayscale,
  sepia,
  invert,
  completedCrop,
  imgRef,
}: SaveEditedImageOptions) {
  const [isSavingEdits, setIsSavingEdits] = useState(false);

  const saveEditedImage = async (overwrite: boolean) => {
    if (!previewItem) return;
    setIsSavingEdits(true);
    let blobUrlToRevoke: string | null = null;
    
    try {
      const toastId = toast.loading(overwrite ? 'Saving changes in-place...' : 'Saving as new copy...');
      
      // Load image via same-origin download proxy to eliminate cross-origin canvas taint
      let imageSrc = previewItem.file_url;
      try {
        const proxyUrl = `/api/media/download?url=${encodeURIComponent(previewItem.file_url)}`;
        const res = await fetch(proxyUrl);
        if (res.ok) {
          const fetchedBlob = await res.blob();
          blobUrlToRevoke = URL.createObjectURL(fetchedBlob);
          imageSrc = blobUrlToRevoke;
        }
      } catch (proxyErr) {
        console.warn('[Image Editor] Proxy load failed, using direct URL:', proxyErr);
      }
      
      const img = new Image();
      img.crossOrigin = 'anonymous'; 
      img.src = imageSrc;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image for editing. CORS issues might prevent editing external URLs.'));
      });
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      
      const isRotated90or270 = rotation % 180 !== 0;
      const width = isRotated90or270 ? img.height : img.width;
      const height = isRotated90or270 ? img.width : img.height;
      
      canvas.width = width;
      canvas.height = height;
      
      const filterString = [
        `brightness(${brightness}%)`,
        `contrast(${contrast}%)`,
        `saturate(${saturation}%)`,
        `blur(${blur}px)`,
        `grayscale(${grayscale}%)`,
        `sepia(${sepia}%)`,
        `invert(${invert}%)`
      ].join(' ');
      
      ctx.filter = filterString;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      
      let finalCanvas = canvas;
      if (completedCrop && completedCrop.width > 0 && completedCrop.height > 0 && imgRef.current) {
        const cropCanvas = document.createElement('canvas');
        const cropCtx = cropCanvas.getContext('2d');
        if (!cropCtx) throw new Error('Could not get crop canvas context');

        const scaleX = canvas.width / imgRef.current.width;
        const scaleY = canvas.height / imgRef.current.height;

        cropCanvas.width = completedCrop.width * scaleX;
        cropCanvas.height = completedCrop.height * scaleY;

        cropCtx.drawImage(
          canvas,
          completedCrop.x * scaleX,
          completedCrop.y * scaleY,
          completedCrop.width * scaleX,
          completedCrop.height * scaleY,
          0, 0, cropCanvas.width, cropCanvas.height
        );
        finalCanvas = cropCanvas;
      }
      
      const blob: Blob = await new Promise((resolve, reject) => {
        finalCanvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to export edited image from canvas'));
        }, 'image/webp', 0.90);
      });
      
      const timestamp = Date.now();
      const bucketName = previewItem.bucket || 'product-images';
      const baseName = (previewItem.original_filename || previewItem.seo_filename || 'image').replace(/\.[^/.]+$/, '');
      const cleanBaseName = baseName.replace(/[^a-zA-Z0-9-_\s]/g, '').trim().replace(/\s+/g, '-').toLowerCase();

      const formData = new FormData();
      const fileToSend = new File([blob], `${cleanBaseName}.webp`, { type: 'image/webp' });
      formData.append('file', fileToSend);
      formData.append('folder', bucketName);

      if (overwrite) {
        // Save In-place
        formData.append('is_overwrite', 'true');
        const storageInfo = extractStoragePath(previewItem.file_url, bucketName);
        formData.append('exact_key', storageInfo.r2Key);
        formData.append('exact_path', storageInfo.pathInBucket);
        if (previewItem.id && !previewItem.id.startsWith('virtual-')) {
          formData.append('media_id', previewItem.id);
        }
      } else {
        // Save As Copy
        formData.append('is_overwrite', 'false');
        formData.append('custom_name', `${cleanBaseName}-copy-${timestamp}.webp`);
      }

      const res = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Upload failed with status ${res.status}`);
      }

      const result = await res.json();
      const rawNewUrl = result.url;
      // Add timestamp query parameter so the browser preview updates immediately
      const previewUrl = `${rawNewUrl}${rawNewUrl.includes('?') ? '&' : '?'}t=${timestamp}`;

      if (overwrite) {
        setPreviewItem({
          ...previewItem,
          file_url: previewUrl,
          file_size: blob.size,
        });
        toast.dismiss(toastId);
        toast.success('Image updated successfully in-place!');
      } else {
        setPreviewItem({
          ...previewItem,
          id: result.mediaId || previewItem.id,
          file_url: rawNewUrl,
          file_size: blob.size,
          original_filename: `copy-${previewItem.original_filename}`,
          seo_filename: `${cleanBaseName}-copy-${timestamp}.webp`,
        });
        toast.dismiss(toastId);
        toast.success('Image saved as a new copy in Media Library!');
      }
    } catch (err: unknown) {
      console.error('[Image Editor] Failed to save edited image:', err);
      toast.error(`Failed to save image edits: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      if (blobUrlToRevoke) {
        URL.revokeObjectURL(blobUrlToRevoke);
      }
      setIsSavingEdits(false);
    }
  };

  return { isSavingEdits, saveEditedImage };
}
