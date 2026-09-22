import React from 'react';
import { HomepageSection } from '@/lib/types';

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

      <hr className="border-gray-200 dark:border-gray-800" />

      <div className="space-y-3">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Bottom Grid Actions</p>

        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">Enable Bottom View All Button</label>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.bottomEnableViewAll === true}
              onChange={e => handleSettingsChange('bottomEnableViewAll', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
          </label>
        </div>

        {settings.bottomEnableViewAll === true && (
          <div className="space-y-2 pl-2 border-l-2 border-[#e94560]/30">
            <input
              type="text"
              value={settings.bottomViewAllText || ''}
              onChange={e => handleSettingsChange('bottomViewAllText', e.target.value)}
              placeholder="Grid View All"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
            />
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400">Bg Color</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={settings.bottomViewAllBgColor || '#FFD147'}
                  onChange={e => handleSettingsChange('bottomViewAllBgColor', e.target.value)}
                  className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => handleSettingsChange('bottomViewAllBgColor', '')}
                  className="text-[9px] text-gray-400 hover:text-[#e94560] font-bold uppercase tracking-wider cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400">Text Color</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={settings.bottomViewAllTextColor || '#0f172a'}
                  onChange={e => handleSettingsChange('bottomViewAllTextColor', e.target.value)}
                  className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => handleSettingsChange('bottomViewAllTextColor', '')}
                  className="text-[9px] text-gray-400 hover:text-[#e94560] font-bold uppercase tracking-wider cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">Enable Bottom Load More Button</label>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.bottomEnableLoadMore === true}
              onChange={e => handleSettingsChange('bottomEnableLoadMore', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
          </label>
        </div>

        {settings.bottomEnableLoadMore === true && (
          <div className="space-y-2 pl-2 border-l-2 border-[#e94560]/30">
            <input
              type="text"
              value={settings.bottomLoadMoreText || ''}
              onChange={e => handleSettingsChange('bottomLoadMoreText', e.target.value)}
              placeholder="Load More"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
            />
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400">Bg Color</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={settings.bottomLoadMoreBgColor || '#f1f5f9'}
                  onChange={e => handleSettingsChange('bottomLoadMoreBgColor', e.target.value)}
                  className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => handleSettingsChange('bottomLoadMoreBgColor', '')}
                  className="text-[9px] text-gray-400 hover:text-[#e94560] font-bold uppercase tracking-wider cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400">Text Color</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={settings.bottomLoadMoreTextColor || '#1e293b'}
                  onChange={e => handleSettingsChange('bottomLoadMoreTextColor', e.target.value)}
                  className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => handleSettingsChange('bottomLoadMoreTextColor', '')}
                  className="text-[9px] text-gray-400 hover:text-[#e94560] font-bold uppercase tracking-wider cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
