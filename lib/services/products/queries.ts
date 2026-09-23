import { cache } from 'react';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Product } from '@/lib/types';
import {
  staticSupabase,
  mapProduct,
  applyFlashSaleDiscounts,
  getCachedProducts,
  getCachedProductsLimited,
  DBProductRow
} from './mappers';

export const getProducts = async (categoryId?: string, limit?: number) => {
  if (limit && limit > 0) {
    return getCachedProductsLimited(categoryId, limit);
  }
  return getCachedProducts(categoryId);
};

const fetchRelatedProducts = async (productId: string, categoryId?: string, limit = 4): Promise<Product[]> => {
  try {
    let related: DBProductRow[] = [];
    if (categoryId) {
      const { data, error } = await staticSupabase
        .from('products')
        .select('*, product_images(*), product_variants(*), product_modifiers(*), categories!category_id(*), product_categories(*, categories(*)), badges(*), size_guides(*)')
        .is('deleted_at', null)
        .eq('is_active', true)
        .eq('category_id', categoryId)
        .neq('id', productId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) {
        console.error('[Products Error Debug] fetchRelatedProducts failed:', error);
        throw error;
      }
      related = data ?? [];
    }

    if (related.length < limit) {
      const needed = limit - related.length;
      const excludeIds = [productId, ...related.map(r => r.id)];
      const { data, error } = await staticSupabase
        .from('products')
        .select('*, product_images(*), product_variants(*), product_modifiers(*), categories!category_id(*), product_categories(*, categories(*)), badges(*), size_guides(*)')
        .is('deleted_at', null)
        .eq('is_active', true)
        .not('id', 'in', `(${excludeIds.join(',')})`)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(needed);
      if (error) {
        console.error('[Products Error Debug] fetchRelatedProducts fallback failed:', error);
        throw error;
      }
      related = [...related, ...(data ?? [])];
    }

    const products = related.map(mapProduct);
    return applyFlashSaleDiscounts(products);
  } catch (err) {
    console.error('[Products Error Debug] fetchRelatedProducts caught error:', err);
    throw err;
  }
};

export const getRelatedProducts = cache(async (productId: string, categoryId?: string, limit = 4) => {
  if (typeof window !== 'undefined') {
    return fetchRelatedProducts(productId, categoryId, limit);
  }
  try {
    const { unstable_cache } = await import('next/cache');
    const cachedFn = unstable_cache(
      async () => fetchRelatedProducts(productId, categoryId, limit),
      [`related-products-${productId}-${categoryId || 'none'}-${limit}`],
      { revalidate: 86400, tags: [`product-${productId}`, 'products'] }
    );
    return cachedFn();
  } catch {
    return fetchRelatedProducts(productId, categoryId, limit);
  }
});

const fetchProductBySlug = async (slug: string): Promise<Product | null> => {
  try {
    const { data, error } = await staticSupabase
      .from('products')
      .select('*, product_images(*), product_variants(*), product_modifiers(*), categories!category_id(*), product_categories(*, categories(*)), badges(*), size_guides(*)')
      .eq('slug', slug)
      .is('deleted_at', null)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('[Products Error Debug] fetchProductBySlug failed:', error);
      throw error;
    }
    if (!data) return null;
    const product = mapProduct(data);
    const discounted = await applyFlashSaleDiscounts([product]);
    return discounted[0] || null;
  } catch (err) {
    console.error('[Products Error Debug] fetchProductBySlug caught error:', err);
    throw err;
  }
};

export const getProductBySlug = cache(async (slug: string) => {
  if (typeof window !== 'undefined') {
    return fetchProductBySlug(slug);
  }
  try {
    const { unstable_cache } = await import('next/cache');
    const cachedFn = unstable_cache(
      async () => fetchProductBySlug(slug),
      [`product-by-slug-${slug}`],
      { revalidate: 86400, tags: [`product-${slug}`, 'products'] }
    );
    return cachedFn();
  } catch {
    return fetchProductBySlug(slug);
  }
});

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*, product_images(*), product_variants(*), product_modifiers(*), categories!category_id(*), product_categories(*, categories(*)), badges(*), size_guides(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const product = mapProduct(data);

    const { data: logs, error: logsError } = await supabaseAdmin
      .from('meta_sync_log')
      .select('status, error, created_at')
      .eq('product_id', id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!logsError && logs && logs.length > 0) {
      const latestLog = logs[0];
      product.meta_sync_status = latestLog.status as any;
      product.meta_sync_error = latestLog.error || undefined;
      product.meta_last_synced_at = latestLog.created_at;
    } else {
      product.meta_sync_status = 'pending';
      product.meta_sync_error = undefined;
      product.meta_last_synced_at = undefined;
    }

    return product;
  } catch (error) {
    console.error('[products] getProductById failed, returning null fallback:', error);
    return null;
  }
};

export const getAllProductsAdmin = async (): Promise<Product[]> => {
  try {
    const supabase = staticSupabase;
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*), product_variants(*), product_modifiers(*), categories!category_id(*), product_categories(*, categories(*)), badges(*), size_guides(*)')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const products = (data ?? []).map(mapProduct);

    if (products.length > 0) {
      const productIds = products.map(p => p.id);
      const { data: logs, error: logsError } = await supabase
        .from('meta_sync_log')
        .select('product_id, status, error, created_at')
        .in('product_id', productIds)
        .order('created_at', { ascending: true });

      if (!logsError && logs) {
        const latestLogs: Record<string, { status: string; error: string | null; created_at: string }> = {};
        logs.forEach(log => {
          latestLogs[log.product_id] = {
            status: log.status,
            error: log.error,
            created_at: log.created_at
          };
        });

        products.forEach(p => {
          const log = latestLogs[p.id];
          if (log) {
            p.meta_sync_status = log.status as any;
            p.meta_sync_error = log.error || undefined;
            p.meta_last_synced_at = log.created_at;
          } else {
            p.meta_sync_status = 'pending';
            p.meta_sync_error = undefined;
            p.meta_last_synced_at = undefined;
          }
        });
      }
    }

    return products;
  } catch (error) {
    console.error('[products] getAllProductsAdmin failed, returning empty fallback list:', error);
    return [];
  }
};

export const getProductsByCategoryId = async (categoryId: string): Promise<Product[]> => {
  try {
    const { data: catRelations, error: relError } = await staticSupabase
      .from('product_categories')
      .select('product_id')
      .eq('category_id', categoryId);

    if (relError) throw relError;

    const relProductIds = (catRelations || []).map(r => r.product_id);

    let query = staticSupabase
      .from('products')
      .select('*, product_images(*), product_variants(*), product_modifiers(*), categories!category_id(*), product_categories(*, categories(*)), badges(*), size_guides(*)')
      .is('deleted_at', null)
      .eq('is_active', true);

    if (relProductIds.length > 0) {
      query = query.or(`category_id.eq.${categoryId},id.in.(${relProductIds.join(',')})`);
    } else {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    const products = (data ?? []).map(mapProduct);
    return applyFlashSaleDiscounts(products);
  } catch (err) {
    console.error('[Products Error Debug] getProductsByCategoryId failed:', err);
    return [];
  }
};
