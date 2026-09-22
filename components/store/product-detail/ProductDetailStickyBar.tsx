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
    <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-[#16162a]/95 backdrop-blur-md border-t border-gray-200/80 dark:border-gray-800/80 px-3.5 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] transition-transform duration-200 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center justify-between gap-3">
        {/* Product Snapshot & Price */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-gray-200/80 dark:border-gray-700 bg-gray-50 dark:bg-black/20 flex-shrink-0">
            <Image
              src={activeImage}
              alt={product.name}
              fill
              sizes="40px"
              className="object-cover object-center"
            />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-gray-900 dark:text-white tracking-tight truncate">
              {formatPrice(unitPrice, currencySymbol)}
            </div>
            <div className="text-[10px] font-medium text-gray-500 dark:text-gray-400 truncate">
              {selectedVariant ? (selectedVariant.color || selectedVariant.size || selectedVariant.customValue || product.name) : product.name}
            </div>
          </div>
        </div>

        {/* Dual Actions: Add to Cart + WhatsApp Direct Buy */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Direct WhatsApp Order CTA */}
          {enableQuickWhatsapp && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white px-3.5 h-9 rounded-xl text-xs font-black shadow-xs active:scale-95 transition-all cursor-pointer"
              title="Order via WhatsApp"
            >
              <MessageCircle className="h-4 w-4 fill-white" />
              <span className="hidden xs:inline">WhatsApp</span>
            </a>
          )}

          {/* Add to Bag CTA */}
          <button
            type="button"
            onClick={onAddToCart}
            disabled={stockAvailable <= 0}
            style={{ backgroundColor: 'var(--color-primary, #C2185B)' }}
            className="flex items-center justify-center gap-1.5 text-white px-3.5 h-9 rounded-xl text-xs font-black shadow-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>{stockAvailable <= 0 ? 'Out' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
