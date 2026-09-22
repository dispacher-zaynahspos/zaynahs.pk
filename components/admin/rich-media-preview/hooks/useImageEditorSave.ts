'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
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
    
    try {
      const toastId = toast.loading(overwrite ? 'Saving changes in-place...' : 'Saving as new copy...');
      
      const img = new Image();
      img.crossOrigin = 'anonymous'; 
      img.src = previewItem.file_url;
      
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
      
      const supabase = createClient();
      const timestamp = Date.now();
      const bucketName = previewItem.bucket || 'product-images';
      
      if (overwrite) {
        const pathParts = previewItem.file_url.split(`/storage/v1/object/public/${bucketName}/`);
        const fullFilePath = pathParts[1] ? decodeURIComponent(pathParts[1]) : previewItem.seo_filename;
        const filePath = fullFilePath.split('?')[0]; 
        
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, blob, { cacheControl: 'public, max-age=31536000', upsert: true });
          
        if (uploadError) throw uploadError;
        
        const baseUrl = previewItem.file_url.split('?')[0];
        const newFileUrl = `${baseUrl}?v=${timestamp}`;
        
        if (!previewItem.id.startsWith('virtual-')) {
          const { error: dbError } = await supabase
            .from('media_library')
            .update({ file_size: blob.size, file_url: newFileUrl, updated_at: new Date().toISOString() })
            .eq('id', previewItem.id);
          if (dbError) throw dbError;
        }
        
        setPreviewItem({ ...previewItem, file_url: newFileUrl, file_size: blob.size });
        toast.dismiss(toastId);
        toast.success('Image updated successfully in-place!');
      } else {
        const baseName = previewItem.original_filename.replace(/\.[^/.]+$/, '');
        const cleanBaseName = baseName.replace(/[^a-zA-Z0-9-_\s]/g, '').trim().replace(/\s+/g, '-').toLowerCase();
        const newFileName = `${cleanBaseName}-edited-${timestamp}.webp`;
        
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(newFileName, blob, { cacheControl: 'public, max-age=31536000', upsert: false });
          
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(newFileName);
        if (!publicUrlData?.publicUrl) throw new Error('Failed to get public URL');
        
        const { error: dbError } = await supabase.from('media_library').insert({
          original_filename: `edited-${previewItem.original_filename}`,
          seo_filename: newFileName,
          file_url: publicUrlData.publicUrl,
          alt_text: `edited ${previewItem.alt_text}`,
          title: `edited ${previewItem.title}`,
          bucket: bucketName,
          ai_generated: false,
          ai_enabled: true,
          file_size: blob.size,
          mime_type: 'image/webp'
        });
          
        if (dbError) throw dbError;
        
        toast.dismiss(toastId);
        toast.success('Image saved as a new copy in Media Library!');
      }
    } catch (err: any) {
      console.error('[Image Editor] Failed to save edited image:', err);
      toast.error(`Failed to save image edits: ${err.message}`);
    } finally {
      setIsSavingEdits(false);
    }
  };

  return { isSavingEdits, saveEditedImage };
}
