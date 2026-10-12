import { getCTAButton, getOrderSummary } from './layout';

export function getCustomerTemplate(emailType: string, vars: Record<string, string>): { title: string; content: string } | null {
  const primary = vars.primary_color || '#0f172a';
  const accent = vars.accent_color || '#e94560';
  const btnBg = vars.button_bg_color || primary;
  const btnText = vars.button_text_color || '#ffffff';

  switch (emailType) {
    case 'welcome':
      return {
        title: `Welcome to ${vars.brand_name}! 🎉`,
        content: `
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background-color: #f1f5f9; padding: 12px 18px; border-radius: 999px; margin-bottom: 12px;">
              <span style="font-size: 20px;">✨</span>
            </div>
            <h2 style="color: ${primary}; margin: 0 0 8px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Welcome to ${vars.brand_name}!</h2>
            <p style="margin: 0; color: #64748b; font-size: 15px;">Your account is ready for seamless shopping</p>
          </div>

          <p style="margin: 0 0 16px 0; color: #334155; font-size: 15px; line-height: 1.6;">
            Hello <strong>${vars.customer_name}</strong>,
          </p>
          <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px; line-height: 1.6;">
            Thank you for joining our community! You now have full access to our curated catalog, wishlists, and seamless order tracking.
          </p>

          <!-- Perks Box -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin: 20px 0;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px; color: #334155;">
              <tr>
                <td style="padding: 6px 0;">🌟 <strong>Premium Quality:</strong> 100% verified authentic items.</td>
              </tr>
              <tr>
                <td style="padding: 6px 0;">🚚 <strong>Fast Delivery:</strong> Express door-to-door courier service.</td>
              </tr>
              <tr>
                <td style="padding: 6px 0;">💬 <strong>Direct Support:</strong> Friendly WhatsApp assistance anytime.</td>
              </tr>
            </table>
          </div>

          ${getCTAButton('Explore Collections →', `${vars.site_url}/shop`, btnBg, btnText)}

          <p style="margin: 20px 0 0 0; font-size: 13px; color: #64748b; text-align: center;">
            Happy shopping with <strong>${vars.brand_name}</strong>!
          </p>
        `
      };

    case 'password_reset':
      return {
        title: `Reset Your Password — ${vars.brand_name}`,
        content: `
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background-color: #fef2f2; padding: 12px 18px; border-radius: 999px; margin-bottom: 12px;">
              <span style="font-size: 20px;">🔒</span>
            </div>
            <h2 style="color: ${primary}; margin: 0 0 8px 0; font-size: 22px; font-weight: 800; letter-spacing: -0.4px;">Reset Your Password</h2>
            <p style="margin: 0; color: #64748b; font-size: 14px;">Follow the link below to choose a new password</p>
          </div>

          <p style="margin: 0 0 16px 0; color: #334155; font-size: 15px; line-height: 1.6;">
            Hello <strong>${vars.customer_name}</strong>,
          </p>
          <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px; line-height: 1.6;">
            We received a request to reset the password for your account. Click the secure button below to set a new password. This link is valid for <strong>1 hour</strong>.
          </p>

          ${getCTAButton('Reset My Password →', vars.reset_link || '', btnBg, btnText)}

          <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 10px; padding: 14px 16px; margin: 24px 0 0 0; font-size: 12px; color: #92400e; line-height: 1.5;">
            <strong>⚠️ Security Notice:</strong> If you did not request a password reset, you can safely ignore this email. Your current password remains secure.
          </div>
        `
      };

    case 'password_changed':
      return {
        title: `Password Changed Confirmation — ${vars.brand_name}`,
        content: `
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background-color: #f0fdf4; padding: 12px 18px; border-radius: 999px; margin-bottom: 12px;">
              <span style="font-size: 20px;">✅</span>
            </div>
            <h2 style="color: ${primary}; margin: 0 0 8px 0; font-size: 22px; font-weight: 800;">Password Updated</h2>
            <p style="margin: 0; color: #64748b; font-size: 14px;">Your account credentials have been changed</p>
          </div>

          <p style="margin: 0 0 16px 0; color: #334155; font-size: 15px; line-height: 1.6;">
            Hello <strong>${vars.customer_name}</strong>,
          </p>
          <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px; line-height: 1.6;">
            This email confirms that the password for your <strong>${vars.brand_name}</strong> account was recently updated.
          </p>

          <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 10px; padding: 14px 16px; margin: 20px 0; font-size: 13px; color: #991b1b; line-height: 1.5;">
            <strong>Important:</strong> If you did not make this change, please contact our support team immediately so we can help safeguard your account.
          </div>

          ${getCTAButton('Sign In to Account →', `${vars.site_url}/auth/login`, btnBg, btnText)}
        `
      };

    case 'order_placed':
      return {
        title: `Order Received #${vars.order_id} — ${vars.brand_name}`,
        content: `
          <div style="margin-bottom: 20px;">
            <div style="display: inline-block; background-color: #f0fdf4; color: #166534; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 999px; margin-bottom: 10px;">
              ✓ Order Received
            </div>
            <h2 style="color: ${primary}; margin: 0 0 8px 0; font-size: 22px; font-weight: 800; letter-spacing: -0.4px;">Thank you for your order! 🎉</h2>
            <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6;">
              Hi <strong>${vars.customer_name}</strong>, we've successfully received your order <strong>#${vars.order_id}</strong>. Our team is now reviewing and preparing your items.
            </p>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; margin: 18px 0; font-size: 13px; color: #334155;">
            <strong>Next Step:</strong> You will receive a confirmation notice as soon as your order has been packed and scheduled for shipping.
          </div>

          ${getOrderSummary(vars)}
        `
      };

    case 'order_confirmed':
      return {
        title: `Order Confirmed #${vars.order_id} — ${vars.brand_name}`,
        content: `
          <div style="margin-bottom: 20px;">
            <div style="display: inline-block; background-color: #ecfdf5; color: #047857; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 999px; margin-bottom: 10px;">
              ✓ Order Approved & Confirmed
            </div>
            <h2 style="color: ${primary}; margin: 0 0 8px 0; font-size: 22px; font-weight: 800; letter-spacing: -0.4px;">Your order is confirmed! ✅</h2>
            <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6;">
              Hi <strong>${vars.customer_name}</strong>, your order <strong>#${vars.order_id}</strong> has been confirmed and scheduled for packaging.
            </p>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; margin: 18px 0; font-size: 13px; color: #334155;">
            Estimated delivery timeframe is <strong>3–5 working days</strong>. We will send you the courier tracking consignment details as soon as it is dispatched!
          </div>

          ${getOrderSummary(vars)}
        `
      };

    case 'order_processing':
      return {
        title: `Order Being Prepared #${vars.order_id} — ${vars.brand_name}`,
        content: `
          <div style="margin-bottom: 20px;">
            <div style="display: inline-block; background-color: #eff6ff; color: #1d4ed8; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 999px; margin-bottom: 10px;">
              📦 Packaging in Progress
            </div>
            <h2 style="color: ${primary}; margin: 0 0 8px 0; font-size: 22px; font-weight: 800;">Your items are being packed!</h2>
            <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6;">
              Hi <strong>${vars.customer_name}</strong>, our warehouse team is currently inspecting and carefully packing your order <strong>#${vars.order_id}</strong>.
            </p>
          </div>

          ${getOrderSummary(vars)}
        `
      };

    case 'order_shipped':
      return {
        title: `Order Shipped #${vars.order_id} — ${vars.brand_name}`,
        content: `
          <div style="margin-bottom: 18px;">
            <div style="display: inline-block; background-color: #f0fdf4; color: #15803d; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 999px; margin-bottom: 10px;">
              🚀 Dispatched
            </div>
            <h2 style="color: ${primary}; margin: 0 0 8px 0; font-size: 22px; font-weight: 800; letter-spacing: -0.4px;">Your order has shipped!</h2>
            <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6;">
              Good news <strong>${vars.customer_name}</strong>! Your order <strong>#${vars.order_id}</strong> has been handed over to <strong>${vars.courier_name || 'Courier'}</strong> and is on its way.
            </p>
          </div>

          <!-- Tracking Card -->
          <div style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 6px 0; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">
              ${vars.courier_name || 'Courier'} Consignment Tracking # (CN)
            </p>
            <p style="margin: 0 0 14px 0; font-size: 24px; font-weight: 800; color: ${primary}; letter-spacing: 2px; font-family: monospace;">
              ${vars.tracking_number || 'Pending'}
            </p>
            ${vars.tracking_url ? `
            <div style="margin: 12px 0 8px 0;">
              <a href="${vars.tracking_url}" target="_blank" style="display: inline-block; background-color: ${btnBg}; color: ${btnText}; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 700; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                Track Your Parcel →
              </a>
            </div>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b; word-break: break-all;">
              Direct Link: <a href="${vars.tracking_url}" target="_blank" style="color: #0284c7; text-decoration: underline;">${vars.tracking_url}</a>
            </p>` : ''}
          </div>

          <!-- Delivery Notice -->
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px 20px; margin: 20px 0; text-align: left;">
            <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: #166534;">
              📦 Delivery & Support Notice
            </p>
            <p style="margin: 0 0 10px 0; font-size: 13px; color: #15803d; line-height: 1.6;">
              Dear Customer, please keep tracking your parcel using the link above. Expected delivery is <strong>3–5 working days</strong>. If not received within 3–5 working days, please reach out to our WhatsApp support team with your <strong>Order ID (#${vars.order_id})</strong>. We will happily assist you!
            </p>
            ${vars.whatsapp_url ? `
            <div style="margin-top: 12px;">
              <a href="${vars.whatsapp_url}" target="_blank" style="display: inline-block; background-color: #25D366; color: #ffffff; padding: 10px 22px; border-radius: 8px; font-weight: 700; font-size: 13px; text-decoration: none;">
                💬 Contact Support on WhatsApp →
              </a>
            </div>` : ''}
          </div>

          <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px 16px; margin: 16px 0; font-size: 12px; color: #92400e; line-height: 1.5;">
            <strong>💡 Rider & COD Reminder:</strong> Please keep your phone (${vars.customer_phone || 'provided phone'}) active. The delivery rider will call before arrival. Kindly keep <strong>${vars.order_total}</strong> ready.
          </div>

          ${getOrderSummary(vars)}
        `
      };

    case 'postex_shipped':
      return {
        title: `Order Shipped via PostEx #${vars.order_id} — ${vars.brand_name}`,
        content: `
          <div style="margin-bottom: 18px;">
            <div style="display: inline-block; background-color: #f0fdf4; color: #15803d; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 999px; margin-bottom: 10px;">
              🚀 Dispatched via PostEx
            </div>
            <h2 style="color: ${primary}; margin: 0 0 8px 0; font-size: 22px; font-weight: 800; letter-spacing: -0.4px;">Your order is on the way!</h2>
            <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6;">
              Great news <strong>${vars.customer_name}</strong>! Your order <strong>#${vars.order_id}</strong> has been handed over to <strong>PostEx Logistics</strong>.
            </p>
          </div>

          <!-- PostEx Tracking Box -->
          <div style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 6px 0; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">
              PostEx Consignment Tracking # (CN)
            </p>
            <p style="margin: 0 0 14px 0; font-size: 24px; font-weight: 800; color: ${primary}; letter-spacing: 2px; font-family: monospace;">
              ${vars.tracking_number || 'Pending'}
            </p>
            ${vars.tracking_url ? `
            <div style="margin: 12px 0 8px 0;">
              <a href="${vars.tracking_url}" target="_blank" style="display: inline-block; background-color: ${btnBg}; color: ${btnText}; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 700; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                Track Your Parcel →
              </a>
            </div>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b; word-break: break-all;">
              Direct Link: <a href="${vars.tracking_url}" target="_blank" style="color: #0284c7; text-decoration: underline;">${vars.tracking_url}</a>
            </p>` : ''}
          </div>

          <!-- English Polite Support Notice -->
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

    case 'order_out_for_delivery':
      return {
        title: `Out for Delivery Today #${vars.order_id} — ${vars.brand_name}`,
        content: `
          <div style="margin-bottom: 20px;">
            <div style="display: inline-block; background-color: #fef3c7; color: #b45309; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 999px; margin-bottom: 10px;">
              🚚 Out for Delivery
            </div>
            <h2 style="color: ${primary}; margin: 0 0 8px 0; font-size: 22px; font-weight: 800;">Your order is arriving today!</h2>
            <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6;">
              Hi <strong>${vars.customer_name}</strong>, your parcel for order <strong>#${vars.order_id}</strong> is out with the courier delivery rider and scheduled to be delivered today.
            </p>
          </div>

          <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 10px; padding: 16px; margin: 20px 0; font-size: 13px; color: #92400e; line-height: 1.6;">
            <strong>Important Reminders:</strong>
            <ul style="margin: 8px 0 0 0; padding-left: 20px;">
              <li>Please keep your phone (${vars.customer_phone || 'active phone'}) nearby and reachable.</li>
              <li>Please keep the exact cash amount of <strong>${vars.order_total}</strong> ready for the delivery rider.</li>
            </ul>
          </div>

          ${getOrderSummary(vars)}
        `
      };

    case 'order_delivered':
      return {
        title: `Order Delivered Successfully #${vars.order_id} — ${vars.brand_name}`,
        content: `
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background-color: #f0fdf4; padding: 14px 20px; border-radius: 999px; margin-bottom: 12px;">
              <span style="font-size: 24px;">🎁</span>
            </div>
            <h2 style="color: ${primary}; margin: 0 0 8px 0; font-size: 24px; font-weight: 800;">Order Delivered!</h2>
            <p style="margin: 0; color: #64748b; font-size: 14px;">Your package has arrived</p>
          </div>

          <p style="margin: 0 0 16px 0; color: #334155; font-size: 15px; line-height: 1.6;">
            Hi <strong>${vars.customer_name}</strong>,
          </p>
          <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px; line-height: 1.6;">
            Your order <strong>#${vars.order_id}</strong> has been successfully marked as delivered. We sincerely hope you are delighted with your purchase!
          </p>

          ${getCTAButton('Shop Again →', `${vars.site_url}/shop`, btnBg, btnText)}

          ${getOrderSummary(vars)}
        `
      };

    case 'order_cancelled':
      return {
        title: `Order Cancelled #${vars.order_id} — ${vars.brand_name}`,
        content: `
          <div style="margin-bottom: 20px;">
            <div style="display: inline-block; background-color: #fef2f2; color: #b91c1c; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 999px; margin-bottom: 10px;">
              ✕ Order Cancelled
            </div>
            <h2 style="color: ${primary}; margin: 0 0 8px 0; font-size: 22px; font-weight: 800;">Order Cancellation Notice</h2>
            <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6;">
              Hi <strong>${vars.customer_name}</strong>, your order <strong>#${vars.order_id}</strong> has been cancelled.
            </p>
          </div>

          ${vars.cancel_reason ? `
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 14px 16px; margin: 18px 0; color: #991b1b; font-size: 13px; border-radius: 6px;">
            <strong>Cancellation Reason:</strong> ${vars.cancel_reason}
          </div>` : ''}

          <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 16px 0;">
            If you did not request this cancellation or would like to re-order, our team is here to assist you via WhatsApp or Email.
          </p>

          ${getCTAButton('Browse New Arrivals →', `${vars.site_url}/shop`, btnBg, btnText)}

          ${getOrderSummary(vars)}
        `
      };

    case 'order_refunded':
      return {
        title: `Refund Processed #${vars.order_id} — ${vars.brand_name}`,
        content: `
          <div style="margin-bottom: 20px;">
            <div style="display: inline-block; background-color: #f0fdf4; color: #166534; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 999px; margin-bottom: 10px;">
              💳 Refund Processed
            </div>
            <h2 style="color: ${primary}; margin: 0 0 8px 0; font-size: 22px; font-weight: 800;">Refund Completed</h2>
            <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6;">
              Hi <strong>${vars.customer_name}</strong>, we have processed a refund of <strong>${vars.refund_amount || vars.order_total}</strong> for your order <strong>#${vars.order_id}</strong>.
            </p>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; margin: 18px 0; font-size: 13px; color: #334155;">
            The refunded amount will reflect in your account within <strong>3–7 business days</strong>, depending on your financial institution or method of payment.
          </div>
        `
      };

    case 'review_request':
      return {
        title: `How was your order? — ${vars.brand_name}`,
        content: `
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 28px; margin-bottom: 10px; color: #f59e0b;">
              ★★★★★
            </div>
            <h2 style="color: ${primary}; margin: 0 0 8px 0; font-size: 22px; font-weight: 800;">How did we do?</h2>
            <p style="margin: 0; color: #64748b; font-size: 14px;">We would love to hear your thoughts</p>
          </div>

          <p style="margin: 0 0 16px 0; color: #334155; font-size: 15px; line-height: 1.6;">
            Hi <strong>${vars.customer_name}</strong>,
          </p>
          <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px; line-height: 1.6;">
            Thank you for shopping with <strong>${vars.brand_name}</strong>! Could you take 30 seconds to share your review? Your feedback helps fellow customers and supports our small business immensely.
          </p>

          ${getCTAButton('Write a Review ⭐ →', `${vars.site_url}/shop`, btnBg, btnText)}
        `
      };

    case 'abandoned_cart':
      return {
        title: `You left something behind at ${vars.brand_name}! 🛒`,
        content: `
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background-color: #fff7ed; padding: 12px 18px; border-radius: 999px; margin-bottom: 12px;">
              <span style="font-size: 20px;">🛒</span>
            </div>
            <h2 style="color: ${primary}; margin: 0 0 8px 0; font-size: 22px; font-weight: 800;">Did you forget something?</h2>
            <p style="margin: 0; color: #64748b; font-size: 14px;">Your favorite items are waiting in your cart</p>
          </div>

          <p style="margin: 0 0 16px 0; color: #334155; font-size: 15px; line-height: 1.6;">
            Hi <strong>${vars.customer_name}</strong>,
          </p>
          <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px; line-height: 1.6;">
            We noticed you didn't finish your checkout. Stock is limited and items in your cart might sell out soon. Complete your order today before it's gone!
          </p>

          ${getOrderSummary(vars)}

          ${getCTAButton('Complete Checkout Now →', vars.checkout_url || `${vars.site_url}/cart`, btnBg, btnText)}
        `
      };

    default:
      return null;
  }
}
