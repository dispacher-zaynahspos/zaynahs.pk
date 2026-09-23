'use client';

import React from 'react';
import { Product } from '@/lib/types';

interface ProductCardBadgesProps {
  product: Product;
  currentPrice: number;
  currentComparePrice?: number | null;
}

export const ProductCardBadges: React.FC<ProductCardBadgesProps> = ({
  product,
  currentPrice,
  currentComparePrice,
}) => {
  const badgeClass = "bdg pointer-events-none";
  const badges: React.ReactNode[] = [];

  if (currentComparePrice && currentComparePrice > currentPrice) {
    badges.push(
      <span key="sale" className={`${badgeClass} bdg-sale`}>
        -{Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100)}%
      </span>
    );
  }
  if (product.isFeatured) {
    const featuredCustom = product.customBadge?.name?.toLowerCase() === 'featured' ? product.customBadge : null;
    badges.push(
      <span
        key="featured"
        className={`${badgeClass} bdg-featured`}
        style={{
          backgroundColor: featuredCustom?.bgColor || '#0f172a',
          color: featuredCustom?.textColor || '#ffffff',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}
      >
        {featuredCustom?.name || 'FEATURED'}
      </span>
    );
  }
  if (product.badgeEnabled && product.customBadge && (!product.isFeatured || product.customBadge.name.toLowerCase() !== 'featured')) {
    badges.push(
      <span
        key="custom"
        className={badgeClass}
        style={{
          backgroundColor: product.customBadge.bgColor,
          color: product.customBadge.textColor,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}
      >
        {product.customBadge.name}
      </span>
    );
  }
  if (!product.isService && product.stock > 0 && product.stock <= 8) {
    badges.push(<span key="limited" className={`${badgeClass} bdg-new`}>Limited</span>);
  }

  if (badges.length === 0) return null;

  return (
    <div className="bdg-container pointer-events-none">
      {badges}
    </div>
  );
};
