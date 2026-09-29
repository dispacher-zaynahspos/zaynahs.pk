'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';

export function useNavbarState(
  mobileMenuOpen: boolean,
  searchOpen: boolean,
  initialCustomerSession: any = null
) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  // Seed with the server-hydrated session so the logged-in state renders on first
  // paint and persists across refresh; the client effect below keeps it fresh.
  const [customerSession, setCustomerSession] = useState<any>(initialCustomerSession);
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

  useEffect(() => {
    if (!mounted) return;
    async function loadSession() {
      try {
        const { getCustomerProfile } = await import('@/lib/services/customers');
        const profile = await getCustomerProfile();
        setCustomerSession(profile);
      } catch { }
    }
    loadSession();
  }, [mounted]);

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

  useEffect(() => {
    if (moreOpenRef.current) {
      setMoreDropdownOpen(false);
      moreOpenRef.current = false;
    }
    if (typeof window !== 'undefined') {
      const raw = sessionStorage.getItem('store_scroll_restore');
      let shouldRestore = false;
      if (raw) {
        try {
          const data = JSON.parse(raw);
          const currentPath = window.location.pathname + window.location.search;
          if (data.path === currentPath) {
            shouldRestore = true;
          }
        } catch {}
      }
      if (!shouldRestore) {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
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
