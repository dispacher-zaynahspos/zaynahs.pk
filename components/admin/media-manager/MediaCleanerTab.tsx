'use client';

import React from 'react';
import { MediaItem } from './hooks/useMediaManagerData';
import { MediaCard } from './MediaCard';
import AdminSearchInput from '@/components/admin/shared/AdminSearchInput';
import { RefreshCw, Download, Loader2, Archive, Trash2, AlertTriangle, CheckCircle2, ShieldCheck } from '@/components/common/Icons';

interface MediaCleanerTabProps {
  media: MediaItem[];
  cleanerUsed: MediaItem[];
  cleanerUnused: MediaItem[];
  unusedBytes: number;
  cleanerSearch: string;
  setCleanerSearch: (val: string) => void;
  cleanerTypeFilter: 'all' | 'image' | 'video';
  setCleanerTypeFilter: (val: 'all' | 'image' | 'video') => void;
  usageLoading: boolean;
  loadUsageCrossReferences: () => void;
  cleanerUsedSelected: Set<string>;
  cleanerUnusedSelected: Set<string>;
  toggleCleanerUsed: (item: MediaItem) => void;
  toggleSelectAllUsed: () => void;
  toggleCleanerUnused: (item: MediaItem) => void;
  toggleSelectAllUnused: () => void;
  downloadAsZip: (ids: Set<string>, zipName: string) => void;
  handleBulkDeleteUnused: () => void;
  isDownloadingZip: boolean;
  isBulkDeleting: boolean;
  setPreviewItem: (item: MediaItem) => void;
  handleCopyUrl: (url: string) => void;
  formatBytes: (bytes?: number) => string;
}

