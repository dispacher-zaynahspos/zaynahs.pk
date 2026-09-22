'use client';

import React from 'react';
import { StoreSettings } from '@/lib/types';

interface ProductCardSwatchSettingsSectionProps {
  settings: StoreSettings;
  onUpdateSettings: (updates: Partial<StoreSettings>) => void;
}

export function ProductCardSwatchSettingsSection({
  settings,
  onUpdateSettings,
}: ProductCardSwatchSettingsSectionProps) {
  return (
    <div className="space-y-4 border-t border-gray-150 dark:border-gray-800 pt-5">
      <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block font-black">
        Swatch Style & Settings
      </label>

      <div className="bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 space-y-4 shadow-sm">
        <label className="flex items-center justify-between cursor-pointer select-none text-xs">
          <span className="font-bold text-gray-700 dark:text-gray-300">Enable Variant Swatches</span>
          <input
            type="checkbox"
            checked={settings.enableVariantSwatches !== false}
            onChange={e => onUpdateSettings({ enableVariantSwatches: e.target.checked })}
            className="rounded border-gray-350 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
          />
        </label>

        {settings.enableVariantSwatches !== false && (
          <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-3">
            {/* Swatch Shape */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Swatch Shape</label>
              <div className="flex gap-2">
                {['circle', 'square'].map(shape => {
                  const isActive = (settings.swatchShape || 'circle') === shape;
                  return (
                    <button
                      key={shape}
                      type="button"
                      onClick={() => onUpdateSettings({ swatchShape: shape as any })}
                      className={`flex-1 py-2 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${isActive
                        ? 'border-[#e94560] bg-[#e94560]/5 text-[#e94560] font-black'
                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 text-gray-500 bg-white dark:bg-[#16162a]'
                        }`}
                    >
                      {shape}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Swatch Limit */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Swatch Limit on Cards</label>
              <select
                value={settings.swatchLimit || 8}
                onChange={(e) => onUpdateSettings({ swatchLimit: Number(e.target.value) })}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-55 dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map((num) => (
                  <option key={num} value={num}>{num} swatches</option>
                ))}
              </select>
            </div>

            {/* Archive Swatch Size */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Archive Swatch Size</label>
              <div className="grid grid-cols-7 gap-1">
                {['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'].map(size => {
                  const isActive = (settings.archiveSwatchSize || 'md') === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => onUpdateSettings({ archiveSwatchSize: size as any })}
                      className={`py-1 rounded-lg border text-[9px] font-extrabold uppercase transition-all cursor-pointer ${isActive
                        ? 'border-[#e94560] bg-[#e94560]/5 text-[#e94560]'
                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 text-gray-500 bg-white dark:bg-[#16162a]'
                        }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Archive Swatch Alignment */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Archive Swatch Alignment</label>
              <div className="flex gap-2">
                {['left', 'center', 'right'].map(align => {
                  const isActive = (settings.archiveSwatchAlign || 'left') === align;
                  return (
                    <button
                      key={align}
                      type="button"
                      onClick={() => onUpdateSettings({ archiveSwatchAlign: align as any })}
                      className={`flex-1 py-2 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${isActive
                        ? 'border-[#e94560] bg-[#e94560]/5 text-[#e94560] font-black'
                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 text-gray-500 bg-white dark:bg-[#16162a]'
                        }`}
                    >
                      {align}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
