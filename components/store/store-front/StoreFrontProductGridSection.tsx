'use client';

import React from 'react';
import Link from 'next/link';
import { Product, Category, StoreSettings, HomepageSection } from '@/lib/types';
import ProductGrid from '../ProductGrid';

interface StoreFrontProductGridSectionProps {
  section: HomepageSection;
  filteredProducts: Product[];
  categories: Category[];
  selectedCategoryId?: string;
  loadMoreLimits: Record<string, number>;
  onLoadMore: (sectionId: string, baseLimit: number) => void;
  activeSettings: StoreSettings;
  getValidCategoryIds: (catIdOrSlug: string) => string[];
}

export function StoreFrontProductGridSection({
  section,
  filteredProducts,
  categories,
  selectedCategoryId,
  loadMoreLimits,
  onLoadMore,
  activeSettings,
  getValidCategoryIds,
}: StoreFrontProductGridSectionProps) {
  const baseLimit = section.settings?.limit ?? 8;
  const source = section.settings?.source ?? 'all';
  const sortMethod = section.settings?.sortMethod || (source === 'featured' ? 'featured' : 'all');
  const manualProductIds: string[] = section.settings?.manualProductIds || [];
  const effectiveLimit = loadMoreLimits[section.id] || baseLimit;
  const bottomEnableViewAll = section.settings?.bottomEnableViewAll === true;
  const bottomEnableLoadMore = section.settings?.bottomEnableLoadMore === true;
  const bottomEnableInfiniteScroll = section.settings?.bottomEnableInfiniteScroll === true;


  const sectionProducts = React.useMemo(() => {
    let prodList = filteredProducts;

    if (sortMethod === 'manual' && manualProductIds.length > 0) {
      return manualProductIds
        .map((id) => filteredProducts.find((p) => p.id === id))
        .filter((p): p is Product => !!p);
    }

    if (sortMethod === 'featured' || source === 'featured') {
      prodList = prodList.filter((p) => p.is_featured);
    } else if (sortMethod === 'category' && source !== 'all' && source !== 'featured') {
      const validSourceIds = getValidCategoryIds(source);
      prodList = prodList.filter(
        (p) =>
          validSourceIds.includes(p.category_id || '') ||
          p.category?.slug === source ||
          p.product_categories?.some((pc) => validSourceIds.includes(pc.category_id))
      );
    } else if (selectedCategoryId) {
      const validCategoryIds = getValidCategoryIds(selectedCategoryId);
      prodList = prodList.filter(
        (p) =>
          validCategoryIds.includes(p.category_id || '') ||
          p.product_categories?.some((pc) => validCategoryIds.includes(pc.category_id))
      );
    } else if (source !== 'all' && source !== 'featured') {
      const validSourceIds = getValidCategoryIds(source);
      prodList = prodList.filter(
        (p) =>
          validSourceIds.includes(p.category_id || '') ||
          p.category?.slug === source ||
          p.product_categories?.some((pc) => validSourceIds.includes(pc.category_id))
      );
    }

    if (sortMethod === 'recent') {
      prodList = [...prodList].sort(
        (a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      );
    } else if (sortMethod === 'oldest') {
      prodList = [...prodList].sort(
        (a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
      );
    } else if (sortMethod === 'price_low') {
      prodList = [...prodList].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    } else if (sortMethod === 'price_high') {
      prodList = [...prodList].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    } else if (sortMethod === 'a_to_z') {
      prodList = [...prodList].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortMethod === 'z_to_a') {
      prodList = [...prodList].sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    }

    return prodList;
  }, [filteredProducts, sortMethod, manualProductIds, source, selectedCategoryId, getValidCategoryIds]);

  const displayProducts = React.useMemo(() => {
    if (effectiveLimit >= sectionProducts.length) {
      return sectionProducts;
    }
    const cols = Number(section.settings?.columns_desktop) || 4;
    let targetCount = effectiveLimit;
    if (cols > 1 && sectionProducts.length > effectiveLimit) {
      const remainder = effectiveLimit % cols;
      if (remainder !== 0) {
        const nextMultiple = effectiveLimit + (cols - remainder);
        if (sectionProducts.length >= nextMultiple) {
          targetCount = nextMultiple;
        } else {
          targetCount = Math.floor(effectiveLimit / cols) * cols;
        }
      }
    }
    if (targetCount <= 0) targetCount = effectiveLimit;
    return sectionProducts.slice(0, targetCount);
  }, [sectionProducts, effectiveLimit, section.settings?.columns_desktop]);

  const viewAllLink = (() => {
    if (section.settings?.viewAllUrl) {
      return section.settings.viewAllUrl;
    }
    const linkSource = sortMethod === 'manual' ? null : source;
    if (linkSource && linkSource !== 'all' && linkSource !== 'featured') {
      const cat = categories.find((c) => c.id === linkSource || c.slug === linkSource);
      if (cat) {
        return `/shop?category=${cat.slug}`;
      }
    }
    return '/shop';
  })();

  const hasMore = displayProducts.length < sectionProducts.length;

  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  const isTriggeringRef = React.useRef(false);

  React.useEffect(() => {
    isTriggeringRef.current = false;
  }, [effectiveLimit]);

  React.useEffect(() => {
    if (!bottomEnableInfiniteScroll || !hasMore) return;
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isTriggeringRef.current && typeof onLoadMore === 'function' && section?.id) {
          isTriggeringRef.current = true;
          onLoadMore(section.id, baseLimit);
        }
      },
      { rootMargin: '250px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [bottomEnableInfiniteScroll, hasMore, onLoadMore, section?.id, baseLimit]);

  return (
    <div key={section.id} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      {((section.title && section.settings?.show_title !== false) || section.settings?.show_upper_view_all !== false) && !selectedCategoryId && (
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 mb-5">
          {section.title && section.settings?.show_title !== false ? (
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-gray-900 dark:text-white font-heading">
              {section.title}
            </h2>
          ) : <div />}
          {section.settings?.show_upper_view_all !== false && (
            <Link
              href={viewAllLink}
              style={{ color: 'var(--color-primary, #C2185B)' }}
              className="text-xs font-bold hover:underline"
            >
              {section.settings?.viewAllText || 'View All'}
            </Link>
          )}
        </div>
      )}
      <ProductGrid
        products={displayProducts}
        currencySymbol={activeSettings.currency_symbol}
        settings={activeSettings}
        columnsDesktop={Number(section.settings?.columns_desktop) || 4}
        columnsTablet={Number(section.settings?.columns_tablet) || 3}
        columnsMobile={Number(section.settings?.columns_mobile) || 2}
      />
      {bottomEnableInfiniteScroll && hasMore && (
        <div ref={sentinelRef} className="w-full flex items-center justify-center py-6">
          <div className="flex items-center gap-2.5 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-800 shadow-2xs">
            <span className="w-4 h-4 rounded-full border-2 border-[#e94560] border-t-transparent animate-spin" />
            <span>Loading more products...</span>
          </div>
        </div>
      )}

      {((!bottomEnableInfiniteScroll && bottomEnableLoadMore && hasMore) || bottomEnableViewAll) && (
        <div className="w-full flex items-center justify-center gap-3 mt-6 md:mt-8 px-4">
          {!bottomEnableInfiniteScroll && bottomEnableLoadMore && hasMore && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onLoadMore(section.id, baseLimit);
              }}
              className="px-5 py-2.5 text-xs md:text-sm font-semibold tracking-wide uppercase rounded-full transition-all duration-200 shadow-sm active:scale-95 hover:brightness-90 cursor-pointer select-none touch-manipulation relative z-10"
              style={{
                backgroundColor: section.settings?.bottomLoadMoreBgColor || 'var(--color-surface, #f1f5f9)',
                color: section.settings?.bottomLoadMoreTextColor || 'var(--color-text-primary, #1e293b)',
                borderRadius: 'var(--border-radius-btn, 9999px)',
              }}
            >
              {section.settings?.bottomLoadMoreText || 'Load More'}
            </button>
          )}
          {bottomEnableViewAll && (
            <Link
              href={section.settings?.bottomViewAllUrl || viewAllLink}
              prefetch={true}
              className="px-5 py-2.5 text-xs md:text-sm font-semibold tracking-wide uppercase rounded-full transition-all duration-200 shadow-sm active:scale-95 hover:brightness-90 select-none touch-manipulation relative z-10"
              style={{
                backgroundColor: section.settings?.bottomViewAllBgColor || 'var(--btn-primary-bg, var(--color-primary, #0F2A5E))',
                color: section.settings?.bottomViewAllTextColor || 'var(--btn-primary-text, #ffffff)',
                borderRadius: 'var(--border-radius-btn, 9999px)',
              }}
            >
              {section.settings?.bottomViewAllText || 'View All'}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
