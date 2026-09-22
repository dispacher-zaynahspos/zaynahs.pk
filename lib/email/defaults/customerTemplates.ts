import { getCTAButton, getOrderSummary } from './layout';

export function getCustomerTemplate(emailType: string, vars: Record<string, any>): { title: string; content: string } | null {
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
          <h2 style="color: #1a1a2e; margin-top: 0;">Your order has shipped!</h2>
          <p>Hi ${vars.customer_name},</p>
          <p>Good news! Your order <strong>#${vars.order_id}</strong> has been shipped and is on its way to you.</p>
          
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin: 24px 0; font-size: 14px;">
            <p style="margin: 0 0 8px 0;"><strong>Courier:</strong> ${vars.courier_name}</p>
            <p style="margin: 0 0 8px 0;"><strong>Tracking Number:</strong> ${vars.tracking_number}</p>
            ${vars.estimated_delivery ? `<p style="margin: 0;"><strong>Estimated Delivery:</strong> ${vars.estimated_delivery}</p>` : ''}
          </div>
          
          ${vars.tracking_url ? getCTAButton('Track Your Order', vars.tracking_url) : ''}
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
          <h2 style="color: #1a1a2e; margin-top: 0;">Your order has been dispatched!</h2>
          <p>Hi ${vars.customer_name},</p>
          <p>Your order <strong>#${vars.order_id}</strong> has been handed over to <strong>PostEx Logistics</strong> and is on its way. Please allow <strong>2-5 working days</strong> for delivery. Keep your provided phone number active for the rider to reach you.</p>
          
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center;">
            <p style="margin: 0 0 6px; color: #166534; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Tracking Consignment Number (CN)</p>
            <p style="margin: 0 0 12px; font-size: 24px; font-weight: 800; color: #1a1a2e; letter-spacing: 3px;">${vars.tracking_number}</p>
            ${vars.tracking_url ? '<a href="' + vars.tracking_url + '" target="_blank" style="display: inline-block; background: #e94560; color: #fff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 700; font-size: 14px;">Track Your Parcel →</a>' : ''}
          </div>
          
          ${vars.postex_remarks ? '<p style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 6px; padding: 10px 14px; color: #9a3412; font-size: 13px; line-height: 1.5;"><strong>Note:</strong> ' + vars.postex_remarks + '</p>' : ''}
          
          ${getOrderSummary(vars)}
          
          <div style="margin-top: 16px; padding: 12px; background: #fefce8; border: 1px solid #fde68a; border-radius: 6px; font-size: 12px; color: #92400e; line-height: 1.5;">
            <strong>⚠️ Important:</strong> Orders take <strong>2-5 working days</strong> for delivery. Please ensure the provided phone number remains active and switched on. The rider may call you before delivery.
          </div>
        `
      };

    default:
      return null;
  }
}
