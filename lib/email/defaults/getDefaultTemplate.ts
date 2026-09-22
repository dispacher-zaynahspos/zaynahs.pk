import { wrapLayout } from './layout';
import { getCustomerTemplate } from './customerTemplates';
import { getAdminTemplate } from './adminTemplates';

export function getDefaultTemplate(emailType: string, vars: Record<string, any>): string {
  const customerRes = getCustomerTemplate(emailType, vars);
  if (customerRes) {
    return wrapLayout(customerRes.content, vars, customerRes.title);
  }

  const adminRes = getAdminTemplate(emailType, vars);
  if (adminRes) {
    return wrapLayout(adminRes.content, vars, adminRes.title);
  }

  const defaultTitle = 'Notification';
  const defaultContent = `
    <h2 style="color: #1a1a2e; margin-top: 0;">Notification</h2>
    <p>Hello,</p>
    <p>This is a default storefront notification email.</p>
  `;

  return wrapLayout(defaultContent, vars, defaultTitle);
}
