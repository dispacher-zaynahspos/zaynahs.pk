'use client';

import { useState } from 'react';
import { ShippingMethod, PaymentMethod } from '@/lib/types';
import { useConfirm } from '@/components/admin/shared/AdminConfirmProvider';
import {
  createShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
  reorderShippingMethods,
} from '@/lib/services/shipping';
import {
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  reorderPaymentMethods,
} from '@/lib/services/paymentMethods';
import { toast } from 'sonner';

export function useSettingsShippingPayment() {
  const { confirm } = useConfirm();

  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // New shipping form
  const [newShipName, setNewShipName] = useState('');
  const [newShipCost, setNewShipCost] = useState('');
  const [newShipDays, setNewShipDays] = useState('');

  // New payment form
  const [newPayName, setNewPayName] = useState('');
  const [newPayCode, setNewPayCode] = useState('cod');
  const [newPayInstructions, setNewPayInstructions] = useState('');

  // Inline editing row states
  const [editingShipId, setEditingShipId] = useState<string | null>(null);
  const [editShipName, setEditShipName] = useState('');
  const [editShipCost, setEditShipCost] = useState('');
  const [editShipDays, setEditShipDays] = useState('');

  const [editingPayId, setEditingPayId] = useState<string | null>(null);
  const [editPayName, setEditPayName] = useState('');
  const [editPayCode, setEditPayCode] = useState('');
  const [editPayInstructions, setEditPayInstructions] = useState('');

  const handleAddShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShipName.trim()) return toast.error('Shipping Name is required');
    const costVal = parseFloat(newShipCost) || 0;

    try {
      const newMethod = await createShippingMethod({
        name: newShipName.trim(),
        cost: costVal,
        estimatedDays: newShipDays.trim() || undefined,
        active: true,
      });
      setShippingMethods((prev) => [...prev, newMethod]);
      setNewShipName('');
      setNewShipCost('');
      setNewShipDays('');
      toast.success('Shipping method added successfully!');
    } catch {
      toast.error('Failed to add shipping method');
    }
  };

  const handleToggleShippingActive = async (id: string, currentActive: boolean) => {
    try {
      const updated = await updateShippingMethod(id, { active: !currentActive });
      setShippingMethods((prev) => prev.map((item) => (item.id === id ? updated : item)));
      toast.success(`Shipping method ${!currentActive ? 'enabled' : 'disabled'}`);
    } catch {
      toast.error('Failed to update shipping method status');
    }
  };

  const handleDeleteShipping = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Shipping Method',
      message: 'Are you sure you want to delete this shipping method?',
      variant: 'danger',
      confirmText: 'Delete',
    });
    if (!confirmed) return;
    try {
      await deleteShippingMethod(id);
      setShippingMethods((prev) => prev.filter((item) => item.id !== id));
      toast.success('Shipping method deleted');
    } catch {
      toast.error('Failed to delete shipping method');
    }
  };

  const startEditShipping = (method: ShippingMethod) => {
    setEditingShipId(method.id);
    setEditShipName(method.name);
    setEditShipCost(method.cost.toString());
    setEditShipDays(method.estimatedDays || '');
  };

  const handleSaveShippingEdit = async (id: string) => {
    if (!editShipName.trim()) return toast.error('Shipping Name is required');
    const costVal = parseFloat(editShipCost) || 0;
    try {
      const updated = await updateShippingMethod(id, {
        name: editShipName.trim(),
        cost: costVal,
        estimatedDays: editShipDays.trim() || undefined,
      });
      setShippingMethods((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setEditingShipId(null);
      toast.success('Shipping method updated successfully!');
    } catch {
      toast.error('Failed to update shipping method');
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayName.trim()) return toast.error('Payment Method Name is required');
    if (!newPayCode.trim()) return toast.error('Badge Code is required');

    try {
      const newMethod = await createPaymentMethod({
        name: newPayName.trim(),
        code: newPayCode.trim(),
        instructions: newPayInstructions.trim() || undefined,
        active: true,
      });
      setPaymentMethods((prev) => [...prev, newMethod]);
      setNewPayName('');
      setNewPayCode('cod');
      setNewPayInstructions('');
      toast.success('Payment method added successfully!');
    } catch {
      toast.error('Failed to add payment method');
    }
  };

  const handleTogglePaymentActive = async (id: string, currentActive: boolean) => {
    try {
      const updated = await updatePaymentMethod(id, { active: !currentActive });
      setPaymentMethods((prev) => prev.map((item) => (item.id === id ? updated : item)));
      toast.success(`Payment method ${!currentActive ? 'enabled' : 'disabled'}`);
    } catch {
      toast.error('Failed to update payment method status');
    }
  };

  const handleDeletePayment = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Payment Method',
      message: 'Are you sure you want to delete this payment method?',
      variant: 'danger',
      confirmText: 'Delete',
    });
    if (!confirmed) return;
    try {
      await deletePaymentMethod(id);
      setPaymentMethods((prev) => prev.filter((item) => item.id !== id));
      toast.success('Payment method deleted');
    } catch {
      toast.error('Failed to delete payment method');
    }
  };

  const startEditPayment = (method: PaymentMethod) => {
    setEditingPayId(method.id);
    setEditPayName(method.name);
    setEditPayCode(method.code);
    setEditPayInstructions(method.instructions || '');
  };

  const handleSavePaymentEdit = async (id: string) => {
    if (!editPayName.trim()) return toast.error('Payment Name is required');
    if (!editPayCode.trim()) return toast.error('Badge Code is required');
    try {
      const updated = await updatePaymentMethod(id, {
        name: editPayName.trim(),
        code: editPayCode.trim(),
        instructions: (editPayInstructions.trim() || null) as any,
      });
      setPaymentMethods((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setEditingPayId(null);
      toast.success('Payment method updated successfully!');
    } catch {
      toast.error('Failed to update payment method');
    }
  };

  const handleReorderShipping = async (orderedIds: string[]) => {
    try {
      setShippingMethods((prev) => {
        const map = new Map(prev.map((m) => [m.id, m]));
        return orderedIds.map((id, i) => ({ ...map.get(id)!, sortOrder: i }));
      });
      await reorderShippingMethods(orderedIds);
      toast.success('Shipping methods reordered');
    } catch {
      toast.error('Failed to reorder shipping methods');
    }
  };

  const handleReorderPayment = async (orderedIds: string[]) => {
    try {
      setPaymentMethods((prev) => {
        const map = new Map(prev.map((m) => [m.id, m]));
        return orderedIds.map((id, i) => ({ ...map.get(id)!, sortOrder: i }));
      });
      await reorderPaymentMethods(orderedIds);
      toast.success('Payment methods reordered');
    } catch {
      toast.error('Failed to reorder payment methods');
    }
  };

  return {
    shippingMethods,
    setShippingMethods,
    paymentMethods,
    setPaymentMethods,
    newShipName,
    setNewShipName,
    newShipCost,
    setNewShipCost,
    newShipDays,
    setNewShipDays,
    newPayName,
    setNewPayName,
    newPayCode,
    setNewPayCode,
    newPayInstructions,
    setNewPayInstructions,
    editingShipId,
    setEditingShipId,
    editShipName,
    setEditShipName,
    editShipCost,
    setEditShipCost,
    editShipDays,
    setEditShipDays,
    editingPayId,
    setEditingPayId,
    editPayName,
    setEditPayName,
    editPayCode,
    setEditPayCode,
    editPayInstructions,
    setEditPayInstructions,
    handleAddShipping,
    handleToggleShippingActive,
    handleDeleteShipping,
    startEditShipping,
    handleSaveShippingEdit,
    handleAddPayment,
    handleTogglePaymentActive,
    handleDeletePayment,
    startEditPayment,
    handleSavePaymentEdit,
    handleReorderShipping,
    handleReorderPayment,
  };
}
