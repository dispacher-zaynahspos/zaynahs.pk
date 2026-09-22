'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from '@/components/common/Icons';

export interface ImageItem {
  id: string;
  productId: string;
  url: string;
  alt?: string;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
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
  // Lightbox Zoom and Pan states
  const [lightboxZoomScale, setLightboxZoomScale] = useState(1);
  const [lightboxZoomPos, setLightboxZoomPos] = useState({ x: 0, y: 0 });
  const [lightboxIsDragging, setLightboxIsDragging] = useState(false);
  const lightboxDragStart = useRef({ x: 0, y: 0 });
  const lightboxWasDragging = useRef(false);
  const lightboxTouchStartPos = useRef({ x: 0, y: 0 });
  const lastTap = useRef<number | null>(null);
  const initialPinchDistance = useRef<number | null>(null);
  const initialPinchScale = useRef<number>(1);

  // Swipe gesture references
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const resetLightboxZoom = () => {
    setLightboxZoomScale(1);
    setLightboxZoomPos({ x: 0, y: 0 });
    setLightboxIsDragging(false);
    lightboxWasDragging.current = false;
  };

  useEffect(() => {
    resetLightboxZoom();
  }, [activeImageIndex, lightboxOpen]);

  // Mouse handlers for desktop dragging in lightbox
  const handleLightboxMouseDown = (e: React.MouseEvent) => {
    if (lightboxZoomScale <= 1) return;
    setLightboxIsDragging(true);
    lightboxWasDragging.current = false;
    lightboxDragStart.current = {
      x: e.clientX - lightboxZoomPos.x,
      y: e.clientY - lightboxZoomPos.y
    };
  };

  const handleLightboxMouseMove = (e: React.MouseEvent) => {
    if (!lightboxIsDragging || lightboxZoomScale <= 1) return;
    const newX = e.clientX - lightboxDragStart.current.x;
    const newY = e.clientY - lightboxDragStart.current.y;
    lightboxWasDragging.current = true;
    setLightboxZoomPos({ x: newX, y: newY });
  };

  const handleLightboxMouseUp = () => {
    setLightboxIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.targetTouches.length === 2) {
      const dx = e.targetTouches[0].clientX - e.targetTouches[1].clientX;
      const dy = e.targetTouches[0].clientY - e.targetTouches[1].clientY;
      initialPinchDistance.current = Math.sqrt(dx * dx + dy * dy);
      initialPinchScale.current = lightboxZoomScale;
      setLightboxIsDragging(false);
    } else if (e.targetTouches.length === 1) {
      if (lightboxZoomScale > 1) {
        setLightboxIsDragging(true);
        lightboxWasDragging.current = false;
        lightboxDragStart.current = {
          x: e.targetTouches[0].clientX - lightboxZoomPos.x,
          y: e.targetTouches[0].clientY - lightboxZoomPos.y
        };
        lightboxTouchStartPos.current = {
          x: e.targetTouches[0].clientX,
          y: e.targetTouches[0].clientY
        };
      } else {
        touchStartX.current = e.targetTouches[0].clientX;
        touchEndX.current = 0;
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.targetTouches.length === 2 && initialPinchDistance.current !== null) {
      const dx = e.targetTouches[0].clientX - e.targetTouches[1].clientX;
      const dy = e.targetTouches[0].clientY - e.targetTouches[1].clientY;
      const currentDist = Math.sqrt(dx * dx + dy * dy);
      const factor = currentDist / initialPinchDistance.current;
      const newScale = Math.max(1, Math.min(4, initialPinchScale.current * factor));
      setLightboxZoomScale(newScale);
      if (newScale === 1) {
        setLightboxZoomPos({ x: 0, y: 0 });
      }
    } else if (e.targetTouches.length === 1) {
      if (lightboxZoomScale > 1) {
        if (!lightboxIsDragging) return;
        const newX = e.targetTouches[0].clientX - lightboxDragStart.current.x;
        const newY = e.targetTouches[0].clientY - lightboxDragStart.current.y;

        const dx = Math.abs(e.targetTouches[0].clientX - lightboxTouchStartPos.current.x);
        const dy = Math.abs(e.targetTouches[0].clientY - lightboxTouchStartPos.current.y);
        if (dx > 5 || dy > 5) {
          lightboxWasDragging.current = true;
        }
        setLightboxZoomPos({ x: newX, y: newY });
      } else {
        touchEndX.current = e.targetTouches[0].clientX;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.targetTouches.length < 2) {
      initialPinchDistance.current = null;
    }

    if (lightboxZoomScale > 1) {
      setLightboxIsDragging(false);
    } else {
      if (images.length <= 1) return;
      if (touchEndX.current === 0) {
        touchStartX.current = 0;
        touchEndX.current = 0;
        return;
      }
      const diff = touchStartX.current - touchEndX.current;
      const swipeThreshold = 50;
      if (diff > swipeThreshold) {
        setActiveImageIndex(i => (i + 1) % images.length);
      } else if (diff < -swipeThreshold) {
        setActiveImageIndex(i => (i - 1 + images.length) % images.length);
      }
      touchStartX.current = 0;
      touchEndX.current = 0;
    }
  };

  if (!mounted || !lightboxOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-black/95 animate-fade-in touch-none select-none"
      onClick={() => setLightboxOpen(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
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
      {images.length > 1 && lightboxZoomScale === 1 && (
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
          className={`w-full h-full relative ${lightboxIsDragging ? 'cursor-grabbing' : lightboxZoomScale > 1 ? 'cursor-grab' : 'cursor-zoom-in'}`}
          style={{
            transform: `translate(${lightboxZoomPos.x}px, ${lightboxZoomPos.y}px) scale(${lightboxZoomScale})`,
            transformOrigin: 'center center',
            transition: lightboxIsDragging ? 'none' : 'transform 0.15s ease-out',
          }}
          onMouseDown={handleLightboxMouseDown}
          onMouseMove={handleLightboxMouseMove}
          onMouseUp={handleLightboxMouseUp}
          onMouseLeave={handleLightboxMouseUp}
          onClick={() => {
            if (lightboxWasDragging.current) {
              lightboxWasDragging.current = false;
              return;
            }
            const now = Date.now();
            const DOUBLE_PRESS_DELAY = 300;
            if (lastTap.current && (now - lastTap.current) < DOUBLE_PRESS_DELAY) {
              if (lightboxZoomScale > 1) {
                resetLightboxZoom();
              } else {
                setLightboxZoomScale(2.5);
              }
              lastTap.current = null;
            } else {
              lastTap.current = now;
            }
          }}
        >
          <Image
            src={images[activeImageIndex]?.url ?? activeImage}
            alt={productName}
            fill
            sizes="90vw"
            className="object-contain pointer-events-none"
          />
        </div>
      </div>

      {/* Next arrow */}
      {images.length > 1 && lightboxZoomScale === 1 && (
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
      {images.length > 1 && lightboxZoomScale === 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => { e.stopPropagation(); setActiveImageIndex(i); }}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${i === activeImageIndex ? 'bg-white scale-125' : 'bg-white/40'}`}
            />
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}
