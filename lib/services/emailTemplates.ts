import { supabaseAdmin } from '@/lib/supabase/admin';
import { EmailTemplate } from '@/lib/types';
import { revalidateTagSafe } from '@/lib/revalidate';

export const DEFAULT_TEMPLATE_SUBJECTS: Record<string, string> = {
  welcome: 'Welcome to {{brand_name}}! 🎉',
  password_reset: 'Reset your {{brand_name}} password',
  password_changed: 'Your password was changed',
  order_placed: 'Order Confirmation #{{order_id}}',
  order_confirmed: 'Your order #{{order_id}} is confirmed',
  order_processing: 'Your order #{{order_id}} is being prepared',
  order_shipped: 'Your order #{{order_id}} has shipped! 🚀',
  order_out_for_delivery: 'Your order #{{order_id}} is out for delivery today',
  order_delivered: 'Your order #{{order_id}} has been delivered',
  order_cancelled: 'Your order #{{order_id}} was cancelled',
  order_refunded: 'Refund processed for order #{{order_id}}',
  review_request: 'How was your order from {{brand_name}}?',
  abandoned_cart: 'You left something behind at {{brand_name}}!',
  postex_shipped: 'Your order is on the way via PostEx!',
  admin_new_order: 'New Order #{{order_id}} - {{order_total}}',
  admin_order_cancelled: 'Order #{{order_id}} was cancelled',
  admin_low_stock: 'Low Stock: {{product_name}}',
  admin_new_customer: 'New customer: {{customer_name}}',
  admin_new_review: 'New review on {{product_name}}',
  admin_contact_form: 'Contact Form: {{contact_subject}}',
  admin_abandoned_cart: 'Abandoned Cart - {{customer_name}}',
  admin_postex_shipped: 'Order fulfilled via PostEx: #{{order_id}}',
};

interface EmailTemplateRow {
  id: string;
  email_type: string;
  category: 'customer' | 'admin';
  label: string;
  description?: string | null;
  enabled?: boolean | null;
  subject: string;
  custom_html?: string | null;
  updated_at: string;
}

const mapTemplate = (row: EmailTemplateRow): EmailTemplate => ({
  id: row.id,
  email_type: row.email_type,
  emailType: row.email_type,
  category: row.category,
  label: row.label,
  description: row.description || undefined,
  enabled: row.enabled ?? true,
  subject: row.subject,
  custom_html: row.custom_html || undefined,
  customHtml: row.custom_html || undefined,
  updated_at: row.updated_at,
  updatedAt: row.updated_at
});

export const getEmailTemplates = async (): Promise<EmailTemplate[]> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('email_templates')
      .select('*')
      .order('category', { ascending: false })
      .order('label', { ascending: true });

    if (error) throw error;
    return (data ?? []).map(mapTemplate);
  } catch (error) {
    console.error('[emailTemplates] getEmailTemplates failed:', error);
    throw error;
  }
};

export const getEmailTemplate = async (emailType: string): Promise<EmailTemplate | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('email_templates')
      .select('*')
      .eq('email_type', emailType)
      .maybeSingle();

    if (error) throw error;
    return data ? mapTemplate(data) : null;
  } catch (error) {
    console.error(`[emailTemplates] getEmailTemplate(${emailType}) failed:`, error);
    throw error;
  }
};

export const updateEmailTemplate = async (
  emailType: string,
  updates: Partial<Omit<EmailTemplate, 'id' | 'emailType' | 'category' | 'label' | 'description' | 'updatedAt'>>
): Promise<EmailTemplate> => {
  try {
    const payload: {
      subject?: string;
      custom_html?: string | null;
      enabled?: boolean;
      updated_at: string;
    } = { updated_at: new Date().toISOString() };
    if (updates.subject !== undefined) payload.subject = updates.subject;
    if (updates.custom_html !== undefined) {
      payload.custom_html = updates.custom_html;
    } else if (updates.customHtml !== undefined) {
      payload.custom_html = updates.customHtml;
    }
    if (updates.enabled !== undefined) payload.enabled = updates.enabled;

    const { data, error } = await supabaseAdmin
      .from('email_templates')
      .update(payload)
      .eq('email_type', emailType)
      .select('*')
      .single();

    if (error) throw error;
    revalidateTagSafe('email-templates');
    return mapTemplate(data);
  } catch (error) {
    console.error(`[emailTemplates] updateEmailTemplate(${emailType}) failed:`, error);
    throw error;
  }
};

export const resetEmailTemplate = async (emailType: string): Promise<EmailTemplate> => {
  try {
    const defaultSubject = DEFAULT_TEMPLATE_SUBJECTS[emailType];
    const payload: { custom_html: null; updated_at: string; subject?: string } = {
      custom_html: null,
      updated_at: new Date().toISOString()
    };
    if (defaultSubject) {
      payload.subject = defaultSubject;
    }

    const { data, error } = await supabaseAdmin
      .from('email_templates')
      .update(payload)
      .eq('email_type', emailType)
      .select('*')
      .single();

    if (error) throw error;
    revalidateTagSafe('email-templates');
    return mapTemplate(data);
  } catch (error) {
    console.error(`[emailTemplates] resetEmailTemplate(${emailType}) failed:`, error);
    throw error;
  }
};

export const resetAllEmailTemplates = async (category?: 'customer' | 'admin'): Promise<EmailTemplate[]> => {
  try {
    let query = supabaseAdmin.from('email_templates').select('email_type');
    if (category) {
      query = query.eq('category', category);
    }
    const { data: rows, error: fetchErr } = await query;
    if (fetchErr) throw fetchErr;

    const results: EmailTemplate[] = [];
    for (const row of rows || []) {
      const reset = await resetEmailTemplate(row.email_type);
      results.push(reset);
    }
    revalidateTagSafe('email-templates');
    return results;
  } catch (error) {
    console.error('[emailTemplates] resetAllEmailTemplates failed:', error);
    throw error;
  }
};
