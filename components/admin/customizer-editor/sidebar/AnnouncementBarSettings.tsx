'use client';

import React from 'react';
import { StoreSettings } from '@/lib/types';

interface AnnouncementBarSettingsProps {
  storeSettings: StoreSettings;
  setStoreSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
}

export function AnnouncementBarSettings({
  storeSettings,
  setStoreSettings,
}: AnnouncementBarSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="min-w-0">
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block leading-none mb-1">Editing Section</span>
          <h4 className="text-sm font-black text-gray-900 dark:text-white truncate">
            Announcement Bar
          </h4>
        </div>
        <span className="text-[9px] font-black text-[#e94560] bg-[#e94560]/10 px-2.5 py-1 rounded-full uppercase tracking-wider flex-shrink-0">
          Top News Banner
        </span>
      </div>

      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2">
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Show Contacts Announcement Bar</span>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={storeSettings.headerShowTopBar}
            onChange={(e) => setStoreSettings(prev => ({ ...prev, headerShowTopBar: e.target.checked }))}
            className="sr-only peer"
          />
          <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
        </label>
      </div>

      {storeSettings.headerShowTopBar && (
        <div className="space-y-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-800">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500">Header Bar Phone</label>
            <input
              type="text"
              value={storeSettings.headerTopBarPhone || ''}
              onChange={(e) => setStoreSettings(prev => ({ ...prev, headerTopBarPhone: e.target.value }))}
              className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500">Header Bar Email</label>
            <input
              type="text"
              value={storeSettings.headerTopBarEmail || ''}
              onChange={(e) => setStoreSettings(prev => ({ ...prev, headerTopBarEmail: e.target.value }))}
              className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
            />
          </div>
        </div>
      )}

      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2">
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Show Marketing Announcement Bar</span>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={storeSettings.headerShowNewsletter}
            onChange={(e) => setStoreSettings(prev => ({ ...prev, headerShowNewsletter: e.target.checked }))}
            className="sr-only peer"
          />
          <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
        </label>
      </div>

      {storeSettings.headerShowNewsletter && (
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Announcement Text (one per line)</label>
          <textarea
            rows={4}
            value={storeSettings.headerNewsletterText || ''}
            onChange={(e) => setStoreSettings(prev => ({ ...prev, headerNewsletterText: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white resize-none"
          />
        </div>
      )}
    </div>
  );
}
