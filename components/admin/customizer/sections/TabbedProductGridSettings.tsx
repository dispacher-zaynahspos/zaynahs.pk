'use client';

import React from 'react';
import { HomepageSection, Category } from '@/lib/types';
import { Trash2, Plus } from '@/components/common/Icons';
import { AccordionGroup } from '@/components/admin/customizer/controls';
import ResponsiveGridColumnsControl from '../shared/ResponsiveGridColumnsControl';
import SectionSpacingControls from '../shared/SectionSpacingControls';

interface Tab {
  id: string;
  label: string;
  source: string;
}

interface TabbedProductGridSettingsProps {
  section: HomepageSection;
  categories: Category[] | { id: string; name: string; slug: string }[];
  viewportMode?: 'desktop' | 'tablet' | 'mobile';
  onUpdateSection: (updates: Partial<HomepageSection>) => void;
}

export default function TabbedProductGridSettings({
  section,
  categories = [],
  viewportMode = 'desktop',
  onUpdateSection,
}: TabbedProductGridSettingsProps) {
  const s = section.settings || {};
  const c = section.content_data || {};
  const tabs: Tab[] = c.tabs || [
    { id: 'new', label: 'New Arrivals', source: 'recent' },
    { id: 'best', label: 'Best Sellers', source: 'featured' },
  ];

  const setSetting = (key: string, value: unknown) =>
    onUpdateSection({ settings: { ...s, [key]: value } });
  const setTabs = (next: Tab[]) =>
    onUpdateSection({ content_data: { ...c, tabs: next } });

  const addTab = () =>
    setTabs([...tabs, { id: `tab-${Date.now()}`, label: 'New Tab', source: 'featured' }]);
  const removeTab = (idx: number) => setTabs(tabs.filter((_, i) => i !== idx));
  const updateTab = (idx: number, key: keyof Tab, value: string) => {
    const next = tabs.map((t, i) => (i === idx ? { ...t, [key]: value } : t));
    setTabs(next);
  };

  return (
    <div className="space-y-3">
      {/* Tabs Config */}
      <AccordionGroup id={`tpg-${section.id}-tabs`} title={`Tabs (${tabs.length})`} defaultOpen>
        <div className="space-y-2.5 pt-2">
          {tabs.map((tab, idx) => (
            <div key={tab.id} className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tab.label}
                  onChange={(e) => updateTab(idx, 'label', e.target.value)}
                  placeholder="Tab label"
                  className="flex-1 px-3 py-2 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                />
                <button type="button" onClick={() => removeTab(idx)} className="p-1 text-red-400 hover:text-red-500 cursor-pointer">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <select
                value={tab.source}
                onChange={(e) => updateTab(idx, 'source', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
              >
                <option value="featured">Best Sellers (Featured)</option>
                <option value="recent">New Arrivals (Recent)</option>
                <option value="sale">On Sale</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          ))}
          <button
            type="button"
            onClick={addTab}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:border-[#e94560] hover:text-[#e94560] transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Add Tab
          </button>
        </div>
      </AccordionGroup>

      {/* Grid Layout */}
      <AccordionGroup id={`tpg-${section.id}-layout`} title="Grid Layout" defaultOpen={false}>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Products per Tab</label>
              <span className="text-xs font-bold text-[#e94560]">{s.limit_per_tab || 8}</span>
            </div>
            <input
              type="range" min={4} max={24} step={4}
              value={s.limit_per_tab || 8}
              onChange={(e) => setSetting('limit_per_tab', parseInt(e.target.value, 10))}
              className="w-full accent-[#e94560]"
            />
          </div>
          <ResponsiveGridColumnsControl
            label="Columns per Row"
            viewportMode={viewportMode}
            desktopCols={Number(s.columns_desktop) || 4}
            tabletCols={Number(s.columns_tablet) || 3}
            mobileCols={Number(s.columns_mobile) || 2}
            onChangeDesktop={(c) => setSetting('columns_desktop', c)}
            onChangeTablet={(c) => setSetting('columns_tablet', c)}
            onChangeMobile={(c) => setSetting('columns_mobile', c)}
          />
        </div>
      </AccordionGroup>

      <SectionSpacingControls section={section} onUpdateSection={onUpdateSection} />
    </div>
  );
}
