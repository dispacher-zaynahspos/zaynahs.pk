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
  return (
    <div className="space-y-4">
      <div className="space-y-4 p-3.5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-gray-800">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e94560] block">Mobile Dimensions</span>
        
        <NumberSliderControl
          label="Height"
          value={heightMobile}
          min={0}
          max={500}
          step={5}
          unit="px"
          onChange={val => handleSettingsChange('height_mobile', `${val}px`)}
          presets={[
            { label: '16:9 Aspect (210px)', val: 210 },
            { label: 'Mini (100px)', val: 100 },
            { label: 'Compact (150px)', val: 150 },
            { label: 'Standard (250px)', val: 250 },
            { label: 'Tall (300px)', val: 300 },
            { label: 'Heroic (400px)', val: 400 }
          ]}
        />

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
