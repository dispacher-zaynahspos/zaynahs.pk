'use client';

import React, { useRef } from 'react';
import { ShippingMethod, PaymentMethod } from '@/lib/types';
import {
  ShippingMethodsCard,
  PaymentMethodsCard,
  ShippingThresholdsCard,
} from './shipping';

interface ShippingTabProps {
  shippingMethods: ShippingMethod[];
  paymentMethods: PaymentMethod[];
  loadingLists: boolean;
  
  // Shipping States & Setters
  newShipName: string;
  setNewShipName: (v: string) => void;
  newShipCost: string;
  setNewShipCost: (v: string) => void;
  newShipDays: string;
  setNewShipDays: (v: string) => void;
  
  editingShipId: string | null;
  setEditingShipId: (v: string | null) => void;
  editShipName: string;
  setEditShipName: (v: string) => void;
  editShipCost: string;
  setEditShipCost: (v: string) => void;
  editShipDays: string;
  setEditShipDays: (v: string) => void;

  // Payment States & Setters
  newPayName: string;
  setNewPayName: (v: string) => void;
  newPayCode: string;
  setNewPayCode: (v: string) => void;
  newPayInstructions: string;
  setNewPayInstructions: (v: string) => void;
  
  editingPayId: string | null;
  setEditingPayId: (v: string | null) => void;
  editPayName: string;
  setEditPayName: (v: string) => void;
  editPayCode: string;
  setEditPayCode: (v: string) => void;
  editPayInstructions: string;
  setEditPayInstructions: (v: string) => void;

  // Shipping Handlers
  handleAddShipping: (e: React.FormEvent) => void;
  handleToggleShippingActive: (id: string, currentActive: boolean) => void;
  startEditShipping: (method: ShippingMethod) => void;
  handleSaveShippingEdit: (id: string) => void;
  handleDeleteShipping: (id: string) => void;

  // Payment Handlers
  handleAddPayment: (e: React.FormEvent) => void;
  handleTogglePaymentActive: (id: string, currentActive: boolean) => void;
  startEditPayment: (method: PaymentMethod) => void;
  handleSavePaymentEdit: (id: string) => void;
  handleDeletePayment: (id: string) => void;

  // Reorder Handlers
  onReorderShipping: (orderedIds: string[]) => void;
  onReorderPayment: (orderedIds: string[]) => void;

  // Urgency & Shipping Thresholds
  cartTimerMinutes: number;
  setCartTimerMinutes: (v: number) => void;
  cartTimerMessage: string;
  setCartTimerMessage: (v: string) => void;
  freeShippingThreshold: number;
  setFreeShippingThreshold: (v: number) => void;
  recentlyViewedLimit: number;
  setRecentlyViewedLimit: (v: number) => void;
  currencySymbol: string;
}

