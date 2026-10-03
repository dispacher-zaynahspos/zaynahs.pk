'use server';

import { createClient } from '@/lib/supabase/server';
import { SizeGuide } from '@/lib/types';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidateStorefrontEdge } from '@/lib/revalidate';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

const staticSupabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (url, init) => fetch(url, { ...init, cache: 'no-store' }) } });

interface SizeGuideRow {
  id: string;
  name: string;
  chart_data: any;
  unit?: string | null;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

function parseSizeGuideChartData(chartData: any): { rows: Array<Record<string, string>>; unit: string } {
  if (!chartData) return { rows: [], unit: 'INCHES' };
  if (Array.isArray(chartData)) {
    return { rows: chartData, unit: 'INCHES' };
  }
  if (typeof chartData === 'object') {
    const rows = Array.isArray(chartData.rows) ? chartData.rows : [];
    const unit = typeof chartData.unit === 'string' && chartData.unit.trim() ? chartData.unit.trim().toUpperCase() : 'INCHES';
    return { rows, unit };
  }
  return { rows: [], unit: 'INCHES' };
}

const mapSizeGuide = (row: SizeGuideRow): SizeGuide => {
  const parsed = parseSizeGuideChartData(row.chart_data);
  const finalUnit = row.unit || parsed.unit || 'INCHES';
  return {
    id: row.id,
    name: row.name,
    chart_data: parsed.rows,
    unit: finalUnit,
    image_url: row.image_url || undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
    deleted_at: row.deleted_at || null
  };
};

const fetchSizeGuides = async (): Promise<SizeGuide[]> => {
  const { data, error } = await staticSupabase
    .from('size_guides')
    .select('*')
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapSizeGuide);
};

export const getSizeGuides = async (): Promise<SizeGuide[]> => {
  if (typeof window !== 'undefined') {
    return fetchSizeGuides();
  }
  try {
    const { unstable_cache } = await import('next/cache');
    return unstable_cache(
      async () => fetchSizeGuides(),
      ['size-guides-list'],
      { revalidate: 86400, tags: ['size_guides'] }
    )();
  } catch {
    return fetchSizeGuides();
  }
};

export const createSizeGuide = async (guide: {
  name: string;
  chart_data: Array<Record<string, string>>;
  unit?: string;
  imageUrl?: string;
}): Promise<SizeGuide> => {
  try {
    const supabase = await createClient();
    const unit = (guide.unit || 'INCHES').trim().toUpperCase();
    const { data, error } = await supabase
      .from('size_guides')
      .insert({
        name: guide.name,
        chart_data: {
          unit,
          rows: guide.chart_data
        },
        image_url: guide.imageUrl
      })
      .select('*')
      .single();

    if (error) throw error;
    await revalidateStorefrontEdge('size_guides');
    return mapSizeGuide(data);
  } catch (error) {
    console.error('[sizeGuides] createSizeGuide failed:', error);
    throw error;
  }
};

export const updateSizeGuide = async (
  id: string,
  guide: Partial<SizeGuide>
): Promise<SizeGuide> => {
  try {
    const supabase = await createClient();
    const updatePayload: Record<string, any> = {};
    if (guide.name !== undefined) updatePayload.name = guide.name;
    if (guide.image_url !== undefined) updatePayload.image_url = guide.image_url;

    if (guide.chart_data !== undefined || guide.unit !== undefined) {
      const unit = (guide.unit || 'INCHES').trim().toUpperCase();
      updatePayload.chart_data = {
        unit,
        rows: guide.chart_data || []
      };
    }

    const { data, error } = await supabase
      .from('size_guides')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    await revalidateStorefrontEdge('size_guides');
    return mapSizeGuide(data);
  } catch (error) {
    console.error('[sizeGuides] updateSizeGuide failed:', error);
    throw error;
  }
};

export const deleteSizeGuide = async (id: string): Promise<void> => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('size_guides')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    await revalidateStorefrontEdge('size_guides');
  } catch (error) {
    console.error('[sizeGuides] deleteSizeGuide failed:', error);
    throw error;
  }
};

export const getDeletedSizeGuides = async (): Promise<SizeGuide[]> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('size_guides')
      .select('*')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row: any) => mapSizeGuide(row));
  } catch (error) {
    console.error('[sizeGuides] getDeletedSizeGuides failed:', error);
    return [];
  }
};

export const restoreSizeGuide = async (id: string): Promise<void> => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('size_guides')
      .update({ deleted_at: null })
      .eq('id', id);
    if (error) throw error;
    await revalidateStorefrontEdge('size_guides');
  } catch (error) {
    console.error('[sizeGuides] restoreSizeGuide failed:', error);
    throw error;
  }
};

export const hardDeleteSizeGuide = async (id: string): Promise<void> => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('size_guides')
      .delete()
      .eq('id', id);
    if (error) throw error;
    await revalidateStorefrontEdge('size_guides');
  } catch (error) {
    console.error('[sizeGuides] hardDeleteSizeGuide failed:', error);
    throw error;
  }
};
