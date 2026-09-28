'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from '@/components/common/Icons';
import { useZoomPan } from '@/lib/hooks/useZoomPan';

export interface ImageItem {
  id: string;
  product_id: string;
  url: string;
  alt?: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

interface ProductLightboxModalProps {
  mounted: boolean;
  lightboxOpen: boolean;
  setLightboxOpen: (open: boolean) => void;
  images: ImageItem[];
  activeImageIndex: number;
  setActiveImageIndex: React.Dispatch<React.SetStateAction<number>>;
  activeImage: string;
  productName: string;
}

export function ProductLightboxModal({
  mounted,
  lightboxOpen,
  setLightboxOpen,
  images,
  activeImageIndex,
  setActiveImageIndex,
  activeImage,
  productName,
}: ProductLightboxModalProps) {
  // Shared zoom/pan engine (RULE SSOT1) — wheel/pinch/drag/double-tap.
  // Swipe (when not zoomed) changes the active image.
  const zoom = useZoomPan({
    min: 1,
    max: 4,
    doubleTapScale: 2.5,
    resetDeps: [activeImageIndex, lightboxOpen],
    onSwipe: (dir) => {
      if (images.length <= 1) return;
      setActiveImageIndex((i) =>
        dir === 'next' ? (i + 1) % images.length : (i - 1 + images.length) % images.length,
      );
    },
  });

  // Esc to close
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightboxOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, setLightboxOpen]);

  if (!mounted || !lightboxOpen) return null;

  const activeAlt = images[activeImageIndex]?.alt || productName;

  return createPortal(
    <div
      className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-black/95 animate-fade-in touch-none select-none"
      onClick={() => setLightboxOpen(false)}
    >
      {/* Close button at top-right */}
      <button
        type="button"
        onClick={() => setLightboxOpen(false)}
        className="absolute top-4 right-4 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shadow-md"
        aria-label="Close lightbox"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Prev arrow */}
      {images.length > 1 && !zoom.isZoomed && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setActiveImageIndex(i => (i - 1 + images.length) % images.length); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Main lightbox image container */}
      <div
        className="relative w-full max-w-3xl h-[65dvh] md:h-[80dvh] flex items-center justify-center overflow-hidden px-4 md:px-16"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`w-full h-full relative ${zoom.isDragging ? 'cursor-grabbing' : zoom.isZoomed ? 'cursor-grab' : 'cursor-zoom-in'}`}
          style={{
            transform: `translate(${zoom.pos.x}px, ${zoom.pos.y}px) scale(${zoom.scale})`,
            transformOrigin: 'center center',
            transition: zoom.isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
          {...zoom.bind}
        >
          <Image
            src={images[activeImageIndex]?.url ?? activeImage}
            alt={activeAlt}
            fill
            sizes="90vw"
            className="object-contain pointer-events-none"
          />
        </div>
      </div>

      {/* Next arrow */}
      {images.length > 1 && !zoom.isZoomed && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setActiveImageIndex(i => (i + 1) % images.length); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Dot indicators */}
      {images.length > 1 && !zoom.isZoomed && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => { e.stopPropagation(); setActiveImageIndex(i); }}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${i === activeImageIndex ? 'bg-white scale-125' : 'bg-white/40'}`}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}
