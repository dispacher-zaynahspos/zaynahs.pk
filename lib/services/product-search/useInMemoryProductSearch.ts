'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Product } from '@/lib/types';
import { rankSearchResults, DEFAULT_SEARCH_WEIGHTS, ProductSearchResult } from '@/lib/services/product-search';

/**
 * SSOT in-memory product ranker.
 * Converts an array of DB `Product` rows into the shared ProductSearchResult shape,
 * applies the canonical ranking engine, then maps back to the ORIGINAL Product
 * objects (so callers keep their full product type). Debounced for smooth typing.
 *
 * Use this for admin pickers/modals that ALREADY hold the product list in memory
 * (bought-together, nav menu, reviews, customizer pickers). It gives the exact same
 * ranking (title > sku > variant > short_desc > tags > category > long_desc > age)
 * as the server engine — zero extra DB load, no duplicate algorithms (RULE SSOT1).
 */
export function productToSearchResult(product: Product): ProductSearchResult {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    short_description: product.short_description,
    description: product.description,
    price: product.price,
    compare_price: product.compare_price,
    sku: product.sku,
    images: (product.images || []) as any,
    variants: (product.variants || []) as any,
    category: product.category as any,
    tags: product.tags || [],
    is_active: product.is_active,
    is_featured: product.is_featured,
    stock: product.stock,
    has_variants: product.has_variants,
    is_service: product.is_service,
    enable_swatches: product.enable_swatches,
    show_swatches_on_archive: product.show_swatches_on_archive,
    modifiers: product.modifiers || [],
    created_at: product.created_at,
    updated_at: product.updated_at,
    deleted_at: product.deleted_at ?? null,
    score: 0,
    matched_fields: [],
    recommended_age_min_months: (product as any).recommended_age_min_months,
    recommended_age_max_months: (product as any).recommended_age_max_months,
    age_group: (product as any).age_group,
  };
}

/**
 * Rank a product list by a query, returning the ORIGINAL Product objects in
 * relevance order. Empty query → original list unchanged.
 */
export function rankProducts<T extends Product>(products: T[], query: string): T[] {
  if (!query.trim()) return products;
  const searchResults = products.map(productToSearchResult);
  const ranked = rankSearchResults(searchResults, query, DEFAULT_SEARCH_WEIGHTS);
  const byId = new Map(products.map((p) => [p.id, p]));
  return ranked.map((r) => byId.get(r.id)!).filter(Boolean) as T[];
}

interface UseInMemoryProductSearchOptions<T extends Product> {
  products: T[];
  debounceMs?: number;
  /** Extra predicate applied BEFORE ranking (e.g. exclude current product). */
  prefilter?: (p: T) => boolean;
}

/**
 * Hook variant: debounced query state + ranked results for in-memory lists.
 */
export function useInMemoryProductSearch<T extends Product>({
  products,
  debounceMs = 150,
  prefilter,
}: UseInMemoryProductSearchOptions<T>) {
  const [query, setQueryState] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const setQuery = useCallback((q: string) => {
    setQueryState(q);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedQuery(q), debounceMs);
  }, [debounceMs]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const results = useMemo(() => {
    const base = prefilter ? products.filter(prefilter) : products;
    return rankProducts(base, debouncedQuery);
  }, [products, debouncedQuery, prefilter]);

  return { query, setQuery, results, debouncedQuery };
}
