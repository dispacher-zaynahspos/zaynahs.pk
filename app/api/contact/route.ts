import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: 'Name, email, and message are required.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email address.' }, { status: 400 });
    }

    // Persist the message first so it is never lost (fixes F0-1: form previously
    // fired an email and stored nothing). Best-effort: if the contact_messages
    // migration hasn't been applied yet, log and continue with the notification.
    try {
      const { error: insertError } = await supabaseAdmin
        .from('contact_messages')
        .insert({ name, email, subject: subject || null, message });
      if (insertError) {
        console.warn('[API Contact] Could not persist contact message:', insertError.message);
      }
    } catch (persistErr) {
      console.warn('[API Contact] contact_messages persist skipped:', persistErr);
    }

    // Admin notification (transactional notice, not a customer email-ordering flow).
    const { onContactForm } = await import('@/lib/email/triggers');
    await onContactForm({ name, email, subject: subject || 'Contact Form Message', message });

    return NextResponse.json({ success: true, message: 'Your message has been sent. We will get back to you shortly.' });
  } catch (error: any) {
    console.error('[API Contact] Failed:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to send message.' }, { status: 500 });
  }
}
