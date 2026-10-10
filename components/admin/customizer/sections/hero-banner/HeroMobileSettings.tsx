import React from 'react';
import { NumberSliderControl, ButtonGroupControl } from './HeroBannerControls';

interface HeroMobileSettingsProps {
  settings: Record<string, any>;
  heightMobile: number;
  widthMobile: number;
  handleSettingsChange: (key: string, value: any) => void;
}

export function HeroMobileSettings({
  settings,
  heightMobile,
  widthMobile,
  handleSettingsChange
}: HeroMobileSettingsProps) {
  const currentHeightStr = (settings.height_mobile ?? '').toString().trim().toLowerCase();
  const isAspectMode = ['16:9', '16/9', 'auto', 'adapt', 'natural', '1:1', '3:4', '3/4', '21:9', '21/9', '4:3', '4/3'].includes(currentHeightStr);

  return (
    <div className="space-y-4">
      <div className="space-y-3.5 p-3.5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e94560]">
            Mobile Dimensions
          </span>
          <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded">
            {isAspectMode ? 'Proportional (Identical on all phones)' : 'Fixed Height'}
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
              onClick={() => handleSettingsChange('height_mobile', '16:9')}
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
              onClick={() => handleSettingsChange('height_mobile', 'auto')}
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
              onClick={() => handleSettingsChange('height_mobile', '1:1')}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                currentHeightStr === '1:1'
                  ? 'bg-white dark:bg-[#16162a] text-[#e94560] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              1:1 Square
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-200/60 dark:bg-gray-800/80 rounded-xl text-[10px] font-bold text-center">
            <button
              type="button"
              onClick={() => handleSettingsChange('height_mobile', '3:4')}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                currentHeightStr === '3:4' || currentHeightStr === '3/4'
                  ? 'bg-white dark:bg-[#16162a] text-[#e94560] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              3:4 Portrait
            </button>
            <button
              type="button"
              onClick={() => handleSettingsChange('height_mobile', '21:9')}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                currentHeightStr === '21:9' || currentHeightStr === '21/9'
                  ? 'bg-white dark:bg-[#16162a] text-[#e94560] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              21:9 Wide
            </button>
            <button
              type="button"
              onClick={() => {
                const px = heightMobile > 0 ? heightMobile : 250;
                handleSettingsChange('height_mobile', `${px}px`);
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
            value={heightMobile}
            min={100}
            max={500}
            step={5}
            unit="px"
            onChange={val => handleSettingsChange('height_mobile', `${val}px`)}
            presets={[
              { label: 'Mini (150px)', val: 150 },
              { label: 'Standard (250px)', val: 250 },
              { label: 'Tall (300px)', val: 300 },
              { label: 'Heroic (400px)', val: 400 }
            ]}
          />
        )}

        <div className="border-t border-gray-200 dark:border-gray-800/60 pt-3">
          <NumberSliderControl
            label="Content Max Width"
            value={widthMobile}
            min={50}
            max={100}
            step={5}
            unit="%"
            onChange={val => handleSettingsChange('content_width_mobile', `${val}%`)}
            presets={[
              { label: 'Narrow (75%)', val: 75 },
              { label: 'Medium (90%)', val: 90 },
              { label: 'Full Width (100%)', val: 100 }
            ]}
          />
        </div>
      </div>

      <div className="space-y-3 p-3.5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-gray-800">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e94560] block mb-1">Mobile Alignments</span>
        <div className="grid grid-cols-2 gap-3">
          <ButtonGroupControl
            label="Position (Horiz)"
            value={settings.content_position_mobile_x || 'center'}
            options={[
              { label: 'Left', value: 'left' },
              { label: 'Center', value: 'center' },
              { label: 'Right', value: 'right' }
            ]}
            onChange={val => handleSettingsChange('content_position_mobile_x', val)}
          />
          <ButtonGroupControl
            label="Position (Vert)"
            value={settings.content_position_mobile_y || 'middle'}
            options={[
              { label: 'Top', value: 'top' },
              { label: 'Middle', value: 'middle' },
              { label: 'Bottom', value: 'bottom' }
            ]}
            onChange={val => handleSettingsChange('content_position_mobile_y', val)}
          />
        </div>
        <ButtonGroupControl
          label="Text Align"
          value={settings.text_align_mobile || 'center'}
          options={[
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' }
          ]}
          onChange={val => handleSettingsChange('text_align_mobile', val)}
        />
      </div>

      <div className="space-y-4 p-3.5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-gray-800">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e94560] block mb-1">Mobile Focal Shifts</span>
        
        <NumberSliderControl
          label="Zoom Scale"
          value={settings.image_scale_mobile ?? 100}
          min={100}
          max={200}
          step={5}
          unit="%"
          onChange={val => handleSettingsChange('image_scale_mobile', val)}
        />
        
        <NumberSliderControl
          label="Left/Right Shift"
          value={settings.image_focal_x_mobile ?? 50}
          min={0}
          max={100}
          step={5}
          unit="%"
          onChange={val => handleSettingsChange('image_focal_x_mobile', val)}
        />
        
        <NumberSliderControl
          label="Up/Down Shift"
          value={settings.image_focal_y_mobile ?? 50}
          min={0}
          max={100}
          step={5}
          unit="%"
          onChange={val => handleSettingsChange('image_focal_y_mobile', val)}
        />
      </div>

      <div className="space-y-1.5 p-3.5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-gray-800">
        <ButtonGroupControl
          label="Mobile Heading Size"
          value={settings.heading_size_mobile || '2xl'}
          options={[
            { label: 'S (lg)', value: 'lg' },
            { label: 'M (xl)', value: 'xl' },
            { label: 'L (2xl)', value: '2xl' },
            { label: 'XL (3xl)', value: '3xl' }
          ]}
          onChange={val => handleSettingsChange('heading_size_mobile', val)}
        />
      </div>
    </div>
  );
}
