'use client';

import React from 'react';
import Link from 'next/link';
import OrderCreateCanvas from '@/components/admin/OrderCreateCanvas';
import AdminSearchInput from '@/components/admin/shared/AdminSearchInput';
import AdminDateFilter from '@/components/admin/shared/AdminDateFilter';
import { Search, TrendingUp, SlidersHorizontal } from '@/components/common/Icons';
import { Order, StoreSettings } from '@/lib/types';

import { OrderLogStatsBar } from './order-log/OrderLogStatsBar';
import { OrderLogBulkActions } from './order-log/OrderLogBulkActions';
import { OrderLogTable } from './order-log/OrderLogTable';
import { useOrderLogState } from './order-log/hooks/useOrderLogState';

interface OrderLogProps {
  initialOrders: Order[];
  settings: StoreSettings;
}

export default function OrderLog({ initialOrders, settings }: OrderLogProps) {
  const o = useOrderLogState({ initialOrders, settings });

  return (
    <div className={`space-y-6 relative transition-all duration-300 font-sans pb-20 ${o.isFullWidth ? 'max-w-none px-4' : 'max-w-6xl mx-auto'}`}>
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => o.setIsFullWidth(!o.isFullWidth)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={o.isFullWidth ? "Collapse view" : "Expand view"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              {o.isFullWidth ? (
                <path fillRule="evenodd" d="M12 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 11-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L15 5H13a1 1 0 01-1-1zm-4 12a1 1 0 01-1 1H3a1 1 0 01-1-1v-4a1 1 0 112 0v1.586l2.293-2.293a1 1 0 111.414 1.414L5 13.586V15h2a1 1 0 011 1z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 110-2h4a1 1 0 011 1v4a1 1 0 11-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 112 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 110 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 110-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
              )}
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Orders</h1>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => o.setIsCreateCanvasOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-[#008060] hover:bg-[#006e52] text-white text-xs font-bold transition-all shadow-xs"
          >
            Create order
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <OrderLogStatsBar
        orders={o.orders}
        dateFilter={o.dateFilter}
        setDateFilter={o.setDateFilter}
        customStartDate={o.customStartDate}
        customEndDate={o.customEndDate}
        settings={settings}
      />

      {/* Filter Tabs Row */}
      <div className="filter-tabs-row flex items-center border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] rounded-t-xl px-3 py-1 overflow-x-auto select-none">
        <button
          onClick={() => { o.setActiveTab('all'); o.setSelectedOrderIds([]); }}
          className={`filter-tab px-3 py-2.5 text-[13.5px] transition-all font-semibold border-b-2 mr-2 ${o.activeTab === 'all'
              ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
        >
          All
        </button>
        <button
          onClick={() => { o.setActiveTab('unfulfilled'); o.setSelectedOrderIds([]); }}
          className={`filter-tab px-3 py-2.5 text-[13.5px] transition-all font-semibold border-b-2 mr-2 ${o.activeTab === 'unfulfilled'
              ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
        >
          Unfulfilled
        </button>
        <button
          onClick={() => { o.setActiveTab('unpaid'); o.setSelectedOrderIds([]); }}
          className={`filter-tab px-3 py-2.5 text-[13.5px] transition-all font-semibold border-b-2 mr-2 ${o.activeTab === 'unpaid'
              ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
        >
          Unpaid
        </button>
        <button
          onClick={() => { o.setActiveTab('open'); o.setSelectedOrderIds([]); }}
          className={`filter-tab px-3 py-2.5 text-[13.5px] transition-all font-semibold border-b-2 mr-2 ${o.activeTab === 'open'
              ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
        >
          Open
        </button>
        <button
          onClick={() => { o.setActiveTab('archived'); o.setSelectedOrderIds([]); }}
          className={`filter-tab px-3 py-2.5 text-[13.5px] transition-all font-semibold border-b-2 mr-2 ${o.activeTab === 'archived'
              ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
        >
          Archived
        </button>

        {/* Right side icons */}
        <div className="ml-auto flex items-center gap-1.5 py-1">
          <button
            onClick={() => o.setIsSearchExpanded(!o.isSearchExpanded)}
            className={`table-ctrl-btn w-8 h-8 rounded-md border flex items-center justify-center transition-all ${o.isSearchExpanded
                ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white'
                : 'bg-white dark:bg-transparent border-gray-200 dark:border-gray-800 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            title="Search"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            onClick={() => o.setIsFiltersExpanded(!o.isFiltersExpanded)}
            className={`table-ctrl-btn w-8 h-8 rounded-md border flex items-center justify-center transition-all ${o.isFiltersExpanded
                ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white'
                : 'bg-white dark:bg-transparent border-gray-200 dark:border-gray-800 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            title="Filters"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>

          <Link
            href="/admin/reporting"
            className="table-ctrl-btn w-8 h-8 rounded-md border border-gray-200 dark:border-gray-800 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-all"
            title="View reports"
          >
            <TrendingUp className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Expanded Search Input */}
      {o.isSearchExpanded && (
        <div className="bg-white dark:bg-[#16162a] border-x border-gray-200 dark:border-gray-800 px-4 py-3 flex gap-2 animate-fade-in border-b">
          <AdminSearchInput
            value={o.searchQuery}
            onChange={o.setSearchQuery}
            placeholder="Search by order no, customer or phone..."
            className="flex-1 w-full"
          />
        </div>
      )}

      {/* Expanded Filters Panel */}
      {o.isFiltersExpanded && (
        <div className="bg-white dark:bg-[#16162a] border-x border-gray-200 dark:border-gray-800 px-4 py-3.5 flex flex-wrap items-center gap-3.5 animate-fade-in border-b">
          <AdminDateFilter
            value={o.dateFilter}
            onChange={o.setDateFilter}
            className="flex-1 sm:flex-initial"
            options={[
              { value: 'all', label: 'All Dates' },
              { value: 'today', label: 'Today' },
              { value: 'yesterday', label: 'Yesterday' },
              { value: 'tomorrow', label: 'Tomorrow' },
              { value: 'last7', label: 'Last 7 Days' },
              { value: 'last30', label: 'Last 30 Days' },
              { value: 'custom', label: 'Custom Range' }
            ]}
          />

          <div className="flex items-center gap-1.5 bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-1 flex-1 sm:flex-initial">
            <select
              value={o.statusFilter}
              onChange={(e) => o.setStatusFilter(e.target.value)}
              className="bg-transparent border-0 text-xs font-bold focus:outline-none text-gray-900 dark:text-white cursor-pointer py-1.5"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {o.dateFilter === 'custom' && (
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 ml-auto w-full sm:w-auto mt-2 sm:mt-0">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Range:</span>
              <input
                type="date"
                value={o.customStartDate}
                onChange={(e) => o.setCustomStartDate(e.target.value)}
                className="bg-transparent border-0 text-xs font-bold text-gray-900 dark:text-white focus:outline-none"
              />
              <span className="text-gray-400">—</span>
              <input
                type="date"
                value={o.customEndDate}
                onChange={(e) => o.setCustomEndDate(e.target.value)}
                className="bg-transparent border-0 text-xs font-bold text-gray-900 dark:text-white focus:outline-none"
              />
            </div>
          )}
        </div>
      )}

      {/* Bulk Actions Panel Overlay */}
      <OrderLogBulkActions
        selectedOrderIds={o.selectedOrderIds}
        setSelectedOrderIds={o.setSelectedOrderIds}
        handleBulkFulfil={o.handleBulkFulfil}
        handleBulkUnfulfil={o.handleBulkUnfulfil}
        handleBulkCancel={o.handleBulkCancel}
        handleBulkTrash={o.handleBulkDelete}
      />

      {/* Main Table Layout */}
      <OrderLogTable
        sortedOrders={o.sortedOrders}
        selectedOrderIds={o.selectedOrderIds}
        setSelectedOrderIds={o.setSelectedOrderIds}
        visibleColumns={o.visibleColumns}
        settings={settings}
        rowsPerPage={o.rowsPerPage}
        currentPage={o.currentPage}
        totalRows={o.totalRows}
        handleRowsPerPageChange={o.handleRowsPerPageChange}
        goToPage={o.goToPage}
      />

      {/* Hide scrollbar styling */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .filter-tabs-row::-webkit-scrollbar {
          display: none;
        }
        .filter-tabs-row {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      ` }} />

      {/* Order Creator Canvas Drawer */}
      <OrderCreateCanvas
        isOpen={o.isCreateCanvasOpen}
        onClose={() => o.setIsCreateCanvasOpen(false)}
        onOrderCreated={(newOrder) => {
          // Will be refetched by realtime or callback
        }}
        settings={settings}
      />
    </div>
  );
}
