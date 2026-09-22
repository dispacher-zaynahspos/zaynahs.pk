'use client';

import React from 'react';
import { StoreSettings, Product } from '@/lib/types';
import ProductDetail from '@/components/store/ProductDetail';
import ProductReviews from '@/components/store/ProductReviews';
import ProductCard from '@/components/store/ProductCard';
import SocialFeedRibbon from '@/components/store/SocialFeedRibbon';
import { getResponsiveGridClasses } from '@/lib/utils/responsiveGrid';

interface ProductPageBlocksProps {
  currentProduct: Product;
  products: Product[];
  settings: StoreSettings;
}

export default function ProductPageBlocks({
  currentProduct,
  products,
  settings,
}: ProductPageBlocksProps) {
  const blocks = settings.productPageLayout || ['details', 'ticker', 'reviews', 'related', 'recently_viewed', 'social_feed'];

  const relatedCols = getResponsiveGridClasses({
    mobile: settings.related_columns_mobile || 2,
    tablet: settings.related_columns_tablet || 3,
    desktop: settings.related_columns_desktop || 4,
  });

  const recentCols = getResponsiveGridClasses({
    mobile: settings.recently_viewed_columns_mobile || 2,
    tablet: settings.recently_viewed_columns_tablet || 3,
    desktop: settings.recently_viewed_columns_desktop || 4,
  });

  return (
    <div className="space-y-10 pb-16 pt-8">
      {blocks.map((block) => {
        if (block === 'details') {
          return (
            <div
              key="details"
              id="details"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.parent.postMessage({ type: 'select_product_detail_tab', subTab: 'swatches' }, '*');
              }}
              className="relative cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-[#e94560] hover:ring-offset-2 group/preview-block"
            >
              <div className="absolute top-2 left-2 z-[60] bg-[#e94560] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md uppercase opacity-0 group-hover/preview-block:opacity-100 transition-opacity duration-200 pointer-events-none">
                Product Details
              </div>
              <ProductDetail product={currentProduct} settings={settings} averageRating={{ average: 5, count: 1 }} />
            </div>
          );
        }
        if (block === 'ticker') {
          if (!settings.productDetailEnableTicker || !settings.productDetailTickerText) return null;
          return (
            <div
              key="ticker"
              id="ticker"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.parent.postMessage({ type: 'select_product_detail_tab', subTab: 'ticker' }, '*');
              }}
              className="relative cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-[#e94560] hover:ring-offset-2 group/preview-block w-full overflow-hidden bg-gray-50 dark:bg-white/5 border-y border-gray-200 dark:border-gray-800 py-3.5 select-none"
            >
              <div className="absolute top-2 left-2 z-[60] bg-[#e94560] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md uppercase opacity-0 group-hover/preview-block:opacity-100 transition-opacity duration-200 pointer-events-none">
                Scrolling Ticker
              </div>
              <div className="flex animate-marquee whitespace-nowrap gap-12 text-xs font-bold text-gray-700 dark:text-gray-300">
                {settings.productDetailTickerText.split('\n').filter(Boolean).map((line, idx) => (
                  <span key={idx} className="flex items-center gap-2">
                    <span>•</span>
                    <span>{line}</span>
                  </span>
                ))}
              </div>
            </div>
          );
        }
        if (block === 'reviews') {
          return (
            <div
              key="reviews"
              id="reviews"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.parent.postMessage({ type: 'select_product_detail_tab', subTab: 'urgency' }, '*');
              }}
              className="relative cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-[#e94560] hover:ring-offset-2 group/preview-block mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
            >
              <div className="absolute top-2 left-2 z-[60] bg-[#e94560] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md uppercase opacity-0 group-hover/preview-block:opacity-100 transition-opacity duration-200 pointer-events-none">
                Reviews &amp; FAQ Feed
              </div>
              <ProductReviews
                product={currentProduct}
                reviews={[]}
                averageRating={{ average: 5, count: 1 }}
                socialProofCount={0}
              />
            </div>
          );
        }
        if (block === 'related') {
          if (settings.related_products_enabled === false) return null;
          return (
            <div
              key="related"
              id="related"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.parent.postMessage({ type: 'select_product_detail_tab', subTab: 'related' }, '*');
              }}
              className="relative cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-[#e94560] hover:ring-offset-2 group/preview-block mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-800 pt-10"
            >
              <div className="absolute top-2 left-2 z-[60] bg-[#e94560] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md uppercase opacity-0 group-hover/preview-block:opacity-100 transition-opacity duration-200 pointer-events-none">
                Related Products Grid
              </div>
              <div className="text-center md:text-left mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {settings.related_products_title || 'Related Products'}
                </h3>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
                  {settings.related_products_subtitle || 'You might also like these handpicked recommendations'}
                </p>
              </div>
              <div className={`grid gap-4 ${relatedCols}`}>
                {products.slice(0, settings.related_products_limit || 4).map(prod => (
                  <ProductCard key={prod.id} product={prod} currencySymbol={settings.currencySymbol} settings={settings} />
                ))}
              </div>
            </div>
          );
        }
        if (block === 'recently_viewed') {
          if (!settings.recently_viewed_limit || settings.recently_viewed_limit === 0) return null;
          return (
            <div
              key="recently_viewed"
              id="recently_viewed"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.parent.postMessage({ type: 'select_product_detail_tab', subTab: 'recently_viewed' }, '*');
              }}
              className="relative cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-[#e94560] hover:ring-offset-2 group/preview-block mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-800 pt-10"
            >
              <div className="absolute top-2 left-2 z-[60] bg-[#e94560] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md uppercase opacity-0 group-hover/preview-block:opacity-100 transition-opacity duration-200 pointer-events-none">
                Recently Viewed Products
              </div>
              <div className="text-center md:text-left mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {settings.recently_viewed_title || 'Recently Viewed'}
                </h3>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
                  {settings.recently_viewed_subtitle || 'Products you have recently browsed'}
                </p>
              </div>
              <div className={`grid gap-4 ${recentCols}`}>
                {products.slice(1, 1 + (settings.recently_viewed_limit || 4)).map(prod => (
                  <ProductCard key={prod.id} product={prod} currencySymbol={settings.currencySymbol} settings={settings} />
                ))}
              </div>
            </div>
          );
        }
        if (block === 'social_feed') {
          if (settings.social_feeds_enabled === false) return null;
          if (settings.social_feeds_product_enabled === false) return null;
          return (
            <div
              key="social_feed"
              id="social_feed"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.parent.postMessage({ type: 'select_product_detail_tab', subTab: 'social_feed' }, '*');
              }}
              className="relative cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-[#e94560] hover:ring-offset-2 group/preview-block"
            >
              <div className="absolute top-2 left-2 z-[60] bg-[#e94560] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md uppercase opacity-0 group-hover/preview-block:opacity-100 transition-opacity duration-200 pointer-events-none">
                Social Feed Ribbon
              </div>
              <SocialFeedRibbon settings={settings} />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
