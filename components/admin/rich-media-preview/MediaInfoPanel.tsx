'use client';

import React from 'react';
import { Copy, Download, Edit } from '@/components/common/Icons';
import { MediaItem } from './types';

interface MediaInfoPanelProps {
  previewItem: MediaItem;
  mode: 'library' | 'selector' | 'preview';
  isMediaUsed: (item: MediaItem) => boolean;
  formatBytes: (bytes?: number) => string;
  handleCopyUrl: (url: string) => void;
  handleDownloadMedia: (url: string, filename: string) => void;
  onClose: () => void;
  onUpdateTags?: (item: MediaItem) => void;
}

export default function MediaInfoPanel({
  previewItem,
  mode,
  isMediaUsed,
  formatBytes,
  handleCopyUrl,
  handleDownloadMedia,
  onClose,
  onUpdateTags,
}: MediaInfoPanelProps) {
  return (
    <div className="space-y-4">
      <div className="p-3 bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">Filename:</span>
          <span className="font-mono text-gray-900 dark:text-white truncate max-w-[150px]" title={previewItem.original_filename}>
            {previewItem.original_filename}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">SEO Name:</span>
          <span className="font-mono text-gray-900 dark:text-white truncate max-w-[150px]" title={previewItem.seo_filename}>
            {previewItem.seo_filename}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">Uploaded:</span>
          <span className="text-gray-900 dark:text-white">{new Date(previewItem.created_at).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">Size:</span>
          <span className="text-gray-900 dark:text-white font-mono">{formatBytes(previewItem.file_size)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">Mime Type:</span>
          <span className="text-gray-900 dark:text-white">{previewItem.mime_type || 'image/webp'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">Usage:</span>
          {isMediaUsed(previewItem) ? (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">In Use</span>
          ) : (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400">Unused</span>
          )}
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={() => handleCopyUrl(previewItem.file_url)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer min-h-[44px]"
        >
          <Copy className="w-4 h-4" />
          Copy Image URL
        </button>
        
        {mode === 'library' && onUpdateTags && !previewItem.id.startsWith('virtual-') && (
          <button
            type="button"
            onClick={() => { onClose(); onUpdateTags(previewItem); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer min-h-[44px]"
          >
            <Edit className="w-4 h-4" />
            Edit ALT & Description Tags
          </button>
        )}

        <button
          type="button"
          onClick={() => handleDownloadMedia(previewItem.file_url, previewItem.original_filename)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer min-h-[44px]"
        >
          <Download className="w-4 h-4" />
          Download Media
        </button>
      </div>
    </div>
  );
}
