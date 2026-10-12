import React from 'react';
import { HomepageSection } from '@/lib/types';
import ResponsiveGridColumnsControl from '@/components/admin/customizer/shared/ResponsiveGridColumnsControl';
import GridGapControl from '@/components/admin/customizer/shared/GridGapControl';
import ContentWidthControl from '@/components/admin/customizer/shared/ContentWidthControl';
import FillRowsControl from '@/components/admin/customizer/shared/FillRowsControl';
import GridLimitControl from '@/components/admin/customizer/shared/GridLimitControl';
import CatalogLimitControl from '@/components/admin/customizer/shared/CatalogLimitControl';
import BottomGridActions from '@/components/admin/customizer/sections/product-grid/BottomGridActions';

interface FlashSaleGeneralConfigProps {
  section: HomepageSection;
  onUpdateSection: (updates: Partial<HomepageSection>) => void;
}

export default function FlashSaleGeneralConfig({
  section,
  onUpdateSection,
}: FlashSaleGeneralConfigProps) {
  const settings = section.settings || {};

  const handleSettingsChange = (key: string, value: unknown) => {
    onUpdateSection({
      settings: { ...settings, [key]: value }
    });
  };

  return (
    <div className="space-y-5">
      {/* Start / End Times */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
            Start Time
          </label>
          <input
            type="datetime-local"
            value={settings.startTime || ''}
            onChange={e => handleSettingsChange('startTime', e.target.value)}
            className="w-full px-2 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
            End Time
          </label>
          <input
            type="datetime-local"
            value={settings.endTime || ''}
            onChange={e => handleSettingsChange('endTime', e.target.value)}
            className="w-full px-2 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
          Upper View All Button Text
        </label>
        <input
          type="text"
          value={settings.viewAllText || ''}
          onChange={e => handleSettingsChange('viewAllText', e.target.value)}
          placeholder="View All"
          className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
          Upper View All Custom Link
        </label>
        <input
          type="text"
          value={settings.viewAllUrl || ''}
          onChange={e => handleSettingsChange('viewAllUrl', e.target.value)}
          placeholder="e.g. /shop?category=co-ord-sets"
          className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
        />
        <p className="text-[10px] text-gray-400 leading-normal">
          If left blank, it will automatically link to the selected category page.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
          Sort Method
        </label>
        <select
          value={settings.sortMethod || 'default'}
          onChange={e => handleSettingsChange('sortMethod', e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
        >
          <option value="default">Default</option>
          <option value="category">Selected Category Order</option>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="a_to_z">A to Z (Name)</option>
          <option value="z_to_a">Z to A (Name)</option>
        </select>
      </div>

      {/* PRODUCT LIMIT AND PAGINATION SETTINGS */}
      <CatalogLimitControl
        mode={settings.limit_mode || 'manual'}
        onChangeMode={(m) => handleSettingsChange('limit_mode', m)}
        rows={Number(settings.limit_rows) || 2}
        onChangeRows={(r) => handleSettingsChange('limit_rows', r)}
        manual={Number(settings.limit) || 8}
        onChangeManual={(v) => handleSettingsChange('limit', v)}
        previewColumns={Number(settings.columns_desktop) || 4}
      />

      <ResponsiveGridColumnsControl
        label="Flash Sale Grid Columns"
        mode={settings.columns_mode || 'manual'}
        onChangeMode={(m) => handleSettingsChange('columns_mode', m)}
        minCardDesktop={Number(settings.min_card_desktop) || 220}
        onChangeMinCardDesktop={(px) => handleSettingsChange('min_card_desktop', px)}
        desktopCols={Number(settings.columns_desktop) || 4}
        tabletCols={Number(settings.columns_tablet) || 3}
        mobileCols={Number(settings.columns_mobile) || 2}
        onChangeDesktop={(cols) => handleSettingsChange('columns_desktop', cols)}
        onChangeTablet={(cols) => handleSettingsChange('columns_tablet', cols)}
        onChangeMobile={(cols) => handleSettingsChange('columns_mobile', cols)}
      />

      {/* Grid Gap (Tight, Normal, Relaxed) — shared SSOT control */}
      <GridGapControl
        value={settings.grid_gap || 'normal'}
        onChange={(gap) => handleSettingsChange('grid_gap', gap)}
      />

      {/* Content Width (Boxed, Wide, Full) — shared SSOT control */}
      <ContentWidthControl
        value={settings.content_width || 'wide'}
        onChange={(w) => handleSettingsChange('content_width', w)}
      />

      {/* Fill Rows (round up to a full row) — shared SSOT control */}
      <FillRowsControl
        value={settings.fill_rows !== false}
        onChange={(v) => handleSettingsChange('fill_rows', v)}
      />

      <hr className="border-gray-200 dark:border-gray-800" />

      {/* Bottom Grid Actions — shared SSOT component (RULE SSOT-CATALOG-LAYOUTS Family F) */}
      <BottomGridActions settings={settings} handleSettingsChange={handleSettingsChange} />
    </div>
  );
}
