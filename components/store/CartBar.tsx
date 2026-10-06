'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, ArrowRight } from '@/components/common/Icons';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils/whatsapp';

interface CartBarProps {
  currencySymbol?: string;
  /** show/hide the bar entirely (customizer control) */
  enabled?: boolean;
}

export default function CartBar({ currencySymbol = 'Rs.', enabled = true }: CartBarProps) {
  const totalItems = useCartStore(state => state.totalItems());
  const totalPrice = useCartStore(state => state.totalPrice());
  const pathname = usePathname();

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Hide on cart/checkout pages or when cart is empty / disabled
  if (!enabled || !mounted || totalItems === 0 || pathname === '/cart' || pathname === '/checkout') return null;

  return (
    <div
      className="fixed left-0 right-0 z-[var(--z-cart-bar)] md:hidden flex justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-200"
      style={{ bottom: 'var(--offset-cart-bar)' }}
    >
      <Link
        href="/cart"
        style={{
          backgroundColor: 'var(--color-primary, #C2185B)',
          color: 'var(--btn-primary-text, #ffffff)',
          borderRadius: '9999px',
        }}
        className="pointer-events-auto w-full max-w-[340px] flex items-center justify-between px-3.5 py-2 border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.35)] active:scale-[0.98] transition-all duration-150 cursor-pointer group"
      >
        {/* Left: Bag emblem + live count */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-white/15 flex items-center justify-center transition-transform group-hover:scale-105">
              <ShoppingBag className="h-4 w-4" style={{ color: 'var(--btn-primary-text, #ffffff)' }} />
            </div>
            <span
              style={{ backgroundColor: 'var(--color-accent, #e94560)' }}
              className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full text-[9px] font-black text-white shadow-xs ring-1.5 ring-white/70"
            >
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          </div>

          <div className="min-w-0 text-left">
            <div className="text-xs font-extrabold tracking-tight flex items-center gap-1.5 leading-none">
              <span>View Bag</span>
              <span className="inline-block w-1 h-1 rounded-full bg-current opacity-40" />
              <span className="text-[11px] font-medium opacity-80">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: price + circular CTA arrow */}
        <div className="flex items-center gap-2 flex-shrink-0 pl-2">
          <span className="text-xs sm:text-sm font-extrabold tracking-tight">
            {formatPrice(totalPrice, currencySymbol)}
          </span>
          <div
            style={{ backgroundColor: 'var(--color-accent, #e94560)' }}
            className="h-7 w-7 rounded-full text-white flex items-center justify-center shadow-xs group-hover:translate-x-0.5 transition-transform"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </Link>
    </div>
  );
}
