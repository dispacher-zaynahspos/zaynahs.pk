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
  return (
    <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] md:bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#16162a]/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3.5 shadow-2xl rounded-t-2xl transition-all">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-full">
        {/* Left: Product context / title / status */}
        <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {name ? name : isEdit ? 'Editing Product' : 'New Product'}
            </span>
          </div>

          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex-shrink-0 ${
              isActive
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
            }`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Right: Cancel & Submit Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none text-center border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-[#16162a] hover:bg-gray-50 dark:hover:bg-white/5 active:scale-95 rounded-xl py-2 sm:py-2.5 px-4 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-2xs disabled:opacity-50 min-h-[40px] flex items-center justify-center"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 sm:flex-none relative overflow-hidden flex items-center justify-center gap-2 bg-[#e94560] hover:bg-[#d8344e] text-white rounded-xl py-2 sm:py-2.5 px-5 sm:px-6 text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed min-h-[40px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white flex-shrink-0" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 text-white flex-shrink-0" />
                <span>{isEdit ? 'Update Product' : 'Create Product'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
