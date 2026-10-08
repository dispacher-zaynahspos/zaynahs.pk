'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product, StoreSettings } from '@/lib/types';
import { ProductCardActions } from './ProductCardActions';
import { ProductCardBadges } from './ProductCardBadges';
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
  isVariantSelected?: boolean;
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
  isVariantSelected = false,
}) => {
  // ── Mobile scroll-focus (Shopify-style): the card nearest the reading band gets
  //    `is-in-focus active-card` → its hover image plays + action icons spawn.
  //    Desktop keeps pure CSS :hover. A direct touch also locks focus onto the card. ──
  const { cardRef, isFocused, setManualFocus } = useMobileCardFocus(settings?.card_mobile_activation ?? 'scroll');

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') setManualFocus();
  };

  // ── Image hover style ─────────────────────────────────────────────────────────
  const hoverStyle = settings?.image_hover_style ?? 'second_image';
  const isZoom = hoverStyle === 'zoom';
  const isSecondImage = hoverStyle !== 'none' && hoverStyle !== 'zoom';
  const showSecond = isSecondImage && Boolean(secondImage) && !hoveredImage && !isVariantSelected;

  // ── Appearance controls (defaults preserve current look) ──
  const shadowClassMap: Record<string, string> = { none: '', sm: 'shadow-xs', md: 'shadow-md', lg: 'shadow-lg' };
  const cardShadowClass = shadowClassMap[settings?.card_shadow ?? 'sm'] ?? 'shadow-xs';
  const cardHoverClass = (settings?.card_hover_lift ?? true) ? 'hover:shadow-lg hover:-translate-y-1' : 'hover:shadow-md';
  const cardBorderClass = (settings?.card_border_enabled ?? true) ? 'border border-gray-200 dark:border-gray-800' : 'border-0';
  const imageFit = settings?.card_image_fit === 'cover' ? 'object-cover' : 'object-contain p-2 sm:p-3';
  const compareColor = settings?.card_compare_color || '#ef4444';

  const productUrl = `/product/${encodeURIComponent(product.slug || '')}`;
  const handleNav = () => saveScrollPosition(product.id);
  const handleClick = (e: React.MouseEvent) => {
    handleNav();
    if (onCardClick) onCardClick(e);
  };

  const renderElement = (element: string) => {
    switch (element) {
      case 'title':
        return (
          <Link
            key="title"
            href={productUrl}
            onClick={handleClick}
            prefetch={false}
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
            <span className="text-[8px] text-gray-400 dark:text-gray-500 font-bold ml-0.5">({product.reviews_count || 0})</span>
          </div>
        );
      case 'price':
        return (
          <div key="price" className={`mt-1.5 flex items-baseline gap-x-1.5 gap-y-0.5 flex-wrap ${swatchAlign}`}>
            <span className="product-price text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white" style={settings?.card_sale_price_color ? { color: settings.card_sale_price_color } : undefined}>
              {hasPriceRange
                ? `${formatPrice(minPrice, currencySymbol)} – ${formatPrice(maxPrice, currencySymbol)}`
                : formatPrice(currentPrice, currencySymbol)}
            </span>
            {currentComparePrice && currentComparePrice > currentPrice && (
              <span className="text-[9px] text-gray-400 font-medium" style={{
                textDecoration: 'line-through', textDecorationColor: compareColor,
                WebkitTextDecorationColor: compareColor, textDecorationThickness: '1.5px', color: '#9ca3af',
              }}>
                {formatPrice(currentComparePrice, currencySymbol)}
              </span>
            )}
          </div>
        );
      case 'swatches':
        if (product.show_swatches_on_archive === false || !finalRenderedGroups) return null;
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
    // Outer div: NOT a Link (avoids mobile double-tap issue).
    // Transparent overlay Link at z-[1] covers entire card → single tap navigates
    // DIRECTLY to the product. Icons at z-[25] win over overlay → icon taps don't navigate.
    // Title Link at z-[2] → tap on title navigates directly.
    // Action icons + hover image: revealed on mobile when the card is the scroll-focused
    // one (`is-in-focus active-card`, driven by useMobileCardFocus); on hover-capable
    // devices they reveal on real CSS :hover (customCss @media hover:hover).
    // ─────────────────────────────────────────────────────────────────────────────
    <div
      ref={cardRef}
      id={`product-card-${product.id}`}
      data-hover-effect={hoverStyle}
      onPointerDown={handlePointerDown}
      style={{ borderRadius: 'var(--border-radius-card, 16px)', touchAction: 'pan-y' }}
      className={`z-card-container group relative flex flex-col ${cardBorderClass} bg-white dark:bg-[#16162a] ${cardShadowClass} ${cardHoverClass} transition-all duration-300 ${isFocused ? 'is-in-focus active-card' : ''}`}
    >
      {/* ── Shopify-style full-card transparent overlay link ── */}
      {/* Sits at z-[1], covers entire card, enables single-tap navigation on mobile */}
      <Link
        href={productUrl}
        onClick={handleClick}
        prefetch={false}
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
          className={`${imageFit} object-center pointer-events-none${isZoom ? ' hover-zoom' : ''}${showSecond ? ' hover-fade-out' : ' transition-opacity duration-200'}`}
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
            className={`${imageFit} object-center absolute inset-0 pointer-events-none hover-fade-in`}
            priority={false}
            loading="lazy"
          />        )}

        {/* Badges — SSOT ProductCardBadges with collision-free top-left clearance */}
        <ProductCardBadges
          product={product}
          currentPrice={currentPrice}
          currentComparePrice={currentComparePrice}
        />

        {/* Action icons — OUTSIDE image overflow-hidden box so they never get clipped */}
        {/* Positioned absolute on z-card-container (relative). z-[25] wins over overlay link (z-[1]). */}
      </div>

      {/* ── Action icons — always outside the overflow-hidden image box (SSOT) ── */}
      <ProductCardActions
        showWishlist={showWishlist}
        showQuickview={showQuickview}
        showQuickcart={showQuickcart}
        isInWishlist={isInWishlist}
        hasVariants={Boolean(product.has_variants)}
        onToggleWishlist={onToggleWishlist}
        onOpenQuickView={onOpenQuickView}
        onAddToCart={onAddToCart}
        iconStyle={settings?.card_icon_style || 'pill'}
        variant="action-btn"
      />

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
