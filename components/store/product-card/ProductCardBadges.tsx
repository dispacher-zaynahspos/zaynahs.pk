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
    const saleBg = saleCustom?.bg_color || '#10b981';
    const saleColor = saleCustom?.text_color || '#ffffff';
    badges.push(
      <span
        key="sale"
        className={`${badgeClass} bdg-sale`}
        style={{
          backgroundColor: saleBg,
          color: saleColor,
          '--bdg-bg': saleBg,
          '--bdg-color': saleColor,
        } as React.CSSProperties}
      >
        -{Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100)}%
      </span>
    );
  }

  // 2. Featured Badge
  if (product.is_featured) {
    const featuredCustom = product.custom_badge?.name?.toLowerCase() === 'featured' ? product.custom_badge : null;
    const featBg = featuredCustom?.bg_color || '#e94560';
    const featColor = featuredCustom?.text_color || '#ffffff';
    badges.push(
      <span
        key="featured"
        className={`${badgeClass} bdg-featured`}
        style={{
          backgroundColor: featBg,
          color: featColor,
          '--bdg-bg': featBg,
          '--bdg-color': featColor,
        } as React.CSSProperties}
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
    const custBg = product.custom_badge.bg_color || '#0f172a';
    const custColor = product.custom_badge.text_color || '#ffffff';
    badges.push(
      <span
        key="custom"
        className={`${badgeClass} bdg-custom`}
        style={{
          backgroundColor: custBg,
          color: custColor,
          '--bdg-bg': custBg,
          '--bdg-color': custColor,
        } as React.CSSProperties}
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

  const containerClasses = className ? `bdg-container ${className}` : "bdg-container";

  return (
    <div className={containerClasses}>
      {badges}
    </div>
  );
};
