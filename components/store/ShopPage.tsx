'use client';

import React, { useRef, useEffect } from 'react';
import { SlidersHorizontal, X } from '@/components/common/Icons';
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
    viewMode,
    setViewMode,
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

  useEffect(() => {
    if (!activeSettings?.shop_infinite_scroll || !hasMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [activeSettings?.shop_infinite_scroll, hasMore, handleLoadMore]);

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
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scrollbar-none touch-pan-x -mx-1 px-1">
              <button
                type="button"
                onClick={() => handleCategorySelect(undefined)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer select-none ${
                  !selectedCategoryId
                    ? 'bg-[#e94560] text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                All Products
              </button>
              {displayCategories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id || selectedCategoryId === cat.slug;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(isSelected ? undefined : cat.id)}
                    className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer select-none ${
                      isSelected
                        ? 'bg-[#e94560] text-white shadow-xs'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
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
          />

          {/* Catalog Listing */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white dark:bg-[#16162a] p-10 rounded-2xl border border-gray-200 dark:border-gray-800 text-center shadow-sm">
              <EmptyState />
              <button
                onClick={handleClearFilters}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#e94560] text-white px-5 py-2.5 text-xs font-bold transition-transform active:scale-95 shadow-md cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : viewMode === 'list' ? (
            <div className="flex flex-col gap-4">
              {displayProducts.map((product: Product) => (
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
              className={`grid gap-4 ${getResponsiveGridClasses({
                mobile: activeSettings?.shop_columns_mobile || (activeSettings?.card_mobile_columns === 1 ? 1 : 2),
                tablet: activeSettings?.shop_columns_tablet || (viewMode === 'grid-3' ? 2 : 3),
                desktop: activeSettings?.shop_columns_desktop || (viewMode === 'grid-3' ? 3 : 4),
              })}`}
            >
              {displayProducts.map((product: Product, index: number) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currencySymbol={activeSettings.currencySymbol}
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
                  className="px-8 py-3 text-sm font-bold uppercase tracking-wider rounded-full bg-[#e94560] text-white hover:bg-[#d8344f] hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-sm cursor-pointer select-none touch-manipulation relative z-10"
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
                className="w-full text-center bg-[#1a1a2e] dark:bg-[#e94560] text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-transform active:scale-95 shadow-md cursor-pointer"
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
