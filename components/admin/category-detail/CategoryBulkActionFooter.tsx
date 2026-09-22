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
  return (
    <div
      className={`sticky bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#16162a] border-t border-gray-200 dark:border-gray-800 px-6 py-4 shadow-lg rounded-t-2xl transition-all duration-300 ${
        !hasUnsavedChanges && selectedProductIds.length === 0
          ? 'opacity-0 pointer-events-none translate-y-4'
          : 'opacity-100 translate-y-0 pointer-events-auto'
      }`}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {selectedProductIds.length > 0 ? (
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg text-sm text-gray-800 dark:text-gray-200 pointer-events-auto">
            <span className="font-semibold whitespace-nowrap inline-flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-500" /> {selectedProductIds.length} Selected
            </span>
            <button
              type="button"
              onClick={() => handleBulkMoveToPosition(1)}
              className="hover:text-[#e94560] font-medium cursor-pointer inline-flex items-center gap-1"
            >
              <ChevronUp className="h-3.5 w-3.5" /> Top
            </button>
            <button
              type="button"
              onClick={() => handleBulkMoveToPosition(totalProductsCount)}
              className="hover:text-[#e94560] font-medium cursor-pointer inline-flex items-center gap-1"
            >
              <ChevronDown className="h-3.5 w-3.5" /> Bottom
            </button>
            <div className="flex items-center gap-1 border-l border-gray-200 dark:border-gray-700 pl-3 ml-1">
              <span className="text-xs text-gray-500">Rank:</span>
              <input
                type="number"
                min={1}
                max={totalProductsCount}
                value={targetPosition}
                onChange={(e) => setTargetPosition(e.target.value)}
                placeholder="#"
                className="w-12 px-1.5 py-1 border border-gray-300 dark:border-gray-600 rounded text-center text-xs bg-white dark:bg-[#0f0f1b] text-gray-900 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                className="bg-[#e94560] text-white text-xs px-2 py-1 rounded font-bold disabled:opacity-40 cursor-pointer"
              >
                Go
              </button>
            </div>
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-700" />
            <button
              type="button"
              onClick={handleBulkRemoveProducts}
              className="text-xs text-red-500 hover:text-red-700 font-bold cursor-pointer"
            >
              Remove
            </button>
            <button
              type="button"
              onClick={() => setSelectedProductIds([])}
              className="text-xs text-gray-500 hover:text-gray-700 font-bold cursor-pointer"
            >
              Clear
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 pointer-events-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-semibold">Changes apply to: Category sorting settings</span>
          </div>
        )}
        <button
          type="button"
          onClick={handleSaveSortOrder}
          disabled={savingSortOrder || !hasUnsavedChanges}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#e94560] text-white hover:bg-[#e94560]/90 transition-all active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto"
        >
          {savingSortOrder ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save Settings
        </button>
      </div>
    </div>
  );
}
