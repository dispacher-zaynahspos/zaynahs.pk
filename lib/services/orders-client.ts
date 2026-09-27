import { createClient } from '@/lib/supabase/client';
import { Order, CartItem, StatusLogItem } from '@/lib/types';
import { normalizeCartItems, normalizeStatusLogs } from './orders/types';

export const getOrdersClient = async (): Promise<Order[]> => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data ?? []).map((row: any) => ({
      id: row.id,
      order_number: row.order_number,
      customer_name: row.customer_name || undefined,
      customer_phone: row.customer_phone || undefined,
      customer_id: row.customer_id || undefined,
      items: normalizeCartItems(row.items),
      subtotal: row.subtotal ? parseFloat(row.subtotal.toString()) : 0,
      total: row.total ? parseFloat(row.total.toString()) : 0,
      status: row.status as Order['status'],
      notes: row.notes || undefined,
      staff_notes: row.staff_notes || undefined,
      status_logs: normalizeStatusLogs(row.status_logs),
      review_email_pending: row.review_email_pending ?? false,
      delivered_at: row.delivered_at || undefined,
      tracking_number: row.tracking_number || undefined,
      courier_name: row.courier_name || undefined,
      tracking_url: row.tracking_url || undefined,
      cancel_reason: row.cancel_reason || undefined,
      refund_amount: row.refund_amount ? parseFloat(row.refund_amount.toString()) : undefined,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
  } catch (error) {
    console.error('[orders-client] getOrdersClient failed:', error);
    throw error;
  }
};
