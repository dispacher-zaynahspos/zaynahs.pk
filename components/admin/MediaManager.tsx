'use client';

import React, { useRef, useCallback } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Archive,
} from '@/components/common/Icons';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { logDbError } from '@/lib/utils/dbErrorHandler';
import { useAdminTab } from '@/lib/hooks/useAdminTab';
import AdminSearchInput from '@/components/admin/shared/AdminSearchInput';
import RichMediaPreviewModal from '@/components/admin/RichMediaPreviewModal';
import {
  useMediaManagerData,
  MediaCard,
  MediaCleanerTab,
  EditMetadataModal,
  MediaLibraryHeader,
  type MediaItem,
} from './media-manager';
import { useMediaDragAndDropUpload } from './media-manager/hooks/useMediaDragAndDropUpload';
import { MediaLibraryFilters } from './media-manager/MediaLibraryFilters';

interface MediaManagerProps {
  mode: 'library' | 'selector';
  onSelect?: (urls: string[]) => void;
  multiple?: boolean;
  onClose?: () => void;
}

type MainTab = 'library' | 'cleaner';

const formatBytes = (bytes?: number) => {
  if (!bytes) return '0 B';
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default function MediaManager({ mode, onSelect, multiple = false, onClose }: MediaManagerProps) {
  const [mainTab, setMainTab] = useAdminTab<MainTab>('library');
  const data = useMediaManagerData({ mode, multiple, onSelect, onClose });

  const {
    media,
    loading,
    usageLoading,
    search, setSearch,
    aiFilter, setAiFilter,
    sortBy, setSortBy,
    typeFilter, setTypeFilter,
    selectedIds, setSelectedIds,
    selectedLibraryUrls,
    currentPage, setCurrentPage,
    pageSize, setPageSize,
    handleConfirmSelection,
    cleanerUsedSelected,
    cleanerUnusedSelected,
    cleanerSearch, setCleanerSearch,
    cleanerTypeFilter, setCleanerTypeFilter,
    isDownloadingZip,
    isBulkDeleting,
    uploadTasks, setUploadTasks,
    uploading,
    fileInputRef,
    globalAi,
    generatingId,
    bulkGenerating,
    bulkCompletedIds,
    bulkFailedIds,
    bulkTotal,
    editingItem, setEditingItem,
    previewItem, setPreviewItem,
    isDragging, setIsDragging,
    filteredMedia,
    paginatedMedia,
    cleanerUsed,
    cleanerUnused,
    usedBytes,
    unusedBytes,
    usedPercentage,
    fetchMedia,
    loadUsageCrossReferences,
    handleDelete,
    handleBulkDeleteUnused,
    handleBulkDelete,
    handleCopyUrl,
    downloadAsZip,
    handleSingleGenerate,
    handleBulkGenerate,
    toggleSelect,
    toggleSelectAll,
    toggleCleanerUsed,
    toggleSelectAllUsed,
    toggleCleanerUnused,
    toggleSelectAllUnused,
    handleGlobalAiToggle = async () => {
      try {
        const supabase = createClient();
        await supabase.from('ai_settings').update({ auto_media_ai: !globalAi }).eq('id', '00000000-0000-4000-8000-000000000002');
        toast.success(`Auto vision tags ${!globalAi ? 'enabled' : 'disabled'}`);
        fetchMedia();
      } catch { toast.error('Failed to save settings'); }
    }
  } = data as any;

  const {
    handleFileUpload,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
  } = useMediaDragAndDropUpload({
    mode,
    multiple,
    setUploadTasks,
    setIsDragging,
    fetchMedia,
    fileInputRef,
  });

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from('media_library').update({
        alt_text: editingItem.alt_text,
        title: editingItem.title,
        description: editingItem.description,
        caption: editingItem.caption,
        ai_enabled: editingItem.ai_enabled
      }).eq('id', editingItem.id);

      if (error) throw error;
      toast.success('Image details updated successfully');
      setEditingItem(null);
      fetchMedia();
    } catch (err: any) {
      logDbError({
        file: 'components/admin/MediaManager.tsx',
        functionName: 'handleUpdateItem',
        table: 'media_library',
        action: 'UPDATE'
      }, err);
      toast.error(`Failed to update image details: ${err?.message || 'Unknown error'}`);
    }
  };

  return (
    <div
      className={`w-full relative ${mode === 'library' ? 'space-y-6 p-4 md:p-6 max-w-7xl mx-auto' : 'flex flex-col flex-1 overflow-hidden'}`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drop Zone Overlay */}
      {isDragging && mode === 'library' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-blue-600/10" />
          <div className="relative bg-white dark:bg-[#16162a] border-4 border-dashed border-blue-500 rounded-3xl p-12 shadow-2xl text-center max-w-md">
            <Upload className="w-12 h-12 mx-auto mb-4 text-blue-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Drop files here</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Release to upload to your media library</p>
          </div>
        </div>
      )}

      {/* HEADER */}
      {mode === 'library' && (
        <MediaLibraryHeader
          selectedIdsLength={selectedIds.length}
          mainTab={mainTab}
          isBulkDeleting={isBulkDeleting}
          handleBulkDelete={handleBulkDelete}
          bulkGenerating={bulkGenerating}
          handleBulkGenerate={handleBulkGenerate}
          fileInputRef={fileInputRef}
          uploading={uploading}
          handleFileUpload={handleFileUpload}
          bulkTotal={bulkTotal}
          bulkCompletedIdsLength={bulkCompletedIds.length}
          bulkFailedIdsLength={bulkFailedIds.length}
        />
      )}

      {/* MAIN TABS */}
      {mode === 'library' && (
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800/60 p-1 rounded-2xl w-full sm:w-auto sm:inline-flex">
          <button type="button" onClick={() => setMainTab('library')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer min-h-[42px] ${mainTab === 'library' ? 'bg-white dark:bg-[#16162a] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
            <ImageIcon className="w-4 h-4" />
            Library
          </button>
          <button type="button" onClick={() => setMainTab('cleaner')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer min-h-[42px] ${mainTab === 'cleaner' ? 'bg-white dark:bg-[#16162a] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
            <Archive className="w-4 h-4" />
            Cleaner Pro
            {cleanerUnused.length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">
                {cleanerUnused.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* STORAGE BAR */}
      <div className="bg-white dark:bg-[#16162a] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <span className="font-bold text-gray-700 dark:text-gray-300">Storage:</span>
          <span>{formatBytes(usedBytes)} used of 1 GB ({usedPercentage.toFixed(2)}%)</span>
        </div>
        <div className="w-full sm:max-w-xs bg-gray-200 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
          <div className="bg-[#e94560] h-full rounded-full transition-all duration-500" style={{ width: `${usedPercentage}%` }} />
        </div>
      </div>

      {/* LIBRARY TAB */}
      {(mode === 'library' && mainTab === 'library') || mode === 'selector' ? (
        <div className={mode === 'selector' ? 'flex-1 overflow-y-auto px-6 pt-6 space-y-6' : 'space-y-6'}>
          {/* Search, Sort and Filters */}
          <MediaLibraryFilters
            mode={mode}
            multiple={multiple}
            globalAi={globalAi}
            handleGlobalAiToggle={handleGlobalAiToggle}
            aiFilter={aiFilter}
            setAiFilter={setAiFilter}
            media={media}
            setSelectedIds={setSelectedIds}
            selectedIds={selectedIds}
            filteredMedia={filteredMedia}
            toggleSelectAll={toggleSelectAll}
            search={search}
            setSearch={setSearch}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            uploading={uploading}
            handleFileUpload={handleFileUpload}
          />

          {/* Media Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => <div key={i} className="aspect-square bg-gray-100 dark:bg-gray-800/80 rounded-2xl animate-pulse" />)}
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="text-center py-16 text-gray-400 bg-white dark:bg-[#16162a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm">
              No media files found matching the search criteria.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {paginatedMedia.map((item: MediaItem) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  isSelected={mode === 'selector' ? selectedLibraryUrls.has(item.file_url) : selectedIds.includes(item.id)}
                  onToggle={() => toggleSelect(item)}
                  mode={mode}
                  generatingId={generatingId}
                  bulkGenerating={bulkGenerating}
                  bulkCompletedIds={bulkCompletedIds}
                  bulkFailedIds={bulkFailedIds}
                  setPreviewItem={setPreviewItem}
                  handleCopyUrl={handleCopyUrl}
                  setEditingItem={setEditingItem}
                  handleDelete={handleDelete}
                  handleSingleGenerate={handleSingleGenerate}
                  formatBytes={formatBytes}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {filteredMedia.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#16162a] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs mt-4 text-xs font-bold text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <span>Show per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] px-2.5 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value={15}>15</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                </select>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev: number) => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  Previous
                </button>
                <span className="px-2">
                  Page {currentPage} of {Math.max(1, Math.ceil(filteredMedia.length / pageSize))}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= Math.ceil(filteredMedia.length / pageSize)}
                  onClick={() => setCurrentPage((prev: number) => Math.min(Math.ceil(filteredMedia.length / pageSize), prev + 1))}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  Next
                </button>
              </div>
              <div className="text-gray-500 dark:text-gray-400 font-medium">
                Showing {Math.min(filteredMedia.length, (currentPage - 1) * pageSize + 1)}-{Math.min(filteredMedia.length, currentPage * pageSize)} of {filteredMedia.length} files
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Selector Mode Footer */}
      {mode === 'selector' && (
        <div className="flex-none px-6 py-4 border-t border-gray-150 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-[#121222] z-10 shadow-xs">
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {selectedLibraryUrls?.size > 0 ? (
              <span className="text-[#e94560] font-bold">{selectedLibraryUrls.size} item(s) selected</span>
            ) : (
              'Click an image to select'
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmSelection}
              disabled={!selectedLibraryUrls || selectedLibraryUrls.size === 0}
              className="px-5 py-2 rounded-xl text-xs font-bold min-w-[130px] bg-[#1a1a2e] dark:bg-[#e94560] hover:bg-[#2e2e4e] dark:hover:bg-[#d8344e] text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
            >
              Add Selected ({selectedLibraryUrls?.size || 0})
            </button>
          </div>
        </div>
      )}

      {/* CLEANER TAB */}
      {mode === 'library' && mainTab === 'cleaner' && (
        <MediaCleanerTab
          media={media}
          cleanerUsed={cleanerUsed}
          cleanerUnused={cleanerUnused}
          unusedBytes={unusedBytes}
          cleanerSearch={cleanerSearch}
          setCleanerSearch={setCleanerSearch}
          cleanerTypeFilter={cleanerTypeFilter}
          setCleanerTypeFilter={setCleanerTypeFilter}
          usageLoading={usageLoading}
          loadUsageCrossReferences={loadUsageCrossReferences}
          cleanerUsedSelected={cleanerUsedSelected}
          cleanerUnusedSelected={cleanerUnusedSelected}
          toggleCleanerUsed={toggleCleanerUsed}
          toggleSelectAllUsed={toggleSelectAllUsed}
          toggleCleanerUnused={toggleCleanerUnused}
          toggleSelectAllUnused={toggleSelectAllUnused}
          downloadAsZip={downloadAsZip}
          handleBulkDeleteUnused={handleBulkDeleteUnused}
          isDownloadingZip={isDownloadingZip}
          isBulkDeleting={isBulkDeleting}
          setPreviewItem={setPreviewItem}
          handleCopyUrl={handleCopyUrl}
          formatBytes={formatBytes}
        />
      )}

      {/* RICH MEDIA PREVIEW MODAL */}
      {previewItem && (
        <RichMediaPreviewModal
          item={previewItem}
          onClose={() => setPreviewItem(null)}
          mode={mode}
        />
      )}

      {/* EDIT METADATA MODAL */}
      {mode === 'library' && editingItem && (
        <EditMetadataModal
          editingItem={editingItem}
          setEditingItem={setEditingItem}
          onSave={handleUpdateItem}
        />
      )}
    </div>
  );
}
