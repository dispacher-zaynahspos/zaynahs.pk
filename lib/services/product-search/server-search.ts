import { supabaseAdmin } from '@/lib/supabase/admin';
import { ProductSearchConfig, ProductSearchFilters, ProductSearchResult, ProductSearchResponse } from './types';
import { normalizeQuery, tokenizeQuery, parseAgeQuery } from './normalization';
import { rankSearchResults } from './ranking';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

interface ProductImageRow {
  id: string;
  product_id: string;
  url: string;
  is_primary: boolean;
  sort_order: number;
  alt?: string;
  created_at: string;
}

interface ProductVariantRow {
  id: string;
  product_id: string;
  color?: string;
  size?: string;
  material?: string;
  custom_value?: string;
  sku?: string;
  price?: number | string | null;
  stock: number;
  active: boolean;
  sort_order: number;
}

interface ProductCategoryRow {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  parent_id?: string | null;
  description?: string;
  image_url?: string;
  meta_title?: string;
  meta_description?: string;
  deleted_at?: string | null;
}

interface ProductModifierRow {
  id: string;
  product_id: string;
  name: string;
  price: number;
  active: boolean;
  sort_order: number;
}

interface ProductSearchRow {
  id: string;
  name: string;
  slug: string;
  short_description?: string;
  description?: string;
  price: number | string;
  compare_price?: number | string | null;
  sku?: string;
  tags?: string[] | null;
  is_active: boolean;
  is_featured: boolean;
  stock: number;
  has_variants: boolean;
  is_service: boolean;
  enable_swatches: boolean;
  show_swatches_on_archive: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  recommended_age_min_months?: number;
  recommended_age_max_months?: number;
  age_group?: string;
  product_images?: ProductImageRow[] | null;
  product_variants?: ProductVariantRow[] | null;
  categories?: ProductCategoryRow | null;
  modifiers?: ProductModifierRow[] | null;
}

function mapSearchRow(row: ProductSearchRow, score: number, matchedFields: string[]): ProductSearchResult {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    short_description: row.short_description,
    description: row.description,
    price: Number(row.price),
    compare_price: row.compare_price ? Number(row.compare_price) : undefined,
    sku: row.sku,
    images: (row.product_images || []).map((img) => ({
      id: img.id,
      product_id: img.product_id,
      url: img.url,
      is_primary: img.is_primary,
      sort_order: img.sort_order,
      alt: img.alt,
      created_at: img.created_at,
    })).sort((a, b) => a.sort_order - b.sort_order),
    variants: (row.product_variants || [])
      .filter((v) => v.active)
      .map((v) => ({
        id: v.id,
        product_id: v.product_id,
        color: v.color,
        size: v.size,
        material: v.material,
        custom_value: v.custom_value,
        sku: v.sku,
        price: v.price ? Number(v.price) : undefined,
        stock: v.stock,
        active: v.active,
        sort_order: v.sort_order,
      })),
    category: row.categories ? {
      id: row.categories.id,
      name: row.categories.name,
      slug: row.categories.slug,
      sort_order: row.categories.sort_order,
      active: row.categories.active,
      created_at: row.categories.created_at,
      updated_at: row.categories.updated_at,
      parent_id: row.categories.parent_id,
      description: row.categories.description,
      image_url: row.categories.image_url,
      meta_title: row.categories.meta_title,
      meta_description: row.categories.meta_description,
      deleted_at: row.categories.deleted_at,
    } : undefined,
    tags: row.tags || [],
    is_active: row.is_active,
    is_featured: row.is_featured,
    stock: row.stock,
    has_variants: row.has_variants,
    enable_swatches: row.enable_swatches,
    show_swatches_on_archive: row.show_swatches_on_archive,
    modifiers: (row.modifiers || []).map((m) => ({
      id: m.id,
      product_id: m.product_id,
      name: m.name,
      price: m.price,
      active: m.active,
      sort_order: m.sort_order,
    })),
    is_service: row.is_service,
    created_at: row.created_at,
    updated_at: row.updated_at,
    deleted_at: row.deleted_at,
    score,
    matched_fields: matchedFields,
    recommended_age_min_months: row.recommended_age_min_months,
    recommended_age_max_months: row.recommended_age_max_months,
    age_group: row.age_group,
  };
}

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

  let dbQuery = supabaseAdmin
    .from('products')
    .select(`
      id, name, slug, short_description, description, price, compare_price, sku,
      category_id, stock, has_variants, is_featured, is_active, is_service, tags,
      enable_swatches, show_swatches_on_archive,
      recommended_age_min_months, recommended_age_max_months, age_group,
      created_at, updated_at, deleted_at,
      product_images(id, product_id, url, is_primary, sort_order, alt, created_at),
      product_variants(id, product_id, color, size, material, custom_value, sku, price, stock, active, sort_order),
      categories!category_id(id, name, slug, sort_order, active, created_at, updated_at, parent_id, description, image_url, meta_title, meta_description, deleted_at),
      modifiers(id, product_id, name, price, active, sort_order)
    `, { count: 'exact' })
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
    // websearch handles multi-word + partial better than plain tsquery
    dbQuery = dbQuery.textSearch('search_vector', tokens.join(' '), {
      config: 'simple',
      type: 'websearch',
    });
  }

  dbQuery = dbQuery
    .order('is_featured', { ascending: false })
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await dbQuery;

  if (error) {
    if (error.code === '42703' || error.message.includes('search_vector')) {
      return searchProductsServerFallback(query, config);
    }
    console.error('[ProductSearch] Server search error:', error);
    throw error;
  }

  const products: ProductSearchResult[] = (data || []).map((row) => mapSearchRow(row as unknown as ProductSearchRow, 0, []));

  const ranked = rankSearchResults(products, query);

  const total = count ?? ranked.length;
  return {
    results: ranked,
    total,
    hasMore: offset + ranked.length < total,
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
      category_id, stock, has_variants, is_featured, is_active, is_service, tags,
      enable_swatches, show_swatches_on_archive,
      recommended_age_min_months, recommended_age_max_months, age_group,
      created_at, updated_at, deleted_at,
      product_images(id, product_id, url, is_primary, sort_order, alt, created_at),
      product_variants(id, product_id, color, size, material, custom_value, sku, price, stock, active, sort_order),
      categories!category_id(id, name, slug, sort_order, active, created_at, updated_at, parent_id, description, image_url, meta_title, meta_description, deleted_at),
      modifiers(id, product_id, name, price, active, sort_order)
    `, { count: 'exact' })
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

  const products: ProductSearchResult[] = (data || []).map((row) => mapSearchRow(row as unknown as ProductSearchRow, 0, []));

  const ranked = rankSearchResults(products, query);

  const total = count ?? ranked.length;
  return {
    results: ranked,
    total,
    hasMore: offset + ranked.length < total,
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
      category_id, stock, has_variants, is_featured, is_active, is_service, tags,
      enable_swatches, show_swatches_on_archive,
      recommended_age_min_months, recommended_age_max_months, age_group,
      created_at, updated_at, deleted_at,
      product_images(id, product_id, url, is_primary, sort_order, alt, created_at),
      product_variants(id, product_id, color, size, material, custom_value, sku, price, stock, active, sort_order),
      categories!category_id(id, name, slug, sort_order, active, created_at, updated_at, parent_id, description, image_url, meta_title, meta_description, deleted_at),
      modifiers(id, product_id, name, price, active, sort_order)
    `)
    .is('deleted_at', null)
    .in('id', ids);

  if (error) throw error;

  return (data || []).map((row) => mapSearchRow(row as unknown as ProductSearchRow, 100, ['direct_id']));
}