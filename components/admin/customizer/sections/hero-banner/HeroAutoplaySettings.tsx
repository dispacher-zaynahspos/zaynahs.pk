import React from 'react';
import { NumberSliderControl } from './HeroBannerControls';

interface HeroAutoplaySettingsProps {
  settings: Record<string, any>;
  handleSettingsChange: (key: string, value: any) => void;
}

export function HeroAutoplaySettings({ settings, handleSettingsChange }: HeroAutoplaySettingsProps) {
  return (
    <div className="p-3.5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3">
      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={settings.autoplay ?? true}
          onChange={e => handleSettingsChange('autoplay', e.target.checked)}
          className="rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
        />
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
          Autoplay Slideshow
        </span>
      </label>

      {(settings.autoplay ?? true) && (
        <div className="pt-1 border-t border-gray-200 dark:border-gray-800/60">
          <NumberSliderControl
            label="Autoplay Speed"
            value={Math.round((settings.autoplay_speed ?? 5000) / 1000)}
            min={3}
            max={15}
            step={1}
            unit="s"
            onChange={val => handleSettingsChange('autoplay_speed', val * 1000)}
            presets={[
              { label: 'Fast (3s)', val: 3 },
              { label: 'Medium (5s)', val: 5 },
              { label: 'Slow (8s)', val: 8 },
              { label: 'Very Slow (12s)', val: 12 }
            ]}
          />
        </div>
      )}
    </div>
  );
}
