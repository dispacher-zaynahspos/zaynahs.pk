import { getCTAButton, getOrderSummary } from './layout';

export function getAdminTemplate(emailType: string, vars: Record<string, any>): { title: string; content: string } | null {
  switch (emailType) {
    case 'admin_new_order':
      return {
        title: `Admin Alert: New Order #${vars.order_id}`,
        content: `
          <h2 style="color: #1a1a2e; margin-top: 0;">New Order Received!</h2>
          <p>A new order <strong>#${vars.order_id}</strong> has been placed on the storefront.</p>
          <p><strong>Total:</strong> ${vars.order_total}</p>
          <p><strong>Customer:</strong> ${vars.customer_name} (${vars.customer_email})</p>
          ${getCTAButton('View in Dashboard', `${vars.admin_panel_url}/orders`)}
          ${getOrderSummary(vars)}
        `
      };

    case 'admin_order_cancelled':
      return {
        title: `Admin Alert: Order Cancelled #${vars.order_id}`,
        content: `
          <h2 style="color: #ef4444; margin-top: 0;">Order Cancelled Alert</h2>
          <p>Order <strong>#${vars.order_id}</strong> was cancelled.</p>
          <p><strong>Customer:</strong> ${vars.customer_name}</p>
          ${vars.cancel_reason ? `<p><strong>Reason:</strong> ${vars.cancel_reason}</p>` : ''}
          ${getCTAButton('View in Dashboard', `${vars.admin_panel_url}/orders`)}
        `
      };

    case 'admin_low_stock':
      return {
        title: `Admin Alert: Low Stock ${vars.product_name}`,
        content: `
          <h2 style="color: #ef4444; margin-top: 0;">Low Stock Warning</h2>
          <p>The following product has low stock:</p>
          <p><strong>Product Name:</strong> ${vars.product_name}</p>
          <p><strong>Current Stock:</strong> ${vars.product_stock} units</p>
          ${getCTAButton('Manage Stock', `${vars.admin_panel_url}/products`)}
        `
      };

    case 'admin_new_customer':
      return {
        title: 'Admin Alert: New Customer',
        content: `
          <h2 style="color: #1a1a2e; margin-top: 0;">New Customer Registration</h2>
          <p>A new customer has registered on the storefront:</p>
          <p><strong>Name:</strong> ${vars.customer_name}</p>
          <p><strong>Email:</strong> ${vars.customer_email}</p>
        `
      };

    case 'admin_new_review':
      return {
        title: 'Admin Alert: New Review',
        content: `
          <h2 style="color: #1a1a2e; margin-top: 0;">New Review Submitted</h2>
          <p>A customer has reviewed a product:</p>
          <p><strong>Product:</strong> ${vars.product_name}</p>
          <p><strong>Author:</strong> ${vars.review_author}</p>
          <p><strong>Rating:</strong> ${vars.review_rating}</p>
          <p><strong>Comment:</strong></p>
          <p style="background-color: #f3f4f6; border-radius: 8px; padding: 12px; font-style: italic; color: #4b5563;">
            "${vars.review_text}"
          </p>
          ${getCTAButton('Moderate Reviews', `${vars.admin_panel_url}/products`)}
        `
      };

    case 'admin_contact_form':
      return {
        title: 'Admin Alert: Contact Form',
        content: `
          <h2 style="color: #1a1a2e; margin-top: 0;">New Contact Form Message</h2>
          <p>You received a message via the contact form:</p>
          <p><strong>From:</strong> ${vars.contact_name} (${vars.customer_email})</p>
          <p><strong>Subject:</strong> ${vars.contact_subject}</p>
          <p><strong>Message:</strong></p>
          <p style="background-color: #f3f4f6; border-radius: 8px; padding: 12px; color: #4b5563; line-height: 1.6;">
            ${vars.contact_message}
          </p>
        `
      };

    case 'admin_abandoned_cart':
      return {
        title: 'Admin Alert: Abandoned Cart',
        content: `
          <h2 style="color: #1a1a2e; margin-top: 0;">Abandoned Cart Detected</h2>
          <p><strong>Customer:</strong> ${vars.customer_name}</p>
          <p><strong>Email:</strong> ${vars.customer_email}</p>
          <p><strong>Phone:</strong> ${vars.customer_phone || '—'}</p>
          <p><strong>Cart Value:</strong> ${vars.order_total}</p>
          <p><strong>Last Activity:</strong> ${vars.last_activity || 'Recently'}</p>
          ${getCTAButton('View in Admin →', vars.admin_panel_url + '/abandoned-carts')}
        `
      };

    case 'admin_postex_shipped':
      return {
        title: 'Admin Alert: Order Fulfilled via PostEx #' + vars.order_id,
        content: `
          <h2 style="color: #1a1a2e; margin-top: 0;">Order Fulfilled via PostEx</h2>
          <p><strong>Order:</strong> ${vars.order_id}</p>
          <p><strong>Customer:</strong> ${vars.customer_name} (${vars.customer_phone})</p>
          <p><strong>Tracking CN:</strong> ${vars.tracking_number}</p>
          <p><strong>Tracking Link:</strong> <a href="${vars.tracking_url}">${vars.tracking_url}</a></p>
          <p><strong>COD Amount:</strong> ${vars.order_total}</p>
          ${getCTAButton('View in Dashboard', vars.admin_panel_url + '/orders')}
        `
      };

    default:
      return null;
  }
}
