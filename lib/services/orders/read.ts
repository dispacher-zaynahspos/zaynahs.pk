'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Order, CartItem, StatusLogItem } from '@/lib/types';
import { mapOrder, normalizeCartItems, normalizeStatusLogs } from './types';

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

    return {
      id: data.id,
      order_number: data.order_number,
      customer_name: data.customer_name || undefined,
      customer_phone: data.customer_phone || undefined,
      customer_id: data.customer_id || undefined,
      items: normalizeCartItems(data.items),
      subtotal: data.subtotal ? parseFloat(data.subtotal.toString()) : 0,
      total: data.total ? parseFloat(data.total.toString()) : 0,
      discount_amount: data.discount_amount ? parseFloat(data.discount_amount.toString()) : 0,
      shipping_amount: data.shipping_amount ? parseFloat(data.shipping_amount.toString()) : 0,
      shipping_method_name: data.shipping_method_name || undefined,
      discount_code: data.discount_code || undefined,
      status: data.status as Order['status'],
      notes: data.notes || undefined,
      staff_notes: data.staff_notes || undefined,
      status_logs: normalizeStatusLogs(data.status_logs),
      review_email_pending: data.review_email_pending ?? false,
      delivered_at: data.delivered_at || undefined,
      tracking_number: data.tracking_number || undefined,
      courier_name: data.courier_name || undefined,
      tracking_url: data.tracking_url || undefined,
      cancel_reason: data.cancel_reason || undefined,
      refund_amount: data.refund_amount ? parseFloat(data.refund_amount.toString()) : undefined,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('[orders] getOrderById failed:', error);
    return null;
  }
};
