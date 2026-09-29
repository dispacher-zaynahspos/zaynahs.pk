'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Search, X } from '@/components/common/Icons';
import { Product, StoreSettings, NavigationItem } from '@/lib/types';

interface NavbarSearchModalProps {
  mounted: boolean;
  searchOpen: boolean;
  isAdmin: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setSearchOpen: (open: boolean) => void;
  handleCloseSearch: () => void;
  products: Product[];
  loading: boolean;
  suggestions: Product[];
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  settings?: StoreSettings;
  router: any;
}

/** Flatten the navigation menu into a single list of collection/category entries. */
function flattenNav(items: NavigationItem[] = [], acc: NavigationItem[] = []): NavigationItem[] {
  for (const item of items) {
    if (item?.label && item?.url) acc.push(item);
    if (item.children && item.children.length > 0) flattenNav(item.children, acc);
  }
  return acc;
}

/** Find the first variant field (color/size/material/sku) that matches the query — for an inline hint. */
function matchedVariantHint(product: Product, q: string): string | null {
  if (!q || !product.variants) return null;
  for (const v of product.variants) {
    if (!v.active) continue;
    if (v.color && v.color.toLowerCase().includes(q)) return v.color;
    if (v.size && v.size.toLowerCase().includes(q)) return `Size ${v.size}`;
    if (v.material && v.material.toLowerCase().includes(q)) return v.material;
    if (v.sku && v.sku.toLowerCase().includes(q)) return `SKU ${v.sku}`;
    if (v.custom_value && v.custom_value.toLowerCase().includes(q)) return v.custom_value;
  }
  return null;
}

