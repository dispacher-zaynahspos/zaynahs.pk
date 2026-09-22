'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, ShoppingBag, Heart, ShoppingCart } from '@/components/common/Icons';
import { useCart } from '@/lib/hooks/useCart';

export default function MobileBottomNav() {
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

  // Standard high-conversion native e-commerce sequence: Home -> Shop -> Wishlist -> Cart -> Account
  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Shop', href: '/shop', icon: ShoppingBag },
    { label: 'Wishlist', href: '/wishlist', icon: Heart, badgeCount: wishlistCount },
    { label: 'Cart', href: '/cart', icon: ShoppingCart, badgeCount: totalItems },
    { label: 'Account', href: customerSession ? '/account' : '/login', icon: User },
  ];

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#121222]/95 backdrop-blur-md border-t border-gray-200/80 dark:border-white/10 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] md:hidden transition-colors duration-200 pb-[max(env(safe-area-inset-bottom),0.25rem)]"
    >
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.label === 'Account'
            ? (pathname === '/account' || pathname === '/login' || pathname === '/signup')
            : item.href === '/' 
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              id={
                item.label === 'Wishlist' ? 'mobile-bottom-wishlist-icon' :
                item.label === 'Cart' ? 'mobile-bottom-cart-icon' :
                undefined
              }
              className={`flex flex-col items-center justify-center flex-1 h-full relative text-[10px] font-bold transition-all duration-150 active:scale-90 ${
                isActive
                  ? 'text-[var(--color-primary,#C2185B)] font-black'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={`h-5 w-5 mb-0.5 shrink-0 transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`} />
                
                {/* Live Count Pill Badge */}
                {mounted && item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <span 
                    style={{ backgroundColor: 'var(--color-primary, #C2185B)' }}
                    className="absolute -top-1.5 -right-2.5 min-w-[17px] h-4 px-1 rounded-full text-[8.5px] font-black text-white flex items-center justify-center ring-2 ring-white dark:ring-[#121222] shadow-xs"
                  >
                    {item.badgeCount > 99 ? '99+' : item.badgeCount}
                  </span>
                )}

                {/* Modern Active Indicator Pip */}
                {isActive && (
                  <span 
                    style={{ backgroundColor: 'var(--color-primary, #C2185B)' }}
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full shadow-[0_0_8px_var(--color-primary,#C2185B)]"
                  />
                )}
              </div>
              <span className="mt-0.5 tracking-tight leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
