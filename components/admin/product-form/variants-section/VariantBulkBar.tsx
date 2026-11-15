'use client';

import React from 'react';
import { Trash2 } from '@/components/common/Icons';

interface VariantBulkBarProps {
  selectedVariantIndices: number[];
  setSelectedVariantIndices: React.Dispatch<React.SetStateAction<number[]>>;
  handleBulkDelete: () => void;
  handleBulkUpdatePrice: (price: number) => void;
  handleBulkUpdateComparePrice: (comparePrice: number) => void;
  handleBulkUpdateStock: (stock: number) => void;
  handleBulkUpdateSku: (skuPrefix: string) => void;
  handleBulkUpdateThreshold: (threshold: number) => void;
  handleBulkUpdateActive: (active: boolean) => void;
}

export const VariantBulkBar: React.FC<VariantBulkBarProps> = ({
  selectedVariantIndices,
  setSelectedVariantIndices,
  handleBulkDelete,
  handleBulkUpdatePrice,
  handleBulkUpdateComparePrice,
  handleBulkUpdateStock,
  handleBulkUpdateSku,
  handleBulkUpdateThreshold,
  handleBulkUpdateActive,
}) => {
  if (selectedVariantIndices.length === 0) return null;

  return (
    <div className="bg-white dark:bg-[#16162a] p-4 pb-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3 animate-fade-in transition-all">
      <div className="flex items-center pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold bg-[#e94560]/10 text-[#e94560] px-3 py-1.5 rounded-full border border-[#e94560]/20">
            {selectedVariantIndices.length} Selected
          </span>
          <button
            type="button"
            onClick={() => setSelectedVariantIndices([])}
            className="text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white underline font-semibold cursor-pointer transition-colors"
          >
            Clear Selection
          </button>
        </div>

        <div className="ml-auto pl-3 border-l border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleBulkDelete}
            className="bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/45 text-red-600 dark:text-red-400 px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Selected</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-3">
        {/* Bulk Price */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
            Price
          </label>
          <div className="flex items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f1b] p-1 focus-within:border-[#e94560] focus-within:ring-2 focus-within:ring-[#e94560]/20 transition-all shadow-xs h-[38px]">
            <input
              id="bulk-price-input"
              type="number"
              placeholder="Set price"
              className="flex-1 min-w-0 bg-transparent text-xs text-gray-900 dark:text-white px-2 py-1 focus:outline-none placeholder:text-gray-400 font-medium"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const val = parseFloat((e.currentTarget as HTMLInputElement).value);
                  if (!isNaN(val)) {
                    handleBulkUpdatePrice(val);
                    (e.currentTarget as HTMLInputElement).value = '';
                  }
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById('bulk-price-input') as HTMLInputElement;
                const val = parseFloat(input?.value);
                if (!isNaN(val)) {
                  handleBulkUpdatePrice(val);
                  input.value = '';
                }
              }}
              className="shrink-0 px-2.5 py-1 h-full bg-[#e94560] hover:bg-[#d33a53] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center shadow-xs"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Bulk Compare Price */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
            Compare Price
          </label>
          <div className="flex items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f1b] p-1 focus-within:border-[#e94560] focus-within:ring-2 focus-within:ring-[#e94560]/20 transition-all shadow-xs h-[38px]">
            <input
              id="bulk-compare-price-input"
              type="number"
              placeholder="Compare"
              className="flex-1 min-w-0 bg-transparent text-xs text-gray-900 dark:text-white px-2 py-1 focus:outline-none placeholder:text-gray-400 font-medium"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const val = parseFloat((e.currentTarget as HTMLInputElement).value);
                  if (!isNaN(val)) {
                    handleBulkUpdateComparePrice(val);
                    (e.currentTarget as HTMLInputElement).value = '';
                  }
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById('bulk-compare-price-input') as HTMLInputElement;
                const val = parseFloat(input?.value);
                if (!isNaN(val)) {
                  handleBulkUpdateComparePrice(val);
                  input.value = '';
                }
              }}
              className="shrink-0 px-2.5 py-1 h-full bg-[#e94560] hover:bg-[#d33a53] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center shadow-xs"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Bulk Stock */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
            Stock
          </label>
          <div className="flex items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f1b] p-1 focus-within:border-[#e94560] focus-within:ring-2 focus-within:ring-[#e94560]/20 transition-all shadow-xs h-[38px]">
            <input
              id="bulk-stock-input"
              type="number"
              placeholder="Qty"
              className="flex-1 min-w-0 bg-transparent text-xs text-gray-900 dark:text-white px-2 py-1 focus:outline-none placeholder:text-gray-400 font-medium"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const val = parseInt((e.currentTarget as HTMLInputElement).value, 10);
                  if (!isNaN(val)) {
                    handleBulkUpdateStock(val);
                    (e.currentTarget as HTMLInputElement).value = '';
                  }
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById('bulk-stock-input') as HTMLInputElement;
                const val = parseInt(input?.value, 10);
                if (!isNaN(val)) {
                  handleBulkUpdateStock(val);
                  input.value = '';
                }
              }}
              className="shrink-0 px-2.5 py-1 h-full bg-[#e94560] hover:bg-[#d33a53] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center shadow-xs"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Bulk SKU Prefix */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
            SKU Prefix
          </label>
          <div className="flex items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f1b] p-1 focus-within:border-[#e94560] focus-within:ring-2 focus-within:ring-[#e94560]/20 transition-all shadow-xs h-[38px]">
            <input
              id="bulk-sku-input"
              type="text"
              placeholder="Prefix"
              className="flex-1 min-w-0 bg-transparent text-xs text-gray-900 dark:text-white px-2 py-1 focus:outline-none placeholder:text-gray-400 font-medium"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const val = (e.currentTarget as HTMLInputElement).value.trim();
                  handleBulkUpdateSku(val);
                  (e.currentTarget as HTMLInputElement).value = '';
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById('bulk-sku-input') as HTMLInputElement;
                const val = input?.value.trim();
                handleBulkUpdateSku(val);
                input.value = '';
              }}
              className="shrink-0 px-2.5 py-1 h-full bg-[#e94560] hover:bg-[#d33a53] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center shadow-xs"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Bulk Threshold */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
            Threshold
          </label>
          <div className="flex items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f1b] p-1 focus-within:border-[#e94560] focus-within:ring-2 focus-within:ring-[#e94560]/20 transition-all shadow-xs h-[38px]">
            <input
              id="bulk-threshold-input"
              type="number"
              placeholder="Min"
              className="flex-1 min-w-0 bg-transparent text-xs text-gray-900 dark:text-white px-2 py-1 focus:outline-none placeholder:text-gray-400 font-medium"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const val = parseInt((e.currentTarget as HTMLInputElement).value, 10);
                  if (!isNaN(val)) {
                    handleBulkUpdateThreshold(val);
                    (e.currentTarget as HTMLInputElement).value = '';
                  }
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById('bulk-threshold-input') as HTMLInputElement;
                const val = parseInt(input?.value, 10);
                if (!isNaN(val)) {
                  handleBulkUpdateThreshold(val);
                  input.value = '';
                }
              }}
              className="shrink-0 px-2.5 py-1 h-full bg-[#e94560] hover:bg-[#d33a53] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center shadow-xs"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Bulk Status */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
            Status
          </label>
          <div className="flex items-center gap-1.5 h-[38px]">
            <button
              type="button"
              onClick={() => handleBulkUpdateActive(true)}
              className="flex-1 h-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors active:scale-95 flex items-center justify-center shadow-xs"
              title="Activate selected variants"
            >
              Activate
            </button>
            <button
              type="button"
              onClick={() => handleBulkUpdateActive(false)}
              className="flex-1 h-full bg-slate-600 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors active:scale-95 flex items-center justify-center shadow-xs"
              title="Deactivate selected variants"
            >
              Deactivate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
