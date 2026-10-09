'use client';

import React from 'react';
import { Product } from '@/lib/types';

interface ProductCardBadgesProps {
  product: Product;
  currentPrice: number;
  currentComparePrice?: number | null;
  stock?: number;
  className?: string;
}

export const ProductCardBadges: React.FC<ProductCardBadgesProps> = ({
  product,
  currentPrice,
  currentComparePrice,
  stock,
  className,
}) => {
  const badgeClass = "bdg pointer-events-none";
  const badges: React.ReactNode[] = [];

  // 1. Sale Discount Badge
  if (currentComparePrice && currentComparePrice > currentPrice) {
    const saleCustom = product.custom_badge?.name?.toLowerCase() === 'sale' ? product.custom_badge : null;
    badges.push(
      <span
        key="sale"
        className={`${badgeClass} bdg-sale`}
        style={saleCustom ? { backgroundColor: saleCustom.bg_color, color: saleCustom.text_color } : undefined}
      >
        -{Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100)}%
      </span>
    );
  }

  // 2. Featured Badge
  if (product.is_featured) {
    const featuredCustom = product.custom_badge?.name?.toLowerCase() === 'featured' ? product.custom_badge : null;
    badges.push(
      <span
        key="featured"
        className={`${badgeClass} bdg-featured`}
        style={{
          backgroundColor: featuredCustom?.bg_color || '#e94560',
          color: featuredCustom?.text_color || '#ffffff',
        }}
      >
        {featuredCustom?.name || 'FEATURED'}
      </span>
    );
  }

  // 3. Custom Promotional Badge from /admin/badges
  const customName = product.custom_badge?.name?.toLowerCase();
  const isDuplicate =
    (product.is_featured && customName === 'featured') ||
    (Boolean(currentComparePrice && currentComparePrice > currentPrice) && customName === 'sale');

  if (product.custom_badge && product.badge_enabled !== false && !isDuplicate) {
    badges.push(
      <span
        key="custom"
        className={badgeClass}
        style={{
          backgroundColor: product.custom_badge.bg_color,
          color: product.custom_badge.text_color,
        }}
      >
        {product.custom_badge.name}
      </span>
    );
  }

  // 4. Limited Stock Badge
  const stockCount = stock !== undefined ? stock : product.stock;
  if (!product.is_service && stockCount > 0 && stockCount <= 8) {
    badges.push(<span key="limited" className={`${badgeClass} bdg-new`}>Limited</span>);
  }

  if (badges.length === 0) return null;

  const containerClasses = className || "bdg-container absolute top-2 left-2 flex flex-col gap-1 z-10 items-start pointer-events-none max-w-[calc(100%-48px)]";

  return (
    <div className={containerClasses}>
      {badges}
    </div>
  );
};
