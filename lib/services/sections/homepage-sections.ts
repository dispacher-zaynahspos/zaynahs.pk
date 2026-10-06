'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { HomepageSection } from '@/lib/types';
import { revalidateBanner } from '@/lib/revalidate';
import { getSectionDef } from '@/lib/theme-schema/sections';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
const staticSupabase = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
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
    const supabase = supabaseAdmin;
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
    const supabase = supabaseAdmin;
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    if (updates.title !== undefined) updatePayload.title = updates.title;
    if (updates.active !== undefined) updatePayload.active = updates.active;
    if (updates.settings !== undefined) updatePayload.settings = updates.settings;
    if (updates.content_data !== undefined) updatePayload.content_data = updates.content_data;
    if (updates.sort_order !== undefined) updatePayload.sort_order = updates.sort_order;
    if (updates.section_type !== undefined) updatePayload.section_type = updates.section_type;

    // 1. Try update first on the existing record
    const { data: updated, error: updateError } = await supabase
      .from('homepage_sections')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (updateError) throw updateError;
    if (updated) {
      await revalidateBanner();
      return updated;
    }

    // 2. If row did not exist yet (e.g. freshly created or ID mismatch), insert it safely with fallback section_type
    const insertPayload = {
      id,
      section_type: updates.section_type || 'custom',
      title: updates.title || '',
      settings: updates.settings || {},
      content_data: updates.content_data || {},
      sort_order: updates.sort_order ?? 0,
      active: updates.active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const { data: inserted, error: insertError } = await supabase
      .from('homepage_sections')
      .insert(insertPayload)
      .select('*')
      .single();

    if (insertError) throw insertError;
    await revalidateBanner();
    return inserted;
  } catch (error) {
    console.error('[sections] updateHomepageSection failed:', error);
    throw error;
  }
};

export const reorderHomepageSections = async (
  sections: { id: string; sort_order: number }[]
): Promise<void> => {
  try {
    const supabase = supabaseAdmin;
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
    const supabase = supabaseAdmin;
    const { data: maxSec } = await supabase
      .from('homepage_sections')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const newSortOrder = (maxSec?.sort_order ?? 0) + 1;

    const def = getSectionDef(sectionType);
    let settings: Record<string, any> = def?.defaultSettings ? { ...def.defaultSettings } : {};
    let content_data: Record<string, any> = def?.defaultContent ? { ...def.defaultContent } : {};

    if (sectionType === 'product_grid') {
      settings = { limit: 8, columns_desktop: 4, columns_mobile: 2, source: 'all', ...settings };
    } else if (sectionType === 'category_list') {
      settings = { columns_desktop: 6, columns_mobile: 3, ...settings };
    } else if (sectionType === 'hero_banner') {
      settings = { height_desktop: '450px', height_mobile: '220px', overlay_opacity: 0.3, ...settings };
    } else if (sectionType === 'recent_reviews') {
      settings = { limit: 3, ...settings };
    } else if (sectionType === 'flash_sale') {
      settings = { startTime: '', endTime: '', viewAllText: 'View All', viewAllUrl: '/shop', ...settings };
      content_data = { products: [], ...content_data };
    } else if (sectionType === 'value_props') {
      settings = { columns_desktop: 4, columns_mobile: 2, style: 'card', ...settings };
      content_data = {
        items: [
          { icon: '🚚', title: 'Fast Delivery', subtitle: '2–4 days nationwide' },
          { icon: '💵', title: 'Cash on Delivery', subtitle: 'Pay when it arrives' },
          { icon: '✨', title: 'Premium Quality', subtitle: 'Handpicked products' },
          { icon: '🔄', title: 'Easy Returns', subtitle: '7-day return policy' },
        ],
        ...content_data,
      };
    } else if (sectionType === 'image_with_text') {
      settings = { layout: 'image_left', image_width: 50, ...settings };
      content_data = {
        heading: 'Our Story',
        body: 'Tell your brand story here...',
        button_text: 'Learn More',
        button_link: '/shop',
        ...content_data,
      };
    } else if (sectionType === 'tabbed_product_grid') {
      settings = { columns_desktop: 4, columns_tablet: 3, columns_mobile: 2, limit_per_tab: 8, ...settings };
      content_data = {
        tabs: [
          { id: 'new', label: 'New Arrivals', source: 'recent' },
          { id: 'best', label: 'Best Sellers', source: 'featured' },
          { id: 'sale', label: 'On Sale', source: 'sale' },
        ],
        ...content_data,
      };
    } else if (sectionType === 'circular_categories') {
      settings = { item_size: 80, show_labels: true, ...settings };
      content_data = { items: [], ...content_data };
    } else if (sectionType === 'faq_accordion') {
      content_data = {
        items: [
          { q: 'What are your delivery timelines?', a: '2–4 business days nationwide.' },
          { q: 'Do you offer Cash on Delivery?', a: 'Yes! COD is available on all orders.' },
          { q: 'How do I return an item?', a: 'Contact us on WhatsApp within 7 days.' },
        ],
        ...content_data,
      };
    } else if (sectionType === 'rich_text') {
      settings = { text_align: 'center', max_width: 'narrow', ...settings };
      content_data = {
        heading: 'Welcome to Our Store',
        body: 'We bring you the finest quality kids clothing and jewelry.',
        button_text: '',
        button_link: '',
        ...content_data,
      };
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
    const supabase = supabaseAdmin;
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
