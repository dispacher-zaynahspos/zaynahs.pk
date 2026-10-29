'use client';

import React from 'react';
import { Truck, Clock, Sparkles, Heart } from '@/components/common/Icons';

interface ShippingThresholdsCardProps {
  // Free Shipping
  freeShippingBarEnabled: boolean;
  setFreeShippingBarEnabled: (v: boolean) => void;
  freeShippingThreshold: number;
  setFreeShippingThreshold: (v: number) => void;
  currencySymbol: string;

  // Cart Recommendations / Recently Viewed
  cartRecommendationsEnabled: boolean;
  setCartRecommendationsEnabled: (v: boolean) => void;
  cartRecommendationsSource: 'recently_viewed' | 'best_selling' | 'new_arrivals' | 'featured';
  setCartRecommendationsSource: (v: 'recently_viewed' | 'best_selling' | 'new_arrivals' | 'featured') => void;
  cartRecommendationsTitle: string;
  setCartRecommendationsTitle: (v: string) => void;
  recentlyViewedLimit: number;
  setRecentlyViewedLimit: (v: number) => void;

  // Wishlist Recommendations / Recently Viewed
  wishlistRecommendationsEnabled: boolean;
  setWishlistRecommendationsEnabled: (v: boolean) => void;
  wishlistRecommendationsSource: 'recently_viewed' | 'best_selling' | 'new_arrivals' | 'featured';
  setWishlistRecommendationsSource: (v: 'recently_viewed' | 'best_selling' | 'new_arrivals' | 'featured') => void;
  wishlistRecommendationsTitle: string;
  setWishlistRecommendationsTitle: (v: string) => void;
  wishlistRecommendationsLimit: number;
  setWishlistRecommendationsLimit: (v: number) => void;

  // Cart Expiry Timer
  cartTimerMinutes: number;
  setCartTimerMinutes: (v: number) => void;
  cartTimerMessage: string;
  setCartTimerMessage: (v: string) => void;
}

