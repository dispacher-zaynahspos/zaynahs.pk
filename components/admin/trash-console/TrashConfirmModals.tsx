'use client';

import React from 'react';
import { TabType } from './TrashConsoleNavigation';
import { Modal } from '@/components/common/Modal';

export interface ConfirmDeleteExtraInfo {
  leadType?: 'whatsapp' | 'email';
  fileUrl?: string;
  [key: string]: unknown;
}

export interface ConfirmDeleteState {
  id: string;
  type: TabType;
  name: string;
  extraInfo?: ConfirmDeleteExtraInfo;
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

const cancelBtn =
  'px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors';
const dangerBtn =
  'px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50';

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
  // All four confirmations render through the shared overlay system (RULE MODAL1)
  // for smooth open/close + scroll-lock + ESC — no hand-rolled fixed overlays.
  return (
    <>
      {/* 1. Single Item Hard Delete Confirmation */}
      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        variant="center"
        size="sm"
        title="Delete Permanently?"
      >
        <div className="p-5 space-y-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Are you sure you want to permanently delete <strong className="text-gray-800 dark:text-gray-200">"{confirmDelete?.name}"</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={() => setConfirmDelete(null)} className={cancelBtn}>
              Cancel
            </button>
            <button onClick={handleHardDelete} disabled={isPending} className={dangerBtn}>
              Delete Permanently
            </button>
          </div>
        </div>
      </Modal>

      {/* 2. Bulk Delete Confirmation */}
      <Modal
        open={confirmBulkDelete}
        onClose={() => setConfirmBulkDelete(false)}
        variant="center"
        size="sm"
        title="Delete Selected Items?"
      >
        <div className="p-5 space-y-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Permanently delete <strong className="text-gray-800 dark:text-gray-200">{selectedCount} item(s)</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={() => setConfirmBulkDelete(false)} className={cancelBtn}>
              Cancel
            </button>
            <button onClick={handleBulkHardDelete} disabled={isPending} className={dangerBtn}>
              Delete Selected
            </button>
          </div>
        </div>
      </Modal>

      {/* 3. Empty Current Tab Trash Confirmation */}
      <Modal
        open={confirmEmptyTab}
        onClose={() => setConfirmEmptyTab(false)}
        variant="center"
        size="sm"
        title={`Empty ${activeTab.replace('_', ' ')} Trash?`}
      >
        <div className="p-5 space-y-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Permanently delete all items currently in <strong className="text-gray-800 dark:text-gray-200">{activeTab.replace('_', ' ')}</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={() => setConfirmEmptyTab(false)} className={cancelBtn}>
              Cancel
            </button>
            <button onClick={handleEmptyTab} disabled={isPending} className={dangerBtn}>
              Empty Tab
            </button>
          </div>
        </div>
      </Modal>

      {/* 4. Empty Complete Trash Confirmation */}
      <Modal
        open={confirmEmptyCompleteTrash}
        onClose={() => setConfirmEmptyCompleteTrash(false)}
        variant="center"
        size="sm"
        title={<span className="text-red-600 dark:text-red-400">Empty Entire Trash Bin?</span>}
      >
        <div className="p-5 space-y-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Permanently delete all <strong className="text-gray-800 dark:text-gray-200">{totalTrashCount} item(s)</strong> across ALL trash categories? THIS CANNOT BE UNDONE.
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={() => setConfirmEmptyCompleteTrash(false)} className={cancelBtn}>
              Cancel
            </button>
            <button onClick={handleEmptyCompleteTrash} disabled={isPending} className={dangerBtn}>
              Empty Everything
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
