import { supabaseAdmin } from '@/lib/supabase/admin';
import { ProductSearchConfig, ProductSearchFilters, ProductSearchResult, ProductSearchResponse } from './types';
import { normalizeQuery, tokenizeQuery, parseAgeQuery } from './normalization';
import { rankSearchResults } from './ranking';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export async function searchProductsServer(
  query: string,
  config: ProductSearchConfig = {}
): Promise<ProductSearchResponse> {
  const startTime = Date.now();
  const normalizedQuery = normalizeQuery(query);
  const tokens = tokenizeQuery(normalizedQuery);
  const parsedAge = parseAgeQuery(query);
  const limit = Math.min(config.limit || DEFAULT_LIMIT, MAX_LIMIT);
  const offset = config.offset || 0;
  const filters = config.filters || {};

  // Build full-text search query
  const searchQuery = tokens.length > 0 ? tokens.join(' & ') : '';
  const trigramQuery = tokens.length > 0 ? tokens.join(' ') : '';

  let dbQuery = supabaseAdmin
    .from('products')
    .select(`
      id, name, slug, short_description, description, price, compare_price, sku,
      category_id, stock, has_variants, is_featured, is_active, tags,
      recommended_age_min_months, recommended_age_max_months, age_group,
      product_images!inner(url, is_primary, sort_order),
      product_variants!inner(id, color, size, material, custom_value, sku, price, stock, active),
      categories!category_id(id, name, slug)
    `)
    .is('deleted_at', null)
    .eq('is_active', true);

  if (!config.includeDraft) {
    dbQuery = dbQuery.eq('is_active', true);
  }

  if (filters.categoryId) {
    dbQuery = dbQuery.eq('category_id', filters.categoryId);
  }

  if (filters.priceMin != null) {
    dbQuery = dbQuery.gte('price', filters.priceMin);
  }
  if (filters.priceMax != null) {
    dbQuery = dbQuery.lte('price', filters.priceMax);
  }

  if (filters.inStockOnly) {
    dbQuery = dbQuery.gt('stock', 0);
  }

  if (filters.onSaleOnly) {
    dbQuery = dbQuery.not('compare_price', 'is', null).gt('compare_price', 0);
  }

  if (filters.hasVariants != null) {
    dbQuery = dbQuery.eq('has_variants', filters.hasVariants);
  }

  if (filters.isFeatured != null) {
    dbQuery = dbQuery.eq('is_featured', filters.isFeatured);
  }

  if (filters.tag) {
    dbQuery = dbQuery.contains('tags', [filters.tag]);
  }

  // Apply full-text search if query provided
  if (searchQuery) {
    // Use search_vector for full-text search (requires migration)
    dbQuery = dbQuery.textSearch('search_vector', searchQuery, {
      config: 'simple',
      type: 'plain',
    });
  }

  // Apply ordering: featured first, then by sort_order, then by relevance
  dbQuery = dbQuery
    .order('is_featured', { ascending: false })
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await dbQuery;

  if (error) {
    // Fallback to ILIKE if search_vector not available
    if (error.code === '42703' || error.message.includes('search_vector')) {
      return searchProductsServerFallback(query, config);
    }
    console.error('[ProductSearch] Server search error:', error);
    throw error;
  }

  const products: ProductSearchResult[] = (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    shortDescription: row.short_description,
    description: row.description,
    price: Number(row.price),
    comparePrice: row.compare_price ? Number(row.compare_price) : undefined,
    sku: row.sku,
    images: (row.product_images || []).map((img: any) => ({
      url: img.url,
      isPrimary: img.is_primary,
      sortOrder: img.sort_order,
    })).sort((a: any, b: any) => a.sortOrder - b.sortOrder),
    variants: (row.product_variants || [])
      .filter((v: any) => v.active)
      .map((v: any) => ({
        id: v.id,
        color: v.color,
        size: v.size,
        material: v.material,
        customValue: v.custom_value,
        sku: v.sku,
        price: v.price ? Number(v.price) : undefined,
        stock: v.stock,
        active: v.active,
      })),
    category: row.categories ? {
      id: row.categories.id,
      name: row.categories.name,
      slug: row.categories.slug,
    } : undefined,
    tags: row.tags || [],
    isActive: row.is_active,
    isFeatured: row.is_featured,
    stock: row.stock,
    hasVariants: row.has_variants,
    score: 0,
    matchedFields: [],
    recommendedAgeMinMonths: row.recommended_age_min_months,
    recommendedAgeMaxMonths: row.recommended_age_max_months,
    ageGroup: row.age_group,
  }));

  const ranked = rankSearchResults(products, query);

  return {
    results: ranked,
    total: count || ranked.length,
    hasMore: ranked.length === limit,
    query,
    tookMs: Date.now() - startTime,
  };
}