export default function ShippingThresholdsCard({
  freeShippingBarEnabled,
  setFreeShippingBarEnabled,
  freeShippingThreshold,
  setFreeShippingThreshold,
  currencySymbol,
  cartRecommendationsEnabled,
  setCartRecommendationsEnabled,
  cartRecommendationsSource,
  setCartRecommendationsSource,
  cartRecommendationsTitle,
  setCartRecommendationsTitle,
  recentlyViewedLimit,
  setRecentlyViewedLimit,
  wishlistRecommendationsEnabled,
  setWishlistRecommendationsEnabled,
  wishlistRecommendationsSource,
  setWishlistRecommendationsSource,
  wishlistRecommendationsTitle,
  setWishlistRecommendationsTitle,
  wishlistRecommendationsLimit,
  setWishlistRecommendationsLimit,
  cartTimerMinutes,
  setCartTimerMinutes,
  cartTimerMessage,
  setCartTimerMessage,
}: ShippingThresholdsCardProps) {
  return (
    <div className="bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-sm font-extrabold text-[#e94560] uppercase tracking-wider flex items-center gap-2">
          Cart & Wishlist Cross-Sell, Urgency & Delivery
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Configure free delivery trigger, cart & wishlist product recommendations, and cart reservation timer.
        </p>
      </div>

      {/* ── 1. FREE SHIPPING OFFER & THRESHOLD ── */}
      <div className="bg-gray-50/70 dark:bg-[#0f0f1b]/70 border border-gray-200/80 dark:border-gray-800 rounded-xl p-4.5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-200/70 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Truck className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
                  Free Shipping Offer & Progress Bar
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  freeShippingBarEnabled
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                    : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  {freeShippingBarEnabled ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                When enabled, buyers see a progress bar on cart and unlock free delivery when cart reaches the minimum threshold.
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={freeShippingBarEnabled}
            onClick={() => setFreeShippingBarEnabled(!freeShippingBarEnabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              freeShippingBarEnabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                freeShippingBarEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Free Shipping Minimum Threshold Input */}
        <div className={`space-y-1.5 transition-opacity ${freeShippingBarEnabled ? 'opacity-100' : 'opacity-50'}`}>
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between">
            <span>Free Shipping Minimum Threshold ({currencySymbol || 'Rs.'})</span>
            {!freeShippingBarEnabled && (
              <span className="text-[10px] text-amber-500 font-semibold">Disabled (Standard shipping applies to all orders)</span>
            )}
          </label>
          <input
            type="number"
            min="0"
            disabled={!freeShippingBarEnabled}
            value={freeShippingThreshold}
            onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
            placeholder="10000"
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-[#e94560] disabled:cursor-not-allowed"
          />
          <p className="text-[10px] text-gray-400">
            Cart subtotal must equal or exceed this amount to unlock free delivery.
          </p>
        </div>
      </div>

      {/* ── 2. CART PRODUCT RECOMMENDATIONS & RECENTLY VIEWED ── */}
      <div className="bg-gray-50/70 dark:bg-[#0f0f1b]/70 border border-gray-200/80 dark:border-gray-800 rounded-xl p-4.5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-200/70 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
                  Cart Recommendations & Recently Viewed
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  cartRecommendationsEnabled
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                    : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  {cartRecommendationsEnabled ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                Display curated cross-sell products or recently viewed items below the cart. Automatically hides items already added to cart.
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={cartRecommendationsEnabled}
            onClick={() => setCartRecommendationsEnabled(!cartRecommendationsEnabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              cartRecommendationsEnabled ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                cartRecommendationsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {cartRecommendationsEnabled && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            {/* Source Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                Recommendation Source
              </label>
              <select
                value={cartRecommendationsSource}
                onChange={(e) =>
                  setCartRecommendationsSource(
                    e.target.value as 'recently_viewed' | 'best_selling' | 'new_arrivals' | 'featured'
                  )
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-[#e94560] cursor-pointer"
              >
                <option value="recently_viewed">Recently Viewed (Auto-fallback to Best Sellers)</option>
                <option value="best_selling">Best Selling Products</option>
                <option value="new_arrivals">New Arrivals / Latest Products</option>
                <option value="featured">Featured Products</option>
              </select>
              <p className="text-[10px] text-gray-400">
                {cartRecommendationsSource === 'recently_viewed'
                  ? 'Shows buyer browsed items, backfilling from catalog if none exist.'
                  : `Curates top items from your ${cartRecommendationsSource.replace('_', ' ')} list.`}
              </p>
            </div>

            {/* Section Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                Section Heading Title
              </label>
              <input
                type="text"
                value={cartRecommendationsTitle}
                onChange={(e) => setCartRecommendationsTitle(e.target.value)}
                placeholder="You May Also Like"
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-[#e94560]"
              />
              <p className="text-[10px] text-gray-400">Heading title displayed above recommendations on /cart.</p>
            </div>

            {/* Product Limit */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                Max Products Display Limit
              </label>
              <input
                type="number"
                min="2"
                max="12"
                value={recentlyViewedLimit}
                onChange={(e) => setRecentlyViewedLimit(Math.max(2, Math.min(12, Number(e.target.value))))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-[#e94560]"
              />
              <p className="text-[10px] text-gray-400">Number of products rendered (2 to 12).</p>
            </div>
          </div>
        )}

        <div className="p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-[11px] text-blue-700 dark:text-blue-300 flex items-start gap-2">
          <span className="shrink-0 text-sm">💡</span>
          <span>
            <strong>Smart Deduping Rule:</strong> Any item currently added to the buyer&apos;s cart is automatically hidden from recommendations, keeping the cart clean and focused on additional items.
          </span>
        </div>
      </div>

      {/* ── 3. WISHLIST RECOMMENDATIONS & RECENTLY VIEWED ── */}
      <div className="bg-gray-50/70 dark:bg-[#0f0f1b]/70 border border-gray-200/80 dark:border-gray-800 rounded-xl p-4.5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-200/70 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
              <Heart className="h-4 w-4 fill-rose-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
                  Wishlist Recommendations & Recently Viewed
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  wishlistRecommendationsEnabled
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                    : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  {wishlistRecommendationsEnabled ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                Display curated cross-sell or recently viewed items below wishlist products. Excludes items already in user&apos;s wishlist or cart.
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={wishlistRecommendationsEnabled}
            onClick={() => setWishlistRecommendationsEnabled(!wishlistRecommendationsEnabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              wishlistRecommendationsEnabled ? 'bg-rose-600' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                wishlistRecommendationsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {wishlistRecommendationsEnabled && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            {/* Source Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                Recommendation Source
              </label>
              <select
                value={wishlistRecommendationsSource}
                onChange={(e) =>
                  setWishlistRecommendationsSource(
                    e.target.value as 'recently_viewed' | 'best_selling' | 'new_arrivals' | 'featured'
                  )
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-[#e94560] cursor-pointer"
              >
                <option value="recently_viewed">Recently Viewed (Auto-fallback to Catalog)</option>
                <option value="best_selling">Best Selling Products</option>
                <option value="new_arrivals">New Arrivals / Latest Products</option>
                <option value="featured">Featured Products</option>
              </select>
              <p className="text-[10px] text-gray-400">
                {wishlistRecommendationsSource === 'recently_viewed'
                  ? 'Shows buyer browsed items, backfilling from catalog if none exist.'
                  : `Curates top items from your ${wishlistRecommendationsSource.replace('_', ' ')} list.`}
              </p>
            </div>

            {/* Section Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                Section Heading Title
              </label>
              <input
                type="text"
                value={wishlistRecommendationsTitle}
                onChange={(e) => setWishlistRecommendationsTitle(e.target.value)}
                placeholder="Recommended for You"
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-[#e94560]"
              />
              <p className="text-[10px] text-gray-400">Heading title displayed above recommendations on /wishlist.</p>
            </div>

            {/* Product Limit */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                Max Products Display Limit
              </label>
              <input
                type="number"
                min="2"
                max="12"
                value={wishlistRecommendationsLimit}
                onChange={(e) => setWishlistRecommendationsLimit(Math.max(2, Math.min(12, Number(e.target.value))))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-[#e94560]"
              />
              <p className="text-[10px] text-gray-400">Number of products rendered (2 to 12).</p>
            </div>
          </div>
        )}

        <div className="p-2.5 rounded-lg bg-rose-50/70 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-[11px] text-rose-700 dark:text-rose-300 flex items-start gap-2">
          <span className="shrink-0 text-sm">❤️</span>
          <span>
            <strong>Smart Deduping Rule:</strong> Any item currently added to the buyer&apos;s Wishlist or Cart is automatically hidden from recommendations, keeping recommendations fresh.
          </span>
        </div>
      </div>

      {/* ── 4. CART EXPIRY RESERVATION TIMER ── */}
      <div className="bg-gray-50/70 dark:bg-[#0f0f1b]/70 border border-gray-200/80 dark:border-gray-800 rounded-xl p-4.5 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-200/70 dark:border-gray-800">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
              Cart Reservation Timer & Urgency
            </span>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Urgency banner displayed at the top of the cart reserving items for a limited duration.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
              Cart Expiry Reservation Timer (Minutes)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={cartTimerMinutes}
              onChange={(e) => setCartTimerMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-[#e94560]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
              Cart Expiry Message Template
            </label>
            <input
              type="text"
              value={cartTimerMessage}
              onChange={(e) => setCartTimerMessage(e.target.value)}
              placeholder="Items in your cart are reserved for {timer} minutes."
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-[#e94560]"
            />
            <p className="text-[10px] text-gray-400">
              Use <code className="bg-gray-200 dark:bg-white/10 px-1 rounded">{'{timer}'}</code> as placeholder for minutes remaining.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
