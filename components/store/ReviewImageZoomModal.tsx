'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X, ZoomIn, ZoomOut } from '@/components/common/Icons';
import { useZoomPan } from '@/lib/hooks/useZoomPan';

interface ReviewImageZoomModalProps {
  isOpen: boolean;
  imageUrl: string;
  alt?: string;
  onClose: () => void;
}

export default function ReviewImageZoomModal({
  isOpen,
  imageUrl,
  alt,
  onClose,
}: ReviewImageZoomModalProps) {
  const [mounted, setMounted] = useState(false);
  // Shared zoom/pan engine (RULE SSOT1).
  const zoom = useZoomPan({ min: 1, max: 4, doubleTapScale: 2.5, resetDeps: [imageUrl, isOpen] });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen || !imageUrl) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-black/95 animate-fade-in touch-none select-none"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-4 right-4 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shadow-md"
        aria-label="Close lightbox"
      >
        <X className="w-5 h-5" />
      </button>

      {zoom.isZoomed && (
        <div className="absolute top-4 left-4 z-20 flex gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); zoom.zoomIn(); }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); zoom.zoomOut(); }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      )}

      <div
        className="relative w-full max-w-4xl h-[65dvh] md:h-[80dvh] flex items-center justify-center overflow-hidden"
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
            src={imageUrl}
            alt={alt || 'Customer feedback'}
            fill
            sizes="90vw"
            className="object-contain pointer-events-none"
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
