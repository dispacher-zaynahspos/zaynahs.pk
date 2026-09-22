'use client';

import React from 'react';
import Link from 'next/link';
import {
  ChevronLeft, Trash2, ShoppingCart, Truck, Lock, ArrowRight, Clock
} from '@/components/common/Icons';
import { StoreSettings } from '@/lib/types';
import { formatPrice } from '@/lib/utils/whatsapp';
import { toast } from 'sonner';
import {
  CartItemCard,
  CartSummaryPanel,
  CartEmptyView,
  CartSuccessView,
  CartCheckoutView,
  useCartContainerState,
} from './cart-container';

interface CartContainerProps {
  settings: StoreSettings;
}

export default function CartContainer({ settings }: CartContainerProps) {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    view,
    setView,
    timeLeftStr,
    isTimerExpired,
    isConfirmingClear,
    setIsConfirmingClear,
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
    placedOrder,
    setPlacedOrder,
    shippingMethods,
    selectedShippingId,
    setSelectedShippingId,
    loadingMethods,
    paymentMethods,
    selectedPaymentId,
    setSelectedPaymentId,
    loadingPayments,
    loading,
    itemCount,
    handleOrderSubmit,
    summaryProps,
    router,
  } = useCartContainerState(settings);

  if (view === 'success' && placedOrder) {
    return (
      <CartSuccessView
        placedOrder={placedOrder}
        settings={settings}
        onContinueShopping={() => {
          localStorage.removeItem('last_placed_order');
          setPlacedOrder(null);
          router.push('/');
        }}
      />
    );
  }

  if (items.length === 0) {
    return <CartEmptyView />;
  }

  if (view === 'cart') {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0f0f1b] text-gray-900 dark:text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between w-full sm:w-auto">
              <Link
                href="/"
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-[#e94560] transition-colors whitespace-nowrap min-h-[44px] px-2 -ml-2 select-none"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Continue Shopping</span>
                <span className="sm:hidden">Back</span>
              </Link>

              <div className="sm:hidden">
                <button
                  type="button"
                  onClick={() => {
                    if (isConfirmingClear) {
                      clearCart();
                      toast.success('Cart cleared');
                      setIsConfirmingClear(false);
                    } else {
                      setIsConfirmingClear(true);
                    }
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all duration-200 min-h-[44px] select-none cursor-pointer border ${
                    isConfirmingClear
                      ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20 scale-105 active:scale-95'
                      : 'bg-transparent border-gray-200 dark:border-gray-800 text-gray-400 hover:text-[#e94560] hover:border-[#e94560]/30 dark:hover:border-[#e94560]/30 active:scale-95'
                  }`}
                >
                  <Trash2 className={`h-3.5 w-3.5 transition-transform ${isConfirmingClear ? 'animate-bounce text-white' : ''}`} />
                  <span>{isConfirmingClear ? 'Tap to Confirm' : 'Clear'}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-[#e94560]" />
                <h1 className="text-xl sm:text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                  Cart <span className="text-gray-400 font-semibold text-sm">({itemCount})</span>
                </h1>
              </div>

              {settings.cart_timer_enabled !== false && timeLeftStr && (
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                  isTimerExpired
                    ? 'text-rose-500 bg-rose-500/10 dark:text-rose-400/90'
                    : 'text-amber-600 bg-amber-500/10 dark:text-amber-400/90'
                }`}>
                  <Clock className="w-3.5 h-3.5 shrink-0 animate-pulse" />
                  <span>
                    {isTimerExpired ? "Reservation expired!" : `Reserved for ${timeLeftStr}`}
                  </span>
                </div>
              )}
            </div>

            <div className="hidden sm:block">
              <button
                type="button"
                onClick={() => {
                  if (isConfirmingClear) {
                    clearCart();
                    toast.success('Cart cleared');
                    setIsConfirmingClear(false);
                  } else {
                    setIsConfirmingClear(true);
                  }
                }}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all duration-200 min-h-[44px] select-none cursor-pointer border ${
                  isConfirmingClear
                    ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20 scale-105 active:scale-95'
                    : 'bg-transparent border-gray-200 dark:border-gray-800 text-gray-400 hover:text-[#e94560] hover:border-[#e94560]/30 dark:hover:border-[#e94560]/30 active:scale-95'
                }`}
              >
                <Trash2 className={`h-3.5 w-3.5 transition-transform ${isConfirmingClear ? 'animate-bounce text-white' : ''}`} />
                <span>{isConfirmingClear ? 'Confirm Clear?' : 'Clear'}</span>
              </button>
            </div>
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
            {/* LEFT: Item list */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm space-y-1">
                {items.map(item => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    compact={false}
                    settings={settings}
                    removeItem={removeItem}
                    updateQuantity={updateQuantity}
                  />
                ))}
              </div>

              {/* Shipping method selector in cart view */}
              <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <Truck className="h-4 w-4 text-[#e94560]" />
                  Choose Shipping
                </h3>
                {loadingMethods ? (
                  <div className="animate-pulse h-10 bg-gray-100 dark:bg-gray-800 rounded-xl" />
                ) : shippingMethods.length === 0 ? (
                  <p className="text-sm text-gray-400">Contact us for shipping options.</p>
                ) : (
                  <div className="grid gap-2">
                    {shippingMethods.map(method => {
                      const sel = selectedShippingId === method.id;
                      return (
                        <label
                          key={method.id}
                          className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${sel
                            ? 'border-[#e94560] bg-red-50/30 dark:bg-red-900/10'
                            : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="shipping"
                              checked={sel}
                              onChange={() => setSelectedShippingId(method.id)}
                              className="accent-[#e94560] h-4 w-4"
                            />
                            <div>
                              <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{method.name}</div>
                              {method.estimatedDays && (
                                <div className="text-xs text-gray-400 font-semibold">{method.estimatedDays}</div>
                              )}
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
            </div>

            {/* RIGHT: Order summary */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
              <CartSummaryPanel {...summaryProps} compact={false} />

              <button
                type="button"
                onClick={() => setView('checkout')}
                className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#1a1a2e] dark:bg-white text-white dark:text-[#1a1a2e] hover:bg-[#e94560] dark:hover:bg-[#e94560] dark:hover:text-white active:scale-98 px-5 py-4.5 text-base font-black transition-all duration-200 shadow-xl shadow-gray-900/10 dark:shadow-white/5 cursor-pointer group"
              >
                <Lock className="h-5 w-5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" />
                <span>Secure Checkout</span>
                <ArrowRight className="h-5 w-5 shrink-0 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-center text-xs text-gray-400 font-semibold">
                🔒 Secure WhatsApp checkout · No account required
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CartCheckoutView
      settings={settings}
      items={items}
      emailOrPhone={emailOrPhone}
      setEmailOrPhone={setEmailOrPhone}
      firstName={firstName}
      setFirstName={setFirstName}
      lastName={lastName}
      setLastName={setLastName}
      address={address}
      setAddress={setAddress}
      apartment={apartment}
      setApartment={setApartment}
      city={city}
      setCity={setCity}
      postalCode={postalCode}
      setPostalCode={setPostalCode}
      phone={phone}
      setPhone={setPhone}
      notes={notes}
      setNotes={setNotes}
      saveInfo={saveInfo}
      setSaveInfo={setSaveInfo}
      shippingMethods={shippingMethods}
      selectedShippingId={selectedShippingId}
      setSelectedShippingId={setSelectedShippingId}
      loadingMethods={loadingMethods}
      paymentMethods={paymentMethods}
      selectedPaymentId={selectedPaymentId}
      setSelectedPaymentId={setSelectedPaymentId}
      loadingPayments={loadingPayments}
      loading={loading}
      onBackToCart={() => setView('cart')}
      handleOrderSubmit={handleOrderSubmit}
      summaryPanel={<CartSummaryPanel {...summaryProps} compact={true} />}
    />
  );
}
