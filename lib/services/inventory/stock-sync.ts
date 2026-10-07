'use server';

/**
 * lib/services/inventory/stock-sync.ts
 *
 * SSOT for all inventory adjustments triggered by order lifecycle events.
 *
 * Rules enforced:
 *   D1  — variant stock is mandatory
 *   D15 — atomic writes: calls DB RPCs that run in a single transaction
 *   D13 — snake_case throughout
 *   SSOT1 — this is THE only place that adjusts stock from order events
 *
 * Called from:
 *   • lib/services/orders/mutate.ts  → updateOrderStatus (cancel/refund)
 *   • lib/services/orders/mutate.ts  → updateOrderDetails (item edit)
 *   • lib/services/orders/mutate.ts  → deleteOrder (trash → treat as cancel)
 *
 * NEVER called from the client. NEVER called from a component.
 * Import only in server actions / API routes using supabaseAdmin.
 */

import { supabaseAdmin } from '@/lib/supabase/admin';
import { CartItem } from '@/lib/types';


/**
 * Restore stock for every item in an order when it is cancelled or refunded.
 * Idempotent if called twice: clamped at 0 so double-restore won't over-inflate.
 *
 * @param order_id  - UUID of the order (for timeline log)
 * @param items     - The order's items array (CartItem[])
 * @returns number of stock lines adjusted, or 0 on no-op / service items only
 */
export async function restoreStockOnCancel(
  order_id: string,
  items: CartItem[]
): Promise<number> {
  if (!items || items.length === 0) return 0;

  // Convert CartItem[] → JSONB that the RPC understands
  // The RPC handles both snake_case and camelCase field paths for safety
  const items_json = JSON.stringify(
    items.map((i) => ({
      product_id:  i.product?.id ?? null,
      variant_id:  i.selected_variant?.id ?? null,
      quantity:    i.quantity,
    }))
  );

  const { data, error } = await supabaseAdmin.rpc('restore_stock_on_cancel', {
    p_order_id: order_id,
    p_items:    items_json,
  });

  if (error) {
    console.error('[inventory] restoreStockOnCancel RPC failed:', error);
    throw error; // surface to caller — D15: caller must handle rollback
  }

  return (data as number) ?? 0;
}

/**
 * Adjust stock when an admin edits order items (add, remove, change qty).
 * Computes delta per product/variant between old and new items and applies it atomically.
 *
 * @param order_id  - UUID of the order (for timeline log)
 * @param old_items - Items before the edit
 * @param new_items - Items after the edit
 * @returns number of stock lines adjusted
 */
export async function adjustStockOnOrderEdit(
  order_id: string,
  old_items: CartItem[],
  new_items: CartItem[]
): Promise<number> {
  if (!old_items && !new_items) return 0;

  const mapItems = (items: CartItem[]) =>
    (items || []).map((i) => ({
      product_id: i.product?.id ?? null,
      variant_id: i.selected_variant?.id ?? null,
      quantity:   i.quantity,
    }));

  const { data, error } = await supabaseAdmin.rpc('adjust_stock_on_order_edit', {
    p_order_id:  order_id,
    p_old_items: JSON.stringify(mapItems(old_items)),
    p_new_items: JSON.stringify(mapItems(new_items)),
  });

  if (error) {
    console.error('[inventory] adjustStockOnOrderEdit RPC failed:', error);
    throw error; // surface to caller — D15
  }

  return (data as number) ?? 0;
}

