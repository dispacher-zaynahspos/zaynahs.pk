'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ShoppingCart, MessageCircle } from '@/components/common/Icons';
import { Product, ProductVariant } from '@/lib/types';
import { formatPrice } from '@/lib/utils/whatsapp';
import { AddToCartButton } from '@/components/store/AddToCartButton';

interface ProductDetailStickyBarProps {
  product: Product;
  selectedVariant?: ProductVariant;
  stockAvailable: number;
  unitPrice: number;
  currencySymbol: string;
  onAddToCart: (e: React.MouseEvent<HTMLButtonElement>) => void;
  whatsappUrl: string;
  activeImage: string;
  enableQuickWhatsapp?: boolean;
  animation?: string;
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
  animation = 'none',
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
    <div
      className="fixed left-3 right-3 max-w-md mx-auto z-[var(--z-sticky-cta)] md:hidden bg-white/98 dark:bg-[#16162a]/98 backdrop-blur-2xl backdrop-saturate-150 border border-gray-200/90 dark:border-white/15 px-3 py-2 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.18)] transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
      style={{ bottom: 'var(--offset-cart-bar)' }}
    >
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
              {selectedVariant ? (selectedVariant.color || selectedVariant.size || selectedVariant.custom_value || product.name) : product.name}
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
          <AddToCartButton
            variant="icon"
            animation={animation}
            isOutOfStock={stockAvailable <= 0}
            isFaded={Boolean(product.has_variants && product.variants?.length && !selectedVariant)}
            onAddToCart={onAddToCart}
            title={stockAvailable <= 0 ? 'Out of Stock' : (!selectedVariant && product.has_variants ? 'Select an Option' : 'Add to Bag')}
          />
        </div>
      </div>
    </div>
  );
}
