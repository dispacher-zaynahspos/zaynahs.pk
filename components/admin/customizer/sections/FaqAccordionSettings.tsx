'use client';

import React from 'react';
import { HomepageSection } from '@/lib/types';
import { Trash2, ChevronUp, ChevronDown, Plus } from '@/components/common/Icons';
import { moveItemInArray } from '@/lib/utils/arrayMove';
import { AccordionGroup } from '@/components/admin/customizer/controls';
import SectionSpacingControls from '../shared/SectionSpacingControls';

interface FaqItem { q: string; a: string; }

interface FaqAccordionSettingsProps {
  section: HomepageSection;
  onUpdateSection: (updates: Partial<HomepageSection>) => void;
}

export default function FaqAccordionSettings({ section, onUpdateSection }: FaqAccordionSettingsProps) {
  const c = section.content_data || {};
  const items: FaqItem[] = c.items || [];

  const setItems = (next: FaqItem[]) =>
    onUpdateSection({ content_data: { ...c, items: next } });

  const addItem = () => setItems([...items, { q: 'New Question?', a: 'Answer goes here.' }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, key: 'q' | 'a', val: string) => {
    const next = items.map((it, i) => (i === idx ? { ...it, [key]: val } : it));
    setItems(next);
  };
  const moveItem = (idx: number, dir: 'up' | 'down') =>
    setItems(moveItemInArray(items, idx, dir));

  return (
    <div className="space-y-3">
      <AccordionGroup id={`faq-${section.id}-items`} title={`FAQ Items (${items.length})`} defaultOpen>
        <div className="space-y-2.5 pt-2">
          {items.map((item, idx) => (
            <div key={idx} className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2">
              <div className="flex items-center gap-1 justify-end">
                <button type="button" onClick={() => moveItem(idx, 'up')} disabled={idx === 0} className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 cursor-pointer"><ChevronUp className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => moveItem(idx, 'down')} disabled={idx === items.length - 1} className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 cursor-pointer"><ChevronDown className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => removeItem(idx)} className="p-0.5 text-red-400 hover:text-red-500 cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Question</label>
                <input
                  type="text"
                  value={item.q}
                  onChange={(e) => updateItem(idx, 'q', e.target.value)}
                  placeholder="Question?"
                  className="w-full px-3 py-2 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Answer</label>
                <textarea
                  value={item.a}
                  onChange={(e) => updateItem(idx, 'a', e.target.value)}
                  placeholder="Answer..."
                  rows={3}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white resize-none"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addItem}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:border-[#e94560] hover:text-[#e94560] transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Add FAQ
          </button>
        </div>
      </AccordionGroup>
      <SectionSpacingControls section={section} onUpdateSection={onUpdateSection} />
    </div>
  );
}
