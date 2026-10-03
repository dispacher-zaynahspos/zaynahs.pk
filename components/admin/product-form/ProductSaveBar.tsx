'use client';

import React from 'react';
import { Save, Loader2 } from '@/components/common/Icons';

interface ProductSaveBarProps {
  isEdit: boolean;
  isSubmitting: boolean;
  name: string;
  isActive: boolean;
  onCancel: () => void;
}

export function ProductSaveBar({
  isEdit,
  isSubmitting,
  name,
  isActive,
  onCancel,
}: ProductSaveBarProps) {
  const cleanName = (name || (isEdit ? 'Editing Product' : 'New Product'))
    .replace(/^[\s*#-]+/, '')
    .replace(/[*_~`]/g, '')
    .trim();

  return (
    <div className="sticky bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] md:bottom-0 left-0 right-0 z-30 bg-white/98 dark:bg-[#16162a]/98 border-t border-gray-200/90 dark:border-gray-800 px-3 sm:px-6 py-2 sm:py-2.5 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] rounded-t-xl transition-all">
      <div className="flex items-center justify-between gap-2.5 max-w-full">
        {/* Left: Product context / title / status */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              isActive ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
          <span className="text-[11px] sm:text-xs font-bold text-gray-800 dark:text-gray-200 truncate leading-tight" title={cleanName}>
            {cleanName}
          </span>
          <span
            className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex-shrink-0 ${
              isActive
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
            }`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Right: Cancel & Submit Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-center border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-[#16162a] hover:bg-gray-50 dark:hover:bg-white/5 active:scale-95 rounded-xl py-1.5 px-3 sm:px-4 text-xs font-bold cursor-pointer shadow-2xs disabled:opacity-50 min-h-[36px] sm:min-h-[38px] flex items-center justify-center"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="relative overflow-hidden flex items-center justify-center gap-1.5 sm:gap-2 bg-[#e94560] hover:bg-[#d8344e] text-white rounded-xl py-1.5 px-3.5 sm:px-5 text-xs sm:text-sm font-bold active:scale-95 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed min-h-[36px] sm:min-h-[38px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-white flex-shrink-0" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 text-white flex-shrink-0" />
                <span>{isEdit ? 'Update Product' : 'Create Product'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
