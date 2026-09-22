'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Order, CartItem, StatusLogItem } from '@/lib/types';
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
      orderNumber: data.order_number,
      customerName: data.customer_name || undefined,
      customerPhone: data.customer_phone || undefined,
      customerId: data.customer_id || undefined,
      items: (data.items || []) as CartItem[],
      subtotal: data.subtotal ? parseFloat(data.subtotal.toString()) : 0,
      total: data.total ? parseFloat(data.total.toString()) : 0,
      discountAmount: data.discount_amount ? parseFloat(data.discount_amount.toString()) : 0,
      shippingAmount: data.shipping_amount ? parseFloat(data.shipping_amount.toString()) : 0,
      shippingMethodName: data.shipping_method_name || undefined,
      discountCode: data.discount_code || undefined,
      status: data.status as Order['status'],
      notes: data.notes || undefined,
      staffNotes: data.staff_notes || undefined,
      statusLogs: (data.status_logs || []) as StatusLogItem[],
      reviewEmailPending: data.review_email_pending ?? false,
      deliveredAt: data.delivered_at || undefined,
      trackingNumber: data.tracking_number || undefined,
      courierName: data.courier_name || undefined,
      trackingUrl: data.tracking_url || undefined,
      cancelReason: data.cancel_reason || undefined,
      refundAmount: data.refund_amount ? parseFloat(data.refund_amount.toString()) : undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('[orders] getOrderById failed:', error);
    return null;
  }
};
