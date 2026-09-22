'use client';

import React from 'react';
import { StoreSettings } from '@/lib/types';
import { Globe, Trash2 } from '@/components/common/Icons';

interface ProductListBulkActionsProps {
  selectedProductIds: string[];
  setSelectedProductIds: (ids: string[]) => void;
  settings: StoreSettings;
  onBulkFeatured: (featured: boolean) => void;
  onBulkMetaSync: () => void;
  onBulkDelete: () => void;
}

export default function ProductListBulkActions({
  selectedProductIds,
  setSelectedProductIds,
  settings,
  onBulkFeatured,
  onBulkMetaSync,
  onBulkDelete,
}: ProductListBulkActionsProps) {
  if (selectedProductIds.length === 0) return null;

  return (
    <div className="bg-[#1a1a2e]/5 dark:bg-[#1c1c36] p-3.5 rounded-2xl border border-gray-250 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 animate-fade-in transition-all">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold bg-[#e94560]/10 text-[#e94560] px-3 py-1.5 rounded-full border border-[#e94560]/20">
          {selectedProductIds.length} Selected
        </span>
        <button
          type="button"
          onClick={() => setSelectedProductIds([])}
          className="text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white underline font-semibold cursor-pointer"
        >
          Clear
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onBulkFeatured(true)}
          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm active:scale-95"
        >
          Set Featured
        </button>
        <button
          type="button"
          onClick={() => onBulkFeatured(false)}
          className="px-3.5 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm active:scale-95"
        >
          Unfeature
        </button>
        {settings.meta_sync_enabled && (
          <button
            type="button"
            onClick={onBulkMetaSync}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 shadow-sm active:scale-95"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Sync Meta</span>
          </button>
        )}
        <button
          type="button"
          onClick={onBulkDelete}
          className="px-3.5 py-2 bg-[#e94560] hover:bg-[#e94560]/95 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Move to Trash</span>
        </button>
      </div>
    </div>
  );
}
