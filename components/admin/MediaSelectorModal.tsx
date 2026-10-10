'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { X } from '@/components/common/Icons';
import MediaManager from './MediaManager';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';

interface MediaSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (urls: string[]) => void;
  multiple?: boolean;
}

export default function MediaSelectorModal({ isOpen, onClose, onSelect, multiple = false }: MediaSelectorModalProps) {
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 bg-black/60 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-white dark:bg-[#16162a] rounded-2xl max-w-4xl w-full max-h-[90dvh] flex flex-col border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        
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

      </div>
    </div>,
    document.body
  );
}
