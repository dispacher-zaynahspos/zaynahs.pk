'use client';

import React from 'react';
import EmptyState from '@/components/common/EmptyState';
import { ShoppingCart, ExternalLink, Trash2, Calendar } from '@/components/common/Icons';
import { timeAgo } from '@/lib/utils/dateFilters';
import { formatPrice } from '@/lib/utils/whatsapp';
import { AbandonedCart } from './AbandonedCartTypes';

interface AbandonedCartTableProps {
  loading: boolean;
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
}

export default function AbandonedCartTable({
  loading,
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
}: AbandonedCartTableProps) {
  return (
    <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
      {loading ? (
        <div className="p-8 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredCarts.length === 0 ? (
        <EmptyState 
          icon={<ShoppingCart className="h-8 w-8 text-gray-400" />}
          title="No matching abandoned carts found" 
          description="Carts will appear here when checkout is started but not completed" 
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
                <thead className="text-[11px] font-bold text-gray-400 uppercase bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="py-2.5 px-3">Cart / Session</th>
                    <th className="py-2.5 px-3">Customer Info</th>
                    <th className="py-2.5 px-3">Items Left</th>
                    <th className="py-2.5 px-3">Subtotal</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Last Activity</th>
                    <th className="py-2.5 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
                  {paginatedCarts.map(cart => (
                    <tr 
                      key={cart.id} 
                      onClick={() => setSelectedCartId(cart.id)}
                      className="hover:bg-gray-50/50 dark:hover:bg-white/3 transition-all align-top cursor-pointer text-xs"
                    >
                      {/* Session/Cart ID */}
                      <td className="py-2.5 px-3 font-bold text-[#1a1a2e] dark:text-white max-w-[130px] truncate">
                        {cart.customerName ? `Cart of ${cart.customerName}` : cart.sessionId.replace('cs_', '')}
                      </td>

                      {/* Customer Info */}
                      <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                        <p className="font-bold text-[#1a1a2e] dark:text-white">{cart.customerName || 'Anonymous'}</p>
                        {cart.customerPhone && (
                          <a 
                            href={`https://wa.me/${cart.customerPhone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-[#10b981] hover:underline font-semibold flex items-center gap-1 mt-0.5"
                          >
                            <span>{cart.customerPhone}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {cart.customerEmail && (
                          <span className="text-[11px] text-gray-400 dark:text-gray-500 font-semibold block">{cart.customerEmail}</span>
                        )}
                      </td>

                      {/* Items left */}
                      <td className="py-2.5 px-3 max-w-[200px]">
                        <div className="space-y-0.5">
                          {cart.items.map((item, idx) => {
                            const variantParts = [];
                            if (item.selectedVariant?.color) variantParts.push(item.selectedVariant.color);
                            if (item.selectedVariant?.size) variantParts.push(item.selectedVariant.size);
                            const variantStr = variantParts.length ? ` (${variantParts.join(', ')})` : '';
                            return (
                              <div key={idx} className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 line-clamp-1">
                                • {item.product?.name || 'Product'}{variantStr} x{item.quantity}
                              </div>
                            );
                          })}
                        </div>
                      </td>

                      {/* Subtotal */}
                      <td className="py-2.5 px-3 font-bold text-[#1a1a2e] dark:text-white whitespace-nowrap">
                        {formatPrice(cart.subtotal)}
                      </td>

                      {/* Status badge */}
                      <td className="py-2.5 px-3">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${getStatusBadgeStyles(cart)}`}>
                          {cart.orderPlaced ? 'Recovered' : cart.emailSent ? 'Email Sent' : 'Pending'}
                        </span>
                      </td>

                      {/* Last Activity */}
                      <td className="py-2.5 px-3 text-[11px] text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
                        {new Date(cart.lastActivity).toLocaleDateString()}<br />
                        <span className="text-gray-400 dark:text-gray-500 font-semibold">{timeAgo(cart.lastActivity)}</span>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleDelete(cart.id)}
                          disabled={deleting === cart.id}
                          className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                          title="Delete cart record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800/80">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 disabled:opacity-50"
                >Previous</button>
                <span className="text-xs font-semibold text-gray-400">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 disabled:opacity-50"
                >Next</button>
              </div>
            )}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3 p-4">
            {paginatedCarts.map(cart => (
              <div
                key={cart.id}
                onClick={() => setSelectedCartId(cart.id)}
                className="bg-white dark:bg-[#16162a] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-2.5 cursor-pointer transition-colors active:scale-[0.99]"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-[#1a1a2e] dark:text-white truncate">{cart.customerName || 'Anonymous'}</p>
                    {cart.customerPhone && <p className="text-[10px] text-[#10b981] font-semibold mt-0.5">{cart.customerPhone}</p>}
                    {cart.customerEmail && <p className="text-[10px] text-gray-400 font-semibold">{cart.customerEmail}</p>}
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-sm font-black text-[#1a1a2e] dark:text-white">{formatPrice(cart.subtotal)}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase border ${getStatusBadgeStyles(cart)}`}>
                      {cart.orderPlaced ? 'Recovered' : cart.emailSent ? 'Email Sent' : 'Pending'}
                    </span>
                  </div>
                </div>
                <div className="text-[10px] text-gray-400 font-semibold">
                  {cart.items.length} item{cart.items.length !== 1 ? 's' : ''} in cart
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800/60">
                  <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                    <Calendar className="h-3 w-3" />
                    <span>{timeAgo(cart.lastActivity)}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(cart.id); }}
                    disabled={deleting === cart.id}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                    title="Delete cart"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800/60 mt-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center px-4 py-2 rounded-lg bg-gray-50 dark:bg-white/5 text-xs font-bold text-gray-600 dark:text-gray-300 disabled:opacity-50 border border-gray-200 dark:border-gray-800"
                >Previous</button>
                <span className="text-xs font-semibold text-gray-400">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center px-4 py-2 rounded-lg bg-gray-50 dark:bg-white/5 text-xs font-bold text-gray-600 dark:text-gray-300 disabled:opacity-50 border border-gray-200 dark:border-gray-800"
                >Next</button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
