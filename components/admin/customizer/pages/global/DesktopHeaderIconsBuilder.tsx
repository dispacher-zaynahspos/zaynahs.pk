'use client';

import React from 'react';
import { StoreSettings } from '@/lib/types';
import { ChevronUp, ChevronDown } from '@/components/common/Icons';
import { moveItemInArray } from '@/lib/utils/arrayMove';

export interface DesktopHeaderIconItem {
  key: 'search' | 'account' | 'wishlist' | 'cart' | 'track' | string;
  label: string;
  visible: boolean;
}

export const DEFAULT_DESKTOP_HEADER_ICONS: DesktopHeaderIconItem[] = [
  { key: 'search', label: 'Search', visible: true },
  { key: 'account', label: 'Account', visible: true },
  { key: 'wishlist', label: 'Wishlist', visible: true },
  { key: 'cart', label: 'Cart', visible: true },
  { key: 'track', label: 'Track Order', visible: true },
];

interface DesktopHeaderIconsBuilderProps {
  settings: StoreSettings;
  onUpdateSettings: (updates: Partial<StoreSettings>) => void;
}

function resolveItems(saved?: { key: string; label: string; visible: boolean }[] | null): DesktopHeaderIconItem[] {
  const validKeys = new Set(DEFAULT_DESKTOP_HEADER_ICONS.map((d) => d.key));
  if (!Array.isArray(saved) || saved.length === 0) return DEFAULT_DESKTOP_HEADER_ICONS.map((d) => ({ ...d }));
  const cleaned = saved.filter((s) => validKeys.has(s.key)).map((s) => ({ key: s.key, label: s.label, visible: s.visible !== false }));
  const present = new Set(cleaned.map((s) => s.key));
  for (const d of DEFAULT_DESKTOP_HEADER_ICONS) if (!present.has(d.key)) cleaned.push({ ...d });
  return cleaned;
}

export default function DesktopHeaderIconsBuilder({ settings, onUpdateSettings }: DesktopHeaderIconsBuilderProps) {
  const items = resolveItems(settings.desktop_header_icons);

  const commit = (next: DesktopHeaderIconItem[]) => onUpdateSettings({ desktop_header_icons: next });

  const setItem = (index: number, patch: Partial<DesktopHeaderIconItem>) => {
    commit(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  };
  const move = (index: number, direction: 'up' | 'down') => commit(moveItemInArray(items, index, direction));

  const visibleCount = items.filter((it) => it.visible).length;

  return (
    <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Desktop Header Icons</span>
        <span className="text-[10px] text-gray-400 font-semibold">{visibleCount} Visible</span>
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
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 cursor-pointer"
                aria-label={`Move ${item.label} up`}
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => move(index, 'down')}
                disabled={index === items.length - 1}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 cursor-pointer"
                aria-label={`Move ${item.label} down`}
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>

            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 w-16 shrink-0">
              {item.key}
            </span>

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
        Reorder desktop icons with arrows, rename labels, and toggle visibility.
      </p>
    </div>
  );
}
