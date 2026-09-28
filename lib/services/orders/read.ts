'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Order } from '@/lib/types';
import { mapOrder } from './types';

export const getOrders = async (): Promise<Order[]> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapOrder);
  } catch (error) {
    console.error('[orders] getOrders failed:', error);
    throw error;
  }
};

export const getOrdersByCustomerId = async (customerId: string): Promise<Order[]> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapOrder);
  } catch (error) {
    console.error('[orders] getOrdersByCustomerId failed:', error);
    throw error;
  }
};

/** Lightweight count of a customer's non-deleted orders (for the order-detail customer card). */
export const getCustomerOrderCount = async (customerId: string): Promise<number> => {
  try {
    const { count, error } = await supabaseAdmin
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', customerId)
      .is('deleted_at', null);
    if (error) throw error;
    return count ?? 0;
  } catch (error) {
    console.error('[orders] getCustomerOrderCount failed:', error);
    return 0;
  }
};

export const getDeletedOrders = async (): Promise<Order[]> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapOrder);
  } catch (error) {
    console.error('[orders] getDeletedOrders failed:', error);
    throw error;
  }
};

export const getOrderById = async (id: string): Promise<Order | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    // Single source of truth — use the shared mapper (avoids field drift).
    return mapOrder(data as any);
  } catch (error) {
    console.error('[orders] getOrderById failed:', error);
    return null;
  }
};
