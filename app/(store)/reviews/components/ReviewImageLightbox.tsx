'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Modal } from '@/components/common/Modal';
import { X, ChevronLeft, ChevronRight, ArrowRight, Package } from '@/components/common/Icons';

export interface LightboxProduct {
  name: string;
  slug: string;
  image?: string;
  price?: number;
}

export interface ReviewLightboxData {
  images: string[];
  currentIndex: number;
  product?: LightboxProduct;
  customerName?: string;
}

interface ReviewImageLightboxProps {
  open: boolean;
  onClose: () => void;
  data?: ReviewLightboxData | null;
  // Backward compatibility props
  imageUrl?: string | null;
  onNavigate?: (newIndex: number) => void;
}

export default function ReviewImageLightbox({
  open,
  onClose,
  data,
  imageUrl,
  onNavigate,
}: ReviewImageLightboxProps) {
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  // Normalize images and index
  const images = data?.images && data.images.length > 0
    ? data.images
    : imageUrl
    ? [imageUrl]
    : [];

  const currentIndex = data?.currentIndex ?? 0;
  const currentImage = images[currentIndex] || imageUrl || null;
  const product = data?.product;
  const customerName = data?.customerName;

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  const handlePrev = () => {
    if (onNavigate && hasPrev) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (onNavigate && hasNext) {
      onNavigate(currentIndex + 1);
    }
  };

  // Keyboard navigation: Left/Right arrows + Escape
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && hasPrev) {
        handlePrev();
      } else if (e.key === 'ArrowRight' && hasNext) {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, hasPrev, hasNext, currentIndex]);

  if (!open || !currentImage) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;

    // Only swipe if horizontal move is greater than vertical move
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX > 0 && hasPrev) {
        handlePrev();
      } else if (diffX < 0 && hasNext) {
        handleNext();
      }
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      variant="lightbox"
      showClose={false}
      ariaLabel="Customer Review Photo Viewer"
    >
      <div
        className="relative w-full h-full flex flex-col items-center justify-between p-3 sm:p-5 select-none bg-black/95 backdrop-blur-md"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}
        onClick={onClose}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top bar with Image Counter + Customer Name + Close button */}
        <div
          className="w-full flex items-center justify-between z-50 pt-1 px-2 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            {images.length > 1 && (
              <div
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border border-white/20 shadow-lg"
                style={{ backgroundColor: 'rgba(23, 23, 23, 0.85)', color: '#ffffff' }}
              >
                <span>{currentIndex + 1}</span>
                <span className="text-white/50">/</span>
                <span>{images.length}</span>
              </div>
            )}
            {customerName && (
              <span className="hidden sm:inline-block text-xs font-semibold text-white/80 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-xs">
                Review by {customerName}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close photo viewer"
            className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-neutral-900/90 hover:bg-neutral-800 active:scale-95 text-white transition-all cursor-pointer border border-white/30 shadow-xl shrink-0"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Center: Main Image with Prev/Next Navigation Arrows */}
        <div className="relative w-full flex-1 min-h-0 flex items-center justify-center my-auto py-2">
          {/* Previous Arrow Button */}
          {hasPrev && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              aria-label="Previous photo"
              className="absolute left-2 sm:left-4 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/30 transition-all cursor-pointer shadow-2xl active:scale-95"
            >
              <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </button>
          )}

          {/* Main Photo Container */}
          <div
            className="relative w-full max-w-5xl h-[64dvh] sm:h-[72dvh] flex items-center justify-center cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={currentImage}
              alt={customerName ? `Review photo by ${customerName}` : 'Customer review photo'}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 90vw"
              className="object-contain drop-shadow-2xl select-none"
            />
          </div>

          {/* Next Arrow Button */}
          {hasNext && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              aria-label="Next photo"
              className="absolute right-2 sm:right-4 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/30 transition-all cursor-pointer shadow-2xl active:scale-95"
            >
              <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </button>
          )}
        </div>

        {/* Bottom Bar: Linked Product Chip */}
        {product && product.slug && (
          <div
            className="w-full flex justify-center z-50 pb-2 px-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Link
              href={`/product/${product.slug}`}
              onClick={onClose}
              className="group inline-flex items-center gap-3 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-neutral-900/90 hover:bg-neutral-800 text-white border border-white/20 hover:border-[#e94560]/60 shadow-2xl transition-all max-w-[94vw] sm:max-w-md active:scale-[0.98]"
            >
              <span className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-neutral-800 shrink-0 border border-white/20">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name || 'Product'}
                    fill
                    sizes="44px"
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <span className="flex items-center justify-center w-full h-full">
                    <Package className="w-5 h-5 text-gray-400" />
                  </span>
                )}
              </span>

              <div className="flex-1 min-w-0 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 block">
                  Reviewed Item
                </span>
                <span className="text-xs sm:text-sm font-bold text-white truncate block group-hover:text-[#e94560] transition-colors">
                  {product.name}
                </span>
                {product.price !== undefined && product.price !== null && (
                  <span className="text-xs font-black text-[#e94560]">
                    Rs. {product.price.toLocaleString()}
                  </span>
                )}
              </div>

              <span className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/10 group-hover:bg-[#e94560] group-hover:text-white text-white/80 transition-colors">
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        )}
      </div>
    </Modal>
  );
}
