'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { ShippingZone } from '@/lib/types';
import { revalidateStorefrontEdge } from '@/lib/revalidate';

interface ShippingZoneRow {
  id: string;
  name: string;
  cities: unknown;
  cost: number | string | null;
  free_threshold?: number | string | null;
  estimated_days?: string | null;
  is_default?: boolean | null;
  active?: boolean | null;
  sort_order?: number | null;
  created_at?: string;
  updated_at?: string;
}

function mapZone(row: ShippingZoneRow): ShippingZone {
  return {
    id: row.id,
    name: row.name,
    cities: Array.isArray(row.cities) ? row.cities : [],
    cost: Number(row.cost) || 0,
    free_threshold: row.free_threshold != null ? Number(row.free_threshold) : null,
    estimated_days: row.estimated_days || undefined,
    is_default: !!row.is_default,
    active: !!row.active,
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function getShippingZones(onlyActive = false): Promise<ShippingZone[]> {
  try {
    const supabase = onlyActive ? await createClient() : supabaseAdmin;
    let query = supabase.from('shipping_zones').select('*').order('sort_order', { ascending: true });
    if (onlyActive) query = query.eq('active', true);
    const { data, error } = await query;
    if (error) {
      if (onlyActive) {
        const { data: fbData, error: fbErr } = await supabaseAdmin
          .from('shipping_zones')
          .select('*')
          .eq('active', true)
          .order('sort_order', { ascending: true });
        if (!fbErr && fbData) return fbData.map(mapZone);
      }
      console.error('getShippingZones failed:', error);
      return [];
    }
    return (data || []).map(mapZone);
  } catch (err) {
    console.error('getShippingZones exception:', err);
    return [];
  }
}

export async function createShippingZone(data: {
  name: string;
  cities?: string[];
  cost: number;
  freeThreshold?: number | null;
  estimatedDays?: string;
  isDefault?: boolean;
  active?: boolean;
  sortOrder?: number;
}): Promise<ShippingZone> {
  const supabase = supabaseAdmin;

  let sortOrder = data.sortOrder;
  if (sortOrder === undefined) {
    const { data: maxRow } = await supabase
      .from('shipping_zones')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();
    sortOrder = (maxRow?.sort_order ?? 0) + 1;
  }

  const { data: row, error } = await supabase
    .from('shipping_zones')
    .insert([{
      name: data.name,
      cities: data.cities ?? [],
      cost: data.cost,
      free_threshold: data.freeThreshold ?? null,
      estimated_days: data.estimatedDays ?? null,
      is_default: data.isDefault ?? false,
      active: data.active ?? true,
      sort_order: sortOrder,
    }])
    .select()
    .single();

  if (error) {
    console.error('createShippingZone failed:', error);
    throw error;
  }
  await revalidateStorefrontEdge('shipping_zones');
  return mapZone(row);
}

export async function updateShippingZone(
  id: string,
  data: Partial<{
    name: string;
    cities: string[];
    cost: number;
    free_threshold: number | null;
    estimated_days: string;
    is_default: boolean;
    active: boolean;
    sort_order: number;
  }>
): Promise<ShippingZone> {
  const supabase = supabaseAdmin;
  const payload: {
    name?: string;
    cities?: string[];
    cost?: number;
    free_threshold?: number | null;
    estimated_days?: string;
    is_default?: boolean;
    active?: boolean;
    sort_order?: number;
    updated_at: string;
  } = { updated_at: new Date().toISOString() };
  if (data.name !== undefined) payload.name = data.name;
  if (data.cities !== undefined) payload.cities = data.cities;
  if (data.cost !== undefined) payload.cost = data.cost;
  if (data.free_threshold !== undefined) payload.free_threshold = data.free_threshold;
  if (data.estimated_days !== undefined) payload.estimated_days = data.estimated_days;
  if (data.is_default !== undefined) payload.is_default = data.is_default;
  if (data.active !== undefined) payload.active = data.active;
  if (data.sort_order !== undefined) payload.sort_order = data.sort_order;

  const { data: row, error } = await supabase
    .from('shipping_zones')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('updateShippingZone failed:', error);
    throw error;
  }
  await revalidateStorefrontEdge('shipping_zones');
  return mapZone(row);
}

export async function deleteShippingZone(id: string): Promise<void> {
  const supabase = supabaseAdmin;
  const { error } = await supabase.from('shipping_zones').delete().eq('id', id);
  if (error) {
    console.error('deleteShippingZone failed:', error);
    throw error;
  }
  await revalidateStorefrontEdge('shipping_zones');
}

export async function reorderShippingZones(orderedIds: string[]): Promise<void> {
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabaseAdmin
      .from('shipping_zones')
      .update({ sort_order: i })
      .eq('id', orderedIds[i]);
    if (error) {
      console.error('reorderShippingZones failed:', error);
      throw error;
    }
  }
  await revalidateStorefrontEdge('shipping_zones');
}
