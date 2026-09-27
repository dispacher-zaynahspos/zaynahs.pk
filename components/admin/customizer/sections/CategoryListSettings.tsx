'use client';

import React from 'react';
import { HomepageSection } from '@/lib/types';

interface CategoryListSettingsProps {
  section: HomepageSection;
  onUpdateSection: (updates: Partial<HomepageSection>) => void;
}

export default function CategoryListSettings({
  section,
  onUpdateSection
}: CategoryListSettingsProps) {
  const settings = section.settings || {};

  const handleSettingsChange = (key: string, value: any) => {
    onUpdateSection({
      settings: { ...settings, [key]: value }
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">
          Section Heading
        </label>
        <input
          type="text"
          value={section.title || ''}
          onChange={e => onUpdateSection({ title: e.target.value })}
          placeholder="e.g. Shop By Category"
          className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
        />
      </div>

      <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-800 pt-3">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Show Heading</span>
          <span className="text-[10px] text-gray-400">Toggle the section title above the filter bar</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={settings.show_title ?? true}
            onChange={e => handleSettingsChange('show_title', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
        </label>
      </div>

      <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-normal bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-xl p-3">
        This section renders a horizontal, scrollable category filter bar (pills). It has no column grid — for a
        multi-column grid of category cards, use the <span className="font-bold">Category Grid</span> section instead.
        The filter bar visibility is controlled globally by <span className="font-bold">Settings → General → Enable Category Filter</span>.
      </p>
    </div>
  );
}
