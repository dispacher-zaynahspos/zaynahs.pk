'use client';

import React from 'react';
import { ChevronDown, ChevronUp, Loader2, Zap } from '@/components/common/Icons';

interface CategoryBulkActionFooterProps {
  hasUnsavedChanges: boolean;
  selectedProductIds: string[];
  totalProductsCount: number;
  targetPosition: string;
  setTargetPosition: (val: string) => void;
  savingSortOrder: boolean;
  handleBulkMoveToPosition: (pos: number) => void;
  handleBulkRemoveProducts: () => void;
  setSelectedProductIds: (ids: string[]) => void;
  handleSaveSortOrder: () => void;
}

export function CategoryBulkActionFooter({
  hasUnsavedChanges,
  selectedProductIds,
  totalProductsCount,
  targetPosition,
  setTargetPosition,
  savingSortOrder,
  handleBulkMoveToPosition,
  handleBulkRemoveProducts,
  setSelectedProductIds,
  handleSaveSortOrder,
}: CategoryBulkActionFooterProps) {
  const isVisible = hasUnsavedChanges || selectedProductIds.length > 0;

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-[#16162a] border-t border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-2.5 sm:py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.12)] transition-all duration-200"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4">
        {selectedProductIds.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm text-gray-800 dark:text-gray-200">
            <span className="font-bold whitespace-nowrap inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Zap className="h-4 w-4 shrink-0" /> {selectedProductIds.length} Selected
            </span>
            <button
              type="button"
              onClick={() => handleBulkMoveToPosition(1)}
              className="hover:text-[var(--color-primary,#e94560)] font-semibold cursor-pointer inline-flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded"
            >
              <ChevronUp className="h-3.5 w-3.5" /> Top
            </button>
            <button
              type="button"
              onClick={() => handleBulkMoveToPosition(totalProductsCount)}
              className="hover:text-[var(--color-primary,#e94560)] font-semibold cursor-pointer inline-flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded"
            >
              <ChevronDown className="h-3.5 w-3.5" /> Bottom
            </button>
            <div className="flex items-center gap-1 border-l border-gray-200 dark:border-gray-700 pl-2 sm:pl-3 ml-0.5">
              <span className="text-[11px] text-gray-500 font-semibold">Rank:</span>
              <input
                type="number"
                min={1}
                max={totalProductsCount}
                value={targetPosition}
                onChange={(e) => setTargetPosition(e.target.value)}
                placeholder="#"
                className="w-12 px-1.5 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-center text-xs bg-white dark:bg-[#0f0f1b] text-gray-900 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => {
                  const pos = parseInt(targetPosition, 10);
                  if (!isNaN(pos) && pos >= 1 && pos <= totalProductsCount) {
                    handleBulkMoveToPosition(pos);
                  }
                }}
                disabled={!targetPosition}
                className="bg-[var(--color-primary,#e94560)] text-white text-xs px-2.5 py-1 rounded-lg font-bold disabled:opacity-40 cursor-pointer active:scale-95"
              >
                Go
              </button>
            </div>
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 hidden sm:block" />
            <button
              type="button"
              onClick={handleBulkRemoveProducts}
              className="text-xs text-red-500 hover:text-red-700 font-bold cursor-pointer transition-colors px-1"
            >
              Remove
            </button>
            <button
              type="button"
              onClick={() => setSelectedProductIds([])}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-bold cursor-pointer transition-colors px-1"
            >
              Clear
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span className="font-semibold">Changes apply to: Category sorting settings</span>
          </div>
        )}
        <button
          type="button"
          onClick={handleSaveSortOrder}
          disabled={savingSortOrder || !hasUnsavedChanges}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[var(--color-primary,#e94560)] text-white hover:opacity-95 transition-all active:scale-98 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0 whitespace-nowrap"
        >
          {savingSortOrder ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : null}
          <span>Save Settings</span>
        </button>
      </div>
    </div>
  );
}
