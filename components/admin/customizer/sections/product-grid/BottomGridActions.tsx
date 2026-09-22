'use client';

import React from 'react';

interface BottomGridActionsProps {
  settings: Record<string, any>;
  handleSettingsChange: (key: string, value: any) => void;
}

export default function BottomGridActions({
  settings,
  handleSettingsChange,
}: BottomGridActionsProps) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Bottom Grid Actions</p>

      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
          Enable Bottom View All Button
        </label>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={settings.bottomEnableViewAll === true}
            onChange={(e) => handleSettingsChange('bottomEnableViewAll', e.target.checked)}
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
            onChange={(e) => handleSettingsChange('bottomViewAllText', e.target.value)}
            placeholder="Grid View All"
            className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
          />
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400">Bg Color</label>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={settings.bottomViewAllBgColor || '#FFD147'}
                onChange={(e) => handleSettingsChange('bottomViewAllBgColor', e.target.value)}
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
                onChange={(e) => handleSettingsChange('bottomViewAllTextColor', e.target.value)}
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
        <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
          Enable Bottom Load More Button
        </label>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={settings.bottomEnableLoadMore === true}
            onChange={(e) => handleSettingsChange('bottomEnableLoadMore', e.target.checked)}
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
            onChange={(e) => handleSettingsChange('bottomLoadMoreText', e.target.value)}
            placeholder="Load More"
            className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
          />
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400">Bg Color</label>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={settings.bottomLoadMoreBgColor || '#f1f5f9'}
                onChange={(e) => handleSettingsChange('bottomLoadMoreBgColor', e.target.value)}
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
                onChange={(e) => handleSettingsChange('bottomLoadMoreTextColor', e.target.value)}
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
  );
}
