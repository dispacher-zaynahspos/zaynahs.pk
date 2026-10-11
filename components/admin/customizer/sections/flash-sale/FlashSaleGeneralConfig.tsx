import React from 'react';
import { HomepageSection } from '@/lib/types';
import ResponsiveGridColumnsControl from '@/components/admin/customizer/shared/ResponsiveGridColumnsControl';
import GridGapControl from '@/components/admin/customizer/shared/GridGapControl';
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

  const handleSettingsChange = (key: string, value: any) => {
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
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
            Product Limit
          </label>
          <span className="text-xs font-bold text-[#e94560]">
            {settings.limit || 8}
          </span>
        </div>
        <input
          type="range"
          min="2"
          max="24"
          step="2"
          value={settings.limit || 8}
          onChange={e => handleSettingsChange('limit', parseInt(e.target.value))}
          className="w-full accent-[#e94560]"
        />
      </div>

      <ResponsiveGridColumnsControl
        label="Flash Sale Grid Columns"
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

      <hr className="border-gray-200 dark:border-gray-800" />

      {/* Bottom Grid Actions — shared SSOT component (RULE SSOT-CATALOG-LAYOUTS Family F) */}
      <BottomGridActions settings={settings} handleSettingsChange={handleSettingsChange} />
    </div>
  );
}
