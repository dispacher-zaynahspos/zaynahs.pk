import React from 'react';
import { Product, StoreSettings } from '@/lib/types';
import { getEllaCardVariant, toCardProduct, EllaProductGrid } from '@/components/product-cards';
import ProductCard from './ProductCard';
import EmptyState from '../common/EmptyState';
import { getResponsiveGridClasses, getGridGapClass, GridGapOption } from '@/lib/utils/responsiveGrid';

interface ProductGridProps {
  products: Product[];
  currencySymbol?: string;
  settings?: StoreSettings | null;
  columnsDesktop?: number;
  columnsTablet?: number;
  columnsMobile?: number;
  gridGap?: GridGapOption;
}

export default function ProductGrid({
  products,
  currencySymbol,
  settings,
  columnsDesktop,
  columnsTablet,
  columnsMobile,
  gridGap,
}: ProductGridProps) {
  if (products.length === 0) {
    return <EmptyState />;
  }

  const effectiveGap = gridGap || (settings as any)?.shop_grid_gap || 'normal';

  const ellaVariant = getEllaCardVariant(settings?.card_style);
  if (ellaVariant) {
    return (
      <EllaProductGrid
        variant={ellaVariant}
        products={products.map((product) => toCardProduct(product, settings))}
        settings={settings}
        currencySymbol={currencySymbol}
        renderProduct={(cardProduct) => {
          const product = products.find((item) => item.id === cardProduct.id) || products[0];
          return product ? (
            <ProductCard
              key={product.id}
              product={product}
              currencySymbol={currencySymbol}
              settings={settings}
              ellaCardVariant={ellaVariant}
            />
          ) : null;
        }}
      />
    );
  }

  const gridClasses = getResponsiveGridClasses({
    mobile: columnsMobile ?? (settings?.card_mobile_columns === 1 ? 1 : 2),
    tablet: columnsTablet ?? 3,
    desktop: columnsDesktop ?? 4,
  });

  const gapClass = getGridGapClass(effectiveGap);

  return (
    <div className={`grid ${gapClass} ${gridClasses}`}>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} currencySymbol={currencySymbol} settings={settings} priority={index < 6} />
      ))}
    </div>
  );
}
