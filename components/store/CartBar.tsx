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
        style={{
          background: 'linear-gradient(135deg, var(--color-primary, #C2185B) 0%, var(--color-secondary, #880E4F) 100%)',
          borderRadius: '9999px !important',
          boxShadow: '0 8px 24px -2px rgba(0,0,0,0.3), 0 3px 6px -2px rgba(0,0,0,0.15)',
        }}
        className="pointer-events-auto w-full max-w-[360px] flex items-center justify-between !rounded-full text-white px-3 py-1.5 border border-white/30 active:scale-[0.98] transition-all duration-150 cursor-pointer group backdrop-blur-md"
      >
        {/* Left: Dynamic Shopping Bag Emblem */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex-shrink-0">
            <div 
              style={{ borderRadius: '9999px !important' }}
              className="h-8.5 w-8.5 !rounded-full bg-white text-[var(--color-primary,#C2185B)] flex items-center justify-center shadow-md ring-2 ring-white/30 transition-transform group-hover:scale-105"
            >
              <ShoppingBag className="h-4.5 w-4.5 text-[var(--color-primary,#C2185B)]" />
            </div>
            <span 
              style={{ borderRadius: '9999px !important' }}
              className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center !rounded-full bg-gray-900 text-[9px] font-black text-white shadow-xs ring-1.5 ring-white"
            >
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          </div>

          <div className="min-w-0 text-left">
            <div className="text-[12px] font-black tracking-tight text-white leading-tight flex items-center gap-1">
              <span>View Bag</span>
              <span className="inline-block w-1 h-1 rounded-full bg-white/70"></span>
              <span className="text-[10px] font-medium text-white/90">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
            </div>
            <span className="text-[9.5px] font-medium text-white/75 block leading-tight mt-0.5">
              Tap to review & checkout
            </span>
          </div>
        </div>

        {/* Right: Price & Sleek Pill Action Button */}
        <div className="flex items-center gap-2 flex-shrink-0 pl-2">
          <span className="text-xs sm:text-sm font-black tracking-tight text-white drop-shadow-xs">
            {formatPrice(totalPrice, currencySymbol)}
          </span>
          <div 
            style={{ borderRadius: '9999px !important' }}
            className="h-7 w-7 !rounded-full bg-white/25 border border-white/30 flex items-center justify-center group-hover:translate-x-0.5 transition-transform"
          >
            <ArrowRight className="h-3.5 w-3.5 text-white" />
          </div>
        </div>
      </Link>
    </div>
  );
}
