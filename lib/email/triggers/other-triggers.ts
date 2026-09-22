import { getSettings } from '@/lib/services/settings';
import { sendTemplatedEmail } from '../sendTemplatedEmail';

async function getAdminEmail(): Promise<string> {
  const settings = await getSettings();
  return settings.admin_notification_email || settings.smtp_email || '';
}

// 10. New product review trigger
export async function onNewReview(review: any, product: any) {
  try {
    const adminEmail = await getAdminEmail();
    if (adminEmail) {
      await sendTemplatedEmail('admin_new_review', adminEmail, { review, product });
    }
  } catch (error) {
    console.error('[Email Trigger] onNewReview failed:', error);
  }
}

// 11. Contact Form Alert trigger
export async function onContactForm(formData: { name: string; email: string; subject: string; message: string }) {
  try {
    const adminEmail = await getAdminEmail();
    if (adminEmail) {
      await sendTemplatedEmail('admin_contact_form', adminEmail, { 
        contact: formData,
        customer: { name: formData.name, email: formData.email }
      });
    }
  } catch (error) {
    console.error('[Email Trigger] onContactForm failed:', error);
  }
}
