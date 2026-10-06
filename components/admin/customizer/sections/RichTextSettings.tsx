'use client';

import React from 'react';
import { HomepageSection } from '@/lib/types';
import { AccordionGroup } from '@/components/admin/customizer/controls';
import SectionSpacingControls from '../shared/SectionSpacingControls';

interface RichTextSettingsProps {
  section: HomepageSection;
  onUpdateSection: (updates: Partial<HomepageSection>) => void;
}

export default function RichTextSettings({ section, onUpdateSection }: RichTextSettingsProps) {
  const s = section.settings || {};
  const c = section.content_data || {};
  const setSetting = (key: string, value: unknown) =>
    onUpdateSection({ settings: { ...s, [key]: value } });
  const setContent = (key: string, value: unknown) =>
    onUpdateSection({ content_data: { ...c, [key]: value } });

  return (
    <div className="space-y-3">
      <AccordionGroup id={`rt-${section.id}-content`} title="Content" defaultOpen>
        <div className="space-y-3 pt-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Heading</label>
            <input
              type="text" value={c.heading || ''}
              onChange={(e) => setContent('heading', e.target.value)}
              placeholder="Section heading"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Body Text</label>
            <textarea
              value={c.body || ''} rows={5}
              onChange={(e) => setContent('body', e.target.value)}
              placeholder="Your message..."
              className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Button Text</label>
              <input type="text" value={c.button_text || ''} onChange={(e) => setContent('button_text', e.target.value)} placeholder="Shop Now"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Button Link</label>
              <input type="text" value={c.button_link || ''} onChange={(e) => setContent('button_link', e.target.value)} placeholder="/shop"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white" />
            </div>
          </div>
        </div>
      </AccordionGroup>

      <AccordionGroup id={`rt-${section.id}-layout`} title="Layout" defaultOpen={false}>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Text Alignment</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['left', 'center', 'right'] as const).map((a) => (
                <button key={a} type="button" onClick={() => setSetting('text_align', a)}
                  className={`py-1.5 rounded-xl text-xs font-bold border capitalize cursor-pointer ${(s.text_align || 'center') === a ? 'bg-[#e94560] text-white border-[#e94560]' : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Content Width</label>
            <select value={s.max_width || 'narrow'} onChange={(e) => setSetting('max_width', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white">
              <option value="narrow">Narrow (max-w-2xl)</option>
              <option value="wide">Wide (max-w-4xl)</option>
              <option value="full">Full Width</option>
            </select>
          </div>
        </div>
      </AccordionGroup>

      <SectionSpacingControls section={section} onUpdateSection={onUpdateSection} />
    </div>
  );
}
