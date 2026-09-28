'use client';

import React from 'react';
import { StoreSettings } from '@/lib/types';
import { ChevronUp, ChevronDown } from '@/components/common/Icons';
import { moveItemInArray } from '@/lib/utils/arrayMove';
import { DEFAULT_MOBILE_NAV_ITEMS, type MobileBottomNavItem } from '@/components/common/MobileBottomNav';

interface MobileBottomNavBuilderProps {
  settings: StoreSettings;
  onUpdateSettings: (updates: Partial<StoreSettings>) => void;
}

// Merge saved items with the canonical defaults so newly-added registry keys always appear,
// and any stale/removed key is dropped. Preserves saved order + visibility + custom label.
function resolveItems(saved?: { key: string; label: string; visible: boolean }[] | null): MobileBottomNavItem[] {
  const validKeys = new Set(DEFAULT_MOBILE_NAV_ITEMS.map((d) => d.key));
  if (!Array.isArray(saved) || saved.length === 0) return DEFAULT_MOBILE_NAV_ITEMS.map((d) => ({ ...d }));
  const cleaned = saved.filter((s) => validKeys.has(s.key)).map((s) => ({ key: s.key, label: s.label, visible: s.visible !== false }));
  const present = new Set(cleaned.map((s) => s.key));
  for (const d of DEFAULT_MOBILE_NAV_ITEMS) if (!present.has(d.key)) cleaned.push({ ...d });
  return cleaned;
}

export default function MobileBottomNavBuilder({ settings, onUpdateSettings }: MobileBottomNavBuilderProps) {
  const items = resolveItems(settings.mobile_bottom_nav_items);

  const commit = (next: MobileBottomNavItem[]) => onUpdateSettings({ mobile_bottom_nav_items: next });

  const setItem = (index: number, patch: Partial<MobileBottomNavItem>) => {
    commit(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  };
  const move = (index: number, direction: 'up' | 'down') => commit(moveItemInArray(items, index, direction));

  const visibleCount = items.filter((it) => it.visible).length;

  return (
    <div className="space-y-3 border-b border-gray-200 dark:border-gray-800 pb-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Bottom Nav Items</span>
        <label className="relative inline-flex items-center gap-2 cursor-pointer select-none">
          <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">Show Labels</span>
          <input
            type="checkbox"
            checked={settings.mobile_bottom_nav_show_labels ?? true}
            onChange={(e) => onUpdateSettings({ mobile_bottom_nav_show_labels: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
        </label>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={item.key}
            className="flex items-center gap-2 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-white/2 px-2.5 py-2"
          >
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => move(index, 'up')}
                disabled={index === 0}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30"
                aria-label={`Move ${item.label} up`}
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => move(index, 'down')}
                disabled={index === items.length - 1}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30"
                aria-label={`Move ${item.label} down`}
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>

            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 w-14 shrink-0">{item.key}</span>

            <input
              type="text"
              value={item.label}
              onChange={(e) => setItem(index, { label: e.target.value })}
              className="flex-1 min-w-0 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f0f1b] px-2 py-1 text-[11px] font-semibold focus:outline-none"
              placeholder="Label"
            />

            <label className="relative inline-flex items-center cursor-pointer select-none shrink-0" title={item.visible ? 'Visible' : 'Hidden'}>
              <input
                type="checkbox"
                checked={item.visible}
                onChange={(e) => setItem(index, { visible: e.target.checked })}
                disabled={item.visible && visibleCount <= 1}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560] peer-disabled:opacity-40" />
            </label>
          </div>
        ))}
      </div>
      <p className="text-[9px] text-gray-400 dark:text-gray-500 font-semibold leading-tight">
        Reorder with arrows, rename labels, toggle visibility. At least one item must stay visible.
      </p>
    </div>
  );
}
