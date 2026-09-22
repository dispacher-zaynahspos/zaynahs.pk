'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Search, X } from '@/components/common/Icons';
import { Product, StoreSettings } from '@/lib/types';

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

  return createPortal(
    <div className="fixed inset-0 z-[150] bg-black/75 flex items-start justify-center pt-24 px-4 transition-all duration-300 animate-fade-in overscroll-contain">
      <div ref={containerRef} className="bg-white dark:bg-[#16162a] w-full max-w-2xl rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6 relative scale-up transition-all will-change-transform">

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-4 pr-8">
          <div>
            <h3 className="text-base font-black text-gray-900 dark:text-white">Search Products</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold mt-0.5">Find products, categories, colors, sizes instantly</p>
          </div>
          <button
            type="button"
            onClick={handleCloseSearch}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Input field */}
        <div className="relative mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
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
                if (e.key === 'Enter') {
                  e.preventDefault();
                  setShowSuggestions(false);
                  setSearchOpen(false);
                  router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
                }
              }}
              placeholder="Type name, category, color, size, sku..."
              className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/90 dark:bg-[#0f0f1b] py-3.5 pl-12 pr-12 text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none focus:ring-4 focus:ring-[#e94560]/10 transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              if (searchQuery.trim()) {
                setShowSuggestions(false);
                setSearchOpen(false);
                router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
              }
            }}
            className="rounded-2xl bg-[#e94560] hover:bg-[#d8344f] px-5 flex items-center justify-center text-white transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
            title="Search"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>

        {/* Popular Searches when empty */}
        {searchQuery.trim().length === 0 && (
          <div className="space-y-3 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Popular Searches</span>
            <div className="flex flex-wrap gap-2">
              {(settings?.popularSearches
                ? settings.popularSearches.split(',').map((s) => s.trim()).filter(Boolean)
                : ['Co-ord Sets', 'Sonic', 'Graphic Tee', 'T-shirt', 'Kids']
              ).map((term) => (
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

        {/* Recommended Products when empty */}
        {searchQuery.trim().length === 0 && products.length > 0 && (
          <div className="space-y-3 pt-6">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Recommended For You</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {products.filter(p => p.isFeatured).concat(products.filter(p => !p.isFeatured)).slice(0, 4).map((product) => {
                const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
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

        {showSuggestions && searchQuery.trim().length > 0 && (
          <div className="mt-2 overflow-hidden py-1 max-h-[320px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/50">
            {loading ? (
              <div className="px-4 py-8 text-xs text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-[#e94560] border-t-transparent animate-spin" />
                <span className="font-semibold">Searching shop...</span>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="space-y-1 pt-1">
                <div className="pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Suggested Products ({suggestions.length})
                </div>
                {suggestions.map((product) => {
                  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
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
                          <img
                            src={primaryImage.url}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[10px] text-gray-400">
                            No Img
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-[#e94560] transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5 flex items-center gap-1">
                          {product.category?.name || 'Uncategorized'}
                          {product.sku && <span className="uppercase font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">SKU: {product.sku}</span>}
                          {product.variants.length > 0 && ` • ${product.variants.length} options`}
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

                <button
                  onClick={() => {
                    setSearchOpen(false);
                    router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
                  }}
                  className="w-full text-center mt-3 text-xs font-black text-[#e94560] hover:underline py-2 cursor-pointer"
                >
                  View all results for "{searchQuery}"
                </button>
              </div>
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">No products found</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Try searching for another term, category, variant, or color</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
