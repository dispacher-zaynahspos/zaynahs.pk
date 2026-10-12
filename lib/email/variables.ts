import { getSiteUrl } from '@/lib/site-url-server';
import { formatPrice } from '@/lib/utils/whatsapp';
import { CartItem, StoreSettings } from '@/lib/types';

export function renderOrderItemsTable(items: CartItem[], currencySymbol = 'Rs.', siteUrl = ''): string {
  if (!items || items.length === 0) return '';
  return items.map(item => {
    // Get product thumbnail
    let imgUrl = '';
    if (item.selected_variant?.image_url) {
      imgUrl = item.selected_variant.image_url;
    } else if (item.product.images && item.product.images.length > 0) {
      const primary = item.product.images.find(img => img.is_primary);
      imgUrl = primary ? primary.url : item.product.images[0].url;
    }

    const variantDetails = item.selected_variant
      ? [
          item.selected_variant.color,
          item.selected_variant.size,
          item.selected_variant.material,
          item.selected_variant.custom_value
        ].filter(Boolean).join(', ')
      : '';

    const modifierDetails = item.selected_modifiers && item.selected_modifiers.length > 0
      ? item.selected_modifiers.map(m => m.name).join(', ')
      : '';

    const productUrl = siteUrl && item.product.slug ? `${siteUrl}/product/${item.product.slug}` : '';

    return `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td width="20%" valign="middle" style="padding: 10px 15px 10px 0;">
          ${imgUrl
            ? productUrl
              ? `<a href="${productUrl}" target="_blank"><img src="${imgUrl}" alt="${item.product.name}" width="100%" style="max-width: 60px; border-radius: 6px; display: block;" /></a>`
              : `<img src="${imgUrl}" alt="${item.product.name}" width="100%" style="max-width: 60px; border-radius: 6px; display: block;" />`
            : `<div style="width: 60px; height: 60px; border-radius: 6px; background-color: #f3f4f6;"></div>`}
        </td>
        <td width="50%" valign="middle" style="padding: 10px 8px;">
          ${productUrl
            ? `<a href="${productUrl}" target="_blank" style="color: #1a1a1a; text-decoration: none; font-weight: 600; font-size: 14px; display: block;">${item.product.name}</a>`
            : `<span style="font-weight: 600; color: #1a1a1a; font-size: 14px;">${item.product.name}</span>`}
          ${item.added_later ? `<span style="display: inline-block; background-color: #fef2f2; color: #ef4444; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; margin-top: 4px; border: 1px solid #fecaca;">Added Later</span>` : ''}
          ${variantDetails ? `<p style="margin: 4px 0 0; color: #666; font-size: 12px;">${variantDetails}</p>` : ''}
          ${modifierDetails ? `<p style="margin: 2px 0 0; color: #10b981; font-size: 12px;">+ ${modifierDetails}</p>` : ''}
        </td>
        <td width="10%" valign="middle" align="center" style="padding: 10px 8px; color: #444; font-size: 14px; white-space: nowrap;">
          x${item.quantity}
        </td>
        <td width="20%" valign="middle" align="right" style="padding: 10px 0 10px 8px; font-weight: 700; color: #1a1a2e; font-size: 14px; white-space: nowrap;">
          ${item.discount_amount && item.discount_amount > 0 ? `<div style="font-size: 12px; color: #ef4444; font-weight: 500; margin-bottom: 2px;">-${formatPrice(item.discount_amount, currencySymbol)}</div>` : ''}
          ${formatPrice(item.total, currencySymbol)}
        </td>
      </tr>
    `;
  }).join('');
}

interface EmailVariableData {
  settings?: Partial<StoreSettings>;
  customer?: { name?: string; email?: string; phone?: string };
  user?: { name?: string; email?: string };
  order?: Record<string, unknown> & {
    id?: string;
    orderNumber?: string;
    createdAt?: string;
    total?: number;
    subtotal?: number;
    discount_amount?: number;
    discountAmount?: number;
    shipping_amount?: number;
    shippingAmount?: number;
    status?: string;
    notes?: string;
    customerName?: string;
    customerPhone?: string;
    shipping_address?: Record<string, unknown> & {
      name?: string;
      street?: string;
      address?: string;
      city?: string;
      postalCode?: string;
      phone?: string;
      full?: string;
    };
    trackingNumber?: string;
    courierName?: string;
    trackingUrl?: string;
    estimatedDelivery?: string;
    cancelReason?: string;
    refundAmount?: number;
  };
  resetLink?: string;
  product?: { name?: string; stock?: number };
  review?: { rating?: number; comment?: string; customerName?: string };
  contact?: { name?: string; subject?: string; message?: string };
  last_activity?: string;
  checkout_url?: string;
  postex_remarks?: string;
}

