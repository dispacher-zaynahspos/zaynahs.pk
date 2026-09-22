'use client';

import React, { useRef, useState } from 'react';
import { StoreSettings, ThemeConfig } from '@/lib/types';
import { THEME_PRESETS, GOOGLE_FONTS } from '@/lib/theme-presets';
import { RefreshCw, Download, Upload } from '@/components/common/Icons';
import { toast } from 'sonner';
import { useConfirm } from '@/components/admin/shared/AdminConfirmProvider';
import { AppearanceColorTokensTab } from './AppearanceColorTokensTab';

interface AppearanceCustomizePanelProps {
  settings: StoreSettings;
  onUpdateSettings: (updates: Partial<StoreSettings>) => void;
}

export function AppearanceCustomizePanel({ settings, onUpdateSettings }: AppearanceCustomizePanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeCustomizeTab, setActiveCustomizeTab] = useState<'colors' | 'fonts' | 'elements'>('colors');
  const { confirm } = useConfirm();

  const activePresetId = settings.theme_preset || 'classic_white';
  const defaultPreset = THEME_PRESETS.find(p => p.id === activePresetId) || THEME_PRESETS[0];

  // Dynamic safe config loading
  const themeConfig: ThemeConfig = settings.theme_config || defaultPreset.config;
  const colors = themeConfig.colors || defaultPreset.config.colors;
  const fonts = themeConfig.fonts || defaultPreset.config.fonts;
  const typography = themeConfig.typography || defaultPreset.config.typography;
  const buttons = themeConfig.buttons || defaultPreset.config.buttons;
  const cards = themeConfig.cards || defaultPreset.config.cards;

  const updateConfigField = <T extends keyof ThemeConfig>(
    section: T,
    field: keyof ThemeConfig[T],
    value: any
  ) => {
    const updatedConfig = {
      ...themeConfig,
      [section]: {
        ...themeConfig[section],
        [field]: value
      }
    };
    onUpdateSettings({ theme_config: updatedConfig });
  };

  // Reset to default active preset values
  const handleResetPreset = async () => {
    const confirmed = await confirm({
      title: 'Reset Theme',
      message: `Reset theme variables back to standard "${defaultPreset.name}" configuration?`,
      variant: 'warning',
      confirmText: 'Reset'
    });
    if (confirmed) {
      onUpdateSettings({ theme_config: defaultPreset.config });
      toast.success(`Reset back to default "${defaultPreset.name}" settings.`);
    }
  };

  // Export current config as JSON file
  const handleExportJSON = () => {
    try {
      const exportData = {
        theme_preset: activePresetId,
        theme_config: themeConfig
      };
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${settings.storeName || 'ourstore'}-theme-config.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Theme Configuration JSON exported successfully.');
    } catch {
      toast.error('Failed to export theme JSON');
    }
  };

  // Import config from JSON file
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json && json.theme_preset && json.theme_config) {
          onUpdateSettings({
            theme_preset: json.theme_preset,
            theme_config: json.theme_config
          });
          toast.success('Theme Configuration JSON imported and applied successfully.');
        } else {
          toast.error('Invalid theme config schema. Missing preset or config fields.');
        }
      } catch {
        toast.error('Failed to parse uploaded JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset uploader input
  };

  return (
    <div className="space-y-6 select-none pb-6">
      {/* Sub tabs selector */}
      <div className="flex bg-gray-50 dark:bg-white/4 p-0.5 rounded-xl border border-gray-100 dark:border-gray-800">
        {[
          { id: 'colors', label: 'Colors' },
          { id: 'fonts', label: 'Fonts & Sizes' },
          { id: 'elements', label: 'Borders & Buttons' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveCustomizeTab(tab.id as any)}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              activeCustomizeTab === tab.id
                ? 'bg-[#e94560] text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Colors Tab */}
      {activeCustomizeTab === 'colors' && (
        <AppearanceColorTokensTab
          colors={colors}
          updateConfigField={updateConfigField}
        />
      )}

      {/* Fonts & Sizes Tab */}
      {activeCustomizeTab === 'fonts' && (
        <div className="space-y-5">
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Typography Settings</h4>
            <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">Modify Google Fonts and text viewport scales. Fonts fall back elegantly during transitions.</p>
          </div>

          <div className="space-y-4">
            {/* Heading Font Select */}
            <div className="space-y-1 p-3 bg-gray-50/50 dark:bg-white/2 rounded-xl border border-gray-100 dark:border-gray-800/80">
              <label className="text-[10px] font-extrabold text-gray-700 dark:text-gray-300 block">Heading Typography Font</label>
              <select
                value={fonts.heading || 'Playfair Display'}
                onChange={e => updateConfigField('fonts', 'heading', e.target.value)}
                className="w-full mt-1.5 px-2 py-1.5 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold text-gray-700 dark:text-white"
              >
                {GOOGLE_FONTS.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
              <span className="text-[8px] text-gray-400 dark:text-gray-500 font-semibold block mt-1">Applied to Page Titles, Category headers, Product names, h1-h4 blocks.</span>
            </div>

            {/* Body Font Select */}
            <div className="space-y-1 p-3 bg-gray-50/50 dark:bg-white/2 rounded-xl border border-gray-100 dark:border-gray-800/80">
              <label className="text-[10px] font-extrabold text-gray-700 dark:text-gray-300 block">Body Copy Font</label>
              <select
                value={fonts.body || 'Inter'}
                onChange={e => updateConfigField('fonts', 'body', e.target.value)}
                className="w-full mt-1.5 px-2 py-1.5 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold text-gray-700 dark:text-white"
              >
                {GOOGLE_FONTS.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
              <span className="text-[8px] text-gray-400 dark:text-gray-500 font-semibold block mt-1">Applied to description paragraphs, tags, reviews copy, inputs text, buttons.</span>
            </div>

            {/* Base Font Size Slider */}
            <div className="space-y-1.5 p-3 bg-gray-50/50 dark:bg-white/2 rounded-xl border border-gray-100 dark:border-gray-800/80">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-extrabold text-gray-700 dark:text-gray-300">Base Font Size</label>
                <span className="text-[10px] font-black text-[#e94560]">{typography.fontSizeBase || 16}px</span>
              </div>
              <input
                type="range"
                min={13}
                max={18}
                step={1}
                value={typography.fontSizeBase || 16}
                onChange={e => updateConfigField('typography', 'fontSizeBase', parseInt(e.target.value))}
                className="w-full accent-[#e94560]"
              />
              <span className="text-[8px] text-gray-400 dark:text-gray-500 font-semibold block mt-1">Controls storefront base html size. Affects overall scale of the elements.</span>
            </div>
          </div>
        </div>
      )}

      {/* Borders & Buttons Tab */}
      {activeCustomizeTab === 'elements' && (
        <div className="space-y-5">
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Borders & Button Styling</h4>
            <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">Customize corners, outline borders, and fill variables for interactive controls.</p>
          </div>

          <div className="space-y-4">
            {/* Button Radius Slider */}
            <div className="space-y-1.5 p-3 bg-gray-50/50 dark:bg-white/2 rounded-xl border border-gray-100 dark:border-gray-800/80">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-extrabold text-gray-700 dark:text-gray-300">Button Corner Radius</label>
                <span className="text-[10px] font-black text-[#e94560]">{buttons.borderRadius ?? 0}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={1}
                value={buttons.borderRadius ?? 0}
                onChange={e => updateConfigField('buttons', 'borderRadius', parseInt(e.target.value))}
                className="w-full accent-[#e94560]"
              />
              <span className="text-[8px] text-gray-400 dark:text-gray-500 font-semibold block mt-1">Roundness of buttons, dropdown selects, and input boxes (0px is sharp).</span>
            </div>

            {/* Card Radius Slider */}
            <div className="space-y-1.5 p-3 bg-gray-50/50 dark:bg-white/2 rounded-xl border border-gray-100 dark:border-gray-800/80">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-extrabold text-gray-700 dark:text-gray-300">Card Corner Radius</label>
                <span className="text-[10px] font-black text-[#e94560]">{cards.borderRadius ?? 0}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={1}
                value={cards.borderRadius ?? 0}
                onChange={e => updateConfigField('cards', 'borderRadius', parseInt(e.target.value))}
                className="w-full accent-[#e94560]"
              />
              <span className="text-[8px] text-gray-400 dark:text-gray-500 font-semibold block mt-1">Roundness of product catalog cards, reviews tiles, slider containers.</span>
            </div>

            {/* Button Color overrides */}
            <div className="p-3 bg-gray-50/50 dark:bg-white/2 rounded-xl border border-gray-100 dark:border-gray-800/80 space-y-3.5">
              <label className="text-[10px] font-extrabold text-gray-700 dark:text-gray-300 block">Primary Button overrides</label>

              <div className="grid grid-cols-3 gap-2">
                {/* primaryBg */}
                <div className="space-y-1 text-center">
                  <span className="text-[8px] text-gray-400 font-bold block uppercase">Background</span>
                  <div className="flex justify-center">
                    <input
                      type="color"
                      value={buttons.primaryBg || colors.primary}
                      onChange={e => updateConfigField('buttons', 'primaryBg', e.target.value)}
                      className="w-5 h-5 rounded border border-gray-200 cursor-pointer overflow-hidden p-0 bg-transparent"
                    />
                  </div>
                </div>

                {/* primaryText */}
                <div className="space-y-1 text-center">
                  <span className="text-[8px] text-gray-400 font-bold block uppercase">Text Color</span>
                  <div className="flex justify-center">
                    <input
                      type="color"
                      value={buttons.primaryText || '#ffffff'}
                      onChange={e => updateConfigField('buttons', 'primaryText', e.target.value)}
                      className="w-5 h-5 rounded border border-gray-200 cursor-pointer overflow-hidden p-0 bg-transparent"
                    />
                  </div>
                </div>

                {/* primaryHover */}
                <div className="space-y-1 text-center">
                  <span className="text-[8px] text-gray-400 font-bold block uppercase">Hover Bg</span>
                  <div className="flex justify-center">
                    <input
                      type="color"
                      value={buttons.primaryHover || colors.secondary}
                      onChange={e => updateConfigField('buttons', 'primaryHover', e.target.value)}
                      className="w-5 h-5 rounded border border-gray-200 cursor-pointer overflow-hidden p-0 bg-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preset Action Controllers */}
      <div className="border-t border-gray-150 dark:border-gray-850 pt-5 space-y-3">
        <button
          onClick={handleResetPreset}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-all active:scale-97 cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reset Preset Defaults
        </button>

        <div className="grid grid-cols-2 gap-2">
          {/* Export JSON */}
          <button
            onClick={handleExportJSON}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white dark:bg-transparent border border-gray-200 dark:border-gray-800 hover:border-gray-350 dark:hover:border-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-all active:scale-97 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Export JSON
          </button>

          {/* Import JSON */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white dark:bg-transparent border border-gray-200 dark:border-gray-800 hover:border-gray-350 dark:hover:border-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-all active:scale-97 cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5" />
            Import JSON
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportJSON}
          accept=".json"
          className="hidden"
        />
      </div>
    </div>
  );
}
