'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Search, X, Check, Package, Edit2, Loader2 } from '@/components/common/Icons';
import { formatPrice } from '@/lib/utils/whatsapp';

export interface ProductPickerItem {
  id: string;
  name: string;
  slug?: string;
  image?: string;
  price?: number;
  sku?: string;
}

interface ProductSearchPickerProps {
  value: string;
  onChange: (productId: string, product?: ProductPickerItem) => void;
  initialProducts?: ProductPickerItem[];
  placeholder?: string;
  allowClear?: boolean;
  required?: boolean;
  className?: string;
  enableLiveApiSearch?: boolean;
}

export default function ProductSearchPicker({
  value,
  onChange,
  initialProducts = [],
  placeholder = 'Search product by name or keyword...',
  allowClear = false,
  required = false,
  className = '',
  enableLiveApiSearch = true,
}: ProductSearchPickerProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(!value);
  const [apiResults, setApiResults] = useState<ProductPickerItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Combine initial products and any fetched api products into a unified list
  const allKnownProducts = useMemo(() => {
    const map = new Map<string, ProductPickerItem>();
    initialProducts.forEach((p) => map.set(p.id, p));
    apiResults.forEach((p) => map.set(p.id, p));
    return Array.from(map.values());
  }, [initialProducts, apiResults]);

  // Find currently selected product
  const selectedProduct = useMemo(() => {
    return allKnownProducts.find((p) => p.id === value) || null;
  }, [allKnownProducts, value]);

  // Filtered products for dropdown
  const filteredProducts = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return allKnownProducts.slice(0, 30);
    }
    return allKnownProducts
      .filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(trimmed);
        const skuMatch = p.sku ? p.sku.toLowerCase().includes(trimmed) : false;
        const slugMatch = p.slug ? p.slug.toLowerCase().includes(trimmed) : false;
        return nameMatch || skuMatch || slugMatch;
      })
      .slice(0, 30);
  }, [allKnownProducts, query]);

  // Live API search for products across the whole store
  useEffect(() => {
    if (!enableLiveApiSearch) return;
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setApiResults([]);
      setIsSearching(false);
      return;
    }

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await fetch(`/api/search/products?q=${encodeURIComponent(trimmed)}&limit=20`);
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.results)) {
          const mapped: ProductPickerItem[] = data.results.map((r: { id: string; name: string; slug?: string; price?: number; sku?: string; images?: Array<{ url?: string }> }) => ({
            id: r.id,
            name: r.name,
            slug: r.slug,
            price: r.price,
            sku: r.sku,
            image: r.images?.[0]?.url || '',
          }));
          setApiResults(mapped);
        }
      } catch (err) {
        console.warn('[ProductSearchPicker] Live search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [query, enableLiveApiSearch]);

  const handleSelect = (product: ProductPickerItem) => {
    onChange(product.id, product);
    setIsOpen(false);
    setQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(true);
    setQuery('');
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const handleOpenSearch = () => {
    setIsOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  // If a product is selected and search view is not explicitly open, show the Selected Card
  if (selectedProduct && !isOpen) {
    return (
      <div className={`relative ${className}`}>
        <div
          onClick={handleOpenSearch}
          className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f0f1b] hover:border-[#e94560]/50 dark:hover:border-[#e94560]/50 transition-all shadow-sm cursor-pointer group"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 border border-gray-200/70 dark:border-gray-700">
              {selectedProduct.image ? (
                <Image
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Package className="w-5 h-5" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-[#e94560] transition-colors">
                {selectedProduct.name}
              </p>
              {typeof selectedProduct.price === 'number' && (
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {formatPrice(selectedProduct.price)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {allowClear && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                title="Remove selection"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleOpenSearch}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-[#e94560] hover:text-white transition-all cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              <span>Change</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Search input & list mode
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Search Bar Input */}
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          required={required && !value}
          className="w-full h-11 pl-10 pr-20 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#e94560] focus:bg-white dark:focus:bg-[#0f0f1b] focus:outline-none transition-all"
        />

        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isSearching && (
            <Loader2 className="w-4 h-4 text-[#e94560] animate-spin" />
          )}

          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {selectedProduct && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setQuery('');
              }}
              className="px-2 py-1 rounded-md text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Dropdown list of matching products */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#0f0f1b] shadow-sm divide-y divide-gray-100 dark:divide-gray-800/80 max-h-56 sm:max-h-64 overflow-y-auto overscroll-contain">
        {filteredProducts.length === 0 ? (
          <div className="py-6 px-4 text-center">
            <Package className="w-6 h-6 text-gray-300 dark:text-gray-600 mx-auto mb-1.5" />
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {query.trim()
                ? `No products found matching "${query}"`
                : 'No products available'}
            </p>
          </div>
        ) : (
          filteredProducts.map((p) => {
            const isSelected = p.id === value;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelect(p)}
                className={`w-full text-left px-3 py-2.5 sm:px-3.5 sm:py-3 flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#e94560]/10 dark:bg-[#e94560]/20'
                    : 'hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 border border-gray-200/60 dark:border-gray-700">
                    {p.image ? (
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className="object-cover"
                        sizes="44px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs sm:text-sm font-semibold truncate ${
                        isSelected
                          ? 'text-[#e94560]'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {p.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {typeof p.price === 'number' && (
                        <span className="text-[11px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {formatPrice(p.price)}
                        </span>
                      )}
                      {p.sku && (
                        <span className="text-[10px] text-gray-400 font-medium">
                          SKU: {p.sku}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-[#e94560] text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-700" />
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
