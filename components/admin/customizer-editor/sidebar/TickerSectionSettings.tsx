'use client';

import React from 'react';
import { HomepageSection, StoreSettings } from '@/lib/types';

interface TickerSectionSettingsProps {
  activeSection: HomepageSection;
  storeSettings: StoreSettings;
  setStoreSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
  handleUpdateSection: (id: string, updates: Partial<HomepageSection>) => void;
}

export function TickerSectionSettings({
  activeSection,
  storeSettings,
  setStoreSettings,
  handleUpdateSection,
}: TickerSectionSettingsProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2">
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Enable Scrolling Ticker</span>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={storeSettings.enableTicker}
            onChange={(e) => setStoreSettings(prev => ({ ...prev, enableTicker: e.target.checked }))}
            className="sr-only peer"
          />
          <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
        </label>
      </div>

      {storeSettings.enableTicker && (
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Ticker Lines (One per line)</label>
            <textarea
              rows={4}
              value={storeSettings.tickerText || ''}
              onChange={(e) => setStoreSettings(prev => ({ ...prev, tickerText: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white resize-none"
              placeholder="Free returns within 30 days&#10;Unlimited delivery for only Rs. 175"
            />
          </div>

          <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <h5 className="text-[11px] font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Ticker Colors</h5>
            
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400">Bg Color</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={activeSection.settings?.tickerBgColor || activeSection.settings?.bgColor || (storeSettings as any).tickerBgColor || '#ffffff'}
                  onChange={e => {
                    const val = e.target.value;
                    setStoreSettings(prev => ({ ...prev, tickerBgColor: val }));
                    handleUpdateSection(activeSection.id, {
                      settings: { ...activeSection.settings, tickerBgColor: val, bgColor: val }
                    });
                  }}
                  className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => {
                    setStoreSettings(prev => ({ ...prev, tickerBgColor: '' }));
                    handleUpdateSection(activeSection.id, {
                      settings: { ...activeSection.settings, tickerBgColor: '', bgColor: '' }
                    });
                  }}
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
                  value={activeSection.settings?.tickerTextColor || activeSection.settings?.textColor || (storeSettings as any).tickerTextColor || '#1e293b'}
                  onChange={e => {
                    const val = e.target.value;
                    setStoreSettings(prev => ({ ...prev, tickerTextColor: val }));
                    handleUpdateSection(activeSection.id, {
                      settings: { ...activeSection.settings, tickerTextColor: val, textColor: val }
                    });
                  }}
                  className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => {
                    setStoreSettings(prev => ({ ...prev, tickerTextColor: '' }));
                    handleUpdateSection(activeSection.id, {
                      settings: { ...activeSection.settings, tickerTextColor: '', textColor: '' }
                    });
                  }}
                  className="text-[9px] text-gray-400 hover:text-[#e94560] font-bold uppercase tracking-wider cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
