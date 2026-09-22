'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Truck, Lock, HelpCircle, Send } from '@/components/common/Icons';
import { StoreSettings, ShippingMethod, PaymentMethod, CartItem } from '@/lib/types';
import { formatPrice } from '@/lib/utils/whatsapp';

interface CartCheckoutViewProps {
  settings: StoreSettings;
  items: CartItem[];
  emailOrPhone: string;
  setEmailOrPhone: (val: string) => void;
  firstName: string;
  setFirstName: (val: string) => void;
  lastName: string;
  setLastName: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
  apartment: string;
  setApartment: (val: string) => void;
  city: string;
  setCity: (val: string) => void;
  postalCode: string;
  setPostalCode: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  notes: string;
  setNotes: (val: string) => void;
  saveInfo: boolean;
  setSaveInfo: (val: boolean) => void;
  shippingMethods: ShippingMethod[];
  selectedShippingId: string | null;
  setSelectedShippingId: (id: string | null) => void;
  loadingMethods: boolean;
  paymentMethods: PaymentMethod[];
  selectedPaymentId: string | null;
  setSelectedPaymentId: (id: string | null) => void;
  loadingPayments: boolean;
  loading: boolean;
  onBackToCart: () => void;
  handleOrderSubmit: (e: React.FormEvent) => void;
  summaryPanel: React.ReactNode;
}

