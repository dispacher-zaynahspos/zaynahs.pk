'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart } from '@/components/common/Icons';
import { CardWishlistIcon, CardCartIcon } from '@/components/store/product-card/ProductCardActions';
import { Product, StoreSettings } from '@/lib/types';
import { formatPrice } from '@/lib/utils/whatsapp';
import { toast } from 'sonner';
import { flyToCart } from '@/lib/utils/flyAnimation';
import { getSharedAspectClass } from '@/lib/utils/styles';
import { getPresetImageUrl } from '@/lib/utils/imageUrl';
import { useWishlist } from '@/components/store/product-card/hooks/useWishlist';
import { saveScrollPosition } from '@/lib/hooks/useScrollRestoration';
import { ProductCardBadges } from '@/components/store/product-card/ProductCardBadges';

interface ShopProductListCardProps {
  product: Product;
  settings: StoreSettings;
  addItem: (product: Product, selectedVariant: any, selectedModifiers: any[], quantity: number) => void;
}

export default function ShopProductListCard({ product, settings, addItem }: ShopProductListCardProps) {
  const fallbackPlaceholder = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3C/svg%3E";
  const primaryImage = getPresetImageUrl(product.images?.find(img => img.is_primary)?.url || product.images?.[0]?.url || fallbackPlaceholder, 'card');
  const activeVariants = product.variants.filter(v => v.active);
  const defaultIndex = (settings?.default_variant_index || 1) - 1;
  const defaultVar = activeVariants[defaultIndex] || activeVariants[0];
  const initialImage = (defaultVar && defaultVar.image_url) || primaryImage;
  const initialPrice = (defaultVar && defaultVar.price) ? defaultVar.price : product.price;
  const initialComparePrice = (defaultVar && defaultVar.compare_price) ? defaultVar.compare_price : product.compare_price;

  // Wishlist (shared single-source hook)
  const { isInWishlist: inWish, toggleWishlist: handleWishClick } = useWishlist(product.id, primaryImage);

  return (
    <div
      id={`product-card-${product.id}`}
      data-product-id={product.id}
      className="group flex flex-row overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] shadow-sm hover:shadow-md transition-all duration-300 relative"
    >
      {/* Stretched navigation link (covers card, sits above non-interactive content,
          below the action buttons — avoids invalid <button> inside <a> nesting) */}
      <Link
        href={`/product/${encodeURIComponent(product.slug || '')}`}
        onClick={() => saveScrollPosition(product.id)}
        aria-label={product.name}
        className="absolute inset-0 z-10"
      />
      {/* Left: Image Container */}
      <div className={`relative w-36 sm:w-48 shrink-0 overflow-hidden bg-gray-50 ${getSharedAspectClass(settings?.image_aspect_ratio)}`}>
        <Image
          src={initialImage}
          alt={product.name}
          fill
          sizes="200px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Badges — SSOT ProductCardBadges */}
        <ProductCardBadges
          product={product}
          currentPrice={initialPrice}
          currentComparePrice={initialComparePrice}
        />
      </div>

      {/* Right: Info container */}
      <div className="flex-1 p-3 sm:p-5 flex flex-col justify-between">
        <div className="space-y-1 sm:space-y-2">
          <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white group-hover:text-[#e94560] transition-colors line-clamp-2">
            {product.name}
          </h4>

          {/* Stars */}
          {settings?.card_show_stars !== false && (
            <div className="flex items-center gap-0.5 text-xs text-amber-400 my-0.5 sm:my-1">
              {Array.from({ length: 5 }).map((_, idx) => (
                <svg
                  key={idx}
                  className={`h-3 w-3 ${idx < Math.round(product.rating || 5)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-300 dark:text-gray-600'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-[10px] text-gray-400 font-semibold ml-1">
                ({product.reviews_count || 0})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-base sm:text-lg font-bold text-[#1a1a2e] dark:text-white">
              {formatPrice(initialPrice, settings.currency_symbol)}
            </span>
            {initialComparePrice && initialComparePrice > initialPrice && (
              <span
                className="text-xs text-gray-400 line-through decoration-red-500 decoration-[1.5px]"
                style={{
                  textDecoration: 'line-through',
                  textDecorationColor: '#ef4444',
                  WebkitTextDecorationColor: '#ef4444',
                  textDecorationThickness: '1.5px',
                  color: '#9ca3af',
                }}
              >
                {formatPrice(initialComparePrice, settings.currency_symbol)}
              </span>
            )}
          </div>

          {/* Description */}
          {product.short_description && (
            <p className="hidden sm:block text-xs text-gray-500 dark:text-gray-400 font-medium line-clamp-2 pt-1">
              {product.short_description}
            </p>
          )}
        </div>

        {/* Action Row */}
        <div className={`flex items-center justify-between gap-3 pt-2 relative z-20 icon-preset-${settings.card_icon_style || 'pill'}`}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleWishClick}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-[#e94560] transition-all cursor-pointer"
            >
              <CardWishlistIcon isInWishlist={inWish} iconStyle={settings.card_icon_style} className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (product.has_variants) {
                  const activeVars = (product.variants || []).filter(v => v.active);
                  if (activeVars.length === 1) {
                    addItem(product, activeVars[0], [], 1);
                    toast.success(`${product.name} added to cart!`);
                    flyToCart(e.currentTarget as HTMLElement, primaryImage, product.id);
                    return;
                  }
                  window.location.href = `/product/${encodeURIComponent(product.slug || '')}`;
                  return;
                }
                addItem(product, undefined, [], 1);
                toast.success(`${product.name} added to cart!`);
                flyToCart(e.currentTarget as HTMLElement, primaryImage, product.id);
              }}
              className="flex h-9 items-center gap-1.5 px-3.5 rounded-xl bg-[#1a1a2e] dark:bg-[#e94560] text-white hover:opacity-90 active:scale-95 text-xs font-bold transition-all cursor-pointer whitespace-nowrap truncate"
            >
              <CardCartIcon iconStyle={settings.card_icon_style} className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{product.has_variants ? 'Choose Options' : 'Add to Cart'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
