export interface ProductSearchConfig {
  includeDraft?: boolean;
  includeInactive?: boolean;
  includeArchived?: boolean;
  storeId?: string;
  limit?: number;
  offset?: number;
  filters?: ProductSearchFilters;
}

export interface ProductSearchFilters {
  categoryId?: string;
  collectionId?: string;
  tag?: string;
  priceMin?: number;
  priceMax?: number;
  inStockOnly?: boolean;
  onSaleOnly?: boolean;
  hasVariants?: boolean;
  isFeatured?: boolean;
  ageGroup?: string;
  gender?: string;
}

export interface ProductSearchResult {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  price: number;
  comparePrice?: number;
  sku?: string;
  images: Array<{ url: string; isPrimary: boolean; sortOrder: number }>;
  variants: Array<{
    id: string;
    color?: string;
    size?: string;
    material?: string;
    customValue?: string;
    sku?: string;
    price?: number;
    stock: number;
    active: boolean;
  }>;
  category?: { id: string; name: string; slug: string };
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  stock: number;
  hasVariants: boolean;
  score: number;
  matchedFields: string[];
  ageGroup?: string;
  recommendedAgeMinMonths?: number;
  recommendedAgeMaxMonths?: number;
}

export interface ProductSearchResponse {
  results: ProductSearchResult[];
  total: number;
  hasMore: boolean;
  query: string;
  tookMs: number;
}

export interface UseProductSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
  config?: ProductSearchConfig;
  onResults?: (results: ProductSearchResult[]) => void;
  onError?: (error: Error) => void;
}

export interface UseProductSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: ProductSearchResult[];
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  error: Error | null;
  search: (query: string) => Promise<void>;
  clear: () => void;
  loadMore: () => Promise<void>;
}

export type SearchRankWeights = {
  titleExact: number;
  titlePrefix: number;
  titleKeyword: number;
  titlePartial: number;
  variantExact: number;
  variantPartial: number;
  shortDescription: number;
  tags: number;
  category: number;
  longDescription: number;
  sku: number;
  ageExact: number;
  ageCompatible: number;
};

export const DEFAULT_SEARCH_WEIGHTS: SearchRankWeights = {
  titleExact: 100,
  titlePrefix: 80,
  titleKeyword: 60,
  titlePartial: 30,
  variantExact: 50,
  variantPartial: 25,
  shortDescription: 20,
  tags: 15,
  category: 15,
  longDescription: 10,
  sku: 90,
  ageExact: 40,
  ageCompatible: 20,
};

export interface AgeRange {
  minMonths: number;
  maxMonths: number;
  label: string;
}

export interface ParsedAgeQuery {
  original: string;
  ageInMonths?: number;
  ageRange?: AgeRange;
  gender?: 'boy' | 'girl' | 'unisex';
  keywords: string[];
}