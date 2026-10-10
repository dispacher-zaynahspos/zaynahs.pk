'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Product } from '@/lib/types';
import { ProductSearchResult, ProductSearchConfig } from '@/lib/services/product-search';

interface UseShopSearchOptions {
  initialProducts: Product[];
  searchQuery: string;
  categoryId?: string;
  collectionId?: string;
  enabled?: boolean;
}

interface UseShopSearchReturn {
  searchResults: ProductSearchResult[];
  isSearching: boolean;
  searchError: Error | null;
  totalResults: number;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  clearSearch: () => void;
}

export function useShopSearch({
  initialProducts,
  searchQuery,
  categoryId,
  collectionId,
  enabled = true,
}: UseShopSearchOptions): UseShopSearchReturn {
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<Error | null>(null);
  const currentOffsetRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const executeSearch = useCallback(async (query: string, isLoadMore = false) => {
    if (!enabled || !query.trim()) {
      setSearchResults([]);
      setTotalResults(0);
      setHasMore(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    if (!isLoadMore) {
      setIsSearching(true);
      setSearchError(null);
      currentOffsetRef.current = 0;
    } else {
      currentOffsetRef.current += 50;
    }

    try {
      const config: ProductSearchConfig = {
        limit: 50,
        offset: isLoadMore ? currentOffsetRef.current : 0,
        filters: {
          categoryId,
        },
      };

      const params = new URLSearchParams({
        q: query,
        limit: String(config.limit),
        offset: String(config.offset || 0),
      });

      if (config.filters?.categoryId) {
        params.append('categoryId', config.filters.categoryId);
      }

      const response = await fetch(`/api/search/products?${params.toString()}`, {
        signal: abortControllerRef.current.signal,
        headers: { 'Content-Type': 'application/json' },
      });

      if (!isMountedRef.current) return;

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();

      if (isLoadMore) {
        setSearchResults(prev => [...prev, ...data.results]);
      } else {
        setSearchResults(data.results);
      }
      setTotalResults(data.total);
      setHasMore(data.hasMore);
    } catch (err) {
      if (!isMountedRef.current) return;
      if (err instanceof Error && err.name === 'AbortError') return;
      setSearchError(err instanceof Error ? err : new Error('Search failed'));
    } finally {
      if (isMountedRef.current) {
        setIsSearching(false);
      }
    }
  }, [enabled, categoryId]);

  useEffect(() => {
    if (searchQuery.trim()) {
      executeSearch(searchQuery);
    } else {
      setSearchResults([]);
      setTotalResults(0);
      setHasMore(false);
    }
  }, [searchQuery, executeSearch]);

  const loadMore = useCallback(async () => {
    if (hasMore && !isSearching && searchQuery.trim()) {
      await executeSearch(searchQuery, true);
    }
  }, [hasMore, isSearching, searchQuery, executeSearch]);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setTotalResults(0);
    setHasMore(false);
    if (abortControllerRef.current) abortControllerRef.current.abort();
  }, []);

  return {
    searchResults,
    isSearching,
    searchError,
    totalResults,
    hasMore,
    loadMore,
    clearSearch,
  };
}