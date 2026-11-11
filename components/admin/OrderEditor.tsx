'use client';

import React, { useState, useMemo } from 'react';
import { Product, CartItem, ProductVariant, StoreSettings, Order, StatusLogItem } from '@/lib/types';
import { Package, Check, ArrowLeft } from '@/components/common/Icons';
import { updateOrderDetailsSafe } from '@/lib/services/orders';
import { toast } from 'sonner';
import { OrderItemCard, OrderProductSearch, OrderFinancialSummary } from './order-editor';
import ImagePreviewModal from '@/components/admin/ImagePreviewModal';

interface OrderEditorProps {
  order: Order;
  settings: StoreSettings;
  products: Product[];
  onSave: (updatedOrder: Order) => void;
  onCancel: () => void;
}

export default function OrderEditor({ order: initialOrder, settings, products, onSave, onCancel }: OrderEditorProps) {
  const [items, setItems] = useState<(CartItem & { _isNew?: boolean })[]>(initialOrder.items || []);
  const [discountAmount, setDiscountAmount] = useState<number>(initialOrder.discount_amount || 0);
  const [shippingAmount, setShippingAmount] = useState<number>(initialOrder.shipping_amount || 0);
  const [discountCode, setDiscountCode] = useState<string>(initialOrder.discount_code || '');
  
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Financials
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
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
    const baseTotal = item.unit_price * item.quantity;
    const discountAmt = item.discount_type === 'percent' 
      ? (baseTotal * (item.discount_value || 0) / 100) 
      : (item.discount_value || 0);
    item.discount_amount = discountAmt;
    item.total = Math.max(0, baseTotal - discountAmt);
  };

  const handleItemDiscountChange = (idx: number, type: 'fixed' | 'percent', value: number) => {
    const newItems = [...items];
    newItems[idx].discount_type = type;
    newItems[idx].discount_value = value;
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
    const defaultVariant = variant || (product.has_variants && product.variants?.length > 0 ? product.variants[0] : undefined);
    const unitPrice = defaultVariant?.price || product.price || 0;
    
    const existingIdx = items.findIndex(item => 
      item.product.id === product.id && 
      item.selected_variant?.id === defaultVariant?.id
    );

    if (existingIdx >= 0) {
      handleQuantityChange(existingIdx, items[existingIdx].quantity + 1);
    } else {
      const newItem: CartItem & { _isNew?: boolean } = {
        id: Math.random().toString(36).substring(7),
        product,
        selected_variant: defaultVariant,
        selected_modifiers: [],
        quantity: 1,
        unit_price: unitPrice,
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
    const customValues = Array.from(new Set(activeVariants.map(v => v.custom_value).filter(Boolean))) as string[];

    const currentColor = type === 'color' ? value : item.selected_variant?.color;
    const currentSize = type === 'size' ? value : item.selected_variant?.size;
    const currentMaterial = type === 'material' ? value : item.selected_variant?.material;
    const currentCustomValue = type === 'customValue' ? value : item.selected_variant?.custom_value;

    let match = activeVariants.find(v => {
      const colorMatch = !colors.length || v.color === currentColor;
      const sizeMatch = !sizes.length || v.size === currentSize;
      const materialMatch = !materials.length || v.material === currentMaterial;
      const customMatch = !customValues.length || v.custom_value === currentCustomValue;
      return colorMatch && sizeMatch && materialMatch && customMatch;
    });

    if (!match) {
      match = activeVariants.find(v => {
        if (type === 'color') return v.color === value;
        if (type === 'size') return v.size === value;
        if (type === 'material') return v.material === value;
        if (type === 'customValue') return v.custom_value === value;
        return false;
      });
    }

    if (match) {
      const newItems = [...items];
      newItems[idx].selected_variant = match;
      newItems[idx].unit_price = match.price || newItems[idx].product.price || 0;
      updateItemTotal(newItems[idx]);
      setItems(newItems);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const newLogs: StatusLogItem[] = [];
      const now = new Date().toISOString();

      const addedItems = items.filter(i => i._isNew);
      if (addedItems.length > 0) {
        newLogs.push({
          id: Math.random().toString(36).substring(7),
          type: 'status_change',
          message: 'Items added to order',
          notes: addedItems.map(i => `+ ${i.product.name} (x${i.quantity})`).join('\n'),
          created_at: now
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
          created_at: now
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
          created_at: now
        });
      }

      const updatedLogs = [...(initialOrder.status_logs || []), ...newLogs];

      const cleanItems = items.map(i => {
        const { _isNew, ...rest } = i;
        if (_isNew) {
          return { ...rest, added_later: true };
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
    <div className="flex flex-col gap-3 sm:gap-4 w-full">
      {/* Sticky Native Header - Executive Shopify Polaris Style */}
      <div className="sticky top-0 z-30 bg-slate-50 dark:bg-[#0c0c16] -mt-3 sm:-mt-4 pt-3 sm:pt-4 pb-2.5 border-b border-gray-200 dark:border-white/10 -mx-3 sm:-mx-4 md:-mx-5 px-3 sm:px-4 md:px-5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <button 
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="p-1 -ml-1 text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Back to order detail"
            aria-label="Back to order detail"
          >
            <ArrowLeft className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
          </button>
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <h2 className="text-sm sm:text-base font-black text-gray-900 dark:text-white truncate">
            Edit Order {initialOrder.order_number ? `· ${initialOrder.order_number}` : ''}
          </h2>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button 
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="px-2.5 sm:px-3 h-7 sm:h-8 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-bold hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-3 sm:px-4 h-7 sm:h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            )}
            <span>Save</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#16162a] rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-3.5 sm:p-5 space-y-5 sm:space-y-6">
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
              onPreviewImage={setPreviewImageUrl}
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

      <ImagePreviewModal
        url={previewImageUrl}
        onClose={() => setPreviewImageUrl(null)}
      />
    </div>
  );
}
