'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart } from '@/components/common/Icons';
import { Product, StoreSettings } from '@/lib/types';
import { formatPrice } from '@/lib/utils/whatsapp';
import { toast } from 'sonner';
import { animateFlyTo } from '@/lib/utils/flyAnimation';
import { getSharedAspectClass } from '@/lib/utils/styles';
import { getPresetImageUrl } from '@/lib/utils/imageUrl';

interface ShopProductListCardProps {
  product: Product;
  settings: StoreSettings;
  addItem: (product: Product, selectedVariant: any, selectedModifiers: any[], quantity: number) => void;
}

export default function ShopProductListCard({ product, settings, addItem }: ShopProductListCardProps) {
  const fallbackPlaceholder = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3C/svg%3E";
  const primaryImage = getPresetImageUrl(product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url || fallbackPlaceholder, 'card');
  const activeVariants = product.variants.filter(v => v.active);
  const defaultIndex = (settings?.defaultVariantIndex || 1) - 1;
  const defaultVar = activeVariants[defaultIndex] || activeVariants[0];
  const initialImage = (defaultVar && defaultVar.imageUrl) || primaryImage;
  const initialPrice = (defaultVar && defaultVar.price) ? defaultVar.price : product.price;
  const initialComparePrice = (defaultVar && defaultVar.comparePrice) ? defaultVar.comparePrice : product.comparePrice;

  // Check wishlist
  const [inWish, setInWish] = useState(false);
  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setInWish(wishlist.includes(product.id));
  }, [product.id]);

  const handleWishClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    let newW;
    if (inWish) {
      newW = wishlist.filter((id: string) => id !== product.id);
      toast.success('Removed from wishlist');
    } else {
      newW = [...wishlist, product.id];
      toast.success('Added to wishlist');

      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const targetId = isMobile ? 'mobile-bottom-wishlist-icon' : 'header-wishlist-icon-desktop';
      animateFlyTo(e.currentTarget as HTMLElement, targetId, primaryImage);
    }
    localStorage.setItem('wishlist', JSON.stringify(newW));
    setInWish(!inWish);
    window.dispatchEvent(new Event('wishlist-updated'));
  };

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-row overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] shadow-sm hover:shadow-md transition-all duration-300 relative"
    >
      {/* Left: Image Container */}
      <div className={`relative w-36 sm:w-48 shrink-0 overflow-hidden bg-gray-50 ${getSharedAspectClass(settings?.imageAspectRatio)}`}>
        <Image
          src={initialImage}
          alt={product.name}
          fill
          sizes="200px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Badge */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 items-start pointer-events-none">
          {initialComparePrice && initialComparePrice > initialPrice && (
            <span className="rounded-md bg-[#10b981] px-2 py-0.5 text-[9px] font-extrabold text-white tracking-wide shadow-sm animate-none">
              -{Math.round(((initialComparePrice - initialPrice) / initialComparePrice) * 100)}%
            </span>
          )}
          {product.isFeatured && (
            <span
              className="rounded-md px-2 py-0.5 text-[9px] font-extrabold shadow-sm tracking-wide"
              style={{
                backgroundColor: product.customBadge?.name?.toLowerCase() === 'featured' ? product.customBadge.bgColor : '#e94560',
                color: product.customBadge?.name?.toLowerCase() === 'featured' ? product.customBadge.textColor : '#ffffff'
              }}
            >
              {product.customBadge?.name?.toLowerCase() === 'featured' ? product.customBadge.name : 'FEATURED'}
            </span>
          )}
          {product.badgeEnabled && product.customBadge && (!product.isFeatured || product.customBadge.name.toLowerCase() !== 'featured') && (
            <span
              className="rounded-md px-2 py-0.5 text-[9px] font-extrabold shadow-sm tracking-wide"
              style={{
                backgroundColor: product.customBadge.bgColor,
                color: product.customBadge.textColor
              }}
            >
              {product.customBadge.name}
            </span>
          )}
        </div>
      </div>

      {/* Right: Info container */}
      <div className="flex-1 p-3 sm:p-5 flex flex-col justify-between">
        <div className="space-y-1 sm:space-y-2">
          <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white group-hover:text-[#e94560] transition-colors line-clamp-2">
            {product.name}
          </h4>

          {/* Stars */}
          <div className="flex items-center gap-0.5 text-xs text-amber-400">
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
              ({product.reviewsCount || 0})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-base sm:text-lg font-bold text-[#1a1a2e] dark:text-white">
              {formatPrice(initialPrice, settings.currencySymbol)}
            </span>
            {initialComparePrice && initialComparePrice > initialPrice && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(initialComparePrice, settings.currencySymbol)}
              </span>
            )}
          </div>

          {/* Description */}
          {product.shortDescription && (
            <p className="hidden sm:block text-xs text-gray-500 dark:text-gray-400 font-medium line-clamp-2 pt-1">
              {product.shortDescription}
            </p>
          )}
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleWishClick}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-[#e94560] transition-all cursor-pointer"
            >
              <Heart className={`h-4.5 w-4.5 ${inWish ? 'fill-red-500 text-red-500' : ''}`} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (product.hasVariants) {
                  window.location.href = `/product/${product.slug}`;
                  return;
                }
                addItem(product, undefined, [], 1);
                toast.success(`${product.name} added to cart!`);

                const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
                const targetId = isMobile ? 'header-cart-icon-mobile' : 'header-cart-icon-desktop';
                animateFlyTo(e.currentTarget as HTMLElement, targetId, primaryImage);
              }}
              className="flex h-9 items-center gap-1.5 px-4 rounded-xl bg-[#1a1a2e] dark:bg-[#e94560] text-white hover:opacity-90 active:scale-95 text-xs font-bold transition-all cursor-pointer"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>{product.hasVariants ? 'Choose Options' : 'Buy Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
