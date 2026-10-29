'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { getCustomerSession } from '@/lib/utils/customer-auth';
import { isValidPkMobile, normalizePkPhone } from '@/lib/phone';
import { Order } from '@/lib/types';
import { mapOrder } from './types';

/**
 * Fetch orders for the currently logged-in customer.
 *
 * SECURITY: customer sessions are OUR own signed cookie (not Supabase Auth), so
 * the request is `anon` to Postgres. `orders` no longer grants anon SELECT
 * (customer PII must never be publicly readable), therefore this runs with the
 * service-role client — scoped by the session-derived filters below, which is
 * exactly what the old anon query relied on RLS for.
 */
export async function getCustomerOrders(): Promise<Order[]> {
  try {
    const session = await getCustomerSession();
    if (!session) return [];

    const supabase = supabaseAdmin;
    
    // Fetch orders matching customer_id, OR matching customer's phone/email if placed as guest
    let query = supabase
      .from('orders')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    const conditions: string[] = [`customer_id.eq.${session.id}`];

    if (session.phone) {
      const norm = isValidPkMobile(session.phone) ? normalizePkPhone(session.phone) : session.phone;
      conditions.push(`customer_phone.eq.${norm}`);
      const raw = session.phone.replace(/\D/g, '');
      if (raw && raw !== norm) {
        conditions.push(`customer_phone.eq.${raw}`);
      }
    }

    if (session.email) {
      conditions.push(`customer_email.eq.${session.email.trim().toLowerCase()}`);
    }

    query = query.or(conditions.join(','));

    const { data, error } = await query;

    if (error) throw error;
    return (data ?? [])
      .filter((r) => !r.deleted_at && r.status !== 'trash' && r.status !== 'deleted')
      .map(mapOrder);
  } catch (err) {
    console.error('getCustomerOrders failed:', err);
    return [];
  }
}
