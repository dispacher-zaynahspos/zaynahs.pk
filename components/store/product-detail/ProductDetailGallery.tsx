'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, ZoomIn, X } from '@/components/common/Icons';
import { StoreSettings, Product, ProductVariant } from '@/lib/types';
import { getSharedAspectClass } from '@/lib/utils/styles';
import { getPresetImageUrl } from '@/lib/utils/imageUrl';

import { ProductLightboxModal } from './gallery/ProductLightboxModal';

interface ImageItem {
  id: string;
  productId: string;
  url: string;
  alt?: string;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
}

interface ProductDetailGalleryProps {
  product: Product;
  settings: StoreSettings;
  images: ImageItem[];
  activeImage: string;
  activeImageIndex: number;
  setActiveImageIndex: React.Dispatch<React.SetStateAction<number>>;
  selectedVariant?: ProductVariant;
  stockAvailable: number;
}

export default function ProductDetailGallery({
  product,
  settings,
  images,
  activeImage,
  activeImageIndex,
  setActiveImageIndex,
  selectedVariant,
  stockAvailable,
}: ProductDetailGalleryProps) {
  const [mounted, setMounted] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const imgContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Embla carousel for mobile touch swipe
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true
  });

  // Keep activeImageIndex in sync when user swipes
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setActiveImageIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, setActiveImageIndex]);

  // Sync scroll snap if activeImageIndex is changed from parent
  useEffect(() => {
    if (emblaApi && emblaApi.selectedScrollSnap() !== activeImageIndex) {
      emblaApi.scrollTo(activeImageIndex);
    }
  }, [activeImageIndex, emblaApi]);

  return (
    <div className="space-y-3">
      {/* Main image with arrows + hover zoom */}
      <div
        ref={imgContainerRef}
        className={`relative w-full overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-transparent group ${getSharedAspectClass(settings.imageAspectRatio)}`}
      >
        {/* Embla Viewport */}
        <div className="overflow-hidden w-full h-full md:cursor-zoom-in touch-pan-y" ref={emblaRef} onClick={() => setLightboxOpen(true)}>
          <div className="flex h-full">
            {images.map((img, i) => (
              <div
                key={img.id || i}
                className="relative flex-[0_0_100%] min-w-0 w-full h-full select-none overflow-hidden"
                onMouseMove={(e) => {
                  if (typeof window !== 'undefined' && (window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches)) {
                    return;
                  }
                  if ((e.target as HTMLElement).closest('button')) return;
                  if (!imgContainerRef.current) return;
                  const rect = imgContainerRef.current.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  setZoomPos({ x, y });
                  setIsZoomed(true);
                }}
                onMouseLeave={() => setIsZoomed(false)}
              >
                <Image
                  src={getPresetImageUrl(img.url, 'zoom')}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
                  className={`object-contain p-2 sm:p-4 transition-transform duration-200 ease-out ${isZoomed && i === activeImageIndex ? 'scale-[1.75]' : 'scale-100'}`}
                  style={isZoomed && i === activeImageIndex ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
                  priority={i === 0}
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Zoom icon hint */}
        <div className="absolute top-3 right-3 bg-white/80 dark:bg-black/50 rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          <ZoomIn className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 items-start pointer-events-none">
          {(() => {
            const currentCompare = selectedVariant?.comparePrice ?? product.comparePrice;
            const currentPrc = selectedVariant?.price ?? product.price;
            if (currentCompare && currentPrc && currentCompare > currentPrc) {
              return (
                <span
                  style={{ backgroundColor: '#10b981' }}
                  className="rounded-full px-3 py-1 text-[10px] font-black text-white shadow-sm uppercase tracking-wider"
                >
                  -{Math.round(((currentCompare - currentPrc) / currentCompare) * 100)}%
                </span>
              );
            }
            return null;
          })()}
          {product.isFeatured && (
            <span
              className="rounded-full px-3 py-1 text-[10px] font-black shadow-sm uppercase tracking-wider"
              style={{
                backgroundColor: product.customBadge?.name?.toLowerCase() === 'featured' ? product.customBadge.bgColor : '#e94560',
                color: product.customBadge?.name?.toLowerCase() === 'featured' ? product.customBadge.textColor : '#ffffff'
              }}
            >
              {product.customBadge?.name?.toLowerCase() === 'featured' ? product.customBadge.name : 'FEATURED'}
            </span>
          )}
          {product.badgeEnabled && product.customBadge && (!product.isFeatured || product.customBadge.name.toLowerCase() !== 'featured') && (
            <span
              className="rounded-full px-3 py-1 text-[10px] font-black text-white shadow-sm uppercase tracking-wider"
              style={{
                backgroundColor: product.customBadge.bgColor,
                color: product.customBadge.textColor
              }}
            >
              {product.customBadge.name}
            </span>
          )}
          {!product.isService && stockAvailable > 0 && stockAvailable <= 8 && (
            <span className="rounded-full bg-amber-600 px-3 py-1 text-[10px] font-black text-white shadow-sm uppercase tracking-wider">
              LIMITED
            </span>
          )}
        </div>

        {/* Prev Arrow */}
        {images.length > 1 && (
          <button
            type="button"
            onMouseEnter={() => setIsZoomed(false)}
            onMouseMove={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); emblaApi?.scrollPrev(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 dark:bg-black/60 shadow-md text-gray-800 dark:text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-white dark:hover:bg-black transition-all cursor-pointer"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Next Arrow */}
        {images.length > 1 && (
          <button
            type="button"
            onMouseEnter={() => setIsZoomed(false)}
            onMouseMove={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); emblaApi?.scrollNext(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 dark:bg-black/60 shadow-md text-gray-800 dark:text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-white dark:hover:bg-black transition-all cursor-pointer"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onMouseMove={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); emblaApi?.scrollTo(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${i === activeImageIndex ? 'bg-white scale-125 shadow' : 'bg-white/50'}`}
              />
            ))}
          </div>
        )}

        {/* Mobile image counter pill */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 right-2.5 z-10 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white tracking-widest pointer-events-none md:hidden select-none">
            {activeImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              style={i === activeImageIndex ? { borderColor: 'var(--color-primary, #C2185B)' } : undefined}
              className={`relative w-16 flex-shrink-0 overflow-hidden rounded-lg border transition-all cursor-pointer ${getSharedAspectClass(settings.imageAspectRatio)} ${i === activeImageIndex
                ? 'ring-2 ring-[var(--color-primary,#C2185B)]/20'
                : 'border-gray-200 dark:border-gray-800 hover:border-gray-400'
              }`}
            >
              <Image
                src={getPresetImageUrl(img.url, 'admin_thumb')}
                alt={`${product.name} gallery ${i}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <ProductLightboxModal
        mounted={mounted}
        lightboxOpen={lightboxOpen}
        setLightboxOpen={setLightboxOpen}
        images={images}
        activeImageIndex={activeImageIndex}
        setActiveImageIndex={setActiveImageIndex}
        activeImage={activeImage}
        productName={product.name}
      />
    </div>
  );
}
