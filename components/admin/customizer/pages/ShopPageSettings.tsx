import React, { useState, useEffect } from 'react';
import { StoreSettings } from '@/lib/types';
import ResponsiveGridColumnsControl from '@/components/admin/customizer/shared/ResponsiveGridColumnsControl';
import { Monitor, Tablet, Smartphone } from '@/components/common/Icons';
import { AccordionGroup } from '@/components/admin/customizer/controls';
import { SegmentedControl, ToggleControl } from '@/components/admin/customizer/controls';

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
  const [pageSizeDevice, setPageSizeDevice] = useState<'desktop' | 'tablet' | 'mobile'>(viewportMode);

  useEffect(() => {
    if (viewportMode) {
      setPageSizeDevice(viewportMode);
    }
  }, [viewportMode]);
  if (subTab === 'swatches') {
    // Swatch controls are a single source on the PRODUCT CARDS tab
    // (ProductCardSwatchSettingsSection). This subtab previously duplicated all
    // 5 swatch columns and drifted (different default guards) — removed per SSOT1.
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-white/[0.02] p-5 text-center space-y-2">
          <span className="text-2xl">🎨</span>
          <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Swatches moved to Product Cards</h4>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal max-w-[240px] mx-auto">
            Variant swatch shape, size, limit and alignment are now configured once on the
            <strong> Product Cards</strong> tab and apply everywhere (shop, home, search).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AccordionGroup id="shop-catalog-layout" title="Catalog Layout" defaultOpen>
      <div className="space-y-4 pt-2">
        {/* Card appearance (image hover, aspect ratio, title lines, swatch visibility)
            lives ONLY on the Product Cards tab — a global card setting shared by
            shop/home/search. Removed the duplicate controls here per SSOT1.
            Shop tab keeps only shop-specific layout: default variant, category chips,
            infinite scroll, grid columns, products-per-page. */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Default Variant Index</label>
          <select
            value={settings.default_variant_index}
            onChange={(e) => onUpdateSettings({ default_variant_index: Number(e.target.value) })}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                {num === 1 ? '1st Variant (Default)' : `${num}nd Variant`}
              </option>
            ))}
          </select>
        </div>

        {/* "Show Variations on Catalog" (card_show_swatches) removed — it duplicated
            the Product Cards ▸ Visibility toggle. Configure it there (SSOT1). */}

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

        <SegmentedControl
          label="Grid Gap"
          value={settings.shop_grid_gap ?? 'normal'}
          onChange={(v) => onUpdateSettings({ shop_grid_gap: v as any })}
          options={[
            { label: 'Tight', value: 'tight' },
            { label: 'Normal', value: 'normal' },
            { label: 'Relaxed', value: 'relaxed' },
          ]}
        />

        <ToggleControl
          label="Show Breadcrumbs"
          help="Category/collection breadcrumb trail above the shop header."
          value={settings.shop_show_breadcrumbs ?? true}
          onChange={(v) => onUpdateSettings({ shop_show_breadcrumbs: v })}
        />

        {/* Products Per Page / Load More Limit (Responsive per Device) */}
        <div className="space-y-2.5 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
              Products per Page Limit
            </label>
            <div className="flex items-center bg-gray-200/80 dark:bg-gray-800 p-0.5 rounded-lg text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setPageSizeDevice('desktop')}
                className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                  pageSizeDevice === 'desktop'
                    ? 'bg-white dark:bg-[#16162a] text-[#e94560] shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Desktop limit"
              >
                <Monitor className="h-3 w-3" />
                <span className="hidden xs:inline">Desk</span>
              </button>
              <button
                type="button"
                onClick={() => setPageSizeDevice('tablet')}
                className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                  pageSizeDevice === 'tablet'
                    ? 'bg-white dark:bg-[#16162a] text-[#e94560] shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Tablet limit"
              >
                <Tablet className="h-3 w-3" />
                <span className="hidden xs:inline">Tab</span>
              </button>
              <button
                type="button"
                onClick={() => setPageSizeDevice('mobile')}
                className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                  pageSizeDevice === 'mobile'
                    ? 'bg-white dark:bg-[#16162a] text-[#e94560] shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Mobile limit"
              >
                <Smartphone className="h-3 w-3" />
                <span className="hidden xs:inline">Mob</span>
              </button>
            </div>
          </div>

          {pageSizeDevice === 'desktop' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] text-gray-500 font-semibold">
                <span>Desktop Batch Limit</span>
                <span className="text-xs font-black text-[#e94560]">
                  {settings.shop_products_per_page_desktop || settings.shop_products_per_page || 12} products
                </span>
              </div>
              <input
                type="range"
                min="6"
                max="48"
                step="2"
                value={settings.shop_products_per_page_desktop || settings.shop_products_per_page || 12}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  onUpdateSettings({
                    shop_products_per_page_desktop: val,
                    shop_products_per_page: val
                  });
                }}
                className="w-full accent-[#e94560] cursor-pointer"
              />
              <div className="flex gap-1.5 pt-1">
                {[8, 12, 16, 24, 36, 48].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onUpdateSettings({
                      shop_products_per_page_desktop: preset,
                      shop_products_per_page: preset
                    })}
                    className={`flex-1 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                      (settings.shop_products_per_page_desktop || settings.shop_products_per_page || 12) === preset
                        ? 'border-[#e94560] bg-[#e94560]/10 text-[#e94560] font-black'
                        : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-[#16162a]'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          )}

          {pageSizeDevice === 'tablet' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] text-gray-500 font-semibold">
                <span>Tablet Batch Limit</span>
                <span className="text-xs font-black text-[#e94560]">
                  {settings.shop_products_per_page_tablet || settings.shop_products_per_page || 12} products
                </span>
              </div>
              <input
                type="range"
                min="4"
                max="36"
                step="2"
                value={settings.shop_products_per_page_tablet || settings.shop_products_per_page || 12}
                onChange={(e) => onUpdateSettings({ shop_products_per_page_tablet: parseInt(e.target.value) })}
                className="w-full accent-[#e94560] cursor-pointer"
              />
              <div className="flex gap-1.5 pt-1">
                {[6, 9, 12, 18, 24, 36].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onUpdateSettings({ shop_products_per_page_tablet: preset })}
                    className={`flex-1 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                      (settings.shop_products_per_page_tablet || settings.shop_products_per_page || 12) === preset
                        ? 'border-[#e94560] bg-[#e94560]/10 text-[#e94560] font-black'
                        : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-[#16162a]'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          )}

          {pageSizeDevice === 'mobile' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] text-gray-500 font-semibold">
                <span>Mobile Batch Limit</span>
                <span className="text-xs font-black text-[#e94560]">
                  {settings.shop_products_per_page_mobile || 8} products
                </span>
              </div>
              <input
                type="range"
                min="4"
                max="24"
                step="2"
                value={settings.shop_products_per_page_mobile || 8}
                onChange={(e) => onUpdateSettings({ shop_products_per_page_mobile: parseInt(e.target.value) })}
                className="w-full accent-[#e94560] cursor-pointer"
              />
              <div className="flex gap-1.5 pt-1">
                {[4, 6, 8, 10, 12, 16].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onUpdateSettings({ shop_products_per_page_mobile: preset })}
                    className={`flex-1 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                      (settings.shop_products_per_page_mobile || 8) === preset
                        ? 'border-[#e94560] bg-[#e94560]/10 text-[#e94560] font-black'
                        : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-[#16162a]'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="text-[10px] text-gray-400">
            Number of products shown initially and loaded on each &quot;Load More&quot; click or infinite scroll batch per device.
          </p>
        </div>
      </div>
      </AccordionGroup>
    </div>
  );
}
