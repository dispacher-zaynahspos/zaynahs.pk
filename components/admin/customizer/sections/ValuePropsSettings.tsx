'use client';

import React from 'react';
import { HomepageSection } from '@/lib/types';
import { ChevronUp, ChevronDown, Trash2, Plus } from '@/components/common/Icons';
import { AccordionGroup } from '@/components/admin/customizer/controls';

interface ValuePropItem {
  icon?: string;
  title?: string;
  subtitle?: string;
}

interface ValuePropsSettingsProps {
  section: HomepageSection;
  onUpdateSection: (updates: Partial<HomepageSection>) => void;
}

export default function ValuePropsSettings({ section, onUpdateSection }: ValuePropsSettingsProps) {
  const settings = section.settings || {};
  const items: ValuePropItem[] = section.content_data?.items || [];

  const setSetting = (key: string, value: unknown) =>
    onUpdateSection({ settings: { ...settings, [key]: value } });

  const setItems = (next: ValuePropItem[]) =>
    onUpdateSection({ content_data: { ...section.content_data, items: next } });

  const updateItem = (idx: number, key: keyof ValuePropItem, value: string) => {
    const next = items.map((it, i) => (i === idx ? { ...it, [key]: value } : it));
    setItems(next);
  };

  const addItem = () => setItems([...items, { icon: '✦', title: 'New Benefit', subtitle: '' }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const move = (idx: number, dir: 'up' | 'down') => {
    const j = dir === 'up' ? idx - 1 : idx + 1;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[idx], next[j]] = [next[j], next[idx]];
    setItems(next);
  };

  return (
    <div className="space-y-3">
      <AccordionGroup id={`vp-${section.id}-layout`} title="Layout" defaultOpen>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Columns (Desktop)</label>
              <select
                value={settings.columns_desktop || 4}
                onChange={(e) => setSetting('columns_desktop', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
              >
                {[2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Columns (Mobile)</label>
              <select
                value={settings.columns_mobile || 2}
                onChange={(e) => setSetting('columns_mobile', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
              >
                {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Style</label>
            <select
              value={settings.style || 'card'}
              onChange={(e) => setSetting('style', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
            >
              <option value="card">Card (bordered)</option>
              <option value="plain">Plain (no card)</option>
            </select>
          </div>
        </div>
      </AccordionGroup>

      <AccordionGroup id={`vp-${section.id}-items`} title={`Items (${items.length})`} defaultOpen>
        <div className="space-y-2.5 pt-2">
          {items.map((it, idx) => (
            <div key={idx} className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={it.icon || ''}
                  onChange={(e) => updateItem(idx, 'icon', e.target.value)}
                  placeholder="🚚"
                  className="w-14 px-2 py-2 text-center bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-700 rounded-lg text-base focus:outline-none focus:border-[#e94560]"
                />
                <input
                  type="text"
                  value={it.title || ''}
                  onChange={(e) => updateItem(idx, 'title', e.target.value)}
                  placeholder="Title"
                  className="flex-1 min-w-0 px-3 py-2 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                />
                <div className="flex items-center gap-0.5 shrink-0">
                  <button onClick={() => move(idx, 'up')} disabled={idx === 0} className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronUp className="h-3.5 w-3.5" /></button>
                  <button onClick={() => move(idx, 'down')} disabled={idx === items.length - 1} className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronDown className="h-3.5 w-3.5" /></button>
                  <button onClick={() => removeItem(idx)} className="p-0.5 text-red-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <input
                type="text"
                value={it.subtitle || ''}
                onChange={(e) => updateItem(idx, 'subtitle', e.target.value)}
                placeholder="Subtitle (optional)"
                className="w-full px-3 py-2 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
              />
            </div>
          ))}
          <button
            onClick={addItem}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:border-[#e94560] hover:text-[#e94560] transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Add Item
          </button>
        </div>
      </AccordionGroup>
    </div>
  );
}
