'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';

export function useNavbarState(
  mobileMenuOpen: boolean,
  searchOpen: boolean,
) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [customerSession, setCustomerSession] = useState<any>(null);
  const [isPreview, setIsPreview] = useState(false);
  const moreOpenRef = useRef(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      if (typeof window !== 'undefined' && window.self !== window.top) {
        setIsPreview(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Load the customer session from the (httpOnly) cookie via a server action.
  // Runs on mount, on every route change (so it refreshes right after login
  // redirects to /account), and on an explicit 'customer-auth-changed' event
  // dispatched by login/signup/logout so the navbar updates without a reload.
  // Kept client-side on purpose so storefront pages stay static/ISR (no per-request
  // cookie read in the layout, which would force dynamic rendering).
  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    const loadSession = async () => {
      try {
        const { getCustomerProfile } = await import('@/lib/services/customers');
        const profile = await getCustomerProfile();
        if (!cancelled) setCustomerSession(profile);
      } catch { /* ignore */ }
    };
    loadSession();
    const onAuthChanged = () => loadSession();
    window.addEventListener('customer-auth-changed', onAuthChanged);
    return () => {
      cancelled = true;
      window.removeEventListener('customer-auth-changed', onAuthChanged);
    };
  }, [mounted, pathname]);

  useEffect(() => {
    if (!mounted) return;

    const updateWishlistCount = () => {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlistCount(wishlist.length);
    };

    updateWishlistCount();

    window.addEventListener('wishlist-updated', updateWishlistCount);
    return () => {
      window.removeEventListener('wishlist-updated', updateWishlistCount);
    };
  }, [mounted]);

  // Lock background page scroll while the mobile menu or search overlay is open.
  // Shared SSOT hook (iOS-safe, ref-counted, restores scroll position) — RULE UI-POPUP-SCROLL §9c.
  useBodyScrollLock(mobileMenuOpen || searchOpen);

  // Close the "More" dropdown on route change. Scroll position is handled solely by
  // ScrollRestorer (single source of truth); doing scrollTo here fought with it and
  // caused back-navigation to land at the footer instead of the saved position.
  useEffect(() => {
    if (moreOpenRef.current) {
      setMoreDropdownOpen(false);
      moreOpenRef.current = false;
    }
  }, [pathname]);

  return {
    mounted,
    wishlistCount,
    customerSession,
    isPreview,
    moreOpenRef,
    moreDropdownOpen,
    setMoreDropdownOpen,
  };
}
