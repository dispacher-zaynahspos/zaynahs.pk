'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { 
  hashPassword, 
  verifyPassword, 
  setCustomerSessionCookie, 
  clearCustomerSessionCookie,
  getCustomerSession
} from '@/lib/utils/customer-auth';
import { normalizePhone } from './types';

/**
 * Links previous orders to this customer based on phone matching
 */
export async function linkPreviousOrders(customerId: string, phone: string | null) {
  if (!phone) return;
  try {
    const cleanPhone = normalizePhone(phone);
    if (cleanPhone.length < 7) return;

    // Fetch all orders that don't have a customer_id yet
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('id, customer_phone')
      .is('customer_id', null);

    if (error || !orders) return;

    const matchingOrderIds = orders
      .filter(order => {
        if (!order.customer_phone) return false;
        const oPhone = normalizePhone(order.customer_phone);
        return oPhone.endsWith(cleanPhone) || cleanPhone.endsWith(oPhone);
      })
      .map(order => order.id);

    if (matchingOrderIds.length > 0) {
      await supabaseAdmin
        .from('orders')
        .update({ customer_id: customerId })
        .in('id', matchingOrderIds);
    }
  } catch (err) {
    console.error('Failed to link previous orders:', err);
  }
}

/**
 * Customer signup action
 */
export async function customerSignup(data: {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
}) {
  try {
    const email = data.email?.trim() || null;
    const phone = data.phone?.trim() || null;
    const name = data.name.trim();
    const password = data.password;

    if (!email && !phone) {
      return { success: false, error: 'Please enter either an email or a phone number.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    // Hash password
    const passwordHash = hashPassword(password);

    // Check if customer already exists
    let existingCustomer: any = null;

    if (email) {
      const { data } = await supabaseAdmin
        .from('customers')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      if (data) existingCustomer = data;
    }

    if (!existingCustomer && phone) {
      const { data } = await supabaseAdmin
        .from('customers')
        .select('*')
        .eq('phone', phone)
        .maybeSingle();
      if (data) existingCustomer = data;
    }

    if (existingCustomer) {
      // If customer has a password_hash already, they are already registered
      if (existingCustomer.password_hash) {
        return { 
          success: false, 
          error: `An account with this ${existingCustomer.email === email ? 'email' : 'phone number'} already exists. Please log in instead.` 
        };
      }

      // If they don't have a password_hash, they were created as a guest during checkout.
      // We can update the record with their name and password to claim the account!
      const { data: customer, error } = await supabaseAdmin
        .from('customers')
        .update({
          name,
          email: email || existingCustomer.email,
          phone: phone || existingCustomer.phone,
          password_hash: passwordHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingCustomer.id)
        .select('*')
        .single();

      if (error || !customer) {
        throw error || new Error('Signup failed to update guest account');
      }

      // Auto-link old orders
      await linkPreviousOrders(customer.id, phone);

      // Set cookie session
      await setCustomerSessionCookie({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone
      });

      if (customer.email) {
        try {
          const { onUserRegister } = await import('@/lib/email/triggers');
          await onUserRegister({ name: customer.name, email: customer.email });
        } catch (err) {
          console.error('[Email Trigger] failed in customerSignup update:', err);
        }
      }

      return { success: true, customer };
    }

    // No existing customer, create a new one
    const { data: customer, error } = await supabaseAdmin
      .from('customers')
      .insert({
        name,
        email,
        phone,
        password_hash: passwordHash
      })
      .select('*')
      .single();

    if (error || !customer) {
      throw error || new Error('Signup failed');
    }

    // Auto-link old orders
    await linkPreviousOrders(customer.id, phone);

    // Set cookie session
    await setCustomerSessionCookie({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone
    });

    if (customer.email) {
      try {
        const { onUserRegister } = await import('@/lib/email/triggers');
        await onUserRegister({ name: customer.name, email: customer.email });
      } catch (err) {
        console.error('[Email Trigger] failed in customerSignup insert:', err);
      }
    }

    return { success: true, customer };
  } catch (err) {
    console.error('customerSignup failed:', err);
    return { success: false, error: 'Failed to create account. Please try again.' };
  }
}

/**
 * Customer login action
 */
export async function customerLogin(data: {
  emailOrPhone: string;
  password?: string;
}) {
  try {
    const credential = data.emailOrPhone.trim();
    const password = data.password;

    if (!credential || !password) {
      return { success: false, error: 'Credentials are required.' };
    }

    // Query customer by email or phone
    const { data: customer, error } = await supabaseAdmin
      .from('customers')
      .select('*')
      .or(`email.eq.${credential},phone.eq.${credential}`)
      .maybeSingle();

    if (error || !customer) {
      return { success: false, error: 'Invalid email, phone number, or password.' };
    }

    // Verify password hash
    const isValid = verifyPassword(password, customer.password_hash);
    if (!isValid) {
      return { success: false, error: 'Invalid email, phone number, or password.' };
    }

    // Auto-link old orders in case any new ones appeared or weren't linked
    await linkPreviousOrders(customer.id, customer.phone);

    // Set cookie session
    await setCustomerSessionCookie({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone
    });

    return { success: true, customer };
  } catch (err) {
    console.error('customerLogin failed:', err);
    return { success: false, error: 'An error occurred during login.' };
  }
}

/**
 * Customer logout action
 */
export async function customerLogout() {
  await clearCustomerSessionCookie();
  return { success: true };
}

/**
 * Fetch customer profile
 */
export async function getCustomerProfile() {
  const session = await getCustomerSession();
  if (!session) return null;
  return session;
}

