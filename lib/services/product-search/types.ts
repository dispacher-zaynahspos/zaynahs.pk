import type { ProductModifier } from '@/lib/types';

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
  short_description?: string;
  description?: string;
  price: number;
  compare_price?: number;
  sku?: string;
  images: Array<{ id: string; product_id: string; url: string; is_primary: boolean; sort_order: number; alt?: string; created_at: string }>;
  variants: Array<{
    id: string;
    product_id: string;
    color?: string;
    size?: string;
    material?: string;
    custom_value?: string;
    sku?: string;
    price?: number;
    stock: number;
    active: boolean;
    sort_order: number;
  }>;
  category?: { id: string; name: string; slug: string; sort_order: number; active: boolean; created_at: string; updated_at: string; parent_id?: string | null; description?: string; image_url?: string; meta_title?: string; meta_description?: string; deleted_at?: string | null };
  tags: string[];
  is_active: boolean;
  is_featured: boolean;
  stock: number;
  has_variants: boolean;
  is_service: boolean;
  enable_swatches: boolean;
  show_swatches_on_archive: boolean;
  modifiers: ProductModifier[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  score: number;
  matched_fields: string[];
  age_group?: string;
  recommended_age_min_months?: number;
  recommended_age_max_months?: number;
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
  short_description: number;
  tags: number;
  category: number;
  long_description: number;
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
  short_description: 20,
  tags: 15,
  category: 15,
  long_description: 10,
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