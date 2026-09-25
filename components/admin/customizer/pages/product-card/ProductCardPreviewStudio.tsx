'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { StoreSettings } from '@/lib/types';
import { Heart, Eye, ShoppingCart, Smartphone, Play, RefreshCw } from '@/components/common/Icons';
import { getSharedAspectClass, getSharedTitleClampClass } from '@/lib/utils/styles';

interface ProductCardPreviewStudioProps {
  settings: StoreSettings;
}

export function ProductCardPreviewStudio({ settings }: ProductCardPreviewStudioProps) {
  const [isSimulatedFocus, setIsSimulatedFocus] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const hoverStyle = settings.imageHoverStyle || 'second_image';
  const isZoom = hoverStyle === 'zoom';
  const isSecondImage = hoverStyle !== 'none' && hoverStyle !== 'zoom';

  const aspectClass = getSharedAspectClass(settings.imageAspectRatio || '3:4');
  const titleClampClass = getSharedTitleClampClass(settings.titleLineLimit || '2');
  const alignment = settings.card_alignment || 'left';
  const alignClass = alignment === 'center' ? 'items-center text-center' : alignment === 'right' ? 'items-end text-right' : 'items-start text-left';

  // Demo product imagery (high-quality fashion jewelry)
  const primaryImg = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=80';
  const secondaryImg = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80';

  const hoverStyleTitles: Record<string, string> = {
    second_image: 'Crossfade to Back Image',
    slide_left: 'Zara Slide Left / Right',
    zoom_swap: 'Editorial Zoom & Reveal',
    fade_up: 'Upward Drift Reveal',
    blur_crossfade: 'Apple Soft Blur Reveal',
    flip_3d: '3D Card Turn Flip',
    zoom: 'Primary Image Zoom (1.06x)',
    none: 'Static Image (No Effect)'
  };

  return (
    <div className="space-y-3.5 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-gray-50/70 via-white to-gray-50/40 dark:from-white/[0.03] dark:via-transparent dark:to-white/[0.01] shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Play className="h-3.5 w-3.5 text-[#e94560] fill-[#e94560]" />
          <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
            Live Animation &amp; Hover Studio
          </h4>
        </div>
        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#e94560]/10 text-[#e94560] uppercase tracking-wide">
          {hoverStyleTitles[hoverStyle] || hoverStyle}
        </span>
      </div>

      <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
        Hover with your mouse to test <strong>Desktop Hover</strong>, or click the button below to simulate <strong>Mobile Scroll Focus</strong>.
      </p>

      {/* Interactive Card Canvas Container */}
      <div className="flex justify-center items-center py-2">
        <div className="w-full max-w-[240px]">
          <div
            data-hover-effect={hoverStyle}
            onClick={() => setIsSimulatedFocus(prev => !prev)}
            style={{ borderRadius: 'var(--border-radius-card, 16px)' }}
            className={`z-card-container group relative flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer select-none ${
              isSimulatedFocus ? 'is-in-focus active-card ring-2 ring-[#e94560]/50' : ''
            }`}
            title="Click to toggle mobile focus state"
          >
            {/* Image Box */}
            <div className={`relative ${aspectClass} w-full overflow-hidden bg-gray-100 dark:bg-black/20`}>
              {/* Primary Image */}
              <Image
                src={primaryImg}
                alt="Demo Product"
                fill
                sizes="240px"
                className={`object-cover w-full h-full transition-all duration-300 pointer-events-none ${
                  isZoom ? 'hover-zoom' : ''
                } ${isSecondImage ? 'hover-fade-out' : ''}`}
                priority
              />

              {/* Secondary Image for hover/scroll animation */}
              {isSecondImage && (
                <Image
                  src={secondaryImg}
                  alt="Demo Product Alternate"
                  fill
                  sizes="240px"
                  className="object-cover w-full h-full absolute inset-0 transition-all duration-300 pointer-events-none hover-fade-in"
                  priority
                />
              )}

              {/* Badges on top-left */}
              <div className="absolute top-2 left-2 flex flex-col gap-1 z-[2] items-start pointer-events-none">
                <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[8px] font-black text-white shadow-xs uppercase tracking-wide">
                  -25%
                </span>
                <span className="rounded-full bg-[#e94560] px-2 py-0.5 text-[8px] font-black text-white shadow-xs uppercase tracking-wide">
                  FEATURED
                </span>
              </div>

              {/* Action Icons on top-right (Staggered smooth entry) */}
              <div
                className="card-actions absolute right-2 top-2 flex flex-col gap-1.5 z-[25] transition-all duration-200 ease-out"
                style={{ pointerEvents: 'none' }}
              >
                {settings.card_show_wishlist !== false && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsWishlisted(prev => !prev);
                    }}
                    className="action-btn pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full bg-white/95 dark:bg-[#16162a]/95 backdrop-blur-xs shadow-md border border-gray-200/80 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:text-[#e94560] transition-transform duration-200 cursor-pointer"
                    title="Add to Wishlist"
                  >
                    <Heart className={`h-3.5 w-3.5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                )}
                {settings.card_show_quickview !== false && (
                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    className="action-btn pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full bg-white/95 dark:bg-[#16162a]/95 backdrop-blur-xs shadow-md border border-gray-200/80 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:text-[#e94560] transition-transform duration-200 cursor-pointer"
                    title="Quick View"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                )}
                {settings.card_show_quickcart !== false && (
                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    className="action-btn pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full bg-white/95 dark:bg-[#16162a]/95 backdrop-blur-xs shadow-md border border-gray-200/80 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:text-[#e94560] transition-transform duration-200 cursor-pointer"
                    title="Add to Cart"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Card Content */}
            <div className={`p-3 flex flex-col ${alignClass}`}>
              <span className={`product-card-title font-bold text-xs text-gray-900 dark:text-white leading-tight ${titleClampClass}`}>
                Emerald Cut Solitaire Ring
              </span>

              {settings.card_show_stars !== false && (
                <div className="mt-1 flex items-center gap-0.5 text-[9px] text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                  <span className="text-[8px] text-gray-400 font-bold ml-0.5">(28)</span>
                </div>
              )}

              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="text-xs font-black text-gray-900 dark:text-white">
                  Rs. 4,850
                </span>
                <span className="text-[9px] text-gray-400 line-through">
                  Rs. 6,500
                </span>
              </div>

              {settings.card_show_description && (
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                  Handcrafted sterling silver ring with brilliant emerald-cut stone.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Control Toolbar */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => setIsSimulatedFocus(prev => !prev)}
          className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
            isSimulatedFocus
              ? 'bg-[#e94560] text-white hover:bg-[#d8344f]'
              : 'bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-gray-800 dark:text-white'
          }`}
        >
          <Smartphone className="h-3.5 w-3.5" />
          <span>{isSimulatedFocus ? 'Mobile Focused (Tap to Exit)' : 'Simulate Mobile Scroll Focus'}</span>
        </button>
        {isSimulatedFocus && (
          <button
            type="button"
            onClick={() => setIsSimulatedFocus(false)}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300 transition-all cursor-pointer"
            title="Reset focus"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
