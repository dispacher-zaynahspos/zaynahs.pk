import React from 'react';
import { NumberSliderControl, ButtonGroupControl } from './HeroBannerControls';

interface HeroTabletSettingsProps {
  settings: Record<string, any>;
  heightTablet: number;
  widthTablet: number;
  handleSettingsChange: (key: string, value: any) => void;
}

export function HeroTabletSettings({
  settings,
  heightTablet,
  widthTablet,
  handleSettingsChange
}: HeroTabletSettingsProps) {
  const currentHeightStr = (settings.height_tablet ?? '').toString().trim().toLowerCase();
  const isAspectMode = ['16:9', '16/9', 'auto', 'adapt', 'natural', '21:9', '21/9', '4:3', '4/3', '1:1'].includes(currentHeightStr);

  return (
    <div className="space-y-4">
      <div className="space-y-3.5 p-3.5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e94560]">
            Tablet Dimensions
          </span>
          <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded">
            {isAspectMode ? 'Proportional (Auto-fit)' : 'Fixed Height'}
          </span>
        </div>

        {/* Aspect Ratio Modes */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block">
            Height Mode
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-200/60 dark:bg-gray-800/80 rounded-xl text-[10px] font-bold text-center">
            <button
              type="button"
              onClick={() => handleSettingsChange('height_tablet', '16:9')}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                currentHeightStr === '16:9' || currentHeightStr === '16/9'
                  ? 'bg-white dark:bg-[#16162a] text-[#e94560] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              16:9 Ratio
            </button>
            <button
              type="button"
              onClick={() => handleSettingsChange('height_tablet', 'auto')}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                currentHeightStr === 'auto' || currentHeightStr === 'adapt'
                  ? 'bg-white dark:bg-[#16162a] text-[#e94560] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Auto (100% Fit)
            </button>
            <button
              type="button"
              onClick={() => handleSettingsChange('height_tablet', '21:9')}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                currentHeightStr === '21:9' || currentHeightStr === '21/9'
                  ? 'bg-white dark:bg-[#16162a] text-[#e94560] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              21:9 Wide
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-200/60 dark:bg-gray-800/80 rounded-xl text-[10px] font-bold text-center">
            <button
              type="button"
              onClick={() => handleSettingsChange('height_tablet', '4:3')}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                currentHeightStr === '4:3' || currentHeightStr === '4/3'
                  ? 'bg-white dark:bg-[#16162a] text-[#e94560] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              4:3 Classic
            </button>
            <button
              type="button"
              onClick={() => {
                const px = heightTablet > 0 ? heightTablet : 350;
                handleSettingsChange('height_tablet', `${px}px`);
              }}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                !isAspectMode
                  ? 'bg-white dark:bg-[#16162a] text-[#e94560] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Custom px
            </button>
          </div>
        </div>

        {!isAspectMode && (
          <NumberSliderControl
            label="Custom Height"
            value={heightTablet}
            min={150}
            max={650}
            step={5}
            unit="px"
            onChange={val => handleSettingsChange('height_tablet', `${val}px`)}
            presets={[
              { label: 'Compact (250px)', val: 250 },
              { label: 'Standard (350px)', val: 350 },
              { label: 'Tall (420px)', val: 420 },
              { label: 'Heroic (520px)', val: 520 }
            ]}
          />
        )}

        <div className="border-t border-gray-200 dark:border-gray-800/60 pt-3">
          <NumberSliderControl
            label="Content Max Width"
            value={widthTablet}
            min={300}
            max={1000}
            step={25}
            unit="px"
            onChange={val => handleSettingsChange('content_width_tablet', `${val}px`)}
            presets={[
              { label: 'Slim (400px)', val: 400 },
              { label: 'Medium (600px)', val: 600 },
              { label: 'Wide (800px)', val: 800 },
              { label: 'Full Width (900px)', val: 900 }
            ]}
          />
        </div>
      </div>

      <div className="space-y-3 p-3.5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-gray-800">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e94560] block mb-1">Tablet Alignments</span>
        <div className="grid grid-cols-2 gap-3">
          <ButtonGroupControl
            label="Position (Horiz)"
            value={settings.content_position_tablet_x || 'center'}
            options={[
              { label: 'Left', value: 'left' },
              { label: 'Center', value: 'center' },
              { label: 'Right', value: 'right' }
            ]}
            onChange={val => handleSettingsChange('content_position_tablet_x', val)}
          />
          <ButtonGroupControl
            label="Position (Vert)"
            value={settings.content_position_tablet_y || 'middle'}
            options={[
              { label: 'Top', value: 'top' },
              { label: 'Middle', value: 'middle' },
              { label: 'Bottom', value: 'bottom' }
            ]}
            onChange={val => handleSettingsChange('content_position_tablet_y', val)}
          />
        </div>
        <ButtonGroupControl
          label="Text Align"
          value={settings.text_align_tablet || 'center'}
          options={[
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' }
          ]}
          onChange={val => handleSettingsChange('text_align_tablet', val)}
        />
      </div>

      <div className="space-y-4 p-3.5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-gray-800">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e94560] block mb-1">Tablet Focal Shifts</span>
        
        <NumberSliderControl
          label="Zoom Scale"
          value={settings.image_scale_tablet ?? 100}
          min={100}
          max={200}
          step={5}
          unit="%"
          onChange={val => handleSettingsChange('image_scale_tablet', val)}
        />
        
        <NumberSliderControl
          label="Left/Right Shift"
          value={settings.image_focal_x_tablet ?? 50}
          min={0}
          max={100}
          step={5}
          unit="%"
          onChange={val => handleSettingsChange('image_focal_x_tablet', val)}
        />
        
        <NumberSliderControl
          label="Up/Down Shift"
          value={settings.image_focal_y_tablet ?? 50}
          min={0}
          max={100}
          step={5}
          unit="%"
          onChange={val => handleSettingsChange('image_focal_y_tablet', val)}
        />
      </div>

      <div className="space-y-1.5 p-3.5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-gray-800">
        <ButtonGroupControl
          label="Tablet Heading Size"
          value={settings.heading_size_tablet || '3xl'}
          options={[
            { label: 'S (xl)', value: 'xl' },
            { label: 'M (2xl)', value: '2xl' },
            { label: 'L (3xl)', value: '3xl' },
            { label: 'XL (4xl)', value: '4xl' },
            { label: 'XXL (5xl)', value: '5xl' }
          ]}
          onChange={val => handleSettingsChange('heading_size_tablet', val)}
        />
      </div>
    </div>
  );
}
