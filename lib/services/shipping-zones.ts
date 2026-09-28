'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { ShippingZone } from '@/lib/types';
import { revalidateStorefrontEdge } from '@/lib/revalidate';

function mapZone(row: any): ShippingZone {
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
  const supabase = await createClient();
  let query = supabase.from('shipping_zones').select('*').order('sort_order', { ascending: true });
  if (onlyActive) query = query.eq('active', true);
  const { data, error } = await query;
  if (error) {
    console.error('getShippingZones failed:', error);
    throw error;
  }
  return (data || []).map(mapZone);
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
  const supabase = await createClient();

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
  const supabase = await createClient();
  const payload: any = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.cities !== undefined) payload.cities = data.cities;
  if (data.cost !== undefined) payload.cost = data.cost;
  if (data.free_threshold !== undefined) payload.free_threshold = data.free_threshold;
  if (data.estimated_days !== undefined) payload.estimated_days = data.estimated_days;
  if (data.is_default !== undefined) payload.is_default = data.is_default;
  if (data.active !== undefined) payload.active = data.active;
  if (data.sort_order !== undefined) payload.sort_order = data.sort_order;
  payload.updated_at = new Date().toISOString();

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
  const supabase = await createClient();
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
