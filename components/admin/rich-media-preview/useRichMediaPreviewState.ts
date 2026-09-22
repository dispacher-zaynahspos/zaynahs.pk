'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Crop, PixelCrop, centerCrop, makeAspectCrop, convertToPixelCrop } from 'react-image-crop';
import { toast } from 'sonner';
import { MediaItem, RichMediaPreviewModalProps } from './types';
import { useMediaUsageCrossReferences } from './hooks/useMediaUsageCrossReferences';
import { useImageEditorSave } from './hooks/useImageEditorSave';

export function useRichMediaPreviewState({ url, item: initialItem }: Pick<RichMediaPreviewModalProps, 'url' | 'item'>) {
  const [mounted, setMounted] = useState(false);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(initialItem || null);
  const [loading, setLoading] = useState(!initialItem && !!url);

  // Image Editor State
  const [showEditor, setShowEditor] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [grayscale, setGrayscale] = useState(0);
  const [sepia, setSepia] = useState(0);
  const [invert, setInvert] = useState(0);

  // Crop states
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const imgRef = useRef<HTMLImageElement>(null);
  const [manualWidth, setManualWidth] = useState<string>('');
  const [manualHeight, setManualHeight] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);



  // Fetch item by URL if not provided
  useEffect(() => {
    if (initialItem || !url) return;
    const fetchItemByUrl = async () => {
      try {
        const supabase = createClient();
        const cleanUrl = url.split('?')[0];
        
        let { data } = await supabase
          .from('media_library')
          .select('*')
          .ilike('file_url', `${cleanUrl}%`)
          .is('deleted_at', null)
          .limit(1)
          .maybeSingle();

        if (data) {
          setPreviewItem(data);
        } else {
          const filename = cleanUrl.split('/').pop() || 'unknown.webp';
          const isVideo = filename.match(/\.(mp4|mov|webm)$/i);
          setPreviewItem({
            id: 'virtual-' + Date.now(),
            original_filename: filename,
            seo_filename: filename,
            file_url: url,
            alt_text: filename,
            title: filename,
            description: '',
            caption: '',
            ai_generated: false,
            ai_enabled: false,
            bucket: 'product-images',
            created_at: new Date().toISOString(),
            file_size: 0,
            mime_type: isVideo ? 'video/mp4' : 'image/webp'
          });
        }
      } catch (err) {
        console.error('Failed to fetch media item:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchItemByUrl();
  }, [url, initialItem]);



  const formatBytes = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleCopyUrl = (urlToCopy: string) => { 
    navigator.clipboard.writeText(urlToCopy); 
    toast.success('Image URL copied'); 
  };

  const handleDownloadMedia = async (urlToDownload: string, filename: string) => {
    try {
      toast.loading('Downloading media...', { id: 'downloading' });
      const downloadUrl = urlToDownload.includes('supabase.co') 
        ? `${urlToDownload}${urlToDownload.includes('?') ? '&' : '?'}download=${encodeURIComponent(filename)}`
        : urlToDownload;

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success('Media downloaded successfully', { id: 'downloading' });
    } catch (error) {
      console.error('Download failed', error);
      toast.error('Failed to download media.', { id: 'downloading' });
    }
  };

  const resetEditor = () => {
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    setGrayscale(0);
    setSepia(0);
    setInvert(0);
    setCrop(undefined);
    setCompletedCrop(null);
    setAspect(undefined);
  };

  const handleAspectClick = (newAspect: number | undefined) => {
    setAspect(newAspect);
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      if (newAspect) {
        setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, newAspect, width, height), width, height));
      } else {
        setCrop({ unit: '%', width: 50, height: 50, x: 25, y: 25 });
      }
    }
  };

  useEffect(() => {
    if (completedCrop && imgRef.current) {
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
      const actualW = Math.round(completedCrop.width * scaleX);
      const actualH = Math.round(completedCrop.height * scaleY);
      if (actualW > 0 && actualH > 0) {
        setManualWidth(actualW.toString());
        setManualHeight(actualH.toString());
      }
    } else {
      setManualWidth('');
      setManualHeight('');
    }
  }, [completedCrop]);

  const applyManualSize = () => {
    const w = parseInt(manualWidth, 10);
    const h = parseInt(manualHeight, 10);
    if (isNaN(w) || isNaN(h) || !imgRef.current || w <= 0 || h <= 0) return;
    
    const { naturalWidth, naturalHeight, width, height } = imgRef.current;
    const pctW = Math.min((w / naturalWidth) * 100, 100);
    const pctH = Math.min((h / naturalHeight) * 100, 100);
    
    setAspect(undefined); 
    const newCrop = centerCrop({ unit: '%', width: pctW, height: pctH }, width, height);
    setCrop(newCrop);
    setCompletedCrop(convertToPixelCrop(newCrop, width, height));
  };

  const handleManualSizeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyManualSize();
    }
  };

  const applyQuickFilter = (filterName: string) => {
    resetEditor();
    switch (filterName) {
      case 'grayscale': setGrayscale(100); break;
      case 'sepia': setSepia(100); break;
      case 'invert': setInvert(100); break;
      case 'vintage': setSepia(50); setContrast(120); setBrightness(95); break;
      case 'cool': setSaturation(85); setContrast(95); setBrightness(105); break;
      case 'cinematic': setContrast(140); setSaturation(110); setBrightness(90); break;
      case 'moody': setBrightness(85); setContrast(130); setSaturation(60); break;
      case 'warm': setSepia(20); setSaturation(120); break;
    }
  };

  const { isMediaUsed } = useMediaUsageCrossReferences();

  const { isSavingEdits, saveEditedImage } = useImageEditorSave({
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
  });

  return {
    mounted,
    previewItem,
    loading,
    showEditor,
    setShowEditor,
    rotation,
    setRotation,
    flipH,
    setFlipH,
    flipV,
    setFlipV,
    brightness,
    setBrightness,
    contrast,
    setContrast,
    saturation,
    setSaturation,
    blur,
    setBlur,
    grayscale,
    sepia,
    invert,
    isSavingEdits,
    crop,
    setCrop,
    setCompletedCrop,
    aspect,
    imgRef,
    manualWidth,
    setManualWidth,
    manualHeight,
    setManualHeight,
    resetEditor,
    handleAspectClick,
    applyManualSize,
    handleManualSizeKeyDown,
    applyQuickFilter,
    saveEditedImage,
    handleCopyUrl,
    handleDownloadMedia,
    isMediaUsed,
    formatBytes,
  };
}
