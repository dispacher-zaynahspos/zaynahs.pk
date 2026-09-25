'use client';

import React from 'react';

interface ProductsDesignCatalogSectionProps {
  imageHoverStyle: 'second_image' | 'zoom' | 'slide_left' | 'zoom_swap' | 'fade_up' | 'blur_crossfade' | 'flip_3d' | 'none';
  setImageHoverStyle: (val: any) => void;
  imageAspectRatio: string;
  setImageAspectRatio: (val: string) => void;
  titleLineLimit: '1' | '2' | 'none';
  setTitleLineLimit: (val: '1' | '2' | 'none') => void;
  cardMobileColumns: number;
  setCardMobileColumns: (val: number) => void;
  cardShowDescription: boolean;
  setCardShowDescription: (val: boolean) => void;
}

export function ProductsDesignCatalogSection({
  imageHoverStyle,
  setImageHoverStyle,
  imageAspectRatio,
  setImageAspectRatio,
  titleLineLimit,
  setTitleLineLimit,
  cardMobileColumns,
  setCardMobileColumns,
  cardShowDescription,
  setCardShowDescription,
}: ProductsDesignCatalogSectionProps) {
  return (
    <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 transition-colors">
      <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Design & Catalog Layout</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Configure product image styles, aspect ratios, and card layouts in lists</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Image Hover Style</label>
          <select
            value={imageHoverStyle}
            onChange={(e) => setImageHoverStyle(e.target.value as any)}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
          >
            <option value="second_image">Second Image (Fade Swap)</option>
            <option value="slide_left">Slide Left (Zara Style)</option>
            <option value="zoom_swap">Zoom & Swap (Luxury Editorial)</option>
            <option value="fade_up">Fade & Rise (Upward Drift)</option>
            <option value="blur_crossfade">Blur & Reveal (Apple Aesthetic)</option>
            <option value="flip_3d">3D Card Turn (Jewelry/Accessories)</option>
            <option value="zoom">Primary Image Zoom</option>
            <option value="none">None (Static Image)</option>
          </select>
          <p className="text-[10px] text-gray-400 mt-1">Select the visual effect when hovering over product catalog images.</p>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Image Aspect Ratio</label>
          <select
            value={imageAspectRatio}
            onChange={(e) => setImageAspectRatio(e.target.value)}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
          >
            <option value="1:1">1:1 (Square - Recommended)</option>
            <option value="3:4">3:4 (Portrait - Fashion)</option>
            <option value="4:3">4:3 (Landscape)</option>
            <option value="16:9">16:9 (Wide)</option>
            <option value="auto">Auto (Original height)</option>
          </select>
          <p className="text-[10px] text-gray-400 mt-1">Specify aspect sizing for product card images in grids.</p>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Archive Title Line Limit</label>
          <select
            value={titleLineLimit}
            onChange={(e) => setTitleLineLimit(e.target.value as any)}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
          >
            <option value="1">1 Line Limit</option>
            <option value="2">2 Lines Limit (Default)</option>
            <option value="none">Unlimited / Full Title</option>
          </select>
          <p className="text-[10px] text-gray-400 mt-1">Clamp long titles to save space or display the full product title.</p>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Mobile Grid Columns</label>
          <select
            value={cardMobileColumns}
            onChange={(e) => setCardMobileColumns(Number(e.target.value))}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
          >
            <option value={1}>1 Column (Large Cards)</option>
            <option value={2}>2 Columns (Standard Grid)</option>
          </select>
          <p className="text-[10px] text-gray-400 mt-1">Select column count for storefront product grids on mobile screens.</p>
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex flex-col sm:flex-row gap-6">
        <label className="flex items-center gap-3 cursor-pointer select-none text-sm">
          <input
            type="checkbox"
            checked={cardShowDescription}
            onChange={(e) => setCardShowDescription(e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
          />
          <div>
            <span className="font-bold text-gray-700 dark:text-gray-300 block">Show Catalog Descriptions</span>
            <span className="text-[10px] text-gray-400">Display short descriptions below titles on catalog grids.</span>
          </div>
        </label>
      </div>
    </div>
  );
}
