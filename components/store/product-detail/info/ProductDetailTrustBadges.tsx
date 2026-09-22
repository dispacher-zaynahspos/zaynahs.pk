'use client';

import React from 'react';
import { Package, Truck, Tag } from '@/components/common/Icons';
import { StoreSettings } from '@/lib/types';
import PaymentBadges from '@/components/common/PaymentBadges';

interface ProductDetailTrustBadgesProps {
  settings: StoreSettings;
  mounted: boolean;
}

export function ProductDetailTrustBadges({ settings, mounted }: ProductDetailTrustBadgesProps) {
  if (!mounted || !settings.enableTrustBadges) return null;

  return (
    <>
      {/* Trust Badges Panel */}
      <div className="border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 rounded-2xl p-5 space-y-4 animate-fade-in transition-colors">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
          {settings.deliveryEstimateText && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 bg-white dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-xl text-gray-700 dark:text-gray-300">
                <Package className="h-5 w-5" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-semibold">
                {settings.deliveryEstimateText}
              </p>
            </div>
          )}

          {settings.freeShippingText && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 bg-white dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-xl text-gray-700 dark:text-gray-300">
                <Truck className="h-5 w-5" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-semibold">
                {settings.freeShippingText}
              </p>
            </div>
          )}
        </div>

        {settings.promoCodeText && (
          <div className="flex items-center gap-3 justify-center text-center">
            <Tag className="h-4 w-4 text-[#e94560]" />
            <p className="text-xs text-gray-600 dark:text-gray-300 font-bold">
              {settings.promoCodeText}
            </p>
          </div>
        )}
      </div>

      {/* Safe Checkout Block */}
      {settings.safeCheckoutMethods && settings.safeCheckoutMethods.length > 0 && (
        <div className="border border-gray-200 dark:border-gray-800 bg-gray-50/20 dark:bg-white/5 rounded-2xl p-4 text-center space-y-3 transition-colors">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
            {settings.safeCheckoutText || 'Guarantee Safe Checkout:'}
          </span>
          <PaymentBadges
            methods={settings.safeCheckoutMethods}
            className="flex flex-wrap items-center justify-center gap-2"
          />
        </div>
      )}
    </>
  );
}
