import { Order } from '@/lib/types';

export const mapOrderRow = (row: any): Order => ({
  id: row.id,
  order_number: row.order_number,
  customer_name: row.customer_name || undefined,
  customer_phone: row.customer_phone || undefined,
  customer_id: row.customer_id || undefined,
  items: (row.items || []) as any[],
  subtotal: row.subtotal ? parseFloat(row.subtotal.toString()) : 0,
  total: row.total ? parseFloat(row.total.toString()) : 0,
  status: row.status as Order['status'],
  notes: row.notes || undefined,
  staff_notes: row.staff_notes || undefined,
  status_logs: (row.status_logs || []) as any[],
  review_email_pending: row.review_email_pending ?? false,
  delivered_at: row.delivered_at || undefined,
  tracking_number: row.tracking_number || undefined,
  courier_name: row.courier_name || undefined,
  tracking_url: row.tracking_url || undefined,
  cancel_reason: row.cancel_reason || undefined,
  refund_amount: row.refund_amount ? parseFloat(row.refund_amount.toString()) : undefined,
  created_at: row.created_at,
  updated_at: row.updated_at
});

export const isOrderPaid = (order: Order) => {
  const notesText = order.notes || '';
  const lines = notesText.split('\n');
  let paymentMethod = '';
  lines.forEach(line => {
    const l = line.toLowerCase();
    if (l.startsWith('payment method:')) {
      paymentMethod = line.substring('payment method:'.length).trim();
    }
  });
  const pm = paymentMethod.toLowerCase();
  if (!pm) return false;
  if (pm.includes('cash') || pm.includes('cod') || pm.includes('delivery')) {
    return false;
  }
  if (pm.includes('transfer') || pm.includes('bank') || pm.includes('nayapay') || pm.includes('easypaisa') || pm.includes('jazzcash') || pm.includes('card') || pm.includes('online')) {
    return true;
  }
  return false;
};

export const getOrderPaymentMethod = (order: Order) => {
  const notesText = order.notes || '';
  const lines = notesText.split('\n');
  let paymentMethod = '';
  lines.forEach(line => {
    const l = line.toLowerCase();
    if (l.startsWith('payment method:')) {
      paymentMethod = line.substring('payment method:'.length).trim();
    }
  });
  return paymentMethod || 'Cash on delivery';
};

export const getDeliveryStatus = (status: Order['status']) => {
  if (status === 'delivered') return 'Delivered';
  if (status === 'shipped') return 'Shipped';
  if (status === 'out_for_delivery') return 'Out for delivery';
  return '';
};
