'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import AdminSearchInput from '@/components/admin/shared/AdminSearchInput';
import { StoreSettings } from '@/lib/types';
import { SORT_OPTIONS } from '@/lib/sorting/sortOptions';
import { 
  Plus, 
  Globe, 
  RefreshCw, 
  Loader2, 
  PackageOpen, 
  SlidersHorizontal, 
  MoreVertical,
  X 
} from '@/components/common/Icons';
import { useHorizontalScroll } from '@/lib/hooks/useHorizontalScroll';

export type ProductTab = 'all' | 'visible' | 'featured' | 'low_stock' | 'hidden';

export interface TabCounts {
  all: number;
  visible: number;
  featured: number;
  low_stock: number;
  hidden: number;
}

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
  activeTab: ProductTab;
  setActiveTab: (tab: ProductTab) => void;
  tabCounts: TabCounts;
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
  activeTab,
  setActiveTab,
  tabCounts,
}: ProductListToolbarProps) {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const { scrollRef: mobileTabsRef, scrollIntoView: scrollMobileTabIntoView } = useHorizontalScroll<HTMLDivElement>();
  const { scrollRef: desktopTabsRef, scrollIntoView: scrollDesktopTabIntoView } = useHorizontalScroll<HTMLDivElement>();

  // Close more menu on click outside
  useEffect(() => {
    if (!isMoreMenuOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isMoreMenuOpen]);

  const hasActiveFilters = selectedCategory !== 'all' || sortBy !== 'newest';

  const tabs: { key: ProductTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: tabCounts.all },
    { key: 'visible', label: 'Visible', count: tabCounts.visible },
    { key: 'featured', label: 'Featured', count: tabCounts.featured },
    { key: 'low_stock', label: 'Low Stock', count: tabCounts.low_stock },
    { key: 'hidden', label: 'Hidden', count: tabCounts.hidden },
  ];

  return (
    <div className="space-y-2.5 w-full">
      {/* ============================================================
          MOBILE SMART CONTROLS (< md): Native App Bar + Tab Chips
          ============================================================ */}
      <div className="md:hidden space-y-2">
        {/* Top Single Row: Search + Filters + Add + More Menu */}
        <div className="flex items-center gap-1.5 bg-white/95 dark:bg-[#16162a]/95 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-xl p-1.5 shadow-2xs">
          {/* Compact Search */}
          <div className="flex-1 min-w-0">
            <AdminSearchInput
              value={searchQuery}
              onChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
              placeholder="Search products or SKU..."
              className="w-full text-xs"
            />
          </div>

          {/* Filters Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className={`h-9 px-2.5 rounded-lg border flex items-center gap-1.5 text-xs font-bold transition-all shrink-0 ${
              isMobileFiltersOpen || hasActiveFilters
                ? 'bg-[#e94560]/10 border-[#e94560]/30 text-[#e94560]'
                : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300'
            }`}
            title="Filters"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Filters</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#e94560]" />
            )}
          </button>

          {/* Add Product Button */}
          <Link
            href="/admin/products/new"
            className="h-9 px-3 rounded-lg bg-[#e94560] hover:bg-[#d33a53] text-white flex items-center gap-1 text-xs font-bold transition-all shrink-0 shadow-xs"
            title="Add Product"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Add</span>
          </Link>

          {/* More Actions (Sync, Import/Export) */}
          <div className="relative shrink-0" ref={moreMenuRef}>
            <button
              type="button"
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className="h-9 w-8 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-all"
              title="More actions"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {/* More Actions Dropdown Menu */}
            {isMoreMenuOpen && (
              <div className="absolute right-0 top-11 w-48 rounded-xl bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-gray-800 shadow-xl py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                {settings.meta_sync_enabled && (
                  <>
                    <button
                      type="button"
                      onClick={() => { setIsMoreMenuOpen(false); onSyncAll(); }}
                      disabled={syncingAll}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 text-left disabled:opacity-50"
                    >
                      {syncingAll ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5 text-blue-500" />}
                      <span>Sync All to Meta</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsMoreMenuOpen(false); onSyncFailed(); }}
                      disabled={syncingFailed}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 text-left disabled:opacity-50"
                    >
                      {syncingFailed ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5 text-amber-500" />}
                      <span>Retry Failed Syncs</span>
                    </button>
                    <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />
                  </>
                )}
                <button
                  type="button"
                  onClick={() => { setIsMoreMenuOpen(false); onOpenImportExport(); }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 text-left"
                >
                  <PackageOpen className="h-3.5 w-3.5 text-[#e94560]" />
                  <span>Import / Export</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Collapsible Mobile Filter Drawer */}
        {isMobileFiltersOpen && (
          <div className="bg-white/95 dark:bg-[#16162a]/95 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-xl p-3 shadow-sm space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-gray-800/80">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Product Filters</span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSortBy('newest');
                    setCurrentPage(1);
                  }}
                  className="text-xs font-bold text-[#e94560] hover:underline flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  <span>Reset filters</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 block">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1a1a2e] px-2.5 py-2 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#e94560]"
                >
                  <option value="all">All Categories</option>
                  {availableCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 block">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1a1a2e] px-2.5 py-2 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#e94560]"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Horizontal Native Pill Tabs */}
        <div 
          ref={mobileTabsRef}
          className="flex items-center gap-1.5 overflow-x-auto overflow-y-hidden touch-pan-x overscroll-x-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1 px-1 pr-10 cursor-grab active:cursor-grabbing select-none"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
        >
          {tabs.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={(e) => {
                  scrollMobileTabIntoView(e.currentTarget);
                  setActiveTab(tab.key);
                  setCurrentPage(1);
                }}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all select-none flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#e94560] text-white shadow-xs'
                    : 'bg-white dark:bg-[#16162a] text-gray-600 dark:text-gray-300 border border-gray-200/90 dark:border-gray-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================
          DESKTOP UNIFIED CONTROLS (>= md): Classic Toolbar + Tab Strip
          ============================================================ */}
      <div className="hidden md:flex flex-col gap-2.5 w-full">
        {/* Desktop Tab Strip */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-1">
          <div 
            ref={desktopTabsRef}
            className="flex items-center gap-2 overflow-x-auto overflow-y-hidden touch-pan-x overscroll-x-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing select-none pr-4"
          >
            {tabs.map(tab => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={(e) => {
                    scrollDesktopTabIntoView(e.currentTarget);
                    setActiveTab(tab.key);
                    setCurrentPage(1);
                  }}
                  className={`filter-tab shrink-0 whitespace-nowrap px-3 py-1.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                    isActive
                      ? 'border-[#e94560] text-[#e94560] dark:border-[#e94560] dark:text-[#e94560]'
                      : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive ? 'bg-[#e94560]/10 text-[#e94560]' : 'bg-gray-100 dark:bg-white/5 text-gray-400'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop Filter & Action Controls */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 w-full">
          {/* Left Filters Group (Search, Category, Sort) */}
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
            <AdminSearchInput
              value={searchQuery}
              onChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
              placeholder="Search products by name or SKU..."
              className="flex-1 min-w-[200px]"
            />
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                className="rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-[#16162a] px-3 py-2 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#e94560] focus:ring-2 focus:ring-[#e94560]/15 cursor-pointer shadow-xs min-h-[38px] shrink-0"
              >
                <option value="all">All Categories</option>
                {availableCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                className="rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-[#16162a] px-3 py-2 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#e94560] focus:ring-2 focus:ring-[#e94560]/15 cursor-pointer shadow-xs min-h-[38px] shrink-0"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0 justify-start lg:justify-end">
            {settings.meta_sync_enabled && (
              <>
                <button
                  type="button"
                  onClick={onSyncAll}
                  disabled={syncingAll}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-[#16162a] text-gray-700 dark:text-gray-300 px-3 py-2 text-xs font-bold shadow-xs hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer min-h-[38px]"
                  title="Sync all active products to Meta catalog"
                >
                  {syncingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4 text-blue-500" />}
                  <span>Sync All</span>
                </button>
                <button
                  type="button"
                  onClick={onSyncFailed}
                  disabled={syncingFailed}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-[#16162a] text-gray-700 dark:text-gray-300 px-3 py-2 text-xs font-bold shadow-xs hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer min-h-[38px]"
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
              className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-[#16162a] text-gray-700 dark:text-gray-300 px-3.5 py-2 text-xs font-bold shadow-xs hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer min-h-[38px]"
              title="Import or Export product catalog data"
            >
              <PackageOpen className="h-4 w-4 text-[#e94560]" />
              <span>Import / Export</span>
            </button>
            <Link
              href="/admin/products/new"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-[#1a1a2e] dark:bg-[#e94560] hover:bg-[#e94560] dark:hover:bg-[#d33a53] text-white px-4 py-2 text-xs font-bold shadow-xs hover:shadow-sm transition-all min-h-[38px] whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
