'use client';

import React, { useRef, useEffect, useState } from 'react';
import { SlidersHorizontal, X, ChevronDown } from '@/components/common/Icons';
import { Product, Category, Collection, StoreSettings } from '@/lib/types';
import ProductCard from './ProductCard';
import EmptyState from '../common/EmptyState';
import Pagination from '@/components/common/Pagination';
import { Modal } from '@/components/common/Modal';
import {
  ShopProductListCard,
  ShopPageHeader,
  ShopPageControls,
  ShopPageSidebar,
  useShopPageFilters,
  getSortLabel,
} from './shop-page';
import { getCatalogGridStyle, getContentWidthClass, CATALOG_SECTION_PADDING } from '@/lib/utils/responsiveGrid';
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
    tabletColsOverride,
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
    paginationMode,
    currentPage,
    totalPages,
    handleGoToPage,
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

  // Mobile filter drawer scroll-lock is handled by the shared Modal (RULE MODAL1).

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
    if (paginationMode !== 'infinite' || !hasMore) return;
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
  }, [paginationMode, hasMore, handleLoadMore]);

  // SSOT: shared catalog grid (RULE DS24 / RULE SSOT-CATALOG-LAYOUTS) — never hardcode columns/gap.
  const sidebarPosition = activeSettings?.shop_sidebar_position || 'left';
  const sidebarSticky = activeSettings?.shop_sidebar_sticky !== false;
  const shopGrid = getCatalogGridStyle({
    mode: activeSettings?.shop_columns_mode || 'manual',
    mobile: activeSettings?.shop_columns_mobile || (activeSettings?.card_mobile_columns === 1 ? 1 : 2),
    tablet: tabletColsOverride ?? activeSettings?.shop_columns_tablet ?? 3,
    desktop: desktopColsOverride ?? activeSettings?.shop_columns_desktop ?? 4,
    wide: activeSettings?.shop_columns_wide,
    minDesktop: activeSettings?.shop_min_card_desktop,
    gap: activeSettings?.shop_grid_gap,
  });

  return (
    <div className={`mx-auto ${getContentWidthClass(activeSettings?.shop_content_width)} ${CATALOG_SECTION_PADDING} py-6 sm:py-8 transition-colors duration-200`}>
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

      {/* Main Grid: Sidebar + List Content. Sidebar position (left/right/drawer),
          sticky, and which blocks show are all Customizer-controlled. */}
      <div className={`flex flex-col md:flex-row gap-6 lg:gap-8 ${sidebarPosition === 'right' ? 'md:flex-row-reverse' : ''}`}>
        {/* Desktop Sidebar — FIXED width (never a %), optional sticky, grid fills the rest.
            Hidden entirely in 'drawer' mode (filters open via the Filters button). */}
        {sidebarPosition !== 'drawer' && (
          <aside className={`hidden md:block w-60 lg:w-64 xl:w-72 shrink-0 bg-white dark:bg-[#16162a] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm self-start overflow-y-auto overscroll-contain transition-colors pr-2.5 pb-24 scrollbar-thin ${sidebarSticky ? 'sticky top-24 max-h-[calc(100vh-7rem)]' : ''}`}>
            <ShopPageSidebar {...sidebarProps} />
          </aside>
        )}

        {/* Right Main Content — min-w-0 so the grid never gets cut off by the flex row */}
        <div className="flex-1 min-w-0 space-y-4">
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
            showDesktopFilterButton={sidebarPosition === 'drawer'}
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
            <div className={shopGrid.className} data-mode={shopGrid.mode} style={shopGrid.style}>
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

          {/* Infinite scroll sentinel */}
          {paginationMode === 'infinite' && hasMore && (
            <div ref={sentinelRef} className="w-full flex items-center justify-center py-8">
              <div className="flex items-center gap-2.5 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-800 shadow-2xs">
                <span className="w-4 h-4 rounded-full border-2 border-[#e94560] border-t-transparent animate-spin" />
                <span>Loading more products...</span>
              </div>
            </div>
          )}

          {/* Load More button */}
          {paginationMode === 'load_more' && hasMore && (
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
                {activeSettings?.shop_load_more_text || 'Load More'} ({totalResults - displayProducts.length} remaining)
              </button>
            </div>
          )}

          {/* Numbered pagination */}
          {paginationMode === 'numbered' && totalPages > 1 && (
            <div className="w-full mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handleGoToPage}
                activeBg={activeSettings?.shop_load_more_bg}
                activeTextColor={activeSettings?.shop_load_more_text_color}
              />
            </div>
          )}

          {/* View All button (optional) */}
          {activeSettings?.shop_enable_view_all && (
            <div className="w-full flex items-center justify-center mt-6">
              <a
                href={activeSettings?.shop_view_all_url || '/shop'}
                style={{
                  backgroundColor: activeSettings?.shop_view_all_bg || 'var(--btn-primary-bg, var(--color-primary, #0F2A5E))',
                  color: activeSettings?.shop_view_all_text_color || '#ffffff',
                  borderRadius: 'var(--border-radius-btn, 9999px)',
                }}
                className="px-8 py-3 text-sm font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                {activeSettings?.shop_view_all_text || 'View All'}
              </a>
            </div>
          )}

          {/* End of results */}
          {!hasMore && paginationMode !== 'numbered' && displayProducts.length > 0 && displayProducts.length === totalResults && totalResults > 0 && (
            <div className="w-full text-center mt-6 text-xs font-semibold text-gray-400">
              You&apos;ve seen all {totalResults} products
            </div>
          )}
        </div>
      </div>

      {/* MOBILE FILTER DRAWER SHEET — shared overlay system (RULE MODAL1) */}
      <Modal
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        variant="drawer-left"
        ariaLabel="Product filters"
        showClose={false}
        footer={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => { handleClearFilters(); }}
              className="shrink-0 px-4 py-3.5 text-xs font-black uppercase tracking-wider rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors active:scale-95 cursor-pointer min-h-11"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setMobileFilterOpen(false)}
              style={{
                backgroundColor: 'var(--btn-primary-bg, var(--color-primary, #C2185B))',
                color: 'var(--btn-primary-text, #ffffff)',
                borderRadius: 'var(--border-radius-btn, 12px)',
              }}
              className="flex-1 text-center py-3.5 text-xs font-black uppercase tracking-wider transition-transform active:scale-95 shadow-md cursor-pointer min-h-11"
            >
              Show {totalResults} {totalResults === 1 ? 'result' : 'results'}
            </button>
          </div>
        }
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <span className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-sm flex items-center gap-1.5">
            <SlidersHorizontal className="h-4 w-4 text-[#e94560]" />
            <span>Filters</span>
          </span>
          <button
            type="button"
            onClick={() => setMobileFilterOpen(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer p-1 min-h-11 min-w-11 flex items-center justify-center"
            title="Close Filters"
            aria-label="Close filters"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-4 touch-pan-y">
          <ShopPageSidebar {...sidebarProps} />
        </div>
      </Modal>
    </div>
  );
}
