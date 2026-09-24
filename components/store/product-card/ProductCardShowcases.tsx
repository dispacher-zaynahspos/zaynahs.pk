'use client';

import React from 'react';
import Link from 'next/link';
import { Product, StoreSettings } from '@/lib/types';
import { saveScrollPosition } from '@/lib/hooks/useScrollRestoration';
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
  touchActive?: boolean;
  setTouchActive?: (val: boolean) => void;
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
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
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
  const [isActive, setIsActive] = React.useState(false);
  const resetTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => { if (resetTimerRef.current) clearTimeout(resetTimerRef.current); };
  }, []);

  const activate = () => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    setIsActive(true);
  };

  const deactivate = (delay = 0) => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    if (delay > 0) {
      resetTimerRef.current = setTimeout(() => setIsActive(false), delay);
    } else {
      setIsActive(false);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') activate();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') deactivate(300);
  };

  const handlePointerCancel = () => {
    deactivate(0);
  };

  const handlePointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') deactivate(0);
  };

  const styleClassMap: Record<string, string> = {
    showcase_1: 'sc1',
    showcase_2: 'sc2',
    showcase_3: 'sc3',
    showcase_4: 'sc4',
    showcase_5: 'sc5',
    showcase_6: 'sc6',
    showcase_7: 'sc7',
    showcase_8: 'sc8',
    showcase_9: 'sc9',
    showcase_10: 'sc10',
  };

  const scClass = styleClassMap[activeStyle] || 'sc1';
  const imgBgClass = scClass === 'sc4' ? 'bg-[#fcefee]' : scClass === 'sc9' ? 'bg-[#f0f4f9] rounded-2xl' : '';

  const renderContent = (
    <Link
      id={`product-card-${product.id}`}
      href={`/product/${product.slug}`}
      onClick={onCardClick || (() => saveScrollPosition(product.id))}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerLeave}
      prefetch={true}
      style={{ touchAction: 'pan-y' }}
      className={`z-card-container ${scClass} group relative`}
    >
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
          isPressed={isActive}
          fitClass="object-contain"
        />
        <ProductCardActions
          showWishlist={showWishlist}
          showQuickview={showQuickview}
          showQuickcart={showQuickcart}
          isInWishlist={isInWishlist}
          hasVariants={product.hasVariants}
          onToggleWishlist={onToggleWishlist}
          onOpenQuickView={onOpenQuickView}
          onAddToCart={onAddToCart}
          variant="action-btn"
          isActive={isActive}
        />
      </div>
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
      />
    </Link>
  );

  if (activeStyle === 'showcase_3') {
    return (
      <>
        <ProductCardStyleInjector />
        <div className="z-card-container flex flex-col h-full">
          <div className="sc3-wrap">
            {renderContent}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ProductCardStyleInjector />
      <div className="z-card-container flex flex-col h-full">
        {renderContent}
      </div>
    </>
  );
};
