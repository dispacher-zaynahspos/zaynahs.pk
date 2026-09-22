import React from 'react';
import { 
  Search, 
  Zap, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Loader2, 
  Eye, 
  Edit 
} from '@/components/common/Icons';
import { SEOEntityItem } from './types';

interface SEODirectoryTableProps {
  entityType: 'product' | 'category';
  entityLabel: string; // e.g. "Products" or "Categories"
  items: SEOEntityItem[];
  loading: boolean;
  search: string;
  setSearch: (val: string) => void;
  onSearchSubmit: () => void;
  filter: 'all' | 'optimized' | 'pending';
  setFilter: (val: 'all' | 'optimized' | 'pending') => void;
  selectedIds: string[];
  toggleSelectAll: () => void;
  toggleSelect: (id: string) => void;
  aiEnabled: boolean;
  optimizingId: string | null;
  bulkOptimizing: boolean;
  onOptimize: (id: string) => void;
  onBulkOptimize: () => void;
  onPreview: (item: SEOEntityItem) => void;
  onEdit: (item: SEOEntityItem) => void;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

export default function SEODirectoryTable({
  entityType,
  entityLabel,
  items,
  loading,
  search,
  setSearch,
  onSearchSubmit,
  filter,
  setFilter,
  selectedIds,
  toggleSelectAll,
  toggleSelect,
  aiEnabled,
  optimizingId,
  bulkOptimizing,
  onOptimize,
  onBulkOptimize,
  onPreview,
  onEdit,
  currentPage,
  totalPages,
  totalCount,
  setCurrentPage,
}: SEODirectoryTableProps) {
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder={`Search ${entityLabel.toLowerCase()}... (Press Enter)`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyPress}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a30] text-gray-900 dark:text-white text-sm focus:border-blue-500 focus:outline-none min-h-[44px]"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Filters */}
        <div className="flex gap-2 w-full md:w-auto">
          {(['all', 'optimized', 'pending'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => { setFilter(status); setCurrentPage(1); }}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium border min-h-[44px] flex-1 md:flex-none capitalize transition-all cursor-pointer ${
                filter === status
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white dark:bg-[#16162a] border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={items.length > 0 && selectedIds.length === items.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="p-4">{entityLabel} Name</th>
                <th className="p-4 hidden md:table-cell">Focus Keyword</th>
                <th className="p-4">SEO Title</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm text-gray-700 dark:text-gray-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-450 dark:text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    <span>Loading {entityLabel.toLowerCase()} catalog...</span>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-455 dark:text-gray-500">
                    No {entityLabel.toLowerCase()} found matching filters.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isOptimized = item.seo_meta?.is_optimized;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/10 transition-colors">
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelect(item.id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-4 font-medium text-gray-900 dark:text-white">
                        <div className="flex flex-col">
                          <span>{item.name}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">/{entityType}/{item.slug}</span>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell font-mono text-xs">
                        {item.seo_meta?.focus_keyword || <span className="text-gray-400">—</span>}
                      </td>
                      <td className="p-4 max-w-[200px] truncate text-xs font-mono">
                        {item.seo_meta?.seo_title || <span className="text-gray-400">—</span>}
                      </td>
                      <td className="p-4">
                        {isOptimized ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Optimized
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isOptimized ? (
                            <>
                              <button
                                type="button"
                                onClick={() => onPreview(item)}
                                className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                                title="Preview Social / Search Cards"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onEdit(item)}
                                className="p-2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                                title="Edit Copy overrides"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </>
                          ) : null}

                          {aiEnabled && (
                            <button
                              type="button"
                              onClick={() => onOptimize(item.id)}
                              disabled={optimizingId === item.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-500 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/10 disabled:bg-gray-50 dark:disabled:bg-gray-800 text-xs transition-all cursor-pointer min-h-[36px]"
                            >
                              {optimizingId === item.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Zap className="w-3.5 h-3.5 fill-current" />
                              )}
                              <span>{isOptimized ? 'Regen' : 'Write AI'}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Cards Grid */}
        <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800/60">
          {loading ? (
            <div className="p-8 text-center text-gray-450 dark:text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
              <span>Loading {entityLabel.toLowerCase()} catalog...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-gray-455 dark:text-gray-500">
              No {entityLabel.toLowerCase()} found matching filters.
            </div>
          ) : (
            items.map((item) => {
              const isOptimized = item.seo_meta?.is_optimized;
              const isSelected = selectedIds.includes(item.id);
              return (
                <div 
                  key={item.id} 
                  className={`p-4 flex flex-col gap-3 transition-colors ${
                    isSelected ? 'bg-blue-50/5 dark:bg-blue-900/5' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(item.id)}
                        className="w-4.5 h-4.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-gray-900 dark:text-white text-sm truncate">{item.name}</span>
                        <span className="text-xs text-gray-455 dark:text-gray-500 truncate">/{entityType}/{item.slug}</span>
                      </div>
                    </div>
                    <div>
                      {isOptimized ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          Optimized
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-gray-50 dark:border-gray-800/40 pt-2">
                    <div className="min-w-0">
                      <span className="text-gray-400 dark:text-gray-500 block mb-0.5">Focus Keyword</span>
                      <span className="font-mono text-gray-900 dark:text-white truncate block">
                        {item.seo_meta?.focus_keyword || <span className="text-gray-400 dark:text-gray-650">—</span>}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-gray-400 dark:text-gray-500 block mb-0.5">SEO Title</span>
                      <span className="font-mono text-gray-900 dark:text-white truncate block">
                        {item.seo_meta?.seo_title || <span className="text-gray-400 dark:text-gray-650">—</span>}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-50 dark:border-gray-800/40">
                    {isOptimized ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onPreview(item)}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl transition-all cursor-pointer text-xs font-bold min-h-[36px]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl transition-all cursor-pointer text-xs font-bold min-h-[36px]"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      </>
                    ) : null}

                    {aiEnabled && (
                      <button
                        type="button"
                        onClick={() => onOptimize(item.id)}
                        disabled={optimizingId === item.id}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-500 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/10 disabled:bg-gray-50 dark:disabled:bg-gray-805 text-xs transition-all cursor-pointer min-h-[36px]"
                      >
                        {optimizingId === item.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Zap className="w-3.5 h-3.5 fill-current" />
                        )}
                        <span>{isOptimized ? 'Regen' : 'Write AI'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/20 dark:bg-gray-900/10">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Showing page {currentPage} of {totalPages} ({totalCount} total {entityLabel.toLowerCase()})
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 dark:border-gray-800 rounded-xl disabled:text-gray-300 dark:disabled:text-gray-700 bg-white dark:bg-[#16162a] hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 dark:border-gray-800 rounded-xl disabled:text-gray-300 dark:disabled:text-gray-700 bg-white dark:bg-[#16162a] hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
