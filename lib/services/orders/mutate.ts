'use server';

import { createClient } from '@/lib/supabase/server';
import { Order, CartItem, StatusLogItem } from '@/lib/types';
import { mapOrder } from './types';
import { safeAction } from '@/lib/utils/serverAction';

export const updateOrderStatus = async (id: string, status: Order['status']): Promise<Order> => {
  try {
    const supabase = await createClient();

    // 1. Fetch current order to get its status logs
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('status, status_logs')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const oldStatus = currentOrder.status;
    const currentLogs = (currentOrder.status_logs || []) as StatusLogItem[];

    // 2. Add log entry if status changed
    let updatedLogs = currentLogs;
    if (oldStatus !== status) {
      const logEntry: StatusLogItem = {
        id: crypto.randomUUID(),
        type: 'status_change',
        message: `Order status changed from ${oldStatus.toUpperCase()} to ${status.toUpperCase()}`,
        status: status,
        createdAt: new Date().toISOString()
      };
      updatedLogs = [...currentLogs, logEntry];
    }

    // 3. Update order in database
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status,
        status_logs: updatedLogs
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    const mapped = mapOrder(data);

    // Await the email dispatch so the serverless function does not exit/freeze before delivery completes
    if (oldStatus !== status) {
      try {
        const { onOrderStatusChange } = await import('@/lib/email/triggers');
        await onOrderStatusChange(mapped, { name: mapped.customerName, phone: mapped.customerPhone }, status);
      } catch (err) {
        console.error('[Email Trigger] failed in updateOrderStatus trigger:', err);
      }
    }

    return mapped;
  } catch (error) {
    console.error('[orders] updateOrderStatus failed:', error);
    throw error;
  }
};

export const updateOrderDetails = async (
  id: string,
  updates: {
    items?: CartItem[];
    subtotal?: number;
    total?: number;
    discountAmount?: number;
    shippingAmount?: number;
    shippingMethodName?: string;
    discountCode?: string;
    status?: Order['status'];
    staffNotes?: string;
    statusLogs?: StatusLogItem[];
    deliveredAt?: string;
    trackingNumber?: string;
    courierName?: string;
    trackingUrl?: string;
    cancelReason?: string;
    refundAmount?: number;
    reviewEmailPending?: boolean;
    customerName?: string;
    customerPhone?: string;
    notes?: string;
  }
): Promise<Order> => {
  try {
    const supabase = await createClient();

    // Fetch current state before update to detect changes
    const { data: currentOrder } = await supabase
      .from('orders')
      .select('status, tracking_number')
      .eq('id', id)
      .single();
      
    const oldStatus = currentOrder?.status;
    const oldTracking = currentOrder?.tracking_number;

    const payload: any = {};
    if (updates.items !== undefined) payload.items = updates.items;
    if (updates.subtotal !== undefined) payload.subtotal = updates.subtotal;
    if (updates.total !== undefined) payload.total = updates.total;
    if (updates.discountAmount !== undefined) payload.discount_amount = updates.discountAmount;
    if (updates.shippingAmount !== undefined) payload.shipping_amount = updates.shippingAmount;
    if (updates.shippingMethodName !== undefined) payload.shipping_method_name = updates.shippingMethodName;
    if (updates.discountCode !== undefined) payload.discount_code = updates.discountCode;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.staffNotes !== undefined) payload.staff_notes = updates.staffNotes;
    if (updates.statusLogs !== undefined) payload.status_logs = updates.statusLogs;
    if (updates.deliveredAt !== undefined) payload.delivered_at = updates.deliveredAt;
    if (updates.trackingNumber !== undefined) payload.tracking_number = updates.trackingNumber;
    if (updates.courierName !== undefined) payload.courier_name = updates.courierName;
    if (updates.trackingUrl !== undefined) payload.tracking_url = updates.trackingUrl;
    if (updates.cancelReason !== undefined) payload.cancel_reason = updates.cancelReason;
    if (updates.refundAmount !== undefined) payload.refund_amount = updates.refundAmount;
    if (updates.reviewEmailPending !== undefined) payload.review_email_pending = updates.reviewEmailPending;
    if (updates.customerName !== undefined) payload.customer_name = updates.customerName;
    if (updates.customerPhone !== undefined) payload.customer_phone = updates.customerPhone;
    if (updates.notes !== undefined) payload.notes = updates.notes;

    const { data, error } = await supabase
      .from('orders')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    const mapped = mapOrder(data);

    // Call triggers if status changed OR if status is shipped/out_for_delivery and tracking details were added/updated
    const statusChanged = updates.status !== undefined && oldStatus !== updates.status;
    const trackingUpdated = ['shipped', 'out_for_delivery'].includes(mapped.status) && 
                            updates.trackingNumber !== undefined && 
                            oldTracking !== updates.trackingNumber;

    if (statusChanged || trackingUpdated) {
      try {
        const { onOrderStatusChange } = await import('@/lib/email/triggers');
        await onOrderStatusChange(mapped, { email: mapped.customerEmail, name: mapped.customerName, phone: mapped.customerPhone }, mapped.status);
      } catch (err) {
        console.error('[Email Trigger] failed in updateOrderDetails:', err);
      }
    }

    return mapped;
  } catch (error) {
    console.error('[orders] updateOrderDetails failed:', error);
    throw error;
  }
};

export const deleteOrder = async (id: string): Promise<void> => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('orders')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('[orders] deleteOrder failed:', error);
    throw error;
  }
};

export const restoreOrder = async (id: string): Promise<void> => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('orders')
      .update({ deleted_at: null })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('[orders] restoreOrder failed:', error);
    throw error;
  }
};

export const hardDeleteOrder = async (id: string): Promise<void> => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('[orders] hardDeleteOrder failed:', error);
    throw error;
  }
};

// SAFE ACTION WRAPPERS
export const updateOrderStatusSafe = async (...args: Parameters<typeof updateOrderStatus>) => safeAction(updateOrderStatus(...args));
export const updateOrderDetailsSafe = async (...args: Parameters<typeof updateOrderDetails>) => safeAction(updateOrderDetails(...args));
export const deleteOrderSafe = async (...args: Parameters<typeof deleteOrder>) => safeAction(deleteOrder(...args));
export const restoreOrderSafe = async (...args: Parameters<typeof restoreOrder>) => safeAction(restoreOrder(...args));
export const hardDeleteOrderSafe = async (...args: Parameters<typeof hardDeleteOrder>) => safeAction(hardDeleteOrder(...args));
