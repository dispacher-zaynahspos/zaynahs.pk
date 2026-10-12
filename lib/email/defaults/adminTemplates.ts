import { getCTAButton, getOrderSummary } from './layout';

export function getAdminTemplate(emailType: string, vars: Record<string, string>): { title: string; content: string } | null {
  const primary = vars.primary_color || '#0f172a';
  const btnBg = vars.button_bg_color || primary;
  const btnText = vars.button_text_color || '#ffffff';

  switch (emailType) {
    case 'admin_new_order':
      return {
        title: `Admin Alert: New Order #${vars.order_id} (${vars.order_total})`,
        content: `
          <div style="margin-bottom: 20px;">
            <div style="display: inline-block; background-color: #ecfdf5; color: #047857; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
              ⚡ New Order Placed
            </div>
            <h2 style="color: ${primary}; margin: 0 0 6px 0; font-size: 22px; font-weight: 800;">New Order #${vars.order_id} Received</h2>
            <p style="margin: 0; color: #64748b; font-size: 14px;">Total Value: <strong style="color: #059669; font-size: 15px;">${vars.order_total}</strong></p>
          </div>

          <!-- Customer details card -->
          <div style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin-bottom: 20px;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 14px; color: #334155;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; width: 35%;">Customer</td>
                <td style="padding: 6px 0; font-weight: 700; color: ${primary};">${vars.customer_name}</td>
              </tr>
              ${vars.customer_phone ? `
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Phone</td>
                <td style="padding: 6px 0; font-weight: 600;">
                  <a href="tel:${vars.customer_phone}" style="color: #0284c7; text-decoration: none;">${vars.customer_phone}</a>
                </td>
              </tr>` : ''}
              ${vars.customer_email ? `
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Email</td>
                <td style="padding: 6px 0;">
                  <a href="mailto:${vars.customer_email}" style="color: #0284c7; text-decoration: none;">${vars.customer_email}</a>
                </td>
              </tr>` : ''}
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Payment</td>
                <td style="padding: 6px 0; font-weight: 600; color: #16a34a;">${vars.order_payment_method || 'Cash on Delivery'}</td>
              </tr>
            </table>
          </div>

          ${getCTAButton('Manage Order in Dashboard →', `${vars.admin_panel_url}/orders`, btnBg, btnText)}

          ${getOrderSummary(vars)}
        `
      };

    case 'admin_order_cancelled':
      return {
        title: `Admin Alert: Order #${vars.order_id} Cancelled`,
        content: `
          <div style="margin-bottom: 20px;">
            <div style="display: inline-block; background-color: #fef2f2; color: #b91c1c; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
              ✕ Order Cancelled
            </div>
            <h2 style="color: #991b1b; margin: 0 0 6px 0; font-size: 22px; font-weight: 800;">Order #${vars.order_id} Cancelled</h2>
            <p style="margin: 0; color: #64748b; font-size: 14px;">Customer: <strong>${vars.customer_name}</strong></p>
          </div>

          ${vars.cancel_reason ? `
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 6px; padding: 14px 16px; margin: 16px 0; color: #991b1b; font-size: 13px;">
            <strong>Stated Reason:</strong> ${vars.cancel_reason}
          </div>` : ''}

          ${getCTAButton('View in Dashboard →', `${vars.admin_panel_url}/orders`, btnBg, btnText)}
        `
      };

    case 'admin_low_stock':
      return {
        title: `Admin Alert: Low Stock Warning — ${vars.product_name}`,
        content: `
          <div style="margin-bottom: 20px;">
            <div style="display: inline-block; background-color: #fffbeb; color: #b45309; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
              ⚠️ Low Inventory Warning
            </div>
            <h2 style="color: ${primary}; margin: 0 0 6px 0; font-size: 22px; font-weight: 800;">Low Stock Alert</h2>
            <p style="margin: 0; color: #64748b; font-size: 14px;">An item is running low on stock</p>
          </div>

          <div style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin: 16px 0;">
            <p style="margin: 0 0 6px 0; font-size: 16px; font-weight: 700; color: ${primary};">${vars.product_name}</p>
            <p style="margin: 0; font-size: 14px; color: #b45309; font-weight: 700;">Remaining Quantity: ${vars.product_stock} units</p>
          </div>

          ${getCTAButton('Update Inventory →', `${vars.admin_panel_url}/products`, btnBg, btnText)}
        `
      };

    case 'admin_new_customer':
      return {
        title: `Admin Alert: New Customer Registered — ${vars.customer_name}`,
        content: `
          <div style="margin-bottom: 20px;">
            <div style="display: inline-block; background-color: #eff6ff; color: #1d4ed8; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
              👤 Customer Account
            </div>
            <h2 style="color: ${primary}; margin: 0 0 6px 0; font-size: 22px; font-weight: 800;">New Customer Registration</h2>
            <p style="margin: 0; color: #64748b; font-size: 14px;">A new account was created on the storefront</p>
          </div>

          <div style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin: 16px 0; font-size: 14px;">
            <p style="margin: 0 0 6px 0; color: #334155;"><strong>Name:</strong> ${vars.customer_name}</p>
            <p style="margin: 0; color: #334155;"><strong>Email:</strong> <a href="mailto:${vars.customer_email}" style="color: #0284c7; text-decoration: none;">${vars.customer_email}</a></p>
          </div>

          ${getCTAButton('View Customers →', `${vars.admin_panel_url}/customers`, btnBg, btnText)}
        `
      };

    case 'admin_new_review':
      return {
        title: `Admin Alert: New Product Review — ${vars.product_name}`,
        content: `
          <div style="margin-bottom: 20px;">
            <div style="display: inline-block; background-color: #fef3c7; color: #b45309; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
              ⭐ New Review
            </div>
            <h2 style="color: ${primary}; margin: 0 0 6px 0; font-size: 22px; font-weight: 800;">New Review Submitted</h2>
            <p style="margin: 0; color: #64748b; font-size: 14px;">Product: <strong>${vars.product_name}</strong></p>
          </div>

          <div style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin: 16px 0;">
            <p style="margin: 0 0 6px 0; font-size: 14px; color: #334155;"><strong>Author:</strong> ${vars.review_author}</p>
            <p style="margin: 0 0 10px 0; font-size: 16px; color: #f59e0b; font-weight: 700;">Rating: ${vars.review_rating}</p>
            <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; font-style: italic; color: #475569; font-size: 13px; line-height: 1.5;">
              "${vars.review_text}"
            </div>
          </div>

          ${getCTAButton('Moderate Reviews →', `${vars.admin_panel_url}/products`, btnBg, btnText)}
        `
      };

    case 'admin_contact_form':
      return {
        title: `Admin Alert: Contact Form — ${vars.contact_subject || 'New Message'}`,
        content: `
          <div style="margin-bottom: 20px;">
            <div style="display: inline-block; background-color: #eff6ff; color: #1d4ed8; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
              ✉️ Contact Inquiry
            </div>
            <h2 style="color: ${primary}; margin: 0 0 6px 0; font-size: 22px; font-weight: 800;">New Contact Form Message</h2>
            <p style="margin: 0; color: #64748b; font-size: 14px;">From: <strong>${vars.contact_name}</strong> (${vars.customer_email})</p>
          </div>

          <div style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin: 16px 0;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: ${primary}; font-weight: 700;">Subject: ${vars.contact_subject}</p>
            <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; color: #334155; font-size: 13px; line-height: 1.6; white-space: pre-wrap;">
              ${vars.contact_message}
            </div>
          </div>

          ${vars.customer_email ? `
          <div style="text-align: center; margin: 24px 0;">
            <a href="mailto:${vars.customer_email}?subject=Re: ${encodeURIComponent(vars.contact_subject || 'Your Inquiry')}" style="background-color: ${btnBg}; color: ${btnText}; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; text-decoration: none; display: inline-block;">
              Reply to ${vars.contact_name} →
            </a>
          </div>` : ''}
        `
      };

    case 'admin_abandoned_cart':
      return {
        title: `Admin Alert: Abandoned Cart — ${vars.customer_name}`,
        content: `
          <div style="margin-bottom: 20px;">
            <div style="display: inline-block; background-color: #fff7ed; color: #c2410c; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
              🛒 Abandoned Checkout
            </div>
            <h2 style="color: ${primary}; margin: 0 0 6px 0; font-size: 22px; font-weight: 800;">Abandoned Cart Detected</h2>
            <p style="margin: 0; color: #64748b; font-size: 14px;">Cart Value: <strong style="color: #c2410c;">${vars.order_total}</strong></p>
          </div>

          <div style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin: 16px 0; font-size: 14px; color: #334155;">
            <p style="margin: 0 0 6px 0;"><strong>Customer:</strong> ${vars.customer_name}</p>
            ${vars.customer_email ? `<p style="margin: 0 0 6px 0;"><strong>Email:</strong> <a href="mailto:${vars.customer_email}" style="color: #0284c7; text-decoration: none;">${vars.customer_email}</a></p>` : ''}
            ${vars.customer_phone ? `<p style="margin: 0 0 6px 0;"><strong>Phone:</strong> <a href="tel:${vars.customer_phone}" style="color: #0284c7; text-decoration: none;">${vars.customer_phone}</a></p>` : ''}
            <p style="margin: 0;"><strong>Last Activity:</strong> ${vars.last_activity || 'Recently'}</p>
          </div>

          ${getCTAButton('View in Abandoned Carts →', `${vars.admin_panel_url}/abandoned-carts`, btnBg, btnText)}
        `
      };

    case 'admin_postex_shipped':
      return {
        title: `Admin Alert: Order #${vars.order_id} Booked with PostEx`,
        content: `
          <div style="margin-bottom: 20px;">
            <div style="display: inline-block; background-color: #ecfdf5; color: #047857; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
              📦 PostEx Booking Confirmed
            </div>
            <h2 style="color: ${primary}; margin: 0 0 6px 0; font-size: 22px; font-weight: 800;">Order Fulfilled via PostEx</h2>
            <p style="margin: 0; color: #64748b; font-size: 14px;">Consignment successfully created with PostEx Logistics</p>
          </div>

          <div style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin: 0 0 20px 0;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 14px; color: #334155; line-height: 1.6;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; width: 35%; vertical-align: top;">Order ID</td>
                <td style="padding: 6px 0; font-weight: 700; color: ${primary};">#${vars.order_id}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; vertical-align: top;">Customer</td>
                <td style="padding: 6px 0; font-weight: 600; color: ${primary};">${vars.customer_name}</td>
              </tr>
              ${vars.customer_phone ? `
              <tr>
                <td style="padding: 6px 0; color: #64748b; vertical-align: top;">Phone</td>
                <td style="padding: 6px 0; color: ${primary};">
                  <a href="tel:${vars.customer_phone}" style="color: #0284c7; text-decoration: none; font-weight: 600;">${vars.customer_phone}</a>
                </td>
              </tr>` : ''}
              <tr>
                <td style="padding: 6px 0; color: #64748b; vertical-align: top;">Tracking CN</td>
                <td style="padding: 6px 0; font-weight: 800; color: ${primary}; font-family: monospace; font-size: 15px;">${vars.tracking_number || '—'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; vertical-align: top;">COD Amount</td>
                <td style="padding: 6px 0; font-weight: 700; color: #059669; font-size: 15px;">${vars.order_total}</td>
              </tr>
              ${vars.postex_remarks ? `
              <tr>
                <td style="padding: 6px 0; color: #64748b; vertical-align: top;">Remarks</td>
                <td style="padding: 6px 0; color: #334155;">${vars.postex_remarks}</td>
              </tr>` : ''}
            </table>
          </div>

          ${vars.tracking_url ? `
          <div style="text-align: center; margin: 20px 0 16px 0;">
            <a href="${vars.tracking_url}" target="_blank" style="background-color: ${btnBg}; color: ${btnText}; padding: 12px 28px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.08);">
              Track Parcel on PostEx →
            </a>
            <div style="margin-top: 8px; font-size: 12px; color: #64748b; word-break: break-all;">
              <a href="${vars.tracking_url}" target="_blank" style="color: #0284c7; text-decoration: underline;">${vars.tracking_url}</a>
            </div>
          </div>` : ''}

          ${getCTAButton('View in Orders Dashboard →', `${vars.admin_panel_url}/orders`, btnBg, btnText)}
        `
      };

    default:
      return null;
  }
}
