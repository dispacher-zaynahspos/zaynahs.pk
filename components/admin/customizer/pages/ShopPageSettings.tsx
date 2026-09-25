import React from 'react';
import { StoreSettings } from '@/lib/types';
import ResponsiveGridColumnsControl from '@/components/admin/customizer/shared/ResponsiveGridColumnsControl';

interface ShopPageSettingsProps {
  settings: StoreSettings;
  viewportMode?: 'desktop' | 'tablet' | 'mobile';
  onUpdateSettings: (updates: Partial<StoreSettings>) => void;
  subTab: 'swatches' | 'layout';
}

export default function ShopPageSettings({
  settings,
  viewportMode = 'desktop',
  onUpdateSettings,
  subTab
}: ShopPageSettingsProps) {
  if (subTab === 'swatches') {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Enable Variant Swatches</span>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.enableVariantSwatches}
                onChange={(e) => onUpdateSettings({ enableVariantSwatches: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
            </label>
          </div>

          {settings.enableVariantSwatches && (
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Swatch Shape</label>
                <div className="flex gap-2">
                  {(['circle', 'square'] as const).map(shape => (
                    <button
                      key={shape}
                      type="button"
                      onClick={() => onUpdateSettings({ swatchShape: shape })}
                      className={`flex-1 py-2 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                        settings.swatchShape === shape
                          ? 'border-[#e94560] bg-[#e94560]/5 text-[#e94560]'
                          : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 text-gray-500'
                      }`}
                    >
                      {shape}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Swatch Limit on Cards</label>
                <select
                  value={settings.swatchLimit}
                  onChange={(e) => onUpdateSettings({ swatchLimit: Number(e.target.value) })}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map((num) => (
                    <option key={num} value={num}>{num} swatches</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Archive Swatch Size</label>
                <select
                  value={settings.archiveSwatchSize || 'md'}
                  onChange={(e) => onUpdateSettings({ archiveSwatchSize: e.target.value as any })}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                >
                  {['sm', 'md', 'lg', 'xl', 'xxl'].map((sz) => (
                    <option key={sz} value={sz}>{sz.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Archive Swatch Alignment</label>
                <div className="flex gap-2">
                  {(['left', 'center', 'right'] as const).map(align => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => onUpdateSettings({ archiveSwatchAlign: align })}
                      className={`flex-1 py-2 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                        settings.archiveSwatchAlign === align
                          ? 'border-[#e94560] bg-[#e94560]/5 text-[#e94560]'
                          : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 text-gray-500'
                      }`}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Image Hover Style</label>
          <select
            value={settings.imageHoverStyle || 'second_image'}
            onChange={(e) => onUpdateSettings({ imageHoverStyle: e.target.value as any })}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
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
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Image Aspect Ratio</label>
          <select
            value={settings.imageAspectRatio || '1:1'}
            onChange={(e) => onUpdateSettings({ imageAspectRatio: e.target.value })}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
          >
            <option value="1:1">1:1 (Square)</option>
            <option value="3:4">3:4 (Portrait)</option>
            <option value="4:3">4:3 (Landscape)</option>
            <option value="auto">Auto (Original height)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Title Line Limit</label>
          <select
            value={settings.titleLineLimit || '2'}
            onChange={(e) => onUpdateSettings({ titleLineLimit: e.target.value as any })}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
          >
            <option value="1">1 Line</option>
            <option value="2">2 Lines</option>
            <option value="none">Full Title</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Default Variant Index</label>
          <select
            value={settings.defaultVariantIndex}
            onChange={(e) => onUpdateSettings({ defaultVariantIndex: Number(e.target.value) })}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                {num === 1 ? '1st Variant (Default)' : `${num}nd Variant`}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Show Variations on Catalog</span>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.card_show_swatches !== false}
              onChange={(e) => onUpdateSettings({ card_show_swatches: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
          </label>
        </div>

        {/* Quick Category Chips Bar Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Quick Category Chips</span>
            <span className="text-[10px] text-gray-400">1-tap category bar on top of product catalog</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.shop_category_chips_enabled !== false}
              onChange={(e) => onUpdateSettings({ shop_category_chips_enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
          </label>
        </div>

        {/* Infinite Scroll Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Infinite Scroll</span>
            <span className="text-[10px] text-gray-400">Auto-load next products when scrolling down</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.shop_infinite_scroll === true}
              onChange={(e) => onUpdateSettings({ shop_infinite_scroll: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
          </label>
        </div>

        {/* Responsive Columns per Device (Mobile: 1-3, Tablet: 2-4, Desktop: 3-8) */}
        <ResponsiveGridColumnsControl
          label="Shop Catalog Grid Columns"
          viewportMode={viewportMode}
          desktopCols={settings.shop_columns_desktop || 4}
          tabletCols={settings.shop_columns_tablet || 3}
          mobileCols={settings.shop_columns_mobile || 2}
          onChangeDesktop={(cols: number) => onUpdateSettings({ shop_columns_desktop: cols })}
          onChangeTablet={(cols: number) => onUpdateSettings({ shop_columns_tablet: cols })}
          onChangeMobile={(cols: number) => onUpdateSettings({ shop_columns_mobile: cols })}
        />

        {/* Products Per Page / Load More Limit */}
        <div className="space-y-2 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02]">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
              Products per Page / Batch Limit
            </label>
            <span className="text-xs font-black text-[#e94560]">
              {settings.shop_products_per_page || 12} products
            </span>
          </div>
          <input
            type="range"
            min="6"
            max="48"
            step="2"
            value={settings.shop_products_per_page || 12}
            onChange={(e) => onUpdateSettings({ shop_products_per_page: parseInt(e.target.value) })}
            className="w-full accent-[#e94560] cursor-pointer"
          />
          <div className="flex gap-1.5 pt-1">
            {[8, 12, 16, 24, 36, 48].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onUpdateSettings({ shop_products_per_page: preset })}
                className={`flex-1 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                  (settings.shop_products_per_page || 12) === preset
                    ? 'border-[#e94560] bg-[#e94560]/10 text-[#e94560] font-black'
                    : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-[#16162a]'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-400">
            Number of products shown initially and loaded on each &quot;Load More&quot; click or infinite scroll batch.
          </p>
        </div>
      </div>
    </div>
  );
}
