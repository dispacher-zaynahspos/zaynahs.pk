'use client';

import React from 'react';
import AdminSearchInput from '@/components/admin/shared/AdminSearchInput';
import AdminDateFilter from '@/components/admin/shared/AdminDateFilter';
import { ShoppingCart, RefreshCw } from '@/components/common/Icons';
import { 
  AbandonedCartStats, 
  AbandonedCartTable, 
  AbandonedCartDetailDrawer 
} from './components';
import { useAbandonedCartsData } from './hooks/useAbandonedCartsData';

export default function AbandonedCartsPage() {
  const {
    loading,
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
        <button
          onClick={fetchCarts}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#16162a] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-bold transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Grid & Conversion Bar */}
      <AbandonedCartStats stats={stats} />

      {/* Filters & Search Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <AdminSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by customer, phone, email or session ID..."
            className="sm:max-w-md w-full"
          />
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {/* Date filter */}
            <AdminDateFilter 
              value={dateFilter}
              onChange={setDateFilter}
              className="py-2 sm:py-1 w-full sm:w-auto"
              options={[
                { value: 'all', label: 'All Dates' },
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

      {/* Main Table View */}
      <AbandonedCartTable
        loading={loading}
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
