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
  order_number: row.order_number,
  customer_name: row.customer_name || undefined,
  customer_phone: row.customer_phone || undefined,
  items: (row.items || []) as any[],
  subtotal: row.subtotal ? parseFloat(row.subtotal.toString()) : 0,
  total: row.total ? parseFloat(row.total.toString()) : 0,
  status: row.status as Order['status'],
  created_at: row.created_at,
  updated_at: row.updated_at
});

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}
