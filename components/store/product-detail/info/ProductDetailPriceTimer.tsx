'use client';

import React from 'react';
import { ProductVariant, StoreSettings } from '@/lib/types';
import { formatPrice } from '@/lib/utils/whatsapp';

interface ProductDetailPriceTimerProps {
  settings: StoreSettings;
  selectedVariant?: ProductVariant;
  unitPrice: number;
  minPrice: number;
  maxPrice: number;
  hasPriceRange: boolean;
  productComparePrice?: number;
  mounted: boolean;
  timeLeft: { hours: number; minutes: number; seconds: number; expired: boolean; isIncoming: boolean; isInfinite: boolean };
  isPreorder?: boolean;
  preorderEndDate?: string | null;
  preorderDispatchDate?: string | null;
}

export function ProductDetailPriceTimer({
  settings,
  selectedVariant,
  unitPrice,
  minPrice,
  maxPrice,
  hasPriceRange,
  productComparePrice,
  mounted,
  timeLeft,
  isPreorder = false,
  preorderEndDate,
  preorderDispatchDate,
}: ProductDetailPriceTimerProps) {
  // Preorder countdown state
  const [preorderTime, setPreorderTime] = React.useState<{ days: number; hours: number; minutes: number; seconds: number; expired: boolean } | null>(null);

  React.useEffect(() => {
    if (!isPreorder || !preorderEndDate) {
      setPreorderTime(null);
      return;
    }

    const calc = () => {
      const target = new Date(preorderEndDate).getTime();
      const diff = target - Date.now();
      if (isNaN(diff) || diff <= 0) {
        setPreorderTime({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setPreorderTime({ days, hours, minutes, seconds, expired: false });
    };

    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [isPreorder, preorderEndDate]);
  return (
    <>
      {/* Pricing */}
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-2.5 flex-wrap">
          <span className="product-price text-2xl font-extrabold text-[#1a1a2e] dark:text-white">
            {hasPriceRange ? (
              `${formatPrice(minPrice, settings.currency_symbol)} – ${formatPrice(maxPrice, settings.currency_symbol)}`
            ) : (
              formatPrice(unitPrice, settings.currency_symbol)
            )}
          </span>
          {!hasPriceRange && (() => {
            const currentComparePrice = selectedVariant?.compare_price ?? productComparePrice;
            if (currentComparePrice && currentComparePrice > unitPrice) {
              return (
                <span
                  className="text-sm text-gray-400 line-through decoration-red-500 decoration-[1.5px] font-semibold font-body"
                  style={{
                    textDecoration: 'line-through',
                    textDecorationColor: '#ef4444',
                    WebkitTextDecorationColor: '#ef4444',
                    textDecorationThickness: '1.5px',
                    color: '#9ca3af',
                  }}
                >
                  {formatPrice(currentComparePrice, settings.currency_symbol)}
                </span>
              );
            }
            return null;
          })()}
        </div>

        {hasPriceRange && selectedVariant && (
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--color-primary)]/5 dark:bg-white/5 border border-gray-200 dark:border-gray-800 text-sm font-semibold mt-2.5 w-fit">
            <span className="text-gray-500 dark:text-gray-400">Selected option:</span>
            <span className="product-price text-base font-black text-gray-900 dark:text-white leading-none">
              {formatPrice(unitPrice, settings.currency_symbol)}
            </span>
            {(() => {
              const currentComparePrice = selectedVariant.compare_price;
              if (currentComparePrice && currentComparePrice > unitPrice) {
                return (
                  <span
                    className="text-xs text-gray-400 line-through decoration-red-500 decoration-[1.5px] font-semibold font-body ml-1"
                    style={{
                      textDecoration: 'line-through',
                      textDecorationColor: '#ef4444',
                      WebkitTextDecorationColor: '#ef4444',
                      textDecorationThickness: '1.5px',
                      color: '#9ca3af',
                    }}
                  >
                    {formatPrice(currentComparePrice, settings.currency_symbol)}
                  </span>
                );
              }
              return null;
            })()}
          </div>
        )}
      </div>

      {/* Pre-Order Active Reservation & Countdown Banner */}
      {isPreorder && (
        <div className="rounded-2xl p-4 mt-2.5 border bg-amber-500/10 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/60 shadow-xs">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5 uppercase tracking-wide">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-amber-400"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <span>PRE-ORDER RESERVATION ACTIVE</span>
            </p>
            {preorderDispatchDate && (
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-200 bg-amber-200/60 dark:bg-amber-900/40 px-2 py-0.5 rounded-md">
                📦 Ships: {preorderDispatchDate}
              </span>
            )}
          </div>

          {preorderTime && !preorderTime.expired && (
            <div className="mt-2.5">
              <div className="text-[10px] font-bold text-amber-800/80 dark:text-amber-300/80 uppercase tracking-wider mb-1.5">
                Pre-Booking Closes In:
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                {preorderTime.days > 0 && (
                  <>
                    <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 font-extrabold w-11 py-1 rounded-lg shadow-sm border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
                      <span className="text-xs font-mono">{String(preorderTime.days).padStart(2, '0')}</span>
                      <span className="text-[7px] text-gray-400 font-normal">DAYS</span>
                    </div>
                    <span className="font-extrabold text-amber-600 dark:text-amber-400">:</span>
                  </>
                )}
                <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 font-extrabold w-11 py-1 rounded-lg shadow-sm border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
                  <span className="text-xs font-mono">{String(preorderTime.hours).padStart(2, '0')}</span>
                  <span className="text-[7px] text-gray-400 font-normal">HRS</span>
                </div>
                <span className="font-extrabold text-amber-600 dark:text-amber-400">:</span>
                <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 font-extrabold w-11 py-1 rounded-lg shadow-sm border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
                  <span className="text-xs font-mono">{String(preorderTime.minutes).padStart(2, '0')}</span>
                  <span className="text-[7px] text-gray-400 font-normal">MIN</span>
                </div>
                <span className="font-extrabold text-amber-600 dark:text-amber-400">:</span>
                <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 font-extrabold w-11 py-1 rounded-lg shadow-sm border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
                  <span className="text-xs font-mono">{String(preorderTime.seconds).padStart(2, '0')}</span>
                  <span className="text-[7px] text-gray-400 font-normal">SEC</span>
                </div>
              </div>
            </div>
          )}

          <p className="text-[11px] text-amber-900/90 dark:text-amber-200/90 mt-2 font-medium">
            🔒 Book your parcel now to lock guaranteed priority allocation before stock arrives.
          </p>
        </div>
      )}

      {/* Countdown timer for sales / urgency */}
      {mounted && !timeLeft.expired && (
        <div className={`rounded-2xl p-4 mt-2 border ${timeLeft.isIncoming
          ? 'bg-amber-50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/30'
          : 'bg-rose-50 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/30'
        }`}>
          <p className={`text-xs font-bold flex items-center gap-1.5 ${timeLeft.isIncoming ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${timeLeft.isIncoming ? 'bg-amber-400' : 'bg-rose-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${timeLeft.isIncoming ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
            </span>
            {timeLeft.isIncoming ? 'FLASH SALE — Starts In:' : 'FLASH SALE — Offer Active:'}
          </p>
          {!timeLeft.isInfinite ? (
            <div className="flex items-center gap-2 mt-2">
              <div className={`flex flex-col items-center justify-center bg-white dark:bg-gray-800 font-extrabold w-11 py-1 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 ${timeLeft.isIncoming ? 'text-amber-700 dark:text-amber-400' : 'text-rose-700 dark:text-rose-400'}`}>
                <span className="text-xs font-mono">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-[7px] text-gray-400 font-normal">HRS</span>
              </div>
              <span className={`font-extrabold ${timeLeft.isIncoming ? 'text-amber-500' : 'text-rose-500'}`}>:</span>
              <div className={`flex flex-col items-center justify-center bg-white dark:bg-gray-800 font-extrabold w-11 py-1 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 ${timeLeft.isIncoming ? 'text-amber-700 dark:text-amber-400' : 'text-rose-700 dark:text-rose-400'}`}>
                <span className="text-xs font-mono">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-[7px] text-gray-400 font-normal">MIN</span>
              </div>
              <span className={`font-extrabold ${timeLeft.isIncoming ? 'text-amber-500' : 'text-rose-500'}`}>:</span>
              <div className={`flex flex-col items-center justify-center bg-white dark:bg-gray-800 font-extrabold w-11 py-1 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 ${timeLeft.isIncoming ? 'text-amber-700 dark:text-amber-400' : 'text-rose-700 dark:text-rose-400'}`}>
                <span className="text-xs font-mono">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-[7px] text-gray-400 font-normal">SEC</span>
              </div>
            </div>
          ) : (
            <p className="text-xs font-semibold text-rose-500 dark:text-rose-400 mt-1">
              Special discounted price is currently active!
            </p>
          )}
        </div>
      )}
    </>
  );
}
