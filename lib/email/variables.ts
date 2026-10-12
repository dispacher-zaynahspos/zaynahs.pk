import { getSiteUrl } from '@/lib/site-url-server';
import { formatPrice, cleanWhatsAppPhone } from '@/lib/utils/whatsapp';
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

export interface EmailVariableData {
  settings?: Partial<StoreSettings>;
  customer?: { name?: string; email?: string; phone?: string };
  user?: { name?: string; email?: string };
  order?: Record<string, unknown> & {
    id?: string;
    orderNumber?: string;
    order_number?: string;
    createdAt?: string;
    created_at?: string;
    total?: number;
    subtotal?: number;
    discount_amount?: number;
    discountAmount?: number;
    shipping_amount?: number;
    shippingAmount?: number;
    status?: string;
    notes?: string;
    customerName?: string;
    customer_name?: string;
    customerPhone?: string;
    customer_phone?: string;
    customerEmail?: string;
    customer_email?: string;
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
    tracking_number?: string;
    courierName?: string;
    courier_name?: string;
    trackingUrl?: string;
    tracking_url?: string;
    estimatedDelivery?: string;
    cancelReason?: string;
    refundAmount?: number;
    items?: unknown[];
  };
  resetLink?: string;
  product?: { name?: string; stock?: number };
  review?: { rating?: number; comment?: string; customerName?: string };
  contact?: { name?: string; subject?: string; message?: string };
  last_activity?: string;
  checkout_url?: string;
  postex_remarks?: string;
  order_id?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  tracking_number?: string;
  courier_name?: string;
  tracking_url?: string;
  order_total?: number;
  order_subtotal?: number;
  whatsapp_number?: string;
  whatsapp_url?: string;
}

export async function buildVariables(emailType: string, data: EmailVariableData): Promise<Record<string, string>> {
  const settings = data.settings || {};
  const currencySymbol = settings.currency_symbol || 'Rs.';

  const brandName = settings.store_name || process.env.NEXT_PUBLIC_BRAND_NAME || 'Your Store';
  const siteUrl = await getSiteUrl({ store_url: typeof settings.store_url === 'string' ? settings.store_url : undefined });
  const rawWa = settings.whatsapp_number || settings.floating_whatsapp_number || '';
  const cleanWa = cleanWhatsAppPhone(rawWa);

  const order = data.order;

  // Resolve Order ID
  const orderId = String(
    data.order_id ||
    order?.orderNumber ||
    order?.order_number ||
    order?.id ||
    ''
  ).trim();

  // Resolve Customer Info
  const customerName = String(
    data.customer_name ||
    data.customer?.name ||
    order?.customerName ||
    order?.customer_name ||
    data.user?.name ||
    'Customer'
  ).trim();

  const customerPhone = String(
    data.customer_phone ||
    data.customer?.phone ||
    order?.customerPhone ||
    order?.customer_phone ||
    ''
  ).trim();

  const customerEmail = String(
    data.customer_email ||
    data.customer?.email ||
    order?.customerEmail ||
    order?.customer_email ||
    data.user?.email ||
    ''
  ).trim();

  // Resolve Tracking Info
  const trackingNumber = String(
    data.tracking_number ||
    order?.trackingNumber ||
    order?.tracking_number ||
    ''
  ).trim();

  const courierName = String(
    data.courier_name ||
    order?.courierName ||
    order?.courier_name ||
    'PostEx'
  ).trim();

  // Determine Tracking URL
  let trackingUrl = String(
    data.tracking_url ||
    order?.trackingUrl ||
    order?.tracking_url ||
    ''
  ).trim();

  if (!trackingUrl && trackingNumber) {
    if (courierName.toLowerCase().includes('postex') || !courierName) {
      trackingUrl = `https://postex.pk/tracking?cn=${encodeURIComponent(trackingNumber)}`;
    }
  }

  // Build WhatsApp Support URL
  let whatsappUrl = '';
  if (cleanWa) {
    const waText = orderId
      ? `Hello, I need assistance regarding my Order #${orderId}`
      : 'Hello, I need assistance regarding my order';
    whatsappUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(waText)}`;
  }

  // Resolve Order Total
  const rawTotal = data.order_total !== undefined ? data.order_total : order?.total;
  const numTotal = typeof rawTotal === 'number' ? rawTotal : parseFloat(String(rawTotal || 0)) || 0;
  const orderTotalFormatted = formatPrice(numTotal, currencySymbol);

  // Resolve Order Subtotal
  const rawSubtotal = data.order_subtotal !== undefined ? data.order_subtotal : (order?.subtotal !== undefined ? order?.subtotal : rawTotal);
  const numSubtotal = typeof rawSubtotal === 'number' ? rawSubtotal : parseFloat(String(rawSubtotal || 0)) || numTotal;
  const orderSubtotalFormatted = formatPrice(numSubtotal, currencySymbol);

  const postexRemarks = String(data.postex_remarks || (typeof order?.notes === 'string' ? order.notes : '') || '').trim();

  // Start with standard variables
  const vars: Record<string, string> = {
    brand_name: brandName,
    site_url: siteUrl,
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: customerPhone,
    contact_email: settings.header_top_bar_email || settings.smtp_email || '',
    currency: currencySymbol,
    current_year: new Date().getFullYear().toString(),
    order_id: orderId,
    order_total: orderTotalFormatted,
    order_subtotal: orderSubtotalFormatted,
    tracking_number: trackingNumber,
    tracking_url: trackingUrl,
    courier_name: courierName,
    whatsapp_number: cleanWa,
    whatsapp_url: whatsappUrl,
    postex_remarks: postexRemarks,
  };

  // If order details exist, populate order-related variables
  if (order) {
    vars.order_date = (order.createdAt || order.created_at)
      ? new Date(String(order.createdAt || order.created_at)).toLocaleDateString()
      : new Date().toLocaleDateString();

    const discountAmount = Number(order.discount_amount || order.discountAmount || 0);
    vars.order_discount_fee = discountAmount > 0 ? `-${formatPrice(discountAmount, currencySymbol)}` : '';

    const shippingAmount = Number(order.shipping_amount || order.shippingAmount || 0);
    vars.order_shipping_fee = formatPrice(shippingAmount, currencySymbol);

    vars.order_status = String(order.status || '');
    vars.order_payment_method = 'Cash on delivery';

    // Address
    const address = (order.shipping_address as Record<string, unknown>) || data.customer || {};
    const addressName = customerName || (address.name as string) || 'Customer';
    let street = (address.street as string) || (address.address as string) || '';
    let city = (address.city as string) || '';
    let postalCode = (address.postalCode as string) || '';
    let phone = customerPhone || (address.phone as string) || '';

    // Parse specific address fields from formatted notes if present
    if (order.notes && typeof order.notes === 'string') {
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
    vars['shipping_address.full'] = (address.full as string) ||
      [addressName, street, city, postalCode, phone].filter(Boolean).join(', ');

    vars.estimated_delivery = String(order.estimatedDelivery || '3-5 working days');
    vars.cancel_reason = String(order.cancelReason || '');
    vars.refund_amount = order.refundAmount ? formatPrice(Number(order.refundAmount), currencySymbol) : '';
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
