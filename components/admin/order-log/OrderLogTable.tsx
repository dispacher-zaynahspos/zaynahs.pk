'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EmptyState from '@/components/common/EmptyState';
import { Package, Eye, MessageSquare } from '@/components/common/Icons';
import { Order, StoreSettings } from '@/lib/types';
import { formatPrice } from '@/lib/utils/whatsapp';
import { getItemVariant } from '@/lib/utils/formatVariant';
import { isOrderPaid, isOrderUnfulfilled, getOrderPaymentMethod, getDeliveryStatus, hasTimelineNote, getTimelineNoteText, formatOrderDateTime } from './orderLogUtils';
import { OrderQuickViewModal } from './OrderQuickViewModal';
import { saveOrderNavContext, getOrderNavContext, restoreOrderScrollAndHighlight } from '@/lib/hooks/useOrderNav';

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
  const [quickViewOrder, setQuickViewOrder] = useState<Order | null>(null);

  // Restore scroll position and highlight last opened order row upon return navigation
  useEffect(() => {
    if (sortedOrders.length > 0) {
      const ctx = getOrderNavContext();
      if (ctx?.lastOpenedId) {
        restoreOrderScrollAndHighlight(ctx.lastOpenedId, ctx.scrollPosition);
      }
    }
  }, [sortedOrders]);

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

  const handleOrderClick = (order: Order) => {
    if (typeof window !== 'undefined') {
      const container = document.getElementById('admin-main-content');
      const scrollPos = container ? container.scrollTop : window.scrollY;
      saveOrderNavContext({
        ids: sortedOrders.map(o => o.id),
        lastOpenedId: order.id,
        scrollPosition: scrollPos,
        currentPage,
        rowsPerPage,
        sourceUrl: window.location.pathname + window.location.search,
      });

      try {
        const orderIds = sortedOrders.map(o => o.id);
        const ordersMap: Record<string, Order> = {};
        sortedOrders.slice(0, 100).forEach(o => {
          ordersMap[o.id] = o;
        });
        sessionStorage.setItem('admin_active_orders_cache', JSON.stringify({
          orderIds,
          orders: ordersMap,
          timestamp: Date.now(),
        }));
      } catch {
        // ignore
      }
    }
    router.push(`/admin/orders/detail?id=${order.id}`);
  };

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      const container = document.getElementById('admin-main-content');
      if (container) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="bg-white dark:bg-[#16162a] rounded-b-xl border-x border-b border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden transition-colors">
      {/* Desktop Table (Zero Horizontal Scroll with table-fixed) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full table-fixed text-left text-sm text-gray-700 dark:text-gray-300">
          <thead className="text-[12px] font-semibold text-gray-500 bg-gray-50/50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800 select-none">
            <tr>
              <th className="py-2.5 px-2 w-9 text-center shrink-0">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedOrderIds.length > 0 && selectedOrderIds.length === sortedOrders.length}
                  className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-3.5 w-3.5 cursor-pointer accent-[#e94560]"
                />
              </th>
              {visibleColumns.includes('order') && <th className="py-2.5 px-2.5 w-28 whitespace-nowrap">Order</th>}
              {visibleColumns.includes('date') && <th className="py-2.5 px-2 w-24">Date</th>}
              {visibleColumns.includes('customer') && <th className="py-2.5 px-2.5 min-w-0">Customer</th>}
              {visibleColumns.includes('channel') && <th className="py-2.5 px-2 hidden 2xl:table-cell w-24">Channel</th>}
              {visibleColumns.includes('total') && <th className="py-2.5 px-2 w-24 whitespace-nowrap">Total</th>}
              {visibleColumns.includes('paymentStatus') && <th className="py-2.5 px-2 w-24">Payment status</th>}
              {visibleColumns.includes('fulfillmentStatus') && <th className="py-2.5 px-2 w-28">Fulfillment status</th>}
              {visibleColumns.includes('items') && <th className="py-2.5 px-2 w-20">Items</th>}
              {visibleColumns.includes('deliveryStatus') && <th className="py-2.5 px-2 hidden lg:table-cell w-28">Delivery status</th>}
              {visibleColumns.includes('paymentMethod') && <th className="py-2.5 px-2 hidden xl:table-cell w-28">Payment Method</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 font-medium">
            {sortedOrders.map(order => (
              <tr
                key={order.id}
                id={`order-row-${order.id}`}
                onClick={() => handleOrderClick(order)}
                className="hover:bg-gray-50/50 dark:hover:bg-white/3 transition-all cursor-pointer align-middle"
              >
                <td className="py-2.5 px-2 w-9 text-center shrink-0" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedOrderIds.includes(order.id)}
                    onChange={(e) => handleSelectOrder(order.id, e.target.checked)}
                    className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-3.5 w-3.5 cursor-pointer accent-[#e94560]"
                  />
                </td>
                {visibleColumns.includes('order') && (
                  <td className="py-2.5 px-2.5 whitespace-nowrap w-28">
                    <div className="inline-flex items-center gap-1.5 leading-none">
                      <span className="text-[#2c6ecb] font-semibold hover:underline">
                        {order.order_number}
                      </span>
                      {hasTimelineNote(order) ? (
                        <span 
                          title={`Timeline Note: ${getTimelineNoteText(order)}`} 
                          className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/30 shrink-0 self-center transition-transform hover:scale-110 shadow-2xs cursor-help"
                        >
                          <MessageSquare className="w-2.5 h-2.5 stroke-[2.2]" />
                        </span>
                      ) : null}
                    </div>
                  </td>
                )}
                {visibleColumns.includes('date') && (
                  <td className="py-2.5 px-2 text-xs text-gray-500 font-medium w-28 whitespace-nowrap" suppressHydrationWarning>
                    <div suppressHydrationWarning className="leading-tight">
                      <span className="font-semibold text-gray-900 dark:text-gray-100 block">
                        {formatOrderDateTime(order.created_at).date}
                      </span>
                      <span className="text-[11px] text-gray-400 dark:text-gray-500 block font-mono">
                        {formatOrderDateTime(order.created_at).time}
                      </span>
                    </div>
                  </td>
                )}
                {visibleColumns.includes('customer') && (
                  <td className="py-2.5 px-2.5 font-medium text-gray-900 dark:text-white min-w-0">
                    <span className="truncate block font-semibold text-xs md:text-sm">
                      {order.customer_name || 'Guest'}
                    </span>
                  </td>
                )}
                {visibleColumns.includes('channel') && (
                  <td className="py-2.5 px-2 text-xs text-gray-500 hidden 2xl:table-cell w-24">
                    Online Store
                  </td>
                )}
                {visibleColumns.includes('total') && (
                  <td className="py-2.5 px-2 whitespace-nowrap w-24 font-black text-gray-900 dark:text-white text-xs md:text-sm">
                    {formatPrice(order.total, settings.currency_symbol)}
                  </td>
                )}
                {visibleColumns.includes('paymentStatus') && (
                  <td className="py-2.5 px-2 w-24">
                    {isOrderPaid(order) ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-[#008060] flex-shrink-0" />
                        Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                        <span className="w-2 h-2 rounded-full bg-[#b98900] flex-shrink-0" />
                        Unpaid
                      </span>
                    )}
                  </td>
                )}
                {visibleColumns.includes('fulfillmentStatus') && (
                  <td className="py-2.5 px-2 w-28">
                    {order.status === 'cancelled' ? (
                      <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full px-2 py-0.5 text-[11px] font-bold border border-red-200 dark:border-red-800">
                        <span className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400 flex-shrink-0" />
                        Cancelled
                      </span>
                    ) : isOrderUnfulfilled(order) ? (
                      <span className="inline-flex items-center gap-1.5 bg-[#fff4c4] text-[#7c5c00] rounded-full px-2 py-0.5 text-[11px] font-bold">
                        <span className="w-2 h-2 rounded-full border-[1.5px] border-[#b98900] flex items-center justify-center flex-shrink-0">
                          <span className="text-[6px] leading-none text-[#b98900] font-normal">○</span>
                        </span>
                        Unfulfilled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-[#d4edda] text-[#2d6a4f] rounded-full px-2 py-0.5 text-[11px] font-bold">
                        <span className="text-[9px] leading-none">✓</span>
                        Fulfilled
                      </span>
                    )}
                  </td>
                )}
                {visibleColumns.includes('items') && (
                  <td className="py-2.5 px-2 text-xs text-gray-500 whitespace-nowrap w-20">
                    <div className="inline-flex items-center gap-1.5">
                      <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickViewOrder(order);
                        }}
                        className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer shrink-0"
                        title="Quick preview articles & variations"
                        aria-label="Quick preview articles"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                )}
                {visibleColumns.includes('deliveryStatus') && (
                  <td className="py-2.5 px-2 text-xs text-gray-500 font-medium hidden lg:table-cell w-28 truncate">
                    {order.tracking_number ? (
                      <a
                        href={order.tracking_url || `https://postex.pk/tracking?cn=${encodeURIComponent(order.tracking_number)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title="Track directly on courier portal"
                        className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <span>TRK: {order.tracking_number}</span>
                      </a>
                    ) : (
                      getDeliveryStatus(order.status)
                    )}
                  </td>
                )}
                {visibleColumns.includes('paymentMethod') && (
                  <td className="py-2.5 px-2 text-xs text-gray-500 hidden xl:table-cell w-28 truncate">
                    {getOrderPaymentMethod(order)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Shopify-Style Native Order Cards (<860px) */}
      <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800/80">
        {sortedOrders.map(order => (
          <div
            key={order.id}
            id={`order-card-mobile-${order.id}`}
            onClick={() => handleOrderClick(order)}
            className="p-3.5 space-y-2 bg-white dark:bg-[#16162a] active:bg-gray-50/80 dark:active:bg-white/5 transition-colors cursor-pointer"
          >
            {/* Header: Order Number + Date + Checkbox */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-extrabold text-sm text-[#2c6ecb] dark:text-blue-400">
                  {order.order_number}
                </span>
                {hasTimelineNote(order) && (
                  <span title={getTimelineNoteText(order)} className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
                    <MessageSquare className="w-2.5 h-2.5 stroke-[2.2]" />
                  </span>
                )}
                <span className="text-[11px] text-gray-300 dark:text-gray-600">•</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap" suppressHydrationWarning>
                  {formatOrderDateTime(order.created_at).full}
                </span>
              </div>
              <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <input
                  type="checkbox"
                  checked={selectedOrderIds.includes(order.id)}
                  onChange={(e) => handleSelectOrder(order.id, e.target.checked)}
                  className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer accent-[#e94560]"
                />
              </div>
            </div>

            {/* Line 2: Customer Name & Order Total */}
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
                {order.customer_name || 'Guest'}
              </span>
              <span className="font-black text-sm text-gray-900 dark:text-white whitespace-nowrap">
                {formatPrice(order.total, settings.currency_symbol)}
              </span>
            </div>

            {/* Line 3: Status Pills + Items Quick View */}
            <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-800/80">
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Fulfillment Status */}
                {order.status === 'cancelled' ? (
                  <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full px-2 py-0.5 text-[11px] font-bold">
                    Cancelled
                  </span>
                ) : isOrderUnfulfilled(order) ? (
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 rounded-full px-2 py-0.5 text-[11px] font-bold border border-amber-200 dark:border-amber-800/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Unfulfilled
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-full px-2 py-0.5 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Fulfilled
                  </span>
                )}

                {/* Payment Status */}
                {isOrderPaid(order) ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 rounded-full px-2 py-0.5 text-[11px] font-semibold border border-emerald-200/60">
                    Paid
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 rounded-full px-2 py-0.5 text-[11px] font-semibold border border-amber-200/60">
                    Unpaid
                  </span>
                )}
              </div>

              {/* Items Counter with Quick View Eye */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-semibold">
                <span>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuickViewOrder(order);
                  }}
                  className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Quick Preview"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span className="font-medium">Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              handleRowsPerPageChange(Number(e.target.value));
              scrollToTop();
            }}
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
            onClick={() => {
              goToPage(currentPage - 1);
              scrollToTop();
            }}
            disabled={currentPage === 1}
            className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          <button
            onClick={() => {
              goToPage(currentPage + 1);
              scrollToTop();
            }}
            disabled={currentPage * rowsPerPage >= totalRows}
            className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      </div>

      <OrderQuickViewModal
        order={quickViewOrder}
        ordersList={sortedOrders}
        onSelectOrder={setQuickViewOrder}
        open={!!quickViewOrder}
        onClose={() => setQuickViewOrder(null)}
        settings={settings}
      />
    </div>
  );
}