async function searchProductsServerFallback(
  query: string,
  config: ProductSearchConfig = {}
): Promise<ProductSearchResponse> {
  const startTime = Date.now();
  const normalizedQuery = normalizeQuery(query);
  const tokens = tokenizeQuery(normalizedQuery);
  const limit = Math.min(config.limit || DEFAULT_LIMIT, MAX_LIMIT);
  const offset = config.offset || 0;
  const filters = config.filters || {};

  let dbQuery = supabaseAdmin
    .from('products')
    .select(`
      id, name, slug, short_description, description, price, compare_price, sku,
      category_id, stock, has_variants, is_featured, is_active, tags,
      product_images!inner(url, is_primary, sort_order),
      product_variants!inner(id, color, size, material, custom_value, sku, price, stock, active),
      categories!category_id(id, name, slug)
    `)
    .is('deleted_at', null)
    .eq('is_active', true);

  if (!config.includeDraft) {
    dbQuery = dbQuery.eq('is_active', true);
  }

  if (filters.categoryId) {
    dbQuery = dbQuery.eq('category_id', filters.categoryId);
  }

  if (filters.priceMin != null) {
    dbQuery = dbQuery.gte('price', filters.priceMin);
  }
  if (filters.priceMax != null) {
    dbQuery = dbQuery.lte('price', filters.priceMax);
  }

  if (filters.inStockOnly) {
    dbQuery = dbQuery.gt('stock', 0);
  }

  if (filters.onSaleOnly) {
    dbQuery = dbQuery.not('compare_price', 'is', null).gt('compare_price', 0);
  }

  if (filters.hasVariants != null) {
    dbQuery = dbQuery.eq('has_variants', filters.hasVariants);
  }

  if (filters.isFeatured != null) {
    dbQuery = dbQuery.eq('is_featured', filters.isFeatured);
  }

  if (filters.tag) {
    dbQuery = dbQuery.contains('tags', [filters.tag]);
  }

  if (tokens.length > 0) {
    const textSearchConditions = tokens.map(token => {
      const escaped = token.replace(/'/g, "''");
      return `(
        name ILIKE '%${escaped}%' OR
        short_description ILIKE '%${escaped}%' OR
        description ILIKE '%${escaped}%' OR
        sku ILIKE '%${escaped}%' OR
        tags @> ARRAY['${escaped}'] OR
        categories.name ILIKE '%${escaped}%' OR
        product_variants.color ILIKE '%${escaped}%' OR
        product_variants.size ILIKE '%${escaped}%' OR
        product_variants.material ILIKE '%${escaped}%' OR
        product_variants.custom_value ILIKE '%${escaped}%' OR
        product_variants.sku ILIKE '%${escaped}%'
      )`;
    }).join(' AND ');

    dbQuery = dbQuery.or(textSearchConditions);
  }

  dbQuery = dbQuery
    .order('is_featured', { ascending: false })
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await dbQuery;

  if (error) {
    console.error('[ProductSearch] Fallback search error:', error);
    throw error;
  }

  const products: ProductSearchResult[] = (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    shortDescription: row.short_description,
    description: row.description,
    price: Number(row.price),
    comparePrice: row.compare_price ? Number(row.compare_price) : undefined,
    sku: row.sku,
    images: (row.product_images || []).map((img: any) => ({
      url: img.url,
      isPrimary: img.is_primary,
      sortOrder: img.sort_order,
    })).sort((a: any, b: any) => a.sortOrder - b.sortOrder),
    variants: (row.product_variants || [])
      .filter((v: any) => v.active)
      .map((v: any) => ({
        id: v.id,
        color: v.color,
        size: v.size,
        material: v.material,
        customValue: v.custom_value,
        sku: v.sku,
        price: v.price ? Number(v.price) : undefined,
        stock: v.stock,
        active: v.active,
      })),
    category: row.categories ? {
      id: row.categories.id,
      name: row.categories.name,
      slug: row.categories.slug,
    } : undefined,
    tags: row.tags || [],
    isActive: row.is_active,
    isFeatured: row.is_featured,
    stock: row.stock,
    hasVariants: row.has_variants,
    score: 0,
    matchedFields: [],
  }));

  const ranked = rankSearchResults(products, query);

  return {
    results: ranked,
    total: count || ranked.length,
    hasMore: ranked.length === limit,
    query,
    tookMs: Date.now() - startTime,
  };
}

export async function searchProductsByIds(
  ids: string[],
  config: ProductSearchConfig = {}
): Promise<ProductSearchResult[]> {
  if (ids.length === 0) return [];

  const { data, error } = await supabaseAdmin
    .from('products')
    .select(`
      id, name, slug, short_description, description, price, compare_price, sku,
      category_id, stock, has_variants, is_featured, is_active, tags,
      recommended_age_min_months, recommended_age_max_months, age_group,
      product_images!inner(url, is_primary, sort_order),
      product_variants!inner(id, color, size, material, custom_value, sku, price, stock, active),
      categories!category_id(id, name, slug)
    `)
    .is('deleted_at', null)
    .in('id', ids);

  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    shortDescription: row.short_description,
    description: row.description,
    price: Number(row.price),
    comparePrice: row.compare_price ? Number(row.compare_price) : undefined,
    sku: row.sku,
    images: (row.product_images || []).map((img: any) => ({
      url: img.url,
      isPrimary: img.is_primary,
      sortOrder: img.sort_order,
    })).sort((a: any, b: any) => a.sortOrder - b.sortOrder),
    variants: (row.product_variants || [])
      .filter((v: any) => v.active)
      .map((v: any) => ({
        id: v.id,
        color: v.color,
        size: v.size,
        material: v.material,
        customValue: v.custom_value,
        sku: v.sku,
        price: v.price ? Number(v.price) : undefined,
        stock: v.stock,
        active: v.active,
      })),
    category: row.categories ? {
      id: row.categories.id,
      name: row.categories.name,
      slug: row.categories.slug,
    } : undefined,
    tags: row.tags || [],
    isActive: row.is_active,
    isFeatured: row.is_featured,
    stock: row.stock,
    hasVariants: row.has_variants,
    score: 100,
    matchedFields: ['direct_id'],
    recommendedAgeMinMonths: row.recommended_age_min_months,
    recommendedAgeMaxMonths: row.recommended_age_max_months,
    ageGroup: row.age_group,
  }));
}