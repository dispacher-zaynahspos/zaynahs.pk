'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ProductSearchResult, ProductSearchConfig, ProductSearchResponse, UseProductSearchOptions, UseProductSearchReturn } from './types';
import { searchProductsClient, clearSearchCache, invalidateSearchCache } from './client-search';

export function useProductSearch(options: UseProductSearchOptions = {}): UseProductSearchReturn {
  const {
    debounceMs = 300,
    minQueryLength = 1,
    config = {},
    onResults,
    onError,
  } = options;

  const [query, setQueryState] = useState('');
  const [results, setResults] = useState<ProductSearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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

  const executeSearch = useCallback(async (searchQuery: string, isLoadMore = false) => {
    if (searchQuery.length < minQueryLength && !isLoadMore) {
      setResults([]);
      setTotal(0);
      setHasMore(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    if (!isLoadMore) {
      setIsLoading(true);
      setError(null);
      currentOffsetRef.current = 0;
    } else {
      currentOffsetRef.current += config.limit || 50;
    }

    try {
      const searchConfig: ProductSearchConfig = {
        ...config,
        limit: config.limit || 50,
        offset: isLoadMore ? currentOffsetRef.current : 0,
      };

      const response: ProductSearchResponse = await searchProductsClient(searchQuery, searchConfig);

      if (!isMountedRef.current) return;

      if (isLoadMore) {
        setResults(prev => [...prev, ...response.results]);
      } else {
        setResults(response.results);
      }
      setTotal(response.total);
      setHasMore(response.hasMore);

      onResults?.(response.results);
    } catch (err) {
      if (!isMountedRef.current) return;
      if (err instanceof Error && err.name === 'AbortError') return;
      
      const error = err instanceof Error ? err : new Error('Search failed');
      setError(error);
      onError?.(error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [config, minQueryLength, onResults, onError]);

  const debouncedSearch = useCallback((searchQuery: string) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    
    debounceTimerRef.current = setTimeout(() => {
      executeSearch(searchQuery);
    }, debounceMs);
  }, [executeSearch, debounceMs]);

  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
    debouncedSearch(newQuery);
  }, [debouncedSearch]);

  const search = useCallback(async (searchQuery: string) => {
    setQueryState(searchQuery);
    await executeSearch(searchQuery);
  }, [executeSearch]);

  const clear = useCallback(() => {
    setQueryState('');
    setResults([]);
    setTotal(0);
    setHasMore(false);
    setError(null);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || !query) return;
    await executeSearch(query, true);
  }, [hasMore, isLoading, query, executeSearch]);

  return {
    query,
    setQuery,
    results,
    total,
    hasMore,
    isLoading,
    error,
    search,
    clear,
    loadMore,
  };
}

export { clearSearchCache, invalidateSearchCache };