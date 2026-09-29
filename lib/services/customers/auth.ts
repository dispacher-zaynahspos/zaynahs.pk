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
import { normalizePkPhone, isValidPkMobile } from '@/lib/phone';

/**
 * Links previous orders to this customer based on phone and/or email matching
 */
export async function linkPreviousOrders(
  customerId: string,
  phone: string | null,
  email?: string | null
) {
  if (!phone && !email) return;
  try {
    const cleanPhone = phone ? normalizePhone(phone) : null;
    const canonicalPhone = phone && isValidPkMobile(phone) ? normalizePkPhone(phone) : null;
    const cleanEmail = email?.trim().toLowerCase() || null;

    // Fetch all unassigned orders
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('id, customer_phone, customer_email')
      .is('customer_id', null);

    if (error || !orders || orders.length === 0) return;

    const matchingOrderIds = orders
      .filter((order) => {
        // Match by email
        if (cleanEmail && order.customer_email && order.customer_email.trim().toLowerCase() === cleanEmail) {
          return true;
        }
        // Match by phone
        if (order.customer_phone) {
          const oPhone = normalizePhone(order.customer_phone);
          if (cleanPhone && cleanPhone.length >= 7 && (oPhone.endsWith(cleanPhone) || cleanPhone.endsWith(oPhone))) {
            return true;
          }
          if (canonicalPhone && isValidPkMobile(order.customer_phone)) {
            if (normalizePkPhone(order.customer_phone) === canonicalPhone) return true;
          }
        }
        return false;
      })
      .map((order) => order.id);

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
 * Customer signup action with intelligent guest-account merging
 */
export async function customerSignup(data: {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
}) {
  try {
    const email = data.email?.trim().toLowerCase() || null;
    const rawPhone = data.phone?.trim() || null;
    const phone = rawPhone ? (isValidPkMobile(rawPhone) ? normalizePkPhone(rawPhone) : rawPhone.replace(/\D/g, '')) : null;
    const name = data.name.trim();
    const password = data.password;

    if (!name) {
      return { success: false, error: 'Full name is required.' };
    }
    if (!email && !phone) {
      return { success: false, error: 'Please enter either an email or a phone number.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    // Hash password
    const passwordHash = hashPassword(password);

    // 1. Look up any existing record by email
    let existingByEmail: any = null;
    if (email) {
      const { data } = await supabaseAdmin
        .from('customers')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      existingByEmail = data;
    }

    // 2. Look up any existing record by phone
    let existingByPhone: any = null;
    if (phone) {
      const { data } = await supabaseAdmin
        .from('customers')
        .select('*')
        .eq('phone', phone)
        .maybeSingle();
      existingByPhone = data;
      if (!existingByPhone) {
        const rawDigits = phone.replace(/\D/g, '');
        if (rawDigits && rawDigits !== phone) {
          const { data: legacy } = await supabaseAdmin
            .from('customers')
            .select('*')
            .eq('phone', rawDigits)
            .maybeSingle();
          existingByPhone = legacy;
        }
      }
    }

    let customer: any = null;

    // SCENARIO 1: Both email and phone match existing row(s)
    if (existingByEmail && existingByPhone) {
      if (existingByEmail.id === existingByPhone.id) {
        // Exact same row exists
        if (existingByEmail.password_hash) {
          return {
            success: false,
            error: 'An account with this email/phone already exists. Please log in instead.'
          };
        }
        // Unregistered guest record -> claim it
        const { data: updated, error } = await supabaseAdmin
          .from('customers')
          .update({
            name,
            email,
            phone,
            password_hash: passwordHash,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingByEmail.id)
          .select('*')
          .single();

        if (error || !updated) throw error || new Error('Failed to update guest account');
        customer = updated;
      } else {
        // TWO DIFFERENT ROWS exist (e.g. checked out once with email, once with phone)
        if (existingByEmail.password_hash) {
          return { success: false, error: 'An account with this email already exists. Please log in instead.' };
        }
        if (existingByPhone.password_hash) {
          return { success: false, error: 'An account with this phone number already exists. Please log in instead.' };
        }

        // Both are unactivated guest rows! Consolidate/merge them into existingByEmail
        // 1. Reassign all orders from existingByPhone to existingByEmail
        await supabaseAdmin
          .from('orders')
          .update({ customer_id: existingByEmail.id })
          .eq('customer_id', existingByPhone.id);

        // 2. Delete redundant guest row
        await supabaseAdmin
          .from('customers')
          .delete()
          .eq('id', existingByPhone.id);

        // 3. Update existingByEmail with user credentials and phone
        const { data: merged, error } = await supabaseAdmin
          .from('customers')
          .update({
            name,
            email,
            phone,
            password_hash: passwordHash,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingByEmail.id)
          .select('*')
          .single();

        if (error || !merged) throw error || new Error('Failed to merge guest accounts');
        customer = merged;
      }
    } else if (existingByEmail) {
      // SCENARIO 2: Only email row exists
      if (existingByEmail.password_hash) {
        return { success: false, error: 'An account with this email already exists. Please log in instead.' };
      }
      const { data: updated, error } = await supabaseAdmin
        .from('customers')
        .update({
          name,
          email,
          phone: phone || existingByEmail.phone,
          password_hash: passwordHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingByEmail.id)
        .select('*')
        .single();

      if (error || !updated) throw error || new Error('Failed to update guest account');
      customer = updated;
    } else if (existingByPhone) {
      // SCENARIO 3: Only phone row exists
      if (existingByPhone.password_hash) {
        return { success: false, error: 'An account with this phone number already exists. Please log in instead.' };
      }
      const { data: updated, error } = await supabaseAdmin
        .from('customers')
        .update({
          name,
          email: email || existingByPhone.email,
          phone,
          password_hash: passwordHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingByPhone.id)
        .select('*')
        .single();

      if (error || !updated) throw error || new Error('Failed to update guest account');
      customer = updated;
    } else {
      // SCENARIO 4: No existing record found -> Insert new customer
      const { data: newCustomer, error } = await supabaseAdmin
        .from('customers')
        .insert({
          name,
          email,
          phone,
          password_hash: passwordHash
        })
        .select('*')
        .single();

      if (error || !newCustomer) throw error || new Error('Signup failed to create record');
      customer = newCustomer;
    }

    // Auto-link previous orders matching this customer's phone or email
    await linkPreviousOrders(customer.id, phone, email);

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
        console.error('[Email Trigger] failed in customerSignup:', err);
      }
    }

    return { success: true, customer };
  } catch (err: any) {
    console.error('customerSignup failed:', err);
    const msg = err?.message || '';
    if (msg.includes('duplicate key') || msg.includes('customers_phone_key')) {
      return { success: false, error: 'This phone number is already registered. Please log in instead.' };
    }
    if (msg.includes('customers_email_key')) {
      return { success: false, error: 'This email is already registered. Please log in instead.' };
    }
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

    // Look up by email OR phone using parameterized .eq() builders (never raw
    // string interpolation into .or() — that allowed PostgREST filter injection).
    // Phone is normalized to canonical national form to match stored values.
    const isEmail = credential.includes('@');
    let customer: any = null;
    let error: any = null;

    if (isEmail) {
      const res = await supabaseAdmin
        .from('customers')
        .select('*')
        .eq('email', credential.toLowerCase())
        .maybeSingle();
      customer = res.data; error = res.error;
    } else {
      const normPhone = isValidPkMobile(credential) ? normalizePkPhone(credential) : credential.replace(/\D/g, '');
      const res = await supabaseAdmin
        .from('customers')
        .select('*')
        .eq('phone', normPhone)
        .maybeSingle();
      customer = res.data; error = res.error;
      // Fallback: legacy rows may store the phone unnormalized
      if (!customer && !error && normPhone !== credential) {
        const legacy = await supabaseAdmin
          .from('customers')
          .select('*')
          .eq('phone', credential)
          .maybeSingle();
        customer = legacy.data; error = legacy.error;
      }
    }

    if (error || !customer) {
      return { success: false, error: 'Invalid email, phone number, or password.' };
    }

    // Verify password hash
    const isValid = verifyPassword(password, customer.password_hash);
    if (!isValid) {
      return { success: false, error: 'Invalid email, phone number, or password.' };
    }

    // Auto-link old orders in case any new ones appeared or weren't linked
    await linkPreviousOrders(customer.id, customer.phone, customer.email);

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

