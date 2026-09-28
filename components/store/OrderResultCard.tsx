'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Truck, CheckCircle, Clock } from '@/components/common/Icons';
import { formatPrice } from '@/lib/utils/whatsapp';
import type { Order } from '@/lib/types';

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'] as const;

function statusLabel(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Pending';
}

/**
 * Shared order summary card (SSOT). Rendered by both /track-order (phone-gated lookup)
 * and /order/[token] (public token lookup). Any change to how an order is displayed to
 * the customer lives here only.
 */
export default function OrderResultCard({ order, currencySymbol }: { order: Order; currencySymbol: string }) {
  const currentIdx = STATUS_STEPS.indexOf(order.status as (typeof STATUS_STEPS)[number]);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="mt-6 space-y-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] p-5 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 dark:border-white/10 pb-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Order</div>
          <div className="text-base font-black text-gray-900 dark:text-white">#{order.order_number}</div>
        </div>
        <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${
          isCancelled ? 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400'
            : order.status === 'delivered' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
            : 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400'
        }`}>
          {statusLabel(order.status)}
        </span>
      </div>

      {/* Status timeline */}
      {!isCancelled && (
        <div className="flex items-center justify-between">
          {STATUS_STEPS.map((step, i) => {
            const done = i <= currentIdx;
            const Icon = step === 'delivered' ? CheckCircle : step === 'shipped' ? Truck : step === 'processing' ? Package : Clock;
            return (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center gap-1">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${done ? 'text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`} style={done ? { backgroundColor: 'var(--color-primary, #C2185B)' } : undefined}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wide ${done ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{step}</span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-1 ${i < currentIdx ? '' : 'bg-gray-200 dark:bg-gray-700'}`} style={i < currentIdx ? { backgroundColor: 'var(--color-primary, #C2185B)' } : undefined} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Tracking link */}
      {order.tracking_url && (
        <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5">
          <Truck className="h-4 w-4" />
          Track with {order.courier_name || 'courier'}
          {order.tracking_number ? ` (${order.tracking_number})` : ''}
        </a>
      )}

      {/* Items */}
      <div className="space-y-2">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-black/30">
              {item.product?.images?.[0]?.url && (
                <Image src={item.product.images[0].url} alt={item.product.name} fill sizes="48px" className="object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">{item.product?.name}</div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">Qty {item.quantity}</div>
            </div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">{formatPrice(item.total || item.unit_price * item.quantity, currencySymbol)}</div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-1 border-t border-gray-100 dark:border-white/10 pt-3 text-sm">
        <div className="flex justify-between text-gray-500 dark:text-gray-400"><span>Subtotal</span><span>{formatPrice(order.subtotal, currencySymbol)}</span></div>
        {(order.discount_amount ?? 0) > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-{formatPrice(order.discount_amount as number, currencySymbol)}</span></div>}
        {(order.shipping_amount ?? 0) > 0 && <div className="flex justify-between text-gray-500 dark:text-gray-400"><span>Shipping</span><span>{formatPrice(order.shipping_amount as number, currencySymbol)}</span></div>}
        <div className="flex justify-between text-base font-black text-gray-900 dark:text-white pt-1"><span>Total</span><span>{formatPrice(order.total, currencySymbol)}</span></div>
      </div>

      {/* Payment proof (customer-uploaded transfer screenshot) */}
      {order.payment_proof_url && (
        <div className="border-t border-gray-100 dark:border-white/10 pt-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Payment Proof</div>
          <a href={order.payment_proof_url} target="_blank" rel="noopener noreferrer" className="block relative w-full max-w-[240px] aspect-[3/4] overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/30">
            <Image src={order.payment_proof_url} alt="Payment proof" fill sizes="240px" className="object-contain" />
          </a>
        </div>
      )}

      <Link href="/shop" className="block text-center text-[13px] font-bold text-[#e94560] hover:underline">Continue Shopping</Link>
    </div>
  );
}
