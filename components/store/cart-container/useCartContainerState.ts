'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { StoreSettings } from '@/lib/types';
import { useCartStore } from '@/store/cartStore';
import { generateWhatsAppMessage, buildWhatsAppURL, formatPrice } from '@/lib/utils/whatsapp';
import { createOrder } from '@/lib/services/orders';
import { trackEvent } from '@/lib/trackEvent';
import { toast } from 'sonner';
import { validateCouponCode } from '@/lib/services/coupons';
import { useAbandonedCartTracker } from '@/lib/hooks/useAbandonedCartTracker';
import { useCartTimer } from './hooks/useCartTimer';
import { useCartMethods } from './hooks/useCartMethods';
import { useCheckoutFormState } from './hooks/useCheckoutFormState';

export type CartView = 'cart' | 'checkout' | 'success';

export function useCartContainerState(settings: StoreSettings) {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const totalPrice = useCartStore((state) => state.totalPrice());
  const clearCart = useCartStore((state) => state.clearCart);
  const appliedCoupon = useCartStore((state) => state.appliedCoupon);
  const applyCoupon = useCartStore((state) => state.applyCoupon);

  const timerState = useCartTimer(settings);
  const methodsState = useCartMethods();

  const router = useRouter();
  const searchParams = useSearchParams();
  const view: CartView =
    searchParams.get('step') === 'checkout'
      ? 'checkout'
      : searchParams.get('step') === 'success'
      ? 'success'
      : 'cart';

  const setView = (newView: CartView) => {
    if (newView === 'checkout') {
      router.push('/cart?step=checkout');
    } else if (newView === 'success') {
      router.push('/cart?step=success');
    } else {
      router.push('/cart');
    }
  };

  const {
    emailOrPhone, setEmailOrPhone,
    firstName, setFirstName,
    lastName, setLastName,
    address, setAddress,
    apartment, setApartment,
    city, setCity,
    postalCode, setPostalCode,
    phone, setPhone,
    saveInfo, setSaveInfo,
    notes, setNotes,
    placedOrder, setPlacedOrder,
    coordinates,
    markOrdered
  } = useCheckoutFormState(settings.currency || 'PKR', view);

  const [discountCode, setDiscountCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (appliedCoupon && appliedCoupon.minCartAmount && totalPrice < appliedCoupon.minCartAmount) {
      applyCoupon(null);
      toast.error(`Coupon ${appliedCoupon.code} removed (Subtotal fell below Rs. ${appliedCoupon.minCartAmount})`);
    }
  }, [totalPrice, appliedCoupon, applyCoupon]);

  useEffect(() => {
    if (view === 'checkout' && items.length > 0) {
      trackEvent('InitiateCheckout', {
        content_ids: items.map((item) => item.selectedVariant?.id || item.product.id),
        content_type: 'product',
        value: totalPrice,
        currency: settings.currency || 'PKR',
        num_items: items.reduce((sum, item) => sum + item.quantity, 0),
      });
    }
  }, [view, items, totalPrice, settings.currency]);

  const selectedShipping = methodsState.shippingMethods.find((m) => m.id === methodsState.selectedShippingId);
  const selectedPayment = methodsState.paymentMethods.find((p) => p.id === methodsState.selectedPaymentId);
  const baseShippingCost = selectedShipping?.cost ?? 200;
  const subtotal = totalPrice;
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  const freeShippingThreshold = settings.free_shipping_threshold ?? 2000;
  const qualifiesForFreeShipping = settings.free_shipping_bar_enabled !== false && subtotal >= freeShippingThreshold;
  const shippingCost = qualifiesForFreeShipping ? 0 : baseShippingCost;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingPercent = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  const volumeDiscountThreshold = settings.volume_discount_threshold ?? 3;
  const volumeDiscountPercentage = settings.volume_discount_percentage ?? 10;
  const qualifiesForVolumeDiscount =
    settings.volume_discounts_enabled !== false && itemCount >= volumeDiscountThreshold;
  const volumeDiscountAmount = qualifiesForVolumeDiscount
    ? Math.round((subtotal * volumeDiscountPercentage) / 100)
    : 0;

  const couponDiscountAmount = (() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'percentage') {
      return Math.round((subtotal * appliedCoupon.value) / 100);
    } else {
      return Math.min(appliedCoupon.value, subtotal);
    }
  })();

  const discountAmount = volumeDiscountAmount + couponDiscountAmount;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  const handleApplyDiscount = async (e: React.MouseEvent) => {
    e.preventDefault();
    const clean = discountCode.trim().toUpperCase();
    if (!clean) return;

    setLoading(true);
    setCouponError('');
    const result = await validateCouponCode(clean, subtotal);
    if (result && 'coupon' in result) {
      applyCoupon(result.coupon);
      setDiscountCode('');
      setCouponError('');
      toast.success(`Coupon "${result.coupon.code}" applied successfully!`);
    } else if (result && 'error' in result) {
      setCouponError(result.error);
    } else {
      setCouponError('Invalid or expired coupon code');
    }
    setLoading(false);
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!address.trim()) {
      toast.error('Please enter your shipping address');
      return;
    }
    if (!city.trim()) {
      toast.error('Please enter your city');
      return;
    }
    if (!phone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }
    if (methodsState.paymentMethods.length > 0 && !methodsState.selectedPaymentId) {
      toast.error('Please select a payment method');
      return;
    }

    try {
      setLoading(true);

      const formattedAddress = [
        `Address: ${address.trim()}`,
        apartment.trim() ? `Apt/Suite: ${apartment.trim()}` : '',
        `City: ${city.trim()}`,
        postalCode.trim() ? `Postal: ${postalCode.trim()}` : '',
        `Phone: ${phone.trim()}`,
        emailOrPhone.trim() ? `Contact: ${emailOrPhone.trim()}` : '',
        notes.trim() ? `Notes: ${notes.trim()}` : '',
        coordinates.trim() ? `Coordinates: ${coordinates.trim()}` : '',
        `Payment Method: ${selectedPayment?.name ?? 'Cash on delivery'}`,
        volumeDiscountAmount > 0
          ? `Volume Discount: -${formatPrice(volumeDiscountAmount, settings.currencySymbol)}`
          : '',
        couponDiscountAmount > 0
          ? `Coupon Discount (${appliedCoupon?.code}): -${formatPrice(couponDiscountAmount, settings.currencySymbol)}`
          : '',
      ]
        .filter(Boolean)
        .join('\n');

      const order = await createOrder({
        customerName: `${firstName.trim()} ${lastName.trim()}`,
        customerPhone: phone.trim(),
        customerEmail: emailOrPhone.includes('@') ? emailOrPhone.trim() : undefined,
        items,
        subtotal,
        total: finalTotal,
        notes: formattedAddress,
        shippingCost: shippingCost,
        shippingMethodName: selectedShipping?.name ?? 'Standard Delivery',
      });

      if (saveInfo) {
        localStorage.setItem(
          'checkout_info',
          JSON.stringify({
            emailOrPhone: emailOrPhone.trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            address: address.trim(),
            apartment: apartment.trim(),
            city: city.trim(),
            postalCode: postalCode.trim(),
            phone: phone.trim(),
          })
        );
      } else {
        localStorage.removeItem('checkout_info');
      }

      const baseMsg = generateWhatsAppMessage(items, settings);
      const fullMsg = [
        baseMsg,
        '',
        '*Shipping Details:*',
        `• Name: ${firstName.trim()} ${lastName.trim()}`,
        `• Phone: ${phone.trim()}`,
        `• Address: ${address.trim()}`,
        apartment.trim() ? `• Apt/Suite: ${apartment.trim()}` : '',
        `• City: ${city.trim()}`,
        postalCode.trim() ? `• Postal: ${postalCode.trim()}` : '',
        emailOrPhone.trim() ? `• Contact: ${emailOrPhone.trim()}` : '',
        notes.trim() ? `• Notes: ${notes.trim()}` : '',
        volumeDiscountAmount > 0
          ? `• Volume Discount: -${formatPrice(volumeDiscountAmount, settings.currencySymbol)}`
          : '',
        couponDiscountAmount > 0
          ? `• Coupon Discount (${appliedCoupon?.code}): -${formatPrice(couponDiscountAmount, settings.currencySymbol)}`
          : '',
        `• Shipping: ${selectedShipping?.name ?? 'Standard'} (${formatPrice(shippingCost, settings.currencySymbol)})`,
        `• Payment Method: ${selectedPayment?.name ?? 'Cash on delivery'}`,
        `*Grand Total: ${formatPrice(finalTotal, settings.currencySymbol)}*`,
        '',
        `• Order No: ${order.orderNumber}`,
      ]
        .filter(Boolean)
        .join('\n');

      trackEvent('Purchase', {
        transaction_id: order.orderNumber || order.id,
        value: finalTotal,
        currency: settings.currency || 'PKR',
        content_ids: items.map((item) => item.selectedVariant?.id || item.product.id),
        content_type: 'product',
        num_items: items.reduce((sum, item) => sum + item.quantity, 0),
      });

      const orderData = {
        orderNumber: order.orderNumber,
        createdAt: new Date().toISOString(),
        total: finalTotal,
        items: [...items],
        customerName: `${firstName.trim()} ${lastName.trim()}`,
        phone: phone.trim(),
        address: address.trim(),
        apartment: apartment.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        emailOrPhone: emailOrPhone.trim(),
        shippingMethodName: selectedShipping?.name ?? 'Standard Delivery',
        shippingCost: shippingCost,
        subtotal: subtotal,
        discountAmount: discountAmount,
        paymentMethodName: selectedPayment?.name ?? 'Cash on delivery',
        paymentInstructions: selectedPayment?.instructions ?? undefined,
      };

      localStorage.setItem('last_placed_order', JSON.stringify(orderData));
      setPlacedOrder(orderData);

      try {
        await markOrdered(order.id);
      } catch {}

      if (typeof window !== 'undefined') {
        localStorage.removeItem('zaynahs_cart_session');
      }

      clearCart();
      router.push('/cart?step=success');
      window.open(buildWhatsAppURL(settings.whatsappNumber || '923001234567', fullMsg), '_blank');
      toast.success('Order placed! Redirecting to WhatsApp...');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const summaryProps = {
    settings,
    items,
    subtotal,
    itemCount,
    shippingCost,
    loadingMethods: methodsState.loadingMethods,
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
  };

  return {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    view,
    setView,
    mounted: timerState.mounted,
    timeLeftStr: timerState.timeLeftStr,
    isTimerExpired: timerState.isTimerExpired,
    isConfirmingClear: timerState.isConfirmingClear,
    setIsConfirmingClear: timerState.setIsConfirmingClear,
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
    shippingMethods: methodsState.shippingMethods,
    selectedShippingId: methodsState.selectedShippingId,
    setSelectedShippingId: methodsState.setSelectedShippingId,
    loadingMethods: methodsState.loadingMethods,
    paymentMethods: methodsState.paymentMethods,
    selectedPaymentId: methodsState.selectedPaymentId,
    setSelectedPaymentId: methodsState.setSelectedPaymentId,
    loadingPayments: methodsState.loadingPayments,
    loading,
    itemCount,
    handleOrderSubmit,
    summaryProps,
    router,
  };
}
