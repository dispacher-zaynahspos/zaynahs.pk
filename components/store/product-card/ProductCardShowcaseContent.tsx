'use client';

import React from 'react';
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
}) => {
  const starsColor =
    styleClass === 'sc2' ? 'rgba(255,255,255,.8)' :
      styleClass === 'sc3' ? 'rgba(255,255,255,.9)' :
        styleClass === 'sc4' ? '#ffeaa7' :
          styleClass === 'sc6' ? '#d4af37' :
            styleClass === 'sc7' ? '#000' :
              styleClass === 'sc8' ? '#000' :
                styleClass === 'sc9' ? '#6750a4' :
                  styleClass === 'sc10' ? '#8e44ad' :
                    '#f59e0b';

  const countColor =
    styleClass === 'sc2' ? 'rgba(255,255,255,.4)' :
      styleClass === 'sc3' ? 'rgba(255,255,255,.5)' :
        styleClass === 'sc4' ? 'rgba(255,255,255,.6)' :
          styleClass === 'sc7' ? '#555' :
            styleClass === 'sc8' ? '#666' :
              styleClass === 'sc9' ? '#666' :
                '#888';

  const poldStyle =
    styleClass === 'sc2' ? { color: 'rgba(255,255,255,.5)' } :
      styleClass === 'sc3' ? { color: 'rgba(255,255,255,.6)' } :
        styleClass === 'sc4' ? { color: 'rgba(255,255,255,.6)' } :
          styleClass === 'sc6' ? { color: 'rgba(255,255,255,.4)' } :
            undefined;

  const descClass =
    styleClass === 'sc2' ? 'text-white/70' :
      styleClass === 'sc3' ? 'text-white/80' :
        styleClass === 'sc4' ? 'text-white/80' :
          styleClass === 'sc6' ? 'text-[#d4af37]/70' :
            styleClass === 'sc7' ? 'text-gray-700' :
              styleClass === 'sc8' ? 'text-gray-500' :
                styleClass === 'sc10' ? 'text-gray-500' :
                  'text-gray-500';

  const contentClass = styleClass === 'sc8'
    ? 'z-card-content-geo flex-grow flex flex-col justify-end'
    : 'card-content';

  return (
    <div className={`${contentClass} ${alignClass}`}>
      {elementsOrder.map(element => {
        switch (element) {
          case 'title':
            return (
              <div
                key="title"
                className={`card-title product-card-title text-[11px] sm:text-xs font-semibold normal-case tracking-normal leading-snug line-clamp-2 text-gray-900 dark:text-white pb-0.5 ${titleClampClass}`}
                style={{ fontFamily: 'var(--font-body, system-ui, sans-serif)' }}
              >
                {product.name}
              </div>
            );
          case 'rating':
            if (!showStars) return null;
            return (
              <div key="rating" className="rat">
                <span className="st" style={{ color: starsColor }}>
                  {Array.from({ length: 5 }).map((_, idx) => idx < Math.round(product.rating || 5) ? '★' : '☆').join('')}
                </span>
                <span className="rc" style={{ color: countColor }}>({product.reviewsCount || 0})</span>
              </div>
            );
          case 'price':
            return (
              <div key="price" className="prow">
                {currentComparePrice && currentComparePrice > currentPrice && (
                  <span className="pold mr-1.5" style={poldStyle}>
                    {formatPrice(currentComparePrice, currencySymbol)}
                  </span>
                )}
                <span className="card-price">{formatPrice(currentPrice, currencySymbol)}</span>
              </div>
            );
          case 'swatches':
            if (product.showSwatchesOnArchive === false || !finalRenderedGroups) return null;
            return (
              <div key="swatches" className="w-full mt-2" onClick={(e) => e.preventDefault()}>
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
    </div>
  );
};
