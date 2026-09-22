'use client';

import React, { useState, useMemo } from 'react';
import { Product, Category, StoreSettings, Review, HomepageSection } from '@/lib/types';
import CategoryFilter from './CategoryFilter';
import ProductGrid from './ProductGrid';
import { useSearchStore } from '@/store/searchStore';
import { useScrollRestoration } from '@/lib/hooks/useScrollRestoration';
import { useSettings } from '@/lib/hooks/useSettings';
import {
  FlashSaleSection,
  HeroBannerSection,
  CategoryGridSection,
  SocialFeedSection,
  TickerSection,
  PromoBannerSection,
  BrandsLogosSection,
  TrustBadgesSection,
  RecentReviewsSection,
} from './store-front';
import { StoreFrontProductGridSection } from './store-front/StoreFrontProductGridSection';

interface StoreFrontProps {
  initialProducts: Product[];
  categories: Category[];
  settings: StoreSettings;
  reviews?: (Review & { productName?: string; productSlug?: string })[];
  sections?: HomepageSection[];
  isPreview?: boolean;
  activeSectionId?: string | null;
  socialProofCount?: number;
}

export default function StoreFront({
  initialProducts,
  categories,
  settings,
  reviews = [],
  sections = [],
  isPreview = false,
  activeSectionId = null,
  socialProofCount = 0,
}: StoreFrontProps) {
  const searchQuery = useSearchStore((state) => state.searchQuery);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  useScrollRestoration();

  const allProducts = initialProducts;
  const { settings: liveSettings } = useSettings(settings);
  const activeSettings = isPreview ? settings : (liveSettings ?? settings);

  const activeSections = useMemo(() => {
    if (sections && sections.length > 0) {
      return sections.filter((s) => s.active || (isPreview && s.id === activeSectionId));
    }
    return [
      { id: 'def-hero', section_type: 'hero_banner', title: 'Hero Slider', settings: {}, content_data: {}, sort_order: 1, active: true },
      { id: 'def-cats', section_type: 'category_list', title: 'Shop By Category', settings: {}, content_data: {}, sort_order: 2, active: true },
      { id: 'def-grid', section_type: 'product_grid', title: 'Featured Collection', settings: { limit: 8, columns_desktop: 4, columns_mobile: 2, source: 'all' }, content_data: {}, sort_order: 3, active: true },
      { id: 'def-trust', section_type: 'trust_badges', title: 'Our Guarantees', settings: {}, content_data: {}, sort_order: 4, active: true },
      { id: 'def-revs', section_type: 'recent_reviews', title: 'Customer Feedback', settings: { limit: 3 }, content_data: {}, sort_order: 5, active: true },
    ] as HomepageSection[];
  }, [sections, isPreview, activeSectionId]);

  // Per-section Load More limits
  const [loadMoreLimits, setLoadMoreLimits] = useState<Record<string, number>>({});

  const handleLoadMore = (sectionId: string, baseLimit: number) => {
    setLoadMoreLimits((prev) => ({
      ...prev,
      [sectionId]: (prev[sectionId] || baseLimit) + 8,
    }));
  };

  const getValidCategoryIds = (catIdOrSlug: string) => {
    const parent = categories.find((c) => c.id === catIdOrSlug || c.slug === catIdOrSlug);
    if (!parent) return [catIdOrSlug];
    return [parent.id];
  };

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allProducts.filter((product) => {
      const validCategoryIds = selectedCategoryId ? getValidCategoryIds(selectedCategoryId) : [];
      const matchesCategory =
        !selectedCategoryId ||
        validCategoryIds.includes(product.categoryId || '') ||
        product.productCategories?.some((pc) => validCategoryIds.includes(pc.categoryId));

      if (!q) return matchesCategory;

      const matchesSearch =
        product.name.toLowerCase().includes(q) ||
        (product.description && product.description.toLowerCase().includes(q)) ||
        (product.shortDescription && product.shortDescription.toLowerCase().includes(q)) ||
        (product.sku && product.sku.toLowerCase().includes(q)) ||
        (product.tags && product.tags.some((tag) => tag.toLowerCase().includes(q))) ||
        (product.category?.name && product.category.name.toLowerCase().includes(q)) ||
        (product.variants &&
          product.variants.some(
            (v) =>
              v.active &&
              ((v.color && v.color.toLowerCase().includes(q)) ||
                (v.size && v.size.toLowerCase().includes(q)) ||
                (v.material && v.material.toLowerCase().includes(q)) ||
                (v.sku && v.sku.toLowerCase().includes(q)) ||
                (v.customValue && v.customValue.toLowerCase().includes(q)))
          ));

      return matchesCategory && matchesSearch;
    });
  }, [allProducts, selectedCategoryId, searchQuery, categories]);

  const renderHeroBanner = (section: HomepageSection) => {
    return <HeroBannerSection section={section} settings={activeSettings} />;
  };

  const renderCategoryList = (section: HomepageSection) => {
    return (
      <div key={section.id} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        {section.title && (
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-3 text-center md:text-left">
            {section.title}
          </h3>
        )}
        {activeSettings.enableCategoryFilter && (
          <CategoryFilter
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />
        )}
      </div>
    );
  };

  const renderProductGrid = (section: HomepageSection) => {
    return (
      <StoreFrontProductGridSection
        key={section.id}
        section={section}
        filteredProducts={filteredProducts}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        loadMoreLimits={loadMoreLimits}
        onLoadMore={handleLoadMore}
        activeSettings={activeSettings}
        getValidCategoryIds={getValidCategoryIds}
      />
    );
  };

  if (searchQuery) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6 min-h-screen">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Search Results for: <span className="text-[#e94560]">&quot;{searchQuery}&quot;</span> ({filteredProducts.length} items)
        </h2>
        <ProductGrid products={filteredProducts} currencySymbol={activeSettings.currencySymbol} settings={activeSettings} />
      </div>
    );
  }

  return (
    <div className="pb-12 min-h-screen bg-gray-50 dark:bg-[#0f0f1b] text-gray-900 dark:text-gray-100 transition-colors duration-200 space-y-6">
      {activeSections.map((section) => {
        let content = null;
        switch (section.section_type) {
          case 'hero_banner':
            content = renderHeroBanner(section);
            break;
          case 'category_list':
            content = renderCategoryList(section);
            break;
          case 'product_grid':
            content = renderProductGrid(section);
            break;
          case 'category_grid':
          case 'collections_grid':
            content = <CategoryGridSection section={section} />;
            break;
          case 'trust_badges':
            content = <TrustBadgesSection section={section} settings={activeSettings} />;
            break;
          case 'recent_reviews':
            content = <RecentReviewsSection section={section} reviews={reviews} socialProofCount={socialProofCount} />;
            break;
          case 'promo_banner':
            content = <PromoBannerSection section={section} />;
            break;
          case 'brands_logos':
            content = <BrandsLogosSection section={section} />;
            break;
          case 'social_feed':
            content = <SocialFeedSection section={section} activeSettings={activeSettings} isPreview={isPreview} />;
            break;
          case 'ticker':
            content = <TickerSection section={section} activeSettings={activeSettings} />;
            break;
          case 'flash_sale':
            content = (
              <FlashSaleSection
                section={section}
                products={filteredProducts}
                currencySymbol={activeSettings.currencySymbol}
                settings={activeSettings}
                isPreview={isPreview}
                loadMoreLimit={loadMoreLimits[section.id]}
                onLoadMore={handleLoadMore}
              />
            );
            break;
          default:
            content = null;
        }

        if (!content) return null;

        if (isPreview) {
          const isSectionInactive = !section.active;
          return (
            <div
              key={section.id}
              id={section.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.parent.postMessage({ type: 'select_section', sectionId: section.id }, '*');
              }}
              className={`relative cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-[#e94560] hover:ring-offset-2 group/preview-section ${
                isSectionInactive ? 'opacity-60 border-2 border-dashed border-[#e94560]/45' : ''
              }`}
            >
              <div className="absolute top-2 left-2 z-[60] bg-[#e94560] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md uppercase opacity-0 group-hover/preview-section:opacity-100 transition-opacity duration-200 pointer-events-none">
                {section.title || section.section_type.replace('_', ' ')} {isSectionInactive && '(Hidden)'}
              </div>
              {isSectionInactive && (
                <div className="absolute top-2 right-2 z-[60] bg-gray-900/80 text-white text-[9px] font-extrabold px-2 py-0.5 rounded shadow-md uppercase tracking-wider pointer-events-none">
                  Hidden / Inactive Section
                </div>
              )}
              {content}
            </div>
          );
        }

        return (
          <div key={section.id} id={section.id}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
