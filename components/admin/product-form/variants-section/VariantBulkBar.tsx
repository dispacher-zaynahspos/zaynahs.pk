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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
            Price
          </label>
          <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#0f0f1b] focus-within:border-primary focus-within:bg-white transition-all">
            <input
              id="bulk-price-input"
              type="number"
              placeholder="Enter price"
              style={{ borderWidth: 0 }}
              className="w-full min-w-[60px] bg-transparent text-xs text-gray-900 dark:text-white px-3 py-2 focus:outline-none"
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
              className="bg-primary hover:bg-primary-hover text-white px-2.5 py-2 text-[10px] font-bold cursor-pointer transition-colors whitespace-nowrap"
            >
              Apply
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
            Compare Price
          </label>
          <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#0f0f1b] focus-within:border-primary focus-within:bg-white transition-all">
            <input
              id="bulk-compare-price-input"
              type="number"
              placeholder="Enter compare price"
              style={{ borderWidth: 0 }}
              className="w-full min-w-[60px] bg-transparent text-xs text-gray-900 dark:text-white px-3 py-2 focus:outline-none"
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
              className="bg-primary hover:bg-primary-hover text-white px-2.5 py-2 text-[10px] font-bold cursor-pointer transition-colors whitespace-nowrap"
            >
              Apply
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
            Stock
          </label>
          <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#0f0f1b] focus-within:border-primary focus-within:bg-white transition-all">
            <input
              id="bulk-stock-input"
              type="number"
              placeholder="Enter stock"
              style={{ borderWidth: 0 }}
              className="w-full min-w-[60px] bg-transparent text-xs text-gray-900 dark:text-white px-3 py-2 focus:outline-none"
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
              className="bg-primary hover:bg-primary-hover text-white px-2.5 py-2 text-[10px] font-bold cursor-pointer transition-colors whitespace-nowrap"
            >
              Apply
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
            SKU
          </label>
          <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#0f0f1b] focus-within:border-primary focus-within:bg-white transition-all">
            <input
              id="bulk-sku-input"
              type="text"
              placeholder="SKU prefix"
              style={{ borderWidth: 0 }}
              className="w-full min-w-[60px] bg-transparent text-xs text-gray-900 dark:text-white px-3 py-2 focus:outline-none"
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
              className="bg-primary hover:bg-primary-hover text-white px-2.5 py-2 text-[10px] font-bold cursor-pointer transition-colors whitespace-nowrap"
            >
              Apply
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
            Threshold
          </label>
          <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#0f0f1b] focus-within:border-primary focus-within:bg-white transition-all">
            <input
              id="bulk-threshold-input"
              type="number"
              placeholder="Enter threshold"
              style={{ borderWidth: 0 }}
              className="w-full min-w-[60px] bg-transparent text-xs text-gray-900 dark:text-white px-3 py-2 focus:outline-none"
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
              className="bg-primary hover:bg-primary-hover text-white px-2.5 py-2 text-[10px] font-bold cursor-pointer transition-colors whitespace-nowrap"
            >
              Apply
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
            Status
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleBulkUpdateActive(true)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors active:scale-95 flex items-center justify-center py-2"
            >
              Activate
            </button>
            <button
              type="button"
              onClick={() => handleBulkUpdateActive(false)}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors active:scale-95 flex items-center justify-center py-2"
            >
              Deactivate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
