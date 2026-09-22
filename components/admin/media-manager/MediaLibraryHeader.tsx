'use client';

import React from 'react';
import { Upload, Trash2, Zap, Loader2 } from '@/components/common/Icons';

interface MediaLibraryHeaderProps {
  selectedIdsLength: number;
  mainTab: string;
  isBulkDeleting: boolean;
  handleBulkDelete: () => void;
  bulkGenerating: boolean;
  handleBulkGenerate: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  uploading: boolean;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  bulkTotal: number;
  bulkCompletedIdsLength: number;
  bulkFailedIdsLength: number;
}

export default function MediaLibraryHeader({
  selectedIdsLength,
  mainTab,
  isBulkDeleting,
  handleBulkDelete,
  bulkGenerating,
  handleBulkGenerate,
  fileInputRef,
  uploading,
  handleFileUpload,
  bulkTotal,
  bulkCompletedIdsLength,
  bulkFailedIdsLength,
}: MediaLibraryHeaderProps) {
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Media Library</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Upload files, manage metadata, and clean up unused media.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {selectedIdsLength > 0 && mainTab === 'library' && (
            <>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 active:scale-95 disabled:bg-gray-100 dark:disabled:bg-gray-800 text-xs transition-all cursor-pointer min-h-[44px] flex-1 sm:flex-none"
              >
                {isBulkDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Delete ({selectedIdsLength})</span>
              </button>
              <button
                type="button"
                onClick={handleBulkGenerate}
                disabled={bulkGenerating}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 active:scale-95 disabled:bg-gray-100 dark:disabled:bg-gray-800 text-xs transition-all cursor-pointer min-h-[44px] flex-1 sm:flex-none"
              >
                {bulkGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                <span>Bulk Vision AI ({selectedIdsLength})</span>
              </button>
            </>
          )}
          {mainTab === 'library' && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold active:scale-95 disabled:bg-gray-100 text-xs transition-all cursor-pointer min-h-[44px] flex-1 sm:flex-none"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span>Upload Media</span>
            </button>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="image/*,video/*"
            className="hidden"
          />
        </div>
      </div>

      {/* BULK VISION AI PROGRESS */}
      {bulkGenerating && bulkTotal > 0 && (
        <div className="bg-white dark:bg-[#16162a] p-4 rounded-2xl border border-amber-200 dark:border-amber-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-gray-900 dark:text-white">Processing Vision AI Metadata</span>
            </div>
            <span className="text-gray-500 dark:text-gray-400 font-medium">
              {bulkCompletedIdsLength + bulkFailedIdsLength} / {bulkTotal} done
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-300"
              style={{
                width: `${((bulkCompletedIdsLength + bulkFailedIdsLength) / bulkTotal) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
