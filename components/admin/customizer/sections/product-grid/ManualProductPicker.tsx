'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '@/lib/types';
import { Trash2, Search, X } from '@/components/common/Icons';
import Image from 'next/image';
import { rankProducts } from '@/lib/services/product-search/useInMemoryProductSearch';
import { SortableList } from '@/components/common/reorder';

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

  useEffect(() => {
    setPickerLimit(50);
  }, [pickerSearch, settingsSource]);

  const filteredPickerProducts = useMemo(() => {
    let list = products;

    if (settingsSource === 'featured') {
      list = list.filter((p) => p.is_featured);
    } else if (settingsSource && settingsSource !== 'all') {
      list = list.filter(
        (p) =>
          p.category_id === settingsSource ||
          p.category?.slug === settingsSource ||
          p.category?.id === settingsSource ||
          p.product_categories?.some(
            (pc: any) => pc.category_id === settingsSource || pc.category?.slug === settingsSource
          )
      );
    }

    if (pickerSearch.trim()) {
      list = rankProducts(list, pickerSearch);
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
        <div className="max-h-60 overflow-y-auto">
          <SortableList
            items={manualProducts}
            onReorder={(next) => onUpdateManualIds(next.map((p) => p.id))}
            className="space-y-1.5"
            renderItem={(p, api) => (
              <div className="flex items-center gap-2 p-2 bg-white dark:bg-[#0f0f1b] rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="text-xs font-semibold text-slate-400 w-6 text-center shrink-0">#{api.rank}</div>
                <api.Controls />
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
            )}
          />
        </div>
      )}
    </div>
  );
}
