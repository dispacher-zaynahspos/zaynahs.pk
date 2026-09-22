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
    badges.push(<span key="featured" className={`${badgeClass} bdg-hot`}>Featured</span>);
  }
  if (product.badgeEnabled && product.customBadge) {
    badges.push(
      <span
        key="custom"
        className={badgeClass}
        style={{
          backgroundColor: product.customBadge.bgColor,
          color: product.customBadge.textColor
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
