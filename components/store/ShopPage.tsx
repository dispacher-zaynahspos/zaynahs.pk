'use client';

import React, { useRef, useEffect, useState } from 'react';
import { SlidersHorizontal, X, ChevronDown } from '@/components/common/Icons';
import { Product, Category, Collection, StoreSettings } from '@/lib/types';
import ProductCard from './ProductCard';
import EmptyState from '../common/EmptyState';
import {
  ShopProductListCard,
  ShopPageHeader,
  ShopPageControls,
  ShopPageSidebar,
  useShopPageFilters,
  getSortLabel,
} from './shop-page';
import { getResponsiveGridClasses } from '@/lib/utils/responsiveGrid';
import { useScrollRestoration } from '@/lib/hooks/useScrollRestoration';

interface ShopPageProps {
  initialProducts: Product[];
  categories: Category[];
  collections?: Collection[];
  settings: StoreSettings;
  isPreview?: boolean;
}

export default function ShopPage({
  initialProducts,
  categories,
  collections = [],
  settings,
  isPreview = false,
}: ShopPageProps) {
  useScrollRestoration();
  const {
    addItem,
    searchParams,
    displayCategories,
    activeCategory,
    activeCollection,
    selectedCategoryId,
    searchQuery,
    setSearchQuery,
    sortBy,
    defaultSort,
    viewMode,
    setViewMode,
    desktopColsOverride,
    isCollectionDescExpanded,
    setIsCollectionDescExpanded,
    isCategoryDescExpanded,
    setIsCategoryDescExpanded,
    activeSettings,
    mobileFilterOpen,
    setMobileFilterOpen,
    availability,
    priceMin,
    priceMax,
    priceLimits,
    selectedColors,
    setSelectedColors,
    selectedSizes,
    setSelectedSizes,
    selectedMaterials,
    setSelectedMaterials,
    handleCategorySelect,
    filteredProducts,
    displayProducts,
    totalResults,
    hasMore,
    handleSortChange,
    handleAvailabilityChange,
    removeSortPill,
    removePricePill,
    handleLoadMore,
    handleClearFilters,
    sidebarProps,
  } = useShopPageFilters({
    initialProducts,
    categories,
    collections,
    settings,
    isPreview,
  });

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const CATEGORY_LIMIT = 8;
  const [moreCategoriesOpen, setMoreCategoriesOpen] = useState(false);

  // Auto-expand if the currently active/selected category is beyond the initial limit
  useEffect(() => {
    if (selectedCategoryId) {
      const activeIdx = displayCategories.findIndex(
        (c) => c.id === selectedCategoryId || c.slug === selectedCategoryId
      );
      if (activeIdx >= CATEGORY_LIMIT) {
        setMoreCategoriesOpen(true);
      }
    }
  }, [selectedCategoryId, displayCategories]);

  const visibleCategories = moreCategoriesOpen
    ? displayCategories
    : displayCategories.slice(0, CATEGORY_LIMIT);

  const isShopLoadingRef = useRef(false);

  useEffect(() => {
    isShopLoadingRef.current = false;
  }, [displayProducts.length]);

  useEffect(() => {
    if (!activeSettings?.shop_infinite_scroll || !hasMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isShopLoadingRef.current) {
          isShopLoadingRef.current = true;
          handleLoadMore();
        }
      },
      { rootMargin: '250px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [activeSettings?.shop_infinite_scroll, hasMore, handleLoadMore]);

  const gridGapClass = activeSettings?.shop_grid_gap === 'tight' ? 'gap-2'
    : activeSettings?.shop_grid_gap === 'relaxed' ? 'gap-6'
    : 'gap-4';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 transition-colors duration-200">
      {/* Header Banner & Breadcrumbs */}
      <ShopPageHeader
        activeCategory={activeCategory}
        activeCollection={activeCollection}
        isCollectionDescExpanded={isCollectionDescExpanded}
        setIsCollectionDescExpanded={setIsCollectionDescExpanded}
        isCategoryDescExpanded={isCategoryDescExpanded}
        setIsCategoryDescExpanded={setIsCategoryDescExpanded}
        handleCategorySelect={handleCategorySelect}
        showBreadcrumbs={activeSettings?.shop_show_breadcrumbs !== false}
      />

      {/* Main Grid: Sidebar + List Content */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Desktop Sidebar with independent scroll & sticky position */}
        <aside className="hidden md:block w-64 shrink-0 bg-white dark:bg-[#16162a] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm self-start sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto overscroll-contain transition-colors pr-2.5 scrollbar-thin">
          <ShopPageSidebar {...sidebarProps} />
        </aside>

        {/* Right Main Content */}
        <div className="flex-1 space-y-4">
          {/* Quick Category Chips Bar */}
          {activeSettings?.shop_category_chips_enabled !== false && displayCategories.length > 0 && (
            <div className="flex items-center gap-2 py-1 overflow-x-auto md:flex-wrap scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

              <button
                type="button"
                onClick={() => handleCategorySelect(undefined)}
                style={
                  !selectedCategoryId
                    ? {
                        backgroundColor: 'var(--btn-primary-bg, var(--color-primary, #C2185B))',
                        color: 'var(--btn-primary-text, #ffffff)',
                      }
                    : undefined
                }
                className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer select-none ${
                  !selectedCategoryId
                    ? 'text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                All Products
              </button>
              {visibleCategories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id || selectedCategoryId === cat.slug;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(isSelected ? undefined : cat.id)}
                    style={
                      isSelected
                        ? {
                            backgroundColor: 'var(--btn-primary-bg, var(--color-primary, #C2185B))',
                            color: 'var(--btn-primary-text, #ffffff)',
                          }
                        : undefined
                    }
                    className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer select-none ${
                      isSelected
                        ? 'text-white shadow-xs'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}

              {displayCategories.length > CATEGORY_LIMIT && (
                <button
                  type="button"
                  onClick={() => setMoreCategoriesOpen((prev) => !prev)}
                  className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer select-none ${
                    moreCategoriesOpen
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  aria-expanded={moreCategoriesOpen}
                >
                  <span>{moreCategoriesOpen ? 'Show Less' : `+ More (${displayCategories.length - CATEGORY_LIMIT})`}</span>
                  <ChevronDown
                    className={`h-3 w-3 transition-transform duration-200 ${
                      moreCategoriesOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              )}
            </div>
          )}

          {/* Top Controls Bar & Filter Pills */}
          <ShopPageControls
            displayProductsCount={displayProducts.length}
            totalResults={totalResults}
            viewMode={viewMode}
            setViewMode={setViewMode}
            sortBy={sortBy}
            handleSortChange={handleSortChange}
            onOpenMobileFilter={() => setMobileFilterOpen(true)}
            selectedCategoryId={selectedCategoryId}
            displayCategories={displayCategories}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            availability={availability}
            handleAvailabilityChange={handleAvailabilityChange}
            priceMin={priceMin}
            priceMax={priceMax}
            priceLimits={priceLimits}
            removePricePill={removePricePill}
            removeSortPill={removeSortPill}
            selectedColors={selectedColors}
            setSelectedColors={setSelectedColors}
            selectedSizes={selectedSizes}
            setSelectedSizes={setSelectedSizes}
            selectedMaterials={selectedMaterials}
            setSelectedMaterials={setSelectedMaterials}
            handleClearFilters={handleClearFilters}
            handleCategorySelect={handleCategorySelect}
            hasSortParam={searchParams.has('sort')}
            getSortLabel={getSortLabel}
            defaultSort={defaultSort}
          />

          {/* Catalog Listing */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white dark:bg-[#16162a] p-10 rounded-2xl border border-gray-200 dark:border-gray-800 text-center shadow-sm">
              <EmptyState />
              <button
                onClick={handleClearFilters}
                style={{
                  backgroundColor: 'var(--btn-primary-bg, var(--color-primary, #C2185B))',
                  color: 'var(--btn-primary-text, #ffffff)',
                  borderRadius: 'var(--border-radius-btn, 12px)',
                }}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold transition-transform active:scale-95 shadow-md cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : viewMode === 'list' ? (
            <div className="flex flex-col gap-4">
              {displayProducts.map((product: Product | import('@/lib/services/product-search').ProductSearchResult) => (
                <ShopProductListCard
                  key={product.id}
                  product={product}
                  settings={activeSettings}
                  addItem={addItem}
                />
              ))}
            </div>
          ) : (
            <div
              className={`grid ${gridGapClass} ${getResponsiveGridClasses({
                mobile: activeSettings?.shop_columns_mobile || (activeSettings?.card_mobile_columns === 1 ? 1 : 2),
                tablet: viewMode === 'grid-3' ? 2 : (activeSettings?.shop_columns_tablet || 3),
                desktop: viewMode === 'grid-3' ? 3 : viewMode === 'grid-4' ? 4 : (desktopColsOverride ?? activeSettings?.shop_columns_desktop ?? 4),
              })}`}
            >
              {displayProducts.map((product: Product | import('@/lib/services/product-search').ProductSearchResult, index: number) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currencySymbol={activeSettings.currency_symbol}
                  settings={activeSettings}
                  priority={index < 6}
                />
              ))}
            </div>
          )}

          {hasMore && (
            activeSettings?.shop_infinite_scroll ? (
              <div ref={sentinelRef} className="w-full flex items-center justify-center py-8">
                <div className="flex items-center gap-2.5 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-800 shadow-2xs">
                  <span className="w-4 h-4 rounded-full border-2 border-[#e94560] border-t-transparent animate-spin" />
                  <span>Loading more products...</span>
                </div>
              </div>
            ) : (
              <div className="w-full flex items-center justify-center mt-8">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLoadMore();
                  }}
                  style={{
                    backgroundColor: activeSettings?.shop_load_more_bg || 'var(--btn-primary-bg, var(--color-primary, #0F2A5E))',
                    color: activeSettings?.shop_load_more_text_color || 'var(--btn-primary-text, #ffffff)',
                    borderRadius: 'var(--border-radius-btn, 9999px)',
                  }}
                  className="px-8 py-3 text-sm font-bold uppercase tracking-wider hover:brightness-110 hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-sm cursor-pointer select-none touch-manipulation relative z-10"
                >
                  Load More ({totalResults - displayProducts.length} remaining)
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {/* MOBILE FILTER DRAWER SHEET */}
      {mobileFilterOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex justify-end transition-all duration-300 animate-fade-in"
          onClick={() => setMobileFilterOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#16162a] w-4/5 max-w-xs h-[100dvh] shadow-2xl relative flex flex-col overflow-hidden scale-up duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <span className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-sm flex items-center gap-1.5">
                <SlidersHorizontal className="h-4 w-4 text-[#e94560]" />
                <span>Filters</span>
              </span>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer p-1"
                title="Close Filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y px-5 py-4">
              <ShopPageSidebar {...sidebarProps} />
            </div>

            <div className="px-5 pb-5 pt-3 border-t border-gray-100 dark:border-gray-800 shrink-0">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                style={{
                  backgroundColor: 'var(--btn-primary-bg, var(--color-primary, #C2185B))',
                  color: 'var(--btn-primary-text, #ffffff)',
                  borderRadius: 'var(--border-radius-btn, 12px)',
                }}
                className="w-full text-center py-3.5 text-xs font-black uppercase tracking-wider transition-transform active:scale-95 shadow-md cursor-pointer"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
