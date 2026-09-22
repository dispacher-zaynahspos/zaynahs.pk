'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package } from '@/components/common/Icons';
import { StoreSettings } from '@/lib/types';
import { formatPrice } from '@/lib/utils/whatsapp';
import { getSharedAspectClass } from '@/lib/utils/styles';
import { getPresetImageUrl } from '@/lib/utils/imageUrl';

interface CartSuccessViewProps {
  placedOrder: any;
  settings: StoreSettings;
  onContinueShopping: () => void;
}

export default function CartSuccessView({ placedOrder, settings, onContinueShopping }: CartSuccessViewProps) {
  if (!placedOrder) return null;

  const formattedDate = new Date(placedOrder.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f1b] text-gray-900 dark:text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8 animate-fade-in">
        {/* Breadcrumbs */}
        <div className="flex justify-center items-center gap-1.5 text-xs text-gray-400 font-bold select-none">
          <Link href="/" className="hover:text-[#e94560] transition-colors">Home</Link>
          <span>•</span>
          <Link href="/shop" className="hover:text-[#e94560] transition-colors">Shop</Link>
          <span>•</span>
          <span className="text-gray-900 dark:text-white font-extrabold">Checkout</span>
        </div>

        {/* Heading */}
        <div className="text-center">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Checkout</h1>
        </div>

        {/* Thank you banner */}
        <div className="border-l-4 border-emerald-500 bg-emerald-50/55 dark:bg-emerald-950/10 p-4 rounded-r-2xl">
          <h2 className="text-lg font-black text-emerald-800 dark:text-emerald-400">Thank you. Your order has been received.</h2>
        </div>

        {/* Quick info box */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 dark:bg-[#16162a] rounded-2xl border border-gray-100 dark:border-gray-800 text-xs sm:text-sm font-semibold">
          <div className="space-y-1">
            <span className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider block text-[10px]">Order number:</span>
            <strong className="text-gray-900 dark:text-white font-black">{placedOrder.orderNumber}</strong>
          </div>
          <div className="space-y-1">
            <span className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider block text-[10px]">Date:</span>
            <strong className="text-gray-900 dark:text-white font-black">{formattedDate}</strong>
          </div>
          <div className="space-y-1">
            <span className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider block text-[10px]">Total:</span>
            <strong className="text-gray-900 dark:text-white font-black">{formatPrice(placedOrder.total, settings.currencySymbol)}</strong>
          </div>
          <div className="space-y-1">
            <span className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider block text-[10px]">Payment method:</span>
            <strong className="text-gray-900 dark:text-white font-black">{placedOrder.paymentMethodName || 'Cash on delivery'}</strong>
          </div>
        </div>

        {placedOrder.paymentInstructions ? (
          <div className="p-5 bg-emerald-50/30 dark:bg-emerald-950/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/20 text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line shadow-sm">
            <strong className="block text-emerald-800 dark:text-emerald-400 mb-1.5 uppercase tracking-wider text-xs">
              📋 Payment Instructions / Details:
            </strong>
            {placedOrder.paymentInstructions}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed italic">
            Pay with cash upon delivery.
          </p>
        )}

        {/* Order Details Table */}
        <div className="space-y-4">
          <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight border-b border-gray-100 dark:border-gray-800 pb-2">Order details</h3>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {placedOrder.items.map((item: any) => {
              const img = getPresetImageUrl(item.product.images?.find((i: any) => i.isPrimary)?.url || item.product.images?.[0]?.url || '', 'micro');
              const parts: string[] = [];
              if (item.selectedVariant?.color) parts.push(item.selectedVariant.color);
              if (item.selectedVariant?.size) parts.push(item.selectedVariant.size);
              if (item.selectedVariant?.material) parts.push(item.selectedVariant.material);
              if (item.selectedVariant?.customValue) parts.push(item.selectedVariant.customValue);
              const variantStr = parts.join(' · ');

              return (
                <div key={item.id} className="flex items-center justify-between py-4 text-sm font-semibold">
                  <div className="flex items-center gap-3">
                    <div className={`relative w-12 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f1b] ${getSharedAspectClass(settings.imageAspectRatio)}`}>
                      {img ? (
                        <Image src={img} alt={item.product.name} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center"><Package className="h-4 w-4 text-gray-300" /></div>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-900 dark:text-white font-bold">{item.product.name}</span>
                      {variantStr && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 block font-semibold">{variantStr}</span>
                      )}
                      {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 block font-semibold">
                          + {item.selectedModifiers.map((m: any) => m.name).join(', ')}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 font-bold block mt-0.5">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="text-gray-900 dark:text-white font-black">{formatPrice(item.unitPrice * item.quantity, settings.currencySymbol)}</span>
                </div>
              );
            })}

            {/* Subtotal */}
            <div className="flex justify-between py-3.5 text-sm font-semibold">
              <span className="text-gray-500 dark:text-gray-400">Subtotal:</span>
              <span className="text-gray-900 dark:text-white font-black">{formatPrice(placedOrder.subtotal, settings.currencySymbol)}</span>
            </div>

            {/* Discounts if any */}
            {placedOrder.discountAmount > 0 && (
              <div className="flex justify-between py-3.5 text-sm font-semibold text-emerald-500">
                <span>Discount:</span>
                <span>-{formatPrice(placedOrder.discountAmount, settings.currencySymbol)}</span>
              </div>
            )}

            {/* Shipping */}
            <div className="flex justify-between py-3.5 text-sm font-semibold">
              <span className="text-gray-500 dark:text-gray-400">Shipping:</span>
              <span className="text-gray-900 dark:text-white font-bold">
                {formatPrice(placedOrder.shippingCost, settings.currencySymbol)} <span className="text-xs text-gray-400 font-semibold">via {placedOrder.shippingMethodName}</span>
              </span>
            </div>

            {/* Total */}
            <div className="flex justify-between py-4 text-base font-black text-gray-900 dark:text-white">
              <span>Total:</span>
              <span className="text-[#e94560] font-black text-lg">{formatPrice(placedOrder.total, settings.currencySymbol)}</span>
            </div>

            {/* Payment Method */}
            <div className="flex justify-between py-3.5 text-sm font-semibold">
              <span className="text-gray-500 dark:text-gray-400">Payment method:</span>
              <span className="text-gray-900 dark:text-white font-bold">{placedOrder.paymentMethodName || 'Cash on delivery'}</span>
            </div>
          </div>
        </div>

        {/* Addresses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className="space-y-3">
            <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight border-b border-gray-100 dark:border-gray-800 pb-2">Billing address</h3>
            <address className="text-sm font-semibold text-gray-500 dark:text-gray-400 not-italic leading-relaxed">
              {placedOrder.customerName}<br />
              {placedOrder.address}<br />
              {placedOrder.apartment && <>{placedOrder.apartment}<br /></>}
              {placedOrder.city}<br />
              {placedOrder.postalCode && <>{placedOrder.postalCode}<br /></>}
              {placedOrder.phone}<br />
              {placedOrder.emailOrPhone && <span className="lowercase">{placedOrder.emailOrPhone}</span>}
            </address>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight border-b border-gray-100 dark:border-gray-800 pb-2">Shipping address</h3>
            <address className="text-sm font-semibold text-gray-500 dark:text-gray-400 not-italic leading-relaxed">
              {placedOrder.customerName}<br />
              {placedOrder.address}<br />
              {placedOrder.apartment && <>{placedOrder.apartment}<br /></>}
              {placedOrder.city}<br />
              {placedOrder.postalCode && <>{placedOrder.postalCode}<br /></>}
              {placedOrder.phone}
            </address>
          </div>
        </div>

        {/* Action button */}
        <div className="pt-4 flex justify-center">
          <button
            onClick={onContinueShopping}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#e94560] hover:bg-[#d8344e] active:scale-95 text-white px-8 py-3.5 text-sm font-bold transition-all duration-200 shadow-lg shadow-red-500/20 cursor-pointer border-none"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
