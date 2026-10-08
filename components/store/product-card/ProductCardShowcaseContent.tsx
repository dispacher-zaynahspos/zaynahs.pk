'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils/whatsapp';

interface ProductCardShowcaseContentProps {
  styleClass: string;
  elementsOrder: string[];
  alignClass: string;
  titleClampClass: string;
  product: Product;
  showStars: boolean;
  currencySymbol: string;
  minPrice: number;
  maxPrice: number;
  hasPriceRange: boolean;
  currentPrice: number;
  currentComparePrice?: number | null;
  displayDescription: string;
  finalRenderedGroups: React.ReactNode;
  // Shopify pattern: title is a Link, not just a div
  productUrl: string;
  onCardClick: (() => void) | ((e: React.MouseEvent) => void);
  // Optional appearance overrides from customizer (fall back to per-style defaults)
  saleColor?: string;
  compareColor?: string;
}

export const ProductCardShowcaseContent: React.FC<ProductCardShowcaseContentProps> = ({
  styleClass,
  elementsOrder,
  alignClass,
  titleClampClass,
  product,
  showStars,
  currencySymbol,
  currentPrice,
  currentComparePrice,
  displayDescription,
  finalRenderedGroups,
  productUrl,
  onCardClick,
  saleColor,
  compareColor,
}) => {
  const starsColor =
    styleClass === 'sc8' ? '#000' :
    styleClass === 'sc9' ? '#6750a4' :
    styleClass === 'sc10' ? '#8e44ad' :
    styleClass === 'sc11' ? '#c9a44c' :
    styleClass === 'sc12' ? '#1a1a1a' :
    styleClass === 'sc13' ? '#e94560' :
    styleClass === 'sc14' ? '#111' :
    styleClass === 'sc15' ? '#0a84ff' :
    styleClass === 'sc16' ? '#c0603a' :
    '#f59e0b';

  const countColor =
    styleClass === 'sc8' ? '#666' :
    styleClass === 'sc9' ? '#666' :
    styleClass === 'sc11' ? '#8a8470' :
    styleClass === 'sc16' ? '#b7a68f' :
    '#888';


  const descClass =
    styleClass === 'sc8' ? 'text-gray-500' :
    styleClass === 'sc10' ? 'text-gray-500' :
    'text-gray-500';

  // Backward compat: treat any removed styleClass as sc1
  const validSc = ['sc1', 'sc8', 'sc9', 'sc10', 'sc11', 'sc12', 'sc13', 'sc14', 'sc15', 'sc16'];
  const safeStyleClass = validSc.includes(styleClass) ? styleClass : 'sc1';

  const contentClass = safeStyleClass === 'sc8'
    ? 'z-card-content-geo flex-grow flex flex-col justify-end'
    : 'card-content';

  const needsCbWrapper = ['sc8', 'sc9', 'sc10', 'sc11', 'sc12', 'sc13', 'sc14', 'sc15', 'sc16'].includes(safeStyleClass);

  const inner = (
    <>
      {elementsOrder.map(element => {
        switch (element) {
          case 'title':
            return (
              // Shopify: title is a Link at z-[2], above overlay link at z-[1]
              <Link
                key="title"
                href={productUrl}
                onClick={onCardClick as React.MouseEventHandler}
                prefetch={false}
                className={`card-title product-card-title relative z-[2] text-[11px] sm:text-xs font-semibold normal-case tracking-normal leading-snug pb-0.5 ${titleClampClass}`}
                style={{ fontFamily: 'var(--font-body, system-ui, sans-serif)' }}
              >
                {product.name}
              </Link>
            );
          case 'rating':
            if (!showStars) return null;
            return (
              <div key="rating" className="rat my-0 sm:my-0.5">
                <span className="st" style={{ color: starsColor }}>
                  {Array.from({ length: 5 }).map((_, idx) => idx < Math.round(product.rating || 5) ? '★' : '☆').join('')}
                </span>
                <span className="rc" style={{ color: countColor }}>({product.reviews_count || 0})</span>
              </div>
            );
          case 'price':
            return (
              <div key="price" className="prow">
                {/* Sale price FIRST (prominent), strikethrough original SECOND —
                    fixed app-wide order (docs/UI_RULES.md). */}
                <span className="card-price" style={saleColor ? { color: saleColor } : undefined}>{formatPrice(currentPrice, currencySymbol)}</span>
                {currentComparePrice && currentComparePrice > currentPrice && (
                  <span
                    className="pold ml-1.5 line-through decoration-red-500 decoration-[1.5px]"
                    style={{
                      textDecoration: 'line-through',
                      textDecorationColor: compareColor || '#ef4444',
                      WebkitTextDecorationColor: compareColor || '#ef4444',
                      textDecorationThickness: '1.5px',
                      color: '#888',
                    }}
                  >
                    {formatPrice(currentComparePrice, currencySymbol)}
                  </span>
                )}
              </div>
            );
          case 'swatches':
            if (product.show_swatches_on_archive === false || !finalRenderedGroups) return null;
            return (
              <div key="swatches" className="relative z-[2] w-full mt-1 sm:mt-2 mb-1 sm:mb-1.5" onClick={(e) => e.stopPropagation()}>
                {finalRenderedGroups}
              </div>
            );
          default:
            return null;
        }
      })}

      {displayDescription && (
        <p className={`text-[10px] line-clamp-2 mt-1 mb-2 leading-relaxed ${descClass}`}>
          {displayDescription}
        </p>
      )}
    </>
  );

  return needsCbWrapper ? (
    <div className={`cb flex flex-col flex-grow justify-between ${alignClass}`}>{inner}</div>
  ) : (
    <div className={`${contentClass} flex flex-col flex-grow justify-between ${alignClass}`}>{inner}</div>
  );
};
