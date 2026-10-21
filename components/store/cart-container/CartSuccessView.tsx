'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  CheckCircle2,
  Truck,
  MapPin,
  Phone,
  Mail,
  Copy,
  Check,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Clock,
  WhatsAppIcon,
} from '@/components/common/Icons';
import { StoreSettings, ProductImage, ProductModifier } from '@/lib/types';
import { formatPrice, cleanWhatsAppPhone } from '@/lib/utils/whatsapp';
import { getSharedAspectClass } from '@/lib/utils/styles';
import { getPresetImageUrl } from '@/lib/utils/imageUrl';
import { getPaymentMethodIcon } from '@/components/common/PaymentBadges';
import type { PlacedOrder } from './hooks/useCheckoutFormState';

interface CartSuccessViewProps {
  placedOrder: PlacedOrder | null;
  settings: StoreSettings;
  onContinueShopping: () => void;
}

export default function CartSuccessView({ placedOrder, settings, onContinueShopping }: CartSuccessViewProps) {
  const [copied, setCopied] = useState(false);

  if (!placedOrder) return null;

  const formattedDate = new Date(placedOrder.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const handleCopyOrderNumber = () => {
    if (!placedOrder?.orderNumber) return;
    try {
      navigator.clipboard.writeText(placedOrder.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
    }
  };

  const isCOD =
    !placedOrder.paymentMethodName ||
    placedOrder.paymentMethodName.toLowerCase().includes('cod') ||
    placedOrder.paymentMethodName.toLowerCase().includes('cash');

  const paymentIcon =
    getPaymentMethodIcon(placedOrder.paymentMethodName || '') ||
    (isCOD ? '/payments/cod.ico' : null);

  // WhatsApp support link
  const waNumber = settings.floating_whatsapp_number || settings.whatsapp_number;
  const whatsappUrl =
    placedOrder.whatsappUrl ||
    (waNumber
      ? `https://wa.me/${cleanWhatsAppPhone(waNumber)}?text=${encodeURIComponent(
          `Hi, I just placed Order #${placedOrder.orderNumber} for ${formatPrice(
            placedOrder.total,
            settings.currency_symbol
          )}. Please confirm my order details.`
        )}`
      : null);

  const itemCount = placedOrder.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 via-white to-gray-50 dark:from-[#0b0b14] dark:via-[#0f0f1b] dark:to-[#0b0b14] text-gray-900 dark:text-white py-8 sm:py-12 px-3 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8 animate-fade-in">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex justify-center items-center gap-2 text-xs text-gray-400 font-semibold select-none">
          <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">Home</Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <Link href="/shop" className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">Shop</Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-gray-900 dark:text-white font-bold">Order Confirmed</span>
        </nav>

        {/* Celebratory Hero Header */}
        <section className="text-center relative py-6 sm:py-8 px-4 rounded-3xl bg-linear-to-b from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-950/30 dark:via-emerald-950/10 dark:to-transparent border border-emerald-500/20 dark:border-emerald-500/15 shadow-sm">
          {/* Animated Checkmark Badge */}
          <div className="relative mx-auto mb-4 flex items-center justify-center">
            <div className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-500/20 dark:bg-emerald-500/15 animate-ping opacity-60" />
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 dark:from-emerald-500 dark:to-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 ring-4 ring-white dark:ring-[#16162a]">
              <CheckCircle2 className="w-9 h-9 sm:w-11 sm:h-11" />
            </div>
          </div>

          <span className="inline-block px-3 py-1 mb-2 rounded-full text-xs font-black tracking-wide uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/60">
            Order Placed Successfully 🎉
          </span>

          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Thank you, {placedOrder.customerName ? placedOrder.customerName.split(' ')[0] : 'Valued Customer'}!
          </h1>

          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-lg mx-auto font-medium leading-relaxed">
            We’ve received your order and are already getting it ready for delivery. A confirmation message has been recorded.
          </p>

          {/* Order ID Pill with 1-Click Copy */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 shadow-xs">
              <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Order No:</span>
              <span className="text-sm sm:text-base font-black text-gray-900 dark:text-white font-mono">
                {placedOrder.orderNumber}
              </span>
              <button
                type="button"
                onClick={handleCopyOrderNumber}
                aria-label="Copy order number"
                className="ml-1 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all cursor-pointer"
                title="Copy order number"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/70 dark:bg-[#16162a]/70 border border-gray-200/80 dark:border-gray-800/80 text-xs font-semibold text-gray-500 dark:text-gray-400">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </section>

        {/* Visual Order Journey Tracker */}
        <section className="bg-white dark:bg-[#16162a] p-5 sm:p-7 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-sm sm:text-base font-black text-gray-900 dark:text-white">Delivery Timeline</h2>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/50">
              <Clock className="w-3 h-3" />
              Estimated Delivery: 2–4 Business Days
            </span>
          </div>

          {/* Stepper Bar */}
          <div className="grid grid-cols-4 gap-2 pt-2">
            {[
              { label: 'Placed', status: 'Completed', icon: CheckCircle2, active: true },
              { label: 'Confirmed', status: 'In Process', icon: Package, active: false },
              { label: 'Dispatched', status: 'With Courier', icon: Truck, active: false },
              { label: 'Delivered', status: 'At Doorstep', icon: ShieldCheck, active: false },
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.label} className="flex flex-col items-center text-center relative">
                  {idx > 0 && (
                    <div
                      className={`absolute top-4 -left-1/2 w-full h-1 -z-0 ${
                        idx === 1 ? 'bg-linear-to-r from-emerald-500 to-gray-200 dark:to-gray-800' : 'bg-gray-200 dark:bg-gray-800'
                      }`}
                    />
                  )}
                  <div
                    className={`relative z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs transition-transform ${
                      step.active
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-4 ring-emerald-100 dark:ring-emerald-950/80'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="mt-2 text-xs font-bold text-gray-900 dark:text-white">{step.label}</span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold hidden sm:inline-block">
                    {step.status}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Main Content Two-Column Grid on Desktop, Stack on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Items & Payment Instructions (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Ordered Items Card */}
            <section className="bg-white dark:bg-[#16162a] rounded-3xl border border-gray-200/80 dark:border-gray-800 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-gray-400" />
                  <h2 className="text-base font-black text-gray-900 dark:text-white tracking-tight">Order Details</h2>
                </div>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-800/80">
                {placedOrder.items.map((item) => {
                  const img = getPresetImageUrl(
                    item.product.images?.find((i: ProductImage) => i.is_primary)?.url || item.product.images?.[0]?.url || '',
                    'card'
                  );
                  const parts: string[] = [];
                  if (item.selected_variant?.color) parts.push(item.selected_variant.color);
                  if (item.selected_variant?.size) parts.push(item.selected_variant.size);
                  if (item.selected_variant?.material) parts.push(item.selected_variant.material);
                  if (item.selected_variant?.custom_value) parts.push(item.selected_variant.custom_value);
                  const variantStr = parts.join(' · ');

                  return (
                    <div key={item.id} className="flex items-start justify-between py-4 gap-3 text-sm font-semibold">
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 overflow-hidden rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f1b] ${getSharedAspectClass(
                            settings.image_aspect_ratio
                          )}`}
                        >
                          {img ? (
                            <Image src={img} alt={item.product.name} fill className="object-cover" unoptimized sizes="64px" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Package className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug">
                            {item.product.name}
                          </h3>
                          {variantStr && (
                            <span className="inline-block mt-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                              {variantStr}
                            </span>
                          )}
                          {item.selected_modifiers && item.selected_modifiers.length > 0 && (
                            <span className="text-[11px] text-gray-400 dark:text-gray-500 block font-semibold mt-0.5">
                              + {item.selected_modifiers.map((m: ProductModifier) => m.name).join(', ')}
                            </span>
                          )}
                          <div className="mt-1 flex items-center gap-2 text-xs text-gray-400 font-bold">
                            <span>Qty: {item.quantity}</span>
                            <span>•</span>
                            <span>{formatPrice(item.unit_price, settings.currency_symbol)} each</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm sm:text-base font-black text-gray-900 dark:text-white font-mono">
                          {formatPrice(item.unit_price * item.quantity, settings.currency_symbol)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Payment & COD Instructions Card */}
            <section className="bg-white dark:bg-[#16162a] rounded-3xl border border-gray-200/80 dark:border-gray-800 p-5 sm:p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <h2 className="text-base font-black text-gray-900 dark:text-white tracking-tight">Payment Instructions</h2>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-800 dark:text-gray-200">
                  {paymentIcon && (
                    <div className="h-4 w-4 rounded bg-white dark:bg-white/10 p-0.5 flex items-center justify-center shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={paymentIcon} alt="" className="h-3.5 w-3.5 object-contain" />
                    </div>
                  )}
                  <span>{placedOrder.paymentMethodName || 'Cash on Delivery'}</span>
                </div>
              </div>

              {placedOrder.paymentInstructions ? (
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {placedOrder.paymentInstructions}
                </div>
              ) : isCOD ? (
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-xs sm:text-sm text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-2.5">
                  <span className="text-base leading-none">💵</span>
                  <div>
                    <strong className="block font-bold mb-0.5">Cash on Delivery (COD):</strong>
                    <span>
                      Please keep{' '}
                      <strong className="underline decoration-amber-500 font-black">
                        {formatPrice(placedOrder.total, settings.currency_symbol)}
                      </strong>{' '}
                      in exact cash ready for the courier rider when your parcel arrives.
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed italic">
                  Payment has been logged. Thank you!
                </p>
              )}
            </section>
          </div>

          {/* Right Column: Pricing Breakdown, Address, Actions (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Financial Summary Card */}
            <section className="bg-white dark:bg-[#16162a] rounded-3xl border border-gray-200/80 dark:border-gray-800 p-5 sm:p-6 shadow-xs space-y-4">
              <h2 className="text-base font-black text-gray-900 dark:text-white tracking-tight border-b border-gray-100 dark:border-gray-800 pb-3">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm font-semibold">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900 dark:text-white font-mono">
                    {formatPrice(placedOrder.subtotal, settings.currency_symbol)}
                  </span>
                </div>

                {placedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount</span>
                    <span className="font-bold font-mono">
                      -{formatPrice(placedOrder.discountAmount, settings.currency_symbol)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600 dark:text-gray-300 items-center">
                  <span>Shipping</span>
                  {placedOrder.shippingCost === 0 ? (
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900/50">
                      FREE
                    </span>
                  ) : (
                    <span className="font-bold text-gray-900 dark:text-white font-mono">
                      {formatPrice(placedOrder.shippingCost, settings.currency_symbol)}
                    </span>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-baseline">
                  <div>
                    <span className="block text-base font-black text-gray-900 dark:text-white">Total Amount</span>
                    <span className="text-[11px] text-gray-400 font-medium">Inclusive of all charges</span>
                  </div>
                  <span
                    className="text-xl sm:text-2xl font-black font-mono"
                    style={{ color: 'var(--color-primary, #e94560)' }}
                  >
                    {formatPrice(placedOrder.total, settings.currency_symbol)}
                  </span>
                </div>
              </div>
            </section>

            {/* Delivery & Customer Details Card */}
            <section className="bg-white dark:bg-[#16162a] rounded-3xl border border-gray-200/80 dark:border-gray-800 p-5 sm:p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <h2 className="text-base font-black text-gray-900 dark:text-white tracking-tight">Delivery Details</h2>
              </div>

              <div className="space-y-3 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                <div className="flex items-start gap-2.5">
                  <span className="font-bold text-gray-900 dark:text-white shrink-0">Recipient:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{placedOrder.customerName}</span>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <span>{placedOrder.address}</span>
                    {placedOrder.apartment && <span>, {placedOrder.apartment}</span>}
                    <div className="font-bold text-gray-900 dark:text-white mt-0.5">
                      {placedOrder.city}
                      {placedOrder.postalCode ? `, ${placedOrder.postalCode}` : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-1 border-t border-gray-50 dark:border-gray-800/60">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <a
                    href={`tel:${placedOrder.phone}`}
                    className="font-bold text-gray-900 dark:text-white hover:underline font-mono"
                  >
                    {placedOrder.phone}
                  </a>
                </div>

                {placedOrder.emailOrPhone && placedOrder.emailOrPhone.includes('@') && (
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 truncate">{placedOrder.emailOrPhone}</span>
                  </div>
                )}
              </div>
            </section>

            {/* Action Buttons & WhatsApp Support */}
            <section className="space-y-3 pt-1">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] active:scale-[0.98] text-white font-black text-sm transition-all duration-200 shadow-md shadow-emerald-500/20 cursor-pointer text-center"
                >
                  <WhatsAppIcon className="w-5 h-5 fill-current" />
                  <span>Chat on WhatsApp for Order Updates</span>
                </a>
              )}

              {placedOrder.orderTrackUrl && (
                <Link
                  href={placedOrder.orderTrackUrl}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-[#16162a] text-gray-800 dark:text-white font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer text-center"
                >
                  <Package className="w-4 h-4" />
                  <span>View Full Order Status</span>
                </Link>
              )}

              <button
                type="button"
                onClick={onContinueShopping}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm text-white active:scale-[0.98] transition-all duration-200 shadow-lg shadow-black/10 cursor-pointer border-none"
                style={{ backgroundColor: 'var(--color-primary, #e94560)' }}
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </section>
          </div>
        </div>

        {/* Security & Reassurance Footer Badges */}
        <div className="pt-6 border-t border-gray-200/80 dark:border-gray-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-white dark:bg-[#16162a] border border-gray-100 dark:border-gray-800/80 text-xs font-bold text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2">
            <span>🛡️</span>
            <span>100% Authentic</span>
          </div>
          <div className="p-3 rounded-2xl bg-white dark:bg-[#16162a] border border-gray-100 dark:border-gray-800/80 text-xs font-bold text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2">
            <span>🚚</span>
            <span>Fast Delivery</span>
          </div>
          <div className="p-3 rounded-2xl bg-white dark:bg-[#16162a] border border-gray-100 dark:border-gray-800/80 text-xs font-bold text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2">
            <span>🔄</span>
            <span>Easy Exchanges</span>
          </div>
          <div className="p-3 rounded-2xl bg-white dark:bg-[#16162a] border border-gray-100 dark:border-gray-800/80 text-xs font-bold text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2">
            <span>💬</span>
            <span>Quick Support</span>
          </div>
        </div>
      </div>
    </div>
  );
}
