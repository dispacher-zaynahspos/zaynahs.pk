'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Search, X, ChevronRight, Package, Tag } from '@/components/common/Icons';
import { ProductSearchResult, ProductSearchConfig } from './types';
import { formatPrice } from '@/lib/utils/whatsapp';
import { highlightMatch } from './normalization';

interface ProductSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (product: ProductSearchResult) => void;
  config?: ProductSearchConfig;
  selectionMode?: 'single' | 'multiple';
  selectedIds?: string[];
  onSelectMultiple?: (ids: string[]) => void;
  title?: string;
  placeholder?: string;
  showVariants?: boolean;
  showSKU?: boolean;
  showCategory?: boolean;
  showTags?: boolean;
  showAge?: boolean;
  className?: string;
  emptyMessage?: string;
  loadingMessage?: string;
}

export default function ProductSearchModal({
  isOpen,
  onClose,
  onSelect,
  config = {},
  selectionMode = 'single',
  selectedIds = [],
  onSelectMultiple,
  title = 'Search Products',
  placeholder = 'Search by name, SKU, category, variant, tag, or age...',
  showVariants = true,
  showSKU = true,
  showCategory = true,
  showTags = true,
  showAge = true,
  className = '',
  emptyMessage = 'No products found. Try a different search term.',
  loadingMessage = 'Searching products...',
}: ProductSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductSearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMulti, setSelectedMulti] = useState<string[]>(selectedIds);
  const [localConfig] = useState(config);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentOffsetRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  useEffect(() => {
    setSelectedMulti(selectedIds);
  }, [selectedIds]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // Don't close on outside click for modal - use X button or Escape
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const executeSearch = async (searchQuery: string, isLoadMore = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    if (!isLoadMore) {
      setIsLoading(true);
      setError(null);
      currentOffsetRef.current = 0;
    } else {
      currentOffsetRef.current += localConfig.limit || 50;
    }

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        limit: String(localConfig.limit || 50),
        offset: String(isLoadMore ? currentOffsetRef.current : 0),
      });

      if (localConfig.filters) {
        Object.entries(localConfig.filters).forEach(([key, value]) => {
          if (value != null) params.append(key, String(value));
        });
      }

      if (localConfig.includeDraft) params.append('includeDraft', 'true');
      if (localConfig.includeInactive) params.append('includeInactive', 'true');

      const response = await fetch(`/api/search/products?${params.toString()}`, {
        signal: abortControllerRef.current.signal,
        headers: { 'Content-Type': 'application/json' },
      });

      if (!isMountedRef.current) return;

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();

      if (isLoadMore) {
        setResults(prev => [...prev, ...data.results]);
      } else {
        setResults(data.results);
      }
      setTotal(data.total);
      setHasMore(data.hasMore);
    } catch (err) {
      if (!isMountedRef.current) return;
      if (err instanceof Error && err.name === 'AbortError') return;
      setError('Search failed. Please try again.');
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      executeSearch(value);
    }, 300);
  };

  const handleSelect = (product: ProductSearchResult) => {
    if (selectionMode === 'multiple') {
      const newSelected = selectedMulti.includes(product.id)
        ? selectedMulti.filter(id => id !== product.id)
        : [...selectedMulti, product.id];
      setSelectedMulti(newSelected);
      onSelectMultiple?.(newSelected);
    } else {
      onSelect(product);
      onClose();
    }
  };

  const handleLoadMore = () => {
    if (!hasMore || isLoading || !query) return;
    executeSearch(query, true);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setTotal(0);
    setHasMore(false);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();
  };

  if (!isOpen) return null;

  const primaryImage = (product: ProductSearchResult) => 
    product.images?.find(img => img.isPrimary) || product.images?.[0];

  const variantBadges = (product: ProductSearchResult) => {
    if (!showVariants || !product.variants?.length) return null;
    const activeVariants = product.variants.filter(v => v.active);
    const colors = [...new Set(activeVariants.map(v => v.color).filter(Boolean))].slice(0, 3);
    const sizes = [...new Set(activeVariants.map(v => v.size).filter(Boolean))].slice(0, 3);
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {colors.map(color => (
          <span key={color} className="px-1.5 py-0.5 text-[9px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">
            {color}
          </span>
        ))}
        {sizes.map(size => (
          <span key={size} className="px-1.5 py-0.5 text-[9px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">
            {size}
          </span>
        ))}
        {activeVariants.length > colors.length + sizes.length && (
          <span className="px-1.5 py-0.5 text-[9px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded">
            +{activeVariants.length - colors.length - sizes.length} more
          </span>
        )}
      </div>
    );
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-start justify-center pt-20 px-4 transition-all duration-300 animate-fade-in overscroll-contain">
      <div
        ref={containerRef}
        className={`bg-white dark:bg-[#16162a] w-full max-w-2xl rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-[#16162a] z-10">
          <div>
            <h3 className="text-base font-black text-gray-900 dark:text-white">{title}</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold mt-0.5">
              {total > 0 ? `${total} product${total !== 1 ? 's' : ''} found` : 'Type to search products'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer p-1"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 sticky top-14 bg-white dark:bg-[#16162a] z-10">
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/90 dark:bg-[#0f0f1b] py-3 pl-12 pr-12 text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none focus:ring-4 focus:ring-[#e94560]/10 transition-all duration-200"
                autoComplete="off"
              />
              {query && (
                <button
                  onClick={handleClear}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {selectionMode === 'multiple' && selectedMulti.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  onSelectMultiple?.(selectedMulti);
                  onClose();
                }}
                className="rounded-2xl bg-[#e94560] hover:bg-[#d8344f] px-5 flex items-center justify-center text-white transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
              >
                <Package className="h-5 w-5 mr-1.5" />
                <span className="text-sm font-bold">Done ({selectedMulti.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto overscroll-contain p-4">
          {isLoading && query && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-8 h-8 rounded-full border-2 border-[#e94560] border-t-transparent animate-spin" />
              <span className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">{loadingMessage}</span>
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-red-500">
              <p className="font-medium">{error}</p>
              <button onClick={() => executeSearch(query)} className="mt-2 text-sm text-[#e94560] hover:underline">Retry</button>
            </div>
          )}

          {!isLoading && !error && query && results.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{emptyMessage}</p>
            </div>
          )}

          {!isLoading && !error && results.length > 0 && (
            <div className="space-y-2">
              {results.map((product) => {
                const isSelected = selectedMulti.includes(product.id);
                const img = primaryImage(product);
                const price = product.comparePrice && product.comparePrice > product.price
                  ? product.comparePrice
                  : product.price;

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSelect(product)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-colors cursor-pointer group ${
                      isSelected
                        ? 'bg-[#e94560]/10 dark:bg-[#e94560]/20 border border-[#e94560]/30'
                        : 'hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-800">
                      {img ? (
                        <img src={img.url} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[10px] text-gray-400">No Img</div>
                      )}
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#e94560] flex items-center justify-center">
                          <X className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-[#e94560] transition-colors">
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {showCategory && product.category && (
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Tag className="h-2.5 w-2.5" />
                            {product.category.name}
                          </span>
                        )}
                        {showSKU && product.sku && (
                          <span className="text-[10px] uppercase font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">
                            SKU: {product.sku}
                          </span>
                        )}
                        {showTags && product.tags.length > 0 && (
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Tag className="h-2.5 w-2.5" />
                            {product.tags.slice(0, 2).join(', ')}
                            {product.tags.length > 2 && <span>+{product.tags.length - 2}</span>}
                          </span>
                        )}
                      </div>
                      {variantBadges(product)}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-black text-gray-900 dark:text-white">
                        {formatPrice(price, 'Rs. ')}
                      </span>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <span className="text-[10px] line-through text-gray-400 ml-1">
                          {formatPrice(product.comparePrice, 'Rs. ')}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}

              {hasMore && (
                <button
                  onClick={handleLoadMore}
                  className="w-full py-3 mt-2 text-sm font-bold text-[#e94560] hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer border border-gray-200 dark:border-gray-700"
                >
                  Load More ({total - results.length} remaining)
                </button>
              )}
            </div>
          )}

          {!query && !isLoading && (
            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">Popular Searches</span>
              <div className="flex flex-wrap gap-2">
                {['New Arrivals', 'Best Sellers', 'On Sale', 'Featured', 'Kids', 'Baby', 'Toddler'].map((term) => (
                  <button
                    key={term}
                    onClick={() => handleQueryChange(term)}
                    className="px-3.5 py-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-[#e94560] hover:text-white dark:hover:bg-[#e94560] text-gray-600 dark:text-gray-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}