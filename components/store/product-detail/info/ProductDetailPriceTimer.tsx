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
}: ProductDetailPriceTimerProps) {
  return (
    <>
      {/* Pricing */}
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-2.5 flex-wrap">
          <span className="product-price text-2xl font-extrabold text-[#1a1a2e] dark:text-white">
            {hasPriceRange ? (
              `${formatPrice(minPrice, settings.currencySymbol)} – ${formatPrice(maxPrice, settings.currencySymbol)}`
            ) : (
              formatPrice(unitPrice, settings.currencySymbol)
            )}
          </span>
          {!hasPriceRange && (() => {
            const currentComparePrice = selectedVariant?.comparePrice ?? productComparePrice;
            if (currentComparePrice && currentComparePrice > unitPrice) {
              const pct = Math.round(((currentComparePrice - unitPrice) / currentComparePrice) * 100);
              return (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400 line-through font-semibold font-body">
                    {formatPrice(currentComparePrice, settings.currencySymbol)}
                  </span>
                  <span className="rounded-md bg-[#e94560]/10 dark:bg-[#e94560]/20 px-2 py-0.5 text-[10px] font-black text-[#e94560] tracking-wide">
                    -{pct}%
                  </span>
                </div>
              );
            }
            return null;
          })()}
        </div>

        {hasPriceRange && selectedVariant && (
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--color-primary)]/5 dark:bg-white/5 border border-gray-200 dark:border-gray-800 text-sm font-semibold mt-2.5 w-fit">
            <span className="text-gray-500 dark:text-gray-400">Selected option:</span>
            <span className="product-price text-base font-black text-[#e94560] dark:text-[#e94560] leading-none">
              {formatPrice(unitPrice, settings.currencySymbol)}
            </span>
            {(() => {
              const currentComparePrice = selectedVariant.comparePrice;
              if (currentComparePrice && currentComparePrice > unitPrice) {
                const pct = Math.round(((currentComparePrice - unitPrice) / currentComparePrice) * 100);
                return (
                  <span className="inline-flex items-center gap-1.5 ml-1">
                    <span className="text-xs text-gray-400 line-through font-semibold font-body">
                      {formatPrice(currentComparePrice, settings.currencySymbol)}
                    </span>
                    <span className="rounded-md bg-[#e94560]/10 dark:bg-[#e94560]/20 px-1.5 py-0.5 text-[9px] font-black text-[#e94560] tracking-wide leading-none">
                      -{pct}%
                    </span>
                  </span>
                );
              }
              return null;
            })()}
          </div>
        )}
      </div>

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
