'use client';

import React from 'react';
import Link from 'next/link';
import { Product, StoreSettings } from '@/lib/types';
import { saveScrollPosition } from '@/lib/hooks/useScrollRestoration';
import { useMobileCardFocus } from '@/lib/hooks/useMobileCardFocus';
import { Heart, ShoppingCart } from '@/components/common/Icons';
import { formatPrice } from '@/lib/utils/whatsapp';
import { normalizeCardStyle, getCardStyleClass } from '@/lib/utils/cardStyles';
import { ProductCardStyleInjector } from './ProductCardStyles';
import { ProductCardBadges } from './ProductCardBadges';
import { ProductCardMedia } from './ProductCardMedia';
import { ProductCardActions } from './ProductCardActions';
import { ProductCardShowcaseContent } from './ProductCardShowcaseContent';

interface ProductCardShowcaseProps {
  activeStyle: string;
  product: Product;
  settings?: StoreSettings | null;
  currencySymbol: string;
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
  finalRenderedGroups: React.ReactNode;
  onToggleWishlist: (e: React.MouseEvent) => void;
  onOpenQuickView: (e: React.MouseEvent) => void;
  onAddToCart: (e: React.MouseEvent) => void;
  onCardClick?: (e: React.MouseEvent) => void;
}

export const ProductCardShowcases: React.FC<ProductCardShowcaseProps> = ({
  activeStyle,
  product,
  settings,
  currencySymbol,
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
  finalRenderedGroups,
  onToggleWishlist,
  onOpenQuickView,
  onAddToCart,
  onCardClick,
}) => {
  // ── Mobile scroll-focus (Shopify-style): the card nearest the reading band gets
  //    `is-in-focus active-card` → hover image plays + action icons spawn.
  //    Desktop keeps pure CSS :hover. A direct touch also locks focus onto the card. ──
  const { cardRef, isFocused, setManualFocus } = useMobileCardFocus(settings?.card_mobile_activation ?? 'scroll');

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') setManualFocus();
  };

  const safeStyle = normalizeCardStyle(activeStyle);
  const scClass = getCardStyleClass(safeStyle);
  const imgBgClass =
    scClass === 'sc8' ? 'bg-[#fef9e7]' :
    scClass === 'sc10' ? 'bg-gradient-to-br from-[#fdf6ec] to-[#f5e6d0] rounded-t-[24px]' :
    scClass === 'sc11' ? 'bg-gradient-to-br from-[#1a1a1a] to-[#050505]' :
    scClass === 'sc12' ? 'bg-[#f4f3f1]' :
    scClass === 'sc13' ? 'bg-[#fce4ea] rounded-t-[22px]' :
    scClass === 'sc14' ? 'bg-[#f0f0f0]' :
    scClass === 'sc15' ? 'bg-gradient-to-br from-[#dfe6ef] to-[#c9d4e2] rounded-t-[20px]' :
    scClass === 'sc16' ? 'bg-gradient-to-br from-[#efe4d3] to-[#e3d1b8] rounded-t-[14px]' :
    scClass === 'sc20' ? 'bg-[#f4f4f4]' :
    scClass === 'sc21' ? 'bg-[#ffffff]' :
    scClass === 'sc22' ? 'bg-[#f0f0f2]' :
    scClass === 'sc23' ? 'bg-[#ffffff]' :
    scClass === 'sc24' ? 'bg-[#faf6f0] rounded-t-2xl' :
    '';

  const productUrl = `/product/${encodeURIComponent(product.slug || '')}`;
  const handleNav = () => saveScrollPosition(product.id);
  const handleClick = (e: React.MouseEvent) => {
    handleNav();
    if (onCardClick) onCardClick(e);
  };

  const hoverStyle = settings?.image_hover_style ?? 'second_image';

  // ── SHOPIFY PATTERN: outer div + transparent overlay Link ─────────────────────
  // • Outer div (not a Link → no double-tap issue)
  // • Transparent overlay Link at z-[1] = single-tap navigates DIRECTLY to the product
  // • Actions at z-[25] = icon taps win over overlay, don't navigate
  // • Title Link at z-[2] = semantic title navigation
  const renderCardBody = () => {
    // ── ARCHETYPE 20: ZARA HAUTE EDITORIAL ────────────────────────────────────
    if (scClass === 'sc20') {
      return (
        <>
          <div className={`img-box relative ${aspectClass} w-full ${imgBgClass} overflow-hidden`}>
            <ProductCardBadges product={product} currentPrice={currentPrice} currentComparePrice={currentComparePrice} />
            <ProductCardMedia activeImage={activeImage} secondImage={secondImage} hoveredImage={hoveredImage} productName={product.name} settings={settings} fitClass={settings?.card_image_fit === 'cover' ? 'object-cover' : 'object-contain'} />
            <ProductCardActions variant="slide-drawer" showWishlist={showWishlist} showQuickview={showQuickview} showQuickcart={showQuickcart} isInWishlist={isInWishlist} hasVariants={product.has_variants} onToggleWishlist={onToggleWishlist} onOpenQuickView={onOpenQuickView} onAddToCart={onAddToCart} />
          </div>
          <div className="cb flex flex-col px-1 pt-2.5 pb-1 w-full relative z-[2]">
            <div className="flex items-baseline justify-between gap-2 w-full">
              <Link href={productUrl} onClick={handleClick} prefetch={false} className={`card-title text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white truncate flex-1 ${titleClampClass}`}>
                {product.name}
              </Link>
              <span className="card-price text-[11px] sm:text-xs font-bold text-gray-900 dark:text-white shrink-0">
                {formatPrice(currentPrice, currencySymbol)}
              </span>
            </div>
            {finalRenderedGroups && (
              <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                {finalRenderedGroups}
              </div>
            )}
          </div>
        </>
      );
    }

    // ── ARCHETYPE 21: DARAZ DEAL RUSH ─────────────────────────────────────────
    if (scClass === 'sc21') {
      const discountPct = (currentComparePrice && currentComparePrice > currentPrice) ? Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100) : 0;
      return (
        <>
          <div className={`img-box relative ${aspectClass} w-full ${imgBgClass} rounded-t-xl overflow-hidden`}>
            <ProductCardBadges product={product} currentPrice={currentPrice} currentComparePrice={currentComparePrice} />
            <ProductCardMedia activeImage={activeImage} secondImage={secondImage} hoveredImage={hoveredImage} productName={product.name} settings={settings} fitClass={settings?.card_image_fit === 'cover' ? 'object-cover' : 'object-contain'} />
            <ProductCardActions variant="action-btn" showWishlist={showWishlist} showQuickview={showQuickview} showQuickcart={false} isInWishlist={isInWishlist} hasVariants={product.has_variants} onToggleWishlist={onToggleWishlist} onOpenQuickView={onOpenQuickView} onAddToCart={onAddToCart} />
          </div>
          <div className="cb flex flex-col p-2.5 w-full relative z-[2] bg-white dark:bg-[#16162a] rounded-b-xl">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="card-price text-sm sm:text-base font-black text-[#f85606] leading-none">
                {formatPrice(currentPrice, currencySymbol)}
              </span>
              {currentComparePrice && currentComparePrice > currentPrice && (
                <span className="pold text-[10px] text-gray-400 line-through">
                  {formatPrice(currentComparePrice, currencySymbol)}
                </span>
              )}
              {discountPct > 0 && (
                <span className="text-[9px] font-black px-1.5 py-0.2 rounded-xs bg-orange-100 dark:bg-orange-950/40 text-[#f85606]">
                  -{discountPct}%
                </span>
              )}
            </div>
            {showStars && (
              <div className="flex items-center gap-1.5 my-1">
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-sm bg-amber-500/10 text-amber-600 text-[9.5px] font-bold">
                  ★ {product.rating ? product.rating.toFixed(1) : '4.8'}
                </span>
                <span className="text-[9px] text-gray-400 font-medium">({product.reviews_count || 18} Sold)</span>
              </div>
            )}
            <Link href={productUrl} onClick={handleClick} prefetch={false} className={`card-title text-[11px] sm:text-xs font-semibold text-gray-900 dark:text-white leading-snug my-1 ${titleClampClass}`}>
              {product.name}
            </Link>
            {finalRenderedGroups && (
              <div className="my-1" onClick={(e) => e.stopPropagation()}>
                {finalRenderedGroups}
              </div>
            )}
            <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden my-1">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full w-[82%]" />
            </div>
            {showQuickcart && (
              <div className="mt-1.5">
                <ProductCardActions variant="direct-button" showWishlist={false} showQuickview={false} showQuickcart={true} isInWishlist={isInWishlist} hasVariants={product.has_variants} onToggleWishlist={onToggleWishlist} onOpenQuickView={onOpenQuickView} onAddToCart={onAddToCart} />
              </div>
            )}
          </div>
        </>
      );
    }

    // ── ARCHETYPE 22: NIKE STREETWEAR ─────────────────────────────────────────
    if (scClass === 'sc22') {
      return (
        <>
          <div className={`img-box relative ${aspectClass} w-full ${imgBgClass} rounded-t-xl`}>
            <ProductCardBadges product={product} currentPrice={currentPrice} currentComparePrice={currentComparePrice} />
            <ProductCardMedia activeImage={activeImage} secondImage={secondImage} hoveredImage={hoveredImage} productName={product.name} settings={settings} fitClass={settings?.card_image_fit === 'cover' ? 'object-cover' : 'object-contain'} />
            <ProductCardActions variant="corner-fab" showWishlist={showWishlist} showQuickview={showQuickview} showQuickcart={showQuickcart} isInWishlist={isInWishlist} hasVariants={product.has_variants} onToggleWishlist={onToggleWishlist} onOpenQuickView={onOpenQuickView} onAddToCart={onAddToCart} />
          </div>
          <div className="cb flex flex-col p-2.5 sm:p-3 w-full relative z-[2] bg-white dark:bg-[#16162a] rounded-b-xl">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-gray-400 mb-0.5">
              Collection • {product.has_variants ? 'Multiple Sizes' : 'In Stock'}
            </span>
            <Link href={productUrl} onClick={handleClick} prefetch={false} className={`card-title text-xs sm:text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white leading-tight ${titleClampClass}`}>
              {product.name}
            </Link>
            {finalRenderedGroups && (
              <div className="my-1.5" onClick={(e) => e.stopPropagation()}>
                {finalRenderedGroups}
              </div>
            )}
            <div className="mt-1 flex items-baseline gap-2">
              <span className="card-price text-xs sm:text-sm font-black text-gray-900 dark:text-white">
                {formatPrice(currentPrice, currencySymbol)}
              </span>
              {currentComparePrice && currentComparePrice > currentPrice && (
                <span className="pold text-[10px] text-gray-400 line-through">
                  {formatPrice(currentComparePrice, currencySymbol)}
                </span>
              )}
            </div>
          </div>
        </>
      );
    }

    // ── ARCHETYPE 23: AMAZON MARKETPLACE ──────────────────────────────────────
    if (scClass === 'sc23') {
      return (
        <>
          <div className="bg-[#b12704] text-white text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 text-center rounded-t-lg z-[2] relative">
            Limited Time Deal
          </div>
          <div className={`img-box relative ${aspectClass} w-full ${imgBgClass}`}>
            <ProductCardBadges product={product} currentPrice={currentPrice} currentComparePrice={currentComparePrice} />
            <ProductCardMedia activeImage={activeImage} secondImage={secondImage} hoveredImage={hoveredImage} productName={product.name} settings={settings} fitClass={settings?.card_image_fit === 'cover' ? 'object-cover' : 'object-contain'} />
            {showWishlist && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWishlist(e); }}
                onPointerDown={(e) => e.stopPropagation()}
                className="action-btn pointer-events-auto absolute right-2 top-2 z-[25] flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm border border-gray-200 text-gray-700 cursor-pointer"
                title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart className={`h-3.5 w-3.5 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
            )}
          </div>
          <div className="cb flex flex-col p-2.5 w-full relative z-[2] bg-white dark:bg-[#16162a] rounded-b-lg">
            {showStars && (
              <div className="flex items-center gap-1 mb-1">
                <span className="text-amber-500 text-xs tracking-tighter">★★★★★</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">({product.reviews_count || 128})</span>
              </div>
            )}
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="card-price text-sm sm:text-base font-extrabold text-gray-900 dark:text-white">
                {formatPrice(currentPrice, currencySymbol)}
              </span>
              {currentComparePrice && currentComparePrice > currentPrice && (
                <span className="pold text-[10px] text-gray-400 line-through">
                  {formatPrice(currentComparePrice, currencySymbol)}
                </span>
              )}
            </div>
            <Link href={productUrl} onClick={handleClick} prefetch={false} className={`card-title text-[11px] sm:text-xs font-medium text-gray-800 dark:text-gray-200 leading-snug ${titleClampClass}`}>
              {product.name}
            </Link>
            {finalRenderedGroups && (
              <div className="my-1.5" onClick={(e) => e.stopPropagation()}>
                {finalRenderedGroups}
              </div>
            )}
            <ProductCardActions variant="split-bar" showWishlist={false} showQuickview={showQuickview} showQuickcart={showQuickcart} isInWishlist={isInWishlist} hasVariants={product.has_variants} onToggleWishlist={onToggleWishlist} onOpenQuickView={onOpenQuickView} onAddToCart={onAddToCart} />
          </div>
        </>
      );
    }

    // ── ARCHETYPE 24: SEPHORA CHIC ────────────────────────────────────────────
    if (scClass === 'sc24') {
      return (
        <>
          <div className={`img-box relative ${aspectClass} w-full ${imgBgClass} rounded-t-2xl overflow-hidden`}>
            <ProductCardBadges product={product} currentPrice={currentPrice} currentComparePrice={currentComparePrice} />
            <ProductCardMedia activeImage={activeImage} secondImage={secondImage} hoveredImage={hoveredImage} productName={product.name} settings={settings} fitClass={settings?.card_image_fit === 'cover' ? 'object-cover' : 'object-contain'} />
            <ProductCardActions variant="center-pill" showWishlist={showWishlist} showQuickview={showQuickview} showQuickcart={showQuickcart} isInWishlist={isInWishlist} hasVariants={product.has_variants} onToggleWishlist={onToggleWishlist} onOpenQuickView={onOpenQuickView} onAddToCart={onAddToCart} />
          </div>
          <div className="cb flex flex-col items-center text-center p-2.5 sm:p-3 w-full relative z-[2] bg-white dark:bg-[#16162a] rounded-b-2xl">
            {finalRenderedGroups && (
              <div className="mb-1.5" onClick={(e) => e.stopPropagation()}>
                {finalRenderedGroups}
              </div>
            )}
            <Link href={productUrl} onClick={handleClick} prefetch={false} className={`card-title text-xs font-semibold text-gray-900 dark:text-white leading-snug ${titleClampClass}`}>
              {product.name}
            </Link>
            <div className="mt-1 flex items-baseline justify-center gap-1.5">
              <span className="card-price text-xs font-extrabold text-gray-900 dark:text-white">
                {formatPrice(currentPrice, currencySymbol)}
              </span>
              {currentComparePrice && currentComparePrice > currentPrice && (
                <span className="pold text-[10px] text-gray-400 line-through">
                  {formatPrice(currentComparePrice, currencySymbol)}
                </span>
              )}
            </div>
            {showStars && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-amber-400 text-[10px]">★</span>
                <span className="text-[10px] text-gray-500 font-bold">{(product.rating || 5).toFixed(1)}</span>
              </div>
            )}
            {showQuickcart && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(e); }}
                onPointerDown={(e) => e.stopPropagation()}
                className="mt-2 w-full py-1.5 px-3 rounded-full border border-gray-900 dark:border-white text-gray-900 dark:text-white text-[10.5px] font-bold tracking-wide uppercase hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer z-[25]"
              >
                <ShoppingCart className="h-3 w-3" />
                <span>{product.has_variants ? 'Select Shade' : 'Add to Bag'}</span>
              </button>
            )}
          </div>
        </>
      );
    }

    // ── DEFAULT / CLASSIC SHOWCASES (sc1, sc8, sc10, sc11–sc16) ───────────────
    return (
      <>
        <div className={`img-box relative ${aspectClass} w-full ${imgBgClass}`}>
          <ProductCardBadges
            product={product}
            currentPrice={currentPrice}
            currentComparePrice={currentComparePrice}
          />
          <ProductCardMedia
            activeImage={activeImage}
            secondImage={secondImage}
            hoveredImage={hoveredImage}
            productName={product.name}
            settings={settings}
            fitClass={settings?.card_image_fit === 'cover' ? 'object-cover' : 'object-contain'}
          />
          <ProductCardActions
            showWishlist={showWishlist}
            showQuickview={showQuickview}
            showQuickcart={showQuickcart}
            isInWishlist={isInWishlist}
            hasVariants={product.has_variants}
            onToggleWishlist={onToggleWishlist}
            onOpenQuickView={onOpenQuickView}
            onAddToCart={onAddToCart}
            variant="action-btn"
          />
        </div>
        <div className="relative z-[2]">
          <ProductCardShowcaseContent
            styleClass={scClass}
            elementsOrder={elementsOrder}
            alignClass={alignClass}
            titleClampClass={titleClampClass}
            product={product}
            showStars={showStars}
            currencySymbol={currencySymbol}
            minPrice={minPrice}
            maxPrice={maxPrice}
            hasPriceRange={hasPriceRange}
            currentPrice={currentPrice}
            currentComparePrice={currentComparePrice}
            displayDescription={displayDescription}
            finalRenderedGroups={finalRenderedGroups}
            productUrl={productUrl}
            onCardClick={handleClick}
            saleColor={settings?.card_sale_price_color || undefined}
            compareColor={settings?.card_compare_color || undefined}
          />
        </div>
      </>
    );
  };

  const renderContent = (
    <div
      ref={cardRef}
      id={`product-card-${product.id}`}
      data-hover-effect={hoverStyle}
      onPointerDown={handlePointerDown}
      style={{ touchAction: 'pan-y' }}
      className={`z-card-container ${scClass} group relative ${isFocused ? 'is-in-focus active-card' : ''}`}
    >
      {/* Full-card transparent overlay link — single-tap = navigate, no double-tap */}
      <Link
        href={productUrl}
        onClick={handleClick}
        prefetch={false}
        className="absolute inset-0 z-[1]"
        aria-label={`View ${product.name}`}
        tabIndex={-1}
      />
      {renderCardBody()}
    </div>
  );

  return (
    <>
      <ProductCardStyleInjector />
      <div className="z-card-container flex flex-col h-full">
        {renderContent}
      </div>
    </>
  );
};
