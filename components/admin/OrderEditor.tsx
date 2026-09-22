'use client';

import React, { useState, useMemo } from 'react';
import { Product, CartItem, ProductVariant, StoreSettings, Order } from '@/lib/types';
import { Package, Check } from '@/components/common/Icons';
import { updateOrderDetailsSafe } from '@/lib/services/orders';
import { toast } from 'sonner';
import { OrderItemCard, OrderProductSearch, OrderFinancialSummary } from './order-editor';

interface OrderEditorProps {
  order: Order;
  settings: StoreSettings;
  products: Product[];
  onSave: (updatedOrder: Order) => void;
  onCancel: () => void;
}

export default function OrderEditor({ order: initialOrder, settings, products, onSave, onCancel }: OrderEditorProps) {
  const [items, setItems] = useState<(CartItem & { _isNew?: boolean })[]>(initialOrder.items || []);
  const [discountAmount, setDiscountAmount] = useState<number>(initialOrder.discountAmount || 0);
  const [shippingAmount, setShippingAmount] = useState<number>(initialOrder.shippingAmount || 0);
  const [discountCode, setDiscountCode] = useState<string>(initialOrder.discountCode || '');
  
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Financials
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  }, [items]);

  const effectiveDiscountAmount = useMemo(() => {
    return discountType === 'percentage' 
      ? (subtotal * discountPercent / 100)
      : discountAmount;
  }, [discountType, discountPercent, discountAmount, subtotal]);

  const total = useMemo(() => {
    return Math.max(0, subtotal + shippingAmount - effectiveDiscountAmount);
  }, [subtotal, shippingAmount, effectiveDiscountAmount]);

  const updateItemTotal = (item: CartItem & { _isNew?: boolean }) => {
    const baseTotal = item.unitPrice * item.quantity;
    const discountAmt = item.discountType === 'percent' 
      ? (baseTotal * (item.discountValue || 0) / 100) 
      : (item.discountValue || 0);
    item.discountAmount = discountAmt;
    item.total = Math.max(0, baseTotal - discountAmt);
  };

  const handleItemDiscountChange = (idx: number, type: 'fixed' | 'percent', value: number) => {
    const newItems = [...items];
    newItems[idx].discountType = type;
    newItems[idx].discountValue = value;
    updateItemTotal(newItems[idx]);
    setItems(newItems);
  };

  const handleQuantityChange = (idx: number, qty: number) => {
    const newItems = [...items];
    if (qty < 1) {
      newItems.splice(idx, 1);
    } else {
      newItems[idx].quantity = qty;
      updateItemTotal(newItems[idx]);
    }
    setItems(newItems);
  };

  const handleRemoveItem = (idx: number) => {
    const newItems = [...items];
    newItems.splice(idx, 1);
    setItems(newItems);
  };

  const handleAddProduct = (product: Product, variant?: ProductVariant) => {
    const defaultVariant = variant || (product.hasVariants && product.variants?.length > 0 ? product.variants[0] : undefined);
    const unitPrice = defaultVariant?.price || product.price || 0;
    
    const existingIdx = items.findIndex(item => 
      item.product.id === product.id && 
      item.selectedVariant?.id === defaultVariant?.id
    );

    if (existingIdx >= 0) {
      handleQuantityChange(existingIdx, items[existingIdx].quantity + 1);
    } else {
      const newItem: CartItem & { _isNew?: boolean } = {
        id: Math.random().toString(36).substring(7),
        product,
        selectedVariant: defaultVariant,
        selectedModifiers: [],
        quantity: 1,
        unitPrice,
        total: unitPrice,
        _isNew: true
      };
      updateItemTotal(newItem);
      setItems([...items, newItem]);
    }
    setSearchQuery('');
  };

  const handleSelectOption = (idx: number, type: 'color' | 'size' | 'material' | 'customValue', value: string) => {
    const item = items[idx];
    const activeVariants = item.product.variants || [];
    
    const colors = Array.from(new Set(activeVariants.map(v => v.color).filter(Boolean))) as string[];
    const sizes = Array.from(new Set(activeVariants.map(v => v.size).filter(Boolean))) as string[];
    const materials = Array.from(new Set(activeVariants.map(v => v.material).filter(Boolean))) as string[];
    const customValues = Array.from(new Set(activeVariants.map(v => v.customValue).filter(Boolean))) as string[];

    const currentColor = type === 'color' ? value : item.selectedVariant?.color;
    const currentSize = type === 'size' ? value : item.selectedVariant?.size;
    const currentMaterial = type === 'material' ? value : item.selectedVariant?.material;
    const currentCustomValue = type === 'customValue' ? value : item.selectedVariant?.customValue;

    let match = activeVariants.find(v => {
      const colorMatch = !colors.length || v.color === currentColor;
      const sizeMatch = !sizes.length || v.size === currentSize;
      const materialMatch = !materials.length || v.material === currentMaterial;
      const customMatch = !customValues.length || v.customValue === currentCustomValue;
      return colorMatch && sizeMatch && materialMatch && customMatch;
    });

    if (!match) {
      match = activeVariants.find(v => {
        if (type === 'color') return v.color === value;
        if (type === 'size') return v.size === value;
        if (type === 'material') return v.material === value;
        if (type === 'customValue') return v.customValue === value;
        return false;
      });
    }

    if (match) {
      const newItems = [...items];
      newItems[idx].selectedVariant = match;
      newItems[idx].unitPrice = match.price || newItems[idx].product.price || 0;
      updateItemTotal(newItems[idx]);
      setItems(newItems);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const newLogs: any[] = [];
      const now = new Date().toISOString();

      const addedItems = items.filter(i => i._isNew);
      if (addedItems.length > 0) {
        newLogs.push({
          id: Math.random().toString(36).substring(7),
          type: 'status_change',
          message: 'Items added to order',
          notes: addedItems.map(i => `+ ${i.product.name} (x${i.quantity})`).join('\n'),
          createdAt: now
        });
      }

      const removedItems = (initialOrder.items || []).filter(oi => 
        !items.some(i => i.id === oi.id)
      );
      if (removedItems.length > 0) {
        newLogs.push({
          id: Math.random().toString(36).substring(7),
          type: 'status_change',
          message: 'Items removed from order',
          notes: removedItems.map(i => `- ${i.product.name} (x${i.quantity})`).join('\n'),
          createdAt: now
        });
      }

      const modifiedItems = items.filter(i => !i._isNew);
      const qtyChanges: string[] = [];
      modifiedItems.forEach(i => {
        const orig = (initialOrder.items || []).find(oi => oi.id === i.id);
        if (orig && orig.quantity !== i.quantity) {
          qtyChanges.push(`~ ${i.product.name}: qty changed from ${orig.quantity} to ${i.quantity}`);
        }
      });
      if (qtyChanges.length > 0) {
        newLogs.push({
          id: Math.random().toString(36).substring(7),
          type: 'status_change',
          message: 'Item quantities updated',
          notes: qtyChanges.join('\n'),
          createdAt: now
        });
      }

      const updatedLogs = [...(initialOrder.statusLogs || []), ...newLogs];

      const cleanItems = items.map(i => {
        const { _isNew, ...rest } = i;
        if (_isNew) {
          return { ...rest, addedLater: true };
        }
        return rest;
      });

      const result = await updateOrderDetailsSafe(initialOrder.id, {
        items: cleanItems,
        subtotal,
        total,
        discountAmount: effectiveDiscountAmount,
        shippingAmount,
        discountCode,
        statusLogs: updatedLogs
      });
      if (!result.success) throw new Error(result.error);
      const updated = result.data;
      toast.success('Order updated successfully');
      onSave(updated);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update order');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-[#16162a] z-10">
        <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Package className="h-5 w-5 text-indigo-500" />
          Edit Order
        </h2>
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? 'Saving...' : <><Check className="w-4 h-4" /> Save</>}
          </button>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Items List */}
        <div className="space-y-3">
          {items.map((item, idx) => (
            <OrderItemCard
              key={`${item.product.id}-${idx}`}
              item={item}
              idx={idx}
              settings={settings}
              onItemDiscountChange={handleItemDiscountChange}
              onQuantityChange={handleQuantityChange}
              onRemoveItem={handleRemoveItem}
              onSelectOption={handleSelectOption}
            />
          ))}
        </div>

        {/* Search / Add Products */}
        <OrderProductSearch
          products={products}
          settings={settings}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onAddProduct={handleAddProduct}
        />

        {/* Financial Adjustments */}
        <OrderFinancialSummary
          subtotal={subtotal}
          total={total}
          settings={settings}
          discountCode={discountCode}
          setDiscountCode={setDiscountCode}
          discountType={discountType}
          setDiscountType={setDiscountType}
          discountAmount={discountAmount}
          setDiscountAmount={setDiscountAmount}
          discountPercent={discountPercent}
          setDiscountPercent={setDiscountPercent}
          shippingAmount={shippingAmount}
          setShippingAmount={setShippingAmount}
        />
      </div>
    </div>
  );
}
