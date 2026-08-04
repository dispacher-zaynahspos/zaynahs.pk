import React from 'react';

interface AdminBulkActionBarProps {
  selectedCount: number;
  actions: React.ReactNode;
  onClearSelection?: () => void;
}

export default function AdminBulkActionBar({ selectedCount, actions, onClearSelection }: AdminBulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 w-[90%] max-w-md">
      <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl shadow-2xl p-3 flex items-center justify-between border border-gray-800 dark:border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-gray-800 dark:bg-gray-100 rounded-full h-8 w-8 flex items-center justify-center text-xs font-bold">
            {selectedCount}
          </div>
          <span className="text-sm font-medium">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {onClearSelection && (
            <button
              onClick={onClearSelection}
              className="px-3 py-1.5 text-xs font-medium bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
