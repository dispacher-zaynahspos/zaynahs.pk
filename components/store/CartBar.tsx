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
    <div className="fixed bottom-[calc(4.35rem+env(safe-area-inset-bottom,0px))] left-3 right-3 sm:left-5 sm:right-5 z-40 md:hidden pointer-events-none animate-in fade-in slide-in-from-bottom-3 duration-200">
      <Link
        href="/cart"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary, #C2185B) 0%, var(--color-secondary, #880E4F) 100%)'
        }}
        className="pointer-events-auto flex items-center justify-between rounded-2xl text-white px-4.5 py-3 shadow-[0_8px_25px_rgba(0,0,0,0.25)] border border-white/20 active:scale-[0.97] transition-all duration-150 cursor-pointer group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="h-8.5 w-8.5 rounded-xl bg-white/20 border border-white/25 flex items-center justify-center shadow-xs">
              <ShoppingBag className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-black text-[var(--color-primary,#C2185B)] shadow-xs">
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          </div>
          <div className="min-w-0">
            <span className="text-xs font-black tracking-tight block text-white">View Bag</span>
            <span className="text-[10px] font-medium text-white/80 block leading-none">
              {totalItems} {totalItems === 1 ? 'item' : 'items'} ready
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm font-black tracking-tight text-white">
            {formatPrice(totalPrice, currencySymbol)}
          </span>
          <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
            <ArrowRight className="h-3 w-3 text-white" />
          </div>
        </div>
      </Link>
    </div>
  );
}
