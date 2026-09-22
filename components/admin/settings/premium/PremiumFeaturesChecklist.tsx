'use client';

import React from 'react';

interface PremiumFeaturesChecklistProps {
  recentBuyersEnabled: boolean;
  setRecentBuyersEnabled: (v: boolean) => void;
  cookieConsentEnabled: boolean;
  setCookieConsentEnabled: (v: boolean) => void;
  freeShippingBarEnabled: boolean;
  setFreeShippingBarEnabled: (v: boolean) => void;
  frequentlyBoughtTogetherEnabled: boolean;
  setFrequentlyBoughtTogetherEnabled: (v: boolean) => void;
  stockUrgencyEnabled: boolean;
  setStockUrgencyEnabled: (v: boolean) => void;
  flashSaleEnabled: boolean;
  setFlashSaleEnabled: (v: boolean) => void;
  socialFeedsEnabled: boolean;
  setSocialFeedsEnabled: (v: boolean) => void;
  cartTimerEnabled: boolean;
  setCartTimerEnabled: (v: boolean) => void;
  sizeGuideEnabled: boolean;
  setSizeGuideEnabled: (v: boolean) => void;
  couponCodesEnabled: boolean;
  setCouponCodesEnabled: (v: boolean) => void;
  enableFakeViews: boolean;
  setEnableFakeViews: (v: boolean) => void;
}

