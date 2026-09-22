import React from 'react';
import { Product, StoreSettings } from '@/lib/types';
import ProductCard from './ProductCard';
import EmptyState from '../common/EmptyState';
import { getResponsiveGridClasses } from '@/lib/utils/responsiveGrid';

interface ProductGridProps {
  products: Product[];
  currencySymbol?: string;
  settings?: StoreSettings | null;
  columnsDesktop?: number;
  columnsTablet?: number;
  columnsMobile?: number;
}

export default function ProductGrid({
  products,
  currencySymbol,
  settings,
  columnsDesktop,
  columnsTablet,
  columnsMobile,
}: ProductGridProps) {
  if (products.length === 0) {
    return <EmptyState />;
  }

  const gridClasses = getResponsiveGridClasses({
    mobile: columnsMobile ?? (settings?.card_mobile_columns === 1 ? 1 : 2),
    tablet: columnsTablet ?? 3,
    desktop: columnsDesktop ?? 4,
  });

  return (
    <div className={`grid gap-2.5 sm:gap-3.5 md:gap-4 lg:gap-5 ${gridClasses}`}>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} currencySymbol={currencySymbol} settings={settings} priority={index < 6} />
      ))}
    </div>
  );
}
