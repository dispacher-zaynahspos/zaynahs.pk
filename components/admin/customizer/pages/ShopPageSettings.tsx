import React, { useState, useEffect } from 'react';
import { StoreSettings } from '@/lib/types';
import ResponsiveGridColumnsControl from '@/components/admin/customizer/shared/ResponsiveGridColumnsControl';
import ResponsiveProductsPerPageControl from '@/components/admin/customizer/shared/ResponsiveProductsPerPageControl';
import GridGapControl from '@/components/admin/customizer/shared/GridGapControl';
import ContentWidthControl from '@/components/admin/customizer/shared/ContentWidthControl';
import FillRowsControl from '@/components/admin/customizer/shared/FillRowsControl';
import { Monitor, Tablet, Smartphone, Palette } from '@/components/common/Icons';
import { AccordionGroup } from '@/components/admin/customizer/controls';
import { SegmentedControl, ToggleControl } from '@/components/admin/customizer/controls';

interface ShopPageSettingsProps {
  settings: StoreSettings;
  viewportMode?: 'desktop' | 'tablet' | 'mobile';
  onUpdateSettings: (updates: Partial<StoreSettings>) => void;
  subTab: string;
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

  const sectionTitle = subTab === 'pagination' ? 'Pagination & Infinite Scroll' : 'Catalog Layout & Grid';
  const sectionBadge = subTab === 'pagination' ? 'Pagination' : 'Layout';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="min-w-0">
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block leading-none mb-1">Editing Section</span>
          <h4 className="text-sm font-black text-gray-900 dark:text-white truncate">{sectionTitle}</h4>
        </div>
        <span className="text-[9px] font-black text-[#e94560] bg-[#e94560]/10 px-2.5 py-1 rounded-full uppercase tracking-wider flex-shrink-0">
          {sectionBadge}
        </span>
      </div>

