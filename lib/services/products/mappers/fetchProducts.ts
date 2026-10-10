import { Product } from '@/lib/types';
import { staticSupabase } from './types';
import { mapProduct } from './dbToProductMapper';
import { applyFlashSaleDiscounts } from './flashSaleDiscounts';

// LIGHT column set for LIST views (home / shop / category grids). Drops the heavy
// long `description`, modifiers, size guides, and PDP-only relations so the HTML/RSC
// payload stays small → fast first load. Cards + QuickView never render the long
// description (verified), and search matches name/short_desc/tags/sku/category/variants.
// The product detail page uses the FULL fetch (getProductBySlug) which keeps everything.
const LIGHT_SELECT = `
  id, name, slug, short_description, price, compare_price, sku, category_id,
  stock, has_variants, is_service, is_featured, is_active, enable_swatches,
  show_swatches_on_archive, custom_badge_id, badge_enabled, tags, rating,
  reviews_count, sort_order, variation_order, deleted_at, created_at, updated_at,
  flash_sale_enabled, flash_sale_start_date, flash_sale_end_date,
  flash_sale_discount_type, flash_sale_discount_value,
  product_images(*),
  product_variants(*),
  categories!category_id(*),
  product_categories(*, categories(*)),
  badges(*)
`;

const FULL_SELECT = `
  *,
  product_images(*),
  product_variants(*),
  product_modifiers(*),
  categories!category_id(*),
  product_categories(*, categories(*)),
  badges(*),
  size_guides(*)
`;

export const fetchProducts = async (categoryId?: string, limit?: number, light = true): Promise<Product[]> => {
  const selectCols = light ? LIGHT_SELECT : FULL_SELECT;
  try {
    let query = staticSupabase
      .from('products')
      .select(selectCols)
      .eq('is_active', true)
      .is('deleted_at', null);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    let finalQuery = query
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (limit && limit > 0) {
      finalQuery = finalQuery.limit(limit) as typeof finalQuery;
    }

    const { data, error } = await finalQuery;

    if (error) {
      console.error('[Products Error Debug] fetchProducts failed:', error);
      throw error;
    }
    const products = (data ?? []).map((r: any) => mapProduct(r));
    return applyFlashSaleDiscounts(products);
  } catch (err) {
    try {
      let query = staticSupabase
        .from('products')
        .select(selectCols)
        .is('deleted_at', null)
        .eq('is_active', true);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      let finalQuery = query
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (limit && limit > 0) {
        finalQuery = finalQuery.limit(limit) as typeof finalQuery;
      }

      const { data, error } = await finalQuery;
      if (error) throw error;
      const products = (data ?? []).map((r: any) => mapProduct(r));
      return applyFlashSaleDiscounts(products);
    } catch (fallbackErr) {
      console.error('[Products Error Debug] fetchProducts caught error, returning empty fallback list:', err);
      return [];
    }
  }
};

export const getCachedProducts = async (categoryId?: string): Promise<Product[]> => {
  if (typeof window !== 'undefined') {
    return fetchProducts(categoryId);
  }
  try {
    const { unstable_cache } = await import('next/cache');
    const cachedFn = unstable_cache(
      async (catId?: string) => fetchProducts(catId),
      ['products-list-v4-light'],
      { tags: ['products'] }
    );
    return cachedFn(categoryId);
  } catch {
    return fetchProducts(categoryId);
  }
};

export const getCachedProductsLimited = async (categoryId?: string, limit?: number): Promise<Product[]> => {
  if (typeof window !== 'undefined') {
    return fetchProducts(categoryId, limit);
  }
  try {
    const { unstable_cache } = await import('next/cache');
    const cachedFn = unstable_cache(
      async (catId?: string, lim?: number) => fetchProducts(catId, lim),
      ['products-list-limited-v4-light'],
      { tags: ['products'] }
    );
    return cachedFn(categoryId, limit);
  } catch {
    return fetchProducts(categoryId, limit);
  }
};
