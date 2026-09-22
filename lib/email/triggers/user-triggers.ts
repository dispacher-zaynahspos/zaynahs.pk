import { getSettings } from '@/lib/services/settings';
import { sendTemplatedEmail } from '../sendTemplatedEmail';
import { getSiteUrl } from '@/lib/site-url-server';

async function getAdminEmail(): Promise<string> {
  const settings = await getSettings();
  return settings.admin_notification_email || settings.smtp_email || '';
}

// 1. Welcome template trigger
export async function onUserRegister(user: { name?: string; email: string }) {
  try {
    await sendTemplatedEmail('welcome', user.email, { user });
    await notifyAdminNewCustomer(user);
  } catch (error) {
    console.error('[Email Trigger] onUserRegister failed:', error);
  }
}

// 2. Admin notification on new customer
export async function notifyAdminNewCustomer(user: { name?: string; email: string }) {
  try {
    const adminEmail = await getAdminEmail();
    if (adminEmail) {
      await sendTemplatedEmail('admin_new_customer', adminEmail, { customer: user });
    }
  } catch (error) {
    console.error('[Email Trigger] notifyAdminNewCustomer failed:', error);
  }
}

// 3. Password reset link trigger
export async function onPasswordResetRequest(user: { name?: string; email: string }, resetToken: string) {
  try {
    const settings = await getSettings();
    const siteUrl = await getSiteUrl(settings);
    const resetLink = `${siteUrl}/reset-password?token=${resetToken}`;
    
    await sendTemplatedEmail('password_reset', user.email, { 
      user, 
      resetLink 
    });
  } catch (error) {
    console.error('[Email Trigger] onPasswordResetRequest failed:', error);
  }
}

// 4. Password changed notice
export async function onPasswordChanged(user: { name?: string; email: string }) {
  try {
    await sendTemplatedEmail('password_changed', user.email, { user });
  } catch (error) {
    console.error('[Email Trigger] onPasswordChanged failed:', error);
  }
}
