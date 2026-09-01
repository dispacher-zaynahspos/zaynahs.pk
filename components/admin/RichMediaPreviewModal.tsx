'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Copy, 
  Download,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Undo,
  Sliders,
  Save,
  Plus,
  Loader2,
  Edit
} from '@/components/common/Icons';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Crop as CropIcon } from 'lucide-react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop, convertToPixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface MediaItem {
  id: string;
  original_filename: string;
  seo_filename: string;
  file_url: string;
  alt_text: string;
  title: string;
  description: string;
  caption: string;
  ai_generated: boolean;
  ai_enabled: boolean;
  bucket: string;
  created_at: string;
  file_size?: number;
  mime_type?: string;
}

interface RichMediaPreviewModalProps {
  url?: string | null;
  item?: MediaItem | null;
  onClose: () => void;
  onUpdateTags?: (item: MediaItem) => void;
  mode?: 'library' | 'selector' | 'preview';
}

const normalizeUrl = (url: string): string => {
  try {
    const u = new URL(url);
    return decodeURIComponent(u.pathname).toLowerCase();
  } catch {
    return decodeURIComponent(url).toLowerCase();
  }
};

export default function RichMediaPreviewModal({ url, item: initialItem, onClose, onUpdateTags, mode = 'preview' }: RichMediaPreviewModalProps) {
  const [mounted, setMounted] = useState(false);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(initialItem || null);
  const [loading, setLoading] = useState(!initialItem && !!url);
  
  // ─── Usage Cross-Reference State ────────────────────────────────────────
  const [usedNormUrls, setUsedNormUrls] = useState<Set<string>>(new Set());

  // ─── Image Editor State ────────────────────────────────────────────────
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
  const [isSavingEdits, setIsSavingEdits] = useState(false);
  
  // Crop states
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const imgRef = useRef<HTMLImageElement>(null);
  const [manualWidth, setManualWidth] = useState<string>('');
  const [manualHeight, setManualHeight] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    // Hide body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Fetch Usage
  useEffect(() => {
    const loadUsageCrossReferences = async () => {
      try {
        const supabase = createClient();
        const [cats, variants, sizeGuides, settings, productImgs] = await Promise.all([
          supabase.from('categories').select('image_url'),
          supabase.from('product_variants').select('image_url'),
          supabase.from('size_guides').select('image_url'),
          supabase.from('store_settings').select('logo_url, favicon_url, banner_url, exit_intent_image_url').single(),
          supabase.from('product_images').select('url'),
        ]);

        const rawUrls: string[] = [];
        cats.data?.forEach(c => c.image_url && rawUrls.push(c.image_url));
        variants.data?.forEach(v => v.image_url && rawUrls.push(v.image_url));
        sizeGuides.data?.forEach(sg => sg.image_url && rawUrls.push(sg.image_url));
        productImgs.data?.forEach(pi => pi.url && rawUrls.push(pi.url));
        if (settings.data) {
          const s = settings.data;
          if (s.logo_url) rawUrls.push(s.logo_url);
          if (s.favicon_url) rawUrls.push(s.favicon_url);
          if (s.banner_url) rawUrls.push(s.banner_url);
          if (s.exit_intent_image_url) rawUrls.push(s.exit_intent_image_url);
        }

        const normalizedSet = new Set(rawUrls.map(normalizeUrl));
        setUsedNormUrls(normalizedSet);
      } catch (err) {
        console.error('[MediaPreviewModal] Failed to load usage references:', err);
      }
    };
    loadUsageCrossReferences();
  }, []);

  // Fetch item by URL if not provided
  useEffect(() => {
    if (initialItem || !url) return;
    const fetchItemByUrl = async () => {
      try {
        const supabase = createClient();
        
        // Strip cache busters for searching
        const cleanUrl = url.split('?')[0];
        
        // Try exact match first
        let { data, error } = await supabase
          .from('media_library')
          .select('*')
          .ilike('file_url', `${cleanUrl}%`)
          .is('deleted_at', null)
          .limit(1)
          .maybeSingle();

        if (data) {
          setPreviewItem(data);
        } else {
          // Create dummy item if not found in media_library
          const filename = cleanUrl.split('/').pop() || 'unknown.webp';
          const isVideo = filename.match(/\.(mp4|mov|webm)$/i);
          setPreviewItem({
            id: 'virtual-' + Date.now(),
            original_filename: filename,
            seo_filename: filename,
            file_url: url, // use original with cache busters
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

  const isMediaUsed = useCallback((item: MediaItem): boolean => {
    return usedNormUrls.has(normalizeUrl(item.file_url));
  }, [usedNormUrls]);

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

  if (!mounted || (!previewItem && !loading)) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#16162a] rounded-3xl max-w-5xl w-full border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh] will-change-transform">
        
        {/* Left/Center: Image Viewport */}
        <div className="flex-1 bg-gray-950 flex items-center justify-center p-6 relative overflow-hidden group select-none min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center text-white space-y-3 opacity-50">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-xs font-mono tracking-widest uppercase">Loading Preview...</span>
            </div>
          ) : previewItem?.mime_type?.startsWith('video/') ? (
            <video src={previewItem.file_url} className="max-w-full max-h-[60vh] object-contain" controls autoPlay playsInline />
          ) : previewItem ? (
            <div className="relative overflow-hidden flex items-center justify-center">
              {showEditor ? (
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspect}
                  className="max-h-[60vh] rounded-lg shadow-lg"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imgRef}
                    src={previewItem.file_url}
                    alt={previewItem.alt_text}
                    style={{
                      transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                      filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) grayscale(${grayscale}%) sepia(${sepia}%) invert(${invert}%)`,
                      transition: 'transform 0.2s ease, filter 0.1s ease'
                    }}
                    className="max-w-full max-h-[60vh] object-contain block"
                  />
                </ReactCrop>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={previewItem.file_url}
                  alt={previewItem.alt_text}
                  style={{
                    transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) grayscale(${grayscale}%) sepia(${sepia}%) invert(${invert}%)`,
                    transition: 'transform 0.2s ease, filter 0.1s ease'
                  }}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
                />
              )}
            </div>
          ) : null}

          {/* Top Bar for close/exit */}
          {!loading && previewItem && (
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <span className="text-[10px] font-mono text-gray-400 bg-black/45 px-2.5 py-1 rounded-full uppercase tracking-wider">
                {previewItem.mime_type?.split('/')[1] || 'media'} • {formatBytes(previewItem.file_size)}
              </span>
            </div>
          )}
        </div>

        {/* Right Side: Control Panel / Editor Option Panels */}
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 flex flex-col max-h-[50vh] md:max-h-full bg-white dark:bg-[#16162a]">
          
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <div>
              <h3 className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-wider">
                {showEditor ? 'Edit Image' : 'Media Preview'}
              </h3>
              {!loading && previewItem && (
                <p className="text-[10px] text-gray-500 truncate max-w-[180px]">{previewItem.original_filename}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer min-h-[36px]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!loading && previewItem && (
            <>
              {/* Tab Navigation / Details Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Mode Selector */}
                {!previewItem.mime_type?.startsWith('video/') && (
                  <div className="flex bg-gray-100 dark:bg-gray-800/60 p-1 rounded-xl shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowEditor(false)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${!showEditor ? 'bg-white dark:bg-[#16162a] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500'}`}
                    >
                      Details & Info
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditor(true)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${showEditor ? 'bg-white dark:bg-[#16162a] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500'}`}
                    >
                      <Sliders className="inline w-3 h-3 mr-1" />
                      Adjust & Filters
                    </button>
                  </div>
                )}

                {!showEditor ? (
                  /* Info & Details Tab */
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2 text-xs">
                      <div className="flex justify-between"><span className="text-gray-500 font-medium">Filename:</span><span className="font-mono text-gray-900 dark:text-white truncate max-w-[150px]" title={previewItem.original_filename}>{previewItem.original_filename}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500 font-medium">SEO Name:</span><span className="font-mono text-gray-900 dark:text-white truncate max-w-[150px]" title={previewItem.seo_filename}>{previewItem.seo_filename}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500 font-medium">Uploaded:</span><span className="text-gray-900 dark:text-white">{new Date(previewItem.created_at).toLocaleDateString()}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500 font-medium">Size:</span><span className="text-gray-900 dark:text-white font-mono">{formatBytes(previewItem.file_size)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500 font-medium">Mime Type:</span><span className="text-gray-900 dark:text-white">{previewItem.mime_type || 'image/webp'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500 font-medium">Usage:</span>
                        {isMediaUsed(previewItem) ? (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">In Use</span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400">Unused</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(previewItem.file_url)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer min-h-[44px]"
                      >
                        <Copy className="w-4 h-4" />
                        Copy Image URL
                      </button>
                      
                      {mode === 'library' && onUpdateTags && !previewItem.id.startsWith('virtual-') && (
                        <button
                          type="button"
                          onClick={() => { onClose(); onUpdateTags(previewItem); }}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer min-h-[44px]"
                        >
                          <Edit className="w-4 h-4" />
                          Edit ALT & Description Tags
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDownloadMedia(previewItem.file_url, previewItem.original_filename)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer min-h-[44px]"
                      >
                        <Download className="w-4 h-4" />
                        Download Media
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Image Editor Tab */
                  <div className="space-y-5 text-xs">
                    {/* Transformations */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-[10px]">Transform</h4>
                      <div className="grid grid-cols-4 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setRotation(r => (r + 90) % 360)}
                          className="flex flex-col items-center justify-center p-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl cursor-pointer"
                          title="Rotate 90° Clockwise"
                        >
                          <RotateCw className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                          <span className="text-[8px] mt-1 text-gray-500">Rotate</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFlipH(f => !f)}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl cursor-pointer ${flipH ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 border border-blue-200 dark:border-blue-800' : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                          title="Flip Horizontal"
                        >
                          <FlipHorizontal className="w-4 h-4" />
                          <span className="text-[8px] mt-1 text-gray-500">Flip H</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFlipV(f => !f)}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl cursor-pointer ${flipV ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 border border-blue-200 dark:border-blue-800' : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                          title="Flip Vertical"
                        >
                          <FlipVertical className="w-4 h-4" />
                          <span className="text-[8px] mt-1 text-gray-500">Flip V</span>
                        </button>
                        <button
                          type="button"
                          onClick={resetEditor}
                          className="flex flex-col items-center justify-center p-2 bg-gray-50 dark:bg-gray-800 hover:bg-red-500/10 hover:text-red-500 rounded-xl cursor-pointer"
                          title="Reset All Adjustments"
                        >
                          <Undo className="w-4 h-4" />
                          <span className="text-[8px] mt-1 text-gray-500">Reset</span>
                        </button>
                      </div>
                    </div>

                    {/* Crop Aspects */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <h4 className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-[10px]">Crop Aspect Ratio</h4>
                        <div className="flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
                          <input 
                            type="number" 
                            className="w-12 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1 py-0.5 rounded border-none text-center outline-none focus:ring-1 focus:ring-blue-500 placeholder-blue-300"
                            value={manualWidth}
                            onChange={(e) => setManualWidth(e.target.value)}
                            onKeyDown={handleManualSizeKeyDown}
                            onBlur={applyManualSize}
                            placeholder="W"
                          />
                          <span className="text-[10px] font-bold text-gray-400">×</span>
                          <input 
                            type="number" 
                            className="w-12 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1 py-0.5 rounded border-none text-center outline-none focus:ring-1 focus:ring-blue-500 placeholder-blue-300"
                            value={manualHeight}
                            onChange={(e) => setManualHeight(e.target.value)}
                            onKeyDown={handleManualSizeKeyDown}
                            onBlur={applyManualSize}
                            placeholder="H"
                          />
                          <span className="text-[10px] font-bold text-gray-400 ml-0.5">px</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <button type="button" onClick={() => handleAspectClick(undefined)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${aspect === undefined ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}><CropIcon className="w-3 h-3" /> Custom</button>
                        <button type="button" onClick={() => handleAspectClick(1)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${aspect === 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>1:1</button>
                        <button type="button" onClick={() => handleAspectClick(3 / 4)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${aspect === 3 / 4 ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>3:4</button>
                        <button type="button" onClick={() => handleAspectClick(4 / 3)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${aspect === 4 / 3 ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>4:3</button>
                        <button type="button" onClick={() => handleAspectClick(9 / 16)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${aspect === 9 / 16 ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>9:16</button>
                        <button type="button" onClick={() => handleAspectClick(16 / 9)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${aspect === 16 / 9 ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>16:9</button>
                      </div>
                    </div>

                    {/* Quick Filters */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-[10px]">Quick Filters</h4>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { name: 'None', key: 'none' },
                          { name: 'B&W', key: 'grayscale' },
                          { name: 'Sepia', key: 'sepia' },
                          { name: 'Invert', key: 'invert' },
                          { name: 'Vintage', key: 'vintage' },
                          { name: 'Cool Tint', key: 'cool' },
                          { name: 'Moody', key: 'moody' },
                          { name: 'Warm Sun', key: 'warm' },
                          { name: 'Cinema', key: 'cinematic' },
                        ].map(f => (
                          <button key={f.key} type="button" onClick={() => applyQuickFilter(f.key)} className="py-1 px-2 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 rounded-lg text-[10px] font-medium transition-all text-center cursor-pointer truncate">{f.name}</button>
                        ))}
                      </div>
                    </div>

                    {/* Manual Adjustments Sliders */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-[10px]">Manual Adjustments</h4>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold"><span className="text-gray-600 dark:text-gray-400">Brightness</span><span className="text-blue-600 dark:text-blue-400">{brightness}%</span></div>
                        <input type="range" min="0" max="200" value={brightness} onChange={e => setBrightness(Number(e.target.value))} className="w-full accent-blue-600 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold"><span className="text-gray-600 dark:text-gray-400">Contrast</span><span className="text-blue-600 dark:text-blue-400">{contrast}%</span></div>
                        <input type="range" min="0" max="200" value={contrast} onChange={e => setContrast(Number(e.target.value))} className="w-full accent-blue-600 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold"><span className="text-gray-600 dark:text-gray-400">Saturation</span><span className="text-blue-600 dark:text-blue-400">{saturation}%</span></div>
                        <input type="range" min="0" max="200" value={saturation} onChange={e => setSaturation(Number(e.target.value))} className="w-full accent-blue-600 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold"><span className="text-gray-600 dark:text-gray-400">Blur</span><span className="text-blue-600 dark:text-blue-400">{blur}px</span></div>
                        <input type="range" min="0" max="10" step="0.5" value={blur} onChange={e => setBlur(Number(e.target.value))} className="w-full accent-blue-600 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Editor Footer / Save Operations */}
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10 shrink-0 space-y-2">
                {showEditor && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => saveEditedImage(true)}
                      disabled={isSavingEdits}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] cursor-pointer min-h-[44px] transition-all disabled:opacity-50 active:scale-95"
                    >
                      {isSavingEdits ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      Save In-place
                    </button>
                    <button
                      type="button"
                      onClick={() => saveEditedImage(false)}
                      disabled={isSavingEdits}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold text-[11px] hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer min-h-[44px] transition-all disabled:opacity-50 active:scale-95"
                    >
                      {isSavingEdits ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      Save As Copy
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

        </div>

      </div>
    </div>,
    document.body
  );
}
