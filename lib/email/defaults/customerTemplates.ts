import { getCTAButton, getOrderSummary } from './layout';

export function getCustomerTemplate(emailType: string, vars: Record<string, string>): { title: string; content: string } | null {
  switch (emailType) {
    case 'welcome':
      return {
        title: 'Welcome!',
        content: `
          <h2 style="color: #1a1a2e; margin-top: 0;">Welcome to ${vars.brand_name}!</h2>
          <p>Hello ${vars.customer_name},</p>
          <p>Your account is ready. You can now start exploring and shopping our premium collections.</p>
          ${getCTAButton('Start Shopping', `${vars.site_url}/shop`)}
          <p>Thank you for choosing us!</p>
        `
      };

    case 'password_reset':
      return {
        title: 'Reset Password',
        content: `
          <h2 style="color: #1a1a2e; margin-top: 0;">Reset Your Password</h2>
          <p>Hello ${vars.customer_name},</p>
          <p>We received a request to reset your password. Click the button below to choose a new password. This link will expire in 1 hour.</p>
          ${getCTAButton('Reset Password', vars.reset_link || '')}
          <p>If you didn't request this, you can safely ignore this email.</p>
        `
      };

    case 'password_changed':
      return {
        title: 'Password Changed',
        content: `
          <h2 style="color: #1a1a2e; margin-top: 0;">Password Changed</h2>
          <p>Hello ${vars.customer_name},</p>
          <p>Your account password was successfully updated.</p>
          <p style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px; color: #78350f; font-size: 14px;">
            <strong>Warning:</strong> If you did not make this change, please contact us immediately to secure your account.
          </p>
        `
      };

    case 'order_placed':
      return {
        title: `Order Confirmation #${vars.order_id}`,
        content: `
          <h2 style="color: #1a1a2e; margin-top: 0;">Thank you for your order!</h2>
          <p>Hi ${vars.customer_name},</p>
          <p>We've received your order and are getting it ready. We will notify you once it has been confirmed.</p>
          ${getCTAButton('View Your Order', `${vars.site_url}/shop`)}
          ${getOrderSummary(vars)}
        `
      };

    case 'order_confirmed':
      return {
        title: `Order Confirmed #${vars.order_id}`,
        content: `
          <h2 style="color: #1a1a2e; margin-top: 0;">Your order is confirmed!</h2>
          <p>Hi ${vars.customer_name},</p>
          <p>Your order <strong>#${vars.order_id}</strong> is confirmed and being prepared. We will let you know once it ships.</p>
          ${getOrderSummary(vars)}
        `
      };

    case 'order_processing':
      return {
        title: `Order Processing #${vars.order_id}`,
        content: `
          <h2 style="color: #1a1a2e; margin-top: 0;">Your order is being prepared!</h2>
          <p>Hi ${vars.customer_name},</p>
          <p>We are packaging your order <strong>#${vars.order_id}</strong> and it will be handed over to our shipping partner shortly.</p>
          ${getOrderSummary(vars)}
        `
      };

    case 'order_shipped':
      return {
        title: `Order Shipped #${vars.order_id}`,
        content: `
          <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.3px;">Your order has shipped! 🚀</h2>
          <p style="margin: 0 0 14px 0; color: #334155; font-size: 15px; line-height: 1.6;">Hi <strong>${vars.customer_name}</strong>,</p>
          <p style="margin: 0 0 18px 0; color: #475569; font-size: 14px; line-height: 1.6;">
            Good news! Your order <strong>#${vars.order_id}</strong> has been shipped via <strong>${vars.courier_name || 'Courier'}</strong> and is on its way to you.
          </p>

          <div style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 6px 0; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">
              ${vars.courier_name || 'Courier'} Tracking Consignment # (CN)
            </p>
            <p style="margin: 0 0 14px 0; font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: 2.5px; font-family: monospace;">
              ${vars.tracking_number || 'Pending'}
            </p>
            ${vars.tracking_url ? `
            <div style="margin: 12px 0 8px 0;">
              <a href="${vars.tracking_url}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 700; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                Track Your Order →
              </a>
            </div>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b; word-break: break-all;">
              Direct Link: <a href="${vars.tracking_url}" target="_blank" style="color: #0284c7; text-decoration: underline;">${vars.tracking_url}</a>
            </p>
            ` : ''}
          </div>

          <!-- Delivery & WhatsApp Support Notice -->
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px 20px; margin: 20px 0; text-align: left;">
            <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: #166534;">
              📦 Delivery & Support Notice
            </p>
            <p style="margin: 0 0 10px 0; font-size: 13px; color: #15803d; line-height: 1.6;">
              Dear Customer, please keep tracking your parcel using the tracking link above. Delivery takes <strong>3–5 working days</strong>. If you do not receive your parcel within 3–5 working days, please reach out to our WhatsApp support team with your <strong>Order ID (#${vars.order_id})</strong>. We will happily assist you!
            </p>
            ${vars.whatsapp_url ? `
            <div style="margin-top: 12px;">
              <a href="${vars.whatsapp_url}" target="_blank" style="display: inline-block; background-color: #25D366; color: #ffffff; padding: 10px 22px; border-radius: 8px; font-weight: 700; font-size: 13px; text-decoration: none;">
                💬 Contact Support on WhatsApp →
              </a>
            </div>` : ''}
          </div>

          <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px 16px; margin: 16px 0; font-size: 12px; color: #92400e; line-height: 1.5;">
            <strong>💡 Delivery Reminder:</strong> Please keep your phone (${vars.customer_phone || 'provided phone'}) active. The delivery rider will call before arriving. Kindly keep <strong>${vars.order_total}</strong> ready.
          </div>

          ${getOrderSummary(vars)}
        `
      };

    case 'order_out_for_delivery':
      return {
        title: `Out for Delivery #${vars.order_id}`,
        content: `
          <h2 style="color: #1a1a2e; margin-top: 0;">Out for Delivery</h2>
          <p>Hi ${vars.customer_name},</p>
          <p>Your order <strong>#${vars.order_id}</strong> is out for delivery today. Please make sure someone is available to receive it.</p>
          ${getOrderSummary(vars)}
        `
      };

    case 'order_delivered':
      return {
        title: `Order Delivered #${vars.order_id}`,
        content: `
          <h2 style="color: #10b981; margin-top: 0;">Delivered!</h2>
          <p>Hi ${vars.customer_name},</p>
          <p>Your order <strong>#${vars.order_id}</strong> has been successfully delivered. We hope you love your purchase!</p>
          ${getOrderSummary(vars)}
        `
      };

    case 'order_cancelled':
      return {
        title: `Order Cancelled #${vars.order_id}`,
        content: `
          <h2 style="color: #ef4444; margin-top: 0;">Order Cancelled</h2>
          <p>Hi ${vars.customer_name},</p>
          <p>Your order <strong>#${vars.order_id}</strong> has been cancelled.</p>
          ${vars.cancel_reason ? `<div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin: 16px 0; color: #991b1b; font-size: 14px; border-radius: 4px;"><strong>Reason:</strong> ${vars.cancel_reason}</div>` : ''}
          <p>If you did not request this cancellation, or if there was an issue with your payment or verification, please reply to this email or contact us on WhatsApp. We are here to help!</p>
          ${getOrderSummary(vars)}
          ${getCTAButton('Continue Shopping', `${vars.site_url || '#'}`)}
        `
      };

    case 'order_refunded':
      return {
        title: `Order Refunded #${vars.order_id}`,
        content: `
          <h2 style="color: #1a1a2e; margin-top: 0;">Refund Processed</h2>
          <p>Hi ${vars.customer_name},</p>
          <p>We have processed a refund of <strong>${vars.refund_amount}</strong> for your order <strong>#${vars.order_id}</strong>.</p>
          <p>The refunded amount should reflect in your account within 5-7 business days, depending on your payment provider.</p>
        `
      };

    case 'review_request':
      return {
        title: 'How was your order?',
        content: `
          <h2 style="color: #1a1a2e; margin-top: 0;">Leave a Review</h2>
          <p>Hi ${vars.customer_name},</p>
          <p>Thank you for shopping with us! We hope you love your recent order. Could you take a moment to tell us how we did?</p>
          ${getCTAButton('Leave a Review', `${vars.site_url}/shop`)}
          <p>Your feedback helps us and other customers immensely!</p>
        `
      };

    case 'abandoned_cart':
      return {
        title: 'You left something behind!',
        content: `
          <h2 style="color: #1a1a2e; margin-top: 0;">Complete Your Order</h2>
          <p>Hi ${vars.customer_name},</p>
          <p>You left some great items in your cart. Grab them before they run out!</p>
          ${getOrderSummary(vars)}
          ${getCTAButton('Complete Checkout →', vars.checkout_url)}
          <p style="margin-top: 16px; font-size: 13px; color: #9ca3af; text-align: center;">
            You received this email because you started checkout on our store.
          </p>
        `
      };

    case 'postex_shipped':
      return {
        title: 'Order Shipped via PostEx #' + vars.order_id,
        content: `
          <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.3px;">Your order has been dispatched! 🚀</h2>
          <p style="margin: 0 0 14px 0; color: #334155; font-size: 15px; line-height: 1.6;">Hi <strong>${vars.customer_name}</strong>,</p>
          <p style="margin: 0 0 18px 0; color: #475569; font-size: 14px; line-height: 1.6;">
            Great news! Your order <strong>#${vars.order_id}</strong> has been handed over to <strong>PostEx Logistics</strong> and is on its way to you.
          </p>

          <!-- Tracking Card -->
          <div style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 6px 0; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">
              PostEx Consignment Tracking # (CN)
            </p>
            <p style="margin: 0 0 14px 0; font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: 2.5px; font-family: monospace;">
              ${vars.tracking_number || 'Pending'}
            </p>
            ${vars.tracking_url ? `
            <div style="margin: 12px 0 8px 0;">
              <a href="${vars.tracking_url}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 700; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                Track Your Parcel →
              </a>
            </div>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b; word-break: break-all;">
              Direct Link: <a href="${vars.tracking_url}" target="_blank" style="color: #0284c7; text-decoration: underline;">${vars.tracking_url}</a>
            </p>
            ` : ''}
          </div>

          <!-- Friendly Delivery & Support Note (English, short, happily assist) -->
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px 20px; margin: 20px 0; text-align: left;">
            <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: #166534;">
              📦 Delivery & Support Notice
            </p>
            <p style="margin: 0 0 10px 0; font-size: 13px; color: #15803d; line-height: 1.6;">
              Dear Customer, please keep tracking your parcel using the tracking link above. Expected delivery time is <strong>3–5 working days</strong>. If you do not receive your parcel within 3–5 working days, please reach out to our WhatsApp support team with your <strong>Order ID (#${vars.order_id})</strong>. We will happily assist you!
            </p>
            ${vars.whatsapp_url ? `
            <div style="margin-top: 12px;">
              <a href="${vars.whatsapp_url}" target="_blank" style="display: inline-block; background-color: #25D366; color: #ffffff; padding: 10px 22px; border-radius: 8px; font-weight: 700; font-size: 13px; text-decoration: none;">
                💬 Contact Support on WhatsApp →
              </a>
            </div>` : ''}
          </div>

          ${vars.postex_remarks ? `
          <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 12px 16px; margin: 16px 0; color: #9a3412; font-size: 13px; line-height: 1.5;">
            <strong>Delivery Note:</strong> ${vars.postex_remarks}
          </div>` : ''}

          <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px 16px; margin: 16px 0; font-size: 12px; color: #92400e; line-height: 1.5;">
            <strong>💡 Rider & COD Reminder:</strong> Please ensure your contact number (${vars.customer_phone || 'provided phone'}) remains active and reachable. The courier rider will call before delivery. Kindly keep the COD amount of <strong>${vars.order_total}</strong> ready.
          </div>

          ${getOrderSummary(vars)}
        `
      };

    default:
      return null;
  }
}
