'use client';

import React from 'react';
import { moveItemInArray } from '@/lib/utils/arrayMove';
import { StoreSettings } from '@/lib/types';
import { ChevronUp, ChevronDown, Info } from '@/components/common/Icons';
import { AccordionGroup } from '@/components/admin/customizer/controls';
import { SegmentedControl, ToggleControl, ColorControl } from '@/components/admin/customizer/controls';
import { ProductCardVisibilitySection } from './product-card/ProductCardVisibilitySection';
import { ProductCardSwatchSettingsSection } from './product-card/ProductCardSwatchSettingsSection';
import { ProductCardPreviewStudio } from './product-card/ProductCardPreviewStudio';
import { normalizeCardStyle, CARD_STYLE_OPTIONS } from '@/lib/utils/cardStyles';
import {
  IMAGE_HOVER_STYLE_OPTIONS,
  IMAGE_ASPECT_RATIO_OPTIONS,
  TITLE_LINE_LIMIT_OPTIONS,
  CARD_ICON_STYLE_OPTIONS,
  DEFAULT_IMAGE_HOVER_STYLE,
  DEFAULT_IMAGE_ASPECT_RATIO,
  DEFAULT_TITLE_LINE_LIMIT,
} from '@/lib/constants/productCardOptions';

interface ProductCardSettingsProps {
  settings: StoreSettings;
  onUpdateSettings: (updates: Partial<StoreSettings>) => void;
}

export default function ProductCardSettings({ settings, onUpdateSettings }: ProductCardSettingsProps) {
  const activeStyle = normalizeCardStyle(settings.card_style);
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

  const lockedAlignmentReason: Record<string, string> = {
    card_01: 'Parallel Footer Layout: Price and swatches share a justified horizontal row.',
    card_02: 'Centered Seam Silhouette: Content is centered to anchor directly under the seam action pill.',
    card_04: 'Dual Split Button: Text is centered to harmonize with the split action drawer.',
    card_05: 'Asymmetric Right Rail: Content is left-aligned to counterbalance the right action rail.',
    card_06: 'Full-Bleed Action Bar: Text is centered beneath the full-width cart bar.',
    card_07: 'Centered Bubble Geometry: Text is centered to align with the bottom action bubbles.',
    card_08: 'Baseline Locked Button: Centered alignment aligns with the baseline action button.',
    card_09: 'Seam Junction Button: Centered alignment aligns with the seam action button.',
    card_ella_04: 'Dedicated vendor/rating row locks content alignment.',
    card_ella_05: 'Dedicated horizontal swatch/title/price stack takes precedence over generic alignment.',
  };

  const lockedOrderReason: Record<string, string> = {
    card_01: 'Footer row locks price and swatches horizontally; vertical order is partial.',
    card_02: 'Fixed stack silhouette: title, price, swatches, sizes are centered.',
    card_03: 'Parallel options row: price and flat swatches share a single row.',
    card_04: 'Fixed stack silhouette matches the bottom options drawer.',
    card_05: 'Fixed stack layout counterbalances the right action rail.',
    card_06: 'Fixed stack layout sits directly under the black cart bar.',
    card_07: 'Fixed stack layout aligns with floating bubbles.',
    card_08: 'Bottom action button is permanently anchored to the card baseline.',
    card_09: 'Action button is permanently anchored to the seam junction.',
    card_10: 'Slide drawer houses variant selectors and quick shop stepper.',
    card_ella_04: 'Fixed vendor/rating row structure preserves the split-panel action layout.',
    card_ella_05: 'Swatches stay directly above title in the canonical horizontal stack.',
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
            <optgroup label="Base Store Themes (Protected — Never Touch)">
              {CARD_STYLE_OPTIONS.filter(o => o.group === 'Base Store Themes (Protected)').map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Elessi Theme (10 Styles)">
              {CARD_STYLE_OPTIONS.filter(o => o.group === 'Elessi Theme').map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Ella Theme (8 Styles)">
              {CARD_STYLE_OPTIONS.filter(o => o.group === 'Ella Theme').map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Action Icons Style Preset Selector */}
        <div className="space-y-1.5 pt-2">
          <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
            Action Icons Style Preset
          </label>
          <select
            value={settings.card_icon_style || 'pill'}
            onChange={(e) => onUpdateSettings({ card_icon_style: e.target.value as any })}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-[#f8f8f8] dark:bg-[#0f0f1b] px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
          >
            {CARD_ICON_STYLE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-gray-400">
            Chooses the visual aesthetic for Cart, Wishlist, and Quick View action icons.
          </p>
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
        {lockedAlignmentReason[activeStyle] && (
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300">
            <Info className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
            <span><strong>Silhouette Notice:</strong> {lockedAlignmentReason[activeStyle]} (Your preference remains saved for standard styles).</span>
          </div>
        )}
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
        {lockedOrderReason[activeStyle] && (
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300">
            <Info className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
            <span><strong>Silhouette Notice:</strong> {lockedOrderReason[activeStyle]} (Your preference remains saved for standard styles).</span>
          </div>
        )}
      </div>
      </div>
      </AccordionGroup>
    </div>
  );
}
