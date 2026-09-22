import { Order, CartItem, StatusLogItem } from '@/lib/types';

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
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export const mapOrder = (row: OrderRow): Order => ({
  id: row.id,
  orderNumber: row.order_number,
  customerName: row.customer_name || undefined,
  customerPhone: row.customer_phone || undefined,
  customerEmail: row.customer_email || undefined,
  customerId: row.customer_id || undefined,
  items: (row.items || []) as CartItem[],
  subtotal: row.subtotal ? parseFloat(row.subtotal.toString()) : 0,
  total: row.total ? parseFloat(row.total.toString()) : 0,
  discountAmount: row.discount_amount ? parseFloat(row.discount_amount.toString()) : 0,
  shippingAmount: row.shipping_amount ? parseFloat(row.shipping_amount.toString()) : 0,
  shippingMethodName: row.shipping_method_name || undefined,
  discountCode: row.discount_code || undefined,
  status: row.status as Order['status'],
  notes: row.notes || undefined,
  staffNotes: row.staff_notes || undefined,
  statusLogs: (row.status_logs || []) as StatusLogItem[],
  reviewEmailPending: row.review_email_pending ?? false,
  deliveredAt: row.delivered_at || undefined,
  trackingNumber: row.tracking_number || undefined,
  courierName: row.courier_name || undefined,
  trackingUrl: row.tracking_url || undefined,
  cancelReason: row.cancel_reason || undefined,
  refundAmount: row.refund_amount ? parseFloat(row.refund_amount.toString()) : undefined,
  deletedAt: row.deleted_at || undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});
