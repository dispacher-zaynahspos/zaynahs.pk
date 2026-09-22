'use client';

import React from 'react';
import Link from 'next/link';
import AdminSearchInput from '@/components/admin/shared/AdminSearchInput';
import { StoreSettings } from '@/lib/types';
import { Plus, Globe, RefreshCw, Loader2, PackageOpen } from '@/components/common/Icons';

interface ProductListToolbarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  availableCategories: { id: string; name: string }[];
  settings: StoreSettings;
  syncingAll: boolean;
  syncingFailed: boolean;
  onSyncAll: () => void;
  onSyncFailed: () => void;
  onOpenImportExport: () => void;
  setCurrentPage: (p: number) => void;
}

export default function ProductListToolbar({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  availableCategories,
  settings,
  syncingAll,
  syncingFailed,
  onSyncAll,
  onSyncFailed,
  onOpenImportExport,
  setCurrentPage,
}: ProductListToolbarProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-3.5 items-stretch lg:items-center justify-between">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto flex-1">
        <AdminSearchInput
          value={searchQuery}
          onChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
          placeholder="Search products by name or SKU..."
          className="flex-1 lg:max-w-md"
        />
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            className="flex-1 sm:flex-none rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-[#16162a] px-3 py-2 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#e94560] focus:ring-2 focus:ring-[#e94560]/15 cursor-pointer shadow-xs min-h-[38px]"
          >
            <option value="all">All Categories</option>
            {availableCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
            className="flex-1 sm:flex-none rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-[#16162a] px-3 py-2 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#e94560] focus:ring-2 focus:ring-[#e94560]/15 cursor-pointer shadow-xs min-h-[38px]"
          >
            <option value="created-desc">Newest First</option>
            <option value="created-asc">Oldest First</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="manual">Manual Order</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
        {settings.meta_sync_enabled && (
          <>
            <button
              type="button"
              onClick={onSyncAll}
              disabled={syncingAll}
              className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-[#16162a] text-gray-700 dark:text-gray-300 px-3.5 py-2 text-xs font-bold shadow-xs hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer min-h-[38px]"
              title="Sync all active products to Meta catalog"
            >
              {syncingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4 text-blue-500" />}
              <span>Sync All</span>
            </button>
            <button
              type="button"
              onClick={onSyncFailed}
              disabled={syncingFailed}
              className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-[#16162a] text-gray-700 dark:text-gray-300 px-3.5 py-2 text-xs font-bold shadow-xs hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer min-h-[38px]"
              title="Retry failed/pending product syncs"
            >
              {syncingFailed ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 text-amber-500" />}
              <span>Retry Failed</span>
            </button>
          </>
        )}
        <button
          type="button"
          onClick={onOpenImportExport}
          className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-[#16162a] text-gray-700 dark:text-gray-300 px-3.5 py-2 text-xs font-bold shadow-xs hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer min-h-[38px]"
          title="Import or Export product catalog data"
        >
          <PackageOpen className="h-4 w-4 text-[#e94560]" />
          <span>Import / Export</span>
        </button>
        <Link
          href="/admin/products/new"
          className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-xl bg-[#1a1a2e] dark:bg-[#e94560] hover:bg-[#e94560] dark:hover:bg-[#d33a53] text-white px-4 py-2 text-xs font-bold shadow-xs hover:shadow-sm transition-all min-h-[38px]"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </Link>
      </div>
    </div>
  );
}

