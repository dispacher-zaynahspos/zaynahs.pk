'use client';

/**
 * Repeater control (Phase 1 foundation) — reorder / duplicate / delete / collapse.
 * Generic over item shape; parent supplies renderItem + a factory for new items.
 */
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Trash2, Plus, GripVertical } from '@/components/common/Icons';
import { moveItemInArray } from '@/lib/utils/arrayMove';

export interface RepeaterControlProps<T> {
  label?: string;
  items: T[];
  onChange: (items: T[]) => void;
  /** Render the editor body for one item. */
  renderItem: (item: T, index: number, update: (patch: Partial<T>) => void) => React.ReactNode;
  /** Short label for a collapsed row. */
  itemTitle: (item: T, index: number) => string;
  /** Create a blank item when "Add" is pressed. */
  newItem: () => T;
  addLabel?: string;
  minItems?: number;
}

export function RepeaterControl<T>({
  label,
  items,
  onChange,
  renderItem,
  itemTitle,
  newItem,
  addLabel = 'Add item',
  minItems = 0,
}: RepeaterControlProps<T>) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const update = (index: number, patch: Partial<T>) => {
    const next = items.slice();
    next[index] = { ...(next[index] as object), ...(patch as object) } as T;
    onChange(next);
  };
  const move = (index: number, dir: 'up' | 'down') => {
    onChange(moveItemInArray(items, index, dir));
  };
  const duplicate = (index: number) => {
    const next = items.slice();
    next.splice(index + 1, 0, JSON.parse(JSON.stringify(items[index])));
    onChange(next);
  };
  const remove = (index: number) => {
    if (items.length <= minItems) return;
    onChange(items.filter((_, i) => i !== index));
  };
  const add = () => {
    onChange([...items, newItem()]);
    setOpenIndex(items.length);
  };

  return (
    <div className="space-y-2 py-2">
      {label && <div className="text-xs font-bold text-gray-700 dark:text-gray-300">{label}</div>}
      <div className="space-y-1.5">
        {items.map((item, i) => {
          const open = openIndex === i;
          return (
            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-50 dark:bg-gray-800/40">
                <GripVertical className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="flex-1 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 truncate cursor-pointer min-h-[32px]"
                >
                  {itemTitle(item, i) || `Item ${i + 1}`}
                </button>
                <button type="button" onClick={() => move(i, 'up')} disabled={i === 0} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer" aria-label="Move up"><ChevronUp className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => move(i, 'down')} disabled={i === items.length - 1} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer" aria-label="Move down"><ChevronDown className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => duplicate(i)} className="p-1 text-gray-400 hover:text-blue-600 cursor-pointer" aria-label="Duplicate"><Copy className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => remove(i)} disabled={items.length <= minItems} className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-30 cursor-pointer" aria-label="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              {open && <div className="p-3 space-y-1">{renderItem(item, i, (patch) => update(i, patch))}</div>}
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={add}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:border-blue-400 hover:text-blue-600 cursor-pointer min-h-[40px]"
      >
        <Plus className="w-4 h-4" /> {addLabel}
      </button>
    </div>
  );
}
