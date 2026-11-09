'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/common/Modal';
import TableThumbnail from '@/components/admin/TableThumbnail';
import ImagePreviewModal from '@/components/admin/ImagePreviewModal';
import { Order, StoreSettings, CartItem } from '@/lib/types';
import { formatPrice, cleanWhatsAppPhone } from '@/lib/utils/whatsapp';
import { getItemVariant } from '@/lib/utils/formatVariant';
import { 
  Package, 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  ExternalLink, 
  MessageCircle, 
  Phone,
  Clock,
  Tag
} from '@/components/common/Icons';
import { isOrderPaid, getOrderPaymentMethod } from './orderLogUtils';

interface OrderQuickViewModalProps {
  order: Order | null;
  ordersList?: Order[];
  onSelectOrder?: (order: Order) => void;
  open: boolean;
  onClose: () => void;
  settings: StoreSettings;
}

export function OrderQuickViewModal({
  order,
  ordersList = [],
  onSelectOrder,
  open,
  onClose,
  settings,
}: OrderQuickViewModalProps) {
  const router = useRouter();
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Find index in active list
  const currentIndex = order && ordersList.length > 0 
    ? ordersList.findIndex(o => o.id === order.id) 
    : -1;

  const prevOrder = currentIndex > 0 ? ordersList[currentIndex - 1] : null;
  const nextOrder = currentIndex >= 0 && currentIndex < ordersList.length - 1 ? ordersList[currentIndex + 1] : null;

  const handlePrev = useCallback(() => {
    if (prevOrder && onSelectOrder) {
      onSelectOrder(prevOrder);
    }
  }, [prevOrder, onSelectOrder]);

  const handleNext = useCallback(() => {
    if (nextOrder && onSelectOrder) {
      onSelectOrder(nextOrder);
    }
  }, [nextOrder, onSelectOrder]);

  // Keyboard navigation when modal is open
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      if (e.key === 'ArrowLeft' && prevOrder) {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight' && nextOrder) {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, prevOrder, nextOrder, handlePrev, handleNext]);

  if (!order) return null;

  const paid = isOrderPaid(order);
  const paymentMethod = getOrderPaymentMethod(order);

  // Parse address details from notes
  const notesText = order.notes || '';
  const lines = notesText.split('\n');
  let parsedAddress = '';
  let parsedCity = '';
  let otherNotes: string[] = [];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();
    if (lower.startsWith('address:')) parsedAddress = trimmed.substring('address:'.length).trim();
    else if (lower.startsWith('city:')) parsedCity = trimmed.substring('city:'.length).trim();
    else if (!lower.startsWith('payment method:') && !lower.startsWith('contact:')) {
      otherNotes.push(trimmed);
    }
  });

  const fullAddress = [parsedAddress, parsedCity].filter(Boolean).join(', ');

  // WhatsApp link for customer
  const cleanPhone = cleanWhatsAppPhone(order.customer_phone || '');
  const storeBrandName = settings.store_name || process.env.NEXT_PUBLIC_BRAND_NAME || 'our store';
  const whatsAppUrl = cleanPhone 
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello ${order.customer_name || 'Customer'}! Regarding your order ${order.order_number} on ${storeBrandName}...`)}`
    : null;

  const handleOpenFullOrder = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('admin_orders_return_url', window.location.pathname + window.location.search);
    }
    onClose();
    router.push(`/admin/orders/detail?id=${order.id}`);
  };

  const getItemImage = (item: CartItem): string | undefined => {
    const v = getItemVariant(item);
    if (v.imageUrl) return v.imageUrl;
    const rawItem = item as unknown as Record<string, unknown>;
    if (typeof rawItem.imageUrl === 'string' && rawItem.imageUrl) return rawItem.imageUrl;
    if (typeof rawItem.image_url === 'string' && rawItem.image_url) return rawItem.image_url;
    if (typeof rawItem.image === 'string' && rawItem.image) return rawItem.image;
    const imgs = item.product?.images;
    if (imgs && imgs.length > 0) {
      const first = imgs[0];
      return typeof first === 'string' ? first : first.url;
    }
    const rawProd = item.product as unknown as Record<string, unknown> | undefined;
    if (typeof rawProd?.image_url === 'string' && rawProd.image_url) return rawProd.image_url;
    if (typeof rawProd?.image === 'string' && rawProd.image) return rawProd.image;
    if (typeof rawProd?.thumbnail === 'string' && rawProd.thumbnail) return rawProd.thumbnail;
    return undefined;
  };

  const totalQuantity = (order.items || []).reduce((acc, i) => acc + (i.quantity || 1), 0);

  return (
    <>
    <Modal
      open={open}
      onClose={onClose}
      variant="sheet"
      size="md"
      className="p-0 overflow-hidden !h-[92dvh] sm:!h-[670px] !max-h-[92dvh] sm:!max-h-[670px] flex flex-col"
      fitHeight={true}
      showClose={false}
      ariaLabel={`Quick view for order ${order.order_number}`}
    >
      {/* Modal Top Header - Shopify Polaris Style (Slim & Compact) */}
      <div className="px-3 sm:px-5 py-2.5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] shrink-0 z-20">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Package Icon + Order Number & Badges */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Package className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-[15px] leading-none shrink-0">
                  {order.order_number}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  {paid ? (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Paid
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[5px] text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      Unpaid
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold uppercase tracking-wide ${
                    order.status === 'cancelled'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : ['pending', 'placed', 'confirmed'].includes(order.status)
                      ? 'bg-amber-500 text-white shadow-2xs ring-1 ring-amber-600/30'
                      : 'bg-emerald-600 text-white shadow-2xs'
                  }`}>
                    {order.status === 'cancelled' ? (
                      'Cancelled'
                    ) : ['pending', 'placed', 'confirmed'].includes(order.status) ? (
                      <>
                        <span className="relative flex h-1.5 w-1.5 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                        </span>
                        Unfulfilled
                      </>
                    ) : (
                      <>
                        <Check className="h-3 w-3 stroke-[3] text-white shrink-0" />
                        Fulfilled
                      </>
                    )}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {order.customer_name || 'Guest'}
              </p>
            </div>
          </div>

          {/* Right: Previous / Next Switcher & Close button */}
          <div className="flex items-center gap-1.5 shrink-0">
            {ordersList.length > 1 && (
              <div className="flex items-center border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-[#16162a] shadow-xs">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={!prevOrder}
                  className="w-7 h-7 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed border-r border-gray-200 dark:border-gray-800 transition-colors cursor-pointer"
                  title={prevOrder ? "Previous order (← Left Arrow)" : "First order"}
                  aria-label="Previous order"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 h-7 flex items-center justify-center text-[10.5px] font-semibold text-gray-600 dark:text-gray-300 select-none whitespace-nowrap bg-gray-50/60 dark:bg-white/[0.02]">
                  {currentIndex + 1} of {ordersList.length}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!nextOrder}
                  className="w-7 h-7 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title={nextOrder ? "Next order (→ Right Arrow)" : "Last order"}
                  aria-label="Next order"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer text-xs font-bold"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* Body: Products List as Primary Hero + Compact Shopify Metadata Strip */}
      <div className="flex-1 min-h-0 flex flex-col p-3 sm:p-4 gap-2.5 overflow-hidden">
        
        {/* Section 1: Hero Products List with Maximized Scroll Space */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex items-center justify-between mb-1.5 shrink-0 px-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Articles Ordered ({order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'} · {totalQuantity} qty)
            </span>
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-200/50 dark:border-indigo-800/40">
              {paymentMethod}
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain border border-gray-200 dark:border-gray-800 rounded-xl divide-y divide-gray-100 dark:divide-gray-800/80 bg-white dark:bg-[#16162a] shadow-xs [scrollbar-width:thin]">
            {(!order.items || order.items.length === 0) ? (
              <div className="p-4 text-center text-xs text-gray-400">
                No articles attached to this order.
              </div>
            ) : (
              order.items.map((item, idx) => {
                const variant = getItemVariant(item);
                const imageUrl = getItemImage(item);
                const unitPrice = item.unit_price || 0;
                const lineTotal = item.total ?? (unitPrice * (item.quantity || 1));

                return (
                  <div key={idx} className="p-2 sm:p-2.5 flex items-start gap-2.5 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors">
                    {/* Thumbnail with Eye Overlay & Qty Badge */}
                    <div className="relative flex-shrink-0">
                      <TableThumbnail
                        url={imageUrl || null}
                        alt={item.product?.name || (item as unknown as { title?: string }).title || 'Item'}
                        onPreview={setPreviewImageUrl}
                        className="w-12 h-12 rounded-lg"
                      />
                      {item.quantity > 1 && (
                        <span className="absolute -top-1 -right-1 z-10 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[17px] text-center shadow-xs pointer-events-none">
                          ×{item.quantity}
                        </span>
                      )}
                    </div>

                    {/* Article Details & Variations */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[12.5px] sm:text-[13px] font-bold text-gray-900 dark:text-white leading-snug line-clamp-1 sm:line-clamp-2">
                        {item.product?.name || (item as unknown as { title?: string }).title || 'Item'}
                      </h4>

                      {/* Variation Chips */}
                      {variant.chips && variant.chips.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          {variant.chips.map((chip, cIdx) => (
                            <span 
                              key={cIdx}
                              className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10.5px] font-semibold border ${
                                chip.label.toLowerCase() === 'size'
                                  ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200/70 dark:border-indigo-800/60 font-bold'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200/70 dark:border-gray-700/60'
                              }`}
                            >
                              {chip.colorHex && (
                                <span 
                                  className="w-2 h-2 rounded-full border border-black/15 shadow-2xs flex-shrink-0" 
                                  style={{ backgroundColor: chip.colorHex }} 
                                />
                              )}
                              <span>{chip.label}:</span>
                              <span className="font-bold">{chip.value}</span>
                            </span>
                          ))}
                        </div>
                      ) : variant.summary ? (
                        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                          {variant.summary}
                        </p>
                      ) : null}

                      {/* SKU & Price Breakdown */}
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                        <span>{formatPrice(unitPrice, settings.currency_symbol)} × {item.quantity}</span>
                        {variant.sku && (
                          <>
                            <span>·</span>
                            <span className="font-mono text-[10px]">SKU: {variant.sku}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Line Total */}
                    <div className="text-right flex-shrink-0 pl-1">
                      <span className="text-xs sm:text-[13px] font-bold text-gray-900 dark:text-white block">
                        {formatPrice(lineTotal, settings.currency_symbol)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Section 2: Shopify-Style Smart Compact Metadata Strip (Never Clipped) */}
        <div className="shrink-0 rounded-xl bg-gray-50/70 dark:bg-white/[0.02] border border-gray-200/80 dark:border-gray-800 p-2 sm:p-2.5 space-y-1.5 text-xs">
          
          {/* Row 1: Customer & Shipping Inline Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0">Customer:</span>
              <span className="font-bold text-gray-900 dark:text-white truncate">{order.customer_name || 'Guest'}</span>
              {order.customer_phone && (
                <span className="font-mono text-gray-500 text-[11px] shrink-0 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                  <span>{order.customer_phone}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0">Ship to:</span>
              <span className="text-gray-700 dark:text-gray-300 truncate" title={fullAddress}>
                {fullAddress || 'No address provided'}
              </span>
            </div>
          </div>

          {/* Optional Customer Note - Compact Sleek Inline Callout */}
          {otherNotes.length > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-200">
              <span className="font-bold uppercase text-[9.5px] text-amber-800 dark:text-amber-300 shrink-0">Note:</span>
              <span className="truncate">{otherNotes.join(' · ')}</span>
            </div>
          )}

          {/* Row 2: Financial Summary Compact Bar */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200/60 dark:border-gray-800/60">
            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 text-[11px]">
              <span>Subtotal: <strong className="text-gray-800 dark:text-gray-200">{formatPrice(order.subtotal || order.total, settings.currency_symbol)}</strong></span>
              {order.shipping_amount !== undefined && order.shipping_amount > 0 && (
                <span>Shipping: <strong className="text-gray-800 dark:text-gray-200">{formatPrice(order.shipping_amount, settings.currency_symbol)}</strong></span>
              )}
              {order.discount_amount !== undefined && order.discount_amount > 0 && (
                <span className="text-emerald-600 dark:text-emerald-400">Discount: -{formatPrice(order.discount_amount, settings.currency_symbol)}</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10.5px] font-bold text-gray-400 uppercase">Total:</span>
              <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                {formatPrice(order.total, settings.currency_symbol)}
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Sticky Bottom Actions */}
      <div className="px-3 sm:px-5 py-2.5 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#16162a] flex items-center justify-between gap-2 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors cursor-pointer"
        >
          Close
        </button>

        <div className="flex items-center gap-2">
          {whatsAppUrl && (
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] dark:text-[#25D366] text-xs font-bold border border-[#25D366]/30 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          )}

          <button
            type="button"
            onClick={handleOpenFullOrder}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Open Full Order</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Modal>

    <ImagePreviewModal
      url={previewImageUrl}
      onClose={() => setPreviewImageUrl(null)}
    />
    </>
  );
}
