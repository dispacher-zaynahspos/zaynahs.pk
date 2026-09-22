'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useOrderCreateCustomer() {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerCity, setCustomerCity] = useState('');

  // Customer search states
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerResults, setCustomerResults] = useState<any[]>([]);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);

  // Search customer by phone or name
  const searchCustomer = async (query: string) => {
    if (!query.trim()) {
      setCustomerResults([]);
      return;
    }
    setIsSearchingCustomer(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('customers')
        .select('id, name, phone, email')
        .or(`phone.ilike.%${query}%,name.ilike.%${query}%`)
        .is('deleted_at', null)
        .limit(5);
      setCustomerResults(data || []);
      setIsCustomerDropdownOpen(data != null && data.length > 0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingCustomer(false);
    }
  };

  const handleCustomerSelect = async (c: any) => {
    setCustomerName(c.name || '');
    setCustomerPhone(c.phone || '');
    try {
      const supabase = createClient();
      let query = supabase
        .from('orders')
        .select('notes')
        .not('notes', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1);
      if (c.id) {
        query = query.eq('customer_id', c.id);
      } else if (c.phone) {
        query = query.eq('customer_phone', c.phone);
      } else {
        setCustomerSearchQuery('');
        setCustomerResults([]);
        setIsCustomerDropdownOpen(false);
        return;
      }
      const { data: lastOrder } = await query.maybeSingle();
      if (lastOrder?.notes) {
        const addr = lastOrder.notes.match(/Address:\s*(.+)/i);
        const city = lastOrder.notes.match(/City:\s*(.+)/i);
        if (addr) setCustomerAddress(addr[1].trim());
        if (city) setCustomerCity(city[1].trim());
      }
    } catch (err) {
      console.error(err);
    }
    setCustomerSearchQuery('');
    setCustomerResults([]);
    setIsCustomerDropdownOpen(false);
  };

  return {
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    customerAddress,
    setCustomerAddress,
    customerCity,
    setCustomerCity,
    customerSearchQuery,
    setCustomerSearchQuery,
    customerResults,
    isCustomerDropdownOpen,
    setIsCustomerDropdownOpen,
    isSearchingCustomer,
    searchCustomer,
    handleCustomerSelect,
  };
}
