'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import EmptyState from '@/components/common/EmptyState';
import { Package } from '@/components/common/Icons';
import { Order, StoreSettings } from '@/lib/types';
import { formatPrice } from '@/lib/utils/whatsapp';
import { isOrderPaid, getOrderPaymentMethod, getDeliveryStatus } from './orderLogUtils';

interface OrderLogTableProps {
  sortedOrders: Order[];
  selectedOrderIds: string[];
  setSelectedOrderIds: React.Dispatch<React.SetStateAction<string[]>>;
  visibleColumns: string[];
  settings: StoreSettings;
  rowsPerPage: number;
  currentPage: number;
  totalRows: number;
  handleRowsPerPageChange: (newRpp: number) => void;
  goToPage: (page: number) => void;
}

export function OrderLogTable({
  sortedOrders,
  selectedOrderIds,
  setSelectedOrderIds,
  visibleColumns,
  settings,
  rowsPerPage,
  currentPage,
  totalRows,
  handleRowsPerPageChange,
  goToPage,
}: OrderLogTableProps) {
  const router = useRouter();

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrderIds(sortedOrders.map(o => o.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleSelectOrder = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(prev => [...prev, id]);
    } else {
      setSelectedOrderIds(prev => prev.filter(item => item !== id));
    }
  };

  if (sortedOrders.length === 0) {
    return (
      <div className="bg-white dark:bg-[#16162a] rounded-b-xl border border-t-0 border-gray-200 dark:border-gray-800 shadow-xs">
        <EmptyState 
          icon={<Package className="h-8 w-8 text-gray-400" />}
          title="No orders found" 
          description="No orders found matching your criteria." 
        />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#16162a] rounded-b-xl border-x border-b border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
          <thead className="hidden md:table-header-group text-[12.5px] font-semibold text-gray-500 bg-gray-50/50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800 select-none">
            <tr>
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedOrderIds.length > 0 && selectedOrderIds.length === sortedOrders.length}
                />
              </th>
              {visibleColumns.includes('order') && <th className="py-3 px-4 whitespace-nowrap min-w-[100px]">Order</th>}
              {visibleColumns.includes('date') && <th className="py-3 px-4">Date</th>}
              {visibleColumns.includes('customer') && <th className="py-3 px-4">Customer</th>}
              {visibleColumns.includes('channel') && <th className="py-3 px-4">Channel</th>}
              {visibleColumns.includes('total') && <th className="py-3 px-4 whitespace-nowrap min-w-[120px]">Total</th>}
              {visibleColumns.includes('paymentStatus') && <th className="py-3 px-4">Payment status</th>}
              {visibleColumns.includes('fulfillmentStatus') && <th className="py-3 px-4">Fulfillment status</th>}
              {visibleColumns.includes('items') && <th className="py-3 px-4">Items</th>}
              {visibleColumns.includes('deliveryStatus') && <th className="py-3 px-4">Delivery status</th>}
              {visibleColumns.includes('paymentMethod') && <th className="py-3 px-4">Payment Method</th>}
            </tr>
          </thead>
          <tbody className="block md:table-row-group">
            {sortedOrders.map(order => (
              <tr
                key={order.id}
                onClick={() => router.push(`/admin/orders/detail?id=${order.id}`)}
                className="block md:table-row mb-4 md:mb-0 border md:border-0 rounded-lg md:rounded-none shadow-sm md:shadow-none md:shadow-xs bg-white dark:bg-[#16162a] hover:bg-gray-50/50 dark:hover:bg-white/3 transition-all cursor-pointer align-middle"
              >
                <td className="block md:table-cell py-2 px-4 md:py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="md:hidden flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900 dark:text-white">Order {order.orderNumber}</span>
                    <input
                      type="checkbox"
                      checked={selectedOrderIds.includes(order.id)}
                      onChange={(e) => handleSelectOrder(order.id, e.target.checked)}
                    />
                  </div>
                  <div className="hidden md:block">
                    <input
                      type="checkbox"
                      checked={selectedOrderIds.includes(order.id)}
                      onChange={(e) => handleSelectOrder(order.id, e.target.checked)}
                    />
                  </div>
                </td>
                {visibleColumns.includes('order') && (
                  <td className="hidden md:table-cell py-3 px-4 whitespace-nowrap min-w-[100px]">
                    <span className="text-[#2c6ecb] font-semibold hover:underline">
                      {order.orderNumber}
                    </span>
                  </td>
                )}
                {visibleColumns.includes('date') && (
                  <td className="block md:table-cell py-1 px-4 md:py-3 text-xs text-gray-500 font-medium">
                    <span className="md:hidden font-semibold text-gray-400 mr-2">Date:</span>
                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                )}
                {visibleColumns.includes('customer') && (
                  <td className="block md:table-cell py-1 px-4 md:py-3 font-medium text-gray-900 dark:text-white">
                    <span className="md:hidden font-semibold text-gray-400 mr-2">Customer:</span>
                    {order.customerName || 'Guest'}
                  </td>
                )}
                {visibleColumns.includes('channel') && (
                  <td className="md:table-cell py-1 px-4 md:py-3 text-xs text-gray-500 hidden md:block">
                    Online Store
                  </td>
                )}
                {visibleColumns.includes('total') && (
                  <td className="block md:table-cell py-1 px-4 md:py-3 whitespace-nowrap min-w-[120px] font-semibold text-gray-900 dark:text-white">
                    <span className="md:hidden font-semibold text-gray-400 mr-2">Total:</span>
                    {formatPrice(order.total, settings.currencySymbol)}
                  </td>
                )}
                {visibleColumns.includes('paymentStatus') && (
                  <td className="block md:table-cell py-1 px-4 md:py-3">
                    <span className="md:hidden font-semibold text-gray-400 mr-2">Payment:</span>
                    {isOrderPaid(order) ? (
                      <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-800 dark:text-gray-200">
                        <span className="w-2 h-2 rounded-full bg-[#008060] flex-shrink-0" />
                        Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-800 dark:text-gray-200">
                        <span className="w-2 h-2 rounded-full bg-[#b98900] flex-shrink-0" />
                        Unpaid
                      </span>
                    )}
                  </td>
                )}
                {visibleColumns.includes('fulfillmentStatus') && (
                  <td className="block md:table-cell py-1 px-4 md:py-3">
                    <span className="md:hidden font-semibold text-gray-400 mr-2">Fulfillment:</span>
                    {order.status === 'cancelled' ? (
                      <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded px-2 py-0.5 text-[12px] font-bold border border-red-200 dark:border-red-800">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 dark:bg-red-400 flex-shrink-0" />
                        Cancelled
                      </span>
                    ) : ['pending', 'placed', 'confirmed'].includes(order.status) ? (
                      <span className="inline-flex items-center gap-1.5 bg-[#fff4c4] text-[#7c5c00] rounded px-2 py-0.5 text-[12px] font-bold">
                        <span className="w-2.5 h-2.5 rounded-full border-[1.5px] border-[#b98900] flex items-center justify-center flex-shrink-0">
                          <span className="text-[7px] leading-none text-[#b98900] font-normal">○</span>
                        </span>
                        Unfulfilled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-[#d4edda] text-[#2d6a4f] rounded px-2 py-0.5 text-[12px] font-bold">
                        <span className="text-[9px] leading-none">✓</span>
                        Fulfilled
                      </span>
                    )}
                  </td>
                )}
                {visibleColumns.includes('items') && (
                  <td className="block md:table-cell py-1 px-4 md:py-3 text-xs text-gray-500">
                    <span className="md:hidden font-semibold text-gray-400 mr-2">Items:</span>
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </td>
                )}
                {visibleColumns.includes('deliveryStatus') && (
                  <td className="block md:table-cell py-1 px-4 md:py-3 text-xs text-gray-500 font-medium">
                    <span className="md:hidden font-semibold text-gray-400 mr-2">Delivery:</span>
                    {getDeliveryStatus(order.status)}
                  </td>
                )}
                {visibleColumns.includes('paymentMethod') && (
                  <td className="block md:table-cell py-1 px-4 md:py-3 text-xs text-gray-500">
                    <span className="md:hidden font-semibold text-gray-400 mr-2">Payment method:</span>
                    {getOrderPaymentMethod(order)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-medium">Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
              className="bg-transparent border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 text-xs font-semibold text-gray-700 dark:text-gray-200 focus:outline-none cursor-pointer"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>

          <span className="font-medium">
            {totalRows > 0
              ? `${(currentPage - 1) * rowsPerPage + 1}-${Math.min(currentPage * rowsPerPage, totalRows)} of ${totalRows}`
              : `${sortedOrders.length} result${sortedOrders.length !== 1 ? 's' : ''}`
            }
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage * rowsPerPage >= totalRows}
              className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
