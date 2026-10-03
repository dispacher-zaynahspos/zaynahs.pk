'use client';

import React from 'react';
import Link from 'next/link';
import { Product, StoreSettings } from '@/lib/types';
import { saveScrollPosition } from '@/lib/hooks/useScrollRestoration';
import { useMobileCardFocus } from '@/lib/hooks/useMobileCardFocus';
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

  const styleClassMap: Record<string, string> = {
    showcase_1: 'sc1', showcase_8: 'sc8', showcase_10: 'sc10',
    showcase_11: 'sc11', showcase_12: 'sc12', showcase_13: 'sc13',
    showcase_14: 'sc14', showcase_15: 'sc15', showcase_16: 'sc16',
  };

  // Backward compat: if activeStyle is a removed template ID, fall back to 'style1' (sc1)
  const validStyles = new Set([
    'showcase_1', 'showcase_8', 'showcase_10',
    'showcase_11', 'showcase_12', 'showcase_13', 'showcase_14', 'showcase_15', 'showcase_16',
  ]);
  const safeStyle = validStyles.has(activeStyle) ? activeStyle : 'showcase_1';
  const scClass = styleClassMap[safeStyle] || 'sc1';
  const imgBgClass =
    scClass === 'sc8' ? 'bg-[#fef9e7]' :
    scClass === 'sc10' ? 'bg-gradient-to-br from-[#fdf6ec] to-[#f5e6d0] rounded-t-[24px]' :
    scClass === 'sc11' ? 'bg-gradient-to-br from-[#1a1a1a] to-[#050505]' :
    scClass === 'sc12' ? 'bg-[#f4f3f1]' :
    scClass === 'sc13' ? 'bg-[#fce4ea] rounded-t-[22px]' :
    scClass === 'sc14' ? 'bg-[#f0f0f0]' :
    scClass === 'sc15' ? 'bg-gradient-to-br from-[#dfe6ef] to-[#c9d4e2] rounded-t-[20px]' :
    scClass === 'sc16' ? 'bg-gradient-to-br from-[#efe4d3] to-[#e3d1b8] rounded-t-[14px]' :
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
  // • Title Link at z-[2] in ShowcaseContent = semantic title navigation
  // • Mobile: hover image + action icons reveal when this card is scroll-focused
  //   (`is-in-focus active-card` via useMobileCardFocus); desktop uses CSS :hover.
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

      {/* Image box */}
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

      {/* Card content — z-[2] so it sits above overlay link, title is its own Link */}
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
