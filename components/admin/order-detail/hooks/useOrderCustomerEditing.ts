'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Order } from '@/lib/types';
import { updateOrderDetailsSafe } from '@/lib/services/orders';
import { toast } from 'sonner';

export function useOrderCustomerEditing(
  order: Order,
  setOrder: React.Dispatch<React.SetStateAction<Order>>,
  setIsUpdating: (updating: boolean) => void
) {
  const router = useRouter();
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editCustomerName, setEditCustomerName] = useState(order.customerName || '');
  const [editCustomerPhone, setEditCustomerPhone] = useState(order.customerPhone || '');

  const [editAddress, setEditAddress] = useState('');
  const [editApt, setEditApt] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editPostal, setEditPostal] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editPayment, setEditPayment] = useState('');
  const [editOtherNotes, setEditOtherNotes] = useState('');

  useEffect(() => {
    if (isEditingCustomer || isEditingNotes) {
      const lines = (order.notes || '').split('\n');

      let parsedAddress = '';
      let parsedApt = '';
      let parsedCity = '';
      let parsedPostal = '';
      let parsedPayment = '';
      let parsedContact = '';
      const unstructuredLines: string[] = [];

      lines.forEach((line) => {
        if (!line.trim()) return;
        const lowerLine = line.toLowerCase();
        if (lowerLine.startsWith('address:')) parsedAddress = line.substring('address:'.length).trim();
        else if (lowerLine.startsWith('apt/suite:')) parsedApt = line.substring('apt/suite:'.length).trim();
        else if (lowerLine.startsWith('city:')) parsedCity = line.substring('city:'.length).trim();
        else if (lowerLine.startsWith('postal:')) parsedPostal = line.substring('postal:'.length).trim();
        else if (lowerLine.startsWith('contact:')) parsedContact = line.substring('contact:'.length).trim();
        else if (lowerLine.startsWith('payment method:')) parsedPayment = line.substring('payment method:'.length).trim();
        else if (lowerLine.startsWith('notes:')) unstructuredLines.push(line.substring('notes:'.length).trim());
        else if (!line.includes(':')) unstructuredLines.push(line);
      });

      setEditAddress(parsedAddress);
      setEditApt(parsedApt);
      setEditCity(parsedCity);
      setEditPostal(parsedPostal);
      setEditContact(parsedContact);
      setEditPayment(parsedPayment);
      setEditOtherNotes(unstructuredLines.join('\n'));
    }
  }, [isEditingCustomer, isEditingNotes, order.notes]);

  const handleSaveNotes = async () => {
    try {
      setIsUpdating(true);

      const lines = (order.notes || '').split('\n');
      const retainedLines: string[] = [];
      lines.forEach((line) => {
        if (!line.trim()) return;
        const lower = line.toLowerCase();
        if (lower.startsWith('notes:')) return;
        if (!line.includes(':')) return;
        retainedLines.push(line);
      });

      const newNotesLines = [...retainedLines];
      if (editOtherNotes.trim()) {
        newNotesLines.push(`Notes: ${editOtherNotes.trim()}`);
      }

      const result = await updateOrderDetailsSafe(order.id, {
        notes: newNotesLines.join('\n'),
      });
      if (!result.success) throw new Error(result.error);
      setOrder(result.data);
      setIsEditingNotes(false);
      toast.success('Notes updated');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update notes');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveCustomer = async () => {
    try {
      setIsUpdating(true);

      const lines = (order.notes || '').split('\n');

      const retainedLines: string[] = [];
      lines.forEach((line) => {
        if (!line.trim()) return;
        const lower = line.toLowerCase();
        if (lower.startsWith('notes:')) retainedLines.push(line);
        else if (lower.startsWith('coordinates:')) retainedLines.push(line);
        else if (!line.includes(':')) retainedLines.push(line);
        else if (lower.startsWith('volume discount:')) retainedLines.push(line);
        else if (lower.startsWith('coupon discount:')) retainedLines.push(line);
        else if (lower.startsWith('shipping:')) retainedLines.push(line);
        else if (lower.startsWith('order no:')) retainedLines.push(line);
        else if (lower.startsWith('grand total:')) retainedLines.push(line);
      });

      const newNotesLines = [];

      if (editAddress.trim()) newNotesLines.push(`Address: ${editAddress.trim()}`);
      if (editApt.trim()) newNotesLines.push(`Apt/Suite: ${editApt.trim()}`);
      if (editCity.trim()) newNotesLines.push(`City: ${editCity.trim()}`);
      if (editPostal.trim()) newNotesLines.push(`Postal: ${editPostal.trim()}`);
      if (editCustomerPhone.trim()) newNotesLines.push(`Phone: ${editCustomerPhone.trim()}`);
      if (editContact.trim()) newNotesLines.push(`Contact: ${editContact.trim()}`);

      retainedLines.forEach((l) => newNotesLines.push(l));

      if (editPayment.trim()) newNotesLines.push(`Payment Method: ${editPayment.trim()}`);

      const result = await updateOrderDetailsSafe(order.id, {
        customerName: editCustomerName,
        customerPhone: editCustomerPhone,
        notes: newNotesLines.join('\n'),
      });
      if (!result.success) throw new Error(result.error);
      setOrder(result.data);
      setIsEditingCustomer(false);
      toast.success('Customer details updated');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update customer details');
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    isEditingCustomer,
    setIsEditingCustomer,
    isEditingNotes,
    setIsEditingNotes,
    editCustomerName,
    setEditCustomerName,
    editCustomerPhone,
    setEditCustomerPhone,
    editAddress,
    setEditAddress,
    editApt,
    setEditApt,
    editCity,
    setEditCity,
    editPostal,
    setEditPostal,
    editContact,
    setEditContact,
    editPayment,
    setEditPayment,
    editOtherNotes,
    setEditOtherNotes,
    handleSaveNotes,
    handleSaveCustomer,
  };
}
