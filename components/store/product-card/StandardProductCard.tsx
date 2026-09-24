'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product, StoreSettings } from '@/lib/types';
import { ShoppingCart, Heart, Eye } from '@/components/common/Icons';
import { formatPrice } from '@/lib/utils/whatsapp';
import { saveScrollPosition } from '@/lib/hooks/useScrollRestoration';
import { useMobileCardFocus } from '@/lib/hooks/useMobileCardFocus';

interface StandardProductCardProps {
  product: Product;
  currencySymbol: string;
  settings?: StoreSettings | null;
  activeImage: string;
  secondImage: string | null;
  hoveredImage: string | null;
  isInWishlist: boolean;
  showWishlist: boolean;
  showQuickview: boolean;
  showQuickcart: boolean;
  showStars: boolean;
  aspectClass: string;
  titleClampClass: string;
  alignClass: string;
  elementsOrder: string[];
  currentPrice: number;
  currentComparePrice?: number | null;
  hasPriceRange: boolean;
  minPrice: number;
  maxPrice: number;
  displayDescription: string;
  swatchAlign: string;
  finalRenderedGroups: React.ReactNode;
  onToggleWishlist: (e: React.MouseEvent) => void;
  onOpenQuickView: (e: React.MouseEvent) => void;
  onAddToCart: (e: React.MouseEvent) => void;
  onCardClick?: (e: React.MouseEvent) => void;
}