export default function ShippingTab({
  shippingMethods,
  paymentMethods,
  loadingLists,
  newShipName,
  setNewShipName,
  newShipCost,
  setNewShipCost,
  newShipDays,
  setNewShipDays,
  editingShipId,
  setEditingShipId,
  editShipName,
  setEditShipName,
  editShipCost,
  setEditShipCost,
  editShipDays,
  setEditShipDays,
  newPayName,
  setNewPayName,
  newPayCode,
  setNewPayCode,
  newPayInstructions,
  setNewPayInstructions,
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
  startEditShipping,
  handleSaveShippingEdit,
  handleDeleteShipping,
  handleAddPayment,
  handleTogglePaymentActive,
  startEditPayment,
  handleSavePaymentEdit,
  handleDeletePayment,
  onReorderShipping,
  onReorderPayment,
  cartTimerMinutes,
  setCartTimerMinutes,
  cartTimerMessage,
  setCartTimerMessage,
  freeShippingThreshold,
  setFreeShippingThreshold,
  recentlyViewedLimit,
  setRecentlyViewedLimit,
  currencySymbol
}: ShippingTabProps) {
  const dragItem = useRef<string | null>(null);
  const dragOverItem = useRef<string | null>(null);

  const handleDragStart = (id: string) => { dragItem.current = id; };
  const handleDragOver = (id: string) => { dragOverItem.current = id; };
  const handleDrop = (list: 'shipping' | 'payment') => {
    const items = list === 'shipping' ? shippingMethods : paymentMethods;
    const dragIdx = items.findIndex(m => m.id === dragItem.current);
    const dropIdx = items.findIndex(m => m.id === dragOverItem.current);
    if (dragIdx === -1 || dropIdx === -1 || dragIdx === dropIdx) return;
    const reordered = [...items];
    const [removed] = reordered.splice(dragIdx, 1);
    reordered.splice(dropIdx, 0, removed);
    const ids = reordered.map(m => m.id);
    if (list === 'shipping') onReorderShipping(ids);
    else onReorderPayment(ids);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleMove = (list: 'shipping' | 'payment', index: number, direction: 'up' | 'down') => {
    const items = list === 'shipping' ? shippingMethods : paymentMethods;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;
    const reordered = [...items];
    const [removed] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, removed);
    const ids = reordered.map(m => m.id);
    if (list === 'shipping') onReorderShipping(ids);
    else onReorderPayment(ids);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ShippingMethodsCard
          shippingMethods={shippingMethods}
          loadingLists={loadingLists}
          editingShipId={editingShipId}
          setEditingShipId={setEditingShipId}
          editShipName={editShipName}
          setEditShipName={setEditShipName}
          editShipCost={editShipCost}
          setEditShipCost={setEditShipCost}
          editShipDays={editShipDays}
          setEditShipDays={setEditShipDays}
          newShipName={newShipName}
          setNewShipName={setNewShipName}
          newShipCost={newShipCost}
          setNewShipCost={setNewShipCost}
          newShipDays={newShipDays}
          setNewShipDays={setNewShipDays}
          handleAddShipping={handleAddShipping}
          handleToggleShippingActive={handleToggleShippingActive}
          startEditShipping={startEditShipping}
          handleSaveShippingEdit={handleSaveShippingEdit}
          handleDeleteShipping={handleDeleteShipping}
          handleMove={handleMove}
          handleDragStart={handleDragStart}
          handleDragOver={handleDragOver}
          handleDrop={handleDrop}
          dragOverItemId={dragOverItem.current}
        />

        <PaymentMethodsCard
          paymentMethods={paymentMethods}
          loadingLists={loadingLists}
          editingPayId={editingPayId}
          setEditingPayId={setEditingPayId}
          editPayName={editPayName}
          setEditPayName={setEditPayName}
          editPayCode={editPayCode}
          setEditPayCode={setEditPayCode}
          editPayInstructions={editPayInstructions}
          setEditPayInstructions={setEditPayInstructions}
          newPayName={newPayName}
          setNewPayName={setNewPayName}
          newPayCode={newPayCode}
          setNewPayCode={setNewPayCode}
          newPayInstructions={newPayInstructions}
          setNewPayInstructions={setNewPayInstructions}
          handleAddPayment={handleAddPayment}
          handleTogglePaymentActive={handleTogglePaymentActive}
          startEditPayment={startEditPayment}
          handleSavePaymentEdit={handleSavePaymentEdit}
          handleDeletePayment={handleDeletePayment}
          handleMove={handleMove}
          handleDragStart={handleDragStart}
          handleDragOver={handleDragOver}
          handleDrop={handleDrop}
          dragOverItemId={dragOverItem.current}
        />
      </div>

      <ShippingThresholdsCard
        cartTimerMinutes={cartTimerMinutes}
        setCartTimerMinutes={setCartTimerMinutes}
        cartTimerMessage={cartTimerMessage}
        setCartTimerMessage={setCartTimerMessage}
        freeShippingThreshold={freeShippingThreshold}
        setFreeShippingThreshold={setFreeShippingThreshold}
        recentlyViewedLimit={recentlyViewedLimit}
        setRecentlyViewedLimit={setRecentlyViewedLimit}
        currencySymbol={currencySymbol}
      />
    </div>
  );
}
