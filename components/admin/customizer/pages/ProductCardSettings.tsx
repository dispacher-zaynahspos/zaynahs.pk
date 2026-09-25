'use client';

import React from 'react';
import { StoreSettings } from '@/lib/types';
import { ChevronUp, ChevronDown } from '@/components/common/Icons';
import { ProductCardVisibilitySection } from './product-card/ProductCardVisibilitySection';
import { ProductCardSwatchSettingsSection } from './product-card/ProductCardSwatchSettingsSection';
import { ProductCardPreviewStudio } from './product-card/ProductCardPreviewStudio';

interface ProductCardSettingsProps {
  settings: StoreSettings;
  onUpdateSettings: (updates: Partial<StoreSettings>) => void;
}

export default function ProductCardSettings({ settings, onUpdateSettings }: ProductCardSettingsProps) {
  const activeStyle = settings.card_style || 'style1';
  const activeVariant = settings.card_variant || 'v1';
  const showStars = settings.card_show_stars !== false;
  const showQuickview = settings.card_show_quickview !== false;
  const showWishlist = settings.card_show_wishlist !== false;
  const showQuickcart = settings.card_show_quickcart !== false;
  const alignment = settings.card_alignment || 'left';
  const elementsOrder = settings.card_elements_order || ['title', 'rating', 'price', 'swatches'];


  const elementLabels: Record<string, string> = {
    title: 'Product Title',
    rating: 'Star Rating',
    price: 'Price Tag',
    swatches: 'Color Swatches'
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...elementsOrder];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex >= 0 && swapIndex < newOrder.length) {
      const temp = newOrder[index];
      newOrder[index] = newOrder[swapIndex];
      newOrder[swapIndex] = temp;
      onUpdateSettings({ card_elements_order: newOrder });
    }
  };


  return (
    <div className="space-y-6">
      {/* Templates Selector */}
      <div className="space-y-3.5">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
            Product Card Style Template
          </label>
          <select
            value={activeStyle}
            onChange={(e) => onUpdateSettings({ card_style: e.target.value as any })}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-[#f8f8f8] dark:bg-[#0f0f1b] px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
          >
            <optgroup label="Default Base Template">
              <option value="style1">00 — Classic Standard</option>
            </optgroup>

            <optgroup label="Modern Showcase Layouts">
              <option value="showcase_1">Showcase 1 — Neumorphic Soft Grey</option>
              <option value="showcase_2">Showcase 2 — Color Block Neon</option>
              <option value="showcase_3">Showcase 3 — Glassmorphism Glow</option>
              <option value="showcase_4">Showcase 4 — Claymorphism Coral</option>
              <option value="showcase_5">Showcase 5 — Detailed E-Commerce</option>
              <option value="showcase_6">Showcase 6 — Dark Elegance Gold</option>
              <option value="showcase_7">Showcase 7 — Typographic Brutalist</option>
              <option value="showcase_8">Showcase 8 — Geometric Mondrian</option>
              <option value="showcase_9">Showcase 9 — Material M3 Dynamic</option>
              <option value="showcase_10">Showcase 10 — Organic & Wavy</option>
            </optgroup>
          </select>
        </div>

        {/* Image Hover Style Selector */}
        <div className="space-y-1.5 pt-2">
          <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
            Image Hover / Scroll Animation Style
          </label>
          <select
            value={settings.imageHoverStyle || 'second_image'}
            onChange={(e) => onUpdateSettings({ imageHoverStyle: e.target.value as any })}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-[#f8f8f8] dark:bg-[#0f0f1b] px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
          >
            <option value="second_image">Second Image (Fade Swap)</option>
            <option value="slide_left">Slide Left (Zara Style)</option>
            <option value="zoom_swap">Zoom &amp; Swap (Luxury Editorial)</option>
            <option value="fade_up">Fade &amp; Rise (Upward Drift)</option>
            <option value="blur_crossfade">Blur &amp; Reveal (Apple Aesthetic)</option>
            <option value="flip_3d">3D Card Turn (Jewelry/Accessories)</option>
            <option value="zoom">Primary Image Zoom</option>
            <option value="none">None (Static Image)</option>
          </select>
          <p className="text-[10px] text-gray-400">
            Select the visual animation when hovering on desktop or scrolling past cards on mobile.
          </p>
        </div>

        {/* Live Animation & Hover Preview Studio */}
        <ProductCardPreviewStudio settings={settings} />

        {/* Image Aspect Ratio */}
        <div className="space-y-1.5 pt-2">
          <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
            Image Aspect Ratio
          </label>
          <select
            value={settings.imageAspectRatio || '3:4'}
            onChange={(e) => onUpdateSettings({ imageAspectRatio: e.target.value })}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-[#f8f8f8] dark:bg-[#0f0f1b] px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
          >
            <option value="3:4">3:4 (Portrait - Fashion &amp; Apparel)</option>
            <option value="1:1">1:1 (Square - Jewelry &amp; Accessories)</option>
            <option value="4:3">4:3 (Landscape)</option>
            <option value="auto">Auto (Natural height)</option>
          </select>
          <p className="text-[10px] text-gray-400">
            Specify image aspect ratio across all catalog grids.
          </p>
        </div>

        {/* Title Line Limit */}
        <div className="space-y-1.5 pt-2">
          <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
            Archive Title Line Limit
          </label>
          <select
            value={settings.titleLineLimit || '2'}
            onChange={(e) => onUpdateSettings({ titleLineLimit: e.target.value as any })}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-[#f8f8f8] dark:bg-[#0f0f1b] px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
          >
            <option value="1">1 Line Limit</option>
            <option value="2">2 Lines Limit (Default)</option>
            <option value="none">Full Title (Unlimited)</option>
          </select>
          <p className="text-[10px] text-gray-400">
            Clamp long titles to maintain uniform card heights.
          </p>
        </div>

        {/* Show Catalog Short Descriptions Toggle */}
        <div className="flex items-center justify-between pt-2 pb-1 border-t border-gray-100 dark:border-gray-800">
          <div>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Show Catalog Descriptions</span>
            <span className="text-[10px] text-gray-400">Display short descriptions below titles on catalog grids</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.card_show_description === true}
              onChange={(e) => onUpdateSettings({ card_show_description: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
          </label>
        </div>
      </div>

      {/* Visibility Toggles */}
      <ProductCardVisibilitySection
        settings={settings}
        onUpdateSettings={onUpdateSettings}
        showStars={showStars}
        showWishlist={showWishlist}
        showQuickview={showQuickview}
        showQuickcart={showQuickcart}
      />

      {/* Swatch Customization */}
      <ProductCardSwatchSettingsSection
        settings={settings}
        onUpdateSettings={onUpdateSettings}
      />

      {/* Alignment Selector */}
      <div className="space-y-3 border-t border-gray-150 dark:border-gray-800 pt-5">
        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
          Content Alignment
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['left', 'center', 'right'].map(align => {
            const isActive = alignment === align;
            return (
              <button
                key={align}
                onClick={() => onUpdateSettings({ card_alignment: align as any })}
                className={`py-2 text-center rounded-xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${isActive
                  ? 'border-[#e94560] bg-[#e94560]/5 text-[#e94560]'
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] hover:border-gray-300 dark:hover:border-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
              >
                {align}
              </button>
            );
          })}
        </div>
      </div>

      {/* Vertical Element Ordering */}
      <div className="space-y-3 border-t border-gray-150 dark:border-gray-800 pt-5">
        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
          Vertical Elements Sorting
        </label>
        <div className="space-y-2">
          {elementsOrder.map((element, idx) => (
            <div
              key={element}
              className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] rounded-xl shadow-sm"
            >
              <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
                {elementLabels[element] || element}
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, 'up')}
                  className="h-7 w-7 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={idx === elementsOrder.length - 1}
                  onClick={() => handleMove(idx, 'down')}
                  className="h-7 w-7 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
