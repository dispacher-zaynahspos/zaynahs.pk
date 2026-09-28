import { Order, CartItem, StatusLogItem } from '@/lib/types';

// Fool-proof read-normalizers (RULE D13): existing orders.items / orders.status_logs JSONB
// may hold legacy camelCase keys. Convert to snake_case ON READ so historical orders never
// break and no data is lost. Once a DB backfill migration runs, these become no-ops.
export function normalizeCartItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((i: any) => ({
    ...i,
    selected_variant: i.selected_variant ?? i.selectedVariant,
    selected_modifiers: i.selected_modifiers ?? i.selectedModifiers ?? [],
    unit_price: i.unit_price ?? i.unitPrice,
    total: i.total,
    discount_amount: i.discount_amount ?? i.discountAmount,
    discount_type: i.discount_type ?? i.discountType,
    discount_value: i.discount_value ?? i.discountValue,
    added_later: i.added_later ?? i.addedLater,
  })) as CartItem[];
}

export function normalizeStatusLogs(raw: unknown): StatusLogItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((l: any) => ({
    ...l,
    created_at: l.created_at ?? l.createdAt,
  })) as StatusLogItem[];
}

export interface OrderRow {
  id: string;
  order_number: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  customer_id?: string | null;
  items?: unknown;
  subtotal?: string | number | null;
  total?: string | number | null;
  discount_amount?: string | number | null;
  shipping_amount?: string | number | null;
  shipping_method_name?: string | null;
  discount_code?: string | null;
  status: string;
  payment_status?: string | null;
  fulfillment_status?: string | null;
  tags?: string[] | null;
  notes?: string | null;
  staff_notes?: string | null;
  status_logs?: unknown;
  review_email_pending?: boolean | null;
  delivered_at?: string | null;
  tracking_number?: string | null;
  courier_name?: string | null;
  tracking_url?: string | null;
  cancel_reason?: string | null;
  refund_amount?: string | number | null;
  access_token?: string | null;
  payment_proof_url?: string | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export const mapOrder = (row: OrderRow): Order => ({
  id: row.id,
  order_number: row.order_number,
  customer_name: row.customer_name || undefined,
  customer_phone: row.customer_phone || undefined,
  customer_email: row.customer_email || undefined,
  customer_id: row.customer_id || undefined,
  items: normalizeCartItems(row.items),
  subtotal: row.subtotal ? parseFloat(row.subtotal.toString()) : 0,
  total: row.total ? parseFloat(row.total.toString()) : 0,
  discount_amount: row.discount_amount ? parseFloat(row.discount_amount.toString()) : 0,
  shipping_amount: row.shipping_amount ? parseFloat(row.shipping_amount.toString()) : 0,
  shipping_method_name: row.shipping_method_name || undefined,
  discount_code: row.discount_code || undefined,
  status: row.status as Order['status'],
  payment_status: (row.payment_status as Order['payment_status']) || 'unpaid',
  fulfillment_status: (row.fulfillment_status as Order['fulfillment_status']) || 'unfulfilled',
  tags: row.tags || [],
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
  access_token: row.access_token || undefined,
  payment_proof_url: row.payment_proof_url || undefined,
  deleted_at: row.deleted_at || undefined,
  created_at: row.created_at,
  updated_at: row.updated_at
});
