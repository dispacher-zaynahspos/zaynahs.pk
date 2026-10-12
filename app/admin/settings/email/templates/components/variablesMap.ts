export const VARIABLES_BY_TYPE: Record<string, string[]> = {
  welcome: ['brand_name', 'site_url', 'customer_name', 'customer_email', 'contact_email', 'primary_color', 'accent_color', 'logo_url', 'current_year'],
  password_reset: ['brand_name', 'site_url', 'customer_name', 'customer_email', 'contact_email', 'reset_link', 'primary_color', 'accent_color', 'current_year'],
  password_changed: ['brand_name', 'site_url', 'customer_name', 'customer_email', 'contact_email', 'primary_color', 'accent_color', 'current_year'],
  order_placed: [
    'brand_name', 'site_url', 'customer_name', 'customer_email', 'contact_email', 'currency', 'current_year',
    'order_id', 'order_date', 'order_total', 'order_subtotal', 'order_shipping_fee', 'order_status', 'order_items_html',
    'shipping_address.name', 'shipping_address.phone', 'shipping_address.street', 'shipping_address.city', 'shipping_address.full',
    'primary_color', 'accent_color', 'whatsapp_url'
  ],
  order_confirmed: [
    'brand_name', 'site_url', 'customer_name', 'customer_email', 'contact_email', 'currency', 'current_year',
    'order_id', 'order_date', 'order_total', 'order_subtotal', 'order_shipping_fee', 'order_status', 'order_items_html',
    'shipping_address.name', 'shipping_address.phone', 'shipping_address.street', 'shipping_address.city', 'shipping_address.full',
    'primary_color', 'accent_color', 'whatsapp_url'
  ],
  order_processing: [
    'brand_name', 'site_url', 'customer_name', 'customer_email', 'contact_email', 'currency', 'current_year',
    'order_id', 'order_date', 'order_total', 'order_subtotal', 'order_shipping_fee', 'order_status', 'order_items_html',
    'shipping_address.name', 'shipping_address.phone', 'shipping_address.street', 'shipping_address.city', 'shipping_address.full',
    'primary_color', 'accent_color', 'whatsapp_url'
  ],
  order_shipped: [
    'brand_name', 'site_url', 'customer_name', 'customer_email', 'contact_email', 'currency', 'current_year',
    'order_id', 'order_date', 'order_total', 'order_subtotal', 'order_shipping_fee', 'order_status', 'order_items_html',
    'shipping_address.name', 'shipping_address.phone', 'shipping_address.street', 'shipping_address.city', 'shipping_address.full',
    'tracking_number', 'courier_name', 'tracking_url', 'estimated_delivery', 'primary_color', 'accent_color', 'whatsapp_url'
  ],
  order_out_for_delivery: [
    'brand_name', 'site_url', 'customer_name', 'customer_email', 'customer_phone', 'contact_email', 'currency', 'current_year',
    'order_id', 'order_date', 'order_total', 'order_subtotal', 'order_shipping_fee', 'order_status', 'order_items_html',
    'shipping_address.name', 'shipping_address.phone', 'shipping_address.street', 'shipping_address.city', 'shipping_address.full',
    'primary_color', 'accent_color', 'whatsapp_url'
  ],
  order_delivered: [
    'brand_name', 'site_url', 'customer_name', 'customer_email', 'contact_email', 'currency', 'current_year',
    'order_id', 'order_date', 'order_total', 'order_subtotal', 'order_shipping_fee', 'order_status', 'order_items_html',
    'shipping_address.name', 'shipping_address.phone', 'shipping_address.street', 'shipping_address.city', 'shipping_address.full',
    'primary_color', 'accent_color'
  ],
  order_cancelled: [
    'brand_name', 'site_url', 'customer_name', 'customer_email', 'contact_email', 'currency', 'current_year',
    'order_id', 'order_date', 'order_total', 'order_status', 'cancel_reason', 'primary_color', 'accent_color'
  ],
  order_refunded: [
    'brand_name', 'site_url', 'customer_name', 'customer_email', 'contact_email', 'currency', 'current_year',
    'order_id', 'order_date', 'order_total', 'order_status', 'refund_amount', 'primary_color', 'accent_color'
  ],
  review_request: ['brand_name', 'site_url', 'customer_name', 'customer_email', 'contact_email', 'primary_color', 'accent_color', 'current_year'],
  abandoned_cart: [
    'brand_name', 'site_url', 'customer_name', 'customer_email', 'contact_email', 'currency', 'current_year',
    'checkout_url', 'order_total', 'order_subtotal', 'order_items_html', 'primary_color', 'accent_color'
  ],
  postex_shipped: [
    'brand_name', 'site_url', 'customer_name', 'customer_email', 'customer_phone', 'contact_email', 'currency', 'current_year',
    'order_id', 'order_total', 'order_subtotal', 'order_shipping_fee', 'tracking_number', 'tracking_url',
    'postex_remarks', 'whatsapp_number', 'whatsapp_url', 'order_items_html', 'shipping_address.full', 'primary_color', 'accent_color'
  ],
  admin_new_order: [
    'brand_name', 'site_url', 'customer_name', 'customer_email', 'customer_phone', 'contact_email', 'currency', 'current_year',
    'order_id', 'order_date', 'order_total', 'order_subtotal', 'order_shipping_fee', 'order_status', 'order_items_html',
    'shipping_address.full', 'admin_panel_url'
  ],
  admin_order_cancelled: [
    'brand_name', 'site_url', 'customer_name', 'customer_email', 'contact_email', 'current_year',
    'order_id', 'order_date', 'order_total', 'order_status', 'cancel_reason', 'admin_panel_url'
  ],
  admin_low_stock: ['brand_name', 'site_url', 'product_name', 'product_stock', 'admin_panel_url', 'current_year'],
  admin_new_customer: ['brand_name', 'site_url', 'customer_name', 'customer_email', 'admin_panel_url', 'current_year'],
  admin_new_review: ['brand_name', 'site_url', 'customer_name', 'customer_email', 'product_name', 'review_author', 'review_rating', 'review_text', 'admin_panel_url', 'current_year'],
  admin_contact_form: ['brand_name', 'site_url', 'customer_name', 'customer_email', 'contact_name', 'contact_subject', 'contact_message', 'current_year'],
  admin_abandoned_cart: [
    'brand_name', 'site_url', 'customer_name', 'customer_phone', 'customer_email', 'currency', 'current_year',
    'order_total', 'last_activity', 'admin_panel_url'
  ],
  admin_postex_shipped: [
    'brand_name', 'site_url', 'customer_name', 'customer_phone', 'customer_email', 'currency', 'current_year',
    'order_id', 'order_total', 'tracking_number', 'tracking_url', 'postex_remarks', 'admin_panel_url'
  ]
};
