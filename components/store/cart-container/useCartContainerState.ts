'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { StoreSettings } from '@/lib/types';
import { isFeatureEnabled } from '@/lib/features/premium';
import { useCartStore } from '@/store/cartStore';
import { generateWhatsAppMessage, buildWhatsAppURL, formatPrice } from '@/lib/utils/whatsapp';
import { createOrder } from '@/lib/services/orders';
import { trackEvent } from '@/lib/trackEvent';
import { toast } from 'sonner';
import { validateCouponCode } from '@/lib/services/coupons';
import { isValidPkMobile, normalizePkPhone } from '@/lib/phone';
import { getClientSiteUrl } from '@/lib/site-url';
import { resolveShippingZone, resolveZoneShippingCost } from '@/lib/utils/shipping-zones';
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
  const [paymentProofUrl, setPaymentProofUrl] = useState('');

  useEffect(() => {
    if (appliedCoupon && appliedCoupon.min_cart_amount && totalPrice < appliedCoupon.min_cart_amount) {
      applyCoupon(null);
      toast.error(`Coupon ${appliedCoupon.code} removed (Subtotal fell below Rs. ${appliedCoupon.min_cart_amount})`);
    }
  }, [totalPrice, appliedCoupon, applyCoupon]);

  useEffect(() => {
    if (view === 'checkout' && items.length > 0) {
      trackEvent('InitiateCheckout', {
        content_ids: items.map((item) => item.selected_variant?.id || item.product.id),
        content_type: 'product',
        value: totalPrice,
        currency: settings.currency || 'PKR',
        num_items: items.reduce((sum, item) => sum + item.quantity, 0),
      });
    }
  }, [view, items, totalPrice, settings.currency]);

  const selectedShipping = methodsState.shippingMethods.find((m) => m.id === methodsState.selectedShippingId);
  const selectedPayment = methodsState.paymentMethods.find((p) => p.id === methodsState.selectedPaymentId);
  const subtotal = totalPrice;
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  // City-based shipping zone (optional). When a zone matches the entered city, its cost
  // overrides the flat shipping-method cost. When no zones are configured, legacy flat cost wins.
  const matchedZone = resolveShippingZone(methodsState.shippingZones, city);
  const zoneResolved = resolveZoneShippingCost(matchedZone, subtotal);
  const baseShippingCost = zoneResolved ? zoneResolved.cost : (selectedShipping?.cost ?? 200);
  const shippingMethodLabel = matchedZone?.name ?? selectedShipping?.name ?? 'Standard Delivery';

  const freeShippingThreshold = settings.free_shipping_threshold ?? 2000;
  const qualifiesForFreeShipping =
    (zoneResolved?.free ?? false) ||
    (isFeatureEnabled(settings, 'free_shipping_bar') && subtotal >= freeShippingThreshold);
  const shippingCost = qualifiesForFreeShipping ? 0 : baseShippingCost;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingPercent = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  const volumeDiscountThreshold = settings.volume_discount_threshold ?? 3;
  const volumeDiscountPercentage = settings.volume_discount_percentage ?? 10;
  const qualifiesForVolumeDiscount =
    isFeatureEnabled(settings, 'volume_discounts') && itemCount >= volumeDiscountThreshold;
  const volumeDiscountAmount = qualifiesForVolumeDiscount
    ? Math.round((subtotal * volumeDiscountPercentage) / 100)
    : 0;

  const couponDiscountAmount = (() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discount_type === 'percentage') {
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
    // Double-submit guard: ignore re-entry while an order is already in flight
    if (loading) return;
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
    if (!isValidPkMobile(phone)) {
      toast.error('Enter a valid Pakistani mobile number (e.g. 0300 1234567)');
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
        `Phone: ${normalizePkPhone(phone)}`,
        emailOrPhone.trim() ? `Contact: ${emailOrPhone.trim()}` : '',
        notes.trim() ? `Notes: ${notes.trim()}` : '',
        coordinates.trim() ? `Coordinates: ${coordinates.trim()}` : '',
        `Payment Method: ${selectedPayment?.name ?? 'Cash on delivery'}`,
        volumeDiscountAmount > 0
          ? `Volume Discount: -${formatPrice(volumeDiscountAmount, settings.currency_symbol)}`
          : '',
        couponDiscountAmount > 0
          ? `Coupon Discount (${appliedCoupon?.code}): -${formatPrice(couponDiscountAmount, settings.currency_symbol)}`
          : '',
      ]
        .filter(Boolean)
        .join('\n');

      const order = await createOrder({
        customerName: `${firstName.trim()} ${lastName.trim()}`,
        customerPhone: normalizePkPhone(phone),
        customerEmail: emailOrPhone.includes('@') ? emailOrPhone.trim() : undefined,
        items,
        subtotal,
        total: finalTotal,
        notes: formattedAddress,
        shippingCost: shippingCost,
        discountAmount: discountAmount,
        shippingMethodName: shippingMethodLabel,
        paymentProofUrl: paymentProofUrl || undefined,
        shippingAddress: {
          name: `${firstName.trim()} ${lastName.trim()}`,
          phone: normalizePkPhone(phone),
          email: emailOrPhone.includes('@') ? emailOrPhone.trim() : undefined,
          address1: address.trim(),
          address2: apartment.trim() || undefined,
          city: city.trim(),
          postalCode: postalCode.trim() || undefined,
          country: 'Pakistan',
          paymentMethod: selectedPayment?.name ?? 'Cash on delivery',
        },
      });

      const orderTrackUrl = order.access_token
        ? `${getClientSiteUrl()}/order/${order.access_token}`
        : undefined;

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
          ? `• Volume Discount: -${formatPrice(volumeDiscountAmount, settings.currency_symbol)}`
          : '',
        couponDiscountAmount > 0
          ? `• Coupon Discount (${appliedCoupon?.code}): -${formatPrice(couponDiscountAmount, settings.currency_symbol)}`
          : '',
        `• Shipping: ${shippingMethodLabel} (${formatPrice(shippingCost, settings.currency_symbol)})`,
        `• Payment Method: ${selectedPayment?.name ?? 'Cash on delivery'}`,
        paymentProofUrl ? `• Payment Proof: ${paymentProofUrl}` : '',
        `*Grand Total: ${formatPrice(finalTotal, settings.currency_symbol)}*`,
        '',
        `• Order No: ${order.order_number}`,
        orderTrackUrl ? `• Track: ${orderTrackUrl}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      trackEvent('Purchase', {
        transaction_id: order.order_number || order.id,
        value: finalTotal,
        currency: settings.currency || 'PKR',
        content_ids: items.map((item) => item.selected_variant?.id || item.product.id),
        content_type: 'product',
        num_items: items.reduce((sum, item) => sum + item.quantity, 0),
      });

      const orderData = {
        orderNumber: order.order_number,
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
        shippingMethodName: shippingMethodLabel,
        shippingCost: shippingCost,
        subtotal: subtotal,
        discountAmount: discountAmount,
        paymentMethodName: selectedPayment?.name ?? 'Cash on delivery',
        paymentInstructions: selectedPayment?.instructions ?? undefined,
        paymentProofUrl: paymentProofUrl || undefined,
        orderTrackUrl,
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
      window.open(buildWhatsAppURL(settings.whatsapp_number || '923001234567', fullMsg), '_blank');
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
    paymentProofUrl,
    setPaymentProofUrl,
    shippingZones: methodsState.shippingZones,
    loading,
    itemCount,
    handleOrderSubmit,
    summaryProps,
    router,
  };
}
