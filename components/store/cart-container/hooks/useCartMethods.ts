'use client';

import { useState, useEffect } from 'react';
import { ShippingMethod, PaymentMethod } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

export function useCartMethods() {
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(null);
  const [loadingMethods, setLoadingMethods] = useState(true);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [loadingPayments, setLoadingPayments] = useState(true);

  useEffect(() => {
    async function fetchMethods() {
      try {
        const supabase = createClient();
        try {
          const shipRes = await supabase
            .from('shipping_methods')
            .select('*')
            .eq('active', true)
            .order('sort_order', { ascending: true });
          const shipList: ShippingMethod[] = (shipRes.data || []).map((r: any) => ({
            id: r.id,
            name: r.name,
            cost: Number(r.cost),
            estimated_days: r.estimated_days,
            active: r.active,
            sort_order: r.sort_order ?? 0,
            created_at: r.created_at,
          }));
          setShippingMethods(shipList);
          if (shipList.length > 0) setSelectedShippingId(shipList[0].id);
        } catch {
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
        } finally {
          setLoadingMethods(false);
        }

        try {
          const payRes = await supabase
            .from('payment_methods')
            .select('*')
            .eq('active', true)
            .order('sort_order', { ascending: true });
          const payList: PaymentMethod[] = (payRes.data || []).map((r: any) => ({
            id: r.id,
            name: r.name,
            code: r.code,
            active: r.active,
            instructions: r.instructions,
            sort_order: r.sort_order ?? 0,
            created_at: r.created_at,
          }));
          setPaymentMethods(payList);
          if (payList.length > 0) setSelectedPaymentId(payList[0].id);
        } catch (err) {
          console.error('Failed to load payment methods:', err);
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
          setLoadingPayments(false);
        }
      } catch (e) {
        console.error('Client creation failed:', e);
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
  };
}
