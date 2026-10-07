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
  if (product.is_featured) {
    const featuredCustom = product.custom_badge?.name?.toLowerCase() === 'featured' ? product.custom_badge : null;
    badges.push(
      <span
        key="featured"
        className={`${badgeClass} bdg-featured`}
        style={{
          backgroundColor: featuredCustom?.bg_color || '#e94560',
          color: featuredCustom?.text_color || '#ffffff',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}
      >
        {featuredCustom?.name || 'FEATURED'}
      </span>
    );
  }
  if (product.badge_enabled && product.custom_badge && (!product.is_featured || product.custom_badge.name.toLowerCase() !== 'featured')) {
    badges.push(
      <span
        key="custom"
        className={badgeClass}
        style={{
          backgroundColor: product.custom_badge.bg_color,
          color: product.custom_badge.text_color,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}
      >
        {product.custom_badge.name}
      </span>
    );
  }
  if (!product.is_service && product.stock > 0 && product.stock <= 8) {
    badges.push(<span key="limited" className={`${badgeClass} bdg-new`}>Limited</span>);
  }

  if (badges.length === 0) return null;

  return (
    <div className="bdg-container absolute top-2 left-2 flex flex-col gap-1 z-10 items-start pointer-events-none max-w-[calc(100%-48px)]">
      {badges}
    </div>
  );
};
