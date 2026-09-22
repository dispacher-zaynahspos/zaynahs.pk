'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { X } from '@/components/common/Icons';
import type { MediaItem } from './hooks/useMediaManagerData';

interface EditMetadataModalProps {
  editingItem: MediaItem;
  setEditingItem: React.Dispatch<React.SetStateAction<MediaItem | null>>;
  onSave: (e: React.FormEvent) => Promise<void>;
}

export default function EditMetadataModal({
  editingItem,
  setEditingItem,
  onSave,
}: EditMetadataModalProps) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white dark:bg-[#16162a] rounded-2xl max-w-md w-full border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-gray-900 dark:text-white">Edit Image Metadata</h3>
          <button
            type="button"
            onClick={() => setEditingItem(null)}
            className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer min-h-[36px]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSave} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Alt Text Tag</label>
            <input
              type="text"
              value={editingItem.alt_text || ''}
              onChange={(e) =>
                setEditingItem((prev: any) => (prev ? { ...prev, alt_text: e.target.value } : null))
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a30] text-gray-900 dark:text-white text-sm focus:border-blue-500 focus:outline-none min-h-[44px]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Title Tag</label>
            <input
              type="text"
              value={editingItem.title || ''}
              onChange={(e) =>
                setEditingItem((prev: any) => (prev ? { ...prev, title: e.target.value } : null))
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a30] text-gray-900 dark:text-white text-sm focus:border-blue-500 focus:outline-none min-h-[44px]"
            />
          </div>
          <div className="pt-4 flex justify-end gap-2 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setEditingItem(null)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold text-xs cursor-pointer min-h-[38px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-white rounded-xl font-semibold text-xs bg-blue-600 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[38px]"
            >
              Save Details
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
