'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { WhatsAppSubscriber, EmailSubscriber } from '@/lib/types';

/**
 * Public newsletter/WhatsApp signup — runs on the server with the service-role client
 * so the `whatsapp_subscribers` / `email_subscribers` tables can have RLS with NO public
 * SELECT policy (protecting subscriber PII from the anon key) while signup still works.
 * RULE OP2 (zero data leakage).
 */
export async function addWhatsAppSubscriberAction(
  phone: string,
  name?: string,
  email?: string,
  source_type?: string
): Promise<WhatsAppSubscriber> {
  const supabase = supabaseAdmin;
  const { data, error } = await supabase
    .from('whatsapp_subscribers')
    .insert({ phone, name, email, source_type })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      const { data: existing } = await supabase
        .from('whatsapp_subscribers')
        .select('*')
        .eq('phone', phone)
        .single();
      if (existing) return existing;
    }
    throw error;
  }
  return data;
}

export async function addEmailSubscriberAction(email: string): Promise<EmailSubscriber> {
  const supabase = supabaseAdmin;
  const { data, error } = await supabase
    .from('email_subscribers')
    .insert({ email, source: 'newsletter' })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      const { data: existing } = await supabase
        .from('email_subscribers')
        .select('*')
        .eq('email', email)
        .single();
      if (existing) return existing;
    }
    throw error;
  }
  return data;
}
