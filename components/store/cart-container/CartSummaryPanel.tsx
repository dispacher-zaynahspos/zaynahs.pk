'use client';

import React from 'react';
import { Tag, Truck, CheckCircle2, Shield } from '@/components/common/Icons';
import { CartItem, StoreSettings } from '@/lib/types';
import { formatPrice } from '@/lib/utils/whatsapp';
import PaymentBadges from '@/components/common/PaymentBadges';
import CartItemCard from './CartItemCard';

interface CartSummaryPanelProps {
  compact?: boolean;
  settings: StoreSettings;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  shippingCost: number;
  loadingMethods: boolean;
  appliedCoupon: any;
  applyCoupon: (coupon: any) => void;
  discountCode: string;
  setDiscountCode: (code: string) => void;
  couponError: string;
  setCouponError: (err: string) => void;
  handleApplyDiscount: (e: React.MouseEvent) => void;
  qualifiesForFreeShipping: boolean;
  freeShippingThreshold: number;
  amountToFreeShipping: number;
  shippingPercent: number;
  qualifiesForVolumeDiscount: boolean;
  volumeDiscountThreshold: number;
  volumeDiscountPercentage: number;
  volumeDiscountAmount: number;
  couponDiscountAmount: number;
  finalTotal: number;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
}

export default function CartSummaryPanel({
  compact = false,
  settings,
  items,
  subtotal,
  itemCount,
  shippingCost,
  loadingMethods,
  appliedCoupon,
  applyCoupon,
  discountCode,
  setDiscountCode,
  couponError,
  setCouponError,
  handleApplyDiscount,
  qualifiesForFreeShipping,
  freeShippingThreshold,
  amountToFreeShipping,
  shippingPercent,
  qualifiesForVolumeDiscount,
  volumeDiscountThreshold,
  volumeDiscountPercentage,
  volumeDiscountAmount,
  couponDiscountAmount,
  finalTotal,
  removeItem,
  updateQuantity,
}: CartSummaryPanelProps) {
  return (
    <div className={`space-y-4 ${compact ? '' : 'bg-gray-50 dark:bg-[#16162a]/30 rounded-2xl p-5 border border-gray-100 dark:border-gray-800'}`}>
      {!compact && (
        <h3 className="text-base font-black text-gray-900 dark:text-white">Order Summary</h3>
      )}

      {/* Items in summary (compact mode) */}
      {compact && (
        <div className="space-y-2 pb-3 border-b border-gray-200 dark:border-gray-800 max-h-52 overflow-y-auto">
          {items.map(item => (
            <CartItemCard
              key={item.id}
              item={item}
              compact
              settings={settings}
              removeItem={removeItem}
              updateQuantity={updateQuantity}
            />
          ))}
        </div>
      )}

      {/* Discount input */}
      {settings.coupon_codes_enabled !== false && (
        <div className="flex gap-2">
          {appliedCoupon ? (
            <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/20 px-3 py-2.5 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 w-full">
              <span className="flex items-center gap-1.5 truncate">
                <Tag className="w-3.5 h-3.5 shrink-0" />
                Promo: <strong className="font-extrabold">{appliedCoupon.code}</strong> ({appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.value}%` : `${formatPrice(appliedCoupon.value, settings.currencySymbol)} Off`})
              </span>
              <button
                type="button"
                onClick={() => applyCoupon(null)}
                className="text-red-500 hover:text-red-600 dark:hover:text-red-400 font-extrabold text-[10px] uppercase px-2 py-1 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer shrink-0 ml-2"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2 w-full flex-col">
              <div className="flex gap-2 w-full">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Discount code"
                    value={discountCode}
                    onChange={e => { setDiscountCode(e.target.value.toUpperCase()); setCouponError(''); }}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#e94560] focus:outline-none transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyDiscount}
                  disabled={!discountCode.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#1a1a2e] hover:bg-[#e94560] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                >
                  Apply
                </button>
              </div>
              {couponError && (
                <p className="text-[11px] font-semibold text-red-500 dark:text-red-400 flex items-center gap-1 ml-1">
                  <span>!</span> {couponError}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Free Shipping Tracker */}
      {settings.free_shipping_bar_enabled !== false && (
        <div className="space-y-1.5 py-1">
          <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
            {qualifiesForFreeShipping ? (
              <span className="text-emerald-500 dark:text-emerald-400 flex items-center gap-1.5">
                <Truck className="w-4 h-4" /> You've unlocked free shipping!
              </span>
            ) : (
              <span>Add {formatPrice(amountToFreeShipping, settings.currencySymbol)} for free shipping</span>
            )}
            <span>{formatPrice(freeShippingThreshold, settings.currencySymbol)}</span>
          </div>
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${qualifiesForFreeShipping ? 'bg-emerald-500' : 'bg-[#e94560]'}`}
              style={{ width: `${shippingPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Volume Discount Hint */}
      {!qualifiesForVolumeDiscount && settings.volume_discounts_enabled !== false && (
        <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 dark:bg-amber-500/10 px-2.5 py-1.5 rounded-lg w-full text-center flex items-center justify-center gap-1 border border-amber-500/20 select-none">
          <span>💡 Buy {volumeDiscountThreshold} items to get {volumeDiscountPercentage}% off!</span>
        </div>
      )}

      {/* Price breakdown */}
      <div className="space-y-2.5 text-sm font-semibold">
        <div className="flex justify-between text-gray-500 dark:text-gray-400">
          <span>Subtotal · {itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
          <span className="text-gray-900 dark:text-white font-bold">{formatPrice(subtotal, settings.currencySymbol)}</span>
        </div>

        {volumeDiscountAmount > 0 && (
          <div className="flex justify-between text-emerald-500 font-bold">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Volume Discount ({volumeDiscountPercentage}% off)
            </span>
            <span>−{formatPrice(volumeDiscountAmount, settings.currencySymbol)}</span>
          </div>
        )}

        {couponDiscountAmount > 0 && (
          <div className="flex justify-between text-emerald-500 font-bold">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Promo Discount ({appliedCoupon?.code})
            </span>
            <span>−{formatPrice(couponDiscountAmount, settings.currencySymbol)}</span>
          </div>
        )}

        <div className="flex justify-between text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Truck className="h-3.5 w-3.5" />
            Shipping
          </span>
          <span className="text-gray-900 dark:text-white font-bold">{loadingMethods ? '...' : formatPrice(shippingCost, settings.currencySymbol)}</span>
        </div>

        <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-800 text-base font-black text-gray-900 dark:text-white">
          <span>Total</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-semibold text-gray-400">{settings.currency || 'PKR'}</span>
            <span className="text-xl text-[#e94560] font-black">{formatPrice(finalTotal, settings.currencySymbol)}</span>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      {settings.enableTrustBadges && settings.safeCheckoutMethods && settings.safeCheckoutMethods.length > 0 && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-800 space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-gray-400">
            <Shield className="h-3 w-3" />
            {settings.safeCheckoutText || 'Guaranteed Safe Checkout'}
          </div>
          <PaymentBadges methods={settings.safeCheckoutMethods} className="flex flex-wrap gap-1.5" />
        </div>
      )}
    </div>
  );
}
