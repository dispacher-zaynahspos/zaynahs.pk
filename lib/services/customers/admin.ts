'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Get all customers for the admin portal dashboard
 */
export async function getAdminCustomers() {
  try {
    const supabase = await createClient();
    
    // Select all customers, along with their orders
    const { data, error } = await supabase
      .from('customers')
      .select('*, orders(id, total, status)')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((c: any) => {
      const orders = c.orders || [];
      const totalSpent = orders
        .filter((o: any) => o.status !== 'cancelled')
        .reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);

      return {
        id: c.id,
        name: c.name,
        email: c.email || null,
        phone: c.phone || null,
        createdAt: c.created_at,
        ordersCount: orders.length,
        totalSpent
      };
    });
  } catch (err) {
    console.error('getAdminCustomers failed:', err);
    return [];
  }
}

export async function getDeletedCustomers() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('customers')
      .select('*, orders(id, total, status)')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((c: any) => {
      const orders = c.orders || [];
      const totalSpent = orders
        .filter((o: any) => o.status !== 'cancelled')
        .reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);

      return {
        id: c.id,
        name: c.name,
        email: c.email || null,
        phone: c.phone || null,
        createdAt: c.created_at,
        deletedAt: c.deleted_at,
        ordersCount: orders.length,
        totalSpent
      };
    });
  } catch (err) {
    console.error('getDeletedCustomers failed:', err);
    return [];
  }
}

export async function deleteCustomer(id: string): Promise<void> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('customers')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('deleteCustomer failed:', error);
    throw error;
  }
}

export async function restoreCustomer(id: string): Promise<void> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('customers')
      .update({ deleted_at: null })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('restoreCustomer failed:', error);
    throw error;
  }
}

export async function hardDeleteCustomer(id: string): Promise<void> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('hardDeleteCustomer failed:', error);
    throw error;
  }
}
