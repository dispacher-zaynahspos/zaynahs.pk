'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Product, StoreSettings } from '@/lib/types';
import { CheckCircle2, ShoppingBag, X } from '@/components/common/Icons';
import { useCartStore } from '@/store/cartStore';

interface RecentBuyerTickerProps {
  settings: StoreSettings;
  product: Product;
  buyer: { name: string; city: string };
  timeAgo: string;
  onClose: () => void;
}

export default function RecentBuyerTicker({
  settings: _settings,
  product,
  buyer,
  timeAgo,
  onClose,
}: RecentBuyerTickerProps) {
  const [mounted, setMounted] = React.useState(false);
  const totalItems = useCartStore((state) => state.totalItems());
  const pathname = usePathname();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Determine whether the sticky CartBar ("View Bag") is visible on mobile
  const isCartBarVisible = mounted && totalItems > 0 && pathname !== '/cart' && pathname !== '/checkout';

  return (
    <aside
      aria-label="Recent purchase notification"
      className="fixed left-3 sm:left-6 z-[var(--z-toast)] w-[calc(100vw-1.5rem)] max-w-[316px] sm:max-w-[340px] bg-white/95 dark:bg-[#0c0c16]/95 border border-black/[0.08] dark:border-white/[0.12] rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.6)] transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 group overflow-hidden"
      style={{
        bottom: isCartBarVisible ? 'var(--offset-above-cart)' : 'var(--offset-above-nav)',
      }}
    >
      <Link
        href={`/product/${product.slug}`}
        className="flex items-center gap-3 p-2.5 sm:p-3 pr-8 w-full group/link"
      >
        {/* Product Thumbnail */}
        <div className="relative w-12 h-12 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-black/5 dark:border-white/10 shadow-2xs">
          {product.images?.[0]?.url ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              sizes="48px"
              className="object-cover transition-transform duration-300 group-hover/link:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {/* Top Row: Buyer Name + Location */}
          <div className="flex items-center gap-1 min-w-0">
            <span className="font-bold text-gray-900 dark:text-white text-[12px] truncate tracking-tight">
              {buyer.name}
            </span>
            <span className="text-[10.5px] text-gray-400 dark:text-gray-500 font-normal shrink-0">
              from
            </span>
            <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300 truncate">
              {buyer.city}
            </span>
          </div>

          {/* Middle Row: Product Name */}
          <p className="text-[11.5px] font-semibold text-gray-800 dark:text-gray-200 truncate mt-0.5 leading-snug group-hover/link:text-[var(--color-primary)] transition-colors">
            Bought {product.name}
          </p>

          {/* Bottom Row: Timestamp + Verified Micro-badge */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
              {timeAgo}
            </span>
            <span className="inline-block w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-2.5 h-2.5 stroke-[2.5]" /> Verified
            </span>
          </div>
        </div>
      </Link>

      {/* Sleek Internal Recessed Dismiss Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
        aria-label="Dismiss purchase notification"
        className="absolute top-2 right-2 p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 active:scale-90 transition-all cursor-pointer z-10"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </aside>
  );
}
