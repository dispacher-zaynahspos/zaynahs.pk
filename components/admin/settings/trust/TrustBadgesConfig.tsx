'use client';

import React from 'react';

interface TrustBadgesConfigProps {
  enableTrustBadges: boolean;
  setEnableTrustBadges: (val: boolean) => void;
  deliveryEstimateText: string;
  setDeliveryEstimateText: (val: string) => void;
  freeShippingText: string;
  setFreeShippingText: (val: string) => void;
  promoCodeText: string;
  setPromoCodeText: (val: string) => void;
  safeCheckoutText: string;
  setSafeCheckoutText: (val: string) => void;
  safeCheckoutMethods: string[];
  setSafeCheckoutMethods: (updateFn: (prev: string[]) => string[]) => void;
}

export default function TrustBadgesConfig({
  enableTrustBadges,
  setEnableTrustBadges,
  deliveryEstimateText,
  setDeliveryEstimateText,
  freeShippingText,
  setFreeShippingText,
  promoCodeText,
  setPromoCodeText,
  safeCheckoutText,
  setSafeCheckoutText,
  safeCheckoutMethods,
  setSafeCheckoutMethods,
}: TrustBadgesConfigProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
          Enable Trust Badges
        </span>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={enableTrustBadges}
            onChange={(e) => setEnableTrustBadges(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e94560]" />
        </label>
      </div>

      {enableTrustBadges && (
        <div className="space-y-3 pt-1 animate-fade-in">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
              Delivery Estimate Text
            </label>
            <input
              type="text"
              value={deliveryEstimateText}
              onChange={(e) => setDeliveryEstimateText(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
              Free Shipping & Returns Text
            </label>
            <input
              type="text"
              value={freeShippingText}
              onChange={(e) => setFreeShippingText(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
              Promo Code Discount Text
            </label>
            <input
              type="text"
              value={promoCodeText}
              onChange={(e) => setPromoCodeText(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
            />
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
              Safe Checkout Title
            </label>
            <input
              type="text"
              value={safeCheckoutText}
              onChange={(e) => setSafeCheckoutText(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
            />

            {/* Checkboxes for payment methods */}
            <div className="pt-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Payment Badges to Display
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1.5">
                {[
                  { code: 'visa', label: 'Visa' },
                  { code: 'mastercard', label: 'Mastercard' },
                  { code: 'amex', label: 'Amex' },
                  { code: 'paypal', label: 'PayPal' },
                  { code: 'klarna', label: 'Klarna' },
                  { code: 'cirrus', label: 'Cirrus' },
                  { code: 'westernunion', label: 'Western Union' },
                  { code: 'cod', label: '💵 Cash on Delivery' },
                  { code: 'easypaisa', label: 'EasyPaisa' },
                  { code: 'jazzcash', label: 'JazzCash' },
                  { code: 'banktransfer', label: '🏦 Bank Transfer' },
                ].map(({ code, label }) => {
                  const isChecked = safeCheckoutMethods.includes(code);
                  return (
                    <label
                      key={code}
                      className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 dark:text-gray-300 select-none"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setSafeCheckoutMethods((prev) =>
                            isChecked ? prev.filter((m) => m !== code) : [...prev, code]
                          );
                        }}
                        className="rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-3.5 w-3.5"
                      />
                      <span>{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