export async function buildVariables(emailType: string, data: EmailVariableData): Promise<Record<string, string>> {
  const settings = data.settings || {};
  const currencySymbol = settings.currency_symbol || 'Rs.';

  // Start with standard variables
  const vars: Record<string, string> = {
    brand_name: settings.store_name || process.env.NEXT_PUBLIC_BRAND_NAME || 'Your Store',
    site_url: await getSiteUrl({ store_url: typeof settings.store_url === 'string' ? settings.store_url : undefined }),
    customer_name: data.customer?.name || data.user?.name || 'Customer',
    customer_email: data.customer?.email || data.user?.email || '',
    contact_email: settings.header_top_bar_email || settings.smtp_email || '',
    currency: currencySymbol,
    current_year: new Date().getFullYear().toString()
  };

  // If order details exist, populate order-related variables
  if (data.order) {
    const order = data.order;
    vars.order_id = order.orderNumber || order.id || '';
    vars.order_date = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
    vars.order_total = formatPrice(order.total, currencySymbol);
    vars.order_subtotal = formatPrice(order.subtotal || order.total, currencySymbol);
    
    // Webhook payload comes from Supabase so fields are snake_case: discount_amount, shipping_amount
    const discountAmount = order.discount_amount || order.discountAmount || 0;
    vars.order_discount_fee = discountAmount > 0 ? `-${formatPrice(discountAmount, currencySymbol)}` : '';
    
    const shippingAmount = order.shipping_amount || order.shippingAmount || 0;
    vars.order_shipping_fee = formatPrice(shippingAmount, currencySymbol);
    vars.order_status = order.status || '';

    // Default payment method
    vars.order_payment_method = 'Cash on delivery';

    // Address
    const address: Record<string, unknown> & {
      name?: string; street?: string; address?: string; city?: string;
      postalCode?: string; phone?: string; full?: string;
    } = order.shipping_address || data.customer || {};
    const addressName = order.customerName || address.name || data.customer?.name || data.user?.name || 'Customer';
    let street = address.street || address.address || '';
    let city = address.city || '';
    let postalCode = address.postalCode || '';
    let phone = address.phone || order.customerPhone || data.customer?.phone || '';

    // Parse specific address fields from formatted notes if present
    if (order.notes) {
      const addressMatch = order.notes.match(/Address:\s*(.+)/i);
      const aptMatch = order.notes.match(/Apt\/Suite:\s*(.+)/i);
      const cityMatch = order.notes.match(/City:\s*(.+)/i);
      const postalMatch = order.notes.match(/Postal:\s*(.+)/i);
      const phoneMatch = order.notes.match(/Phone:\s*(.+)/i);
      const paymentMatch = order.notes.match(/Payment Method:\s*(.+)/i);

      if (addressMatch) {
        street = addressMatch[1].trim();
        if (aptMatch) {
          street += `, ${aptMatch[1].trim()}`;
        }
      }
      if (cityMatch) city = cityMatch[1].trim();
      if (postalMatch) postalCode = postalMatch[1].trim();
      if (phoneMatch) phone = phoneMatch[1].trim();
      if (paymentMatch) vars.order_payment_method = paymentMatch[1].trim();
    }

    vars['shipping_address.name'] = addressName;
    vars['shipping_address.phone'] = phone;
    vars['shipping_address.street'] = street;
    vars['shipping_address.city'] = city;
    vars['shipping_address.postal_code'] = postalCode;
    vars['shipping_address.full'] = address.full ||
      [addressName, street, city, postalCode, phone].filter(Boolean).join(', ');

    // Shipping
    vars.tracking_number = order.trackingNumber || '';
    vars.courier_name = order.courierName || '';
    vars.tracking_url = order.trackingUrl || '';
    vars.estimated_delivery = order.estimatedDelivery || '';

    // Cancel/Refund
    vars.cancel_reason = order.cancelReason || '';
    vars.refund_amount = order.refundAmount ? formatPrice(order.refundAmount, currencySymbol) : '';
  }

  // Auth reset
  if (data.resetLink) {
    vars.reset_link = data.resetLink;
  }

  // Admin and other custom variables
  vars.admin_panel_url = `${vars.site_url}/admin`;
  
  if (data.product) {
    vars.product_name = data.product.name || '';
    vars.product_stock = data.product.stock !== undefined ? data.product.stock.toString() : '0';
  }
  
  if (data.review) {
    vars.review_rating = '★'.repeat(data.review.rating || 0) + '☆'.repeat(5 - (data.review.rating || 0));
    vars.review_text = data.review.comment || '';
    vars.review_author = data.review.customerName || '';
  }

  if (data.contact) {
    vars.contact_name = data.contact.name || '';
    vars.contact_subject = data.contact.subject || '';
    vars.contact_message = data.contact.message || '';
  }

  // Abandoned Cart & PostEx extras
  if (data.last_activity) {
    vars.last_activity = data.last_activity;
  }
  if (data.checkout_url) {
    vars.checkout_url = data.checkout_url;
  }
  if (data.postex_remarks) {
    vars.postex_remarks = data.postex_remarks;
  }

  return vars;
}

export function replaceVariables(text: string, variables: Record<string, string>): string {
  if (!text) return '';
  return text.replace(/\{\{([a-zA-Z0-9_\.]+)\}\}/g, (match, key) => {
    // Check direct key or dotted path
    const value = key.split('.').reduce((obj: unknown, k: string) => {
      if (obj && typeof obj === 'object') {
        return (obj as Record<string, unknown>)[k];
      }
      return undefined;
    }, variables as unknown);
    // If not found in variables, check direct dotted key in the flat variables object (e.g. 'shipping_address.full')
    if (value !== undefined) {
      return String(value);
    }
    const flatValue = variables[key];
    if (flatValue !== undefined) {
      return String(flatValue);
    }
    return match;
  });
}
