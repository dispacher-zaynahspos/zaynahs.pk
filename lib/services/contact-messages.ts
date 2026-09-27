'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: 'new' | 'read' | 'archived';
  created_at: string;
}

/** Admin: list all non-deleted contact messages, newest first. */
export async function getContactMessages(): Promise<ContactMessage[]> {
  const { data, error } = await supabaseAdmin
    .from('contact_messages')
    .select('id, name, email, subject, message, status, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  if (error) {
    // Table may not exist yet (migration not applied) — treat as empty, don't crash admin.
    console.warn('[contact-messages] list failed:', error.message);
    return [];
  }
  return (data ?? []) as ContactMessage[];
}

/** Admin: mark a message's status. */
export async function setContactMessageStatus(id: string, status: 'new' | 'read' | 'archived'): Promise<void> {
  const { error } = await supabaseAdmin
    .from('contact_messages')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
}

/** Admin: soft-delete a message. */
export async function deleteContactMessage(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('contact_messages')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}
