import React from 'react';

interface HeroColorSettingsProps {
  settings: Record<string, any>;
  handleSettingsChange: (key: string, value: any) => void;
}

export function HeroColorSettings({ settings, handleSettingsChange }: HeroColorSettingsProps) {
  return (
    <>
      {/* Global Backdrop Checkbox */}
      <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-gray-800">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={settings.show_backdrop_container ?? false}
            onChange={e => handleSettingsChange('show_backdrop_container', e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
          />
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
            Show Glassmorphism Backdrop
          </span>
        </label>
      </div>

      {/* Global Styling & Colors */}
      <div className="space-y-4 p-3.5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-gray-800">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e94560] block mb-1">Styling & Colors</span>
        
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Overlay Color</label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={settings.overlay_color || '#000000'}
              onChange={e => handleSettingsChange('overlay_color', e.target.value)}
              className="h-8 w-12 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent cursor-pointer p-0.5"
            />
            <input
              type="text"
              value={settings.overlay_color || '#000000'}
              onChange={e => handleSettingsChange('overlay_color', e.target.value)}
              placeholder="#000000"
              className="flex-1 px-3 py-1.5 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Overlay Opacity</label>
            <span className="text-xs font-bold text-[#e94560]">
              {Math.round((settings.overlay_opacity ?? 0.3) * 100)}%
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.overlay_opacity ?? 0.3}
              onChange={e => handleSettingsChange('overlay_opacity', parseFloat(e.target.value))}
              className="flex-grow accent-[#e94560] h-1 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer"
            />
            <div className="relative flex items-center w-20 flex-shrink-0">
              <input
                type="number"
                min="0"
                max="100"
                value={Math.round((settings.overlay_opacity ?? 0.3) * 100)}
                onChange={e => {
                  const pct = Number(e.target.value);
                  if (!isNaN(pct)) {
                    handleSettingsChange('overlay_opacity', Math.min(Math.max(pct, 0), 100) / 100);
                  }
                }}
                className="w-full pl-3 pr-7 py-1 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
              />
              <span className="absolute right-2 text-[10px] font-bold text-gray-400 uppercase select-none">%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500">Heading Color</label>
            <div className="flex gap-1.5 items-center">
              <input
                type="color"
                value={settings.heading_color || '#ffffff'}
                onChange={e => handleSettingsChange('heading_color', e.target.value)}
                className="h-6 w-8 rounded border border-gray-200 dark:border-gray-800 bg-transparent cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={settings.heading_color || '#ffffff'}
                onChange={e => handleSettingsChange('heading_color', e.target.value)}
                className="w-full px-2 py-1 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-lg text-[11px] font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500">Subtitle Color</label>
            <div className="flex gap-1.5 items-center">
              <input
                type="color"
                value={settings.subtitle_color || '#e0e0e0'}
                onChange={e => handleSettingsChange('subtitle_color', e.target.value)}
                className="h-6 w-8 rounded border border-gray-200 dark:border-gray-800 bg-transparent cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={settings.subtitle_color || '#e0e0e0'}
                onChange={e => handleSettingsChange('subtitle_color', e.target.value)}
                className="w-full px-2 py-1 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-lg text-[11px] font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
