import { ProductSearchResult, ProductSearchConfig, ProductSearchResponse } from './types';

const CACHE_TTL = 30000;
const cache = new Map<string, { data: ProductSearchResponse; timestamp: number }>();

function getCacheKey(query: string, config: ProductSearchConfig): string {
  return `${query}|${JSON.stringify(config)}`;
}

export async function searchProductsClient(
  query: string,
  config: ProductSearchConfig = {}
): Promise<ProductSearchResponse> {
  const cacheKey = getCacheKey(query, config);
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { ...cached.data, tookMs: 0 };
  }

  try {
    const params = new URLSearchParams({
      q: query,
      limit: String(config.limit || 50),
      offset: String(config.offset || 0),
    });

    if (config.filters) {
      Object.entries(config.filters).forEach(([key, value]) => {
        if (value != null) params.append(key, String(value));
      });
    }

    if (config.includeDraft) params.append('includeDraft', 'true');
    if (config.includeInactive) params.append('includeInactive', 'true');

    const response = await fetch(`/api/search/products?${params.toString()}`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const data = await response.json();
    
    cache.set(cacheKey, { data, timestamp: Date.now() });
    
    return data;
  } catch (error) {
    console.error('[ProductSearch] Client search error:', error);
    throw error;
  }
}

export function clearSearchCache(): void {
  cache.clear();
}

export function invalidateSearchCache(pattern?: string): void {
  if (!pattern) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}