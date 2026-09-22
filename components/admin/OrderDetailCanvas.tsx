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
  X 
} from '@/components/common/Icons';
import { Order, StoreSettings } from '@/lib/types';
import { formatPrice } from '@/lib/utils/whatsapp';
import OrderEditor from './OrderEditor';
import { useOrderDetailState, OrderCustomerCard } from './order-detail';

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
    allProducts,
    isFulfillDropdownOpen, setIsFulfillDropdownOpen,
    lightboxImage, setLightboxImage,
    prevOrderId, nextOrderId,
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
    handleMoveToTrash,
    handleCancelShipment,
    handleSaveStaffNote,
    handleUpdateTracking,
    handleDeleteTimelineComment,
    handleUpdateTimelineComment
  } = state;

  return (
    <div className="max-w-full sm:max-w-6xl mx-auto space-y-6 pb-20 font-sans overflow-x-hidden w-full">
      
      {/* Detail Topbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <button 
              onClick={() => router.push('/admin/orders')}
              className="p-1 -ml-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              title="Back to orders"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
                <Package className="h-4 w-4" />
              </span>
              <span className="text-[20px] font-bold text-gray-900 dark:text-white leading-none whitespace-nowrap">
                {order.orderNumber}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 ml-1">
              {isPaid ? (
                <span className="inline-flex items-center gap-1.5 bg-[#d4edda] text-[#2d6a4f] dark:bg-[#d4edda]/20 dark:text-[#a0dcb3] rounded-[6px] px-2 py-0.5 text-[13px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2d6a4f] dark:bg-[#a0dcb3]" />
                  Paid
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-[#fff4c4] text-[#7c5c00] dark:bg-[#fff4c4]/20 dark:text-[#d4c382] rounded-[6px] px-2 py-0.5 text-[13px] font-semibold animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b98900] dark:bg-[#d4c382]" />
                  Unpaid
                </span>
              )}
              {order.status === 'cancelled' ? (
                <span className="inline-flex items-center gap-1.5 rounded-[6px] px-2 py-0.5 text-[13px] font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 dark:bg-red-400" />
                  Cancelled
                </span>
              ) : (
                <span className={`inline-flex items-center gap-1.5 rounded-[6px] px-2 py-0.5 text-[13px] font-semibold ${
                   order.status === 'pending' || order.status === 'placed' || order.status === 'confirmed'
                   ? 'bg-[#fff4c4] text-[#7c5c00] dark:bg-[#fff4c4]/20 dark:text-[#d4c382]'
                   : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                }`}>
                  {order.status === 'pending' || order.status === 'placed' || order.status === 'confirmed' ? (
                    <span className="w-2.5 h-2.5 rounded-full border-2 border-[#b98900] dark:border-[#d4c382]" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                  {order.status === 'pending' || order.status === 'placed' || order.status === 'confirmed' ? 'Unfulfilled' : 'Fulfilled'}
                </span>
              )}
            </div>
          </div>
          <div className="text-[13px] text-gray-500 dark:text-gray-400 ml-9">
            {new Date(order.createdAt).toLocaleString('en-US', { 
              month: 'long', day: 'numeric', year: 'numeric'
            })} at {new Date(order.createdAt).toLocaleString('en-US', { 
              hour: 'numeric', minute: '2-digit', hour12: true
            }).toLowerCase()} from Online Store
          </div>
        </div>

        <div className="flex items-center gap-3 relative">
          <div className="flex items-center border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <button
              onClick={() => { if (nextOrderId) router.push(`/admin/orders/detail?id=${nextOrderId}`); }}
              disabled={!nextOrderId}
              className="px-2.5 py-1.5 bg-white dark:bg-[#16162a] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border-r border-gray-200 dark:border-gray-800"
              title="Newer order"
            >
              &larr;
            </button>
            <button
              onClick={() => { if (prevOrderId) router.push(`/admin/orders/detail?id=${prevOrderId}`); }}
              disabled={!prevOrderId}
              className="px-2.5 py-1.5 bg-white dark:bg-[#16162a] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Older order"
            >
              &rarr;
            </button>
          </div>

          <button
            onClick={() => setIsEditingOrder(true)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#16162a] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-[13.5px] font-semibold shadow-sm transition-colors whitespace-nowrap"
          >
            Edit
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#16162a] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-[13.5px] font-semibold shadow-sm transition-colors whitespace-nowrap"
          >
            Print
          </button>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-2.5 py-1.5 rounded-xl bg-[#f6f6f7] dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-[#babfc3] dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 text-[13.5px] font-semibold shadow-sm transition-colors flex items-center gap-1 whitespace-nowrap"
            >
              <span>More actions</span>
              <ChevronDown className="h-3.5 w-3.5" />
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
                  {order.trackingNumber && (
                    <button onClick={handleCancelShipment} disabled={isUpdating} className="w-full text-left px-4 py-2 text-[13.5px] font-medium text-orange-600">Cancel Shipment</button>
                  )}
                  <button onClick={() => { handleMoveToTrash(); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-[13.5px] font-medium text-red-600">Move to Trash</button>
                </div>
              </>
            )}
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
            setIsEditingOrder(false);
            router.refresh();
          }}
          onCancel={() => setIsEditingOrder(false)}
        />
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_310px] gap-4 items-start">
        <div className="flex flex-col gap-4">
          <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-4 py-3.5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-[#16162a]">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[13px] font-semibold bg-[#fff4c4] text-[#7c5c00]">
                Unfulfilled ({order.items.length})
              </span>
            </div>
            
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] last:border-b-0">
                <div className="w-12 h-12 rounded border border-gray-200 dark:border-gray-700 overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
                  {item.product.images?.[0] ? <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" /> : <Package className="h-5 w-5 text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-medium text-[#2c6ecb]">{item.product.name}</div>
                  <div className="text-[12.5px] text-gray-500">Qty: {item.quantity}</div>
                </div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {formatPrice(item.total, settings.currencySymbol)}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden p-4">
            <div className="flex justify-between py-2 text-[13.5px]">
              <span className="font-bold">Total</span>
              <span className="font-bold">{formatPrice(order.total, settings.currencySymbol)}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-4 space-y-4">
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

      {lightboxImage && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4" onClick={() => setLightboxImage(null)}>
          <img src={lightboxImage} alt="" className="max-w-full max-h-[90vh] object-contain rounded-xl" />
        </div>
      )}
    </div>
  );
}
