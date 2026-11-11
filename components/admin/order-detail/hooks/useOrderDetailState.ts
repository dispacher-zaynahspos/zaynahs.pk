'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getOrderById } from '@/lib/services/orders';
import { getAllProductsAdmin } from '@/lib/services/products';
import { Order, Product } from '@/lib/types';
import { useOrderCustomerEditing } from './useOrderCustomerEditing';
import { useOrderActions } from './useOrderActions';

export function useOrderDetailState(initialOrder: Order) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [order, setOrder] = useState<Order>(initialOrder);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isNavigatingOrder, setIsNavigatingOrder] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditingOrder, setIsEditingOrder] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('edit') === 'true';
    }
    return false;
  });

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

  // Fallback DB-adjacent order IDs (used only if order is not in active filtered cache)
  const [dbPrevOrderId, setDbPrevOrderId] = useState<string | null>(null);
  const [dbNextOrderId, setDbNextOrderId] = useState<string | null>(null);

  const [clientId, setClientId] = useState(searchParams.get('id') || initialOrder.id);

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

  // Keep state in sync if initialOrder prop changes
  useEffect(() => {
    setOrder(initialOrder);
    cachedOrdersMapRef.current[initialOrder.id] = initialOrder;
  }, [initialOrder]);

  // Keep cache updated when current order changes (e.g. status change, note edit)
  useEffect(() => {
    if (!order?.id) return;
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

  // Next = newer order (earlier index 0..N-1)
  // Prev = older order (later index)
  const nextOrderId = isInActiveList
    ? (activeIndex > 0 ? activeOrderIds[activeIndex - 1] : null)
    : dbNextOrderId;

  const prevOrderId = isInActiveList
    ? (activeIndex >= 0 && activeIndex < activeOrderIds.length - 1 ? activeOrderIds[activeIndex + 1] : null)
    : dbPrevOrderId;

  const currentIndexDisplay = isInActiveList && activeOrderIds.length > 1
    ? `${activeIndex + 1} of ${activeOrderIds.length}`
    : null;

  // 2. Fetch adjacent from DB ONLY if active filter list is absent / order is not in list (Zero DB hits when navigating filtered list)
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
          .select('id')
          .lt('created_at', order.created_at)
          .is('deleted_at', null)
          .not('status', 'in', '("trash","deleted")')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('orders')
          .select('id')
          .gt('created_at', order.created_at)
          .is('deleted_at', null)
          .not('status', 'in', '("trash","deleted")')
          .order('created_at', { ascending: true })
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

  // 3. Instant 0ms Order Navigation without full-page server roundtrip
  const navigateToOrder = useCallback(async (targetId: string | null) => {
    if (!targetId || targetId === order.id) return;

    // Close any open popups/editors when switching orders
    setIsDropdownOpen(false);
    setIsFulfillDropdownOpen(false);
    setIsEditingOrder(false);
    setIsNavigatingOrder(true);

    // Check in-memory cache first
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
      setOrder(targetOrder);
      setClientId(targetId);
      const newUrl = `/admin/orders/detail?id=${targetId}`;
      window.history.replaceState({ orderId: targetId }, '', newUrl);
      // Fast micro-fade (80ms) for smooth skeleton transition without glitch
      setTimeout(() => {
        setIsNavigatingOrder(false);
      }, 80);
      return;
    }

    // Fallback: fetch from DB only if completely missing from cache
    try {
      setIsUpdating(true);
      const fresh = await getOrderById(targetId);
      if (fresh) {
        setOrder(fresh);
        setClientId(targetId);
        cachedOrdersMapRef.current[targetId] = fresh;
        const newUrl = `/admin/orders/detail?id=${targetId}`;
        window.history.replaceState({ orderId: targetId }, '', newUrl);
      }
    } catch (err) {
      console.error('Failed to load adjacent order:', err);
    } finally {
      setIsUpdating(false);
      setIsNavigatingOrder(false);
    }
  }, [order.id]);

  const handleNavigateNext = useCallback(() => {
    if (nextOrderId) navigateToOrder(nextOrderId);
  }, [nextOrderId, navigateToOrder]);

  const handleNavigatePrev = useCallback(() => {
    if (prevOrderId) navigateToOrder(prevOrderId);
  }, [prevOrderId, navigateToOrder]);

  // Handle URL change or browser popstate
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const urlId = params.get('id');
      const isEditParam = params.get('edit') === 'true';

      setIsEditingOrder(isEditParam);

      if (urlId && urlId !== order.id) {
        navigateToOrder(urlId);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [order.id, navigateToOrder]);

  // Handle external searchParams sync if changed outside replaceState
  useEffect(() => {
    const isEditParam = searchParams.get('edit') === 'true';
    if (isEditParam !== isEditingOrder) {
      setIsEditingOrder(isEditParam);
    }

    const urlId = searchParams.get('id');
    if (urlId && urlId !== clientId && urlId !== order.id) {
      setClientId(urlId);
      if (cachedOrdersMapRef.current[urlId]) {
        setOrder(cachedOrdersMapRef.current[urlId]);
      } else {
        getOrderById(urlId).then((fresh) => {
          if (fresh) {
            setOrder(fresh);
            cachedOrdersMapRef.current[urlId] = fresh;
          }
        }).catch(console.error);
      }
    }
  }, [searchParams, clientId, order.id, isEditingOrder]);

  // 4. Keyboard Arrow Navigation (ArrowLeft = Newer / Prev, ArrowRight = Older / Next)
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
        if (nextOrderId) {
          e.preventDefault();
          navigateToOrder(nextOrderId);
        }
      } else if (e.key === 'ArrowRight') {
        if (prevOrderId) {
          e.preventDefault();
          navigateToOrder(prevOrderId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextOrderId, prevOrderId, navigateToOrder, isEditingOrder, lightboxImage]);

  // 5. Touch swipe navigation for mobile (Left = Older/Next order, Right = Newer/Prev order)
  const nextOrderIdRef = useRef(nextOrderId);
  const prevOrderIdRef = useRef(prevOrderId);
  useEffect(() => {
    nextOrderIdRef.current = nextOrderId;
    prevOrderIdRef.current = prevOrderId;
  }, [nextOrderId, prevOrderId]);

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isEditingOrder || lightboxImage) return;
    const target = e.target as HTMLElement | null;
    if (target?.closest('input, textarea, select, button, a, [role="dialog"], .prevent-swipe')) return;
    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
  }, [isEditingOrder, lightboxImage]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartXRef.current;
    const deltaY = touch.clientY - touchStartYRef.current;
    touchStartXRef.current = null;
    touchStartYRef.current = null;

    // Standard horizontal swipe gesture:
    // Minimum 40px horizontal travel, and horizontal distance > vertical distance
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    if (absX >= 40 && absX > absY * 1.1) {
      if (deltaX > 0 && nextOrderIdRef.current) {
        // Swiped right -> newer/previous order (← Left)
        navigateToOrder(nextOrderIdRef.current);
      } else if (deltaX < 0 && prevOrderIdRef.current) {
        // Swiped left -> older/next order (→ Right)
        navigateToOrder(prevOrderIdRef.current);
      }
    }
  }, [navigateToOrder]);

  // Global window touch listener so swiping anywhere on mobile screen effortlessly switches orders
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let startX: number | null = null;
    let startY: number | null = null;

    const onTouchStartWindow = (e: TouchEvent) => {
      if (isEditingOrder || lightboxImage) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, button, a, [role="dialog"], .prevent-swipe')) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const onTouchEndWindow = (e: TouchEvent) => {
      if (startX === null || startY === null) return;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      startX = null;
      startY = null;

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      if (absX >= 40 && absX > absY * 1.1) {
        if (deltaX > 0 && nextOrderIdRef.current) {
          navigateToOrder(nextOrderIdRef.current);
        } else if (deltaX < 0 && prevOrderIdRef.current) {
          navigateToOrder(prevOrderIdRef.current);
        }
      }
    };

    window.addEventListener('touchstart', onTouchStartWindow, { passive: true });
    window.addEventListener('touchend', onTouchEndWindow, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStartWindow);
      window.removeEventListener('touchend', onTouchEndWindow);
    };
  }, [isEditingOrder, lightboxImage, navigateToOrder]);

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
    paymentMethod, isPaid,
    ...customerEditing,
    ...actions,
  };
}
