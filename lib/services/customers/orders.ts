'use server';

import { createClient } from '@/lib/supabase/server';
import { getCustomerSession } from '@/lib/utils/customer-auth';
import { Order } from '@/lib/types';
import { mapOrder } from './types';

/**
 * Fetch orders for the currently logged-in customer
 */
export async function getCustomerOrders(): Promise<Order[]> {
  try {
    const session = await getCustomerSession();
    if (!session) return [];

    const supabase = await createClient();
    
    // Fetch orders matching customer_id, OR matching customer's phone if customer_id was missed
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (session.phone) {
      query = query.or(`customer_id.eq.${session.id},customer_phone.eq.${session.phone}`);
    } else {
      query = query.eq('customer_id', session.id);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data ?? []).map(mapOrder);
  } catch (err) {
    console.error('getCustomerOrders failed:', err);
    return [];
  }
}
