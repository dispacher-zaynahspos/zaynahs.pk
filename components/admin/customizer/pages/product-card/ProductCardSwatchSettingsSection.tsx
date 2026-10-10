'use client';

import React from 'react';
import { StoreSettings } from '@/lib/types';
import { ResponsiveArchiveSwatchControl } from '@/components/admin/customizer/shared/ResponsiveSwatchControls';

interface ProductCardSwatchSettingsSectionProps {
  settings: StoreSettings;
  onUpdateSettings: (updates: Partial<StoreSettings>) => void;
  viewportMode?: 'desktop' | 'tablet' | 'mobile';
}

export function ProductCardSwatchSettingsSection({
  settings,
  onUpdateSettings,
  viewportMode = 'desktop',
}: ProductCardSwatchSettingsSectionProps) {
  return (
    <div className="space-y-4 border-t border-gray-150 dark:border-gray-800 pt-5">
      <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block font-black">
        Swatch Style & Settings
      </label>

      <div className="bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
        <ResponsiveArchiveSwatchControl
          settings={settings}
          onUpdateSettings={onUpdateSettings}
          viewportMode={viewportMode}
        />
      </div>
    </div>
  );
}
