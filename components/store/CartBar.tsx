'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, ArrowRight } from '@/components/common/Icons';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils/whatsapp';

interface CartBarProps {
  currencySymbol?: string;
}

export default function CartBar({ currencySymbol = 'Rs.' }: CartBarProps) {
  const totalItems = useCartStore(state => state.totalItems());
  const totalPrice = useCartStore(state => state.totalPrice());
  const pathname = usePathname();

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Hide on cart/checkout pages or when cart is empty
  if (!mounted || totalItems === 0 || pathname === '/cart' || pathname === '/checkout') return null;

  return (
    <div className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 md:hidden flex justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-200">
      <Link
        href="/cart"
        className="pointer-events-auto w-full max-w-[340px] flex items-center justify-between rounded-full bg-gray-950/95 dark:bg-white/95 text-white dark:text-gray-950 px-3.5 py-2 border border-white/15 dark:border-black/10 shadow-[0_10px_30px_rgba(0,0,0,0.35)] active:scale-[0.98] transition-all duration-150 cursor-pointer group backdrop-blur-xl"
      >
        {/* Left: Modern Minimal Bag Emblem & Count */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center transition-transform group-hover:scale-105">
              <ShoppingBag className="h-4 w-4 text-white dark:text-gray-900" />
            </div>
            <span 
              style={{ backgroundColor: 'var(--color-primary, #C2185B)' }}
              className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full text-[9px] font-black text-white shadow-xs ring-1.5 ring-gray-950 dark:ring-white"
            >
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          </div>

          <div className="min-w-0 text-left">
            <div className="text-xs font-extrabold tracking-tight text-white dark:text-gray-950 flex items-center gap-1.5 leading-none">
              <span>View Bag</span>
              <span className="inline-block w-1 h-1 rounded-full bg-white/40 dark:bg-black/40" />
              <span className="text-[11px] font-medium text-gray-300 dark:text-gray-600">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Price & Sleek Circular CTA Arrow */}
        <div className="flex items-center gap-2 flex-shrink-0 pl-2">
          <span className="text-xs sm:text-sm font-extrabold tracking-tight text-white dark:text-gray-950">
            {formatPrice(totalPrice, currencySymbol)}
          </span>
          <div 
            style={{ backgroundColor: 'var(--color-primary, #C2185B)' }}
            className="h-7 w-7 rounded-full text-white flex items-center justify-center shadow-xs group-hover:translate-x-0.5 transition-transform"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </Link>
    </div>
  );
}
