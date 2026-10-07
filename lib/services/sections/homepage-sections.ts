'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { HomepageSection } from '@/lib/types';
import { revalidateBanner } from '@/lib/revalidate';
import { buildSectionDefaults } from '@/lib/theme-schema/sections';
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

    const { settings, content_data } = buildSectionDefaults(sectionType);

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


/**
 * SSOT — persist the FULL draft layout in one shot (Customizer "Save Layout").
 * Reconciles the DB to exactly match `draft`:
 *   • rows missing from draft are deleted,
 *   • every draft row is upserted (new client-generated IDs are inserted),
 *   • sort_order is written from array position.
 * Purges cache ONCE at the end (not per-section) so adding/editing stays instant
 * and nothing persists until the user explicitly saves.
 */
export const saveHomepageSections = async (
  draft: HomepageSection[]
): Promise<void> => {
  try {
    const supabase = supabaseAdmin;

    const { data: existing, error: fetchErr } = await supabase
      .from('homepage_sections')
      .select('id');
    if (fetchErr) throw fetchErr;

    const draftIds = new Set(draft.map((d) => d.id));
    const toDelete = (existing || [])
      .map((r: { id: string }) => r.id)
      .filter((id: string) => !draftIds.has(id));

    if (toDelete.length > 0) {
      const { error: delErr } = await supabase
        .from('homepage_sections')
        .delete()
        .in('id', toDelete);
      if (delErr) throw delErr;
    }

    const now = new Date().toISOString();
    const rows = draft.map((sec, idx) => ({
      id: sec.id,
      section_type: sec.section_type,
      title: sec.title ?? '',
      settings: sec.settings ?? {},
      content_data: sec.content_data ?? {},
      sort_order: idx + 1,
      active: sec.active ?? true,
      updated_at: now,
    }));

    if (rows.length > 0) {
      const { error: upsertErr } = await supabase
        .from('homepage_sections')
        .upsert(rows, { onConflict: 'id' });
      if (upsertErr) throw upsertErr;
    }

    await revalidateBanner();
  } catch (error) {
    console.error('[sections] saveHomepageSections failed:', error);
    throw error;
  }
};
