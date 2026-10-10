'use server';

import { Category } from '@/lib/types';
import { SHOP_CATEGORY_ID } from '@/lib/config/singleton-ids';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { mapCategory } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
const staticSupabase = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { fetch: (url, init) => fetch(url, { ...init, cache: 'no-store' }) }
});

const fetchCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await staticSupabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapCategory);
  } catch (error) {
    try {
      const { data, error } = await staticSupabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .is('deleted_at', null)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []).map(mapCategory);
    } catch (fallbackError) {
      console.error('[categories] fetchCategories failed, returning empty fallback list:', error);
      return [];
    }
  }
};

export const getCategories = async (): Promise<Category[]> => {
  if (typeof window !== 'undefined') {
    return fetchCategories();
  }
  try {
    const { unstable_cache } = await import('next/cache');
    const cachedFn = unstable_cache(
      async () => fetchCategories(),
      ['categories-list'],
      { tags: ['categories'] }
    );
    return cachedFn();
  } catch {
    return fetchCategories();
  }
};

const fetchCategoryBySlug = async (slug: string): Promise<Category | null> => {
  const { data, error } = await staticSupabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) throw error;
  return data ? mapCategory(data) : null;
};

export const getCategoryBySlug = async (slug: string): Promise<Category | null> => {
  if (typeof window !== 'undefined') {
    return fetchCategoryBySlug(slug);
  }
  try {
    const { unstable_cache } = await import('next/cache');
    const cachedFn = unstable_cache(
      async () => fetchCategoryBySlug(slug),
      [`category-by-slug-${slug}`],
      { revalidate: 86400, tags: [`category-${slug}`, 'categories'] }
    );
    return cachedFn();
  } catch {
    return fetchCategoryBySlug(slug);
  }
};

export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const supabase = staticSupabase;
    const [catsRes, prodsRes, pcRes] = await Promise.all([
      supabase
        .from('categories')
        .select('*')
        .is('deleted_at', null)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false }),
      supabase
        .from('products')
        .select('id, category_id')
        .is('deleted_at', null),
      supabase
        .from('product_categories')
        .select('product_id, category_id')
    ]);

    if (catsRes.error) throw catsRes.error;

    const validProductIds = new Set((prodsRes.data || []).map(p => p.id));
    const totalCount = validProductIds.size;

    const catMap = new Map<string, Set<string>>();
    for (const p of prodsRes.data || []) {
      if (p.category_id) {
        if (!catMap.has(p.category_id)) catMap.set(p.category_id, new Set());
        catMap.get(p.category_id)!.add(p.id);
      }
    }
    for (const r of pcRes.data || []) {
      if (validProductIds.has(r.product_id)) {
        if (!catMap.has(r.category_id)) catMap.set(r.category_id, new Set());
        catMap.get(r.category_id)!.add(r.product_id);
      }
    }

    return (catsRes.data ?? []).map(row => {
      const cat = mapCategory(row);
      if (cat.id === SHOP_CATEGORY_ID) {
        cat.product_count = totalCount;
      } else {
        cat.product_count = catMap.get(cat.id)?.size ?? 0;
      }
      return cat;
    });
  } catch (error) {
    console.error('[categories] getAllCategories failed, returning fallback list:', error);
    return [];
  }
};

export const getDeletedCategories = async (): Promise<Category[]> => {
  try {
    const supabase = staticSupabase;
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });

    if (error) throw error;
    return ((data as any) ?? []).map(mapCategory);
  } catch (error) {
    console.error('[categories] getDeletedCategories failed:', error);
    throw error;
  }
};

export const getCategoryById = async (id: string): Promise<Category | null> => {
  try {
    const supabase = staticSupabase;
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data ? mapCategory(data) : null;
  } catch (error) {
    console.error('[categories] getCategoryById failed:', error);
    throw error;
  }
};
