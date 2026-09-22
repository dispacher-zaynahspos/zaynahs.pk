'use client';

import React from 'react';
import { HomepageSection, Category, Product } from '@/lib/types';
import ManualProductPicker from './product-grid/ManualProductPicker';
import BottomGridActions from './product-grid/BottomGridActions';
import ResponsiveGridColumnsControl from '../shared/ResponsiveGridColumnsControl';

interface ProductGridSettingsProps {
  section: HomepageSection;
  categories: Category[];
  products?: Product[];
  viewportMode?: 'desktop' | 'tablet' | 'mobile';
  onUpdateSection: (updates: Partial<HomepageSection>) => void;
}

export default function ProductGridSettings({
  section,
  categories,
  products = [],
  viewportMode = 'desktop',
  onUpdateSection
}: ProductGridSettingsProps) {
  const settings = section.settings || {};

  const handleSettingsChange = (key: string, value: any) => {
    onUpdateSection({
      settings: { ...settings, [key]: value }
    });
  };

  const sortMethod = settings.sortMethod || (settings.source === 'featured' ? 'featured' : settings.source && settings.source !== 'all' ? 'category' : 'all');
  const manualProductIds: string[] = settings.manualProductIds || [];

  return (
    <div className="space-y-4">
      {/* Show/Hide Section Title Toggle */}
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2.5">
        <div>
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Show Section Title</span>
          <span className="text-[10px] text-gray-400">Display product grid title heading</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={settings.show_title !== false}
            onChange={(e) => handleSettingsChange('show_title', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
        </label>
      </div>
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
          Product Source
        </label>
        <select
          value={settings.source || 'all'}
          onChange={e => handleSettingsChange('source', e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
        >
          <option value="all">All Products</option>
          <option value="featured">Featured Products Only</option>
          {categories.filter(cat => cat.slug !== 'shop' && cat.id !== '00000000-0000-4000-8000-000000000099').map(cat => (
            <option key={cat.id} value={cat.id}>
              Category: {cat.name}
            </option>
          ))}
        </select>
      </div>

      <hr className="border-gray-200 dark:border-gray-800" />

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
          Sort Method
        </label>
        <select
          value={sortMethod}
          onChange={e => {
            handleSettingsChange('sortMethod', e.target.value);
            if (e.target.value === 'manual' && !settings.manualProductIds) {
              handleSettingsChange('manualProductIds', []);
            }
          }}
          className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
        >
          <option value="all">Default (as fetched)</option>
          <option value="manual">Manual Pick &amp; Sort</option>
          <option value="featured">Featured Only</option>
          <option value="recent">Newest First (Recent Added)</option>
          <option value="oldest">Oldest First</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="a_to_z">A to Z (Name)</option>
          <option value="z_to_a">Z to A (Name)</option>
          <option value="category">Selected Category Order</option>
        </select>
      </div>

      {sortMethod === 'manual' && (
        <ManualProductPicker
          products={products}
          manualProductIds={manualProductIds}
          settingsSource={settings.source}
          onUpdateManualIds={(ids) => handleSettingsChange('manualProductIds', ids)}
        />
      )}

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
      {/* Responsive Columns per Device (Mobile: 1-3, Tablet: 2-4, Desktop: 3-8) */}
      <ResponsiveGridColumnsControl
        label="Product Grid Columns"
        viewportMode={viewportMode}
        desktopCols={Number(settings.columns_desktop) || 4}
        tabletCols={Number(settings.columns_tablet) || 3}
        mobileCols={Number(settings.columns_mobile) || 2}
        onChangeDesktop={(cols) => handleSettingsChange('columns_desktop', cols)}
        onChangeTablet={(cols) => handleSettingsChange('columns_tablet', cols)}
        onChangeMobile={(cols) => handleSettingsChange('columns_mobile', cols)}
      />

      <hr className="border-gray-200 dark:border-gray-800" />

      {/* Upper View All Button Link & Toggle */}
      <div className="space-y-2.5 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Upper View All Link</span>
            <span className="text-[10px] text-gray-400">Link next to grid title header</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.show_upper_view_all !== false}
              onChange={(e) => handleSettingsChange('show_upper_view_all', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
          </label>
        </div>

        {settings.show_upper_view_all !== false && (
          <div className="space-y-2 pt-1 pl-2 border-l-2 border-[#e94560]/30">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Button Text</label>
              <input
                type="text"
                value={settings.viewAllText || ''}
                onChange={e => handleSettingsChange('viewAllText', e.target.value)}
                placeholder="View All"
                className="w-full px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Custom Link URL</label>
              <input
                type="text"
                value={settings.viewAllUrl || ''}
                onChange={e => handleSettingsChange('viewAllUrl', e.target.value)}
                placeholder="e.g. /shop?category=co-ord-sets"
                className="w-full px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
              />
              <p className="text-[10px] text-gray-400 leading-normal">
                If left blank, it will automatically link to the selected category page.
              </p>
            </div>
          </div>
        )}
      </div>

      <BottomGridActions
        settings={settings}
        handleSettingsChange={handleSettingsChange}
      />
    </div>
  );
}
