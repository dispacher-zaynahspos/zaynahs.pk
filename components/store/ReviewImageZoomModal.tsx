'use client';

import React from 'react';
import Image from 'next/image';
import { ZoomIn, ZoomOut } from '@/components/common/Icons';
import { Modal } from '@/components/common/Modal';
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
  // Shared zoom/pan engine (RULE SSOT1).
  const zoom = useZoomPan({ min: 1, max: 4, doubleTapScale: 2.5, resetDeps: [imageUrl, isOpen] });

  if (!imageUrl) return null;

  // Shared overlay system (RULE MODAL1) — smooth open/close + scroll-lock + ESC.
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      variant="lightbox"
      ariaLabel={alt || 'Customer feedback'}
    >
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
    </Modal>
  );
}
