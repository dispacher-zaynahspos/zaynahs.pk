import { Product } from '@/lib/types';
import { staticSupabase } from './types';
import { mapProduct } from './dbToProductMapper';
import { applyFlashSaleDiscounts } from './flashSaleDiscounts';

export const fetchProducts = async (categoryId?: string, limit?: number): Promise<Product[]> => {
  try {
    let query = staticSupabase
      .from('products')
      .select(`
        *,
        product_images(*),
        product_variants(*),
        product_modifiers(*),
        categories!category_id(*),
        product_categories(*, categories(*)),
        badges(*),
        size_guides(*)
      `)
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
    const products = (data ?? []).map(mapProduct);
    return applyFlashSaleDiscounts(products);
  } catch (err) {
    try {
      let query = staticSupabase
        .from('products')
        .select(`
          *,
          product_images(*),
          product_variants(*),
          product_modifiers(*),
          categories!category_id(*),
          product_categories(*, categories(*)),
          badges(*),
          size_guides(*)
        `)
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
      const products = (data ?? []).map(mapProduct);
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
      ['products-list-v3'],
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
      ['products-list-limited-v3'],
      { tags: ['products'] }
    );
    return cachedFn(categoryId, limit);
  } catch {
    return fetchProducts(categoryId, limit);
  }
};
