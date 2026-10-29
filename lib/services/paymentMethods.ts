'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { PaymentMethod } from '@/lib/types';
import { revalidateStorefrontEdge } from '@/lib/revalidate';

export async function getPaymentMethods(onlyActive = false): Promise<PaymentMethod[]> {
  try {
    const supabase = onlyActive ? await createClient() : supabaseAdmin;
    let query = supabase
      .from('payment_methods')
      .select('*')
      .order('sort_order', { ascending: true });

    if (onlyActive) {
      query = query.eq('active', true);
    }

    const { data, error } = await query;
    if (error) {
      if (onlyActive) {
        const { data: fbData, error: fbErr } = await supabaseAdmin
          .from('payment_methods')
          .select('*')
          .eq('active', true)
          .order('sort_order', { ascending: true });
        if (!fbErr && fbData) {
          return fbData.map(row => ({
            id: row.id,
            name: row.name,
            code: row.code,
            active: row.active,
            instructions: row.instructions,
            sort_order: row.sort_order ?? 0,
            created_at: row.created_at
          }));
        }
      }
      console.error('getPaymentMethods failed:', error);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      name: row.name,
      code: row.code,
      active: row.active,
      instructions: row.instructions,
      sort_order: row.sort_order ?? 0,
      created_at: row.created_at
    }));
  } catch (err) {
    console.error('getPaymentMethods exception:', err);
    return [];
  }
}

export async function createPaymentMethod(data: {
  name: string;
  code: string;
  active?: boolean;
  instructions?: string;
  sortOrder?: number;
}): Promise<PaymentMethod> {
  const supabase = supabaseAdmin;

  // Auto-assign next sort_order if not provided
  let sortOrder = data.sortOrder;
  if (sortOrder === undefined) {
    const { data: maxRow } = await supabase
      .from('payment_methods')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();
    sortOrder = (maxRow?.sort_order ?? 0) + 1;
  }

  const { data: row, error } = await supabase
    .from('payment_methods')
    .insert([{
      name: data.name,
      code: data.code.toLowerCase().trim(),
      active: data.active ?? true,
      instructions: data.instructions,
      sort_order: sortOrder
    }])
    .select()
    .single();

  if (error) {
    console.error('createPaymentMethod failed:', error);
    throw error;
  }

  await revalidateStorefrontEdge('payment_methods');
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    active: row.active,
    instructions: row.instructions,
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at
  };
}

export async function updatePaymentMethod(
  id: string,
  data: Partial<Omit<PaymentMethod, 'id' | 'createdAt'>>
): Promise<PaymentMethod> {
  const supabase = supabaseAdmin;

  const updatePayload: Record<string, unknown> = {};
  if (data.name !== undefined) updatePayload.name = data.name;
  if (data.code !== undefined) updatePayload.code = data.code.toLowerCase().trim();
  if (data.active !== undefined) updatePayload.active = data.active;
  if (data.instructions !== undefined) updatePayload.instructions = data.instructions;
  if (data.sort_order !== undefined) updatePayload.sort_order = data.sort_order;

  const { data: row, error } = await supabase
    .from('payment_methods')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('updatePaymentMethod failed:', error);
    throw error;
  }

  await revalidateStorefrontEdge('payment_methods');
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    active: row.active,
    instructions: row.instructions,
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at
  };
}

export async function reorderPaymentMethods(orderedIds: string[]): Promise<void> {
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabaseAdmin
      .from('payment_methods')
      .update({ sort_order: i })
      .eq('id', orderedIds[i]);
    if (error) {
      console.error('reorderPaymentMethods failed:', error);
      throw error;
    }
  }
  await revalidateStorefrontEdge('payment_methods');
}

export async function deletePaymentMethod(id: string): Promise<void> {
  const supabase = supabaseAdmin;
  const { error } = await supabase
    .from('payment_methods')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('deletePaymentMethod failed:', error);
    throw error;
  }

  await revalidateStorefrontEdge('payment_methods');
}
