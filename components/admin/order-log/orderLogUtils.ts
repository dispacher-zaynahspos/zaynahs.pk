import { Order } from '@/lib/types';

export const mapOrderRow = (row: any): Order => ({
  id: row.id,
  orderNumber: row.order_number,
  customerName: row.customer_name || undefined,
  customerPhone: row.customer_phone || undefined,
  customerId: row.customer_id || undefined,
  items: (row.items || []) as any[],
  subtotal: row.subtotal ? parseFloat(row.subtotal.toString()) : 0,
  total: row.total ? parseFloat(row.total.toString()) : 0,
  status: row.status as Order['status'],
  notes: row.notes || undefined,
  staffNotes: row.staff_notes || undefined,
  statusLogs: (row.status_logs || []) as any[],
  reviewEmailPending: row.review_email_pending ?? false,
  deliveredAt: row.delivered_at || undefined,
  trackingNumber: row.tracking_number || undefined,
  courierName: row.courier_name || undefined,
  trackingUrl: row.tracking_url || undefined,
  cancelReason: row.cancel_reason || undefined,
  refundAmount: row.refund_amount ? parseFloat(row.refund_amount.toString()) : undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at
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
