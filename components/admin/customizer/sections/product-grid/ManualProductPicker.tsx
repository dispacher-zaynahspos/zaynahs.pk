'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '@/lib/types';
import { ChevronUp, ChevronDown, GripVertical, Trash2, Search, X } from '@/components/common/Icons';
import Image from 'next/image';

interface ManualProductPickerProps {
  products: Product[];
  manualProductIds: string[];
  settingsSource?: string;
  onUpdateManualIds: (ids: string[]) => void;
}

export default function ManualProductPicker({
  products,
  manualProductIds,
  settingsSource,
  onUpdateManualIds,
}: ManualProductPickerProps) {
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerLimit, setPickerLimit] = useState(50);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    setPickerLimit(50);
  }, [pickerSearch, settingsSource]);

  const filteredPickerProducts = useMemo(() => {
    let list = products;

    if (settingsSource === 'featured') {
      list = list.filter((p) => p.isFeatured);
    } else if (settingsSource && settingsSource !== 'all') {
      list = list.filter(
        (p) =>
          p.categoryId === settingsSource ||
          p.category?.slug === settingsSource ||
          p.category?.id === settingsSource ||
          p.productCategories?.some(
            (pc: any) => pc.categoryId === settingsSource || pc.category?.slug === settingsSource
          )
      );
    }

    if (pickerSearch.trim()) {
      const q = pickerSearch.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q))
      );
    }
    return list;
  }, [pickerSearch, products, settingsSource]);

  const displayPickerProducts = filteredPickerProducts.slice(0, pickerLimit);
  const hasMorePickerProducts = displayPickerProducts.length < filteredPickerProducts.length;

  const manualProducts = useMemo(() => {
    return manualProductIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => !!p);
  }, [manualProductIds, products]);

  const addProduct = (productId: string) => {
    onUpdateManualIds([...manualProductIds, productId]);
    setPickerSearch('');
  };

  const removeProduct = (productId: string) => {
    onUpdateManualIds(manualProductIds.filter((id) => id !== productId));
  };

  const moveProduct = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= manualProductIds.length) return;
    const copy = [...manualProductIds];
    const [removed] = copy.splice(index, 1);
    copy.splice(newIndex, 0, removed);
    onUpdateManualIds(copy);
  };

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', manualProductIds[idx]);
    setDraggingId(manualProductIds[idx]);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    const threshold = 120;
    const speed = 15;
    const cursorY = e.clientY;
    const viewportH = window.innerHeight;
    if (cursorY > viewportH - threshold) {
      window.scrollBy({ top: speed, behavior: 'auto' });
    } else if (cursorY < threshold) {
      window.scrollBy({ top: -speed, behavior: 'auto' });
    }

    if (!draggingId) return;
    const tgtId = manualProductIds[idx];
    if (draggingId === tgtId) return;

    const srcIdx = manualProductIds.indexOf(draggingId);
    const tgtIdx = manualProductIds.indexOf(tgtId);
    if (srcIdx === -1 || tgtIdx === -1) return;

    const copy = [...manualProductIds];
    const [dragged] = copy.splice(srcIdx, 1);
    const adjustedTgt = tgtIdx > srcIdx ? tgtIdx - 1 : tgtIdx;
    copy.splice(adjustedTgt, 0, dragged);
    onUpdateManualIds(copy);
    setDraggingId(tgtId);
  };

  const handleDrop = () => setDraggingId(null);
  const handleDragEnd = () => setDraggingId(null);

  return (
    <div className="space-y-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <input
          type="text"
          placeholder="Type product name or SKU to add..."
          value={pickerSearch}
          onChange={(e) => setPickerSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
        />
        {pickerSearch && (
          <button
            onClick={() => setPickerSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#0f0f1b] divide-y divide-gray-100 dark:divide-gray-800 max-h-40 overflow-y-auto overscroll-contain">
        {displayPickerProducts.map((p) => {
          const isChecked = manualProductIds.includes(p.id);
          return (
            <label
              key={p.id}
              className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors ${
                isChecked ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => {
                  if (e.target.checked) {
                    addProduct(p.id);
                  } else {
                    removeProduct(p.id);
                  }
                }}
                className="shrink-0 rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-3.5 w-3.5 cursor-pointer"
              />
              <div className="relative h-7 w-7 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {p.images?.[0] && (
                  <Image src={p.images[0].url} alt={p.name} fill className="object-cover" sizes="28px" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-900 dark:text-white truncate">{p.name}</div>
                {p.sku && <div className="text-[10px] text-gray-400">{p.sku}</div>}
              </div>
            </label>
          );
        })}
        {filteredPickerProducts.length === 0 && (
          <div className="text-xs text-gray-400 text-center py-4">No products found</div>
        )}
        {hasMorePickerProducts && (
          <button
            type="button"
            onClick={() => setPickerLimit((prev) => prev + 50)}
            className="w-full py-2 text-xs font-bold text-[#e94560] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            Load More ({filteredPickerProducts.length - pickerLimit} left)
          </button>
        )}
      </div>

      {manualProducts.length > 0 && (
        <div className="space-y-1.5 max-h-60 overflow-y-auto">
          {manualProducts.map((p, idx) => (
            <div
              key={p.id}
              className={`flex items-center gap-2 p-2 bg-white dark:bg-[#0f0f1b] rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-200 ${
                draggingId === p.id ? 'opacity-50 bg-orange-50/50 dark:bg-orange-950/20' : ''
              }`}
            >
              <div className="text-xs font-semibold text-slate-400 w-6 text-center shrink-0">#{idx + 1}</div>
              <div
                className="flex flex-col items-center gap-0.5"
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
              >
                <button
                  type="button"
                  onClick={() => moveProduct(idx, 'up')}
                  disabled={idx === 0}
                  className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronUp className="h-2.5 w-2.5" />
                </button>
                <span className="p-0.5 text-gray-400 cursor-grab active:cursor-grabbing touch-none select-none">
                  <GripVertical className="h-3 w-3" />
                </span>
                <button
                  type="button"
                  onClick={() => moveProduct(idx, 'down')}
                  disabled={idx === manualProducts.length - 1}
                  className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronDown className="h-2.5 w-2.5" />
                </button>
              </div>
              <div className="relative h-8 w-8 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {p.images?.[0] && (
                  <Image src={p.images[0].url} alt={p.name} fill className="object-cover" sizes="32px" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-900 dark:text-white truncate">{p.name}</div>
                <div className="text-[10px] text-gray-400">{p.sku || 'No SKU'}</div>
              </div>
              <button
                type="button"
                onClick={() => removeProduct(p.id)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
