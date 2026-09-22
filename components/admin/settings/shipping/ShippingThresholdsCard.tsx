'use client';

import React from 'react';

interface ShippingThresholdsCardProps {
  cartTimerMinutes: number;
  setCartTimerMinutes: (v: number) => void;
  cartTimerMessage: string;
  setCartTimerMessage: (v: string) => void;
  freeShippingThreshold: number;
  setFreeShippingThreshold: (v: number) => void;
  recentlyViewedLimit: number;
  setRecentlyViewedLimit: (v: number) => void;
  currencySymbol: string;
}

export default function ShippingThresholdsCard({
  cartTimerMinutes,
  setCartTimerMinutes,
  cartTimerMessage,
  setCartTimerMessage,
  freeShippingThreshold,
  setFreeShippingThreshold,
  recentlyViewedLimit,
  setRecentlyViewedLimit,
  currencySymbol,
}: ShippingThresholdsCardProps) {
  return (
    <div className="bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-5">
      <div>
        <h3 className="text-sm font-extrabold text-[#e94560] uppercase tracking-wider">
          Urgency & Shipping Thresholds
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Configure cart timer, free shipping trigger, and recently viewed product limits.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
            Cart Expiry Reservation Timer (Minutes)
          </label>
          <input
            type="number"
            min="1"
            value={cartTimerMinutes}
            onChange={(e) => setCartTimerMinutes(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-[#e94560]"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
            Free Shipping Minimum Threshold ({currencySymbol || 'Rs.'})
          </label>
          <input
            type="number"
            min="0"
            value={freeShippingThreshold}
            onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-[#e94560]"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
            Cart Expiry Message Template
          </label>
          <input
            type="text"
            value={cartTimerMessage}
            onChange={(e) => setCartTimerMessage(e.target.value)}
            placeholder="Items in your cart are reserved for {timer} minutes."
            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-[#e94560]"
          />
          <p className="text-[10px] text-gray-400">
            Use <code className="bg-gray-100 dark:bg-white/10 px-1 rounded">{'{timer}'}</code> as placeholder for minutes remaining.
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
            Recently Viewed Limit (Products count)
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={recentlyViewedLimit}
            onChange={(e) => setRecentlyViewedLimit(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-[#e94560]"
          />
          <p className="text-[10px] text-gray-400">Max products shown in Recently Viewed section.</p>
        </div>
      </div>
    </div>
  );
}
