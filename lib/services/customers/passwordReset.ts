'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { 
  hashPassword, 
  verifyPassword, 
  getCustomerSession
} from '@/lib/utils/customer-auth';

/**
 * Changes password of currently logged in customer
 */
export async function changeCustomerPassword(data: {
  currentPassword?: string;
  newPassword?: string;
}) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return { success: false, error: 'You must be logged in to change your password.' };
    }

    const currentPassword = data.currentPassword;
    const newPassword = data.newPassword;

    if (!currentPassword || !newPassword) {
      return { success: false, error: 'Current password and new password are required.' };
    }
    if (newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters.' };
    }

    // Fetch customer record
    const { data: customer, error } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', session.id)
      .single();

    if (error || !customer) {
      return { success: false, error: 'Customer account not found.' };
    }

    // Verify current password
    const isValid = verifyPassword(currentPassword, customer.password_hash);
    if (!isValid) {
      return { success: false, error: 'The current password you entered is incorrect.' };
    }

    // Hash and update new password
    const passwordHash = hashPassword(newPassword);
    const { error: updateError } = await supabaseAdmin
      .from('customers')
      .update({
        password_hash: passwordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.id);

    if (updateError) {
      throw updateError;
    }

    return { success: true };
  } catch (err) {
    console.error('changeCustomerPassword failed:', err);
    return { success: false, error: 'Failed to change password. Please try again.' };
  }
}

/**
 * Request customer password reset email
 */
export async function requestCustomerPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      return { success: false, error: 'Email address is required.' };
    }

    // 1. Fetch customer by email
    const { data: customer, error } = await supabaseAdmin
      .from('customers')
      .select('id, name, email')
      .eq('email', trimmedEmail)
      .maybeSingle();

    if (error) {
      console.error('[requestCustomerPasswordReset] failed to query customer:', error);
      return { success: false, error: 'Database error occurred.' };
    }

    if (!customer || !customer.email) {
      return { success: true };
    }

    // 2. Generate secure token & expiry
    const crypto = await import('crypto');
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // 3. Save to database
    const { error: updateError } = await supabaseAdmin
      .from('customers')
      .update({
        reset_token: token,
        reset_token_expires_at: expiresAt,
        updated_at: new Date().toISOString()
      })
      .eq('id', customer.id);

    if (updateError) {
      console.error('[requestCustomerPasswordReset] failed to update reset token:', updateError);
      return { success: false, error: 'Failed to generate reset link.' };
    }

    // 4. Send email
    try {
      const { onPasswordResetRequest } = await import('@/lib/email/triggers');
      await onPasswordResetRequest({ name: customer.name, email: customer.email }, token);
    } catch (emailErr) {
      console.error('[requestCustomerPasswordReset] failed to dispatch reset email:', emailErr);
      return { success: false, error: 'Reset link generated, but email delivery failed.' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[requestCustomerPasswordReset] general error:', err);
    return { success: false, error: err.message || 'An unexpected error occurred.' };
  }
}

/**
 * Reset customer password using verified token
 */
export async function resetCustomerPasswordWithToken(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!token) {
      return { success: false, error: 'Reset token is missing or invalid.' };
    }
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    // 1. Fetch customer by reset token
    const { data: customer, error } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('reset_token', token)
      .maybeSingle();

    if (error || !customer) {
      return { success: false, error: 'Invalid or expired password reset link.' };
    }

    // 2. Verify token expiry
    if (!customer.reset_token_expires_at || new Date(customer.reset_token_expires_at) < new Date()) {
      return { success: false, error: 'Password reset link has expired. Please request a new one.' };
    }

    // 3. Hash and update new password
    const passwordHash = hashPassword(newPassword);
    const { error: updateError } = await supabaseAdmin
      .from('customers')
      .update({
        password_hash: passwordHash,
        reset_token: null,
        reset_token_expires_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', customer.id);

    if (updateError) {
      console.error('[resetCustomerPasswordWithToken] failed to update password:', updateError);
      return { success: false, error: 'Failed to update password.' };
    }

    // 4. Send confirmation email
    if (customer.email) {
      try {
        const { onPasswordChanged } = await import('@/lib/email/triggers');
        await onPasswordChanged({ name: customer.name, email: customer.email });
      } catch (emailErr) {
        console.error('[resetCustomerPasswordWithToken] failed to dispatch success email:', emailErr);
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('[resetCustomerPasswordWithToken] general error:', err);
    return { success: false, error: err.message || 'An unexpected error occurred.' };
  }
}
