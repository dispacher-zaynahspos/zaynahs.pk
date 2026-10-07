'use client';

import React from 'react';
import Link from 'next/link';
import { Product, StoreSettings } from '@/lib/types';
import { saveScrollPosition } from '@/lib/hooks/useScrollRestoration';
import { useMobileCardFocus } from '@/lib/hooks/useMobileCardFocus';
import { formatPrice } from '@/lib/utils/whatsapp';
import { normalizeCardStyle, getCardStyleClass } from '@/lib/utils/cardStyles';
import { ProductCardStyleInjector } from './ProductCardStyles';
import { ProductCardBadges } from './ProductCardBadges';
import { ProductCardMedia } from './ProductCardMedia';
import { ProductCardActions, CardCartIcon } from './ProductCardActions';
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
  const { cardRef, isFocused, setManualFocus } = useMobileCardFocus(settings?.card_mobile_activation ?? 'scroll');

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') setManualFocus();
  };

  const safeStyle = normalizeCardStyle(activeStyle);
  const scClass = getCardStyleClass(safeStyle);
  const iconStyle = settings?.card_icon_style || 'pill';

  const imgBgClass =
    (scClass === 'sc8' || scClass === 'sc_mondrian') ? 'bg-[#fef9e7]' :
    (scClass === 'sc10' || scClass === 'sc_bottomsheet') ? 'bg-gradient-to-br from-[#fdf6ec] to-[#f5e6d0] rounded-t-[24px]' :
    (scClass === 'sc11' || scClass === 'sc_noir') ? 'bg-gradient-to-br from-[#1a1a1a] to-[#050505]' :
    (scClass === 'sc12' || scClass === 'sc_magazine') ? 'bg-[#f4f3f1]' :
    (scClass === 'sc13' || scClass === 'sc_pastel') ? 'bg-[#fce4ea] rounded-t-[22px]' :
    (scClass === 'sc14' || scClass === 'sc_polaroid') ? 'bg-[#f0f0f0]' :
    (scClass === 'sc15' || scClass === 'sc_storyswipe') ? 'bg-gradient-to-br from-[#dfe6ef] to-[#c9d4e2] rounded-t-[20px]' :
    (scClass === 'sc16' || scClass === 'sc_hangtag') ? 'bg-gradient-to-br from-[#efe4d3] to-[#e3d1b8] rounded-t-[14px]' :
    (scClass === 'sc20' || scClass === 'sc_editorial') ? 'bg-[#f4f4f4]' :
    (scClass === 'sc21' || scClass === 'sc_flashdeal') ? 'bg-[#ffffff]' :
    (scClass === 'sc22' || scClass === 'sc_athletic') ? 'bg-[#f0f0f2]' :
    (scClass === 'sc23' || scClass === 'sc_marketplace') ? 'bg-[#ffffff]' :
    (scClass === 'sc24' || scClass === 'sc_roundcharm') ? 'bg-[#faf6f0] rounded-t-2xl' :
    '';

  const productUrl = `/product/${encodeURIComponent(product.slug || '')}`;
  const handleNav = () => saveScrollPosition(product.id);
  const handleClick = (e: React.MouseEvent) => {
    handleNav();
    if (onCardClick) onCardClick(e);
  };

  const hoverStyle = settings?.image_hover_style ?? 'second_image';

  // ── SHOPIFY PATTERN: outer div + transparent overlay Link ─────────────────────
  const renderCardBody = () => {
    // ── ARCHETYPE 01: ZARA HAUTE EDITORIAL ────────────────────────────────────
    if (scClass === 'sc20' || scClass === 'sc_editorial') {
      return (
        <div className="flex flex-col h-full justify-between">
          <div className={`img-box relative ${aspectClass} w-full ${imgBgClass} overflow-hidden`}>
            <ProductCardBadges product={product} currentPrice={currentPrice} currentComparePrice={currentComparePrice} />
            <ProductCardMedia activeImage={activeImage} secondImage={secondImage} hoveredImage={hoveredImage} productName={product.name} settings={settings} fitClass={settings?.card_image_fit === 'cover' ? 'object-cover' : 'object-contain'} />
            <ProductCardActions variant="slide-drawer" iconStyle={iconStyle} showWishlist={showWishlist} showQuickview={showQuickview} showQuickcart={showQuickcart} isInWishlist={isInWishlist} hasVariants={product.has_variants} onToggleWishlist={onToggleWishlist} onOpenQuickView={onOpenQuickView} onAddToCart={onAddToCart} />
          </div>
          <div className="cb flex flex-col flex-grow justify-between px-1.5 pt-2 pb-1.5 w-full relative z-[2]">
            <div className="flex items-baseline justify-between gap-1.5 w-full">
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
        </div>
      );
    }

    // ── ARCHETYPE 04: DARAZ DEAL RUSH / FLASH DEAL ────────────────────────────
    if (scClass === 'sc21' || scClass === 'sc_flashdeal') {
      const discountPct = (currentComparePrice && currentComparePrice > currentPrice) ? Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100) : 0;
      return (
        <div className="flex flex-col h-full justify-between">
          <div className={`img-box relative ${aspectClass} w-full ${imgBgClass} rounded-t-xl overflow-hidden`}>
            <ProductCardBadges product={product} currentPrice={currentPrice} currentComparePrice={currentComparePrice} />
            <ProductCardMedia activeImage={activeImage} secondImage={secondImage} hoveredImage={hoveredImage} productName={product.name} settings={settings} fitClass={settings?.card_image_fit === 'cover' ? 'object-cover' : 'object-contain'} />
            <ProductCardActions variant="action-btn" iconStyle={iconStyle} showWishlist={showWishlist} showQuickview={showQuickview} showQuickcart={false} isInWishlist={isInWishlist} hasVariants={product.has_variants} onToggleWishlist={onToggleWishlist} onOpenQuickView={onOpenQuickView} onAddToCart={onAddToCart} />
          </div>
          <div className="cb flex flex-col flex-grow justify-between p-2.5 w-full relative z-[2] bg-white dark:bg-[#16162a] rounded-b-xl">
            <div>
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
            </div>
            {showQuickcart && (
              <div className="mt-auto pt-1.5">
                <ProductCardActions variant="direct-button" iconStyle={iconStyle} showWishlist={false} showQuickview={false} showQuickcart={true} isInWishlist={isInWishlist} hasVariants={product.has_variants} onToggleWishlist={onToggleWishlist} onOpenQuickView={onOpenQuickView} onAddToCart={onAddToCart} />
              </div>
            )}
          </div>
        </div>
      );
    }

    // ── ARCHETYPE 03: NIKE STREETWEAR / ATHLETIC ─────────────────────────────
    if (scClass === 'sc22' || scClass === 'sc_athletic') {
      return (
        <div className="flex flex-col h-full justify-between">
          <div className={`img-box relative ${aspectClass} w-full ${imgBgClass} rounded-t-xl overflow-hidden`}>
            <ProductCardBadges product={product} currentPrice={currentPrice} currentComparePrice={currentComparePrice} />
            <ProductCardMedia activeImage={activeImage} secondImage={secondImage} hoveredImage={hoveredImage} productName={product.name} settings={settings} fitClass={settings?.card_image_fit === 'cover' ? 'object-cover' : 'object-contain'} />
            <ProductCardActions variant="corner-fab" iconStyle={iconStyle} showWishlist={showWishlist} showQuickview={showQuickview} showQuickcart={showQuickcart} isInWishlist={isInWishlist} hasVariants={product.has_variants} onToggleWishlist={onToggleWishlist} onOpenQuickView={onOpenQuickView} onAddToCart={onAddToCart} />
          </div>
          <div className="cb flex flex-col flex-grow justify-between p-2.5 sm:p-3 w-full relative z-[2] bg-white dark:bg-[#16162a] rounded-b-xl">
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-gray-400 mb-0.5 block">
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
            </div>
            <div className="mt-auto pt-1 flex items-baseline gap-2">
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
        </div>
      );
    }

    // ── ARCHETYPE 02: AMAZON MARKETPLACE RATING-FIRST ─────────────────────────
    if (scClass === 'sc23' || scClass === 'sc_marketplace') {
      return (
        <div className="flex flex-col h-full justify-between">
          <div className="bg-[#b12704] text-white text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 text-center rounded-t-lg z-[2] relative">
            Limited Time Deal
          </div>
          <div className={`img-box relative ${aspectClass} w-full ${imgBgClass} overflow-hidden`}>
            <ProductCardBadges product={product} currentPrice={currentPrice} currentComparePrice={currentComparePrice} />
            <ProductCardMedia activeImage={activeImage} secondImage={secondImage} hoveredImage={hoveredImage} productName={product.name} settings={settings} fitClass={settings?.card_image_fit === 'cover' ? 'object-cover' : 'object-contain'} />
            <ProductCardActions variant="action-btn" iconStyle={iconStyle} showWishlist={showWishlist} showQuickview={false} showQuickcart={false} isInWishlist={isInWishlist} hasVariants={product.has_variants} onToggleWishlist={onToggleWishlist} onOpenQuickView={onOpenQuickView} onAddToCart={onAddToCart} />
          </div>
          <div className="cb flex flex-col flex-grow justify-between p-2.5 w-full relative z-[2] bg-white dark:bg-[#16162a] rounded-b-lg">
            <div>
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
            </div>
            <div className="mt-auto pt-2">
              <ProductCardActions variant="split-bar" iconStyle={iconStyle} showWishlist={false} showQuickview={showQuickview} showQuickcart={showQuickcart} isInWishlist={isInWishlist} hasVariants={product.has_variants} onToggleWishlist={onToggleWishlist} onOpenQuickView={onOpenQuickView} onAddToCart={onAddToCart} />
            </div>
          </div>
        </div>
      );
    }

    // ── ARCHETYPE 07: SEPHORA CHIC / ROUND CHARM ──────────────────────────────
    if (scClass === 'sc24' || scClass === 'sc_roundcharm') {
      return (
        <div className="flex flex-col h-full justify-between">
          <div className={`img-box relative ${aspectClass} w-full ${imgBgClass} rounded-t-2xl overflow-hidden`}>
            <ProductCardBadges product={product} currentPrice={currentPrice} currentComparePrice={currentComparePrice} />
            <ProductCardMedia activeImage={activeImage} secondImage={secondImage} hoveredImage={hoveredImage} productName={product.name} settings={settings} fitClass={settings?.card_image_fit === 'cover' ? 'object-cover' : 'object-contain'} />
            <ProductCardActions variant="center-pill" iconStyle={iconStyle} showWishlist={showWishlist} showQuickview={showQuickview} showQuickcart={showQuickcart} isInWishlist={isInWishlist} hasVariants={product.has_variants} onToggleWishlist={onToggleWishlist} onOpenQuickView={onOpenQuickView} onAddToCart={onAddToCart} />
          </div>
          <div className="cb flex flex-col flex-grow justify-between items-center text-center p-2.5 sm:p-3 w-full relative z-[2] bg-white dark:bg-[#16162a] rounded-b-2xl">
            <div className="w-full flex flex-col items-center">
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
            </div>
            {showQuickcart && (
              <div className="mt-auto w-full pt-2">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(e); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="w-full py-1.5 px-2.5 rounded-full border border-gray-900 dark:border-white text-gray-900 dark:text-white text-[10px] sm:text-[10.5px] font-bold tracking-wide uppercase hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer z-[25] whitespace-nowrap truncate"
                >
                  <CardCartIcon iconStyle={iconStyle} className="h-3 w-3 shrink-0" />
                  <span className="truncate">{product.has_variants ? 'Options' : 'Add to Bag'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    // ── DEFAULT / CLASSIC SHOWCASES (sc1, sc8, sc10, sc11–sc16) ───────────────
    return (
      <div className="flex flex-col h-full justify-between">
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
            iconStyle={iconStyle}
            variant="action-btn"
          />
        </div>
        <div className="relative z-[2] flex-grow flex flex-col justify-between">
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
      </div>
    );
  };

  const renderContent = (
    <div
      ref={cardRef}
      id={`product-card-${product.id}`}
      data-hover-effect={hoverStyle}
      onPointerDown={handlePointerDown}
      style={{ touchAction: 'pan-y' }}
      className={`z-card-container ${scClass} group relative flex flex-col h-full ${isFocused ? 'is-in-focus active-card' : ''}`}
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
