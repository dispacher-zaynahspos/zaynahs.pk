'use client';

import React from 'react';
import Image from 'next/image';
import { Modal } from '@/components/common/Modal';
import { X } from '@/components/common/Icons';

interface ReviewImageLightboxProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string | null;
}

export default function ReviewImageLightbox({
  open,
  onClose,
  imageUrl,
}: ReviewImageLightboxProps) {
  if (!imageUrl) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      variant="lightbox"
      showClose={false}
      ariaLabel="Customer Review Photo Viewer"
    >
      <div
        className="relative w-full h-full flex flex-col items-center justify-between p-4 select-none bg-black"
        style={{ backgroundColor: '#000000' }}
        onClick={onClose}
      >
        {/* Top bar with close button */}
        <div
          className="w-full flex justify-end z-50 pt-2 px-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close photo viewer"
            className="w-11 h-11 flex items-center justify-center rounded-full bg-neutral-900 hover:bg-neutral-800 active:scale-95 text-white transition-all cursor-pointer border border-white/30 shadow-xl pointer-events-auto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center image */}
        <div
          className="relative w-full max-w-5xl h-[80dvh] sm:h-[85dvh] flex items-center justify-center cursor-default my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={imageUrl}
            alt="Customer review photo"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 95vw"
            className="object-contain drop-shadow-2xl select-none pointer-events-none"
          />
        </div>
      </div>
    </Modal>
  );
}
