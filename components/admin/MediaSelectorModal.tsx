'use client';

import React from 'react';
import { X } from '@/components/common/Icons';
import { Modal } from '@/components/common/Modal';
import MediaManager from './MediaManager';

interface MediaSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (urls: string[]) => void;
  multiple?: boolean;
}

export default function MediaSelectorModal({ isOpen, onClose, onSelect, multiple = false }: MediaSelectorModalProps) {
  return (
    <Modal open={isOpen} onClose={onClose} showClose={false} size="lg" zIndexClassName="z-[110]">
      {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white">Media Library</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {multiple ? 'Select images or videos to add' : 'Select an image or video'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-white transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Unified Media Manager in selector mode */}
        <MediaManager
          mode="selector"
          onSelect={onSelect}
          multiple={multiple}
          onClose={onClose}
        />
    </Modal>
  );
}
