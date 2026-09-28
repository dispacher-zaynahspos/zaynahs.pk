'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, ShoppingBag, Heart, ShoppingCart } from '@/components/common/Icons';
import { useCart } from '@/lib/hooks/useCart';

export interface MobileBottomNavItem {
  key: 'home' | 'shop' | 'wishlist' | 'cart' | 'account' | string;
  label: string;
  visible: boolean;
}

// Canonical registry — the ONLY place item key -> icon/href/badge is defined (SSOT).
const NAV_ITEM_REGISTRY: Record<string, { defaultLabel: string; icon: any; href: (loggedIn: boolean) => string; badge?: 'wishlist' | 'cart' }> = {
  home: { defaultLabel: 'Home', icon: Home, href: () => '/' },
  shop: { defaultLabel: 'Shop', icon: ShoppingBag, href: () => '/shop' },
  wishlist: { defaultLabel: 'Wishlist', icon: Heart, href: () => '/wishlist', badge: 'wishlist' },
  cart: { defaultLabel: 'Cart', icon: ShoppingCart, href: () => '/cart', badge: 'cart' },
  account: { defaultLabel: 'Account', icon: User, href: (loggedIn) => (loggedIn ? '/account' : '/login') },
};

// Standard high-conversion native e-commerce sequence.
export const DEFAULT_MOBILE_NAV_ITEMS: MobileBottomNavItem[] = [
  { key: 'home', label: 'Home', visible: true },
  { key: 'shop', label: 'Shop', visible: true },
  { key: 'wishlist', label: 'Wishlist', visible: true },
  { key: 'cart', label: 'Cart', visible: true },
  { key: 'account', label: 'Account', visible: true },
];

export default function MobileBottomNav({
  enabled = true,
  items,
  showLabels = true,
}: {
  enabled?: boolean;
  items?: MobileBottomNavItem[] | null;
  showLabels?: boolean;
}) {
  const pathname = usePathname();
  const totalItems = useCart((state) => state.totalItems());
  const [mounted, setMounted] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [customerSession, setCustomerSession] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    
    const updateWishlistCount = () => {
      try {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setWishlistCount(Array.isArray(wishlist) ? wishlist.length : 0);
      } catch {
        setWishlistCount(0);
      }
    };

    updateWishlistCount();

    window.addEventListener('wishlist-updated', updateWishlistCount);
    return () => {
      window.removeEventListener('wishlist-updated', updateWishlistCount);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    async function loadSession() {
      try {
        const { getCustomerProfile } = await import('@/lib/services/customers');
        const profile = await getCustomerProfile();
        setCustomerSession(profile);
      } catch {
        // Session not present, remains guest
      }
    }
    loadSession();
  }, [mounted]);

  // Build nav from config (order + visibility + custom label); fall back to defaults.
  const configItems = (Array.isArray(items) && items.length > 0 ? items : DEFAULT_MOBILE_NAV_ITEMS)
    .filter((it) => it.visible !== false && NAV_ITEM_REGISTRY[it.key]);
  const navItems = configItems.map((it) => {
    const reg = NAV_ITEM_REGISTRY[it.key];
    return {
      key: it.key,
      label: it.label || reg.defaultLabel,
      href: reg.href(!!customerSession),
      icon: reg.icon,
      badgeCount: reg.badge === 'wishlist' ? wishlistCount : reg.badge === 'cart' ? totalItems : undefined,
    };
  });

  if (!enabled || navItems.length === 0) return null;

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      style={{ zIndex: 60 }}
      className="fixed bottom-0 left-0 right-0 z-[60] bg-white/95 dark:bg-[#0c0c16]/95 backdrop-blur-xl border-t border-gray-200/70 dark:border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] md:hidden transition-colors duration-200 pb-[max(env(safe-area-inset-bottom),0.35rem)]"
    >
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === 'account'
            ? (pathname === '/account' || pathname === '/login' || pathname === '/signup')
            : item.href === '/' 
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.key}
              href={item.href}
              prefetch={true}
              id={
                item.key === 'wishlist' ? 'mobile-bottom-wishlist-icon' :
                item.key === 'cart' ? 'mobile-bottom-cart-icon' :
                undefined
              }
              className="flex flex-col items-center justify-center flex-1 h-full py-1 relative transition-all duration-150 active:scale-95 group"
            >
              <div className="relative flex items-center justify-center">
                <div
                  className={`flex items-center justify-center p-1 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'text-[var(--color-primary,#0f172a)] bg-[var(--color-primary,#0f172a)]/10 dark:bg-white/10'
                      : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
                      isActive ? 'scale-105 stroke-[2.2]' : 'stroke-[1.8]'
                    }`}
                  />
                </div>

                {/* Live Count Pill Badge */}
                {mounted && item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <span 
                    style={{ backgroundColor: 'var(--color-primary, #0f172a)' }}
                    className="absolute -top-1 -right-2 min-w-[18px] h-[18px] px-1 rounded-full text-[8.5px] font-black text-white flex items-center justify-center ring-2 ring-white dark:ring-[#0c0c16] shadow-xs animate-in zoom-in-75 duration-150"
                  >
                    {item.badgeCount > 99 ? '99+' : item.badgeCount}
                  </span>
                )}
              </div>

              {showLabels && (
                <span
                  className={`mt-0.5 tracking-tight leading-none text-[10px] transition-colors ${
                    isActive
                      ? 'font-black text-[var(--color-primary,#0f172a)]'
                      : 'font-semibold text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {item.label}
                </span>
              )}

              {/* Clean Crisp Active Pip (Zero Blur) */}
              {isActive && (
                <span 
                  style={{ backgroundColor: 'var(--color-primary, #0f172a)' }}
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-[2px] rounded-full"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
