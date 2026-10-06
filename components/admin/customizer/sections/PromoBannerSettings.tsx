'use client';

import React from 'react';
import { HomepageSection } from '@/lib/types';
import SectionSpacingControls from '../shared/SectionSpacingControls';

interface PromoBannerSettingsProps {
  section: HomepageSection;
  onUpdateSection: (updates: Partial<HomepageSection>) => void;
}

export default function PromoBannerSettings({
  section,
  onUpdateSection
}: PromoBannerSettingsProps) {
  const settings = section.settings || {};
  const contentData = section.content_data || {};

  const handleSettingsChange = (key: string, value: any) => {
    onUpdateSection({
      settings: { ...settings, [key]: value }
    });
  };

  const handleContentChange = (key: string, value: any) => {
    onUpdateSection({
      content_data: { ...contentData, [key]: value }
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
          Promo Description
        </label>
        <textarea
          value={contentData.text || ''}
          onChange={e => handleContentChange('text', e.target.value)}
          placeholder="Add promotional description"
          rows={3}
          className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
            BG Color
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={settings.bg_color || '#e94560'}
              onChange={e => handleSettingsChange('bg_color', e.target.value)}
              className="h-8 w-8 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-800 bg-transparent p-0.5"
            />
            <input
              type="text"
              value={settings.bg_color || '#e94560'}
              onChange={e => handleSettingsChange('bg_color', e.target.value)}
              className="w-full px-2 py-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
            Text Color
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={settings.text_color || '#ffffff'}
              onChange={e => handleSettingsChange('text_color', e.target.value)}
              className="h-8 w-8 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-800 bg-transparent p-0.5"
            />
            <input
              type="text"
              value={settings.text_color || '#ffffff'}
              onChange={e => handleSettingsChange('text_color', e.target.value)}
              className="w-full px-2 py-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
            />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Show Button</span>
          <span className="text-[10px] text-gray-400">Toggle the CTA / Shop button on this banner</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={contentData.show_button !== false}
            onChange={e => handleContentChange('show_button', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
        </label>
      </div>
      {contentData.show_button !== false && (
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
          Link URL
        </label>
        <input
          type="text"
          value={contentData.link || ''}
          onChange={e => handleContentChange('link', e.target.value)}
          placeholder="/shop"
          className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
        />
      </div>
      )}
      {contentData.show_button !== false && (
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
          Button Text
        </label>
        <input
          type="text"
          value={contentData.button_text || 'Shop Offer'}
          onChange={e => handleContentChange('button_text', e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
        />
      </div>
      )}

      <SectionSpacingControls section={section} onUpdateSection={onUpdateSection} />
    </div>
  );
}
