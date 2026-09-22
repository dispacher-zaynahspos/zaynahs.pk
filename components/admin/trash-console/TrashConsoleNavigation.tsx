'use client';

import React from 'react';
import { Search, RefreshCw, Trash2, ShoppingBag, FolderOpen, Star, ClipboardList, Users, Images, Phone, Ruler, Layers } from '@/components/common/Icons';

export type TabType = 'products' | 'categories' | 'reviews' | 'orders' | 'customers' | 'media' | 'leads' | 'size_guides' | 'variant_presets';

interface TrashConsoleNavigationProps {
  activeTab: TabType;
  handleTabChange: (tab: TabType) => void;
  counts: Record<TabType, number>;
  totalTrashCount: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedIds: string[];
  activeTabCount: number;
  handleBulkRestore: () => void;
  setConfirmBulkDelete: (val: boolean) => void;
  setConfirmEmptyTab: (val: boolean) => void;
  setConfirmEmptyCompleteTrash: (val: boolean) => void;
  isPending: boolean;
}

export const TrashConsoleNavigation: React.FC<TrashConsoleNavigationProps> = ({
  activeTab,
  handleTabChange,
  counts,
  totalTrashCount,
  searchTerm,
  setSearchTerm,
  selectedIds,
  activeTabCount,
  handleBulkRestore,
  setConfirmBulkDelete,
  setConfirmEmptyTab,
  setConfirmEmptyCompleteTrash,
  isPending,
}) => {
  const tabList: { key: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { key: 'products', label: 'Products', icon: ShoppingBag },
    { key: 'categories', label: 'Categories', icon: FolderOpen },
    { key: 'reviews', label: 'Reviews', icon: Star },
    { key: 'orders', label: 'Orders', icon: ClipboardList },
    { key: 'customers', label: 'Customers', icon: Users },
    { key: 'media', label: 'Media', icon: Images },
    { key: 'leads', label: 'Leads', icon: Phone },
    { key: 'size_guides', label: 'Size Guides', icon: Ruler },
    { key: 'variant_presets', label: 'Presets', icon: Layers },
  ];

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#16162a] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab.replace('_', ' ')}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 text-xs font-semibold focus:outline-none focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]/20 text-gray-900 dark:text-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {selectedIds.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleBulkRestore}
                disabled={isPending}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-100 transition-all cursor-pointer whitespace-nowrap active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Restore ({selectedIds.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setConfirmBulkDelete(true)}
                disabled={isPending}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 text-xs font-bold hover:bg-red-100 transition-all cursor-pointer whitespace-nowrap active:scale-95 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Selected ({selectedIds.length})</span>
              </button>
            </>
          )}

          {activeTabCount > 0 && (
            <button
              type="button"
              onClick={() => setConfirmEmptyTab(true)}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 text-xs font-bold hover:bg-amber-100 transition-all cursor-pointer whitespace-nowrap active:scale-95 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Empty {activeTab.replace('_', ' ')} Trash</span>
            </button>
          )}

          {totalTrashCount > 0 && (
            <button
              type="button"
              onClick={() => setConfirmEmptyCompleteTrash(true)}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#e94560] text-white text-xs font-bold hover:bg-[#d8344e] transition-all cursor-pointer whitespace-nowrap active:scale-95 disabled:opacity-50 shadow-sm"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Empty All Trash ({totalTrashCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {tabList.map(tab => {
          const Icon = tab.icon;
          const count = counts[tab.key] || 0;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                isActive
                  ? 'bg-[#1a1a2e] text-white border-[#1a1a2e] dark:bg-[#e94560] dark:border-[#e94560] shadow-sm'
                  : 'bg-white dark:bg-[#16162a] text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                isActive ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
