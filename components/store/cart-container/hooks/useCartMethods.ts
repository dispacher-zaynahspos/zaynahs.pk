'use client';

import { useState, useEffect } from 'react';
import { ShippingMethod, PaymentMethod, ShippingZone } from '@/lib/types';

export function useCartMethods() {
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(null);
  const [loadingMethods, setLoadingMethods] = useState(true);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [loadingPayments, setLoadingPayments] = useState(true);

  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);

  useEffect(() => {
    async function fetchMethods() {
      try {
        const res = await fetch('/api/checkout-methods');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.shippingMethods) && data.shippingMethods.length > 0) {
            setShippingMethods(data.shippingMethods);
            setSelectedShippingId(data.shippingMethods[0].id);
          } else {
            const fallback: ShippingMethod = {
              id: 'fallback',
              name: 'Standard Delivery',
              cost: 200,
              estimated_days: '3–5 business days',
              active: true,
              sort_order: 0,
              created_at: '',
            };
            setShippingMethods([fallback]);
            setSelectedShippingId('fallback');
          }

          if (Array.isArray(data.paymentMethods) && data.paymentMethods.length > 0) {
            setPaymentMethods(data.paymentMethods);
            setSelectedPaymentId(data.paymentMethods[0].id);
          } else {
            const fallbackPay: PaymentMethod = {
              id: 'cod-fallback',
              name: 'Cash on Delivery',
              code: 'cod',
              active: true,
              sort_order: 0,
              created_at: '',
            };
            setPaymentMethods([fallbackPay]);
            setSelectedPaymentId('cod-fallback');
          }

          if (Array.isArray(data.shippingZones)) {
            setShippingZones(data.shippingZones);
          }
        } else {
          throw new Error(`Status ${res.status}`);
        }
      } catch (err) {
        console.warn('Could not load checkout methods via API, using fallbacks:', err);
        const fallback: ShippingMethod = {
          id: 'fallback',
          name: 'Standard Delivery',
          cost: 200,
          estimated_days: '3–5 business days',
          active: true,
          sort_order: 0,
          created_at: '',
        };
        setShippingMethods([fallback]);
        setSelectedShippingId('fallback');

        const fallbackPay: PaymentMethod = {
          id: 'cod-fallback',
          name: 'Cash on Delivery',
          code: 'cod',
          active: true,
          sort_order: 0,
          created_at: '',
        };
        setPaymentMethods([fallbackPay]);
        setSelectedPaymentId('cod-fallback');
      } finally {
        setLoadingMethods(false);
        setLoadingPayments(false);
      }
    }
    fetchMethods();
  }, []);

  return {
    shippingMethods,
    selectedShippingId,
    setSelectedShippingId,
    loadingMethods,
    paymentMethods,
    selectedPaymentId,
    setSelectedPaymentId,
    loadingPayments,
    shippingZones,
  };
}
