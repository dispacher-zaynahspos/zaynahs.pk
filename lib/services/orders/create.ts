'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Order, CartItem, StatusLogItem } from '@/lib/types';
import { getCustomerSession } from '@/lib/utils/customer-auth';
import { mapOrder } from './types';

export const createOrder = async (order: {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  notes?: string;
  shippingCost?: number;
  shippingMethodName?: string;
}): Promise<Order> => {
  try {
    const supabase = await createClient();
    const session = await getCustomerSession();
    let customerId = session ? session.id : null;

    console.log('[orders] Step 1: customerId resolved to', customerId);

    // Auto-create/lookup guest customer record if phone is provided and they aren't logged in
    if (!customerId && (order.customerPhone || order.customerEmail)) {
      console.log('[orders] Step 2: looking up or creating customer');
      try {
        let existingCustomer = null;

        // 1. Try to find by email if email is provided
        if (order.customerEmail) {
          const { data } = await supabaseAdmin
            .from('customers')
            .select('id, phone, email')
            .eq('email', order.customerEmail.trim().toLowerCase())
            .maybeSingle();
          if (data) {
            existingCustomer = data;
          }
        }

        // 2. Try to find by phone if not found by email
        if (!existingCustomer && order.customerPhone) {
          const rawPhone = order.customerPhone.trim();
          const cleanPhone = rawPhone.replace(/\D/g, '');

          // Check raw phone
          let { data } = await supabaseAdmin
            .from('customers')
            .select('id, phone, email')
            .eq('phone', rawPhone)
            .maybeSingle();

          if (!data && cleanPhone) {
            // Check clean phone
            const { data: dataClean } = await supabaseAdmin
              .from('customers')
              .select('id, phone, email')
              .eq('phone', cleanPhone)
              .maybeSingle();
            data = dataClean;
          }
          
          if (data) {
            existingCustomer = data;
          }
        }

        if (existingCustomer) {
          customerId = existingCustomer.id;
          
          // Update customer fields if they changed or were empty
          const updates: Record<string, any> = {};
          if (order.customerEmail && existingCustomer.email !== order.customerEmail) {
            updates.email = order.customerEmail.trim().toLowerCase();
          }
          if (order.customerPhone && existingCustomer.phone !== order.customerPhone) {
            updates.phone = order.customerPhone.trim();
          }
          if (order.customerName && order.customerName !== 'Guest Customer') {
            updates.name = order.customerName;
          }

          if (Object.keys(updates).length > 0) {
            await supabaseAdmin
              .from('customers')
              .update(updates)
              .eq('id', customerId);
          }
        } else {
          // Create new customer record
          const { data: newCustomer, error: insertError } = await supabaseAdmin
            .from('customers')
            .insert({
              name: order.customerName || 'Guest Customer',
              phone: order.customerPhone ? order.customerPhone.trim() : null,
              email: order.customerEmail ? order.customerEmail.trim().toLowerCase() : null,
              password_hash: null
            })
            .select('id')
            .single();

          if (insertError) {
            console.error('Error inserting customer:', insertError);
            if (order.customerEmail) {
              const { data } = await supabaseAdmin
                .from('customers')
                .select('id')
                .eq('email', order.customerEmail.trim().toLowerCase())
                .maybeSingle();
              if (data) customerId = data.id;
            }
            if (!customerId && order.customerPhone) {
              const { data } = await supabaseAdmin
                .from('customers')
                .select('id')
                .eq('phone', order.customerPhone.trim())
                .maybeSingle();
              if (data) customerId = data.id;
            }
          } else if (newCustomer) {
            customerId = newCustomer.id;
          }
        }
      } catch (err) {
        console.error('Failed to auto-create guest customer:', err);
      }
    }

    // Initialize the timeline with the creation event
    const initialLogs: StatusLogItem[] = [
      {
        id: crypto.randomUUID(),
        type: 'creation',
        message: 'Order created clicked by customer on WhatsApp',
        createdAt: new Date().toISOString()
      }
    ];

    // Check if the order is pre-paid (transfer/digital options selected at checkout)
    const notesText = order.notes || '';
    const lines = notesText.split('\n');
    let paymentMethod = '';
    lines.forEach(line => {
      const l = line.toLowerCase();
      if (l.startsWith('payment method:')) {
        paymentMethod = line.substring('payment method:'.length).trim();
      }
    });

    const isPaidOption = (() => {
      const pm = paymentMethod.toLowerCase();
      if (!pm) return false;
      if (pm.includes('cash') || pm.includes('cod') || pm.includes('delivery')) {
        return false;
      }
      if (pm.includes('transfer') || pm.includes('bank') || pm.includes('nayapay') || pm.includes('easypaisa') || pm.includes('jazzcash') || pm.includes('card') || pm.includes('online')) {
        return true;
      }
      return false;
    })();

    if (isPaidOption) {
      initialLogs.push({
        id: crypto.randomUUID(),
        type: 'payment',
        message: `Payment of Rs. ${order.total.toLocaleString()} processed via ${paymentMethod}`,
        notes: 'Status: Paid',
        createdAt: new Date().toISOString()
      });
    }

    // Retry up to 3 times on 23505 (duplicate order_number)
    let data: any;
    let insertAttempt = 0;
    const MAX_ATTEMPTS = 3;
    while (insertAttempt < MAX_ATTEMPTS) {
      insertAttempt++;
      const { data: result, error: insertError } = await supabase
        .from('orders')
        .insert({
          customer_name: order.customerName,
          customer_phone: order.customerPhone,
          customer_id: customerId,
          items: order.items,
          subtotal: order.subtotal,
          total: order.total,
          shipping_amount: order.shippingCost ?? 0,
          shipping_method_name: order.shippingMethodName || null,
          notes: order.notes,
          status: 'pending',
          status_logs: initialLogs
        })
        .select('*')
        .single();

      if (insertError) {
        const pgCode = (insertError as any)?.code;
        if (pgCode === '23505' && insertAttempt < MAX_ATTEMPTS) {
          console.warn(`[orders] 23505 duplicate order_number, retry ${insertAttempt}/${MAX_ATTEMPTS}`);
          await new Promise(r => setTimeout(r, 150));
          continue;
        }
        throw insertError;
      }
      data = result;
      break;
    }
    const mapped = mapOrder(data);

    // Await the email dispatch so the serverless function does not exit/freeze before delivery completes
    try {
      const { onOrderPlaced } = await import('@/lib/email/triggers');
      await onOrderPlaced(mapped, { email: order.customerEmail, name: order.customerName, phone: order.customerPhone });
    } catch (err) {
      console.error('[Email Trigger] failed in createOrder:', err);
    }

    return mapped;
  } catch (error) {
    console.error('[orders] createOrder failed:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    console.error('[orders] createOrder failed raw:', error);
    throw error;
  }
};
