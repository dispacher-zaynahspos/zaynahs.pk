'use server';

import { Category } from '@/lib/types';
import { SHOP_CATEGORY_ID } from '@/lib/config/singleton-ids';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidateCategory, revalidateTagSafe } from '@/lib/revalidate';
import { mapCategory } from './types';
import { safeAction } from '@/lib/utils/serverAction';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
const staticSupabase = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
  global: { fetch: (url, init) => fetch(url, { ...init, cache: 'no-store' }) }
});

export const createCategory = async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> => {
  try {
    const supabase = staticSupabase;
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: category.name,
        slug: category.slug,
        description: category.description,
        image_url: category.image_url,
        sort_order: category.sort_order,
        active: category.active
      })
      .select('*')
      .single();

    if (error) throw error;
    const mapped = mapCategory(data);
    try {
      await revalidateCategory(mapped.slug);
    } catch (revalErr) {
      console.error('[categories] revalidateCategory failed in create:', revalErr);
    }
    return mapped;
  } catch (error) {
    console.error('[categories] createCategory failed:', error);
    throw error;
  }
};

export const updateCategory = async (id: string, category: Partial<Category>): Promise<Category> => {
  try {
    const supabase = staticSupabase;
    const updatePayload: Record<string, string | number | boolean | null | undefined> = {};
    if (category.name !== undefined) updatePayload.name = category.name;
    if (category.slug !== undefined) updatePayload.slug = category.slug;
    if (category.description !== undefined) updatePayload.description = category.description;
    if (category.image_url !== undefined) updatePayload.image_url = category.image_url;
    if (category.sort_order !== undefined) updatePayload.sort_order = category.sort_order;
    if (category.active !== undefined) updatePayload.active = category.active;
    if (category.active_sort_preference !== undefined) updatePayload.active_sort_preference = category.active_sort_preference;

    const { data, error } = await supabase
      .from('categories')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    const mapped = mapCategory(data);
    try {
      await revalidateCategory(mapped.slug);
    } catch (revalErr) {
      console.error('[categories] revalidateCategory failed in update:', revalErr);
    }
    return mapped;
  } catch (error) {
    console.error('[categories] updateCategory failed:', error);
    throw error;
  }
};

export const deleteCategory = async (id: string): Promise<void> => {
  try {
    if (id === SHOP_CATEGORY_ID) {
      throw new Error('The system "All Products" category cannot be deleted.');
    }

    const supabase = staticSupabase;
    const { data: catData } = await supabase
      .from('categories')
      .select('slug')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('categories')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    
    if (catData?.slug) {
      try {
        await revalidateCategory(catData.slug);
      } catch (revalErr) {
        console.error('[categories] revalidateCategory failed in delete:', revalErr);
      }
    } else {
      revalidateTagSafe('categories');
    }
  } catch (error) {
    console.error('[categories] deleteCategory failed:', error);
    throw error;
  }
};

export const restoreCategory = async (id: string): Promise<void> => {
  try {
    const supabase = staticSupabase;
    
    const { data: catData } = await supabase
      .from('categories')
      .select('slug')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('categories')
      .update({ deleted_at: null })
      .eq('id', id);

    if (error) throw error;

    if (catData?.slug) {
      try {
        await revalidateCategory(catData.slug);
      } catch (revalErr) {
        console.error('[categories] revalidateCategory failed in restoreCategory:', revalErr);
      }
    }
    revalidateTagSafe('categories');
  } catch (error) {
    console.error('[categories] restoreCategory failed:', error);
    throw error;
  }
};

export const hardDeleteCategory = async (id: string): Promise<void> => {
  try {
    const supabase = staticSupabase;
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    revalidateTagSafe('categories');
  } catch (error) {
    console.error('[categories] hardDeleteCategory failed:', error);
    throw error;
  }
};

export const createCategorySafe = async (...args: Parameters<typeof createCategory>) => safeAction(createCategory(...args));
export const updateCategorySafe = async (...args: Parameters<typeof updateCategory>) => safeAction(updateCategory(...args));
export const deleteCategorySafe = async (...args: Parameters<typeof deleteCategory>) => safeAction(deleteCategory(...args));
