'use client';

import React from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Package, 
  ShoppingBag, 
  Clock, 
  Mail, 
  CheckCircle2, 
  Trash2, 
  User as UserIcon, 
  ExternalLink 
} from '@/components/common/Icons';
import { formatPrice } from '@/lib/utils/whatsapp';
import { AbandonedCart } from './AbandonedCartTypes';

interface AbandonedCartDetailDrawerProps {
  selectedCart: AbandonedCart | null;
  setSelectedCartId: (id: string | null) => void;
  selectedCartIndex: number;
  filteredCarts: AbandonedCart[];
  copiedId: string | null;
  deleting: string | null;
  handleCopyDetails: (cart: AbandonedCart) => void;
  handlePrevCart: () => void;
  handleNextCart: () => void;
  handleDelete: (id: string) => void;
  getStatusBadgeStyles: (cart: AbandonedCart) => string;
}

export default function AbandonedCartDetailDrawer({
  selectedCart,
  setSelectedCartId,
  selectedCartIndex,
  filteredCarts,
  copiedId,
  deleting,
  handleCopyDetails,
  handlePrevCart,
  handleNextCart,
  handleDelete,
  getStatusBadgeStyles,
}: AbandonedCartDetailDrawerProps) {
  if (!selectedCart) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-45 transition-opacity animate-fade-in"
        onClick={() => setSelectedCartId(null)}
      />

      {/* Drawer Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-4xl bg-gray-50 dark:bg-[#0f0f1e] shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-800 transition-transform duration-300 translate-x-0 overflow-hidden">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white dark:bg-[#16162a] border-b border-gray-200 dark:border-gray-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedCartId(null)}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white whitespace-nowrap truncate">
                  Cart Detail
                </h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border whitespace-nowrap ${getStatusBadgeStyles(selectedCart)}`}>
                  {selectedCart.orderPlaced ? 'Recovered' : selectedCart.emailSent ? 'Emailed' : 'Pending'}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-semibold mt-0.5">
                Created: {new Date(selectedCart.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Header Navigation & Action Panel */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => handleCopyDetails(selectedCart)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] text-[10px] sm:text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors whitespace-nowrap shrink-0"
            >
              {copiedId === selectedCart.id ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Copy Cart Info</span>
                  <span className="inline sm:hidden">Copy Info</span>
                </>
              )}
            </button>

            <div className="h-6 w-[1px] bg-gray-200 dark:bg-gray-800 mx-1" />

            <button
              onClick={handlePrevCart}
              disabled={selectedCartIndex <= 0}
              className="p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] text-gray-550 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Previous Cart"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNextCart}
              disabled={selectedCartIndex < 0 || selectedCartIndex >= filteredCarts.length - 1}
              className="p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] text-gray-550 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Next Cart"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 overscroll-contain pb-24 sm:pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left/Main Column - Items & Totals (2 columns) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Items Card */}
              <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800/80 flex items-center gap-2">
                  <Package className="h-4.5 w-4.5 text-gray-400" />
                  <h3 className="text-sm font-black text-gray-900 dark:text-white">
                    Items Left in Cart ({selectedCart.items.length})
                  </h3>
                </div>
                
                <div className="divide-y divide-gray-100 dark:divide-gray-800/60 px-5">
                  {selectedCart.items.map((item, idx) => {
                    const variantParts = [];
                    if (item.selectedVariant?.color) variantParts.push(item.selectedVariant.color);
                    if (item.selectedVariant?.size) variantParts.push(item.selectedVariant.size);
                    const variantStr = variantParts.join(', ');
                    
                    const imgUrl = item.product?.images?.[0]?.url || '';

                    return (
                      <div key={idx} className="py-4 flex gap-4 items-start animate-fade-in">
                        {/* Product Thumbnail */}
                        <div className="h-14 w-14 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 overflow-hidden flex-shrink-0 relative">
                          {imgUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={imgUrl}
                              alt={item.product?.name || 'Product'}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                              <ShoppingBag className="h-6 w-6" />
                            </div>
                          )}
                        </div>

                        {/* Item details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2">
                            {item.product?.name || 'Product'}
                          </h4>
                          {variantStr && (
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold mt-0.5">
                              {variantStr}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-semibold">
                            {formatPrice(item.price || item.product?.price || 0)} × {item.quantity}
                          </p>
                        </div>

                        {/* Line Total */}
                        <div className="text-right">
                          <span className="text-xs font-black text-gray-900 dark:text-white">
                            {formatPrice((item.price || item.product?.price || 0) * item.quantity)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pricing / Value Summary */}
              <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs p-5 space-y-3">
                <h3 className="text-sm font-black text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-gray-800/80">
                  Cart Value Summary
                </h3>
                
                <div className="space-y-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Cart Subtotal</span>
                    <span className="text-gray-900 dark:text-white font-bold">
                      {formatPrice(selectedCart.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Currency Context</span>
                    <span className="text-gray-900 dark:text-white font-bold">{selectedCart.currency}</span>
                  </div>
                  <div className="h-[1px] bg-gray-100 dark:bg-gray-800/80 my-1" />
                  <div className="flex justify-between text-sm font-black text-gray-900 dark:text-white">
                    <span>Total Estimated Value</span>
                    <span>{formatPrice(selectedCart.subtotal)}</span>
                  </div>
                </div>
              </div>

              {/* History & Recovery Log */}
              <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs p-5 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800/80">
                  <Clock className="h-4.5 w-4.5 text-gray-400" />
                  <h3 className="text-sm font-black text-gray-900 dark:text-white">
                    Activity & Recovery Timeline
                  </h3>
                </div>

                <div className="flow-root pl-2">
                  <ul className="space-y-4">
                    <li className="relative flex space-x-3 items-start">
                      <span className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
                        <ShoppingBag className="h-3 w-3" />
                      </span>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Cart Created</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-semibold">{new Date(selectedCart.createdAt).toLocaleString()}</p>
                      </div>
                    </li>

                    <li className="relative flex space-x-3 items-start">
                      <span className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${selectedCart.emailSent ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                        <Mail className="h-3 w-3" />
                      </span>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                          {selectedCart.emailSent ? 'Recovery Email Dispatched' : 'Recovery Email Pending'}
                        </p>
                        {selectedCart.emailSentAt && (
                          <p className="text-[10px] text-gray-400 mt-0.5 font-semibold">{new Date(selectedCart.emailSentAt).toLocaleString()}</p>
                        )}
                      </div>
                    </li>

                    <li className="relative flex space-x-3 items-start">
                      <span className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${selectedCart.orderPlaced ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                        <CheckCircle2 className="h-3 w-3" />
                      </span>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                          {selectedCart.orderPlaced ? 'Cart Recovered (Order Placed)' : 'Not Yet Recovered'}
                        </p>
                        {selectedCart.recoveredAt && (
                          <p className="text-[10px] text-gray-400 mt-0.5 font-semibold">{new Date(selectedCart.recoveredAt).toLocaleString()}</p>
                        )}
                        {selectedCart.orderId && (
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-bold">
                            Order ID: {selectedCart.orderId}
                          </p>
                        )}
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

            </div>

            {/* Right Column - Customer Info & Address (1 column) */}
            <div className="space-y-6">
              
              {/* Action Pane */}
              <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs p-5 space-y-4">
                <h3 className="text-sm font-black text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-800/80">
                  Record Actions
                </h3>
                <button
                  onClick={() => handleDelete(selectedCart.id)}
                  disabled={deleting === selectedCart.id}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer border-none"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Cart Record</span>
                </button>
              </div>

              {/* Customer & Shipping Address details */}
              <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800/80">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4.5 w-4.5 text-gray-400" />
                    <h3 className="text-sm font-black text-gray-900 dark:text-white">Customer Details</h3>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30">
                    Active Shopper
                  </span>
                </div>
                
                <div className="space-y-4 text-xs font-semibold">
                  {/* Name */}
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Name</div>
                    <div className="text-xs font-black text-gray-900 dark:text-white mt-1">
                      {selectedCart.customerName || 'Anonymous Shopper'}
                    </div>
                  </div>
                  
                  {/* Contact & WhatsApp */}
                  {selectedCart.customerPhone && (
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contact Phone</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-gray-800 dark:text-gray-200 font-bold">{selectedCart.customerPhone}</span>
                        <a 
                          href={`https://wa.me/${selectedCart.customerPhone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-0.5 ml-1"
                        >
                          <span>WhatsApp</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  {selectedCart.customerEmail && (
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</div>
                      <div className="text-xs font-black text-gray-900 dark:text-white mt-1 truncate">
                        {selectedCart.customerEmail}
                      </div>
                    </div>
                  )}

                  {/* Complete Address Mapped exactly like orders tab */}
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Complete Shipping Address</div>
                    <div className="mt-1.5 p-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-150 dark:border-gray-800 rounded-xl text-gray-700 dark:text-gray-300 leading-relaxed font-bold break-words whitespace-pre-wrap">
                      {(() => {
                        const addressParts = [
                          selectedCart.customerAddress ? `Address: ${selectedCart.customerAddress}` : '',
                          selectedCart.customerApartment ? `Apt/Suite: ${selectedCart.customerApartment}` : '',
                          selectedCart.customerCity ? `City: ${selectedCart.customerCity}` : '',
                          selectedCart.customerPostalCode ? `Postal: ${selectedCart.customerPostalCode}` : '',
                          selectedCart.customerPhone ? `Phone: ${selectedCart.customerPhone}` : '',
                          selectedCart.customerEmail ? `Contact: ${selectedCart.customerEmail}` : '',
                        ].filter(Boolean);
                        return addressParts.length > 0 
                          ? addressParts.join('\n') 
                          : 'No address details entered by shopper yet.';
                      })()}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
