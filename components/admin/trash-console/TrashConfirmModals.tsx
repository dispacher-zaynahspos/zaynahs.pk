'use client';

import React from 'react';
import { TabType } from './TrashConsoleNavigation';

interface ConfirmDeleteState {
  id: string;
  type: TabType;
  name: string;
  extraInfo?: any;
}

interface TrashConfirmModalsProps {
  confirmDelete: ConfirmDeleteState | null;
  setConfirmDelete: (val: ConfirmDeleteState | null) => void;
  handleHardDelete: () => void;
  confirmBulkDelete: boolean;
  setConfirmBulkDelete: (val: boolean) => void;
  handleBulkHardDelete: () => void;
  confirmEmptyTab: boolean;
  setConfirmEmptyTab: (val: boolean) => void;
  handleEmptyTab: () => void;
  confirmEmptyCompleteTrash: boolean;
  setConfirmEmptyCompleteTrash: (val: boolean) => void;
  handleEmptyCompleteTrash: () => void;
  activeTab: TabType;
  selectedCount: number;
  totalTrashCount: number;
  isPending: boolean;
}

export const TrashConfirmModals: React.FC<TrashConfirmModalsProps> = ({
  confirmDelete,
  setConfirmDelete,
  handleHardDelete,
  confirmBulkDelete,
  setConfirmBulkDelete,
  handleBulkHardDelete,
  confirmEmptyTab,
  setConfirmEmptyTab,
  handleEmptyTab,
  confirmEmptyCompleteTrash,
  setConfirmEmptyCompleteTrash,
  handleEmptyCompleteTrash,
  activeTab,
  selectedCount,
  totalTrashCount,
  isPending,
}) => {
  return (
    <>
      {/* 1. Single Item Hard Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#16162a] rounded-2xl p-6 max-w-sm w-full border border-gray-100 dark:border-gray-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Delete Permanently?</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Are you sure you want to permanently delete <strong className="text-gray-800 dark:text-gray-200">"{confirmDelete.name}"</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleHardDelete}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Bulk Delete Confirmation */}
      {confirmBulkDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#16162a] rounded-2xl p-6 max-w-sm w-full border border-gray-100 dark:border-gray-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Delete Selected Items?</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Permanently delete <strong className="text-gray-800 dark:text-gray-200">{selectedCount} item(s)</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setConfirmBulkDelete(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkHardDelete}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Empty Current Tab Trash Confirmation */}
      {confirmEmptyTab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#16162a] rounded-2xl p-6 max-w-sm w-full border border-gray-100 dark:border-gray-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Empty {activeTab.replace('_', ' ')} Trash?</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Permanently delete all items currently in <strong className="text-gray-800 dark:text-gray-200">{activeTab.replace('_', ' ')}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setConfirmEmptyTab(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEmptyTab}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
              >
                Empty Tab
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Empty Complete Trash Confirmation */}
      {confirmEmptyCompleteTrash && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#16162a] rounded-2xl p-6 max-w-sm w-full border border-gray-100 dark:border-gray-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-red-600 dark:text-red-400">Empty Entire Trash Bin?</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Permanently delete all <strong className="text-gray-800 dark:text-gray-200">{totalTrashCount} item(s)</strong> across ALL trash categories? THIS CANNOT BE UNDONE.
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setConfirmEmptyCompleteTrash(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEmptyCompleteTrash}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
              >
                Empty Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
