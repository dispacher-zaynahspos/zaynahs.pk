'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getOrderById } from '@/lib/services/orders';
import { getAllProductsAdmin } from '@/lib/services/products';
import { Order } from '@/lib/types';
import { useOrderCustomerEditing } from './useOrderCustomerEditing';
import { useOrderActions } from './useOrderActions';

export function useOrderDetailState(initialOrder: Order) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [order, setOrder] = useState<Order>(initialOrder);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [isFulfillDropdownOpen, setIsFulfillDropdownOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const [prevOrderId, setPrevOrderId] = useState<string | null>(null);
  const [nextOrderId, setNextOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdjacent = async () => {
      const supabase = createClient();

      const [prevResult, nextResult] = await Promise.all([
        supabase
          .from('orders')
          .select('id')
          .lt('created_at', order.createdAt)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('orders')
          .select('id')
          .gt('created_at', order.createdAt)
          .is('deleted_at', null)
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle(),
      ]);

      setPrevOrderId(prevResult.data?.id ?? null);
      setNextOrderId(nextResult.data?.id ?? null);
    };

    fetchAdjacent();
  }, [order.id, order.createdAt]);

  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  const [clientId, setClientId] = useState(searchParams.get('id'));

  useEffect(() => {
    const urlId = searchParams.get('id');
    if (urlId && urlId !== clientId) {
      setClientId(urlId);
      if (urlId !== initialOrder.id) {
        getOrderById(urlId).then((fresh) => {
          if (fresh) {
            setOrder(fresh);
            setPrevOrderId(null);
            setNextOrderId(null);
          }
        }).catch(console.error);
      }
    }
  }, [searchParams, clientId, initialOrder.id]);

  const paymentMethod = (() => {
    const notesText = order.notes || '';
    const lines = notesText.split('\n');
    let pm = '';
    lines.forEach(line => {
      const l = line.toLowerCase();
      if (l.startsWith('payment method:')) {
        pm = line.substring('payment method:'.length).trim();
      }
    });
    return pm || 'Cash on delivery';
  })();

  const isPaid = (() => {
    const pm = paymentMethod.toLowerCase();
    if (pm.includes('cash') || pm.includes('cod') || pm.includes('delivery')) {
      return false;
    }
    if (pm.includes('transfer') || pm.includes('bank') || pm.includes('nayapay') || pm.includes('easypaisa') || pm.includes('jazzcash') || pm.includes('card') || pm.includes('online')) {
      return true;
    }
    return false;
  })();

  useEffect(() => {
    if (isEditingOrder && allProducts.length === 0) {
      getAllProductsAdmin().then(setAllProducts).catch(console.error);
    }
  }, [isEditingOrder, allProducts.length]);

  const customerEditing = useOrderCustomerEditing(order, setOrder, setIsUpdating);
  const actions = useOrderActions(order, setOrder, setIsUpdating, setIsDropdownOpen);

  return {
    router,
    order, setOrder,
    isUpdating,
    isDropdownOpen, setIsDropdownOpen,
    isEditingOrder, setIsEditingOrder,
    allProducts,
    isFulfillDropdownOpen, setIsFulfillDropdownOpen,
    lightboxImage, setLightboxImage,
    prevOrderId, nextOrderId,
    paymentMethod, isPaid,
    ...customerEditing,
    ...actions,
  };
}
