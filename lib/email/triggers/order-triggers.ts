import { getSettings } from '@/lib/services/settings';
import { getProductById } from '@/lib/services/products';
import { updateOrderDetails } from '@/lib/services/orders';
import { sendTemplatedEmail } from '../sendTemplatedEmail';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { CartItem } from '@/lib/types';

async function getAdminEmail(): Promise<string> {
  const settings = await getSettings();
  return settings.admin_notification_email || settings.smtp_email || '';
}

// 5. Order Placed (checkout success) trigger
export async function onOrderPlaced(order: any, customer: any) {
  try {
    let customerEmail = customer?.email || order?.shipping_address?.email;
    let resolvedCustomer = customer || {};

    if (!customerEmail && order.customerId) {
      try {
        const { data: cust } = await supabaseAdmin
          .from('customers')
          .select('email, name, phone')
          .eq('id', order.customerId)
          .maybeSingle();
        if (cust?.email) {
          customerEmail = cust.email;
        }
        if (cust) {
          resolvedCustomer = { ...resolvedCustomer, name: cust.name, phone: cust.phone, email: cust.email };
        }
      } catch (err) {
        console.error('Failed to load customer details for order placed trigger:', err);
      }
    }

    if (!customerEmail && order.notes) {
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
      const match = order.notes.match(emailRegex);
      if (match) {
        customerEmail = match[0];
        if (!resolvedCustomer.email) {
          resolvedCustomer.email = customerEmail;
        }
      }
    }

    if (customerEmail) {
      await sendTemplatedEmail('order_placed', customerEmail, { order, customer: resolvedCustomer });
    }

    await notifyAdminNewOrder(order, resolvedCustomer);

    if (order.items && order.items.length > 0) {
      await checkLowStock(order.items);
    }
  } catch (error) {
    console.error('[Email Trigger] onOrderPlaced failed:', error);
  }
}

// 6. Admin notification on new order
export async function notifyAdminNewOrder(order: any, customer: any) {
  try {
    const adminEmail = await getAdminEmail();
    if (adminEmail) {
      await sendTemplatedEmail('admin_new_order', adminEmail, { order, customer });
    }
  } catch (error) {
    console.error('[Email Trigger] notifyAdminNewOrder failed:', error);
  }
}

// 7. Order Status Changed trigger
export async function onOrderStatusChange(order: any, customer: any, newStatus: string) {
  try {
    let customerEmail = customer?.email || order?.shipping_address?.email;
    let resolvedCustomer = customer || {};

    if (!customerEmail && order.customerId) {
      try {
        const { data: cust } = await supabaseAdmin
          .from('customers')
          .select('email, name, phone')
          .eq('id', order.customerId)
          .maybeSingle();
        if (cust?.email) {
          customerEmail = cust.email;
        }
        if (cust) {
          resolvedCustomer = { ...resolvedCustomer, name: cust.name, phone: cust.phone, email: cust.email };
        }
      } catch (err) {
        console.error('Failed to load customer details for order status trigger:', err);
      }
    }

    if (!customerEmail && order.notes) {
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
      const match = order.notes.match(emailRegex);
      if (match) {
        customerEmail = match[0];
        if (!resolvedCustomer.email) {
          resolvedCustomer.email = customerEmail;
        }
      }
    }

    if (!customerEmail) {
      console.warn('[Email Trigger] onOrderStatusChange aborted: customer has no email address.');
      return;
    }

    const statusMap: Record<string, string> = {
      confirmed: 'order_confirmed',
      processing: 'order_processing',
      shipped: 'order_shipped',
      out_for_delivery: 'order_out_for_delivery',
      delivered: 'order_delivered',
      cancelled: 'order_cancelled',
      refunded: 'order_refunded'
    };

    const templateType = statusMap[newStatus];
    if (!templateType) {
      console.log(`[Email Trigger] No template registered for status: ${newStatus}`);
      return;
    }

    await sendTemplatedEmail(templateType, customerEmail, { order, customer: resolvedCustomer });

    if (newStatus === 'delivered') {
      console.log(`[Email Trigger] Order delivered. Marking review request as pending.`);
      await updateOrderDetails(order.id, {
        reviewEmailPending: true,
        deliveredAt: new Date().toISOString()
      });
    } else if (newStatus === 'cancelled') {
      await notifyAdminOrderCancelled(order, resolvedCustomer);
    }
  } catch (error) {
    console.error('[Email Trigger] onOrderStatusChange failed:', error);
  }
}

// 8. Admin alert when order is cancelled
export async function notifyAdminOrderCancelled(order: any, customer: any) {
  try {
    const adminEmail = await getAdminEmail();
    if (adminEmail) {
      await sendTemplatedEmail('admin_order_cancelled', adminEmail, { order, customer });
    }
  } catch (error) {
    console.error('[Email Trigger] notifyAdminOrderCancelled failed:', error);
  }
}

// 9. Low stock check and alert trigger
export async function checkLowStock(items: CartItem[]) {
  try {
    const settings = await getSettings();
    const globalThreshold = settings.low_stock_threshold ?? 5;
    const adminEmail = await getAdminEmail();

    if (!adminEmail) return;

    for (const item of items) {
      const productId = item.product?.id;
      if (!productId) continue;

      const product = await getProductById(productId);
      if (!product) continue;

      if (product.hasVariants && item.selectedVariant) {
        const variant = product.variants.find(v => v.id === item.selectedVariant?.id);
        if (variant && variant.active) {
          const threshold = variant.inventoryThreshold !== undefined && variant.inventoryThreshold !== null && variant.inventoryThreshold > 0
            ? variant.inventoryThreshold
            : (product.inventoryThreshold !== undefined && product.inventoryThreshold !== null && product.inventoryThreshold > 0
               ? product.inventoryThreshold
               : globalThreshold);

          if (variant.stock <= threshold) {
            const variantInfo = [variant.color, variant.size, variant.material].filter(Boolean).join(' / ');
            const displayName = variantInfo ? `${product.name} (${variantInfo})` : product.name;
            console.log(`[Email Trigger] Low stock alert triggered for variant '${displayName}' (Stock: ${variant.stock}, Threshold: ${threshold})`);
            
            const mockProduct = {
              ...product,
              name: displayName,
              stock: variant.stock
            };
            await sendTemplatedEmail('admin_low_stock', adminEmail, { product: mockProduct });
          }
        }
      } else {
        const threshold = product.inventoryThreshold !== undefined && product.inventoryThreshold !== null && product.inventoryThreshold > 0
          ? product.inventoryThreshold
          : globalThreshold;

        if (product.stock <= threshold) {
          console.log(`[Email Trigger] Low stock alert triggered for '${product.name}' (Stock: ${product.stock}, Threshold: ${threshold})`);
          await sendTemplatedEmail('admin_low_stock', adminEmail, { product });
        }
      }
    }
  } catch (error) {
    console.error('[Email Trigger] checkLowStock failed:', error);
  }
}