export function MediaCleanerTab({
  media,
  cleanerUsed,
  cleanerUnused,
  unusedBytes,
  cleanerSearch,
  setCleanerSearch,
  cleanerTypeFilter,
  setCleanerTypeFilter,
  usageLoading,
  loadUsageCrossReferences,
  cleanerUsedSelected,
  cleanerUnusedSelected,
  toggleCleanerUsed,
  toggleSelectAllUsed,
  toggleCleanerUnused,
  toggleSelectAllUnused,
  downloadAsZip,
  handleBulkDeleteUnused,
  isDownloadingZip,
  isBulkDeleting,
  setPreviewItem,
  handleCopyUrl,
  formatBytes
}: MediaCleanerTabProps) {
  const totalCleanerSelected = cleanerUsedSelected.size + cleanerUnusedSelected.size;

  return (
    <div className="space-y-6">

      {/* Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Files', value: media.length, color: 'text-gray-700 dark:text-gray-200', bg: 'bg-gray-50 dark:bg-gray-800/60', border: 'border-gray-200 dark:border-gray-700' },
          { label: 'In Use', value: cleanerUsed.length, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800' },
          { label: 'Unused', value: cleanerUnused.length, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800' },
          { label: 'Unused Size', value: formatBytes(unusedBytes), color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800' },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} ${stat.border} border rounded-2xl p-3 sm:p-4 text-center`}>
            <div className={`text-xl sm:text-2xl font-black ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Cleaner Search + Type Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-[#16162a] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="w-full sm:w-64">
          <AdminSearchInput
            value={cleanerSearch}
            onChange={setCleanerSearch}
            placeholder="Search filenames..."
          />
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800/60 p-1 rounded-xl w-full sm:w-auto min-h-[44px] items-center">
          {(['all', 'image', 'video'] as const).map(type => (
            <button key={type} type="button" onClick={() => setCleanerTypeFilter(type)}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${cleanerTypeFilter === type ? 'bg-white dark:bg-[#16162a] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
              {type === 'all' ? 'All Types' : type === 'image' ? 'Images' : 'Videos'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button type="button" onClick={() => loadUsageCrossReferences()} disabled={usageLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer min-h-[44px] transition-all disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${usageLoading ? 'animate-spin' : ''}`} />
            {usageLoading ? 'Scanning...' : 'Re-scan'}
          </button>
        </div>
      </div>

      {/* Global action bar */}
      {totalCleanerSelected > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-blue-600/5 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded-2xl">
          <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
            {totalCleanerSelected} file{totalCleanerSelected !== 1 ? 's' : ''} selected
          </span>
          <div className="flex flex-wrap gap-2">
            {cleanerUsedSelected.size > 0 && (
              <button type="button" onClick={() => downloadAsZip(cleanerUsedSelected, 'used-media')} disabled={isDownloadingZip}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all min-h-[36px] disabled:opacity-60">
                {isDownloadingZip ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                Download Used ({cleanerUsedSelected.size})
              </button>
            )}
            {cleanerUnusedSelected.size > 0 && (
              <>
                <button type="button" onClick={() => downloadAsZip(cleanerUnusedSelected, 'unused-media')} disabled={isDownloadingZip}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold cursor-pointer transition-all min-h-[36px] disabled:opacity-60">
                  {isDownloadingZip ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5" />}
                  Download Unused ({cleanerUnusedSelected.size})
                </button>
                <button type="button" onClick={handleBulkDeleteUnused} disabled={isBulkDeleting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all min-h-[36px] disabled:opacity-60">
                  {isBulkDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Delete Unused ({cleanerUnusedSelected.size})
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* UNUSED SECTION */}
      <div className="bg-white dark:bg-[#16162a] border border-red-100 dark:border-red-900/40 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between gap-3 p-4 border-b border-red-100 dark:border-red-900/40 bg-red-50/40 dark:bg-red-900/10">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-black text-red-700 dark:text-red-400">
                Unused Media
                <span className="ml-2 text-xs font-bold bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">{cleanerUnused.length}</span>
              </h3>
              <p className="text-xs text-red-500/70 dark:text-red-400/60">Not referenced anywhere — safe to delete</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {cleanerUnused.length > 0 && (
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors min-h-[36px]">
                <input
                  type="checkbox"
                  checked={cleanerUnusedSelected.size === cleanerUnused.length && cleanerUnused.length > 0}
                  onChange={toggleSelectAllUnused}
                  onClick={e => e.stopPropagation()}
                  className="h-4 w-4 rounded accent-red-500 cursor-pointer"
                />
                {cleanerUnusedSelected.size === cleanerUnused.length && cleanerUnused.length > 0 ? 'Deselect All' : 'Select All'}
              </label>
            )}
          </div>
        </div>

        <div className="p-4">
          {usageLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="aspect-square bg-gray-100 dark:bg-gray-800/80 rounded-2xl animate-pulse" />)}
            </div>
          ) : cleanerUnused.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">No unused files found!</p>
              <p className="text-xs text-gray-400 mt-1">All your media is actively referenced.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {cleanerUnused.map(item => (
                <MediaCard
                  key={item.id}
                  item={item}
                  isSelected={cleanerUnusedSelected.has(item.id)}
                  onToggle={() => toggleCleanerUnused(item)}
                  mode="library"
                  generatingId={null}
                  bulkGenerating={false}
                  bulkCompletedIds={[]}
                  bulkFailedIds={[]}
                  setPreviewItem={setPreviewItem}
                  handleCopyUrl={handleCopyUrl}
                  setEditingItem={() => {}}
                  handleDelete={() => {}}
                  handleSingleGenerate={() => {}}
                  formatBytes={formatBytes}
                  showCheckbox={true}
                  showBadge={false}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* USED SECTION */}
      <div className="bg-white dark:bg-[#16162a] border border-emerald-100 dark:border-emerald-900/40 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between gap-3 p-4 border-b border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-900/10">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                In-Use Media
                <span className="ml-2 text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">{cleanerUsed.length}</span>
              </h3>
              <p className="text-xs text-emerald-500/70 dark:text-emerald-400/60">Referenced in products, categories, settings, or homepage</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {cleanerUsed.length > 0 && (
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors min-h-[36px]">
                <input
                  type="checkbox"
                  checked={cleanerUsedSelected.size === cleanerUsed.length && cleanerUsed.length > 0}
                  onChange={toggleSelectAllUsed}
                  onClick={e => e.stopPropagation()}
                  className="h-4 w-4 rounded accent-emerald-500 cursor-pointer"
                />
                {cleanerUsedSelected.size === cleanerUsed.length && cleanerUsed.length > 0 ? 'Deselect All' : 'Select All'}
              </label>
            )}
          </div>
        </div>

        <div className="p-4">
          {usageLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="aspect-square bg-gray-100 dark:bg-gray-800/80 rounded-2xl animate-pulse" />)}
            </div>
          ) : cleanerUsed.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-sm">No files currently in use.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {cleanerUsed.map(item => (
                <MediaCard
                  key={item.id}
                  item={item}
                  isSelected={cleanerUsedSelected.has(item.id)}
                  onToggle={() => toggleCleanerUsed(item)}
                  mode="library"
                  generatingId={null}
                  bulkGenerating={false}
                  bulkCompletedIds={[]}
                  bulkFailedIds={[]}
                  setPreviewItem={setPreviewItem}
                  handleCopyUrl={handleCopyUrl}
                  setEditingItem={() => {}}
                  handleDelete={() => {}}
                  handleSingleGenerate={() => {}}
                  formatBytes={formatBytes}
                  showCheckbox={true}
                  showBadge={false}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
