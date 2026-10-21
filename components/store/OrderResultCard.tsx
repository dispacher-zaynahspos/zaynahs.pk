'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  Truck,
  Shield,
  Check,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
} from '@/components/common/Icons';
import { formatPrice } from '@/lib/utils/whatsapp';
import type { Order } from '@/lib/types';
import { usePostExLiveTracking } from '@/lib/postex/usePostExLiveTracking';

const MILESTONE_STEPS = [
  { id: 'placed', label: 'Placed', icon: Check },
  { id: 'confirmed', label: 'Confirmed', icon: Package },
  { id: 'dispatched', label: 'Dispatched', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: Shield },
] as const;

function statusBadgeStyle(status: string, isCancelled: boolean) {
  if (isCancelled) return 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400';
  if (status === 'delivered') return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400';
  if (status === 'shipped') return 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400';
  return 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400';
}

function formatStatusLabel(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Pending';
}

/**
 * Shared order summary & tracking card (SSOT). Rendered by both /track-order
 * and /order/[token]. Real-time PostEx live tracking with 5-minute client cache,
 * modern 4-stage stepper, copy CN button, and direct courier redirect.
 */
export default function OrderResultCard({
  order,
  currencySymbol,
}: {
  order: Order;
  currencySymbol: string;
}) {
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Real-time live courier tracking (Edge-cached & 5-minute browser cache, 0 extra DB/Vercel load)
  const trackingNumber = order.tracking_number || null;
  const { data: liveData, loading: liveLoading } = usePostExLiveTracking(trackingNumber);

  const isCancelled = order.status === 'cancelled';

  // Determine active stepper index (0: Placed, 1: Confirmed, 2: Dispatched, 3: Delivered)
  const currentStepIdx = (() => {
    if (isCancelled) return -1;
    const clean = liveData?.cleanStatus;
    if (clean === 'DELIVERED' || order.status === 'delivered') return 3;
    if (
      clean === 'OUT_FOR_DELIVERY' ||
      clean === 'IN_TRANSIT' ||
      order.status === 'shipped'
    ) {
      return 2;
    }
    if (clean === 'BOOKED' || order.status === 'processing') return 1;
    return 0; // Placed
  })();

  const activeTrackingUrl =
    order.tracking_url ||
    (trackingNumber ? `https://postex.pk/tracking?cn=${encodeURIComponent(trackingNumber)}` : null);

  const courierName = order.courier_name || liveData?.courier?.name || 'PostEx';

  const copyCnToClipboard = () => {
    if (!trackingNumber) return;
    try {
      navigator.clipboard.writeText(trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore copy error
    }
  };

  return (
    <div className="mt-6 space-y-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] p-5 sm:p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 dark:border-white/10 pb-4">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Order</div>
          <div className="text-lg font-black text-gray-900 dark:text-white">#{order.order_number}</div>
        </div>
        <div className="flex items-center gap-2">
          {liveLoading && (
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              Checking Courier...
            </span>
          )}
          <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${statusBadgeStyle(order.status, isCancelled)}`}>
            {formatStatusLabel(order.status)}
          </span>
        </div>
      </div>

      {/* 4-Stage Stepper (Placed -> Confirmed -> Dispatched -> Delivered) */}
      {!isCancelled && (
        <div className="pt-2 pb-1">
          <div className="flex items-center justify-between relative">
            {MILESTONE_STEPS.map((step, idx) => {
              const isPastOrCurrent = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              const StepIcon = step.icon;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center gap-2 relative z-10 flex-1">
                    {/* Circle Node */}
                    <div
                      className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full transition-all duration-300 ${
                        isCurrent
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-4 ring-emerald-100 dark:ring-emerald-900/30 scale-105'
                          : isPastOrCurrent
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800/80 text-gray-400 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <StepIcon className="h-5 w-5" />
                    </div>

                    {/* Step Label */}
                    <span
                      className={`text-[11px] sm:text-xs font-bold tracking-tight text-center ${
                        isCurrent
                          ? 'text-emerald-700 dark:text-emerald-400 font-black'
                          : isPastOrCurrent
                          ? 'text-gray-900 dark:text-gray-200'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>

                  {/* Connecting Line */}
                  {idx < MILESTONE_STEPS.length - 1 && (
                    <div className="flex-1 -mx-2 mb-6 h-1 relative z-0">
                      <div className="h-full bg-gray-200 dark:bg-gray-800 rounded-full" />
                      <div
                        className="h-full bg-emerald-600 rounded-full absolute inset-0 transition-all duration-500"
                        style={{
                          width: idx < currentStepIdx ? '100%' : '0%',
                        }}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Courier & Consignment Number (CN) Card — Directly Below Stepper */}
      <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#0f0f1b]/50 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400">
              <Truck className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block leading-tight">
                Courier Partner
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {courierName}
              </span>
            </div>
          </div>

          {/* Consignment Number (CN) & 1-Click Copy */}
          {trackingNumber ? (
            <div className="flex items-center gap-2 bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase text-gray-400">CN:</span>
              <span className="text-xs sm:text-sm font-black font-mono text-gray-900 dark:text-white tracking-wide">
                {trackingNumber}
              </span>
              <button
                type="button"
                onClick={copyCnToClipboard}
                title="Copy Consignment Number"
                className="ml-1 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {copied ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                    <Check className="h-3.5 w-3.5" /> Copied
                  </span>
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          ) : (
            <span className="text-xs font-semibold text-gray-500 italic">
              CN will be assigned upon courier dispatch
            </span>
          )}
        </div>

        {/* Live Courier Status Milestone */}
        {liveData?.rawStatus && (
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200/60 dark:border-gray-800 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-gray-700 dark:text-gray-300 truncate">
                Live Status: <span className="font-bold text-emerald-600 dark:text-emerald-400">{liveData.rawStatus}</span>
              </span>
            </div>
            {liveData.timeline?.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="text-[11px] font-bold text-primary hover:underline shrink-0 flex items-center gap-0.5"
              >
                {showHistory ? 'Hide history' : `View history (${liveData.timeline.length})`}
                {showHistory ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            )}
          </div>
        )}

        {/* Expandable Live Milestone History */}
        {showHistory && liveData?.timeline && liveData.timeline.length > 0 && (
          <div className="pt-2 border-t border-gray-200/60 dark:border-gray-800 space-y-2.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
              Chronological Delivery Updates
            </span>
            <div className="space-y-2 pl-2 border-l-2 border-emerald-500/30">
              {liveData.timeline.map((event, i) => (
                <div key={i} className="text-xs space-y-0.5 pl-2 relative">
                  <div className="font-bold text-gray-900 dark:text-white">
                    {event.transactionStatusMessage || 'Status Update'}
                  </div>
                  {(event.datetime || event.createdDatetime) && (
                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                      <Clock className="h-3 w-3" />
                      {new Date(event.datetime || event.createdDatetime || '').toLocaleString('en-PK', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* External Courier Portal Redirect Link */}
        {activeTrackingUrl && (
          <div className="pt-1">
            <a
              href={activeTrackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] py-2.5 px-3 text-xs sm:text-sm font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all shadow-2xs"
            >
              <ExternalLink className="h-4 w-4 text-emerald-600" />
              Track on {courierName} Portal
            </a>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="space-y-2 pt-1">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
          Ordered Items ({order.items.length})
        </span>
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-black/30">
              {item.product?.images?.[0]?.url && (
                <Image
                  src={item.product.images[0].url}
                  alt={item.product.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                {item.product?.name}
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">
                Qty {item.quantity}
                {item.selected_variant?.custom_value ? ` · ${item.selected_variant.custom_value}` : ''}
              </div>
            </div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">
              {formatPrice(item.total || item.unit_price * item.quantity, currencySymbol)}
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-1.5 border-t border-gray-100 dark:border-white/10 pt-3 text-sm">
        <div className="flex justify-between text-gray-500 dark:text-gray-400">
          <span>Subtotal</span>
          <span>{formatPrice(order.subtotal, currencySymbol)}</span>
        </div>
        {(order.discount_amount ?? 0) > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span>Discount</span>
            <span>-{formatPrice(order.discount_amount as number, currencySymbol)}</span>
          </div>
        )}
        {(order.shipping_amount ?? 0) > 0 && (
          <div className="flex justify-between text-gray-500 dark:text-gray-400">
            <span>Shipping</span>
            <span>{formatPrice(order.shipping_amount as number, currencySymbol)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-black text-gray-900 dark:text-white pt-1 border-t border-gray-100 dark:border-white/5">
          <span>Total</span>
          <span>{formatPrice(order.total, currencySymbol)}</span>
        </div>
      </div>

      <Link
        href="/shop"
        className="block text-center text-xs font-bold text-[#EA580C] hover:underline pt-1"
      >
        Continue Shopping →
      </Link>
    </div>
  );
}
