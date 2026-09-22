'use client';

import React from 'react';
import { Upload } from '@/components/common/Icons';
import AdminSearchInput from '@/components/admin/shared/AdminSearchInput';
import { MediaItem } from './hooks/useMediaManagerData';

interface MediaLibraryFiltersProps {
  mode: 'library' | 'selector';
  multiple: boolean;
  globalAi: boolean;
  handleGlobalAiToggle: () => void;
  aiFilter: 'all' | 'generated' | 'pending';
  setAiFilter: (v: 'all' | 'generated' | 'pending') => void;
  media: MediaItem[];
  setSelectedIds: (ids: string[]) => void;
  selectedIds: string[];
  filteredMedia: MediaItem[];
  toggleSelectAll: () => void;
  search: string;
  setSearch: (v: string) => void;
  typeFilter: 'all' | 'image' | 'video';
  setTypeFilter: (v: 'all' | 'image' | 'video') => void;
  sortBy: string;
  setSortBy: (v: any) => void;
  uploading: boolean;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function MediaLibraryFilters({
  mode,
  multiple,
  globalAi,
  handleGlobalAiToggle,
  aiFilter,
  setAiFilter,
  media,
  setSelectedIds,
  selectedIds,
  filteredMedia,
  toggleSelectAll,
  search,
  setSearch,
  typeFilter,
  setTypeFilter,
  sortBy,
  setSortBy,
  uploading,
  handleFileUpload,
}: MediaLibraryFiltersProps) {
  return (
    <>
      {mode === 'library' && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-[#16162a] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between w-full md:w-auto p-2 bg-gray-50/50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-800 min-h-[50px] px-4">
            <div className="mr-8">
              <span className="text-sm font-bold text-gray-950 dark:text-white">Auto Vision Tagging</span>
              <span className="text-[10px] text-gray-400 block leading-none mt-0.5">Analyze and add alt tags automatically on upload.</span>
            </div>
            <input type="checkbox" checked={globalAi} onChange={handleGlobalAiToggle}
              className="w-10 h-6 rounded-full bg-gray-200 checked:bg-blue-600 appearance-none cursor-pointer transition-all relative after:content-[''] after:absolute after:h-5 after:w-5 after:bg-white after:rounded-full after:top-[2px] after:left-[2px] checked:after:left-[18px] after:transition-all"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {(['all', 'generated', 'pending'] as const).map(status => (
              <button type="button" key={status} onClick={() => {
                setAiFilter(status);
                if (status === 'pending') {
                  const pendingIds = media.filter((m: MediaItem) => !m.ai_generated).map((m: MediaItem) => m.id);
                  setSelectedIds(pendingIds);
                }
              }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border min-h-[38px] flex-1 md:flex-none capitalize transition-all cursor-pointer ${aiFilter === status ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-[#16162a] border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                {status === 'all' ? 'All' : status === 'generated' ? 'AI Tagged' : 'Pending'}
              </button>
            ))}
            <button type="button" onClick={toggleSelectAll}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 bg-white dark:bg-[#16162a] hover:bg-gray-50 dark:hover:bg-gray-800 min-h-[38px] cursor-pointer">
              {selectedIds.length === filteredMedia.length && filteredMedia.length > 0 ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>
      )}

      {/* Search + Sort + Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-[#16162a] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="w-full sm:w-64">
            <AdminSearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search filenames..."
            />
          </div>
          <div className="flex bg-gray-100 dark:bg-gray-800/60 p-1 rounded-xl w-full sm:w-auto min-h-[44px] items-center">
            {(['all', 'image', 'video'] as const).map(type => (
              <button key={type} type="button" onClick={() => setTypeFilter(type)}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${typeFilter === type ? 'bg-white dark:bg-[#16162a] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
                {type === 'all' ? 'All Types' : type === 'image' ? 'Images' : 'Videos'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {mode === 'selector' && (
            <label className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1a1a2e] hover:bg-[#2e2e4e] dark:bg-gray-800 dark:hover:bg-gray-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors w-full sm:w-auto min-h-[44px]">
              <Upload className="h-4 w-4" />
              {uploading ? 'Uploading...' : 'Upload Media'}
              <input type="file" multiple={multiple} accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
            </label>
          )}
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
            className="w-full sm:w-44 px-3.5 py-2 text-sm bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:border-blue-500 min-h-[44px] cursor-pointer">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="size-desc">Size: Big to Small</option>
            <option value="size-asc">Size: Small to Big</option>
          </select>
        </div>
      </div>
    </>
  );
}
