import React from 'react';
import Image from 'next/image';
import { ShoppingBag, X, Package, Calendar, ChevronUp, ChevronDown, MapPin, Truck } from '@/components/common/Icons';
import EmptyState from '@/components/common/EmptyState';
import { Order } from '@/lib/types';
import { formatPrice } from '@/lib/utils/whatsapp';
import { CustomerRecord } from './types';

interface CustomerOrdersModalProps {
  selectedCustomer: CustomerRecord;
  customerOrders: Order[];
  ordersLoading: boolean;
  expandedOrderId: string | null;
  setExpandedOrderId: React.Dispatch<React.SetStateAction<string | null>>;
  onClose: () => void;
}

export default function CustomerOrdersModal({
  selectedCustomer,
  customerOrders,
  ordersLoading,
  expandedOrderId,
  setExpandedOrderId,
  onClose,
}: CustomerOrdersModalProps) {
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':    return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/30';
      case 'confirmed':  return 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-900/30';
      case 'shipped':    return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/30';
      case 'delivered':  return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/30';
      case 'cancelled':  return 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/30';
      default:           return 'bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-300 border border-gray-200 dark:border-gray-700/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 " onClick={onClose} />

      {/* Modal Panel */}
      <div className="relative w-full sm:max-w-2xl max-h-[80vh] flex flex-col bg-gray-50 dark:bg-[#0f0f1b] sm:rounded-3xl rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex-shrink-0 px-5 pt-5 pb-4 bg-white dark:bg-[#16162a] border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-[#e94560]" />
              {selectedCustomer.name}&apos;s Orders
            </h2>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {selectedCustomer.phone || selectedCustomer.email || ''} · {selectedCustomer.ordersCount} order{selectedCustomer.ordersCount !== 1 ? 's' : ''} · {formatPrice(selectedCustomer.totalSpent)} lifetime
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-3">
          {ordersLoading ? (
            <div className="space-y-3 animate-pulse py-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-[#16162a] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-800" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
                      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/4" />
                    </div>
                    <div className="h-5 w-16 bg-gray-100 dark:bg-gray-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : customerOrders.length === 0 ? (
            <EmptyState 
              icon={<Package className="h-8 w-8 text-gray-300 dark:text-gray-600" />}
              title="No orders found"
              description="This customer has not placed any orders yet."
            />
          ) : (
            customerOrders.map(order => {
              const isExpanded = expandedOrderId === order.id;
              const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
              const orderDate = new Date(order.createdAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' });

              return (
                <div key={order.id} className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm overflow-hidden transition-all duration-200">
                  {/* Order Summary Row */}
                  <div
                    onClick={() => setExpandedOrderId(prev => prev === order.id ? null : order.id)}
                    className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-gray-50 dark:bg-[#0f0f1b] border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 flex-shrink-0">
                        <Package className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-gray-900 dark:text-white text-sm">{order.orderNumber}</span>
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-semibold mt-0.5">
                          <Calendar className="h-3 w-3" />
                          <span>{orderDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-[10px] text-gray-400 font-semibold">{itemsCount} item{itemsCount !== 1 ? 's' : ''}</div>
                        <div className="text-sm font-black text-gray-950 dark:text-white">{formatPrice(order.total)}</div>
                      </div>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                    </div>
                  </div>

                  {/* Order Details (expanded) */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-gray-800/60 bg-gray-50/20 dark:bg-[#16162a]/10 space-y-4">
                      {/* Items */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">Ordered Items</h4>
                        <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
                          {order.items.map((item, idx) => {
                            const img = item.product.images?.find((i: { isPrimary?: boolean; url: string }) => i.isPrimary)?.url || item.product.images?.[0]?.url || '';
                            const parts = [];
                            if (item.selectedVariant?.color) parts.push(item.selectedVariant.color);
                            if (item.selectedVariant?.size) parts.push(item.selectedVariant.size);
                            const variantStr = parts.join(' · ');

                            return (
                              <div key={idx} className="py-3 flex items-center gap-3 first:pt-0 last:pb-0">
                                <div className="relative h-12 w-12 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden shrink-0 bg-gray-50 dark:bg-[#0f0f1b]">
                                  {img ? (
                                    <Image src={img} alt={item.product.name} fill sizes="48px" className="object-cover" unoptimized />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center"><Package className="h-5 w-5 text-gray-300" /></div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-bold text-gray-900 dark:text-white text-xs truncate">{item.product.name}</h5>
                                  {variantStr && <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{variantStr}</p>}
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className="text-[10px] text-gray-400 font-semibold">Qty {item.quantity}</div>
                                  <div className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">{formatPrice(item.unitPrice * item.quantity)}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Delivery + Summary */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100 dark:border-gray-800/60">
                        {order.notes && (
                          <div className="space-y-1.5 text-xs">
                            <h4 className="font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 text-[10px] flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5" /> Delivery Address
                            </h4>
                            <div className="bg-gray-50 dark:bg-[#0f0f1b]/50 border border-gray-100 dark:border-gray-800/80 rounded-xl p-3 text-gray-600 dark:text-gray-300 font-semibold leading-relaxed whitespace-pre-line">
                              {order.notes}
                            </div>
                          </div>
                        )}
                        <div className="space-y-2 text-xs">
                          <h4 className="font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 text-[10px] flex items-center gap-1.5">
                            <Truck className="h-3.5 w-3.5" /> Order Summary
                          </h4>
                          <div className="bg-gray-50 dark:bg-[#0f0f1b]/50 border border-gray-100 dark:border-gray-800/80 rounded-xl p-3.5 space-y-2 text-gray-500 dark:text-gray-400 font-semibold">
                            <div className="flex justify-between">
                              <span>Subtotal</span>
                              <span className="font-bold text-gray-950 dark:text-white">{formatPrice(order.subtotal)}</span>
                            </div>
                            {order.discountAmount && order.discountAmount > 0 && (
                              <div className="flex justify-between text-rose-600 dark:text-rose-400">
                                <span>Discount {order.discountCode ? `(${order.discountCode})` : ''}</span>
                                <span className="font-bold">-{formatPrice(order.discountAmount)}</span>
                              </div>
                            )}
                            {(() => {
                              const shipAmount = order.shippingAmount || 0;
                              const effectiveShip = shipAmount > 0 ? shipAmount : (order.total > order.subtotal - (order.discountAmount || 0) ? order.total - (order.subtotal - (order.discountAmount || 0)) : 0);
                              const shipLabel = order.shippingMethodName || 'Delivery Charges';
                              return (
                                <div className="flex justify-between">
                                  <span>{shipLabel}</span>
                                  <span className="font-bold text-gray-950 dark:text-white">{effectiveShip > 0 ? formatPrice(effectiveShip) : 'Free'}</span>
                                </div>
                              );
                            })()}
                            <div className="flex justify-between">
                              <span>Payment Method</span>
                              <span className="font-bold text-gray-950 dark:text-white">Cash on Delivery</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-800 text-sm font-black text-gray-900 dark:text-white">
                              <span>Total Paid</span>
                              <span>{formatPrice(order.total)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
