'use client';

import React from 'react';
import { 
  ArrowLeft, 
  Package, 
  Clock, 
  ClipboardList, 
  ChevronDown, 
  Edit, 
  Check, 
  MoreHorizontal, 
  Trash2,
  X 
} from '@/components/common/Icons';
import { Order, StoreSettings } from '@/lib/types';
import { formatPrice } from '@/lib/utils/whatsapp';
import { getItemVariant } from '@/lib/utils/formatVariant';
import OrderEditor from './OrderEditor';
import { useOrderDetailState, OrderCustomerCard } from './order-detail';
import { isOrderFulfilled, isOrderUnfulfilled } from '@/components/admin/order-log/orderLogUtils';
import TableThumbnail from '@/components/admin/TableThumbnail';
import ImagePreviewModal from '@/components/admin/ImagePreviewModal';

interface OrderDetailCanvasProps {
  order: Order;
  settings: StoreSettings;
}

export default function OrderDetailCanvas({ order: initialOrder, settings }: OrderDetailCanvasProps) {
  const state = useOrderDetailState(initialOrder);
  const {
    router,
    order, setOrder,
    isUpdating,
    isDropdownOpen, setIsDropdownOpen,
    isEditingOrder, setIsEditingOrder,
    handleOpenEditOrder,
    handleCloseEditOrder,
    allProducts,
    isFulfillDropdownOpen, setIsFulfillDropdownOpen,
    lightboxImage, setLightboxImage,
    prevOrderId, nextOrderId,
    currentIndexDisplay,
    handleNavigateNext,
    handleNavigatePrev,
    handleTouchStart,
    handleTouchEnd,
    paymentMethod, isPaid,
    staffNoteInput, setStaffNoteInput,
    isEditingCustomer, setIsEditingCustomer,
    isEditingNotes, setIsEditingNotes,
    editCustomerName, setEditCustomerName,
    editCustomerPhone, setEditCustomerPhone,
    isEditingTracking, setIsEditingTracking,
    trackingNumber, setTrackingNumber,
    courierName, setCourierName,
    trackingUrl, setTrackingUrl,
    editingCommentId, setEditingCommentId,
    editingCommentText, setEditingCommentText,
    editAddress, setEditAddress,
    editApt, setEditApt,
    editCity, setEditCity,
    editPostal, setEditPostal,
    editContact, setEditContact,
    editPayment, setEditPayment,
    editOtherNotes, setEditOtherNotes,
    handleSaveNotes,
    handleSaveCustomer,
    handleStatusChange,
    handleSetPayment,
    handleSetFulfillment,
    handleMoveToTrash,
    handleCancelShipment,
    handleSaveStaffNote,
    handleUpdateTracking,
    handleDeleteTimelineComment,
    handleUpdateTimelineComment
  } = state;

  const safeFormatOrderDate = (dateVal: string | undefined | null) => {
    if (!dateVal) return 'Recently';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return 'Recently';
    try {
      return `${d.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at ${d.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase()}`;
    } catch {
      return d.toLocaleDateString();
    }
  };

  const safeFormatLogDate = (dateVal: string | undefined | null) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    try {
      return new Intl.DateTimeFormat('en-PK', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Karachi',
      }).format(d);
    } catch {
      return d.toLocaleDateString();
    }
  };

  return (
    <div className="max-w-full sm:max-w-6xl mx-auto space-y-6 pb-20 font-sans overflow-x-hidden w-full">
      
      {/* Detail Topbar - Executive Shopify Polaris Style with Smart Compact Actions */}
      <div 
        className="flex flex-col gap-2.5 sm:gap-3 mb-6 pb-4 border-b border-gray-200/80 dark:border-gray-800"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* ROW 1: Order ID + Status Badges (Left) & Next/Prev Pagination + Smart More Actions (Upper Right) */}
        <div className="flex items-center justify-between gap-2">
          {/* Left: Back Arrow + Order Number + Smart Status Badges */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-wrap">
            <button 
              onClick={() => {
                if (isEditingOrder) {
                  handleCloseEditOrder();
                  return;
                }
                if (typeof window !== 'undefined') {
                  const returnUrl = sessionStorage.getItem('admin_orders_return_url');
                  if (returnUrl) {
                    router.push(returnUrl);
                    return;
                  }
                  if (window.history.length > 1) {
                    router.back();
                    return;
                  }
                }
                router.push('/admin/orders');
              }}
              className="p-1 -ml-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors print:hidden cursor-pointer shrink-0"
              title={isEditingOrder ? "Back to order detail" : "Back to orders"}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-gray-400 dark:text-gray-500 shrink-0">
                <Package className="h-4.5 w-4.5" />
              </span>
              <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-none tracking-tight whitespace-nowrap">
                {order.order_number}
              </span>
            </div>

            {/* Status Badges - Smartly placed right next to Order ID */}
            <div className="inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap">
              {/* Unpaid / Paid Badge - Small, subtle & clean color change */}
              {isPaid ? (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60 rounded-[5px] px-1.5 py-0.5 text-[10.5px] font-semibold leading-tight">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Paid
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 rounded-[5px] px-1.5 py-0.5 text-[10.5px] font-semibold leading-tight">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                  Unpaid
                </span>
              )}

              {/* Fulfillment Status Badge - HIGH VISIBILITY & PROMINENT HIGHLIGHT */}
              {order.status === 'cancelled' ? (
                <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide bg-rose-600 text-white shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                  Cancelled
                </span>
              ) : isOrderUnfulfilled(order) ? (
                <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wide bg-amber-500 text-white shadow-2xs ring-1 ring-amber-600/30">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  Unfulfilled
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wide bg-emerald-600 text-white shadow-2xs ring-1 ring-emerald-700/30">
                  <Check className="h-3 w-3 stroke-[3] text-white shrink-0" />
                  Fulfilled
                </span>
              )}
            </div>
          </div>

          {/* Right: Next / Prev Pagination + Smart More Actions (Upper Right) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto print:hidden">
            {/* Pagination Controls */}
            <div className="flex items-center border border-gray-200 dark:border-gray-800 rounded-lg sm:rounded-xl overflow-hidden bg-white dark:bg-[#16162a] shadow-2xs">
              <button
                onClick={handleNavigateNext}
                disabled={!nextOrderId}
                className="px-2 sm:px-2.5 py-1 sm:py-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer border-r border-gray-200 dark:border-gray-800 text-xs font-bold"
                title={nextOrderId ? "Previous / Newer order (← Left Arrow)" : "No previous order"}
                aria-label="Previous order"
              >
                &larr;
              </button>
              {currentIndexDisplay && (
                <span className="px-2 sm:px-2.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-800 select-none whitespace-nowrap bg-gray-50/50 dark:bg-white/[0.02]">
                  {currentIndexDisplay}
                </span>
              )}
              <button
                onClick={handleNavigatePrev}
                disabled={!prevOrderId}
                className="px-2 sm:px-2.5 py-1 sm:py-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer text-xs font-bold"
                title={prevOrderId ? "Next / Older order (→ Right Arrow)" : "No next order"}
                aria-label="Next order"
              >
                &rarr;
              </button>
            </div>

            {/* Smart More actions Button - Top Right */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-[#f6f6f7] dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                title="More actions"
              >
                <span className="hidden sm:inline">More actions</span>
                <span className="sm:hidden">More</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </button>

              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 shadow-xl z-50 overflow-hidden py-1">
                    <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Fulfillment</div>
                    <button
                      onClick={() => {
                        router.push(`/admin/orders/postex-booking?id=${order.id}`);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      Book at PostEx
                    </button>
                    <div className="border-t border-gray-100 dark:border-gray-800/60 my-1" />
                    <button onClick={() => handleStatusChange('pending')} className="w-full text-left px-4 py-1.5 text-[13.5px] font-medium hover:bg-gray-50 text-amber-600">Mark as Pending</button>
                    <button onClick={() => handleStatusChange('confirmed')} className="w-full text-left px-4 py-1.5 text-[13.5px] font-medium hover:bg-gray-50 text-blue-600">Mark as Confirmed</button>
                    <button onClick={() => handleStatusChange('shipped')} className="w-full text-left px-4 py-1.5 text-[13.5px] font-medium hover:bg-gray-50 text-purple-600">Mark as Shipped</button>
                    <button onClick={() => handleStatusChange('delivered')} className="w-full text-left px-4 py-1.5 text-[13.5px] font-medium hover:bg-gray-50 text-emerald-600">Mark as Delivered</button>
                    <button onClick={() => handleStatusChange('cancelled')} className="w-full text-left px-4 py-1.5 text-[13.5px] font-medium hover:bg-gray-50 text-red-600">Mark as Cancelled</button>
                    {order.tracking_number && (
                      <button onClick={handleCancelShipment} disabled={isUpdating} className="w-full text-left px-4 py-2 text-[13.5px] font-medium text-orange-600">Cancel Shipment</button>
                    )}
                    <button onClick={() => { handleMoveToTrash(); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-[13.5px] font-medium text-red-600">Move to Trash</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ROW 2: Date Info (Left) + Edit & Print Buttons (Right) */}
        <div className="flex items-center justify-between gap-2 pl-6 sm:pl-7">
          <p className="text-xs sm:text-[13px] text-gray-500 dark:text-gray-400 min-w-0 truncate">
            {safeFormatOrderDate(order.created_at)} from Online Store
          </p>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 print:hidden ml-auto">
            <button
              onClick={isEditingOrder ? handleCloseEditOrder : handleOpenEditOrder}
              className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-white dark:bg-[#16162a] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-bold shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
            >
              {isEditingOrder ? 'Cancel Edit' : 'Edit'}
            </button>

            <button
              onClick={() => window.print()}
              className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-white dark:bg-[#16162a] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-bold shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
            >
              Print
            </button>
          </div>
        </div>
      </div>

      {isEditingOrder ? (
        <OrderEditor 
          order={order}
          settings={settings}
          products={allProducts}
          onSave={(updated) => {
            setOrder(updated);
            handleCloseEditOrder();
            router.refresh();
          }}
          onCancel={handleCloseEditOrder}
        />
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_310px] gap-4 items-start">
        <div className="flex flex-col gap-4">
          <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-4 py-3.5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-[#16162a]">
              {isOrderUnfulfilled(order) ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-extrabold uppercase tracking-wide bg-amber-500 text-white shadow-2xs ring-1 ring-amber-600/30">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  Unfulfilled ({order.items.length})
                </span>
              ) : order.status === 'cancelled' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide bg-rose-600 text-white shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                  Cancelled ({order.items.length})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-extrabold uppercase tracking-wide bg-emerald-600 text-white shadow-2xs ring-1 ring-emerald-700/30">
                  <Check className="h-3.5 w-3.5 stroke-[3] text-white shrink-0" />
                  Fulfilled ({order.items.length})
                </span>
              )}
            </div>
            {order.items.map((item, idx) => {
              const variantDetails = getItemVariant(item);
              const firstImg = item.product?.images?.[0];
              const displayImage = variantDetails.imageUrl || (typeof firstImg === 'string' ? firstImg : firstImg?.url);

              return (
                <div key={idx} className="flex items-start gap-3.5 p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] last:border-b-0">
                  <TableThumbnail
                    url={displayImage || null}
                    alt={item.product?.name || 'Product'}
                    onPreview={(url) => setLightboxImage(url)}
                    className="w-14 h-14 rounded-xl flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 
                      className="text-[13px] sm:text-[13.5px] font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 hover:text-[#2c6ecb] transition-colors"
                      title={item.product?.name || 'Product'}
                    >
                      {item.product?.name || 'Product'}
                    </h4>

                    {/* Variant Chips, Quantity & Pricing in compact aligned row */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {variantDetails.chips.length > 0 && variantDetails.chips.map((chip, cIdx) => (
                        <span
                          key={cIdx}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                            chip.label.toLowerCase() === 'size'
                              ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200/70 dark:border-indigo-800/60 font-bold'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200/70 dark:border-gray-700/60'
                          }`}
                        >
                          {chip.colorHex && (
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/15 shadow-2xs shrink-0"
                              style={{ backgroundColor: chip.colorHex }}
                            />
                          )}
                          <span className="text-gray-500 dark:text-gray-400 font-normal">{chip.label}:</span>
                          <span className="font-bold">{chip.value}</span>
                        </span>
                      ))}

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-gray-200/60 dark:border-gray-800">
                        <span className="text-gray-400 font-normal">Qty:</span>
                        <span className="font-bold text-gray-900 dark:text-white">{item.quantity}</span>
                      </span>

                      {item.quantity > 1 && (
                        <span className="text-[11px] text-gray-400 dark:text-gray-500">
                          ({formatPrice(item.unit_price, settings.currency_symbol)} ea)
                        </span>
                      )}

                      {variantDetails.sku && (
                        <span className="text-[10.5px] font-mono text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 px-1.5 py-0.5 rounded">
                          SKU: {variantDetails.sku}
                        </span>
                      )}
                    </div>

                    {/* Modifiers if any */}
                    {item.selected_modifiers && item.selected_modifiers.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1 text-[11px] text-gray-500">
                        {item.selected_modifiers.map((m, mIdx) => (
                          <span key={mIdx} className="bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-900/40">
                            +{m.name} ({formatPrice(m.price, settings.currency_symbol)})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="font-bold text-[13.5px] sm:text-[14px] text-gray-900 dark:text-white text-right shrink-0 pt-0.5">
                    {formatPrice(item.total, settings.currency_symbol)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden p-4">
            <div className="flex justify-between py-1.5 text-[13px] text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal ?? Math.max(0, (order.total || 0) - (order.shipping_amount || 0) + (order.discount_amount || 0)), settings.currency_symbol)}</span>
            </div>
            {(order.discount_amount ?? 0) > 0 && (
              <div className="flex justify-between py-1.5 text-[13px] text-emerald-600 dark:text-emerald-400">
                <span>Discount{order.discount_code ? ` (${order.discount_code})` : ''}</span>
                <span>−{formatPrice(order.discount_amount || 0, settings.currency_symbol)}</span>
              </div>
            )}
            <div className="flex justify-between py-1.5 text-[13px] text-gray-600 dark:text-gray-400">
              <span>Shipping{order.shipping_method_name ? ` (${order.shipping_method_name})` : ''}</span>
              <span>{formatPrice(order.shipping_amount || 0, settings.currency_symbol)}</span>
            </div>
            {(order.refund_amount ?? 0) > 0 && (
              <div className="flex justify-between py-1.5 text-[13px] text-red-500">
                <span>Refunded</span>
                <span>−{formatPrice(order.refund_amount || 0, settings.currency_symbol)}</span>
              </div>
            )}
            <div className="flex justify-between py-2 mt-1 border-t border-gray-200 dark:border-gray-800 text-[13.5px]">
              <span className="font-bold">Total</span>
              <span className="font-bold">{formatPrice(order.total, settings.currency_symbol)}</span>
            </div>
          </div>

          {/* Payment & fulfillment status + actions (real columns, not notes-derived) */}
          <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-4 space-y-4 print:hidden">
            {/* Payment Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[13.5px] font-bold text-gray-800 dark:text-gray-200">Payment</span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  order.payment_status === 'paid'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30'
                    : order.payment_status === 'refunded'
                      ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30'
                      : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30'
                }`}>
                  {(order.payment_status || 'unpaid').toUpperCase()}
                </span>
              </div>

              {/* Action buttons: smart-fit on desktop, proportional on mobile */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {order.payment_status !== 'paid' && (
                  <button
                    onClick={() => handleSetPayment('paid')}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-bold cursor-pointer active:scale-95 transition-all shadow-xs whitespace-nowrap"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Mark as Paid
                  </button>
                )}
                {order.payment_status === 'paid' && (
                  <button
                    onClick={() => handleSetPayment('unpaid')}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-[12px] font-bold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 transition-all whitespace-nowrap"
                  >
                    Mark Unpaid
                  </button>
                )}
                {order.payment_status !== 'refunded' && (
                  <button
                    onClick={() => handleSetPayment('refunded')}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-[12px] font-bold cursor-pointer hover:bg-red-50 dark:hover:bg-red-500/10 active:scale-95 transition-all whitespace-nowrap"
                  >
                    Refunded
                  </button>
                )}
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800/80" />

            {/* Fulfillment Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[13.5px] font-bold text-gray-800 dark:text-gray-200">Fulfillment</span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  order.fulfillment_status === 'fulfilled'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30'
                    : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                }`}>
                  {(order.fulfillment_status || 'unfulfilled').toUpperCase()}
                </span>
                {order.tracking_number && (
                  <span className="text-[11px] font-mono bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded border border-blue-200/60 dark:border-blue-800/60">
                    TRK: {order.tracking_number}
                  </span>
                )}
              </div>

              {/* Action buttons: smart-fit on desktop, proportional on mobile */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => router.push(`/admin/orders/postex-booking?id=${order.id}`)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#2c6ecb] hover:bg-[#20549c] text-white text-[12px] font-bold cursor-pointer active:scale-95 transition-all shadow-xs whitespace-nowrap"
                  title="Book or manage courier at PostEx"
                >
                  <Package className="w-3.5 h-3.5" />
                  Book at PostEx
                </button>
                <button
                  onClick={() => handleSetFulfillment(order.fulfillment_status === 'fulfilled' ? 'unfulfilled' : 'fulfilled')}
                  className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-bold cursor-pointer active:scale-95 transition-all shadow-xs whitespace-nowrap ${
                    order.fulfillment_status === 'fulfilled'
                      ? 'border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  {order.fulfillment_status === 'fulfilled' ? 'Mark Unfulfilled' : 'Mark Fulfilled'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-4 space-y-4 print:hidden">
            <div className="text-[13.5px] font-bold">Timeline</div>
            <div className="flex items-start gap-2.5">
              <textarea
                value={staffNoteInput}
                onChange={(e) => setStaffNoteInput(e.target.value)}
                placeholder="Leave a comment..."
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-xs text-gray-900 dark:text-white"
              />
              {staffNoteInput && (
                <button onClick={handleSaveStaffNote} className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded">Post</button>
              )}
            </div>

            {/* Timeline entries (newest first) */}
            <div className="space-y-3">
              {(!order.status_logs || order.status_logs.length === 0) ? (
                <p className="text-xs text-gray-400">No activity yet.</p>
              ) : (
                [...order.status_logs].reverse().map((log) => {
                  const isComment = log.type === 'staff_note';
                  const isEditing = editingCommentId === log.id;
                  return (
                    <div key={log.id} className="flex items-start gap-2.5">
                      <div className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                        <Clock className="h-3 w-3" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-gray-900 dark:text-white">{log.message}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] text-gray-400 whitespace-nowrap">
                              {safeFormatLogDate(log.created_at)}
                            </span>
                            {isComment && !isEditing && (
                              <>
                                <button
                                  onClick={() => { setEditingCommentId(log.id); setEditingCommentText(log.notes || ''); }}
                                  className="text-gray-400 hover:text-blue-600"
                                  title="Edit comment"
                                >
                                  <Edit className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTimelineComment(log.id)}
                                  className="text-gray-400 hover:text-red-600"
                                  title="Delete comment"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        {isEditing ? (
                          <div className="mt-1 space-y-1.5">
                            <textarea
                              value={editingCommentText}
                              onChange={(e) => setEditingCommentText(e.target.value)}
                              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-xs text-gray-900 dark:text-white"
                            />
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => handleUpdateTimelineComment(log.id)} className="px-2.5 py-1 bg-blue-600 text-white text-[11px] font-bold rounded inline-flex items-center gap-1">
                                <Check className="h-3 w-3" /> Save
                              </button>
                              <button onClick={() => setEditingCommentId(null)} className="px-2.5 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-[11px] font-bold rounded inline-flex items-center gap-1">
                                <X className="h-3 w-3" /> Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          log.notes && <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-words">{log.notes}</p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[13.5px] font-bold">Notes</span>
              <button onClick={() => setIsEditingNotes(!isEditingNotes)}><Edit className="h-4 w-4 text-gray-500" /></button>
            </div>
            {isEditingNotes ? (
              <div className="space-y-2">
                <textarea value={editOtherNotes} onChange={e => setEditOtherNotes(e.target.value)} className="w-full text-xs p-2 border rounded bg-white dark:bg-gray-800" />
                <button onClick={handleSaveNotes} className="px-3 py-1 bg-blue-600 text-white text-xs rounded">Save</button>
              </div>
            ) : (
              <p className="text-xs text-gray-600 dark:text-gray-400">{order.notes || 'No notes'}</p>
            )}
          </div>

          <OrderCustomerCard
            order={order}
            settings={settings}
            isEditingCustomer={isEditingCustomer}
            setIsEditingCustomer={setIsEditingCustomer}
            editCustomerName={editCustomerName}
            setEditCustomerName={setEditCustomerName}
            editCustomerPhone={editCustomerPhone}
            setEditCustomerPhone={setEditCustomerPhone}
            editAddress={editAddress}
            setEditAddress={setEditAddress}
            editApt={editApt}
            setEditApt={setEditApt}
            editCity={editCity}
            setEditCity={setEditCity}
            editPostal={editPostal}
            setEditPostal={setEditPostal}
            editContact={editContact}
            setEditContact={setEditContact}
            editPayment={editPayment}
            setEditPayment={setEditPayment}
            handleSaveCustomer={handleSaveCustomer}
            isUpdating={isUpdating}
          />
        </div>
      </div>
      )}

      <ImagePreviewModal
        url={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  );
}
