export function wrapLayout(content: string, vars: Record<string, any>, title: string): string {
  const brandName = vars.brand_name || process.env.NEXT_PUBLIC_BRAND_NAME || 'Your Store';
  const siteUrl = vars.site_url || '';
  const logoHtml = vars.logo_url 
    ? `<a href="${siteUrl}" target="_blank"><img src="${vars.logo_url}" alt="${brandName}" style="max-height: 50px; margin-bottom: 20px; border: 0;" /></a>` 
    : `<a href="${siteUrl}" target="_blank" style="color: #1a1a2e; text-decoration: none;"><h1 style="margin: 0; color: #1a1a2e; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">${brandName}</h1></a>`;
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8f8f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8f8f8; padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); margin: 0 auto;">
                <!-- Header -->
                <tr>
                  <td style="padding: 32px 24px 24px 24px; border-bottom: 1px solid #f3f4f6; text-align: center;">
                    ${logoHtml}
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 32px 24px; color: #1a1a1a; font-size: 16px; line-height: 1.5; text-align: left;">
                    ${content}
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 24px 32px 24px; border-top: 1px solid #f3f4f6; background-color: #f9fafb; text-align: center; color: #6b7280; font-size: 13px;">
                    <p style="margin: 0 0 8px 0; font-weight: 600; color: #1a1a2e;">${brandName}</p>
                    <p style="margin: 0 0 12px 0;">${siteUrl ? `<a href="${siteUrl}" target="_blank" style="color: #e94560; text-decoration: underline; font-weight: 600;">Visit Store →</a>` : ''}</p>
                    <p style="margin: 0 0 16px 0;">If you have any questions, contact us at <a href="mailto:${vars.contact_email}" style="color: #e94560; text-decoration: none;">${vars.contact_email}</a></p>
                    <p style="margin: 0; font-size: 11px; color: #9ca3af;">&copy; ${vars.current_year || new Date().getFullYear()} ${brandName}. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export function getCTAButton(text: string, url: string): string {
  return `
    <div style="margin: 32px 0; text-align: center;">
      <a href="${url}" target="_blank" style="background-color: #1a1a2e; color: #ffffff; padding: 12px 32px; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-block;">
        ${text}
      </a>
    </div>
  `;
}

export function getOrderSummary(vars: Record<string, any>): string {
  return `
    <h3 style="margin-top: 32px; color: #1a1a2e; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px;">Order Details</h3>
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-top: 16px;">
      <thead>
        <tr style="border-bottom: 2px solid #e5e7eb; text-align: left; font-size: 14px; color: #6b7280;">
          <th colspan="2" style="padding-bottom: 8px;">Item</th>
          <th style="padding-bottom: 8px; text-align: center;">Qty</th>
          <th style="padding-bottom: 8px; text-align: right;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${vars.order_items_html || ''}
      </tbody>
    </table>

    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 16px; font-size: 14px; color: #4b5563;">
      <tr>
        <td style="padding: 4px 0;">Subtotal</td>
        <td style="padding: 4px 0; text-align: right;">${vars.order_subtotal}</td>
      </tr>
      ${vars.order_discount_fee ? `
      <tr>
        <td style="padding: 4px 0; color: #10b981;">Discount</td>
        <td style="padding: 4px 0; text-align: right; color: #10b981;">${vars.order_discount_fee}</td>
      </tr>` : ''}
      <tr>
        <td style="padding: 4px 0;">Shipping</td>
        <td style="padding: 4px 0; text-align: right;">${vars.order_shipping_fee}</td>
      </tr>
      <tr style="font-weight: 700; color: #1a1a2e; font-size: 16px; border-top: 1px solid #e5e7eb;">
        <td style="padding: 12px 0 4px 0;">Total</td>
        <td style="padding: 12px 0 4px 0; text-align: right;">${vars.order_total}</td>
      </tr>
    </table>

    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 24px; border-top: 2px solid #f3f4f6; padding-top: 16px;">
      <tr>
        <td width="50%" valign="top" style="padding-right: 16px;">
          <h3 style="margin: 0 0 8px 0; color: #1a1a2e; font-size: 14px;">Shipping Address</h3>
          <p style="margin: 0; color: #4b5563; font-size: 13px; line-height: 1.6;">
            ${vars['shipping_address.full'] || ''}
          </p>
        </td>
        <td width="50%" valign="top" style="padding-left: 16px; border-left: 1px solid #f3f4f6;">
          <h3 style="margin: 0 0 8px 0; color: #1a1a2e; font-size: 14px;">Payment Method</h3>
          <p style="margin: 0; color: #4b5563; font-size: 13px; line-height: 1.6;">
            ${vars.order_payment_method || 'Cash on delivery'}
          </p>
        </td>
      </tr>
    </table>
  `;
}
