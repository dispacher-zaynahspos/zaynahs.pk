'use server';

import { createClient } from '@/lib/supabase/server';
import { HomepageSection } from '@/lib/types';
import { revalidateBanner } from '@/lib/revalidate';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
const staticSupabase = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
  global: { fetch: (url, init) => fetch(url, { ...init, cache: 'no-store' }) }
});

const fetchHomepageSections = async (onlyActive: boolean): Promise<HomepageSection[]> => {
  try {
    let query = staticSupabase
      .from('homepage_sections')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (onlyActive) {
      query = query.eq('active', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    try {
      let query = staticSupabase
        .from('homepage_sections')
        .select('*')
        .order('sort_order', { ascending: true });
      if (onlyActive) {
        query = query.eq('active', true);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (fallbackError) {
      console.error('[sections] fetchHomepageSections failed, returning empty fallback list:', error);
      return [];
    }
  }
};

export const getHomepageSections = async (onlyActive = false): Promise<HomepageSection[]> => {
  if (typeof window !== 'undefined') {
    return fetchHomepageSections(onlyActive);
  }
  try {
    const { unstable_cache } = await import('next/cache');
    const cachedFn = unstable_cache(
      async () => fetchHomepageSections(onlyActive),
      [`homepage-sections-${onlyActive ? 'active' : 'all'}`],
      { revalidate: 86400, tags: ['homepage', 'banners', 'homepage_sections'] }
    );
    return cachedFn();
  } catch {
    return fetchHomepageSections(onlyActive);
  }
};

export const fetchSectionsForVerticalAdmin = async (): Promise<HomepageSection[]> => {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('homepage_sections')
      .select('*')
      .order('sort_order', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[sections] fetchSectionsForVerticalAdmin failed, returning empty fallback list:', error);
    return [];
  }
};

export const updateHomepageSection = async (
  id: string,
  updates: Partial<HomepageSection>
): Promise<HomepageSection> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('homepage_sections')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    await revalidateBanner();
    return data;
  } catch (error) {
    console.error('[sections] updateHomepageSection failed:', error);
    throw error;
  }
};

export const reorderHomepageSections = async (
  sections: { id: string; sort_order: number }[]
): Promise<void> => {
  try {
    const supabase = await createClient();
    const promises = sections.map((sec) =>
      supabase
        .from('homepage_sections')
        .update({ sort_order: sec.sort_order })
        .eq('id', sec.id)
    );
    await Promise.all(promises);
    await revalidateBanner();
  } catch (error) {
    console.error('[sections] reorderHomepageSections failed:', error);
    throw error;
  }
};

export const addHomepageSection = async (
  sectionType: string,
  title: string
): Promise<HomepageSection> => {
  try {
    const supabase = await createClient();
    const { data: maxSec } = await supabase
      .from('homepage_sections')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const newSortOrder = (maxSec?.sort_order ?? 0) + 1;

    let settings: Record<string, any> = {};
    let content_data: Record<string, any> = {};

    if (sectionType === 'product_grid') {
      settings = { limit: 8, columns_desktop: 4, columns_mobile: 2, source: 'all' };
    } else if (sectionType === 'category_list') {
      settings = { columns_desktop: 6, columns_mobile: 3 };
    } else if (sectionType === 'hero_banner') {
      settings = { height_desktop: '450px', height_mobile: '220px', overlay_opacity: 0.3 };
    } else if (sectionType === 'recent_reviews') {
      settings = { limit: 3 };
    } else if (sectionType === 'flash_sale') {
      settings = { startTime: '', endTime: '', viewAllText: 'View All', viewAllUrl: '/shop' };
      content_data = { products: [] };
    }

    const { data, error } = await supabase
      .from('homepage_sections')
      .insert({
        section_type: sectionType,
        title,
        settings,
        content_data,
        sort_order: newSortOrder,
        active: true
      })
      .select('*')
      .single();

    if (error) throw error;
    await revalidateBanner();
    return data;
  } catch (error) {
    console.error('[sections] addHomepageSection failed:', error);
    throw error;
  }
};

export const deleteHomepageSection = async (id: string): Promise<void> => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('homepage_sections')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await revalidateBanner();
  } catch (error) {
    console.error('[sections] deleteHomepageSection failed:', error);
    throw error;
  }
};
