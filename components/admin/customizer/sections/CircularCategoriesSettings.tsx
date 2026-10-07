'use client';

import React from 'react';
import { HomepageSection, Category } from '@/lib/types';
import { Trash2, ChevronUp, ChevronDown, Plus } from '@/components/common/Icons';
import { moveItemInArray } from '@/lib/utils/arrayMove';
import { AccordionGroup } from '@/components/admin/customizer/controls';
import MediaField from '../shared/MediaField';
import SectionSpacingControls from '../shared/SectionSpacingControls';

interface CircularItem {
  title: string;
  link: string;
  imageUrl: string;
  ref_type?: 'category' | 'collection';
  ref_id?: string;
  image_mode?: 'auto' | 'custom';
}

interface CircularCategoriesSettingsProps {
  section: HomepageSection;
  categories?: Category[];
  onUpdateSection: (updates: Partial<HomepageSection>) => void;
  onSelectMedia: (fieldPath: 'settings' | 'content_data', fieldKey: string, isGridItem?: boolean, gridIndex?: number) => void;
}

export default function CircularCategoriesSettings({
  section, categories = [], onUpdateSection, onSelectMedia,
}: CircularCategoriesSettingsProps) {
  const s = section.settings || {};
  const c = section.content_data || {};
  const items: CircularItem[] = c.items || [];

  const setSetting = (key: string, value: unknown) =>
    onUpdateSection({ settings: { ...s, [key]: value } });
  const setItems = (next: CircularItem[]) =>
    onUpdateSection({ content_data: { ...c, items: next } });

  const addItem = () => setItems([...items, { title: '', link: '/shop', imageUrl: '' }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, key: keyof CircularItem, value: string) => {
    const next = items.map((it, i) => (i === idx ? { ...it, [key]: value } : it));
    setItems(next);
  };
  const moveItem = (idx: number, dir: 'up' | 'down') =>
    setItems(moveItemInArray(items, idx, dir));

  const handleBulkFromCategories = () => {
    const newItems = categories
      .filter((cat) => cat.slug !== 'shop')
      .map((cat) => ({
        title: cat.name,
        link: `/shop?category=${cat.slug}`,
        imageUrl: cat.image_url || '',
        ref_type: 'category' as const,
        ref_id: cat.id,
        image_mode: 'auto' as const,
      }));
    setItems([...items, ...newItems]);
  };

  return (
    <div className="space-y-3">
      {/* Layout */}
      <AccordionGroup id={`cc-${section.id}-layout`} title="Layout" defaultOpen>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Circle Size</label>
              <span className="text-xs font-bold text-[#e94560]">{s.item_size ?? 80}px</span>
            </div>
            <input
              type="range" min={56} max={120} step={8}
              value={s.item_size ?? 80}
              onChange={(e) => setSetting('item_size', parseInt(e.target.value, 10))}
              className="w-full accent-[#e94560]"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Show Labels</span>
              <span className="text-[10px] text-gray-400">Display category name below circle</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={s.show_labels !== false}
                onChange={(e) => setSetting('show_labels', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
            </label>
          </div>
        </div>
      </AccordionGroup>

      {/* Items */}
      <AccordionGroup id={`cc-${section.id}-items`} title={`Categories (${items.length})`} defaultOpen>
        <div className="space-y-2.5 pt-2">
          {categories.length > 0 && (
            <button
              type="button"
              onClick={handleBulkFromCategories}
              className="w-full px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all cursor-pointer"
            >
              + Import All Categories
            </button>
          )}
          {items.map((item, idx) => (
            <div key={idx} className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => updateItem(idx, 'title', e.target.value)}
                  placeholder="Category name"
                  className="flex-1 px-3 py-2 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                />
                <div className="flex items-center gap-0.5 shrink-0">
                  <button type="button" onClick={() => moveItem(idx, 'up')} disabled={idx === 0} className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 cursor-pointer"><ChevronUp className="h-3.5 w-3.5" /></button>
                  <button type="button" onClick={() => moveItem(idx, 'down')} disabled={idx === items.length - 1} className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 cursor-pointer"><ChevronDown className="h-3.5 w-3.5" /></button>
                  <button type="button" onClick={() => removeItem(idx)} className="p-0.5 text-red-400 hover:text-red-500 cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <input
                type="text"
                value={item.link}
                onChange={(e) => updateItem(idx, 'link', e.target.value)}
                placeholder="/shop?category=kids"
                className="w-full px-3 py-2 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
              />
              <MediaField
                label="Circle Image"
                value={item.imageUrl}
                onChange={(val) => { const next = items.map((it, i) => (i === idx ? { ...it, imageUrl: val, image_mode: 'custom' as const } : it)); setItems(next); }}
                onSelect={() => onSelectMedia('content_data', 'items', true, idx)}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addItem}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:border-[#e94560] hover:text-[#e94560] transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Add Circle
          </button>
        </div>
      </AccordionGroup>

      <SectionSpacingControls section={section} onUpdateSection={onUpdateSection} />
    </div>
  );
}
