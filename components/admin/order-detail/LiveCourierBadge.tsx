'use client';

import React, { useState } from 'react';
import { Truck, ExternalLink, Check, Copy, ChevronDown, ChevronUp, Clock } from '@/components/common/Icons';
import { usePostExLiveTracking } from '@/lib/postex/usePostExLiveTracking';

interface LiveCourierBadgeProps {
  trackingNumber?: string | null;
  courierName?: string | null;
  orderStatus?: string;
  compact?: boolean;
  variant?: 'card' | 'badge';
  className?: string;
}

export default function LiveCourierBadge({
  trackingNumber,
  courierName = 'PostEx',
  orderStatus,
  compact = false,
  variant = 'badge',
  className = '',
}: LiveCourierBadgeProps) {
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const cn = (trackingNumber || '').trim();
  const { data: liveData, loading } = usePostExLiveTracking(cn || null);

  if (!cn) return null;

  const resolvedCourier = courierName || liveData?.courier?.name || 'PostEx';
  const trackingUrl =
    liveData?.courier?.trackingUrl ||
    `https://postex.pk/tracking?cn=${encodeURIComponent(cn)}`;

  const copyCn = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(cn);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const rawStatus = liveData?.rawStatus;
  const clean = (liveData?.cleanStatus || '').toUpperCase();

  // Status color resolver
  const isDelivered = clean === 'DELIVERED' || rawStatus?.toLowerCase().includes('delivered');
  const isTransit =
    clean === 'IN_TRANSIT' ||
    clean === 'OUT_FOR_DELIVERY' ||
    rawStatus?.toLowerCase().includes('transit') ||
    rawStatus?.toLowerCase().includes('warehouse') ||
    rawStatus?.toLowerCase().includes('delivery');
  const isReturned = clean === 'RETURNED' || rawStatus?.toLowerCase().includes('return');

  const statusBg = isDelivered
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30'
    : isReturned
    ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30'
    : isTransit
    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30'
    : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30';

  const dotColor = isDelivered
    ? 'bg-emerald-500'
    : isReturned
    ? 'bg-red-500'
    : isTransit
    ? 'bg-blue-500'
    : 'bg-amber-500';

  // 1. Compact Variant (For small tables or tight spaces)
  if (compact) {
    if (loading) {
      return (
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 ${className}`}>
          <span className="w-2.5 h-2.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin shrink-0" />
          <span>Tracking...</span>
        </span>
      );
    }

    const displayStatus = rawStatus || (clean ? clean.replace(/_/g, ' ') : orderStatus || 'Booked');

    return (
      <a
        href={trackingUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        title={`${resolvedCourier}: ${cn} · Click to track`}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-bold border transition-transform hover:scale-105 ${statusBg} ${className}`}
      >
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-75`} />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColor}`} />
        </span>
        <span className="truncate max-w-[120px]">{displayStatus}</span>
      </a>
    );
  }

  // 2. Full Courier Card Variant (Mirroring Storefront Order Track Tab with Expandable Chronological Updates)
  if (variant === 'card') {
    return (
      <div className={`w-full max-w-full rounded-xl border border-gray-200/80 dark:border-gray-800 bg-gray-50/70 dark:bg-white/[0.02] p-3 sm:p-4 space-y-3 overflow-hidden shadow-2xs ${className}`}>
        {/* Header: Courier Partner & Consignment Number (CN) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 shrink-0">
              <Truck className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block leading-tight">
                Courier Partner
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {resolvedCourier}
              </span>
            </div>
          </div>

          {/* Consignment Number (CN) & 1-Click Copy */}
          <div className="flex items-center gap-2 bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg shadow-2xs">
            <span className="text-[10px] font-extrabold uppercase text-gray-400">CN:</span>
            <span className="text-xs sm:text-sm font-black font-mono text-gray-900 dark:text-white tracking-wide">
              {cn}
            </span>
            <button
              type="button"
              onClick={copyCn}
              title="Copy Consignment Number"
              className="ml-1 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
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
        </div>

        {/* Loading Courier Status */}
        {loading && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-200/60 dark:border-gray-800 text-xs text-gray-500">
            <span className="inline-block w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin shrink-0" />
            <span className="animate-pulse">Checking real-time courier tracking...</span>
          </div>
        )}

        {/* Live Status with Expandable History Toggle */}
        {!loading && rawStatus && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-200/60 dark:border-gray-800 text-xs">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-75`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
              </span>
              <span className="font-semibold text-gray-700 dark:text-gray-300 truncate">
                Live Status: <span className="font-bold text-emerald-600 dark:text-emerald-400">{rawStatus}</span>
              </span>
            </div>

            {liveData?.timeline && liveData.timeline.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 flex items-center gap-0.5 cursor-pointer py-0.5 px-1.5 rounded hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
              >
                <span>{showHistory ? 'Hide history' : `View history (${liveData.timeline.length})`}</span>
                {showHistory ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>
        )}

        {/* Fallback booked state if courier tracking exists but live data is pending */}
        {!loading && !rawStatus && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-200/60 dark:border-gray-800 text-xs text-gray-500">
            <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
            <span>Courier Booked · Tracking active</span>
          </div>
        )}

        {/* Expandable Chronological Delivery Updates Timeline */}
        {showHistory && liveData?.timeline && liveData.timeline.length > 0 && (
          <div className="pt-2 border-t border-gray-200/60 dark:border-gray-800 space-y-2.5 animate-in fade-in duration-150">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
              Chronological Delivery Updates
            </span>
            <div className="space-y-2.5 pl-2.5 border-l-2 border-emerald-500/40">
              {liveData.timeline.map((event, i) => (
                <div key={i} className="text-xs space-y-0.5 pl-2 relative">
                  <div className="font-bold text-gray-900 dark:text-white leading-snug">
                    {event.transactionStatusMessage || 'Status Update'}
                  </div>
                  {(event.datetime || event.createdDatetime) && (
                    <div className="flex items-center gap-1 text-[10.5px] text-gray-400">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span>
                        {new Date(event.datetime || event.createdDatetime || '').toLocaleString('en-PK', {
                          timeZone: 'Asia/Karachi',
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* External Courier Portal Redirect Link */}
        {trackingUrl && (
          <div className="pt-1">
            <a
              href={trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] py-2 px-3 text-xs font-bold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all shadow-2xs"
            >
              <ExternalLink className="h-3.5 w-3.5 text-emerald-600" />
              Track on {resolvedCourier} Portal
            </a>
          </div>
        )}
      </div>
    );
  }

  // 3. Inline Badge Variant (With Safe Bounds & Zero Canvas Overflow)
  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-xl border bg-white dark:bg-[#16162a] shadow-2xs max-w-full min-w-0 flex-wrap sm:flex-nowrap ${
        isDelivered ? 'border-emerald-200 dark:border-emerald-900/40' : 'border-gray-200 dark:border-gray-700'
      } ${className}`}
    >
      <div className="flex items-center gap-1.5 shrink-0">
        <Truck className="w-3.5 h-3.5 text-orange-500 shrink-0" />
        <span className="text-[10px] font-extrabold uppercase text-gray-400">{resolvedCourier}:</span>
        <span className="text-[11.5px] font-mono font-bold text-gray-900 dark:text-white">
          {cn}
        </span>
        <button
          type="button"
          onClick={copyCn}
          title="Copy Consignment Number"
          className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>

      {loading ? (
        <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-gray-400 pl-1 border-l border-gray-200 dark:border-gray-800 shrink-0">
          <span className="w-2.5 h-2.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin shrink-0" />
          <span>Tracking...</span>
        </span>
      ) : rawStatus ? (
        <div className="flex items-center gap-1.5 pl-1.5 border-l border-gray-200 dark:border-gray-800 min-w-0 flex-1">
          <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 min-w-0 ${statusBg}`}>
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColor}`} />
            </span>
            <span className="truncate max-w-[120px] sm:max-w-[180px]">{rawStatus}</span>
          </span>
        </div>
      ) : (
        <span className="text-[10.5px] font-semibold text-blue-600 dark:text-blue-400 pl-1 border-l border-gray-200 dark:border-gray-800 shrink-0">
          Active
        </span>
      )}

      <a
        href={trackingUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        title="Open courier portal"
        className="p-1 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shrink-0"
      >
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}
