'use client';

import React from 'react';
import { HomepageSection } from '@/lib/types';
import { AccordionGroup } from '@/components/admin/customizer/controls';

interface SectionSpacingControlsProps {
  section: HomepageSection;
  onUpdateSection: (updates: Partial<HomepageSection>) => void;
}

/**
 * SSOT1 — Universal Section Spacing & Background accordion.
 * Add <SectionSpacingControls> at the bottom of every section's settings editor.
 */
export default function SectionSpacingControls({
  section,
  onUpdateSection,
}: SectionSpacingControlsProps) {
  const s = section.settings || {};

  const setSetting = (key: string, value: unknown) => {
    onUpdateSection({
      settings: {
        ...s,
        [key]: value,
      },
    });
  };

  return (
    <AccordionGroup id={`spacing-${section.id}`} title="Spacing & Background" defaultOpen={false}>
      <div className="space-y-4 pt-2">
        {/* Padding Top */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Padding Top</label>
            <span className="text-xs font-bold text-[#e94560]">{s.padding_top ?? 20}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={120}
            step={4}
            value={s.padding_top ?? 20}
            onChange={(e) => setSetting('padding_top', parseInt(e.target.value, 10))}
            className="w-full accent-[#e94560] cursor-pointer"
          />
        </div>

        {/* Padding Bottom */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Padding Bottom</label>
            <span className="text-xs font-bold text-[#e94560]">{s.padding_bottom ?? 20}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={120}
            step={4}
            value={s.padding_bottom ?? 20}
            onChange={(e) => setSetting('padding_bottom', parseInt(e.target.value, 10))}
            className="w-full accent-[#e94560] cursor-pointer"
          />
        </div>

        {/* Section Background Color */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Section Background</label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={s.section_bg_color || '#ffffff'}
              onChange={(e) => setSetting('section_bg_color', e.target.value)}
              className="h-8 w-8 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-800 bg-transparent p-0.5"
            />
            <input
              type="text"
              value={s.section_bg_color || ''}
              onChange={(e) => setSetting('section_bg_color', e.target.value)}
              placeholder="transparent / #f8f8f8"
              className="flex-1 px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
            />
            {Boolean(s.section_bg_color) && (
              <button
                type="button"
                onClick={() => setSetting('section_bg_color', '')}
                className="text-[10px] text-gray-400 hover:text-[#e94560] font-bold uppercase tracking-wider cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </AccordionGroup>
  );
}
