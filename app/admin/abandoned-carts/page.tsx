'use client';

import React, { useState } from 'react';
import AdminSearchInput from '@/components/admin/shared/AdminSearchInput';
import { ShoppingCart, RefreshCw, Trash2, Search } from '@/components/common/Icons';
import { 
  AbandonedCartStats, 
  AbandonedCartTable, 
  AbandonedCartDetailDrawer 
} from './components';
import { useAbandonedCartsData } from './hooks/useAbandonedCartsData';

export default function AbandonedCartsPage() {
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const {
    loading,
    error,
    refetch,
    selectedIds,
    bulkDeleting,
    toggleSelectCart,
    toggleSelectAll,
    handleDeleteSelected,
    handleClearAll,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    currentPage,
    setCurrentPage,
    selectedCartId,
    setSelectedCartId,
    selectedCart,
    deleting,
    copiedId,
    fetchCarts,
    handleDelete,
    filteredCarts,
    paginatedCarts,
    totalPages,
    selectedCartIndex,
    handlePrevCart,
    handleNextCart,
    stats,
    handleCopyDetails,
    getStatusBadgeStyles,
  } = useAbandonedCartsData();

  const recoverableCount = filteredCarts.filter(c => Boolean(c.customerPhone || c.customerEmail)).length;
  const anonymousCount = filteredCarts.filter(c => !c.customerPhone && !c.customerEmail).length;

  return (
    <div className={`space-y-6 relative transition-all duration-300 font-sans pb-20 ${isFullWidth ? 'max-w-none px-4' : 'max-w-6xl mx-auto'}`}>
      {/* Header Row (Matches Orders Log exactly) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFullWidth(!isFullWidth)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={isFullWidth ? "Collapse view" : "Expand view"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              {isFullWidth ? (
                <path fillRule="evenodd" d="M12 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 11-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L15 5H13a1 1 0 01-1-1zm-4 12a1 1 0 01-1 1H3a1 1 0 01-1-1v-4a1 1 0 112 0v1.586l2.293-2.293a1 1 0 111.414 1.414L5 13.586V15h2a1 1 0 011 1z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 110-2h4a1 1 0 011 1v4a1 1 0 11-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 112 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 110 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 110-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
              )}
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Abandoned Carts</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={() => handleClearAll(true)}
            disabled={bulkDeleting || loading || filteredCarts.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/40 text-xs font-bold transition-all disabled:opacity-50 shadow-xs cursor-pointer"
            title="Permanently remove all anonymous carts with no contact info"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Anonymous</span>
          </button>
          <button
            type="button"
            onClick={fetchCarts}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white dark:bg-[#16162a] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-bold transition-all disabled:opacity-50 shadow-xs cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Bar (Matches OrderLogStatsBar design and compact KPI bar) */}
      <AbandonedCartStats 
        stats={stats}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        setCustomStartDate={setCustomStartDate}
        setCustomEndDate={setCustomEndDate}
      />

      {/* Custom Date Range Picker when 'custom' is active */}
      {dateFilter === 'custom' && (
        <div className="flex flex-wrap items-center gap-3 p-3 bg-white dark:bg-[#16162a] rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs text-xs animate-fade-in">
          <span className="font-bold text-gray-700 dark:text-gray-300">Custom Date Range:</span>
          <input
            type="date"
            value={customStartDate}
            onChange={(e) => setCustomStartDate(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 font-semibold text-gray-800 dark:text-gray-200"
          />
          <span className="text-gray-400 font-bold">to</span>
          <input
            type="date"
            value={customEndDate}
            onChange={(e) => setCustomEndDate(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 font-semibold text-gray-800 dark:text-gray-200"
          />
        </div>
      )}

      {/* Sticky Filter Tabs & Controls Toolbar (Flush with top, matching Orders Log) */}
      <div className="sticky top-0 z-20 -mt-3 sm:-mt-4 pt-3 sm:pt-4 -mx-3 sm:-mx-4 md:-mx-5 px-3 sm:px-4 md:px-5 bg-slate-50 dark:bg-[#0c0c16] pb-2">
        <div className="filter-tabs-row flex items-center gap-2 border border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-[#16162a]/95 backdrop-blur-md rounded-t-xl px-3 py-1 select-none shadow-xs">
          {/* Scrollable tabs */}
          <div className="filter-tabs-scroll flex items-center flex-1 min-w-0 overflow-x-auto">
            {([
              { key: 'all', label: 'All Active', count: Math.max(0, stats.total - stats.recovered) },
              { key: 'recoverable', label: 'With Contact', count: recoverableCount },
              { key: 'anonymous', label: 'Anonymous', count: anonymousCount },
              { key: 'recovered', label: 'Recovered', count: stats.recovered },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.key);
                  setCurrentPage(1);
                }}
                className={`filter-tab shrink-0 whitespace-nowrap px-3 py-2.5 text-[13.5px] transition-all font-semibold border-b-2 mr-2 cursor-pointer ${
                  statusFilter === tab.key
                    ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <span className="ml-1.5 text-xs text-gray-400 font-normal">
                  ({tab.count})
                </span>
              </button>
            ))}
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-1.5 py-1 shrink-0">
            <button
              type="button"
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className={`p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
                isSearchExpanded || searchQuery ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : ''
              }`}
              title="Search Carts"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Collapsible Search Input */}
        {isSearchExpanded && (
          <div className="p-3 bg-white dark:bg-[#16162a] border-x border-b border-gray-200 dark:border-gray-800 animate-fade-in shadow-xs">
            <AdminSearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by customer name, phone, email, or cart ID..."
              className="w-full"
            />
          </div>
        )}

        {/* Bulk Actions Banner */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900 text-white text-xs font-bold rounded-b-xl animate-fade-in">
            <span>{selectedIds.length} {selectedIds.length === 1 ? 'cart' : 'carts'} selected</span>
            <button
              type="button"
              onClick={handleDeleteSelected}
              disabled={bulkDeleting}
              className="flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Selected</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Table (Flush with tabs header) */}
      <AbandonedCartTable
        loading={loading}
        error={error}
        onRetry={fetchCarts}
        filteredCarts={filteredCarts}
        paginatedCarts={paginatedCarts}
        deleting={deleting}
        selectedCartId={selectedCartId}
        setSelectedCartId={setSelectedCartId}
        handleDelete={handleDelete}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        getStatusBadgeStyles={getStatusBadgeStyles}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelectCart}
        onToggleSelectAll={toggleSelectAll}
      />

      {/* Detail Drawer (Matches OrderQuickViewModal aesthetics) */}
      <AbandonedCartDetailDrawer
        selectedCart={selectedCart}
        setSelectedCartId={setSelectedCartId}
        selectedCartIndex={selectedCartIndex}
        filteredCarts={filteredCarts}
        copiedId={copiedId}
        deleting={deleting}
        handleCopyDetails={handleCopyDetails}
        handlePrevCart={handlePrevCart}
        handleNextCart={handleNextCart}
        handleDelete={handleDelete}
        getStatusBadgeStyles={getStatusBadgeStyles}
      />
    </div>
  );
}
