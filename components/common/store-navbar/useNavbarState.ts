'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function useNavbarState(mobileMenuOpen: boolean, searchOpen: boolean) {
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

  useEffect(() => {
    if (mobileMenuOpen || searchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen, searchOpen]);

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
