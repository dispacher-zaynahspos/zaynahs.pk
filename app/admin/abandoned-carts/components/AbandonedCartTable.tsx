'use client';

import React, { useEffect } from 'react';
import EmptyState from '@/components/common/EmptyState';
import { ShoppingCart, Eye, Trash2, Calendar, Phone, ExternalLink } from '@/components/common/Icons';
import { timeAgo } from '@/lib/utils/dateFilters';
import { formatPrice } from '@/lib/utils/whatsapp';
import { AbandonedCart } from './AbandonedCartTypes';
import { saveAdminNavContext, getAdminNavContext, restoreAdminNavScrollAndHighlight } from '@/lib/hooks/useAdminNav';

interface AbandonedCartTableProps {
  loading: boolean;
  error?: boolean;
  onRetry?: () => void;
  filteredCarts: AbandonedCart[];
  paginatedCarts: AbandonedCart[];
  deleting: string | null;
  selectedCartId: string | null;
  setSelectedCartId: (id: string | null) => void;
  handleDelete: (id: string) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  getStatusBadgeStyles: (cart: AbandonedCart) => string;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: () => void;
}

export default function AbandonedCartTable({
  loading,
  error,
  onRetry,
  filteredCarts,
  paginatedCarts,
  deleting,
  selectedCartId,
  setSelectedCartId,
  handleDelete,
  currentPage,
  setCurrentPage,
  totalPages,
  getStatusBadgeStyles,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
}: AbandonedCartTableProps) {
  useEffect(() => {
    if (paginatedCarts.length > 0) {
      const ctx = getAdminNavContext('/admin/abandoned-carts');
      if (ctx?.lastOpenedId) {
        restoreAdminNavScrollAndHighlight('abandoned-cart-row', ctx.lastOpenedId, ctx.scrollPosition);
      }
    }
  }, [paginatedCarts]);
  if (loading) {
    return (
      <div className="bg-white dark:bg-[#16162a] rounded-b-xl border-x border-b border-gray-200 dark:border-gray-800 shadow-xs p-8 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800/60 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-[#16162a] rounded-b-xl border-x border-b border-gray-200 dark:border-gray-800 shadow-xs p-10 text-center space-y-3">
        <ShoppingCart className="h-8 w-8 text-gray-400 mx-auto" />
        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Couldn&apos;t load abandoned carts</p>
        <p className="text-xs text-gray-500">The request failed or timed out.</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-1 inline-flex items-center gap-2 rounded-xl bg-[#e94560] text-white px-4 py-2 text-xs font-bold cursor-pointer active:scale-95"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (filteredCarts.length === 0) {
    return (
      <div className="bg-white dark:bg-[#16162a] rounded-b-xl border-x border-b border-gray-200 dark:border-gray-800 shadow-xs">
        <EmptyState 
          icon={<ShoppingCart className="h-8 w-8 text-gray-400" />}
          title="No abandoned carts found" 
          description="Carts will appear here when checkout is started but not completed." 
        />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#16162a] rounded-b-xl border-x border-b border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden transition-colors">
      <div className="overflow-x-auto overscroll-x-contain overscroll-y-auto touch-pan-y">
        <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
          <thead className="hidden md:table-header-group text-[12.5px] font-semibold text-gray-500 bg-gray-50/50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800 select-none">
            <tr>
              <th className="py-3 px-4 w-10 text-center">
                <input
                  type="checkbox"
                  aria-label="Select all on this page"
                  checked={paginatedCarts.length > 0 && paginatedCarts.every(c => selectedIds.includes(c.id))}
                  onChange={onToggleSelectAll}
                  className="rounded border-gray-300 dark:border-gray-700 text-[#008060] focus:ring-[#008060] cursor-pointer"
                />
              </th>
              <th className="py-3 px-4 whitespace-nowrap min-w-[120px]">Cart / Shopper</th>
              <th className="py-3 px-4 whitespace-nowrap min-w-[110px]">Date / Activity</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4 whitespace-nowrap min-w-[110px]">Total Value</th>
              <th className="py-3 px-4">Recovery Status</th>
              <th className="py-3 px-4 min-w-[180px]">Items</th>
              <th className="py-3 px-4 text-center w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="block md:table-row-group">
            {paginatedCarts.map(cart => {
              const isSelected = selectedIds.includes(cart.id);
              const itemsCount = cart.items.reduce((acc, i) => acc + (i.quantity || 1), 0);
              const hasPhone = Boolean(cart.customerPhone);
              const rawPhone = (cart.customerPhone || '').replace(/\D/g, '');

              return (
                <tr
                  key={cart.id}
                  id={`abandoned-cart-row-${cart.id}`}
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      const container = document.getElementById('admin-main-content');
                      saveAdminNavContext({
                        sourceUrl: window.location.pathname + window.location.search,
                        currentPage: currentPage,
                        scrollPosition: container ? container.scrollTop : window.scrollY,
                        lastOpenedId: cart.id,
                      });
                    }
                    setSelectedCartId(cart.id);
                  }}
                  className={`block md:table-row mb-4 md:mb-0 border md:border-0 rounded-lg md:rounded-none shadow-sm md:shadow-none md:shadow-xs bg-white dark:bg-[#16162a] hover:bg-gray-50/50 dark:hover:bg-white/3 transition-all cursor-pointer align-middle ${
                    isSelected ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                  }`}
                >
                  {/* Checkbox & Mobile Header */}
                  <td className="block md:table-cell py-2 px-4 md:py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="md:hidden flex items-center justify-between mb-2">
                      <div className="inline-flex items-center gap-1.5 leading-none">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {cart.customerName ? `Cart: ${cart.customerName}` : `Cart #${cart.sessionId.slice(-6)}`}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${getStatusBadgeStyles(cart)}`}>
                          {cart.orderPlaced ? 'Recovered' : cart.emailSent ? 'Email Sent' : 'Pending'}
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect?.(cart.id)}
                        className="rounded border-gray-300 dark:border-gray-700 text-[#008060] focus:ring-[#008060] cursor-pointer"
                      />
                    </div>
                    <div className="hidden md:block text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect?.(cart.id)}
                        className="rounded border-gray-300 dark:border-gray-700 text-[#008060] focus:ring-[#008060] cursor-pointer"
                      />
                    </div>
                  </td>

                  {/* Cart / Shopper Column */}
                  <td className="block md:table-cell py-1 px-4 md:py-3">
                    <span className="md:hidden text-xs font-semibold text-gray-400 block mb-0.5">Shopper</span>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white truncate text-[13.5px]">
                        {cart.customerName || 'Anonymous Shopper'}
                      </p>
                      <p className="text-[11px] text-gray-400 font-mono truncate">
                        ID: {cart.sessionId.replace('cs_', '').slice(0, 10)}
                      </p>
                    </div>
                  </td>

                  {/* Date Column */}
                  <td className="block md:table-cell py-1 px-4 md:py-3 whitespace-nowrap">
                    <span className="md:hidden text-xs font-semibold text-gray-400 block mb-0.5">Last Activity</span>
                    <div className="text-xs text-gray-700 dark:text-gray-300">
                      <span>{new Date(cart.lastActivity).toLocaleDateString()}</span>
                      <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium block">
                        {timeAgo(cart.lastActivity)}
                      </span>
                    </div>
                  </td>

                  {/* Contact Column */}
                  <td className="block md:table-cell py-1 px-4 md:py-3" onClick={(e) => e.stopPropagation()}>
                    <span className="md:hidden text-xs font-semibold text-gray-400 block mb-0.5">Contact Info</span>
                    <div className="min-w-0 space-y-0.5">
                      {cart.customerPhone ? (
                        <a
                          href={`https://wa.me/${rawPhone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                          title="Contact via WhatsApp"
                        >
                          <Phone className="h-3 w-3 stroke-[2.2]" />
                          <span>{cart.customerPhone}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No phone captured</span>
                      )}
                      {cart.customerEmail && (
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-[160px]">
                          {cart.customerEmail}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Total Value Column */}
                  <td className="block md:table-cell py-1 px-4 md:py-3 whitespace-nowrap">
                    <span className="md:hidden text-xs font-semibold text-gray-400 block mb-0.5">Subtotal</span>
                    <span className="font-bold text-gray-900 dark:text-white text-[13.5px]">
                      {formatPrice(cart.subtotal)}
                    </span>
                    <span className="text-[10.5px] text-gray-400 block font-medium">
                      {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                    </span>
                  </td>

                  {/* Status Column */}
                  <td className="block md:table-cell py-1 px-4 md:py-3">
                    <span className="md:hidden text-xs font-semibold text-gray-400 block mb-0.5">Status</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeStyles(cart)}`}>
                      {cart.orderPlaced ? 'Recovered' : cart.emailSent ? 'Email Sent' : hasPhone ? 'Recoverable' : 'Anonymous'}
                    </span>
                  </td>

                  {/* Items Column (with single eye icon + pills like OrderLog) */}
                  <td className="block md:table-cell py-1 px-4 md:py-3">
                    <span className="md:hidden text-xs font-semibold text-gray-400 block mb-0.5">Items</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCartId(cart.id);
                        }}
                        className="p-1 rounded-md text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        title="View Cart Details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-xs text-gray-700 dark:text-gray-300 font-medium truncate max-w-[150px]">
                        {cart.items[0]?.product?.name || cart.items[0]?.name || 'Item'}
                        {cart.items.length > 1 ? ` +${cart.items.length - 1} more` : ''}
                      </span>
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td className="block md:table-cell py-2 px-4 md:py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end md:justify-center gap-2">
                      {hasPhone && (
                        <a
                          href={`https://wa.me/${rawPhone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 transition-colors"
                          title="Direct WhatsApp Recovery"
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(cart.id)}
                        disabled={deleting === cart.id}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all disabled:opacity-50"
                        title="Delete cart"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-white/2 text-xs">
          <button
            type="button"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] font-bold text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-2xs"
          >
            Previous
          </button>
          <span className="font-semibold text-gray-500 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] font-bold text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-2xs"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
