'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { Order, CartItem, StatusLogItem } from '@/lib/types';
import { getCustomerSession } from '@/lib/utils/customer-auth';
import { setCustomerSessionCookie } from '@/lib/utils/customer-auth';
import { isValidPkMobile, normalizePkPhone } from '@/lib/phone';
import { verifyOrderSecurity } from '@/lib/security/abuseProtection';
import { mapOrder, OrderRow } from './types';

/** Minimal customer row shape used during guest customer resolution. */
interface CustomerLookupRow {
  id: string;
  phone?: string | null;
  email?: string | null;
  password_hash?: string | null;
}

export const createOrder = async (order: {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  notes?: string;
  shippingCost?: number;
  discountAmount?: number;
  shippingMethodName?: string;
  /** Structured shipping address — written to order_addresses (source of truth going forward). */
  shippingAddress?: {
    name?: string; phone?: string; email?: string;
    address1?: string; address2?: string; city?: string; postalCode?: string;
    country?: string; latitude?: number | null; longitude?: number | null; paymentMethod?: string;
  };
  idempotencyKey?: string;
  honeypot?: string;
  renderedAt?: number;
}): Promise<Order> => {
  try {
    // Abuse & automated spam protection (honeypot + human entropy + fail-open burst guard)
    const secCheck = await verifyOrderSecurity({
      phone: order.customerPhone,
      honeypot: order.honeypot,
      renderedAt: order.renderedAt,
    });
    if (!secCheck.allowed) {
      console.warn('[orders] createOrder blocked by security guard:', secCheck.reason);
      throw new Error(secCheck.reason || 'Order submission blocked due to suspicious activity.');
    }

    const session = await getCustomerSession();
    let customerId = session ? session.id : null;

    // Server-side phone validation — never trust the client. Blocks junk like
    // "888" from being persisted. Store the canonical national form (03XXXXXXXXX).
    if (!order.customerPhone || !isValidPkMobile(order.customerPhone)) {
      throw new Error('A valid Pakistani mobile number is required (e.g. 0300 1234567).');
    }
    const normalizedPhone = normalizePkPhone(order.customerPhone);
    order = {
      ...order,
      customerPhone: normalizedPhone,
      shippingAddress: order.shippingAddress
        ? { ...order.shippingAddress, phone: normalizePkPhone(order.shippingAddress.phone || normalizedPhone) }
        : order.shippingAddress,
    };

    console.log('[orders] Step 1: customerId resolved to', customerId);

    // Auto-create/lookup guest customer record if phone or email is provided and customer is not logged in
    if (!customerId && (order.customerPhone || order.customerEmail)) {
      try {
        const orderEmail = order.customerEmail ? order.customerEmail.trim().toLowerCase() : null;
        const orderPhone = order.customerPhone ? normalizePkPhone(order.customerPhone) : null;

        let byEmail: CustomerLookupRow | null = null;
        let byPhone: CustomerLookupRow | null = null;

        const [emailRes, phoneRes] = await Promise.all([
          orderEmail
            ? supabaseAdmin
                .from('customers')
                .select('id, phone, email, password_hash')
                .eq('email', orderEmail)
                .maybeSingle()
            : Promise.resolve({ data: null, error: null }),
          orderPhone
            ? supabaseAdmin
                .from('customers')
                .select('id, phone, email, password_hash')
                .eq('phone', orderPhone)
                .maybeSingle()
            : Promise.resolve({ data: null, error: null }),
        ]);

        byEmail = emailRes.data;
        byPhone = phoneRes.data;

        if (byEmail && byPhone) {
          if (byEmail.id === byPhone.id) {
            customerId = byEmail.id;
          } else {
            // Two different rows found.
            // If neither has a password_hash, merge byPhone into byEmail
            if (!byEmail.password_hash && !byPhone.password_hash) {
              await supabaseAdmin.from('orders').update({ customer_id: byEmail.id }).eq('customer_id', byPhone.id);
              await supabaseAdmin.from('customers').delete().eq('id', byPhone.id);
              await supabaseAdmin.from('customers').update({ phone: orderPhone }).eq('id', byEmail.id);
              customerId = byEmail.id;
            } else if (byEmail.password_hash) {
              customerId = byEmail.id;
            } else {
              customerId = byPhone.id;
            }
          }
        } else if (byEmail) {
          customerId = byEmail.id;
          if (!byEmail.phone && orderPhone) {
            await supabaseAdmin.from('customers').update({ phone: orderPhone }).eq('id', byEmail.id);
          }
        } else if (byPhone) {
          customerId = byPhone.id;
          if (!byPhone.email && orderEmail) {
            await supabaseAdmin.from('customers').update({ email: orderEmail }).eq('id', byPhone.id);
          }
        } else {
          // Neither exists, create guest customer record
          const { data: newCustomer } = await supabaseAdmin
            .from('customers')
            .insert({
              name: order.customerName || 'Guest Customer',
              phone: orderPhone,
              email: orderEmail,
              password_hash: null
            })
            .select('id')
            .maybeSingle();

          if (newCustomer) {
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
        created_at: new Date().toISOString()
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
        created_at: new Date().toISOString()
      });
    }

    // Idempotency check: if an order with this idempotency key was already created, return it
    if (order.idempotencyKey) {
      const { data: existing } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('idempotency_key', order.idempotencyKey)
        .maybeSingle();
      if (existing) {
        console.log('[orders] Idempotent hit: order already created for key', order.idempotencyKey);
        return mapOrder(existing);
      }
    }

    // Retry up to 3 times on 23505 (duplicate order_number)
    let data: OrderRow | undefined;
    let insertAttempt = 0;
    const MAX_ATTEMPTS = 3;
    // Unguessable public handle for /order/[token] (64 hex chars).
    const accessToken = (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, '');
    while (insertAttempt < MAX_ATTEMPTS) {
      insertAttempt++;
      const { data: result, error: insertError } = await supabaseAdmin
        .from('orders')
        .insert({
          customer_name: order.customerName,
          customer_phone: order.customerPhone,
          customer_id: customerId,
          items: order.items,
          subtotal: order.subtotal,
          total: order.total,
          shipping_amount: order.shippingCost ?? 0,
          discount_amount: order.discountAmount ?? 0,
          shipping_method_name: order.shippingMethodName || null,
          notes: order.notes,
          status: 'pending',
          status_logs: initialLogs,
          idempotency_key: order.idempotencyKey || null,
          access_token: accessToken,
        })
        .select('*')
        .single();

      if (insertError) {
        const pgCode = (insertError as { code?: string })?.code;
        if (pgCode === '23505') {
          if (order.idempotencyKey) {
            const { data: existing } = await supabaseAdmin
              .from('orders')
              .select('*')
              .eq('idempotency_key', order.idempotencyKey)
              .maybeSingle();
            if (existing) {
              return mapOrder(existing);
            }
          }
          if (insertAttempt < MAX_ATTEMPTS) {
            console.warn(`[orders] 23505 duplicate order_number, retry ${insertAttempt}/${MAX_ATTEMPTS}`);
            await new Promise(r => setTimeout(r, 150));
            continue;
          }
        }
        throw insertError;
      }
      data = result;
      break;
    }

    if (!data) {
      throw new Error('[orders] Failed to create order after retries');
    }
    const orderRow: OrderRow = data;
    const mapped = mapOrder(orderRow);
    // Ensure the in-memory order always carries the token for the success/WhatsApp flow.
    if (!mapped.access_token) mapped.access_token = accessToken;

    // Structured line-items + address in parallel (additive; failures never block the order).
    try {
      const itemRows = (order.items || []).map((item) => {
        const it = item as CartItem & {
          price?: number;
          product_id?: string;
          variant_id?: string;
          name?: string;
          sku?: string;
          image_url?: string;
          discountAmount?: number;
        };
        const qty = it.quantity ?? 1;
        const unit = Number(it.unit_price ?? it.price ?? it.product?.price ?? 0);
        return {
          order_id: orderRow.id,
          product_id: it.product?.id ?? it.product_id ?? null,
          variant_id: it.selected_variant?.id ?? it.variant_id ?? null,
          name: it.product?.name ?? it.name ?? null,
          sku: it.selected_variant?.sku ?? it.sku ?? null,
          image_url: it.product?.images?.[0]?.url ?? it.image_url ?? null,
          variant_label: it.selected_variant?.custom_value ?? null,
          unit_price: unit,
          quantity: qty,
          item_discount: Number(it.discountAmount ?? 0),
          line_total: Number(it.total ?? unit * qty),
        };
      });

      const relPromises: Promise<unknown>[] = [];
      if (itemRows.length > 0) {
        relPromises.push(supabaseAdmin.from('order_items').insert(itemRows) as unknown as Promise<unknown>);
      }

      const a = order.shippingAddress;
      if (a && (a.address1 || a.city || a.phone)) {
        relPromises.push(
          supabaseAdmin.from('order_addresses').insert({
            order_id: orderRow.id,
            type: 'shipping',
            name: a.name ?? order.customerName ?? null,
            phone: a.phone ?? order.customerPhone ?? null,
            email: a.email ?? order.customerEmail ?? null,
            address1: a.address1 ?? null,
            address2: a.address2 ?? null,
            city: a.city ?? null,
            postal_code: a.postalCode ?? null,
            country: a.country ?? 'Pakistan',
            latitude: a.latitude ?? null,
            longitude: a.longitude ?? null,
            payment_method: a.paymentMethod ?? null,
          }) as unknown as Promise<unknown>
        );
      }

      if (relPromises.length > 0) {
        await Promise.all(relPromises);
      }
    } catch (structErr) {
      console.error('[orders] structured items/address insert skipped:', structErr);
    }

    // ── Inventory deduction (opt-in per store) ────────────────────────────
    // OFF unless AUTO_DEDUCT_STOCK=true. Stores that keep stock manually must
    // never be double-decremented, so this is explicit opt-in. Failures never
    // block the order (non-blocking, logged for reconciliation).
    // Idempotent: `deduct_stock_for_order` only deducts once per order.
    if (process.env.AUTO_DEDUCT_STOCK === 'true') {
      try {
        const { error: stockErr } = await supabaseAdmin.rpc('deduct_stock_for_order', {
          p_order_id: orderRow.id,
        });
        if (stockErr) console.error('[orders] stock deduction failed:', stockErr);
      } catch (stockErr) {
        console.error('[orders] stock deduction threw:', stockErr);
      }
    }

    // Non-blocking email dispatch: does not hold up customer HTTP response or checkout UI
    import('@/lib/email/triggers')
      .then(({ onOrderPlaced }) => {
        onOrderPlaced(mapped, { email: order.customerEmail, name: order.customerName, phone: order.customerPhone })
          .catch((err) => console.error('[Email Trigger] non-blocking onOrderPlaced failed:', err));
      })
      .catch((err) => console.error('[Email Trigger] dynamic import failed:', err));

    // Auto-login: after placing an order the customer's details are already known,
    // so establish a session for the linked customer if they weren't logged in.
    // Fault-tolerant — a cookie failure must never break order creation.
    if (!session && customerId) {
      try {
        await setCustomerSessionCookie({
          id: customerId,
          name: order.customerName || 'Guest Customer',
          email: order.customerEmail ? order.customerEmail.trim().toLowerCase() : null,
          phone: order.customerPhone || null,
        });
      } catch (loginErr) {
        console.error('[orders] auto-login after order skipped:', loginErr);
      }
    }

    return mapped;
  } catch (error) {
    console.error('[orders] createOrder failed:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    console.error('[orders] createOrder failed raw:', error);

    try {
      await supabaseAdmin.from('failed_order_attempts').insert({
        customer_name: order.customerName || null,
        customer_phone: order.customerPhone || null,
        customer_email: order.customerEmail || null,
        cart_items: order.items || [],
        subtotal: order.subtotal || 0,
        total: order.total || 0,
        shipping_cost: order.shippingCost || 0,
        shipping_method_name: order.shippingMethodName || null,
        shipping_address: order.shippingAddress || null,
        error_code: (error as { code?: string })?.code || 'ORDER_CREATE_ERROR',
        error_message: (error as Error)?.message || String(error),
        idempotency_key: order.idempotencyKey || null,
      });
    } catch (logErr) {
      console.error('[orders] failed to log failed_order_attempt:', logErr);
    }

    throw error;
  }
};
