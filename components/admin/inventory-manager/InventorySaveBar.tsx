'use client';

import React from 'react';
import { Save, Loader2 } from '@/components/common/Icons';

interface InventorySaveBarProps {
  hasUnsavedChanges: boolean;
  pendingChangesCount: number;
  isSaving: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

export function InventorySaveBar({
  hasUnsavedChanges,
  pendingChangesCount,
  isSaving,
  onSave,
  onDiscard,
}: InventorySaveBarProps) {
  return (
    <div
      className={`sticky bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#16162a]/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3.5 shadow-2xl rounded-t-2xl transition-all duration-300 ${
        !hasUnsavedChanges
          ? 'opacity-0 pointer-events-none translate-y-6'
          : 'opacity-100 translate-y-0 pointer-events-auto'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
          <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200">
            Unsaved Changes: <span className="text-[#e94560] font-black">{pendingChangesCount}</span> item{pendingChangesCount > 1 ? 's' : ''} edited
          </span>
          <button
            type="button"
            onClick={onDiscard}
            disabled={isSaving}
            className="text-xs font-bold text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ml-2 cursor-pointer transition-colors disabled:opacity-50"
          >
            Discard
          </button>
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#e94560] hover:bg-[#d03b54] text-white shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Saving All...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4 text-white" />
              <span>Save All Changes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