      {/* 1. Catalog Layout & Grid */}
      {(subTab === 'layout' || !subTab) && (
        <div className="space-y-4 pt-1">
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

          {/* Quick Category Chips Bar Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200/80 dark:border-gray-800">
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

          {/* Responsive Columns per Device */}
          <ResponsiveGridColumnsControl
            label="Shop Catalog Grid Columns"
            viewportMode={viewportMode}
            mode={settings.shop_columns_mode || 'manual'}
            onChangeMode={(m) => onUpdateSettings({ shop_columns_mode: m })}
            minCardDesktop={settings.shop_min_card_desktop || 220}
            onChangeMinCardDesktop={(px) => onUpdateSettings({ shop_min_card_desktop: px })}
            desktopCols={settings.shop_columns_desktop || 4}
            tabletCols={settings.shop_columns_tablet || 3}
            mobileCols={settings.shop_columns_mobile || 2}
            onChangeDesktop={(cols: number) => onUpdateSettings({ shop_columns_desktop: cols })}
            onChangeTablet={(cols: number) => onUpdateSettings({ shop_columns_tablet: cols })}
            onChangeMobile={(cols: number) => onUpdateSettings({ shop_columns_mobile: cols })}
          />

          <GridGapControl
            value={settings.shop_grid_gap ?? 'normal'}
            onChange={(v) => onUpdateSettings({ shop_grid_gap: v })}
          />

          <ContentWidthControl
            value={settings.shop_content_width ?? 'wide'}
            onChange={(w) => onUpdateSettings({ shop_content_width: w })}
          />

          <FillRowsControl
            value={settings.shop_fill_rows !== false}
            onChange={(v) => onUpdateSettings({ shop_fill_rows: v })}
          />

          <ToggleControl
            label="Show Breadcrumbs"
            help="Category/collection breadcrumb trail above the shop header."
            value={settings.shop_show_breadcrumbs ?? true}
            onChange={(v) => onUpdateSettings({ shop_show_breadcrumbs: v })}
          />

          {/* Filter Sidebar controls */}
          <div className="space-y-3 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02]">
            <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
              Filter Sidebar
            </span>

            {/* Position */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Position</label>
              <div className="grid grid-cols-3 gap-1.5">
                {([
                  { key: 'left', label: 'Left' },
                  { key: 'right', label: 'Right' },
                  { key: 'drawer', label: 'Drawer' },
                ] as const).map((p) => {
                  const active = (settings.shop_sidebar_position || 'left') === p.key;
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => onUpdateSettings({ shop_sidebar_position: p.key })}
                      className={`px-2 py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                        active
                          ? 'border-[#e94560] bg-[#e94560]/5 text-[#e94560]'
                          : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-gray-400 leading-normal">
                Drawer = no desktop sidebar; filters open via a Filters button (grid uses full width).
              </p>
            </div>

            <ToggleControl
              label="Sticky Sidebar"
              help="Sidebar stays in view while the product grid scrolls (left/right positions)."
              value={settings.shop_sidebar_sticky !== false}
              onChange={(v) => onUpdateSettings({ shop_sidebar_sticky: v })}
            />

            {/* Which filter blocks show */}
            <div className="pt-1 space-y-2.5">
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Show Filter Blocks</span>
              {([
                { key: 'shop_filter_show_categories', label: 'Categories' },
                { key: 'shop_filter_show_availability', label: 'Availability' },
                { key: 'shop_filter_show_price', label: 'Price Range' },
                { key: 'shop_filter_show_variations', label: 'Variations (color/size/material)' },
                { key: 'shop_filter_show_featured', label: 'Featured Products' },
              ] as const).map((b) => (
                <ToggleControl
                  key={b.key}
                  label={b.label}
                  value={(settings[b.key] as boolean | undefined) !== false}
                  onChange={(v) => onUpdateSettings({ [b.key]: v } as Partial<StoreSettings>)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Pagination & Infinite Scroll */}
      {subTab === 'pagination' && (
        <div className="space-y-4 pt-1">
          {/* Pagination Mode selector (Infinite / Load More / Numbered) */}
          <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200/80 dark:border-gray-800 space-y-2.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#e94560] block">
              Pagination Mode
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {([
                { key: 'infinite', label: 'Infinite', desc: 'Auto-load on scroll' },
                { key: 'load_more', label: 'Load More', desc: 'Button to load next' },
                { key: 'numbered', label: 'Numbered', desc: '1 2 3 pages' },
              ] as const).map((m) => {
                const current = settings.shop_pagination_mode
                  || (settings.shop_infinite_scroll ? 'infinite' : 'load_more');
                const active = current === m.key;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => onUpdateSettings({
                      shop_pagination_mode: m.key,
                      // keep legacy flag in sync so existing storefront reads still work
                      shop_infinite_scroll: m.key === 'infinite',
                    })}
                    className={`px-2 py-2 rounded-lg border text-center transition-all cursor-pointer ${
                      active
                        ? 'border-[#e94560] bg-[#e94560]/5 text-[#e94560]'
                        : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    <span className="block text-[11px] font-bold">{m.label}</span>
                    <span className="block text-[9px] text-gray-400 leading-tight mt-0.5">{m.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Load More Button Style (only for Load More mode) */}
          {(settings.shop_pagination_mode === 'load_more'
            || (!settings.shop_pagination_mode && !settings.shop_infinite_scroll)) && (
            <div className="space-y-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200/80 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#e94560] block">
                  Load More Button Style
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ shop_load_more_bg: '', shop_load_more_text_color: '' })}
                  className="text-[9px] text-gray-400 hover:text-[#e94560] font-bold uppercase tracking-wider cursor-pointer"
                  title="Reset to theme primary button colors"
                >
                  Reset to Theme
                </button>
              </div>

              <input
                type="text"
                value={settings.shop_load_more_text || ''}
                onChange={(e) => onUpdateSettings({ shop_load_more_text: e.target.value })}
                placeholder="Load More"
                className="w-full px-3 py-2 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#e94560]"
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Button Bg</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={settings.shop_load_more_bg || settings.theme_config?.buttons?.primaryBg || settings.theme_config?.colors?.primary || '#0F2A5E'}
                      onChange={(e) => onUpdateSettings({ shop_load_more_bg: e.target.value })}
                      className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={settings.shop_load_more_bg || ''}
                      onChange={(e) => onUpdateSettings({ shop_load_more_bg: e.target.value })}
                      placeholder={settings.theme_config?.buttons?.primaryBg || settings.theme_config?.colors?.primary || '#0F2A5E'}
                      className="w-full px-2 py-1 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-mono font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Text Color</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={settings.shop_load_more_text_color || settings.theme_config?.buttons?.primaryText || '#ffffff'}
                      onChange={(e) => onUpdateSettings({ shop_load_more_text_color: e.target.value })}
                      className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={settings.shop_load_more_text_color || ''}
                      onChange={(e) => onUpdateSettings({ shop_load_more_text_color: e.target.value })}
                      placeholder={settings.theme_config?.buttons?.primaryText || '#FFFFFF'}
                      className="w-full px-2 py-1 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-mono font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* View All button (optional, like Home grid) */}
          <div className="space-y-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200/80 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">View All Button</span>
                <span className="text-[10px] text-gray-400">Show a button that links to the full catalog</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.shop_enable_view_all === true}
                  onChange={(e) => onUpdateSettings({ shop_enable_view_all: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
              </label>
            </div>
            {settings.shop_enable_view_all === true && (
              <div className="space-y-2 pl-2 border-l-2 border-[#e94560]/30">
                <input
                  type="text"
                  value={settings.shop_view_all_text || ''}
                  onChange={(e) => onUpdateSettings({ shop_view_all_text: e.target.value })}
                  placeholder="View All"
                  className="w-full px-3 py-2 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#e94560]"
                />
                <input
                  type="text"
                  value={settings.shop_view_all_url || ''}
                  onChange={(e) => onUpdateSettings({ shop_view_all_url: e.target.value })}
                  placeholder="/shop"
                  className="w-full px-3 py-2 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-mono focus:outline-none focus:border-[#e94560]"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Button Bg</label>
                    <input
                      type="color"
                      value={settings.shop_view_all_bg || settings.theme_config?.colors?.primary || '#0F2A5E'}
                      onChange={(e) => onUpdateSettings({ shop_view_all_bg: e.target.value })}
                      className="w-full h-7 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer overflow-hidden p-0 bg-transparent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Text Color</label>
                    <input
                      type="color"
                      value={settings.shop_view_all_text_color || '#ffffff'}
                      onChange={(e) => onUpdateSettings({ shop_view_all_text_color: e.target.value })}
                      className="w-full h-7 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer overflow-hidden p-0 bg-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Products Per Page / Load More Limit (Responsive per Device) */}
          <ResponsiveProductsPerPageControl
            viewportMode={viewportMode}
            desktopLimit={settings.shop_products_per_page_desktop || settings.shop_products_per_page || 12}
            tabletLimit={settings.shop_products_per_page_tablet || settings.shop_products_per_page || 12}
            mobileLimit={settings.shop_products_per_page_mobile || 8}
            onChangeDesktop={(val) =>
              onUpdateSettings({
                shop_products_per_page_desktop: val,
                shop_products_per_page: val,
              })
            }
            onChangeTablet={(val) => onUpdateSettings({ shop_products_per_page_tablet: val })}
            onChangeMobile={(val) => onUpdateSettings({ shop_products_per_page_mobile: val })}
          />
        </div>
      )}
    </div>
  );
}
