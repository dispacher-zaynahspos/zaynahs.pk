'use client';

import React from 'react';
import { StoreSettings, ThemeConfig } from '@/lib/types';
import { THEME_PRESETS } from '@/lib/theme-presets';
import { isFeatureEnabled } from '@/lib/features/premium';
import { Check, Lock } from '@/components/common/Icons';
import { toast } from 'sonner';
import { useConfirm } from '@/components/admin/shared/AdminConfirmProvider';

interface AppearancePresetsListProps {
  settings: StoreSettings;
  onSelectPreset: (presetId: string, presetConfig: ThemeConfig) => void;
  onUpdateSettings?: (updates: Partial<StoreSettings>) => void;
}

export function AppearancePresetsList({ settings, onSelectPreset, onUpdateSettings }: AppearancePresetsListProps) {
  const currentPresetId = settings.theme_preset || 'classic_white';
  const premiumThemesEnabled = isFeatureEnabled(settings, 'premium_themes');
  const { confirm } = useConfirm();

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
          Theme Presets
        </label>
        <span className="text-[10px] text-gray-400 font-semibold block">
          Select a starting preset theme below. You can customize colors, fonts, and borders further on the right side.
        </span>
      </div>

      {onUpdateSettings && (
        <div className="flex items-center justify-between rounded-xl border border-amber-300/60 dark:border-amber-500/30 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-500/10 dark:to-yellow-500/5 px-3 py-2.5">
          <div>
            <span className="text-[11px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">✦ Premium Themes (PRO)</span>
            <span className="text-[9px] text-amber-600/80 dark:text-amber-500/70 font-semibold block">Unlock curated high-end theme presets</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={premiumThemesEnabled}
              onChange={(e) => onUpdateSettings({ premium_themes_enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500" />
          </label>
        </div>
      )}

      <div className="space-y-3">
        {THEME_PRESETS.map((preset) => {
          const isActive = currentPresetId === preset.id;
          const locked = preset.premium && !premiumThemesEnabled;
          const { colors, fonts } = preset.config;

          return (
            <div
              key={preset.id}
              onClick={async () => {
                if (locked) {
                  toast.error('🔒 Premium theme — enable "Premium Themes" in Settings ▸ Premium to use it.');
                  return;
                }
                const confirmed = await confirm({
                  title: 'Apply Preset',
                  message: `Are you sure you want to apply the "${preset.name}" preset? This will overwrite your current customizations.`,
                  variant: 'warning',
                  confirmText: 'Apply',
                });
                if (confirmed) {
                  onSelectPreset(preset.id, preset.config);
                  toast.info(`Theme Preset "${preset.name}" applied in preview.`);
                }
              }}
              className={`group relative p-3.5 border rounded-2xl transition-all duration-200 cursor-pointer select-none ${
                isActive
                  ? 'border-[#e94560] bg-[#e94560]/5 dark:bg-[#e94560]/10 shadow-sm scale-102 ring-1 ring-[#e94560]/20'
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] hover:border-gray-350 dark:hover:border-gray-700 hover:scale-101 hover:shadow-xs'
              } ${locked ? 'opacity-75' : ''}`}
            >
              {/* Checkmark badge */}
              {isActive && (
                <div className="absolute top-3.5 right-3.5 w-4.5 h-4.5 rounded-full bg-[#e94560] flex items-center justify-center text-white scale-110 shadow-sm">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
              )}
              {/* PRO badge for premium presets */}
              {preset.premium && !isActive && (
                <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 px-2 py-0.5 text-[8px] font-black text-white uppercase tracking-wider shadow-sm">
                  {locked && <Lock className="h-2.5 w-2.5" />} PRO
                </div>
              )}

              <div className="space-y-2">
                <div>
                  <h4 className="text-xs font-black text-gray-900 dark:text-white group-hover:text-[#e94560] transition-colors flex items-center gap-1.5">
                    {preset.name}
                  </h4>
                  <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mt-0.5">
                    {preset.feel}
                  </p>
                </div>

                {/* Colors visual bar */}
                <div className="h-5 flex rounded-lg overflow-hidden border border-gray-150 dark:border-gray-700/50 shadow-xs">
                  <div className="flex-1" style={{ backgroundColor: colors.background }} title={`BG: ${colors.background}`} />
                  <div className="flex-1" style={{ backgroundColor: colors.surface }} title={`Surface: ${colors.surface}`} />
                  <div className="flex-1" style={{ backgroundColor: colors.primary }} title={`Primary: ${colors.primary}`} />
                  <div className="flex-1" style={{ backgroundColor: colors.accent }} title={`Accent: ${colors.accent}`} />
                </div>

                {/* Typography display */}
                <div className="flex items-center justify-between text-[9px] font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/3 px-2 py-1 rounded-md">
                  <span className="truncate max-w-[100px]" title={`Heading: ${fonts.heading}`}>
                    {fonts.heading}
                  </span>
                  <span className="text-gray-300 dark:text-gray-700 font-normal">|</span>
                  <span className="truncate max-w-[100px]" title={`Body: ${fonts.body}`}>
                    {fonts.body}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
