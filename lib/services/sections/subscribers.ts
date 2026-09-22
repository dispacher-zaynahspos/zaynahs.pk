'use server';

import { createClient } from '@/lib/supabase/server';
import { WhatsAppSubscriber, EmailSubscriber } from '@/lib/types';

export const addWhatsAppSubscriber = async (
  phone: string,
  name?: string,
  email?: string,
  source_type?: string
): Promise<WhatsAppSubscriber> => {
  try {
    const supabase = await createClient();
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
  } catch (error) {
    console.error('[sections] addWhatsAppSubscriber failed:', error);
    throw error;
  }
};

export const getWhatsAppSubscribers = async (): Promise<WhatsAppSubscriber[]> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('whatsapp_subscribers')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[sections] getWhatsAppSubscribers failed:', error);
    throw error;
  }
};

export const addEmailSubscriber = async (email: string): Promise<EmailSubscriber> => {
  try {
    const supabase = await createClient();
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
  } catch (error) {
    console.error('[sections] addEmailSubscriber failed:', error);
    throw error;
  }
};

export const getEmailSubscribers = async (): Promise<EmailSubscriber[]> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('email_subscribers')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[sections] getEmailSubscribers failed:', error);
    throw error;
  }
};

export const getDeletedWhatsAppSubscribers = async (): Promise<WhatsAppSubscriber[]> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('whatsapp_subscribers')
      .select('*')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[sections] getDeletedWhatsAppSubscribers failed:', error);
    throw error;
  }
};

export const deleteWhatsAppSubscriber = async (id: string): Promise<void> => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('whatsapp_subscribers')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('[sections] deleteWhatsAppSubscriber failed:', error);
    throw error;
  }
};

export const restoreWhatsAppSubscriber = async (id: string): Promise<void> => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('whatsapp_subscribers')
      .update({ deleted_at: null })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('[sections] restoreWhatsAppSubscriber failed:', error);
    throw error;
  }
};

export const hardDeleteWhatsAppSubscriber = async (id: string): Promise<void> => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('whatsapp_subscribers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('[sections] hardDeleteWhatsAppSubscriber failed:', error);
    throw error;
  }
};

export const getDeletedEmailSubscribers = async (): Promise<EmailSubscriber[]> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('email_subscribers')
      .select('*')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[sections] getDeletedEmailSubscribers failed:', error);
    throw error;
  }
};

export const deleteEmailSubscriber = async (id: string): Promise<void> => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('email_subscribers')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('[sections] deleteEmailSubscriber failed:', error);
    throw error;
  }
};

export const restoreEmailSubscriber = async (id: string): Promise<void> => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('email_subscribers')
      .update({ deleted_at: null })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('[sections] restoreEmailSubscriber failed:', error);
    throw error;
  }
};

export const hardDeleteEmailSubscriber = async (id: string): Promise<void> => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('email_subscribers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('[sections] hardDeleteEmailSubscriber failed:', error);
    throw error;
  }
};
