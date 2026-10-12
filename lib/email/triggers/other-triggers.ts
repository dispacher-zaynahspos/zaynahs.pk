import { getSettings } from '@/lib/services/settings';
import { sendTemplatedEmail } from '../sendTemplatedEmail';
import { Review, Product } from '@/lib/types';

/** Review shape as received by email triggers. Accepts the real `Review` plus
 * any loose extra fields some callers include. */
type TriggerReview = Review & Record<string, unknown>;

/** Product shape as received by email triggers. Accepts the real `Product`
 * plus any loose extra fields some callers include. */
type TriggerProduct = Product & Record<string, unknown>;

async function getAdminEmail(): Promise<string> {
  const settings = await getSettings();
  return settings.admin_notification_email || settings.smtp_email || '';
}

// 10. New product review trigger
export async function onNewReview(review: TriggerReview, product: TriggerProduct) {
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
