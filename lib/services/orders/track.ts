'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { Order } from '@/lib/types';
import { normalizePkPhone } from '@/lib/phone';
import { mapOrder } from './types';

export interface TrackOrderResult {
  ok: boolean;
  error?: string;
  order?: Order;
}

/**
 * Public guest order tracking. Secure by design: requires BOTH the exact order
 * number AND a phone that matches the order's stored phone (normalized). This
 * prevents order enumeration — knowing an order number alone reveals nothing.
 * Runs server-side with the service-role client (never exposed to the client).
 */
export async function trackOrder(orderNumber: string, phone: string): Promise<TrackOrderResult> {
  const rawNum = (orderNumber || '').trim();
  const num = rawNum.replace(/^#/, '').trim();
  const normPhone = normalizePkPhone(phone);

  if (!num) return { ok: false, error: 'Order number is required.' };
  if (!normPhone) return { ok: false, error: 'Please enter a valid phone number (e.g. 0300 1234567).' };

  try {
    // Look up by order number (unique). Forgiving of '#' prefix and case.
    let { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .ilike('order_number', num)
      .limit(1);

    if ((!data || data.length === 0) && rawNum !== num) {
      const res = await supabaseAdmin
        .from('orders')
        .select('*')
        .ilike('order_number', rawNum)
        .limit(1);
      data = res.data;
      error = res.error;
    }

    if (error) throw error;
    const row = data?.[0];

    // Generic message whether not-found or phone-mismatch (no info leak)
    if (!row) {
      return { ok: false, error: 'No order found with this order number and phone.' };
    }

    const rowPhoneNorm = row.customer_phone ? normalizePkPhone(row.customer_phone) : '';
    const rowPhoneRaw = row.customer_phone ? row.customer_phone.replace(/\D/g, '') : '';
    const inputPhoneRaw = phone.replace(/\D/g, '');

    const phoneMatches = 
      (rowPhoneNorm && rowPhoneNorm === normPhone) ||
      (rowPhoneRaw && inputPhoneRaw && (rowPhoneRaw.endsWith(inputPhoneRaw) || inputPhoneRaw.endsWith(rowPhoneRaw)));

    if (!phoneMatches) {
      return { ok: false, error: 'No order found with this order number and phone.' };
    }

    return { ok: true, order: mapOrder(row) };
  } catch (err: any) {
    console.error('[trackOrder] failed:', err);
    return { ok: false, error: 'Something went wrong. Please try again.' };
  }
}

/**
 * Public order lookup by unguessable access token (the token itself is the secret,
 * like a receipt URL). Powers /order/[token]. Runs server-side with the service-role
 * client; no phone gate needed because the 64-char token is not enumerable.
 */
export async function getOrderByToken(token: string): Promise<Order | null> {
  const t = (token || '').trim();
  // Basic shape guard — tokens are 64 hex chars; reject junk early (no DB hit).
  if (!t || t.length < 24 || !/^[a-f0-9]+$/i.test(t)) return null;

  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('access_token', t)
      .is('deleted_at', null)
      .limit(1);

    if (error) throw error;
    const row = data?.[0];
    if (!row) return null;
    return mapOrder(row);
  } catch (err) {
    console.error('[getOrderByToken] failed:', err);
    return null;
  }
}
