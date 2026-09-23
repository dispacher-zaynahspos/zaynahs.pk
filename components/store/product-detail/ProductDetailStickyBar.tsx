'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ShoppingCart, MessageCircle } from '@/components/common/Icons';
import { Product, ProductVariant } from '@/lib/types';
import { formatPrice } from '@/lib/utils/whatsapp';

interface ProductDetailStickyBarProps {
  product: Product;
  selectedVariant?: ProductVariant;
  stockAvailable: number;
  unitPrice: number;
  currencySymbol: string;
  onAddToCart: (e: React.MouseEvent) => void;
  whatsappUrl: string;
  activeImage: string;
  enableQuickWhatsapp?: boolean;
}

export function ProductDetailStickyBar({
  product,
  selectedVariant,
  stockAvailable,
  unitPrice,
  currencySymbol,
  onAddToCart,
  whatsappUrl,
  activeImage,
  enableQuickWhatsapp = true,
}: ProductDetailStickyBarProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar after user scrolls 320px down past hero gallery
      if (window.scrollY > 320) {
        setShow(true);
      } else {
        setShow(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] left-3 right-3 max-w-md mx-auto z-40 md:hidden bg-white/95 dark:bg-[#16162a]/95 backdrop-blur-xl border border-gray-200/90 dark:border-white/10 px-3 py-2 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] transition-all duration-300 animate-in fade-in slide-in-from-bottom-3">
      <div className="flex items-center justify-between gap-3">
        {/* Product Snapshot & Price */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="relative h-10 w-10 rounded-xl overflow-hidden border border-black/10 dark:border-white/15 bg-gray-50 dark:bg-black/30 shadow-xs flex-shrink-0">
            <Image
              src={activeImage}
              alt={product.name}
              fill
              sizes="40px"
              className="object-cover object-center"
            />
          </div>
          <div className="min-w-0 flex flex-col justify-center">
            <div className="text-sm font-extrabold text-gray-950 dark:text-white tracking-tight leading-none">
              {formatPrice(unitPrice, currencySymbol)}
            </div>
            <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400 truncate mt-1">
              {selectedVariant ? (selectedVariant.color || selectedVariant.size || selectedVariant.customValue || product.name) : product.name}
            </div>
          </div>
        </div>

        {/* Smart Modern Icon Action Area */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Direct WhatsApp Order CTA */}
          {enableQuickWhatsapp && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-md shadow-[#25D366]/20 active:scale-90 transition-all cursor-pointer flex-shrink-0"
              title="Order via WhatsApp"
              aria-label="Order via WhatsApp"
            >
              <MessageCircle className="h-4.5 w-4.5 fill-white" />
            </a>
          )}

          {/* Smart Icon-Only Add to Bag CTA */}
          {stockAvailable <= 0 ? (
            <div
              className="h-10 px-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center border border-gray-200 dark:border-gray-700 cursor-not-allowed select-none"
              title="Out of Stock"
            >
              Sold Out
            </div>
          ) : (
            <button
              type="button"
              onClick={onAddToCart}
              style={{ backgroundColor: 'var(--color-primary, #C2185B)' }}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-white shadow-lg shadow-[var(--color-primary,#C2185B)]/30 hover:brightness-110 active:scale-90 transition-all cursor-pointer flex-shrink-0"
              title="Add to Bag"
              aria-label="Add to Bag"
            >
              <ShoppingCart className="h-4.5 w-4.5 stroke-[2.2]" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-[#16162a] text-[var(--color-primary,#C2185B)] font-black text-[10px] shadow-sm leading-none border border-black/10 dark:border-white/10">
                +
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