export default function CartCheckoutView({
  settings,
  items,
  emailOrPhone,
  setEmailOrPhone,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  address,
  setAddress,
  apartment,
  setApartment,
  city,
  setCity,
  postalCode,
  setPostalCode,
  phone,
  setPhone,
  notes,
  setNotes,
  saveInfo,
  setSaveInfo,
  shippingMethods,
  selectedShippingId,
  setSelectedShippingId,
  loadingMethods,
  paymentMethods,
  selectedPaymentId,
  setSelectedPaymentId,
  loadingPayments,
  loading,
  onBackToCart,
  handleOrderSubmit,
  summaryPanel,
}: CartCheckoutViewProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f1b] text-gray-900 dark:text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleOrderSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">

          {/* LEFT: Checkout form */}
          <div className="lg:col-span-7 space-y-6">

            {/* Back to cart */}
            <button
              type="button"
              onClick={onBackToCart}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-[#e94560] transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Cart
            </button>

            {/* Progress */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-gray-400">Cart</span>
              <ChevronRight className="h-3 w-3 text-gray-300" />
              <span className="text-[#e94560] font-black">Checkout</span>
              <ChevronRight className="h-3 w-3 text-gray-300" />
              <span className="text-gray-400">WhatsApp Confirm</span>
            </div>

            {/* Contact */}
            <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm space-y-4">
              <h2 className="text-base font-black text-gray-900 dark:text-white">Contact</h2>
              <input
                type="text"
                placeholder="Email or phone number"
                value={emailOrPhone}
                onChange={e => setEmailOrPhone(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-3 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
              />
            </div>

            {/* Delivery */}
            <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm space-y-4">
              <h2 className="text-base font-black text-gray-900 dark:text-white">Delivery Address</h2>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Country / Region</label>
                <div className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f1b] px-4 py-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
                  🇵🇰 Pakistan
                </div>
              </div>

              {/* Name grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">First Name<span className="text-red-500 ml-0.5">*</span></label>
                  <input
                    type="text" required placeholder="Ali"
                    value={firstName} onChange={e => setFirstName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-3 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Last Name<span className="text-red-500 ml-0.5">*</span></label>
                  <input
                    type="text" required placeholder="Hassan"
                    value={lastName} onChange={e => setLastName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-3 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Address<span className="text-red-500 ml-0.5">*</span></label>
                <input
                  type="text" required placeholder="Street address, house number"
                  value={address} onChange={e => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-3 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
                />
              </div>

              {/* Address Line 2 */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Address Line 2<span className="text-gray-500 ml-1 font-normal normal-case text-[9px]">(Optional)</span></label>
                <input
                  type="text" placeholder="Apartment, suite, floor"
                  value={apartment} onChange={e => setApartment(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-3 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
                />
              </div>

              {/* City + Postal */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">City<span className="text-red-500 ml-0.5">*</span></label>
                  <input
                    type="text" required placeholder="Karachi"
                    value={city} onChange={e => setCity(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-3 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Postal Code<span className="text-gray-500 ml-1 font-normal normal-case text-[9px]">(Optional)</span></label>
                  <input
                    type="text" placeholder="75500"
                    value={postalCode} onChange={e => setPostalCode(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-3 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
                  WhatsApp / Phone<span className="text-red-500 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel" required placeholder="0300 1234567"
                    value={phone} onChange={e => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-3 pr-10 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-help" title="We'll send your order confirmation here">
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Order notes */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Order Notes<span className="text-gray-500 ml-1 font-normal normal-case text-[9px]">(Optional)</span></label>
                <textarea
                  rows={2}
                  placeholder="Special instructions, colour preference, delivery timing..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-3 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all resize-none"
                />
              </div>

              {/* Save info */}
              <label className="flex items-center gap-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400 select-none cursor-pointer">
                <input
                  type="checkbox" checked={saveInfo} onChange={e => setSaveInfo(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 accent-[#e94560]"
                />
                <span>Save this info for next time</span>
              </label>
            </div>

            {/* Shipping Method */}
            <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm space-y-3">
              <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Truck className="h-4 w-4 text-[#e94560]" />
                Shipping Method
              </h2>
              {loadingMethods ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-12 rounded-xl bg-gray-100 dark:bg-gray-800" />
                  <div className="h-12 rounded-xl bg-gray-100 dark:bg-gray-800 opacity-60" />
                </div>
              ) : shippingMethods.length === 0 ? (
                <p className="text-sm text-gray-500">No shipping methods available. Contact via WhatsApp.</p>
              ) : (
                <div className="space-y-2">
                  {shippingMethods.map(method => {
                    const sel = selectedShippingId === method.id;
                    return (
                      <label key={method.id} className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${sel ? 'border-[#e94560] bg-red-50/30 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'}`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" name="shippingCheckout" checked={sel} onChange={() => setSelectedShippingId(method.id)} className="accent-[#e94560] h-4 w-4" />
                          <div>
                            <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{method.name}</div>
                            {method.estimatedDays && <div className="text-xs text-gray-400">{method.estimatedDays}</div>}
                          </div>
                        </div>
                        <span className={`text-sm font-black ${sel ? 'text-[#e94560]' : 'text-gray-600 dark:text-gray-300'}`}>
                          {formatPrice(method.cost, settings.currencySymbol)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm space-y-3">
              <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#e94560]" />
                Payment Method
              </h2>
              {loadingPayments ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-12 rounded-xl bg-gray-100 dark:bg-gray-800" />
                </div>
              ) : paymentMethods.length === 0 ? (
                <p className="text-sm text-gray-500">No payment methods available.</p>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    {paymentMethods.map(method => {
                      const sel = selectedPaymentId === method.id;
                      return (
                        <div key={method.id} className="space-y-2">
                          <label className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${sel ? 'border-[#e94560] bg-red-50/30 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'}`}>
                            <div className="flex items-center gap-3">
                              <input type="radio" name="paymentCheckout" checked={sel} onChange={() => setSelectedPaymentId(method.id)} className="accent-[#e94560] h-4 w-4" />
                              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{method.name}</span>
                            </div>
                            <span className="text-xs font-semibold px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-gray-600 dark:text-gray-400 uppercase">
                              {method.code}
                            </span>
                          </label>
                          
                          {sel && method.instructions && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800/80 text-xs text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line shadow-inner animate-fade-in">
                              <span className="font-extrabold block text-gray-800 dark:text-gray-200 mb-1.5 uppercase tracking-wider text-[10px]">
                                📋 Payment Instructions:
                              </span>
                              {method.instructions}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT: Summary + Submit */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
            {summaryPanel}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`relative overflow-hidden flex w-full items-center justify-center gap-2.5 rounded-2xl transition-all duration-200 shadow-lg shadow-red-500/20 cursor-pointer active:scale-98 text-white px-5 py-4.5 text-base font-black ${
                loading ? 'bg-[#d8344e] disabled:cursor-not-allowed' : 'bg-[#e94560] hover:bg-[#d8344e]'
              }`}
            >
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-[inherit] pointer-events-none z-10 bg-inherit">
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  <div className="flex items-center gap-2 relative z-10">
                    <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Processing...</span>
                  </div>
                </div>
              )}
              <div className={`flex items-center gap-2.5 transition-opacity ${loading ? 'opacity-0' : 'opacity-100'}`}>
                <Send className="h-5 w-5" />Confirm Order via WhatsApp
              </div>
            </button>

            <p className="text-center text-xs text-gray-400 font-semibold">
              🔒 Your information is safe · We only use it to process your order
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}
