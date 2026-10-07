'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Order, CartItem, StatusLogItem } from '@/lib/types';
import { mapOrder } from './types';
import { safeAction } from '@/lib/utils/serverAction';
import {
  restoreStockOnCancel,
  adjustStockOnOrderEdit,
  shouldRestoreStock,
  shouldDeductStock,
} from '@/lib/services/inventory/stock-sync';

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
        created_at: new Date().toISOString()
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

    // ── INVENTORY SYNC (D15 — stock restore on cancel/refund) ──────────
    // Runs AFTER the order row is committed so the RPC log lands in the
    // same order timeline. RPC is atomic (single PG transaction).
    if (oldStatus !== status) {
      if (shouldRestoreStock(oldStatus, status)) {
        try {
          // Fetch full items from DB (mapped items may be a subset)
          const { data: fullOrder } = await supabaseAdmin
            .from('orders')
            .select('items')
            .eq('id', id)
            .single();
          if (fullOrder?.items?.length) {
            await restoreStockOnCancel(id, fullOrder.items);
          }
        } catch (invErr) {
          // Log but do not throw — order status is already saved.
          // Inventory reconciliation can be run manually if this fails.
          console.error('[inventory] restoreStockOnCancel failed after status change:', invErr);
        }
      } else if (shouldDeductStock(oldStatus, status)) {
        // Un-cancelling (e.g. cancelled → confirmed) → re-deduct stock
        try {
          const { data: fullOrder } = await supabaseAdmin
            .from('orders')
            .select('items')
            .eq('id', id)
            .single();
          if (fullOrder?.items?.length) {
            // Restore with negative qty = deduct
            await supabaseAdmin.rpc('restore_stock_on_cancel', {
              p_order_id: id,
              p_items: JSON.stringify(
                fullOrder.items.map((i: any) => ({
                  product_id:  i.product?.id ?? i.product_id ?? null,
                  variant_id:  i.selected_variant?.id ?? i.variant_id ?? null,
                  quantity:    -(i.quantity ?? 1), // negative = deduct
                }))
              ),
            });
          }
        } catch (invErr) {
          console.error('[inventory] re-deduct stock failed after un-cancel:', invErr);
        }
      }
    }

    // Await the email dispatch so the serverless function does not exit/freeze before delivery completes
    if (oldStatus !== status) {
      try {
        const { onOrderStatusChange } = await import('@/lib/email/triggers');
        await onOrderStatusChange(mapped, { name: mapped.customer_name, phone: mapped.customer_phone }, status);
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

/** Set payment status (unpaid|paid|refunded) + log a timeline event. Atomic single-row update. */
export const setPaymentStatus = async (id: string, paymentStatus: 'unpaid' | 'paid' | 'refunded', method?: string): Promise<Order> => {
  try {
    const supabase = await createClient();
    const { data: cur, error: fErr } = await supabase.from('orders').select('payment_status, status_logs').eq('id', id).single();
    if (fErr) throw fErr;
    const logs = (cur?.status_logs || []) as StatusLogItem[];
    if (cur?.payment_status !== paymentStatus) {
      logs.push({
        id: crypto.randomUUID(),
        type: 'payment',
        message: `Payment marked ${paymentStatus.toUpperCase()}${method ? ` (${method})` : ''}`,
        status: paymentStatus,
        created_at: new Date().toISOString(),
      } as StatusLogItem);
    }
    const { data, error } = await supabase.from('orders').update({ payment_status: paymentStatus, status_logs: logs }).eq('id', id).select('*').single();
    if (error) throw error;
    return mapOrder(data);
  } catch (error) {
    console.error('[orders] setPaymentStatus failed:', error);
    throw error;
  }
};

/** Set fulfillment status (unfulfilled|fulfilled) + log a timeline event. */
export const setFulfillmentStatus = async (id: string, fulfillmentStatus: 'unfulfilled' | 'fulfilled'): Promise<Order> => {
  try {
    const supabase = await createClient();
    const { data: cur, error: fErr } = await supabase.from('orders').select('fulfillment_status, status_logs').eq('id', id).single();
    if (fErr) throw fErr;
    const logs = (cur?.status_logs || []) as StatusLogItem[];
    if (cur?.fulfillment_status !== fulfillmentStatus) {
      logs.push({
        id: crypto.randomUUID(),
        type: 'fulfillment',
        message: `Order marked ${fulfillmentStatus.toUpperCase()}`,
        status: fulfillmentStatus,
        created_at: new Date().toISOString(),
      } as StatusLogItem);
    }
    const { data, error } = await supabase.from('orders').update({ fulfillment_status: fulfillmentStatus, status_logs: logs }).eq('id', id).select('*').single();
    if (error) throw error;
    return mapOrder(data);
  } catch (error) {
    console.error('[orders] setFulfillmentStatus failed:', error);
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

    // Fetch current state before update to detect changes + get old items for inventory delta
    const { data: currentOrder } = await supabaseAdmin
      .from('orders')
      .select('status, tracking_number, items')
      .eq('id', id)
      .single();
      
    const oldStatus   = currentOrder?.status;
    const oldTracking = currentOrder?.tracking_number;
    const oldItems    = currentOrder?.items ?? [];

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

    // ── INVENTORY SYNC: item edit delta (D15) ─────────────────────────
    // If the admin edited the items list, compute stock delta atomically.
    // Service items (is_service=true) are skipped inside the RPC.
    if (updates.items !== undefined && oldItems.length > 0) {
      try {
        await adjustStockOnOrderEdit(id, oldItems, updates.items);
      } catch (invErr) {
        // Non-fatal: order is saved, inventory reconciliation may need manual review
        console.error('[inventory] adjustStockOnOrderEdit failed after order edit:', invErr);
      }
    }

    // ── INVENTORY SYNC: status → cancel/refund via updateOrderDetails ─
    const statusChanged = updates.status !== undefined && oldStatus !== updates.status;
    if (statusChanged && updates.status) {
      if (shouldRestoreStock(oldStatus ?? '', updates.status)) {
        try {
          const itemsForRestore = updates.items ?? oldItems;
          if (itemsForRestore.length) {
            await restoreStockOnCancel(id, itemsForRestore);
          }
        } catch (invErr) {
          console.error('[inventory] restoreStockOnCancel failed in updateOrderDetails:', invErr);
        }
      }
    }

    // Call triggers if status changed OR tracking updated
    const trackingUpdated = ['shipped', 'out_for_delivery'].includes(mapped.status) && 
                            updates.trackingNumber !== undefined && 
                            oldTracking !== updates.trackingNumber;

    if (statusChanged || trackingUpdated) {
      try {
        const { onOrderStatusChange } = await import('@/lib/email/triggers');
        await onOrderStatusChange(mapped, { email: mapped.customer_email, name: mapped.customer_name, phone: mapped.customer_phone }, mapped.status);
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

    // ── INVENTORY SYNC: restore stock before soft-delete (D15) ────────
    // Fetch items + current status. Only restore if NOT already cancelled
    // (to avoid double-restoring for an order that was cancelled then trashed).
    try {
      const { data: orderSnap } = await supabaseAdmin
        .from('orders')
        .select('status, items')
        .eq('id', id)
        .single();
      if (orderSnap && !shouldRestoreStock('', orderSnap.status) && orderSnap.items?.length) {
        // Order is active (not already cancelled) → restore stock on trash
        // We use shouldRestoreStock('active', 'cancelled') logic by calling restore directly
        // only when the order isn't already in a cancellation state.
        const isCancelled = ['cancelled', 'refunded'].includes(orderSnap.status);
        if (!isCancelled) {
          await restoreStockOnCancel(id, orderSnap.items);
        }
      }
    } catch (invErr) {
      console.error('[inventory] restoreStockOnCancel failed before deleteOrder:', invErr);
      // Non-fatal: proceed with soft-delete
    }

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

/** Replace an order's tags. */
export const setOrderTags = async (id: string, tags: string[]): Promise<Order> => {
  try {
    const supabase = await createClient();
    const clean = Array.from(new Set(tags.map((t) => t.trim()).filter(Boolean))).slice(0, 20);
    const { data, error } = await supabase.from('orders').update({ tags: clean }).eq('id', id).select('*').single();
    if (error) throw error;
    return mapOrder(data);
  } catch (error) {
    console.error('[orders] setOrderTags failed:', error);
    throw error;
  }
};

// SAFE ACTION WRAPPERS
export const updateOrderStatusSafe = async (...args: Parameters<typeof updateOrderStatus>) => safeAction(updateOrderStatus(...args));
export const updateOrderDetailsSafe = async (...args: Parameters<typeof updateOrderDetails>) => safeAction(updateOrderDetails(...args));
export const setPaymentStatusSafe = async (...args: Parameters<typeof setPaymentStatus>) => safeAction(setPaymentStatus(...args));
export const setFulfillmentStatusSafe = async (...args: Parameters<typeof setFulfillmentStatus>) => safeAction(setFulfillmentStatus(...args));
export const setOrderTagsSafe = async (...args: Parameters<typeof setOrderTags>) => safeAction(setOrderTags(...args));
export const deleteOrderSafe = async (...args: Parameters<typeof deleteOrder>) => safeAction(deleteOrder(...args));
export const restoreOrderSafe = async (...args: Parameters<typeof restoreOrder>) => safeAction(restoreOrder(...args));
export const hardDeleteOrderSafe = async (...args: Parameters<typeof hardDeleteOrder>) => safeAction(hardDeleteOrder(...args));
