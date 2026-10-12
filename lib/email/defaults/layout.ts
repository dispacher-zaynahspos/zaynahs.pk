export function wrapLayout(content: string, vars: Record<string, string>, title: string): string {
  const brandName = vars.brand_name || process.env.NEXT_PUBLIC_BRAND_NAME || 'Your Store';
  const siteUrl = vars.site_url || '';
  const primaryColor = vars.primary_color || '#0f172a';
  const accentColor = vars.accent_color || '#e94560';
  const supportEmail = vars.support_email || vars.contact_email || '';

  const logoHtml = vars.logo_url 
    ? `<a href="${siteUrl}" target="_blank" style="display: inline-block; text-decoration: none;">
        <img src="${vars.logo_url}" alt="${brandName}" style="max-height: 52px; max-width: 220px; object-fit: contain; border: 0; display: block; margin: 0 auto;" />
       </a>` 
    : `<a href="${siteUrl}" target="_blank" style="color: ${primaryColor}; text-decoration: none;">
        <h1 style="margin: 0; color: ${primaryColor}; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">${brandName}</h1>
       </a>`;

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @media only screen and (max-width: 600px) {
            .email-outer-table { padding: 12px 6px !important; }
            .email-container-table { width: 100% !important; border-radius: 12px !important; }
            .email-header-cell { padding: 22px 16px 18px 16px !important; }
            .email-content-cell { padding: 22px 16px !important; }
            .email-footer-cell { padding: 22px 16px !important; }
            .summary-col { display: block !important; width: 100% !important; padding: 12px 0 !important; border-left: none !important; border-top: 1px solid #e2e8f0 !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" class="email-outer-table" style="background-color: #f1f5f9; padding: 36px 0;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" class="email-container-table" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05); margin: 0 auto;">
                <!-- Brand Accent Top Strip (Theme Linked) -->
                <tr>
                  <td style="height: 5px; background: linear-gradient(90deg, ${primaryColor} 0%, ${accentColor} 100%); background-color: ${primaryColor};"></td>
                </tr>
                <!-- Header -->
                <tr>
                  <td class="email-header-cell" style="padding: 28px 24px 22px 24px; border-bottom: 1px solid #f1f5f9; text-align: center;">
                    ${logoHtml}
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td class="email-content-cell" style="padding: 30px 24px; color: #1e293b; font-size: 15px; line-height: 1.6; text-align: left;">
                    ${content}
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td class="email-footer-cell" style="padding: 24px 24px 28px 24px; border-top: 1px solid #f1f5f9; background-color: #f8fafc; text-align: center; color: #64748b; font-size: 13px; line-height: 1.5;">
                    <p style="margin: 0 0 6px 0; font-weight: 700; color: ${primaryColor}; font-size: 14px;">${brandName}</p>
                    ${siteUrl ? `<p style="margin: 0 0 10px 0;"><a href="${siteUrl}" target="_blank" style="color: ${accentColor}; text-decoration: none; font-weight: 600;">Visit Online Store →</a></p>` : ''}
                    ${supportEmail ? `<p style="margin: 0 0 12px 0;">Need help? Contact us at <a href="mailto:${supportEmail}" style="color: #0284c7; text-decoration: none;">${supportEmail}</a></p>` : ''}
                    <p style="margin: 0; font-size: 11px; color: #94a3b8;">&copy; ${vars.current_year || new Date().getFullYear()} ${brandName}. All rights reserved.</p>
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

export function getCTAButton(text: string, url: string, customBg?: string, customText?: string): string {
  const bg = customBg || '#0f172a';
  const color = customText || '#ffffff';
  return `
    <div style="margin: 28px 0; text-align: center;">
      <a href="${url}" target="_blank" style="background-color: ${bg}; color: ${color}; padding: 13px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none; display: inline-block; letter-spacing: 0.2px; box-shadow: 0 3px 6px rgba(0,0,0,0.08);">
        ${text}
      </a>
    </div>
  `;
}

export function getOrderSummary(vars: Record<string, string>): string {
  const primaryColor = vars.primary_color || '#0f172a';
  return `
    <div style="margin-top: 28px; border-top: 2px solid #f1f5f9; padding-top: 20px;">
      <h3 style="margin: 0 0 14px 0; color: ${primaryColor}; font-size: 16px; font-weight: 800; letter-spacing: -0.2px;">Order Breakdown</h3>
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 2px solid #e2e8f0; text-align: left; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
            <th colspan="2" style="padding-bottom: 8px;">Product</th>
            <th style="padding-bottom: 8px; text-align: center;">Qty</th>
            <th style="padding-bottom: 8px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${vars.order_items_html || ''}
        </tbody>
      </table>

      <!-- Totals -->
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 14px; font-size: 14px; color: #475569;">
        <tr>
          <td style="padding: 5px 0;">Subtotal</td>
          <td style="padding: 5px 0; text-align: right; font-weight: 600;">${vars.order_subtotal}</td>
        </tr>
        ${vars.order_discount_fee ? `
        <tr>
          <td style="padding: 5px 0; color: #16a34a;">Discount</td>
          <td style="padding: 5px 0; text-align: right; color: #16a34a; font-weight: 600;">${vars.order_discount_fee}</td>
        </tr>` : ''}
        <tr>
          <td style="padding: 5px 0;">Shipping Fee</td>
          <td style="padding: 5px 0; text-align: right; font-weight: 600;">${vars.order_shipping_fee || 'Calculated'}</td>
        </tr>
        <tr style="font-weight: 800; color: ${primaryColor}; font-size: 16px; border-top: 1.5px solid #e2e8f0;">
          <td style="padding: 12px 0 6px 0;">Total (PKR)</td>
          <td style="padding: 12px 0 6px 0; text-align: right; color: ${primaryColor}; font-size: 17px;">${vars.order_total}</td>
        </tr>
      </table>

      <!-- Details card (Address & Payment) -->
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
        <tr>
          <td width="50%" valign="top" style="padding: 4px 12px 4px 4px;" class="summary-col">
            <h4 style="margin: 0 0 6px 0; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Shipping Address</h4>
            <p style="margin: 0; color: #1e293b; font-size: 13px; line-height: 1.5; font-weight: 500;">
              ${vars['shipping_address.full'] || ''}
            </p>
          </td>
          <td width="50%" valign="top" style="padding: 4px 4px 4px 12px; border-left: 1px solid #e2e8f0;" class="summary-col">
            <h4 style="margin: 0 0 6px 0; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Payment Method</h4>
            <p style="margin: 0; color: #1e293b; font-size: 13px; line-height: 1.5; font-weight: 600;">
              ${vars.order_payment_method || 'Cash on Delivery (COD)'}
            </p>
          </td>
        </tr>
      </table>
    </div>
  `;
}
