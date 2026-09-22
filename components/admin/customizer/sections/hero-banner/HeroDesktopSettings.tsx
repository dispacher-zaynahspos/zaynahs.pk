import React from 'react';
import { NumberSliderControl, ButtonGroupControl } from './HeroBannerControls';

interface HeroDesktopSettingsProps {
  settings: Record<string, any>;
  heightDesktop: number;
  widthDesktop: number;
  handleSettingsChange: (key: string, value: any) => void;
  onUpdateSection: (updates: Record<string, any>) => void;
}

export function HeroDesktopSettings({
  settings,
  heightDesktop,
  widthDesktop,
  handleSettingsChange,
  onUpdateSection
}: HeroDesktopSettingsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-4 p-3.5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-gray-800">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e94560] block">Desktop Dimensions</span>
        
        <NumberSliderControl
          label="Height"
          value={heightDesktop}
          min={0}
          max={900}
          step={5}
          unit="px"
          onChange={val => handleSettingsChange('height_desktop', `${val}px`)}
          presets={[
            { label: '16:9 Aspect (675px)', val: 675 },
            { label: 'Compact (250px)', val: 250 },
            { label: 'Standard (450px)', val: 450 },
            { label: 'Tall (550px)', val: 550 },
            { label: 'Heroic (650px)', val: 650 },
            { label: 'Full Screen (800px)', val: 800 }
          ]}
        />

        <div className="border-t border-gray-200 dark:border-gray-800/60 pt-3">
          <NumberSliderControl
            label="Content Max Width"
            value={widthDesktop}
            min={300}
            max={1400}
            step={25}
            unit="px"
            onChange={val => handleSettingsChange('content_width_desktop', `${val}px`)}
            presets={[
              { label: 'Slim (500px)', val: 500 },
              { label: 'Medium (750px)', val: 750 },
              { label: 'Wide (1000px)', val: 1000 },
              { label: 'Full Width (1200px)', val: 1200 }
            ]}
          />
        </div>
      </div>

      <div className="space-y-3 p-3.5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-gray-800">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e94560] block mb-1">Desktop Alignments</span>
        <div className="grid grid-cols-2 gap-3">
          <ButtonGroupControl
            label="Position (Horiz)"
            value={settings.content_position_desktop_x || settings.content_position_desktop || 'center'}
            options={[
              { label: 'Left', value: 'left' },
              { label: 'Center', value: 'center' },
              { label: 'Right', value: 'right' }
            ]}
            onChange={val => {
              onUpdateSection({
                settings: {
                  ...settings,
                  content_position_desktop_x: val,
                  content_position_desktop: val
                }
              });
            }}
          />
          <ButtonGroupControl
            label="Position (Vert)"
            value={settings.content_position_desktop_y || 'middle'}
            options={[
              { label: 'Top', value: 'top' },
              { label: 'Middle', value: 'middle' },
              { label: 'Bottom', value: 'bottom' }
            ]}
            onChange={val => handleSettingsChange('content_position_desktop_y', val)}
          />
        </div>
        <ButtonGroupControl
          label="Text Align"
          value={settings.text_align_desktop || 'center'}
          options={[
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' }
          ]}
          onChange={val => handleSettingsChange('text_align_desktop', val)}
        />
      </div>

      <div className="space-y-4 p-3.5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-gray-800">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e94560] block mb-1">Desktop Focal Shifts</span>
        
        <NumberSliderControl
          label="Zoom Scale"
          value={settings.image_scale_desktop ?? 100}
          min={100}
          max={200}
          step={5}
          unit="%"
          onChange={val => handleSettingsChange('image_scale_desktop', val)}
        />
        
        <NumberSliderControl
          label="Left/Right Shift"
          value={settings.image_focal_x_desktop ?? 50}
          min={0}
          max={100}
          step={5}
          unit="%"
          onChange={val => handleSettingsChange('image_focal_x_desktop', val)}
        />
        
        <NumberSliderControl
          label="Up/Down Shift"
          value={settings.image_focal_y_desktop ?? 50}
          min={0}
          max={100}
          step={5}
          unit="%"
          onChange={val => handleSettingsChange('image_focal_y_desktop', val)}
        />
      </div>

      <div className="space-y-1.5 p-3.5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-gray-800">
        <ButtonGroupControl
          label="Desktop Heading Size"
          value={settings.heading_size_desktop || '5xl'}
          options={[
            { label: 'S (2xl)', value: '2xl' },
            { label: 'M (3xl)', value: '3xl' },
            { label: 'L (4xl)', value: '4xl' },
            { label: 'XL (5xl)', value: '5xl' },
            { label: 'XXL (6xl)', value: '6xl' }
          ]}
          onChange={val => handleSettingsChange('heading_size_desktop', val)}
        />
      </div>
    </div>
  );
}
