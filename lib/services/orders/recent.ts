'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * Public shape for the "recent buyers" social-proof ticker.
 *
 * WHY THIS EXISTS (security): the ticker used to call `getOrdersClient()`, which
 * read the whole `orders` table with the anon key from the browser. That forced
 * `orders` to keep a `Public select USING (true)` RLS policy — exposing every
 * customer's name, phone, email and order token.
 *
 * This server action reads the same data with the service-role client, returns
 * ONLY the three display fields, and masks the buyer name. The anon role no
 * longer needs any access to `orders`.
 */
export interface RecentBuyer {
  /** Masked display name, e.g. "Ayesha K." */
  buyer_name: string;
  /** City parsed from the order notes, or "Pakistan". */
  city: string;
  /** First item's product id, so the client can resolve the product it already has. */
  product_id?: string;
  created_at: string;
}

function maskName(raw: string): string {
  const parts = raw.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'A customer';
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1][0]}.`;
}

export async function getRecentBuyersPublic(limit = 20): Promise<RecentBuyer[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 50);

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('customer_name, notes, items, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(safeLimit);

  if (error) {
    console.error('[orders] getRecentBuyersPublic failed:', error);
    return [];
  }

  return (data ?? []).flatMap((row) => {
    const name = String(row.customer_name ?? '').trim();
    if (!name) return [];

    const items = Array.isArray(row.items) ? row.items : [];
    const first = items[0] as
      | { product_id?: string; productId?: string }
      | undefined;

    const cityMatch = String(row.notes ?? '').match(/City:\s*([^\n\r]+)/i);

    return [
      {
        buyer_name: maskName(name),
        city: cityMatch?.[1]?.trim() || 'Pakistan',
        product_id: first?.product_id || first?.productId,
        created_at: row.created_at as string,
      },
    ];
  });
}
