'use client';

import { useState, useEffect } from 'react';
import { useAbandonedCartTracker } from '@/lib/hooks/useAbandonedCartTracker';

export function useCheckoutFormState(
  currency: string,
  view: 'cart' | 'checkout' | 'success',
  initialCustomer?: { id: string; name: string; email: string | null; phone: string | null } | null
) {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');

  const { updateContact, markOrdered } = useAbandonedCartTracker(currency || 'PKR');
  const [saveInfo, setSaveInfo] = useState(true);
  const [notes, setNotes] = useState('');
  const [placedOrder, setPlacedOrder] = useState<any>(null);
  const [coordinates, setCoordinates] = useState('');

  useEffect(() => {
    // 1. First pre-fill from customer account session if available
    if (initialCustomer) {
      const parts = (initialCustomer.name || '').trim().split(/\s+/);
      const fName = parts[0] || '';
      const lName = parts.slice(1).join(' ') || '';
      if (fName) setFirstName(fName);
      if (lName) setLastName(lName);
      if (initialCustomer.email) setEmailOrPhone(initialCustomer.email);
      else if (initialCustomer.phone) setEmailOrPhone(initialCustomer.phone);
      if (initialCustomer.phone) setPhone(initialCustomer.phone);
    }

    // 2. Check localStorage for previously saved checkout details
    const saved = localStorage.getItem('checkout_info');
    if (saved) {
      try {
        const info = JSON.parse(saved);
        if (info.emailOrPhone) setEmailOrPhone(info.emailOrPhone);
        if (info.firstName) setFirstName(info.firstName);
        if (info.lastName) setLastName(info.lastName);
        if (info.address) setAddress(info.address);
        if (info.apartment) setApartment(info.apartment);
        if (info.city) setCity(info.city);
        if (info.postalCode) setPostalCode(info.postalCode);
        if (info.phone) setPhone(info.phone);
      } catch {}
    }
  }, [initialCustomer]);

  useEffect(() => {
    if (view === 'checkout' && typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates(`${position.coords.latitude},${position.coords.longitude}`);
        },
        (error) => {
          console.log('Error getting coordinates:', error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, [view]);

  useEffect(() => {
    if (view === 'checkout') {
      const email = emailOrPhone.includes('@') ? emailOrPhone.trim() : undefined;
      const phoneVal =
        phone.trim() || (emailOrPhone.trim() && !emailOrPhone.includes('@') ? emailOrPhone.trim() : undefined);
      const name = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ');

      updateContact({
        name: name || undefined,
        email,
        phone: phoneVal,
        address: address.trim() || undefined,
        apartment: apartment.trim() || undefined,
        city: city.trim() || undefined,
        postalCode: postalCode.trim() || undefined,
      });
    }
  }, [view, emailOrPhone, firstName, lastName, phone, address, apartment, city, postalCode, updateContact]);

  useEffect(() => {
    if (view === 'success') {
      const saved = localStorage.getItem('last_placed_order');
      if (saved) {
        try {
          setPlacedOrder(JSON.parse(saved));
        } catch {}
      }
    }
  }, [view]);

  return {
    emailOrPhone, setEmailOrPhone,
    firstName, setFirstName,
    lastName, setLastName,
    address, setAddress,
    apartment, setApartment,
    city, setCity,
    postalCode, setPostalCode,
    phone, setPhone,
    saveInfo, setSaveInfo,
    notes, setNotes,
    placedOrder, setPlacedOrder,
    coordinates,
    markOrdered
  };
}
