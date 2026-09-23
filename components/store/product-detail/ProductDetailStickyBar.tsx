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
    <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-[#121222]/95 backdrop-blur-xl border-t border-gray-200/80 dark:border-white/10 px-3.5 py-2 shadow-[0_-6px_24px_rgba(0,0,0,0.08)] transition-all duration-200 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center justify-between gap-2.5 max-w-lg mx-auto">
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

        {/* Smart Modern Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Direct WhatsApp Order CTA */}
          {enableQuickWhatsapp && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xs active:scale-95 transition-all cursor-pointer flex-shrink-0"
              title="Order via WhatsApp"
              aria-label="Order via WhatsApp"
            >
              <MessageCircle className="h-4.5 w-4.5 fill-white" />
            </a>
          )}

          {/* Add to Bag CTA */}
          <button
            type="button"
            onClick={onAddToCart}
            disabled={stockAvailable <= 0}
            style={{ backgroundColor: 'var(--color-primary, #C2185B)' }}
            className="flex items-center justify-center gap-1.5 text-white px-4 h-10 rounded-full text-xs font-bold uppercase tracking-wider shadow-md shadow-[var(--color-primary,#C2185B)]/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <ShoppingCart className="h-4 w-4 stroke-[2.2]" />
            <span>{stockAvailable <= 0 ? 'Sold Out' : 'Add to Bag'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
