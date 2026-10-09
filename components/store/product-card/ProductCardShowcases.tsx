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
import { ProductCardActions, CardCartIcon, CardWishlistIcon, CardQuickviewIcon } from './ProductCardActions';
import { ProductCardShowcaseContent } from './ProductCardShowcaseContent';
import { Plus } from '@/components/common/Icons';
import { getSwatchStyle, extractColorsFromName } from '@/lib/utils/swatch';
import { getPresetImageUrl } from '@/lib/utils/imageUrl';

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
  isVariantSelected?: boolean;
  onSelectAttribute?: (attr: 'color' | 'size' | 'material' | 'customValue', val: string, imageUrl?: string | null) => void;
  onHoverImage?: (url: string | null) => void;
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
  isVariantSelected = false,
  onSelectAttribute,
  onHoverImage,
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

  const isSwatchesEnabled = settings?.enable_variant_swatches !== false;
  const isColorEnabled = isSwatchesEnabled && (settings?.card_show_swatches !== false) && (settings?.card_show_type_color !== false);
  const isSizeEnabled = isSwatchesEnabled && (settings?.card_show_sizes !== false) && (settings?.card_show_type_size !== false);

  const availableSizes = React.useMemo(() => {
    if (!isSizeEnabled) return [];
    const sizes = Array.from(new Set(product.variants?.map(v => v.size).filter(Boolean))) as string[];
    return sizes.slice(0, 4);
  }, [product.variants, isSizeEnabled]);

  const availableColors = React.useMemo(() => {
    if (!isColorEnabled) return [];
    const colors = product.variants?.filter(v => v.color && v.active) || [];
    const unique = colors.reduce<{ color: string; hex?: string; img?: string; showImageSwatch?: boolean }[]>((acc, v) => {
      const existing = acc.find(c => c.color === v.color);
      if (!existing) {
        acc.push({
          color: v.color!,
          hex: v.color_hex || (v.color ? extractColorsFromName(v.color) : undefined),
          img: v.image_url || undefined,
          showImageSwatch: v.show_image_swatch,
        });
      } else {
        if (!existing.hex && (v.color_hex || v.color)) {
          existing.hex = v.color_hex || (v.color ? extractColorsFromName(v.color) : undefined);
        }
        if (!existing.img && v.image_url) existing.img = v.image_url;
        if (!existing.showImageSwatch && v.show_image_swatch) existing.showImageSwatch = v.show_image_swatch;
      }
      return acc;
    }, []);
    return unique.slice(0, settings?.swatch_limit ?? 6);
  }, [product.variants, isColorEnabled, settings?.swatch_limit]);

  const [selectedColor, setSelectedColor] = React.useState<string>('');
  const [selectedSize, setSelectedSize] = React.useState<string>('');
  const [quantity, setQuantity] = React.useState<number>(1);

  React.useEffect(() => {
    if (availableColors.length > 0 && (!selectedColor || !availableColors.some(c => c.color === selectedColor))) {
      setSelectedColor(availableColors[0].color);
    }
  }, [availableColors, selectedColor]);

  React.useEffect(() => {
    if (availableSizes.length > 0 && (!selectedSize || !availableSizes.includes(selectedSize))) {
      setSelectedSize(availableSizes[0]);
    }
  }, [availableSizes, selectedSize]);

  const renderPriceRow = (align: 'left' | 'center' = 'center', className = '') => (
    <div className={`flex items-baseline gap-1.5 ${align === 'center' ? 'justify-center' : 'justify-start'} ${className}`}>
      <span className="card-price text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
        {hasPriceRange
          ? `${formatPrice(minPrice, currencySymbol)} – ${formatPrice(maxPrice, currencySymbol)}`
          : formatPrice(currentPrice, currencySymbol)}
      </span>
      {currentComparePrice && currentComparePrice > currentPrice && (
        <span className="pold text-[11px] sm:text-xs text-gray-400 line-through">
          {formatPrice(currentComparePrice, currencySymbol)}
        </span>
      )}
    </div>
  );

  const renderDots = (align: 'left' | 'center' | 'right' = 'center') => {
    if (finalRenderedGroups) {
      return (
        <div className={`flex items-center ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'}`} onClick={(e) => e.stopPropagation()}>
          {finalRenderedGroups}
        </div>
      );
    }
    if (!isColorEnabled || availableColors.length === 0) return null;
    return (
      <div className={`flex items-center gap-1.5 ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'}`}>
        {availableColors.map((c, i) => {
          const isImg = Boolean((c.showImageSwatch && c.img) || (!c.hex && c.img));
          const swatchStyle = isImg ? {} : getSwatchStyle(c.hex);
          return (
            <button
              key={i}
              type="button"
              title={c.color}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelectAttribute?.('color', c.color, c.img || null);
              }}
              onMouseEnter={() => c.img && onHoverImage ? onHoverImage(getPresetImageUrl(c.img, 'card')) : null}
              onMouseLeave={() => onHoverImage ? onHoverImage(null) : null}
              className="w-3.5 h-3.5 rounded-full border border-black/15 dark:border-white/20 shadow-2xs inline-flex items-center justify-center shrink-0 overflow-hidden transition-transform hover:scale-110 cursor-pointer"
              style={swatchStyle}
            >
              {isImg && c.img && (
                <img
                  src={getPresetImageUrl(c.img, 'card')}
                  alt={c.color}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
            </button>
          );
        })}
      </div>
    );
  };

  const renderBoxedSizes = (align: 'left' | 'center' = 'center') => {
    if (!isSizeEnabled || availableSizes.length === 0) return null;
    return (
      <div className={`flex items-center gap-1.5 mt-1.5 flex-wrap ${align === 'center' ? 'justify-center' : 'justify-start'}`}>
        {availableSizes.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenQuickView(e);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="min-w-[22px] h-[22px] px-1.5 rounded-[3px] border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1f1f2e] text-[10px] font-medium text-gray-600 dark:text-gray-300 flex items-center justify-center hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-colors cursor-pointer z-[25]"
          >
            {s}
          </button>
        ))}
      </div>
    );
  };

  const renderFlatSizes = () => {
    if (!isSizeEnabled || availableSizes.length === 0) return null;
    return (
      <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-gray-800 dark:text-gray-200">
        {availableSizes.map((s, i) => (
          <span key={i}>{s}</span>
        ))}
      </div>
    );
  };

  // ── SHOPIFY PATTERN: outer div + transparent overlay Link ─────────────────────
  const renderCardBody = () => {
    // ── ELESSI STYLE 1: Corner FAB (+) & Synchronized Side Rail ───────────────
    if (scClass === 'sc_style1') {
      return (
        <div className="flex flex-col h-full justify-between relative bg-white dark:bg-[#16162a]">
          <div className={`relative ${aspectClass} w-full ${imgBgClass}`}>
            <div className="img-box relative w-full h-full overflow-hidden">
              <ProductCardBadges product={product} currentPrice={currentPrice} currentComparePrice={currentComparePrice} />
              <ProductCardMedia activeImage={activeImage} secondImage={secondImage} hoveredImage={hoveredImage} productName={product.name} settings={settings} fitClass={settings?.card_image_fit === 'cover' ? 'object-cover' : 'object-contain'} isVariantSelected={isVariantSelected} />
            </div>

            <div className="elessi-side-rail absolute right-2.5 top-2.5 z-[25] flex flex-col gap-2 transition-all duration-200">
              {showWishlist && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWishlist(e); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white dark:bg-[#1a1a26] text-gray-700 dark:text-gray-200 shadow-md border border-gray-100 dark:border-gray-800 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer z-[25]"
                  aria-label="Wishlist"
                >
                  <CardWishlistIcon isInWishlist={isInWishlist} iconStyle={iconStyle} className="h-3.5 w-3.5" />
                </button>
              )}
              {showQuickview && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpenQuickView(e); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white dark:bg-[#1a1a26] text-gray-700 dark:text-gray-200 shadow-md border border-gray-100 dark:border-gray-800 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer z-[25]"
                  aria-label="Quick View"
                >
                  <CardQuickviewIcon iconStyle={iconStyle} className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="elessi-flat-sizes absolute left-3 bottom-2.5 z-[20] transition-all duration-200">
              {renderFlatSizes()}
            </div>

            {showQuickcart && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(e); }}
                onPointerDown={(e) => e.stopPropagation()}
                style={{ borderColor: 'var(--color-primary, #ff5a5f)' }}
                className="elessi-seam-fab absolute -bottom-3.5 right-3 sm:right-4 z-[30] h-9 w-9 sm:h-10 sm:w-10 rounded-full border-2 bg-white dark:bg-[#1a1a26] text-gray-900 dark:text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                aria-label="Add to cart"
              >
                <span className="text-xl sm:text-2xl font-light leading-none -mt-0.5" style={{ color: 'var(--color-primary, #ff5a5f)' }}>+</span>
              </button>
            )}
          </div>

          <div className="cb flex flex-col flex-grow justify-between px-2 pt-3 pb-2 w-full relative z-[2]">
            <div>
              <Link href={productUrl} onClick={handleClick} prefetch={false} className={`card-title text-xs sm:text-sm font-semibold text-gray-900 dark:text-white leading-tight ${titleClampClass}`}>
                {product.name}
              </Link>
              <div className="flex items-center justify-between gap-2 mt-1.5 flex-wrap">
                {renderPriceRow('left')}
                {renderDots('right')}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ── ELESSI STYLE 2: Between-Seam 3-Icon Row ────────────────────────────────
    if (scClass === 'sc_style2') {
      return (
        <div className="flex flex-col h-full justify-between relative bg-white dark:bg-[#16162a]">
          <div className={`img-box relative ${aspectClass} w-full ${imgBgClass} overflow-hidden`}>
            <ProductCardBadges product={product} currentPrice={currentPrice} currentComparePrice={currentComparePrice} />
            <ProductCardMedia activeImage={activeImage} secondImage={secondImage} hoveredImage={hoveredImage} productName={product.name} settings={settings} fitClass={settings?.card_image_fit === 'cover' ? 'object-cover' : 'object-contain'} isVariantSelected={isVariantSelected} />
          </div>

          <div className="elessi-between-seam-row flex items-center justify-center gap-2 sm:gap-2.5 py-2.5 border-b border-gray-100 dark:border-gray-800/80 z-[25] transition-all duration-200">
            {showQuickcart && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(e); }}
                onPointerDown={(e) => e.stopPropagation()}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1f1f2e] text-gray-700 dark:text-gray-200 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Add to cart"
              >
                <CardCartIcon iconStyle={iconStyle} className="h-3.5 w-3.5" />
              </button>
            )}
            {showWishlist && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWishlist(e); }}
                onPointerDown={(e) => e.stopPropagation()}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1f1f2e] text-gray-700 dark:text-gray-200 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Wishlist"
              >
                <CardWishlistIcon isInWishlist={isInWishlist} iconStyle={iconStyle} className="h-3.5 w-3.5" />
              </button>
            )}
            {showQuickview && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpenQuickView(e); }}
                onPointerDown={(e) => e.stopPropagation()}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1f1f2e] text-gray-700 dark:text-gray-200 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Quick View"
              >
                <CardQuickviewIcon iconStyle={iconStyle} className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="cb flex flex-col flex-grow justify-between items-center text-center p-2.5 w-full relative z-[2]">
            <div className="w-full flex flex-col items-center">
              <Link href={productUrl} onClick={handleClick} prefetch={false} className={`card-title text-xs sm:text-sm font-semibold text-gray-900 dark:text-white leading-tight ${titleClampClass}`}>
                {product.name}
              </Link>
              <div className="mt-1">{renderPriceRow('center')}</div>
              <div className="mt-2">{renderDots('center')}</div>
            </div>
          </div>
        </div>
      );
    }

    // ── ELESSI STYLE 3: Bottom 3-Action Segmented Pill ─────────────────────────
    if (scClass === 'sc_style3') {
      return (
        <div className="flex flex-col h-full justify-between relative bg-white dark:bg-[#16162a]">
          <div className={`img-box relative ${aspectClass} w-full ${imgBgClass} overflow-hidden`}>
            <ProductCardBadges product={product} currentPrice={currentPrice} currentComparePrice={currentComparePrice} />
            <ProductCardMedia activeImage={activeImage} secondImage={secondImage} hoveredImage={hoveredImage} productName={product.name} settings={settings} fitClass={settings?.card_image_fit === 'cover' ? 'object-cover' : 'object-contain'} isVariantSelected={isVariantSelected} />

            <div className="elessi-floating-pill-wrap absolute inset-x-0 bottom-3 z-[25] flex justify-center pointer-events-none transition-all duration-200">
              <div className="elessi-floating-pill pointer-events-auto bg-white dark:bg-[#1a1a26] rounded-md shadow-lg border border-gray-200 dark:border-gray-700 flex items-center divide-x divide-gray-200 dark:divide-gray-700 overflow-hidden">
                {showQuickcart && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(e); }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer flex items-center justify-center"
                    aria-label="Add to cart"
                  >
                    <CardCartIcon iconStyle={iconStyle} className="h-3.5 w-3.5" />
                  </button>
                )}
                {showWishlist && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWishlist(e); }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer flex items-center justify-center"
                    aria-label="Wishlist"
                  >
                    <CardWishlistIcon isInWishlist={isInWishlist} iconStyle={iconStyle} className="h-3.5 w-3.5" />
                  </button>
                )}
                {showQuickview && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpenQuickView(e); }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer flex items-center justify-center"
                    aria-label="Quick View"
                  >
                    <CardQuickviewIcon iconStyle={iconStyle} className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="cb flex flex-col flex-grow justify-between p-2.5 w-full relative z-[2]">
            <div>
              <Link href={productUrl} onClick={handleClick} prefetch={false} className={`card-title text-xs sm:text-sm font-semibold text-gray-900 dark:text-white leading-tight ${titleClampClass}`}>
                {product.name}
              </Link>
              <div className="flex items-center justify-between gap-2 mt-1.5 flex-wrap">
                {renderPriceRow('left')}
                {renderDots('right')}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ── ELESSI STYLE 4: Split Options Drawer ───────────────────────────────────
    if (scClass === 'sc_style4') {
      return (
        <div className="flex flex-col h-full justify-between relative bg-white dark:bg-[#16162a]">
          <div className={`img-box relative ${aspectClass} w-full ${imgBgClass} overflow-hidden`}>
            <ProductCardBadges product={product} currentPrice={currentPrice} currentComparePrice={currentComparePrice} />
            <ProductCardMedia activeImage={activeImage} secondImage={secondImage} hoveredImage={hoveredImage} productName={product.name} settings={settings} fitClass={settings?.card_image_fit === 'cover' ? 'object-cover' : 'object-contain'} isVariantSelected={isVariantSelected} />

            <div className="elessi-split-drawer absolute inset-x-2 bottom-2 z-[25] flex items-center justify-between shadow-md rounded-lg bg-white/95 dark:bg-[#1a1a26]/95 border border-gray-200 dark:border-gray-700 p-1 transition-all duration-200">
              {showQuickcart && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(e); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label={product.has_variants ? 'Choose options' : 'Add to cart'}
                >
                  <Plus className="h-4 w-4 sm:h-4.5 sm:w-4.5 stroke-[2.2]" style={{ color: 'var(--color-primary, #ef4444)' }} />
                </button>
              )}
              <div className="flex items-center gap-1">
                {showWishlist && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWishlist(e); }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Wishlist"
                  >
                    <CardWishlistIcon isInWishlist={isInWishlist} iconStyle={iconStyle} className="h-3.5 w-3.5" />
                  </button>
                )}
                {showQuickview && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpenQuickView(e); }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Quick View"
                  >
                    <CardQuickviewIcon iconStyle={iconStyle} className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="cb flex flex-col flex-grow justify-between items-center text-center p-2.5 w-full relative z-[2]">
            <div className="w-full flex flex-col items-center">
              <Link href={productUrl} onClick={handleClick} prefetch={false} className={`card-title text-xs sm:text-sm font-semibold text-gray-900 dark:text-white leading-tight ${titleClampClass}`}>
                {product.name}
              </Link>
              <div className="mt-1">{renderPriceRow('center')}</div>
              <div className="mt-2">{renderDots('center')}</div>
            </div>
          </div>
        </div>
      );
    }

    // ── ELESSI STYLE 5: 3-Icon Vertical Right Rail ─────────────────────────────
    if (scClass === 'sc_style5') {
      return (
        <div className="flex flex-col h-full justify-between relative bg-white dark:bg-[#16162a]">
          <div className={`img-box relative ${aspectClass} w-full ${imgBgClass} overflow-hidden`}>
            <ProductCardBadges product={product} currentPrice={currentPrice} currentComparePrice={currentComparePrice} />
            <ProductCardMedia activeImage={activeImage} secondImage={secondImage} hoveredImage={hoveredImage} productName={product.name} settings={settings} fitClass={settings?.card_image_fit === 'cover' ? 'object-cover' : 'object-contain'} isVariantSelected={isVariantSelected} />

            <div className="elessi-vertical-rail absolute right-2.5 top-2.5 z-[25] flex flex-col gap-1.5 sm:gap-2 transition-all duration-200">
              {showWishlist && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWishlist(e); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-[#1a1a26] text-gray-700 dark:text-gray-200 shadow-md border border-gray-100 dark:border-gray-800 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                  aria-label="Wishlist"
                >
                  <CardWishlistIcon isInWishlist={isInWishlist} iconStyle={iconStyle} className="h-3.5 w-3.5" />
                </button>
              )}
              {showQuickview && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpenQuickView(e); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-[#1a1a26] text-gray-700 dark:text-gray-200 shadow-md border border-gray-100 dark:border-gray-800 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                  aria-label="Quick View"
                >
                  <CardQuickviewIcon iconStyle={iconStyle} className="h-3.5 w-3.5" />
                </button>
              )}
              {showQuickcart && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(e); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-[#1a1a26] text-gray-700 dark:text-gray-200 shadow-md border border-gray-100 dark:border-gray-800 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                  aria-label="Add to cart"
                >
                  <CardCartIcon iconStyle={iconStyle} className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="cb flex flex-col flex-grow justify-between p-2.5 w-full relative z-[2]">
            <div>
              <Link href={productUrl} onClick={handleClick} prefetch={false} className={`card-title text-xs sm:text-sm font-semibold text-gray-900 dark:text-white leading-tight ${titleClampClass}`}>
                {product.name}
              </Link>
              <div className="mt-1">{renderPriceRow('left')}</div>
              <div className="mt-2">{renderDots('left')}</div>
            </div>
          </div>
        </div>
      );
    }

    // ── ELESSI STYLE 6: Seam Full-Width Theme Cart Bar ─────────────────────────
    if (scClass === 'sc_style6') {
      return (
        <div className="flex flex-col h-full justify-between relative bg-white dark:bg-[#16162a]">
          <div className={`img-box relative ${aspectClass} w-full ${imgBgClass} overflow-hidden`}>
            <ProductCardBadges product={product} currentPrice={currentPrice} currentComparePrice={currentComparePrice} />
            <ProductCardMedia activeImage={activeImage} secondImage={secondImage} hoveredImage={hoveredImage} productName={product.name} settings={settings} fitClass={settings?.card_image_fit === 'cover' ? 'object-cover' : 'object-contain'} isVariantSelected={isVariantSelected} />

            <div className="elessi-side-rail absolute right-2.5 top-2.5 z-[25] flex flex-col gap-1.5 sm:gap-2 transition-all duration-200">
              {showWishlist && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWishlist(e); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-[#1a1a26] text-gray-700 dark:text-gray-200 shadow-md border border-gray-100 dark:border-gray-800 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                  aria-label="Wishlist"
                >
                  <CardWishlistIcon isInWishlist={isInWishlist} iconStyle={iconStyle} className="h-3.5 w-3.5" />
                </button>
              )}
              {showQuickview && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpenQuickView(e); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-[#1a1a26] text-gray-700 dark:text-gray-200 shadow-md border border-gray-100 dark:border-gray-800 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                  aria-label="Quick View"
                >
                  <CardQuickviewIcon iconStyle={iconStyle} className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {showQuickcart && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(e); }}
                onPointerDown={(e) => e.stopPropagation()}
                style={{ backgroundColor: 'var(--color-primary, #111827)' }}
                className="elessi-black-cart-bar absolute inset-x-0 bottom-0 z-[25] py-1.5 sm:py-2 text-white text-[10.5px] sm:text-xs font-bold tracking-wider uppercase flex items-center justify-center hover:brightness-110 transition-all cursor-pointer"
              >
                {product.has_variants ? 'Choose options' : 'Add to cart'}
              </button>
            )}
          </div>

          <div className="cb flex flex-col flex-grow justify-between items-center text-center p-2.5 w-full relative z-[2]">
            <div className="w-full flex flex-col items-center">
              <Link href={productUrl} onClick={handleClick} prefetch={false} className={`card-title text-xs sm:text-sm font-semibold text-gray-900 dark:text-white leading-tight ${titleClampClass}`}>
                {product.name}
              </Link>
              <div className="mt-1">{renderPriceRow('center')}</div>
              <div className="mt-2">{renderDots('center')}</div>
            </div>
          </div>
        </div>
      );
    }

    // ── ELESSI STYLE 7: Floating 3-Bubble Center Row ───────────────────────────
    if (scClass === 'sc_style7') {
      return (
        <div className="flex flex-col h-full justify-between relative bg-white dark:bg-[#16162a]">
          <div className={`img-box relative ${aspectClass} w-full ${imgBgClass} overflow-hidden`}>
            <ProductCardBadges product={product} currentPrice={currentPrice} currentComparePrice={currentComparePrice} />
            <ProductCardMedia activeImage={activeImage} secondImage={secondImage} hoveredImage={hoveredImage} productName={product.name} settings={settings} fitClass={settings?.card_image_fit === 'cover' ? 'object-cover' : 'object-contain'} isVariantSelected={isVariantSelected} />

            <div className="elessi-floating-bubbles-wrap absolute inset-x-0 bottom-3 z-[25] flex justify-center pointer-events-none transition-all duration-200">
              <div className="elessi-floating-bubbles pointer-events-auto flex items-center gap-2 sm:gap-2.5">
                {showQuickcart && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(e); }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-[#1a1a26] text-gray-700 dark:text-gray-200 shadow-lg border border-gray-100 dark:border-gray-800 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                    aria-label="Add to cart"
                  >
                    <CardCartIcon iconStyle={iconStyle} className="h-3.5 w-3.5" />
                  </button>
                )}
                {showWishlist && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWishlist(e); }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-[#1a1a26] text-gray-700 dark:text-gray-200 shadow-lg border border-gray-100 dark:border-gray-800 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                    aria-label="Wishlist"
                  >
                    <CardWishlistIcon isInWishlist={isInWishlist} iconStyle={iconStyle} className="h-3.5 w-3.5" />
                  </button>
                )}
                {showQuickview && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpenQuickView(e); }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-[#1a1a26] text-gray-700 dark:text-gray-200 shadow-lg border border-gray-100 dark:border-gray-800 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                    aria-label="Quick View"
                  >
                    <CardQuickviewIcon iconStyle={iconStyle} className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="cb flex flex-col flex-grow justify-between items-center text-center p-2.5 w-full relative z-[2]">
            <div className="w-full flex flex-col items-center">
              <Link href={productUrl} onClick={handleClick} prefetch={false} className={`card-title text-xs sm:text-sm font-semibold text-gray-900 dark:text-white leading-tight ${titleClampClass}`}>
                {product.name}
              </Link>
              <div className="mt-1">{renderPriceRow('center')}</div>
              <div className="mt-2">{renderDots('center')}</div>
            </div>
          </div>
        </div>
      );
    }

    // ── ELESSI STYLE 8: Bottom Sticky Add to Cart Bar ──────────────────────────
    if (scClass === 'sc_style8') {
      return (
        <div className="flex flex-col h-full justify-between relative bg-white dark:bg-[#16162a]">
          <div className={`img-box relative ${aspectClass} w-full ${imgBgClass} overflow-hidden`}>
            <ProductCardBadges product={product} currentPrice={currentPrice} currentComparePrice={currentComparePrice} />
            <ProductCardMedia activeImage={activeImage} secondImage={secondImage} hoveredImage={hoveredImage} productName={product.name} settings={settings} fitClass={settings?.card_image_fit === 'cover' ? 'object-cover' : 'object-contain'} isVariantSelected={isVariantSelected} />

            <div className="elessi-vertical-rail absolute right-2.5 top-2.5 z-[25] flex flex-col gap-1.5 sm:gap-2 transition-all duration-200">
              {showWishlist && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWishlist(e); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-[#1a1a26] text-gray-700 dark:text-gray-200 shadow-md border border-gray-100 dark:border-gray-800 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                  aria-label="Wishlist"
                >
                  <CardWishlistIcon isInWishlist={isInWishlist} iconStyle={iconStyle} className="h-3.5 w-3.5" />
                </button>
              )}
              {showQuickview && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpenQuickView(e); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-[#1a1a26] text-gray-700 dark:text-gray-200 shadow-md border border-gray-100 dark:border-gray-800 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                  aria-label="Quick View"
                >
                  <CardQuickviewIcon iconStyle={iconStyle} className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="cb flex flex-col flex-grow justify-between items-center text-center p-2.5 w-full relative z-[2]">
            <div className="w-full flex flex-col items-center">
              <Link href={productUrl} onClick={handleClick} prefetch={false} className={`card-title text-xs sm:text-sm font-semibold text-gray-900 dark:text-white leading-tight ${titleClampClass}`}>
                {product.name}
              </Link>
              <div className="mt-1">{renderPriceRow('center')}</div>
              <div className="mt-2">{renderDots('center')}</div>
            </div>

            {showQuickcart && (
              <div className="w-full mt-2.5 z-[25]">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(e); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  style={{ backgroundColor: 'var(--color-primary, #ff5a5f)' }}
                  className="w-full py-2 px-3 rounded-lg hover:brightness-110 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center cursor-pointer"
                >
                  {product.has_variants ? 'Choose options' : 'Add to cart'}
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    // ── ELESSI STYLE 9: In-Between Seam Add to Cart Bar ─────────────────────────
    if (scClass === 'sc_style9') {
      return (
        <div className="flex flex-col h-full justify-between relative bg-white dark:bg-[#16162a]">
          <div className={`img-box relative ${aspectClass} w-full ${imgBgClass} overflow-hidden`}>
            <ProductCardBadges product={product} currentPrice={currentPrice} currentComparePrice={currentComparePrice} />
            <ProductCardMedia activeImage={activeImage} secondImage={secondImage} hoveredImage={hoveredImage} productName={product.name} settings={settings} fitClass={settings?.card_image_fit === 'cover' ? 'object-cover' : 'object-contain'} isVariantSelected={isVariantSelected} />

            <div className="elessi-vertical-rail absolute right-2.5 top-2.5 z-[25] flex flex-col gap-1.5 sm:gap-2 transition-all duration-200">
              {showWishlist && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWishlist(e); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-[#1a1a26] text-gray-700 dark:text-gray-200 shadow-md border border-gray-100 dark:border-gray-800 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                  aria-label="Wishlist"
                >
                  <CardWishlistIcon isInWishlist={isInWishlist} iconStyle={iconStyle} className="h-3.5 w-3.5" />
                </button>
              )}
              {showQuickview && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpenQuickView(e); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-[#1a1a26] text-gray-700 dark:text-gray-200 shadow-md border border-gray-100 dark:border-gray-800 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                  aria-label="Quick View"
                >
                  <CardQuickviewIcon iconStyle={iconStyle} className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {showQuickcart && (
            <div className="px-2.5 pt-2 z-[25]">
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(e); }}
                onPointerDown={(e) => e.stopPropagation()}
                style={{ backgroundColor: 'var(--color-primary, #ff5a5f)' }}
                className="w-full py-2 px-3 rounded-lg hover:brightness-110 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center cursor-pointer"
              >
                {product.has_variants ? 'Choose options' : 'Add to cart'}
              </button>
            </div>
          )}

          <div className="cb flex flex-col flex-grow justify-between items-center text-center p-2.5 w-full relative z-[2]">
            <div className="w-full flex flex-col items-center">
              <Link href={productUrl} onClick={handleClick} prefetch={false} className={`card-title text-xs sm:text-sm font-semibold text-gray-900 dark:text-white leading-tight ${titleClampClass}`}>
                {product.name}
              </Link>
              <div className="mt-1">{renderPriceRow('center')}</div>
              <div className="mt-2">{renderDots('center')}</div>
            </div>
          </div>
        </div>
      );
    }

    // ── ELESSI STYLE 10: In-Card Quick Shop Sheet ──────────────────────────────
    if (scClass === 'sc_style10') {
      return (
        <div className="flex flex-col h-full justify-between relative bg-white dark:bg-[#16162a]">
          <div className={`img-box relative ${aspectClass} w-full ${imgBgClass} overflow-hidden`}>
            <ProductCardBadges product={product} currentPrice={currentPrice} currentComparePrice={currentComparePrice} />
            <ProductCardMedia activeImage={activeImage} secondImage={secondImage} hoveredImage={hoveredImage} productName={product.name} settings={settings} fitClass={settings?.card_image_fit === 'cover' ? 'object-cover' : 'object-contain'} isVariantSelected={isVariantSelected} />

            <div className="elessi-side-rail absolute right-2.5 top-2.5 z-[25] flex flex-col gap-1.5 transition-all duration-200">
              {showWishlist && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWishlist(e); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-[#1a1a26] text-gray-700 dark:text-gray-200 shadow-md border border-gray-100 dark:border-gray-800 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                  aria-label="Wishlist"
                >
                  <CardWishlistIcon isInWishlist={isInWishlist} iconStyle={iconStyle} className="h-3.5 w-3.5" />
                </button>
              )}
              {showQuickview && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpenQuickView(e); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-[#1a1a26] text-gray-700 dark:text-gray-200 shadow-md border border-gray-100 dark:border-gray-800 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                  aria-label="Quick View"
                >
                  <CardQuickviewIcon iconStyle={iconStyle} className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="elessi-quick-shop-sheet absolute inset-x-2 bottom-2 z-[25] bg-white dark:bg-[#1a1a26] rounded-2xl p-2.5 sm:p-3 shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col gap-2 transition-all duration-200 max-h-[85%] overflow-y-auto">
              {/* Canonical swatches directly inside the sheet - Single Source of Truth */}
              {finalRenderedGroups && (
                <div className="w-full flex justify-center -my-1" onClick={(e) => e.stopPropagation()}>
                  {finalRenderedGroups}
                </div>
              )}

              <div className="flex flex-col gap-1.5 mt-0.5">
                <div className="flex items-center justify-center">
                  <div className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900 h-6.5 shrink-0 overflow-hidden px-1 w-24">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setQuantity((q) => Math.max(1, q - 1));
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="w-6 h-full text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-gray-900 dark:text-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setQuantity((q) => q + 1);
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="w-6 h-full text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {showQuickcart && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(e); }}
                    onPointerDown={(e) => e.stopPropagation()}
                    style={{ backgroundColor: 'var(--color-primary, #ff5a5f)' }}
                    className="w-full h-7.5 sm:h-8 px-2.5 rounded-lg hover:brightness-110 text-white text-[11px] sm:text-xs font-bold tracking-tight transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
                  >
                    <CardCartIcon iconStyle={iconStyle} className="h-3.5 w-3.5" />
                    <span>Add to cart</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="cb flex flex-col flex-grow justify-between p-2.5 w-full relative z-[2]">
            <div>
              <Link href={productUrl} onClick={handleClick} prefetch={false} className={`card-title text-xs sm:text-sm font-semibold text-gray-900 dark:text-white leading-tight ${titleClampClass}`}>
                {product.name}
              </Link>
              <div className="mt-1.5">
                {renderPriceRow('left')}
              </div>
            </div>
          </div>
        </div>
      );
    }
    // ── ARCHETYPE 01: ZARA HAUTE EDITORIAL ────────────────────────────────────
    if (scClass === 'sc20' || scClass === 'sc_editorial') {
      return (
        <div className="flex flex-col h-full justify-between">
          <div className={`img-box relative ${aspectClass} w-full ${imgBgClass} overflow-hidden`}>
            <ProductCardBadges product={product} currentPrice={currentPrice} currentComparePrice={currentComparePrice} />
            <ProductCardMedia activeImage={activeImage} secondImage={secondImage} hoveredImage={hoveredImage} productName={product.name} settings={settings} fitClass={settings?.card_image_fit === 'cover' ? 'object-cover' : 'object-contain'} isVariantSelected={isVariantSelected} />
            <ProductCardActions variant="slide-drawer" iconStyle={iconStyle} showWishlist={showWishlist} showQuickview={showQuickview} showQuickcart={showQuickcart} isInWishlist={isInWishlist} hasVariants={product.has_variants} onToggleWishlist={onToggleWishlist} onOpenQuickView={onOpenQuickView} onAddToCart={onAddToCart} />
          </div>
          <div className="cb flex flex-col flex-grow justify-between px-1.5 pt-2 pb-1.5 w-full relative z-[2]">
            <div className="flex items-baseline justify-between gap-1.5 w-full">
              <Link href={productUrl} onClick={handleClick} prefetch={false} className={`card-title text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white flex-1 ${titleClampClass}`}>
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
            <ProductCardMedia activeImage={activeImage} secondImage={secondImage} hoveredImage={hoveredImage} productName={product.name} settings={settings} fitClass={settings?.card_image_fit === 'cover' ? 'object-cover' : 'object-contain'} isVariantSelected={isVariantSelected} />
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
                <div className="flex items-center gap-1.5 my-0.5 sm:my-1">
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
                <div className="my-0.5 sm:my-1" onClick={(e) => e.stopPropagation()}>
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
        <div className="flex flex-col h-full justify-between relative">
          <div className={`relative ${aspectClass} w-full ${imgBgClass} rounded-t-xl z-[10]`}>
            <div className="img-box relative w-full h-full rounded-t-xl overflow-hidden">
              <ProductCardBadges product={product} currentPrice={currentPrice} currentComparePrice={currentComparePrice} />
              <ProductCardMedia activeImage={activeImage} secondImage={secondImage} hoveredImage={hoveredImage} productName={product.name} settings={settings} fitClass={settings?.card_image_fit === 'cover' ? 'object-cover' : 'object-contain'} isVariantSelected={isVariantSelected} />
            </div>
            {/* Actions are placed outside the inner overflow-hidden box so the corner FAB seamlessly overlaps the bottom seam without clipping */}
            <ProductCardActions variant="corner-fab" iconStyle={iconStyle} showWishlist={showWishlist} showQuickview={showQuickview} showQuickcart={showQuickcart} isInWishlist={isInWishlist} hasVariants={product.has_variants} onToggleWishlist={onToggleWishlist} onOpenQuickView={onOpenQuickView} onAddToCart={onAddToCart} />
          </div>
          <div className="cb flex flex-col flex-grow justify-between p-2.5 sm:p-3 w-full relative z-[2] bg-white dark:bg-[#16162a] rounded-b-xl">
            <div className="pr-8 sm:pr-9">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-gray-400 mb-0.5 block">
                Collection • {product.has_variants ? 'Multiple Sizes' : 'In Stock'}
              </span>
              <Link href={productUrl} onClick={handleClick} prefetch={false} className={`card-title text-xs sm:text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white leading-tight ${titleClampClass}`}>
                {product.name}
              </Link>
              {finalRenderedGroups && (
                <div className="my-0.5 sm:my-1.5" onClick={(e) => e.stopPropagation()}>
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
            <ProductCardMedia activeImage={activeImage} secondImage={secondImage} hoveredImage={hoveredImage} productName={product.name} settings={settings} fitClass={settings?.card_image_fit === 'cover' ? 'object-cover' : 'object-contain'} isVariantSelected={isVariantSelected} />
            <ProductCardActions variant="action-btn" iconStyle={iconStyle} showWishlist={showWishlist} showQuickview={false} showQuickcart={false} isInWishlist={isInWishlist} hasVariants={product.has_variants} onToggleWishlist={onToggleWishlist} onOpenQuickView={onOpenQuickView} onAddToCart={onAddToCart} />
          </div>
          <div className="cb flex flex-col flex-grow justify-between p-2.5 w-full relative z-[2] bg-white dark:bg-[#16162a] rounded-b-lg">
            <div>
              {showStars && (
                <div className="flex items-center gap-1 my-0.5 sm:my-1">
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
                <div className="my-0.5 sm:my-1.5" onClick={(e) => e.stopPropagation()}>
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
            <ProductCardMedia activeImage={activeImage} secondImage={secondImage} hoveredImage={hoveredImage} productName={product.name} settings={settings} fitClass={settings?.card_image_fit === 'cover' ? 'object-cover' : 'object-contain'} isVariantSelected={isVariantSelected} />
            <ProductCardActions variant="center-pill" iconStyle={iconStyle} showWishlist={showWishlist} showQuickview={showQuickview} showQuickcart={showQuickcart} isInWishlist={isInWishlist} hasVariants={product.has_variants} onToggleWishlist={onToggleWishlist} onOpenQuickView={onOpenQuickView} onAddToCart={onAddToCart} />
          </div>
          <div className="cb flex flex-col flex-grow justify-between items-center text-center p-2.5 sm:p-3 w-full relative z-[2] bg-white dark:bg-[#16162a] rounded-b-2xl">
            <div className="w-full flex flex-col items-center">
              {finalRenderedGroups && (
                <div className="mb-0.5 sm:mb-1.5" onClick={(e) => e.stopPropagation()}>
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
                <div className="flex items-center gap-1 my-0.5 sm:my-1">
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

    // ── ARCHETYPE 05: TITLE-FIRST MAGAZINE (SCANDI / KINFOLK) ─────────────────
    if (scClass === 'sc12' || scClass === 'sc_magazine') {
      return (
        <div className="flex flex-col h-full justify-between p-2.5 sm:p-3 bg-[#faf9f6] dark:bg-[#14141e] border border-gray-200 dark:border-gray-800 rounded-xl">
          {/* Header row: Title on TOP above image */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <span className="text-[8.5px] font-bold uppercase tracking-widest text-gray-400 block mb-0.5">
                Vol. 05 • Kinfolk
              </span>
              <Link href={productUrl} onClick={handleClick} prefetch={false} className={`card-title text-xs sm:text-sm font-serif font-bold text-gray-900 dark:text-white leading-tight ${titleClampClass}`}>
                {product.name}
              </Link>
            </div>
            {showWishlist && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWishlist(e); }}
                onPointerDown={(e) => e.stopPropagation()}
                className="shrink-0 h-6 w-6 flex items-center justify-center text-gray-500 hover:text-[#e94560] cursor-pointer z-[25]"
                aria-label="Wishlist"
              >
                <CardWishlistIcon isInWishlist={isInWishlist} iconStyle={iconStyle} className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Middle: Framed image */}
          <div className={`img-box relative ${aspectClass} w-full ${imgBgClass} rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800 my-1`}>
            <ProductCardBadges product={product} currentPrice={currentPrice} currentComparePrice={currentComparePrice} />
            <ProductCardMedia activeImage={activeImage} secondImage={secondImage} hoveredImage={hoveredImage} productName={product.name} settings={settings} fitClass={settings?.card_image_fit === 'cover' ? 'object-cover' : 'object-contain'} isVariantSelected={isVariantSelected} />
          </div>

          {/* Bottom body: Price & swatches */}
          <div className="cb flex flex-col flex-grow justify-between pt-2 w-full">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="card-price font-serif text-xs sm:text-sm font-black text-gray-900 dark:text-white">
                  {formatPrice(currentPrice, currencySymbol)}
                </span>
                {currentComparePrice && currentComparePrice > currentPrice && (
                  <span className="pold font-serif text-[10px] text-gray-400 line-through">
                    {formatPrice(currentComparePrice, currencySymbol)}
                  </span>
                )}
              </div>
              {finalRenderedGroups && (
                <div className="my-0.5 sm:my-1.5" onClick={(e) => e.stopPropagation()}>
                  {finalRenderedGroups}
                </div>
              )}
            </div>

            {/* Editorial 50/50 Dual Action Footer */}
            <div className="mt-auto pt-2 grid grid-cols-2 gap-1.5 w-full">
              {showQuickview && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpenQuickView(e); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="py-1 px-1.5 rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-[9.5px] font-bold uppercase tracking-wider text-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-[25] cursor-pointer truncate"
                >
                  Quick View
                </button>
              )}
              {showQuickcart && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(e); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className={`${showQuickview ? '' : 'col-span-2'} py-1 px-1.5 rounded bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[9.5px] font-bold uppercase tracking-wider text-center hover:opacity-90 transition-opacity z-[25] cursor-pointer truncate flex items-center justify-center gap-1`}
                >
                  <CardCartIcon iconStyle={iconStyle} className="h-3 w-3 shrink-0" />
                  <span className="truncate">{product.has_variants ? 'Options' : '+ Bag'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    // ── ARCHETYPE 06: POLAROID FRAME (ETSY / DEPOP) ───────────────────────────
    if (scClass === 'sc14' || scClass === 'sc_polaroid') {
      return (
        <div className="flex flex-col h-full justify-between p-2 pb-3 bg-white dark:bg-[#1a1a26] border border-gray-200/90 dark:border-gray-800 rounded-sm shadow-md">
          {/* Polaroid Photo Window */}
          <div className={`img-box relative ${aspectClass} w-full ${imgBgClass} overflow-hidden border border-gray-200/60 dark:border-gray-700`}>
            <ProductCardBadges product={product} currentPrice={currentPrice} currentComparePrice={currentComparePrice} />
            <ProductCardMedia activeImage={activeImage} secondImage={secondImage} hoveredImage={hoveredImage} productName={product.name} settings={settings} fitClass={settings?.card_image_fit === 'cover' ? 'object-cover' : 'object-contain'} isVariantSelected={isVariantSelected} />
            {showWishlist && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWishlist(e); }}
                onPointerDown={(e) => e.stopPropagation()}
                className="action-btn pointer-events-auto !absolute !right-1.5 !top-1.5 z-[25] flex h-6 w-6 items-center justify-center rounded-full bg-white/90 dark:bg-black/80 text-gray-700 dark:text-gray-300 shadow-sm cursor-pointer"
                aria-label="Wishlist"
              >
                <CardWishlistIcon isInWishlist={isInWishlist} iconStyle={iconStyle} className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Polaroid Chin (Bottom thick photo margin) */}
          <div className="cb flex flex-col flex-grow justify-between pt-2 px-1 w-full relative z-[2]">
            <div>
              <div className="flex items-baseline justify-between gap-1">
                <Link href={productUrl} onClick={handleClick} prefetch={false} className={`card-title font-medium text-[11px] sm:text-xs text-gray-800 dark:text-gray-100 flex-1 ${titleClampClass}`}>
                  {product.name}
                </Link>
                <span className="card-price font-bold text-xs text-gray-900 dark:text-white shrink-0">
                  {formatPrice(currentPrice, currencySymbol)}
                </span>
              </div>
              {finalRenderedGroups && (
                <div className="my-0.5 sm:my-1" onClick={(e) => e.stopPropagation()}>
                  {finalRenderedGroups}
                </div>
              )}
            </div>

            {/* Dashed Polaroid Stamp Add Button */}
            {showQuickcart && (
              <div className="mt-auto pt-2">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(e); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="w-full py-1 px-2 border border-dashed border-gray-400 dark:border-gray-600 rounded text-[9.5px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1 z-[25] whitespace-nowrap truncate"
                >
                  <CardCartIcon iconStyle={iconStyle} className="h-2.5 w-2.5 shrink-0" />
                  <span className="truncate">{product.has_variants ? 'Choose Options' : 'Collect +'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    // ── ARCHETYPE 08: BOTTOM SHEET (NATIVE APP / NIKE APP) ────────────────────
    if (scClass === 'sc10' || scClass === 'sc_bottomsheet') {
      return (
        <div className="flex flex-col h-full justify-between relative bg-gray-100 dark:bg-[#12121f] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
          {/* Top: Tall Image */}
          <div className={`img-box relative ${aspectClass} w-full ${imgBgClass} overflow-hidden`}>
            <ProductCardBadges product={product} currentPrice={currentPrice} currentComparePrice={currentComparePrice} />
            <ProductCardMedia activeImage={activeImage} secondImage={secondImage} hoveredImage={hoveredImage} productName={product.name} settings={settings} fitClass={settings?.card_image_fit === 'cover' ? 'object-cover' : 'object-contain'} isVariantSelected={isVariantSelected} />
            {showWishlist && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWishlist(e); }}
                onPointerDown={(e) => e.stopPropagation()}
                className="action-btn pointer-events-auto !absolute !right-2 !top-2 z-[25] flex h-7 w-7 items-center justify-center rounded-full bg-white/90 dark:bg-[#16162a]/90 text-gray-700 dark:text-gray-300 shadow-sm cursor-pointer"
                aria-label="Wishlist"
              >
                <CardWishlistIcon isInWishlist={isInWishlist} iconStyle={iconStyle} className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Bottom Sheet Overlap Panel */}
          <div className="cb flex flex-col flex-grow justify-between -mt-5 relative z-[10] bg-white dark:bg-[#16162a] rounded-t-[20px] p-2.5 sm:p-3 shadow-[0_-6px_20px_rgba(0,0,0,0.08)] border-t border-gray-100 dark:border-gray-800">
            {/* iOS Drag Handle */}
            <div className="w-8 h-1 rounded-full bg-gray-300 dark:bg-gray-600 mx-auto mb-1.5 shrink-0" />

            <div>
              <div className="flex items-baseline justify-between gap-1">
                <Link href={productUrl} onClick={handleClick} prefetch={false} className={`card-title text-xs sm:text-[13px] font-bold text-gray-900 dark:text-white leading-tight flex-1 ${titleClampClass}`}>
                  {product.name}
                </Link>
                <span className="card-price text-xs sm:text-sm font-black text-gray-900 dark:text-white shrink-0">
                  {formatPrice(currentPrice, currencySymbol)}
                </span>
              </div>
              {showStars && (
                <div className="flex items-center gap-1 my-0.5 sm:my-1">
                  <span className="text-amber-500 text-[10px]">★</span>
                  <span className="text-[10px] text-gray-400 font-semibold">{(product.rating || 5).toFixed(1)}</span>
                </div>
              )}
              {finalRenderedGroups && (
                <div className="my-0.5 sm:my-1.5" onClick={(e) => e.stopPropagation()}>
                  {finalRenderedGroups}
                </div>
              )}
            </div>

            {/* Native App Slide Action Button */}
            {showQuickcart && (
              <div className="mt-auto pt-2">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(e); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="w-full py-2 px-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10.5px] sm:text-xs font-bold flex items-center justify-between cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all z-[25] whitespace-nowrap truncate"
                >
                  <span className="truncate">{product.has_variants ? 'Select Size' : 'Quick Add'}</span>
                  <CardCartIcon iconStyle={iconStyle} className="h-3.5 w-3.5 shrink-0" />
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    // ── ARCHETYPE 09: HANG TAG (BOUTIQUE / MADEWELL) ──────────────────────────
    if (scClass === 'sc16' || scClass === 'sc_hangtag') {
      return (
        <div className="flex flex-col h-full justify-between bg-[#fdfbf7] dark:bg-[#1c1815] border border-[#e8dfd1] dark:border-[#382f27] rounded-xl overflow-hidden shadow-xs">
          {/* Image Container with Boutique Hang Tag Overlap */}
          <div className={`img-box relative ${aspectClass} w-full ${imgBgClass} overflow-hidden`}>
            <ProductCardBadges product={product} currentPrice={currentPrice} currentComparePrice={currentComparePrice} />
            <ProductCardMedia activeImage={activeImage} secondImage={secondImage} hoveredImage={hoveredImage} productName={product.name} settings={settings} fitClass={settings?.card_image_fit === 'cover' ? 'object-cover' : 'object-contain'} isVariantSelected={isVariantSelected} />

            {/* Kraft Paper Hang Tag pinned to top-right */}
            <div className="absolute top-2 right-2 z-[15] bg-[#ebdcc4] dark:bg-[#342a20] text-[#4a3a28] dark:text-[#eedec8] px-2 py-0.5 rounded shadow-sm border border-[#cfbe9f] dark:border-[#4d3e30] flex items-center gap-1 transform rotate-1 pointer-events-none">
              <div className="w-1.5 h-1.5 rounded-full bg-[#fdfbf7] dark:bg-[#1c1815] border border-[#cfbe9f] shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-black tracking-tight">{formatPrice(currentPrice, currencySymbol)}</span>
            </div>
          </div>

          {/* Boutique Body */}
          <div className="cb flex flex-col flex-grow justify-between p-2.5 sm:p-3 w-full relative z-[2]">
            <div>
              <Link href={productUrl} onClick={handleClick} prefetch={false} className={`card-title font-serif italic text-xs sm:text-sm text-[#2c2217] dark:text-[#eae1d5] font-semibold leading-snug ${titleClampClass}`}>
                {product.name}
              </Link>
              {currentComparePrice && currentComparePrice > currentPrice && (
                <span className="pold text-[10px] text-gray-400 line-through block mt-0.5">
                  Regular: {formatPrice(currentComparePrice, currencySymbol)}
                </span>
              )}
              {finalRenderedGroups && (
                <div className="my-0.5 sm:my-1.5" onClick={(e) => e.stopPropagation()}>
                  {finalRenderedGroups}
                </div>
              )}
            </div>

            {/* Bottom Row: Heart on left, Underlined text button on right */}
            <div className="mt-auto pt-2 flex items-center justify-between gap-2 border-t border-[#ede4d4] dark:border-[#2e261f]">
              {showWishlist && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWishlist(e); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="h-6 w-6 flex items-center justify-center rounded-full border border-[#d5c7b3] dark:border-[#44382c] text-[#5c4938] dark:text-[#d3c0ad] hover:text-[#e94560] cursor-pointer z-[25] shrink-0"
                  aria-label="Wishlist"
                >
                  <CardWishlistIcon isInWishlist={isInWishlist} iconStyle={iconStyle} className="h-3 w-3" />
                </button>
              )}
              {showQuickcart && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(e); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="text-[10px] sm:text-[10.5px] font-bold tracking-wider uppercase text-[#4a3a28] dark:text-[#eedec8] underline underline-offset-4 hover:text-black dark:hover:text-white transition-colors cursor-pointer z-[25] ml-auto whitespace-nowrap truncate"
                >
                  {product.has_variants ? 'View Options →' : 'Quick Add +'}
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    // ── ARCHETYPE 10: STORY SWIPE (INSTAGRAM STORIES / REELS) ─────────────────
    if (scClass === 'sc15' || scClass === 'sc_storyswipe') {
      return (
        <div className={`img-box relative ${aspectClass} w-full rounded-2xl overflow-hidden bg-black border border-gray-800 flex flex-col justify-between shadow-lg`}>
          {/* Segmented Story Progress Bars at Top */}
          <div className="absolute top-2 inset-x-2 z-[20] grid grid-cols-3 gap-1 pointer-events-none">
            <div className="h-0.5 rounded-full bg-white" />
            <div className="h-0.5 rounded-full bg-white/50" />
            <div className="h-0.5 rounded-full bg-white/30" />
          </div>

          {/* Badges pinned under story bar */}
          <div className="absolute top-4 left-2 z-[15]">
            <ProductCardBadges product={product} currentPrice={currentPrice} currentComparePrice={currentComparePrice} />
          </div>

          {/* Wishlist in dark translucent bubble */}
          {showWishlist && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWishlist(e); }}
              onPointerDown={(e) => e.stopPropagation()}
              className="action-btn pointer-events-auto !absolute !right-2 !top-4 z-[25] flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white border border-white/20 shadow-md cursor-pointer"
              aria-label="Wishlist"
            >
              <CardWishlistIcon isInWishlist={isInWishlist} iconStyle={iconStyle} className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Background image */}
          <ProductCardMedia activeImage={activeImage} secondImage={secondImage} hoveredImage={hoveredImage} productName={product.name} settings={settings} fitClass={settings?.card_image_fit === 'cover' ? 'object-cover' : 'object-contain'} isVariantSelected={isVariantSelected} />

          {/* Dark Scrim Gradient Overlay at Bottom */}
          <div className="mt-auto relative z-[15] bg-gradient-to-t from-black via-black/85 to-transparent pt-14 pb-3 px-3 flex flex-col justify-end w-full">
            <Link href={productUrl} onClick={handleClick} prefetch={false} className={`card-title text-white font-bold text-xs sm:text-sm drop-shadow-md leading-tight ${titleClampClass}`}>
              {product.name}
            </Link>
            <div className="flex items-baseline gap-1.5 my-1">
              <span className="card-price text-white font-black text-xs sm:text-sm drop-shadow-sm">
                {formatPrice(currentPrice, currencySymbol)}
              </span>
              {currentComparePrice && currentComparePrice > currentPrice && (
                <span className="pold text-[10px] text-gray-300 line-through">
                  {formatPrice(currentComparePrice, currencySymbol)}
                </span>
              )}
            </div>
            {finalRenderedGroups && (
              <div className="my-0.5 sm:my-1" onClick={(e) => e.stopPropagation()}>
                {finalRenderedGroups}
              </div>
            )}

            {/* Story Reels Pill Button */}
            {showQuickcart && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(e); }}
                onPointerDown={(e) => e.stopPropagation()}
                className="mt-1.5 w-full py-1.5 px-3 rounded-full bg-white text-black text-[10.5px] font-extrabold flex items-center justify-center gap-1.5 shadow-xl hover:bg-gray-100 active:scale-95 transition-all cursor-pointer z-[25] whitespace-nowrap truncate"
              >
                <CardCartIcon iconStyle={iconStyle} className="h-3 w-3 shrink-0" />
                <span className="truncate">{product.has_variants ? 'Tap for Sizes' : 'Swipe to Bag'}</span>
              </button>
            )}
          </div>
        </div>
      );
    }
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
            isVariantSelected={isVariantSelected}
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
      data-product-id={product.id}
      data-hover-effect={hoverStyle}
      onPointerDown={handlePointerDown}
      style={{ touchAction: 'pan-y' }}
      className={`z-card-container ${scClass} group relative flex flex-col h-full ${isFocused ? 'is-in-focus active-card' : ''} ${Boolean(hoveredImage || isVariantSelected) ? 'has-hovered-variant' : ''}`}
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