export function PremiumFeaturesChecklist({
  recentBuyersEnabled,
  setRecentBuyersEnabled,
  cookieConsentEnabled,
  setCookieConsentEnabled,
  freeShippingBarEnabled,
  setFreeShippingBarEnabled,
  frequentlyBoughtTogetherEnabled,
  setFrequentlyBoughtTogetherEnabled,
  stockUrgencyEnabled,
  setStockUrgencyEnabled,
  flashSaleEnabled,
  setFlashSaleEnabled,
  socialFeedsEnabled,
  setSocialFeedsEnabled,
  cartTimerEnabled,
  setCartTimerEnabled,
  sizeGuideEnabled,
  setSizeGuideEnabled,
  couponCodesEnabled,
  setCouponCodesEnabled,
  enableFakeViews,
  setEnableFakeViews,
}: PremiumFeaturesChecklistProps) {
  return (
    <div className="bg-white dark:bg-[#16162a] border border-gray-200/80 dark:border-gray-800/80 rounded-xl p-5 sm:p-6 shadow-xs space-y-3.5">
      <h3 className="text-xs font-black text-[var(--color-primary,#C2185B)] uppercase tracking-wider">Enable / Disable Premium Storefront Features</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400">Toggle individual storefront enhancements. Disabled features will be completely hidden from customers.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 pt-1">
        <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 hover:border-[var(--color-primary,#C2185B)]/40 transition cursor-pointer select-none">
          <input
            type="checkbox"
            checked={recentBuyersEnabled}
            onChange={(e) => setRecentBuyersEnabled(e.target.checked)}
            className="rounded border-gray-300 text-[var(--color-primary,#C2185B)] focus:ring-[var(--color-primary,#C2185B)] h-4 w-4"
          />
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Recent Buyers Ticker</span>
        </label>

        <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 hover:border-[var(--color-primary,#C2185B)]/40 transition cursor-pointer select-none">
          <input
            type="checkbox"
            checked={cookieConsentEnabled}
            onChange={(e) => setCookieConsentEnabled(e.target.checked)}
            className="rounded border-gray-300 text-[var(--color-primary,#C2185B)] focus:ring-[var(--color-primary,#C2185B)] h-4 w-4"
          />
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Cookie Consent Banner</span>
        </label>

        <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 hover:border-[var(--color-primary,#C2185B)]/40 transition cursor-pointer select-none">
          <input
            type="checkbox"
            checked={freeShippingBarEnabled}
            onChange={(e) => setFreeShippingBarEnabled(e.target.checked)}
            className="rounded border-gray-300 text-[var(--color-primary,#C2185B)] focus:ring-[var(--color-primary,#C2185B)] h-4 w-4"
          />
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Free Shipping Progress Bar</span>
        </label>

        <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 hover:border-[var(--color-primary,#C2185B)]/40 transition cursor-pointer select-none">
          <input
            type="checkbox"
            checked={frequentlyBoughtTogetherEnabled}
            onChange={(e) => setFrequentlyBoughtTogetherEnabled(e.target.checked)}
            className="rounded border-gray-300 text-[var(--color-primary,#C2185B)] focus:ring-[var(--color-primary,#C2185B)] h-4 w-4"
          />
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Frequently Bought Bundles</span>
        </label>

        <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 hover:border-[var(--color-primary,#C2185B)]/40 transition cursor-pointer select-none">
          <input
            type="checkbox"
            checked={stockUrgencyEnabled}
            onChange={(e) => setStockUrgencyEnabled(e.target.checked)}
            className="rounded border-gray-300 text-[var(--color-primary,#C2185B)] focus:ring-[var(--color-primary,#C2185B)] h-4 w-4"
          />
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Low Stock Urgency</span>
        </label>

        <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 hover:border-[var(--color-primary,#C2185B)]/40 transition cursor-pointer select-none">
          <input
            type="checkbox"
            checked={flashSaleEnabled}
            onChange={(e) => setFlashSaleEnabled(e.target.checked)}
            className="rounded border-gray-300 text-[var(--color-primary,#C2185B)] focus:ring-[var(--color-primary,#C2185B)] h-4 w-4"
          />
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Flash Sale Countdown</span>
        </label>

        <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 hover:border-[var(--color-primary,#C2185B)]/40 transition cursor-pointer select-none">
          <input
            type="checkbox"
            checked={socialFeedsEnabled}
            onChange={(e) => setSocialFeedsEnabled(e.target.checked)}
            className="rounded border-gray-300 text-[var(--color-primary,#C2185B)] focus:ring-[var(--color-primary,#C2185B)] h-4 w-4"
          />
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Social Feeds Embeds</span>
        </label>

        <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 hover:border-[var(--color-primary,#C2185B)]/40 transition cursor-pointer select-none">
          <input
            type="checkbox"
            checked={cartTimerEnabled}
            onChange={(e) => setCartTimerEnabled(e.target.checked)}
            className="rounded border-gray-300 text-[var(--color-primary,#C2185B)] focus:ring-[var(--color-primary,#C2185B)] h-4 w-4"
          />
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Cart Expiry Countdown</span>
        </label>

        <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 hover:border-[var(--color-primary,#C2185B)]/40 transition cursor-pointer select-none">
          <input
            type="checkbox"
            checked={sizeGuideEnabled}
            onChange={(e) => setSizeGuideEnabled(e.target.checked)}
            className="rounded border-gray-300 text-[var(--color-primary,#C2185B)] focus:ring-[var(--color-primary,#C2185B)] h-4 w-4"
          />
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Size Guide Modal</span>
        </label>

        <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 hover:border-[var(--color-primary,#C2185B)]/40 transition cursor-pointer select-none">
          <input
            type="checkbox"
            checked={couponCodesEnabled}
            onChange={(e) => setCouponCodesEnabled(e.target.checked)}
            className="rounded border-gray-300 text-[var(--color-primary,#C2185B)] focus:ring-[var(--color-primary,#C2185B)] h-4 w-4"
          />
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Store Coupon Discount Field</span>
        </label>

        <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 hover:border-[var(--color-primary,#C2185B)]/40 transition cursor-pointer select-none">
          <input
            type="checkbox"
            checked={enableFakeViews}
            onChange={(e) => setEnableFakeViews(e.target.checked)}
            className="rounded border-gray-300 text-[var(--color-primary,#C2185B)] focus:ring-[var(--color-primary,#C2185B)] h-4 w-4"
          />
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Live Viewer Counter</span>
        </label>
      </div>
    </div>
  );
}
