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
  return (
    <div className="space-y-4">
      <div className="space-y-4 p-3.5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-gray-800">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e94560] block">Tablet Dimensions</span>
        
        <NumberSliderControl
          label="Height"
          value={heightTablet}
          min={0}
          max={600}
          step={5}
          unit="px"
          onChange={val => handleSettingsChange('height_tablet', `${val}px`)}
          presets={[
            { label: '16:9 Aspect (430px)', val: 430 },
            { label: 'Compact (200px)', val: 200 },
            { label: 'Standard (350px)', val: 350 },
            { label: 'Tall (400px)', val: 400 },
            { label: 'Heroic (500px)', val: 500 }
          ]}
        />

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
