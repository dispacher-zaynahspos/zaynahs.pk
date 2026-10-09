'use client';

import React from 'react';
import AdminSearchInput from '@/components/admin/shared/AdminSearchInput';
import AdminDateFilter from '@/components/admin/shared/AdminDateFilter';
import { ShoppingCart, RefreshCw, Trash2 } from '@/components/common/Icons';
import { 
  AbandonedCartStats, 
  AbandonedCartTable, 
  AbandonedCartDetailDrawer 
} from './components';
import { useAbandonedCartsData } from './hooks/useAbandonedCartsData';

export default function AbandonedCartsPage() {
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

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <ShoppingCart className="h-6 w-6 text-[#e94560]" />
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Abandoned Carts</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-0.5">Track and recover shoppers who left items in their cart</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => handleClearAll(true)}
            disabled={bulkDeleting || loading || filteredCarts.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/40 text-xs font-bold transition-all disabled:opacity-50"
            title="Permanently remove all anonymous carts with no contact info"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Anonymous</span>
          </button>
          <button
            onClick={fetchCarts}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#16162a] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-bold transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Grid & Conversion Bar */}
      <AbandonedCartStats stats={stats} />

      {/* Filters & Search Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <AdminSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search name, phone, email..."
            className="sm:max-w-md w-full"
          />
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {/* Date filter */}
            <AdminDateFilter 
              value={dateFilter}
              onChange={setDateFilter}
              className="py-2 sm:py-1 w-full sm:w-auto"
              options={[
                { value: 'today', label: 'Today' },
                { value: 'yesterday', label: 'Yesterday' },
                { value: 'last7', label: 'Last 7 Days' },
                { value: 'last30', label: 'Last 30 Days' },
                { value: 'custom', label: 'Custom Range' }
              ]}
            />

            {/* Status Tabs/Select */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] px-4 py-3 sm:py-2.5 text-xs font-bold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white cursor-pointer transition-colors w-full sm:w-auto"
            >
              <option value="all">Active Carts ({stats.total - stats.recovered})</option>
              <option value="pending">Pending ({stats.pending})</option>
              <option value="emailed">Email Sent ({stats.emailed})</option>
            </select>
          </div>
        </div>

        {/* Custom Date Inputs */}
        {dateFilter === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 p-3.5 bg-gray-50 dark:bg-white/3 rounded-2xl border border-gray-200 dark:border-gray-800 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400">Start Date:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] px-3 py-1.5 text-xs font-bold text-gray-900 dark:text-white focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400">End Date:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] px-3 py-1.5 text-xs font-bold text-gray-900 dark:text-white focus:outline-none"
              />
            </div>
            <button
              onClick={() => { setCustomStartDate(''); setCustomEndDate(''); }}
              className="text-xs text-red-500 font-bold hover:underline ml-auto"
            >
              Clear Custom Range
            </button>
          </div>
        )}
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between gap-4 p-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl shadow-xl border border-gray-800 dark:border-gray-200 animate-fade-in sticky top-4 z-20">
          <div className="flex items-center gap-2 text-xs font-bold px-1">
            <span className="inline-flex items-center justify-center h-5 px-2 rounded-full bg-[#e94560] text-white text-[10px]">
              {selectedIds.length}
            </span>
            <span>Cart(s) selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDeleteSelected}
              disabled={bulkDeleting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e94560] text-white text-xs font-bold hover:bg-[#d83a54] transition-all disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{bulkDeleting ? 'Deleting...' : `Delete Selected (${selectedIds.length})`}</span>
            </button>
            <button
              onClick={() => toggleSelectAll()}
              className="px-3 py-1.5 rounded-xl bg-white/10 dark:bg-gray-100 text-xs font-bold hover:bg-white/20 dark:hover:bg-gray-200 transition-all text-white dark:text-gray-900"
            >
              Deselect
            </button>
          </div>
        </div>
      )}

      {/* Main Table View */}
      <AbandonedCartTable
        loading={loading}
        error={error}
        onRetry={refetch}
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

      {/* Drawer */}
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
