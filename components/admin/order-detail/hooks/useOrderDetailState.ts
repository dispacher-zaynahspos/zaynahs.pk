'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getAllProductsAdmin } from '@/lib/services/products';
import { Order, Product } from '@/lib/types';
import { mapOrderRow, OrderRow } from '@/components/admin/order-log/orderLogUtils';
import { useOrderCustomerEditing } from './useOrderCustomerEditing';
import { useOrderActions } from './useOrderActions';

export function useOrderDetailState(initialOrder: Order) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [order, setOrder] = useState<Order>(initialOrder);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isNavigatingOrder, setIsNavigatingOrder] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditingOrder, setIsEditingOrder] = useState(false);

  // Sync edit query param cleanly on client after mount (avoids React hydration mismatch #418)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isEditParam = new URLSearchParams(window.location.search).get('edit') === 'true';
      if (isEditParam) {
        setIsEditingOrder(true);
      }
    }
  }, []);

  const handleOpenEditOrder = useCallback(() => {
    setIsEditingOrder(true);
    if (typeof window !== 'undefined') {
      const currentUrl = new URL(window.location.href);
      if (!currentUrl.searchParams.has('edit')) {
        currentUrl.searchParams.set('edit', 'true');
        window.history.pushState({ editOrder: true, orderId: order.id }, '', currentUrl.toString());
      }
    }
  }, [order.id]);

  const handleCloseEditOrder = useCallback(() => {
    setIsEditingOrder(false);
    if (typeof window !== 'undefined') {
      const currentUrl = new URL(window.location.href);
      if (currentUrl.searchParams.has('edit')) {
        currentUrl.searchParams.delete('edit');
        if (window.history.state?.editOrder) {
          window.history.back();
        } else {
          window.history.replaceState({ orderId: order.id }, '', currentUrl.toString());
        }
      }
    }
  }, [order.id]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isFulfillDropdownOpen, setIsFulfillDropdownOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Active filtered order list from sessionStorage (saved by OrderLog with active filters applied)
  const [activeOrderIds, setActiveOrderIds] = useState<string[]>([]);
  const cachedOrdersMapRef = useRef<Record<string, Order>>({});
  const hasNavigatedRef = useRef(false);
  const currentOrderIdRef = useRef(initialOrder.id);

  // Fallback DB-adjacent order IDs (used only if order is not in active filtered cache)
  const [dbPrevOrderId, setDbPrevOrderId] = useState<string | null>(null);
  const [dbNextOrderId, setDbNextOrderId] = useState<string | null>(null);

  // 1. Initialize active order list & cache on mount
  useEffect(() => {
    cachedOrdersMapRef.current[initialOrder.id] = initialOrder;
    try {
      const raw = sessionStorage.getItem('admin_active_orders_cache');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.orderIds) && parsed.orderIds.length > 0) {
          setActiveOrderIds(parsed.orderIds);
        }
        if (parsed.orders && typeof parsed.orders === 'object') {
          cachedOrdersMapRef.current = {
            ...parsed.orders,
            ...cachedOrdersMapRef.current,
            [initialOrder.id]: initialOrder,
          };
        }
      }
    } catch {
      // Storage error ignored
    }
  }, [initialOrder]);

  // Keep state in sync ONLY on fresh initialOrder if client hasn't navigated
  useEffect(() => {
    if (!hasNavigatedRef.current && initialOrder.id !== currentOrderIdRef.current) {
      currentOrderIdRef.current = initialOrder.id;
      setOrder(initialOrder);
      cachedOrdersMapRef.current[initialOrder.id] = initialOrder;
    }
  }, [initialOrder]);

  // Keep cache updated when current order changes (e.g. status change, note edit)
  useEffect(() => {
    if (!order?.id) return;
    currentOrderIdRef.current = order.id;
    cachedOrdersMapRef.current[order.id] = order;
    try {
      const raw = sessionStorage.getItem('admin_active_orders_cache');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.orders) {
          parsed.orders[order.id] = order;
          sessionStorage.setItem('admin_active_orders_cache', JSON.stringify(parsed));
        }
      }
    } catch {
      // Storage quota error ignored
    }
  }, [order]);

  // Determine current position in active filter list
  const isInActiveList = activeOrderIds.length > 0 && activeOrderIds.includes(order.id);
  const activeIndex = isInActiveList ? activeOrderIds.indexOf(order.id) : -1;

  // Prev = previous order in list (Left arrow ←, index - 1 / newer)
  // Next = next order in list (Right arrow →, index + 1 / older)
  const prevOrderId = isInActiveList
    ? (activeIndex > 0 ? activeOrderIds[activeIndex - 1] : null)
    : dbPrevOrderId;

  const nextOrderId = isInActiveList
    ? (activeIndex >= 0 && activeIndex < activeOrderIds.length - 1 ? activeOrderIds[activeIndex + 1] : null)
    : dbNextOrderId;

  const currentIndexDisplay = isInActiveList && activeOrderIds.length > 1
    ? `${activeIndex + 1} of ${activeOrderIds.length}`
    : null;

  // 2. Fetch adjacent from DB ONLY if active filter list is absent / order is not in list
  useEffect(() => {
    if (activeOrderIds.length > 0 && activeOrderIds.includes(order.id)) {
      return; // Already resolved via active filter cache!
    }

    let isMounted = true;
    const fetchAdjacent = async () => {
      const supabase = createClient();

      const [prevResult, nextResult] = await Promise.all([
        supabase
          .from('orders')
          .select('id, created_at')
          .gt('created_at', order.created_at)
          .is('deleted_at', null)
          .not('status', 'in', '("trash","deleted")')
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('orders')
          .select('id, created_at')
          .lt('created_at', order.created_at)
          .is('deleted_at', null)
          .not('status', 'in', '("trash","deleted")')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (isMounted) {
        setDbPrevOrderId(prevResult.data?.id ?? null);
        setDbNextOrderId(nextResult.data?.id ?? null);
      }
    };

    fetchAdjacent();
    return () => {
      isMounted = false;
    };
  }, [order.id, order.created_at, activeOrderIds]);

  // 3. Background Prefetch adjacent orders into cache so navigation/swiping is ALWAYS 0ms instant
  useEffect(() => {
    const idsToPrefetch: string[] = [];
    if (prevOrderId && !cachedOrdersMapRef.current[prevOrderId]) {
      idsToPrefetch.push(prevOrderId);
    }
    if (nextOrderId && !cachedOrdersMapRef.current[nextOrderId]) {
      idsToPrefetch.push(nextOrderId);
    }
    if (idsToPrefetch.length === 0) return;

    let isMounted = true;
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('orders')
          .select('*')
          .in('id', idsToPrefetch);

        if (isMounted && data && Array.isArray(data)) {
          data.forEach(o => {
            cachedOrdersMapRef.current[o.id] = o as Order;
          });
        }
      } catch {
        // Ignore prefetch error
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [prevOrderId, nextOrderId]);

  // 4. Instant 0ms Order Navigation without full-page server roundtrip or ping-pong
  const navigateToOrder = useCallback(async (targetId: string | null) => {
    if (!targetId || targetId === currentOrderIdRef.current) return;

    hasNavigatedRef.current = true;
    currentOrderIdRef.current = targetId;

    // Close any open popups/editors when switching orders
    setIsDropdownOpen(false);
    setIsFulfillDropdownOpen(false);
    setIsEditingOrder(false);
    setIsNavigatingOrder(true);

    // Scroll to top of order detail smoothly
    if (typeof document !== 'undefined') {
      const mainEl = document.getElementById('admin-main-content');
      if (mainEl && mainEl.scrollTop > 0) {
        mainEl.scrollTop = 0;
      }
    }

    const applyOrder = (target: Order) => {
      setOrder(target);
      currentOrderIdRef.current = target.id;
      const newUrl = `/admin/orders/detail?id=${target.id}`;
      // Update browser address bar and history WITHOUT triggering Next.js server roundtrip
      window.history.replaceState({ orderId: target.id }, '', newUrl);
      setTimeout(() => {
        setIsNavigatingOrder(false);
      }, 50);
    };

    // Check in-memory cache first (0ms instant)
    let targetOrder = cachedOrdersMapRef.current[targetId];

    // Check sessionStorage if not in memory
    if (!targetOrder) {
      try {
        const raw = sessionStorage.getItem('admin_active_orders_cache');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.orders && parsed.orders[targetId]) {
            targetOrder = parsed.orders[targetId];
            cachedOrdersMapRef.current[targetId] = targetOrder;
          }
        }
      } catch {}
    }

    if (targetOrder) {
      applyOrder(targetOrder);
      return;
    }

    // Fast client-side Supabase fetch (50ms instead of full Next.js page re-fetch)
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', targetId)
        .single();

      if (data && !error) {
        const fetched = mapOrderRow(data as unknown as OrderRow);
        cachedOrdersMapRef.current[targetId] = fetched;
        applyOrder(fetched);
        return;
      }
    } catch {}

    // Fallback: router.push if client fetch failed
    router.push(`/admin/orders/detail?id=${targetId}`);
    setTimeout(() => {
      setIsNavigatingOrder(false);
    }, 200);
  }, [router]);

  const handleNavigatePrev = useCallback(() => {
    if (prevOrderId) navigateToOrder(prevOrderId);
  }, [prevOrderId, navigateToOrder]);

  const handleNavigateNext = useCallback(() => {
    if (nextOrderId) navigateToOrder(nextOrderId);
  }, [nextOrderId, navigateToOrder]);

  // Handle URL change or browser popstate (e.g. user taps browser Back/Forward)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const urlId = params.get('id');
      const isEditParam = params.get('edit') === 'true';

      setIsEditingOrder(isEditParam);

      if (urlId && urlId !== currentOrderIdRef.current) {
        navigateToOrder(urlId);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigateToOrder]);

  // 5. Keyboard Arrow Navigation (ArrowLeft = Previous order, ArrowRight = Next order)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isEditingOrder) {
        e.preventDefault();
        handleCloseEditOrder();
        return;
      }

      if (isEditingOrder || lightboxImage) return;

      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable) {
          return;
        }
      }

      if (e.key === 'ArrowLeft') {
        if (prevOrderId) {
          e.preventDefault();
          navigateToOrder(prevOrderId);
        }
      } else if (e.key === 'ArrowRight') {
        if (nextOrderId) {
          e.preventDefault();
          navigateToOrder(nextOrderId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextOrderId, prevOrderId, navigateToOrder, isEditingOrder, lightboxImage, handleCloseEditOrder]);

  // 6. Touch swipe navigation for mobile
  // Swipe Left (finger moves ←) = Next order (→)
  // Swipe Right (finger moves →) = Previous order (←)
  const prevOrderIdRef = useRef(prevOrderId);
  const nextOrderIdRef = useRef(nextOrderId);
  useEffect(() => {
    prevOrderIdRef.current = prevOrderId;
    nextOrderIdRef.current = nextOrderId;
  }, [prevOrderId, nextOrderId]);

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchStartTimeRef = useRef<number>(0);
  const isSwipingRef = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isEditingOrder || lightboxImage || isSwipingRef.current) return;
    const target = e.target as HTMLElement | null;
    if (target?.closest('input, textarea, select, button, a, [role="dialog"], .prevent-swipe, [data-prevent-swipe]')) return;
    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
    touchStartTimeRef.current = Date.now();
  }, [isEditingOrder, lightboxImage]);

  const handleTouchCancel = useCallback(() => {
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    touchStartTimeRef.current = 0;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null || isSwipingRef.current) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartXRef.current;
    const deltaY = touch.clientY - touchStartYRef.current;
    const elapsed = Date.now() - touchStartTimeRef.current;

    touchStartXRef.current = null;
    touchStartYRef.current = null;
    touchStartTimeRef.current = 0;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Effortless mobile flick gesture:
    // - Under 600ms
    // - At least 35px horizontal travel
    // - Dominantly horizontal (absX > absY * 1.15)
    if (elapsed < 600 && absX >= 35 && absX > absY * 1.15) {
      if (deltaX < 0 && nextOrderIdRef.current) {
        // Swiped LEFT (finger moves right to left) -> Next order (Right arrow →)
        isSwipingRef.current = true;
        navigateToOrder(nextOrderIdRef.current);
        setTimeout(() => {
          isSwipingRef.current = false;
        }, 250);
      } else if (deltaX > 0 && prevOrderIdRef.current) {
        // Swiped RIGHT (finger moves left to right) -> Previous order (Left arrow ←)
        isSwipingRef.current = true;
        navigateToOrder(prevOrderIdRef.current);
        setTimeout(() => {
          isSwipingRef.current = false;
        }, 250);
      }
    }
  }, [navigateToOrder]);

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
    isNavigatingOrder,
    isDropdownOpen, setIsDropdownOpen,
    isEditingOrder, setIsEditingOrder,
    handleOpenEditOrder,
    handleCloseEditOrder,
    allProducts,
    isFulfillDropdownOpen, setIsFulfillDropdownOpen,
    lightboxImage, setLightboxImage,
    prevOrderId, nextOrderId,
    currentIndexDisplay,
    handleNavigateNext,
    handleNavigatePrev,
    navigateToOrder,
    handleTouchStart,
    handleTouchEnd,
    handleTouchCancel,
    paymentMethod, isPaid,
    ...customerEditing,
    ...actions,
  };
}
