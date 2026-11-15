'use client';

import React, { useState } from 'react';
import { Truck, ExternalLink, Check, Copy } from '@/components/common/Icons';
import { usePostExLiveTracking } from '@/lib/postex/usePostExLiveTracking';

interface LiveCourierBadgeProps {
  trackingNumber?: string | null;
  courierName?: string | null;
  orderStatus?: string;
  compact?: boolean;
  className?: string;
}

export default function LiveCourierBadge({
  trackingNumber,
  courierName = 'PostEx',
  orderStatus,
  compact = false,
  className = '',
}: LiveCourierBadgeProps) {
  const [copied, setCopied] = useState(false);
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

  // Full Rich Variant (Order Detail Canvas & Quick View)
  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-xl border bg-white dark:bg-[#16162a] shadow-2xs ${
        isDelivered ? 'border-emerald-200 dark:border-emerald-900/40' : 'border-gray-200 dark:border-gray-700'
      } ${className}`}
    >
      <div className="flex items-center gap-1.5">
        <Truck className="w-3.5 h-3.5 text-orange-500 shrink-0" />
        <span className="text-[10px] font-extrabold uppercase text-gray-400">{resolvedCourier}:</span>
        <span className="text-[11.5px] font-mono font-bold text-gray-900 dark:text-white">
          {cn}
        </span>
        <button
          type="button"
          onClick={copyCn}
          title="Copy Consignment Number"
          className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>

      {loading ? (
        <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-gray-400 pl-1 border-l border-gray-200 dark:border-gray-800">
          <span className="w-2.5 h-2.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin shrink-0" />
          <span>Tracking...</span>
        </span>
      ) : rawStatus ? (
        <div className="flex items-center gap-1.5 pl-1.5 border-l border-gray-200 dark:border-gray-800">
          <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${statusBg}`}>
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColor}`} />
            </span>
            <span className="truncate max-w-[140px] sm:max-w-none">{rawStatus}</span>
          </span>
        </div>
      ) : (
        <span className="text-[10.5px] font-semibold text-blue-600 dark:text-blue-400 pl-1 border-l border-gray-200 dark:border-gray-800">
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