export const StandardProductCard: React.FC<StandardProductCardProps> = ({
  product,
  currencySymbol,
  settings,
  activeImage,
  secondImage,
  hoveredImage,
  isInWishlist,
  showWishlist,
  showQuickview,
  showQuickcart,
  showStars,
  aspectClass,
  titleClampClass,
  alignClass,
  elementsOrder,
  currentPrice,
  currentComparePrice,
  hasPriceRange,
  minPrice,
  maxPrice,
  displayDescription,
  swatchAlign,
  finalRenderedGroups,
  onToggleWishlist,
  onOpenQuickView,
  onAddToCart,
  onCardClick,
}) => {
  // ── Touch & Mobile Focus state ────────────────────────────────────────────────
  const { cardRef, isFocused, setManualFocus } = useMobileCardFocus();

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') {
      setManualFocus();
    }
  };

  // ── Image hover style ─────────────────────────────────────────────────────────
  const hoverStyle = settings?.imageHoverStyle ?? 'second_image';
  const isZoom = hoverStyle === 'zoom';
  const isSecondImage = hoverStyle === 'second_image';
  const showSecond = isSecondImage && Boolean(secondImage) && !hoveredImage;

  const productUrl = `/product/${product.slug}`;
  const handleNav = () => saveScrollPosition(product.id);

  const renderElement = (element: string) => {
    switch (element) {
      case 'title':
        return (
          <Link
            key="title"
            href={productUrl}
            onClick={onCardClick || handleNav}
            prefetch={true}
            className={`product-card-title relative z-[2] font-semibold text-[11px] sm:text-xs text-gray-900 dark:text-white leading-tight pb-0.5 ${titleClampClass}`}
          >
            {product.name}
          </Link>
        );
      case 'rating':
        if (!showStars) return null;
        return (
          <div key="rating" className={`mt-1 flex items-center gap-0.5 text-[9px] text-amber-400 ${swatchAlign}`}>
            {Array.from({ length: 5 }).map((_, idx) => (
              <svg
                key={idx}
                className={`h-2.5 w-2.5 ${idx < Math.round(product.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
                fill="currentColor" viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-[8px] text-gray-400 dark:text-gray-500 font-bold ml-0.5">({product.reviewsCount || 0})</span>
          </div>
        );
      case 'price':
        return (
          <div key="price" className={`mt-1.5 flex items-baseline gap-x-1.5 gap-y-0.5 flex-wrap ${swatchAlign}`}>
            <span className="product-price text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white">
              {hasPriceRange
                ? `${formatPrice(minPrice, currencySymbol)} – ${formatPrice(maxPrice, currencySymbol)}`
                : formatPrice(currentPrice, currencySymbol)}
            </span>
            {currentComparePrice && currentComparePrice > currentPrice && (
              <span className="text-[9px] text-gray-400 font-medium" style={{
                textDecoration: 'line-through', textDecorationColor: '#ef4444',
                WebkitTextDecorationColor: '#ef4444', textDecorationThickness: '1.5px', color: '#9ca3af',
              }}>
                {formatPrice(currentComparePrice, currencySymbol)}
              </span>
            )}
          </div>
        );
      case 'swatches':
        if (product.showSwatchesOnArchive === false || !finalRenderedGroups) return null;
        return (
          <div key="swatches" className="relative z-[2] flex flex-col gap-1.5 w-full mt-2 mb-2">
            {finalRenderedGroups}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    // ── SHOPIFY PATTERN ──────────────────────────────────────────────────────────
    // Outer div: touch state handler. NOT a Link (avoids mobile double-tap issue).
    // Transparent overlay Link at z-[1] covers entire card → single tap navigates.
    // Icons at z-[25] win over overlay → icon taps don't navigate.
    // Title Link at z-[2] → tap on title navigates directly.
    // ─────────────────────────────────────────────────────────────────────────────
    <div
      ref={cardRef}
      id={`product-card-${product.id}`}
      data-hover-effect={hoverStyle}
      onPointerDown={handlePointerDown}
      style={{ borderRadius: 'var(--border-radius-card, 16px)', touchAction: 'pan-y' }}
      className={`z-card-container group relative flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] shadow-xs hover:shadow-md transition-all duration-300 ${isFocused ? 'is-in-focus active-card' : ''}`}
    >
      {/* ── Shopify-style full-card transparent overlay link ── */}
      {/* Sits at z-[1], covers entire card, enables single-tap navigation on mobile */}
      <Link
        href={productUrl}
        onClick={onCardClick || handleNav}
        prefetch={true}
        className="absolute inset-0 z-[1]"
        aria-label={`View ${product.name}`}
        tabIndex={-1}
      />

      {/* ── Image box ── */}
      <div className={`relative ${aspectClass} w-full overflow-hidden bg-gray-50 dark:bg-black/10`}>
        {/* Primary image */}
        <Image
          src={activeImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className={`object-contain p-2 sm:p-3 object-center transition-opacity duration-200 pointer-events-none${isZoom ? ' hover-zoom' : ''}${showSecond ? ' hover-fade-out' : ''}`}
          priority={false}
          loading="lazy"
        />

        {/* Second image (hover/touch swap) */}
        {showSecond && secondImage && (
          <Image
            src={secondImage}
            alt={`${product.name} alternate`}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-contain p-2 sm:p-3 object-center absolute inset-0 transition-opacity duration-200 pointer-events-none hover-fade-in"
            priority={false}
            loading="lazy"
          />
        )}

        {/* Badges — z-[2], pointer-events:none so they don't block overlay link */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-[2] items-start pointer-events-none">
          {currentComparePrice && currentComparePrice > currentPrice && (
            <span style={{ backgroundColor: '#10b981' }} className="rounded-full px-2.5 py-0.5 text-[9px] font-black text-white shadow-xs uppercase tracking-wide">
              -{Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100)}%
            </span>
          )}
          {product.isFeatured && (
            <span className="rounded-full px-2.5 py-0.5 text-[9px] font-black shadow-xs uppercase tracking-wide"
              style={{ backgroundColor: product.customBadge?.name?.toLowerCase() === 'featured' ? product.customBadge.bgColor : '#e94560', color: product.customBadge?.name?.toLowerCase() === 'featured' ? product.customBadge.textColor : '#ffffff' }}>
              {product.customBadge?.name?.toLowerCase() === 'featured' ? product.customBadge.name : 'FEATURED'}
            </span>
          )}
          {product.badgeEnabled && product.customBadge && (!product.isFeatured || product.customBadge.name.toLowerCase() !== 'featured') && (
            <span className="rounded-full px-2.5 py-0.5 text-[9px] font-black text-white shadow-sm uppercase tracking-wide"
              style={{ backgroundColor: product.customBadge.bgColor, color: product.customBadge.textColor }}>
              {product.customBadge.name}
            </span>
          )}
          {!product.isService && product.stock > 0 && product.stock <= 8 && (
            <span className="rounded-full bg-amber-600 px-2.5 py-0.5 text-[9px] font-black text-white shadow-sm uppercase tracking-wide">LIMITED</span>
          )}
        </div>

        {/* Action icons — z-[25], above overlay link. Container: pointer-events:none */}
        {/* Each button: pointer-events:auto. stopPropagation prevents overlay link tap. */}
        {/* On mobile: always visible (CSS makes them persistent). Desktop: fade in on CSS hover. */}
        <div
          className="card-actions absolute right-1.5 sm:right-2 top-1.5 sm:top-2 flex flex-col gap-1.5 z-[25] transition-all duration-200 ease-out"
          style={{ pointerEvents: 'none' }}
        >
          {showWishlist && (
            <button type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWishlist(e); }}
              className="action-btn pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full bg-white/95 dark:bg-[#16162a]/95 backdrop-blur-xs shadow-md border border-gray-200/80 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:text-[var(--color-primary,#C2185B)] transition-transform duration-200 cursor-pointer"
              title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              aria-label={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <Heart className={`h-3.5 w-3.5 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          )}
          {showQuickview && (
            <button type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpenQuickView(e); }}
              className="action-btn pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full bg-white/95 dark:bg-[#16162a]/95 backdrop-blur-xs shadow-md border border-gray-200/80 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:text-[var(--color-primary,#C2185B)] transition-transform duration-200 cursor-pointer"
              title="Quick View" aria-label="Quick View"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
          )}
          {showQuickcart && (
            <button type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(e); }}
              className="action-btn pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full bg-white/95 dark:bg-[#16162a]/95 backdrop-blur-xs shadow-md border border-gray-200/80 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:text-[var(--color-primary,#C2185B)] transition-transform duration-200 cursor-pointer"
              title={product.hasVariants ? 'Choose Options' : 'Add to Cart'}
              aria-label={product.hasVariants ? 'Choose Options' : 'Add to Cart'}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Card content (above overlay link at z-[2]) ── */}
      <div className={`relative z-[2] flex flex-grow flex-col ${alignClass}`}>
        <div className="flex flex-col px-2.5 sm:px-3 pt-2.5 sm:pt-3 w-full">
          {elementsOrder.filter(el => el !== 'swatches').map(element => renderElement(element))}
          {displayDescription && (
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
              {displayDescription}
            </p>
          )}
        </div>
        <div className="w-full opacity-100 max-h-[200px] overflow-hidden px-2.5 sm:px-3 pb-2.5 sm:pb-3">
          {elementsOrder.includes('swatches') && renderElement('swatches')}
        </div>
      </div>
    </div>
  );
};