export default function NavbarSearchModal({
  mounted,
  searchOpen,
  isAdmin,
  searchQuery,
  setSearchQuery,
  setSearchOpen,
  handleCloseSearch,
  products,
  loading,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  searchInputRef,
  containerRef,
  settings,
  router,
}: NavbarSearchModalProps) {
  if (!mounted || !searchOpen || isAdmin) return null;

  const q = searchQuery.toLowerCase().trim();
  const hasQuery = q.length > 0;

  // Collections & Categories come from the already-loaded navigation menu (no extra DB reads).
  const allNav = flattenNav(settings?.navigation_menu ?? []);
  const navMatches = hasQuery
    ? allNav.filter((item) => item.label.toLowerCase().includes(q)).slice(0, 5)
    : [];

  const hasResults = navMatches.length > 0 || suggestions.length > 0;

  // Popular searches: admin-configured, else real top-level collections/categories (never hardcoded fashion terms).
  const popularTerms = settings?.popular_searches
    ? settings.popular_searches.split(',').map((s) => s.trim()).filter(Boolean)
    : (settings?.navigation_menu ?? []).map((i) => i.label).filter(Boolean).slice(0, 6);

  const goToShop = () => {
    setShowSuggestions(false);
    setSearchOpen(false);
    router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
  };

  const sectionLabel = 'text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500';

  return createPortal(
    <div className="fixed inset-0 z-[150] bg-black/75 flex items-start justify-center pt-20 sm:pt-24 px-4 pb-4 transition-all duration-300 animate-fade-in overscroll-contain">
      <div
        ref={containerRef}
        className="bg-white dark:bg-[#16162a] w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl relative scale-up transition-all will-change-transform overflow-hidden"
      >
        {/* Header + input (fixed) */}
        <div className="p-5 sm:p-6 pb-3 sm:pb-4 border-b border-gray-100 dark:border-gray-800/70">
          <div className="flex items-start justify-between mb-4 pr-8">
            <div>
              <h3 className="text-base font-black text-gray-900 dark:text-white">Search</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold mt-0.5">
                Products, collections, categories &amp; variations
              </p>
            </div>
            <button
              type="button"
              onClick={handleCloseSearch}
              className="absolute top-5 right-5 sm:top-6 sm:right-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Single search control — input + one primary button (no duplicate magnifier) */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    e.preventDefault();
                    goToShop();
                  }
                }}
                placeholder="Search products, collections, categories..."
                className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/90 dark:bg-[#0f0f1b] py-3.5 pl-4 pr-10 text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none focus:ring-4 focus:ring-[#e94560]/10 transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => searchQuery.trim() && goToShop()}
              className="rounded-2xl bg-[#e94560] hover:bg-[#d8344f] px-5 flex items-center justify-center text-white transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
              title="Search"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable body — results are never cut off */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-6 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]">
          {/* Empty state: popular searches + recommended */}
          {!hasQuery && (
            <div className="space-y-6">
              {popularTerms.length > 0 && (
                <div className="space-y-3">
                  <span className={sectionLabel}>Popular Searches</span>
                  <div className="flex flex-wrap gap-2">
                    {popularTerms.map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                          setSearchQuery(term);
                          setShowSuggestions(true);
                          searchInputRef.current?.focus();
                        }}
                        className="px-3.5 py-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-[#e94560] hover:text-white dark:hover:bg-[#e94560] text-gray-600 dark:text-gray-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {products.length > 0 && (
                <div className="space-y-3">
                  <span className={sectionLabel}>Recommended For You</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {products
                      .filter((p) => p.is_featured)
                      .concat(products.filter((p) => !p.is_featured))
                      .slice(0, 4)
                      .map((product) => {
                        const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];
                        return (
                          <Link
                            key={product.id}
                            href={`/product/${product.slug}`}
                            onClick={() => setSearchOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-[#1d1d36] border border-transparent hover:border-gray-100 dark:hover:border-gray-800 transition-colors cursor-pointer group"
                          >
                            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                              {primaryImage ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={primaryImage.url} alt={product.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-[10px] text-gray-400">No Img</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-[#e94560] transition-colors">
                                {product.name}
                              </h4>
                              <p className="text-[10px] font-black text-gray-900 dark:text-white mt-0.5">
                                Rs. {product.price.toLocaleString()}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Query results — grouped and labeled by type */}
          {hasQuery && showSuggestions && (
            <div className="space-y-5">
              {loading ? (
                <div className="px-4 py-8 text-xs text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center gap-3">
                  <div className="w-6 h-6 rounded-full border-2 border-[#e94560] border-t-transparent animate-spin" />
                  <span className="font-semibold">Searching shop...</span>
                </div>
              ) : hasResults ? (
                <>
                  {/* Collections & Categories */}
                  {navMatches.length > 0 && (
                    <div className="space-y-1.5">
                      <div className={sectionLabel}>Collections &amp; Categories ({navMatches.length})</div>
                      {navMatches.map((item) => (
                        <Link
                          key={item.id}
                          href={item.url}
                          onClick={() => setSearchOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                        >
                          <div className="h-9 w-9 flex-shrink-0 rounded-xl bg-[#e94560]/10 text-[#e94560] flex items-center justify-center">
                            <Search className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-[#e94560] transition-colors">
                              {item.label}
                            </h4>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Collection / Category</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Products (with variation hints) */}
                  {suggestions.length > 0 && (
                    <div className="space-y-1.5">
                      <div className={sectionLabel}>Products ({suggestions.length})</div>
                      {suggestions.map((product) => {
                        const primaryImage = product.images.find((img) => img.is_primary) || product.images[0];
                        const variantHint = matchedVariantHint(product, q);
                        return (
                          <Link
                            key={product.id}
                            href={`/product/${product.slug}`}
                            onClick={() => setSearchOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                          >
                            <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-800">
                              {primaryImage ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={primaryImage.url} alt={product.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-[10px] text-gray-400">No Img</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-[#e94560] transition-colors">
                                {product.name}
                              </h4>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5 flex items-center gap-1.5 flex-wrap">
                                <span>{product.category?.name || 'Uncategorized'}</span>
                                {variantHint && (
                                  <span className="uppercase font-mono bg-[#e94560]/10 text-[#e94560] px-1 rounded">{variantHint}</span>
                                )}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="text-xs font-black text-gray-900 dark:text-white">
                                Rs. {product.price.toLocaleString()}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  <button
                    onClick={goToShop}
                    className="w-full text-center text-xs font-black text-[#e94560] hover:underline py-2 cursor-pointer"
                  >
                    View all results for "{searchQuery}"
                  </button>
                </>
              ) : (
                <div className="px-4 py-8 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">No results found</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                    Try another product, collection, category, variant, or color
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
