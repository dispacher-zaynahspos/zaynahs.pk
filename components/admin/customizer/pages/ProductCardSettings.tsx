'use client';

import React from 'react';
import { moveItemInArray } from '@/lib/utils/arrayMove';
import { StoreSettings } from '@/lib/types';
import { ChevronUp, ChevronDown } from '@/components/common/Icons';
import { AccordionGroup } from '@/components/admin/customizer/controls';
import { SegmentedControl, ToggleControl, ColorControl } from '@/components/admin/customizer/controls';
import { ProductCardVisibilitySection } from './product-card/ProductCardVisibilitySection';
import { ProductCardSwatchSettingsSection } from './product-card/ProductCardSwatchSettingsSection';
import { ProductCardPreviewStudio } from './product-card/ProductCardPreviewStudio';
import {
  IMAGE_HOVER_STYLE_OPTIONS,
  IMAGE_ASPECT_RATIO_OPTIONS,
  TITLE_LINE_LIMIT_OPTIONS,
  DEFAULT_IMAGE_HOVER_STYLE,
  DEFAULT_IMAGE_ASPECT_RATIO,
  DEFAULT_TITLE_LINE_LIMIT,
} from '@/lib/constants/productCardOptions';

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
    const newOrder = moveItemInArray(elementsOrder, index, direction);
    if (newOrder === elementsOrder) return;
    onUpdateSettings({ card_elements_order: newOrder });
  };


  return (
    <div className="space-y-3">
      {/* Templates Selector */}
      <AccordionGroup id="pc-style" title="Style & Template" defaultOpen>
      <div className="space-y-3.5 pt-2">
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
              <option value="showcase_8">Showcase 8 — Geometric Mondrian</option>
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
            value={settings.image_hover_style || DEFAULT_IMAGE_HOVER_STYLE}
            onChange={(e) => onUpdateSettings({ image_hover_style: e.target.value as any })}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-[#f8f8f8] dark:bg-[#0f0f1b] px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
          >
            {IMAGE_HOVER_STYLE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <p className="text-[10px] text-gray-400">
            Select the visual animation when hovering on desktop or scrolling past cards on mobile.
          </p>
        </div>

        {/* Mobile Activation Mode */}
        <div className="space-y-1.5 pt-2">
          <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
            Mobile Activation Mode
          </label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { v: 'scroll', label: 'Scroll Focus' },
              { v: 'touch', label: 'Touch' },
              { v: 'off', label: 'Off' },
            ] as const).map((opt) => {
              const active = (settings.card_mobile_activation || 'scroll') === opt.v;
              return (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => onUpdateSettings({ card_mobile_activation: opt.v })}
                  className={`py-2 text-center rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${active
                    ? 'border-[#e94560] bg-[#e94560]/5 text-[#e94560]'
                    : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] hover:border-gray-300 dark:hover:border-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-gray-400">
            On touch devices: <strong>Scroll Focus</strong> auto-reveals the card nearest the screen centre;
            <strong> Touch</strong> reveals only a tapped card; <strong>Off</strong> shows no hover image/icons
            (desktop hover still works). Desktop hover is unaffected.
          </p>
        </div>

        {/* Live Animation & Hover Preview Studio */}
        <ProductCardPreviewStudio settings={settings} onUpdateSettings={onUpdateSettings} />

        {/* Image Aspect Ratio */}
        <div className="space-y-1.5 pt-2">
          <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
            Image Aspect Ratio
          </label>
          <select
            value={settings.image_aspect_ratio || DEFAULT_IMAGE_ASPECT_RATIO}
            onChange={(e) => onUpdateSettings({ image_aspect_ratio: e.target.value })}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-[#f8f8f8] dark:bg-[#0f0f1b] px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
          >
            {IMAGE_ASPECT_RATIO_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
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
            value={settings.title_line_limit || DEFAULT_TITLE_LINE_LIMIT}
            onChange={(e) => onUpdateSettings({ title_line_limit: e.target.value as any })}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-[#f8f8f8] dark:bg-[#0f0f1b] px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
          >
            {TITLE_LINE_LIMIT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <p className="text-[10px] text-gray-400">
            Clamp long titles to maintain uniform card heights.
          </p>
        </div>
      </div>
      </AccordionGroup>

      {/* Visibility Toggles */}
      <AccordionGroup id="pc-visibility" title="Element Visibility" defaultOpen={false}>
      <div className="pt-2">
      <ProductCardVisibilitySection
        settings={settings}
        onUpdateSettings={onUpdateSettings}
        showStars={showStars}
        showWishlist={showWishlist}
        showQuickview={showQuickview}
        showQuickcart={showQuickcart}
      />
      </div>
      </AccordionGroup>

      {/* Swatch Customization */}
      <AccordionGroup id="pc-swatches" title="Swatches" defaultOpen={false}>
      <div className="pt-2">
      <ProductCardSwatchSettingsSection
        settings={settings}
        onUpdateSettings={onUpdateSettings}
      />
      </div>
      </AccordionGroup>

      {/* Alignment + ordering */}
      <AccordionGroup id="pc-appearance" title="Card Appearance" defaultOpen={false}>
      <div className="pt-2 divide-y divide-gray-50 dark:divide-gray-800/50">
        <SegmentedControl
          label="Card Shadow"
          value={settings.card_shadow ?? 'sm'}
          onChange={(v) => onUpdateSettings({ card_shadow: v as any })}
          options={[
            { label: 'None', value: 'none' },
            { label: 'Small', value: 'sm' },
            { label: 'Medium', value: 'md' },
            { label: 'Large', value: 'lg' },
          ]}
        />
        <ToggleControl
          label="Hover Lift"
          help="Card lifts slightly on hover (desktop)."
          value={settings.card_hover_lift ?? true}
          onChange={(v) => onUpdateSettings({ card_hover_lift: v })}
        />
        <ToggleControl
          label="Card Border"
          value={settings.card_border_enabled ?? true}
          onChange={(v) => onUpdateSettings({ card_border_enabled: v })}
        />
        <SegmentedControl
          label="Image Fit"
          value={settings.card_image_fit ?? 'contain'}
          onChange={(v) => onUpdateSettings({ card_image_fit: v as any })}
          options={[
            { label: 'Contain', value: 'contain' },
            { label: 'Cover', value: 'cover' },
          ]}
        />
        <ColorControl
          label="Compare-at Strike Color"
          help="Colour of the strikethrough on the original price. Red is the standard."
          value={settings.card_compare_color ?? '#ef4444'}
          onChange={(v) => onUpdateSettings({ card_compare_color: v })}
        />
        <ColorControl
          label="Sale Price Color"
          help="Leave blank to use the theme price colour."
          value={settings.card_sale_price_color ?? ''}
          onChange={(v) => onUpdateSettings({ card_sale_price_color: v })}
        />
      </div>
      </AccordionGroup>

      <AccordionGroup id="pc-layout" title="Alignment & Ordering" defaultOpen={false}>
      <div className="space-y-5 pt-2">
      {/* Alignment Selector */}
      <div className="space-y-3">
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
      <div className="space-y-3">
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
      </AccordionGroup>
    </div>
  );
}
