import React from 'react';
import { Product, StoreSettings } from '@/lib/types';
import { getEllaCardVariant, toCardProduct, EllaProductGrid } from '@/components/product-cards';
import ProductCard from './ProductCard';
import EmptyState from '../common/EmptyState';
import { getCatalogGridStyle, GridGapOption, CatalogColumnsMode } from '@/lib/utils/responsiveGrid';

interface ProductGridProps {
  products: Product[];
  currencySymbol?: string;
  settings?: StoreSettings | null;
  columnsDesktop?: number;
  columnsTablet?: number;
  columnsMobile?: number;
  columnsWide?: number;
  columnsMode?: CatalogColumnsMode;
  minCardDesktop?: number;
  gridGap?: GridGapOption;
}

export default function ProductGrid({
  products,
  currencySymbol,
  settings,
  columnsDesktop,
  columnsTablet,
  columnsMobile,
  columnsWide,
  columnsMode,
  minCardDesktop,
  gridGap,
}: ProductGridProps) {
  if (products.length === 0) {
    return <EmptyState />;
  }

  const effectiveGap = gridGap || settings?.shop_grid_gap || 'normal';

  const ellaVariant = getEllaCardVariant(settings?.card_style);
  const productMap = React.useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const cardProducts = React.useMemo(() => products.map((p) => toCardProduct(p, settings)), [products, settings]);

  if (ellaVariant) {
    return (
      <EllaProductGrid
        variant={ellaVariant}
        products={cardProducts}
        settings={settings}
        currencySymbol={currencySymbol}
        cols={{
          mode: columnsMode,
          desktop: columnsDesktop,
          tablet: columnsTablet,
          mobile: columnsMobile,
          wide: columnsWide,
          minDesktop: minCardDesktop,
        }}
        renderProduct={(cardProduct) => {
          const product = productMap.get(cardProduct.id) || products[0];
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

  const grid = getCatalogGridStyle({
    mode: columnsMode,
    mobile: columnsMobile ?? (settings?.card_mobile_columns === 1 ? 1 : 2),
    tablet: columnsTablet ?? 3,
    desktop: columnsDesktop ?? 4,
    wide: columnsWide,
    minDesktop: minCardDesktop,
    gap: effectiveGap,
  });

  return (
    <div className={grid.className} data-mode={grid.mode} style={grid.style}>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} currencySymbol={currencySymbol} settings={settings} priority={index < 6} />
      ))}
    </div>
  );
}
