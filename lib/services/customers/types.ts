import { Order } from '@/lib/types';

export interface OrderRow {
  id: string;
  order_number: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  items?: unknown;
  subtotal?: string | number | null;
  total?: string | number | null;
  status: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export const mapOrder = (row: OrderRow): Order => ({
  id: row.id,
  orderNumber: row.order_number,
  customerName: row.customer_name || undefined,
  customerPhone: row.customer_phone || undefined,
  items: (row.items || []) as any[],
  subtotal: row.subtotal ? parseFloat(row.subtotal.toString()) : 0,
  total: row.total ? parseFloat(row.total.toString()) : 0,
  status: row.status as Order['status'],
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}
