'use client';

import React, { useState, useEffect } from 'react';
import { Product, ProductVariant, CartItem, StoreSettings, Order, StatusLogItem } from '@/lib/types';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useOrderCreateProducts } from './useOrderCreateProducts';
import { useOrderCreateCustomer } from './useOrderCreateCustomer';

interface UseOrderCreateCanvasStateProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (newOrder: Order) => void;
  settings: StoreSettings;
}

export function useOrderCreateCanvasState({ isOpen, onClose, onOrderCreated, settings }: UseOrderCreateCanvasStateProps) {
  const productsState = useOrderCreateProducts(isOpen);
  const customerState = useOrderCreateCustomer();

  const [isSaving, setIsSaving] = useState(false);

  // Custom Item states
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');
  const [customItemQuantity, setCustomItemQuantity] = useState('1');

  // Selected items list
  const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);

  // Payment & cost options
  const [paymentMethod, setPaymentMethod] = useState('Cash on delivery');
  const [paymentMethods, setPaymentMethods] = useState<{ name: string; code: string }[]>([]);
  const [shippingFee, setShippingFee] = useState('0');
  const [discountAmount, setDiscountAmount] = useState('0');
  const [staffNotes, setStaffNotes] = useState('');

  // Fetch payment methods from DB on open
  useEffect(() => {
    if (!isOpen) return;
    const fetchPaymentMethods = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('payment_methods')
          .select('name, code')
          .eq('active', true)
          .order('sort_order', { ascending: true });
        if (data && data.length > 0) {
          setPaymentMethods(data);
          if (!data.some(p => p.name === paymentMethod)) {
            setPaymentMethod(data[0].name);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPaymentMethods();
  }, [isOpen]);

  // Add catalog item to order
  const handleAddItem = () => {
    if (!productsState.selectedProduct) return;

    let finalVariant: ProductVariant | undefined = undefined;
    if (productsState.selectedProduct.hasVariants) {
      if (!productsState.chosenVariantId) {
        toast.error('Please select size/color options to match a variant');
        return;
      }
      finalVariant = productsState.selectedProduct.variants.find(v => v.id === productsState.chosenVariantId);
      if (!finalVariant) return;
    }

    const unitPrice = productsState.customUnitPrice !== '' ? parseFloat(productsState.customUnitPrice) : (finalVariant?.price ?? productsState.selectedProduct.price);
    const quantity = parseInt(productsState.chosenQuantity) || 1;

    // Check stock warning
    const availableStock = finalVariant ? finalVariant.stock : productsState.selectedProduct.stock;
    if (availableStock < quantity) {
      toast.warning(`Warning: Only ${availableStock} left in stock for this selection.`);
    }

    const newItem: CartItem = {
      id: crypto.randomUUID(),
      product: productsState.selectedProduct,
      selectedVariant: finalVariant,
      selectedModifiers: [],
      quantity,
      unitPrice,
      total: unitPrice * quantity
    };

    setSelectedItems(prev => [...prev, newItem]);
    productsState.setSelectedProduct(null);
    productsState.setSearchQuery('');
    productsState.setChosenSize('');
    productsState.setChosenColor('');
    productsState.setChosenVariantId('');
    productsState.setChosenQuantity('1');
    productsState.setCustomUnitPrice('');
    toast.success('Item added to order');
  };

  // Add custom item to order
  const handleAddCustomItem = () => {
    if (!customItemName.trim()) {
      toast.error('Please enter custom item name');
      return;
    }
    const price = parseFloat(customItemPrice) || 0;
    const quantity = parseInt(customItemQuantity) || 1;

    const dummyProduct: Product = {
      id: 'custom-' + crypto.randomUUID(),
      name: customItemName,
      slug: 'custom-item',
      price: price,
      stock: 9999,
      hasVariants: false,
      isService: true,
      isFeatured: false,
      isActive: true,
      enableSwatches: false,
      showSwatchesOnArchive: false,
      tags: [],
      images: [],
      variants: [],
      modifiers: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newItem: CartItem = {
      id: crypto.randomUUID(),
      product: dummyProduct,
      selectedModifiers: [],
      quantity,
      unitPrice: price,
      total: price * quantity
    };

    setSelectedItems(prev => [...prev, newItem]);
    setCustomItemName('');
    setCustomItemPrice('');
    setCustomItemQuantity('1');
    setIsAddingCustom(false);
    toast.success('Custom item added');
  };

  const handleRemoveItem = (id: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== id));
  };

  // Cost totals
  const subtotal = selectedItems.reduce((sum, item) => sum + item.total, 0);
  const shipCost = parseFloat(shippingFee) || 0;
  const discCost = parseFloat(discountAmount) || 0;
  const grandTotal = Math.max(0, subtotal + shipCost - discCost);

  // Check if digital/paid payment
  const isPrepaid = (method: string) => {
    const m = method.toLowerCase();
    return m.includes('transfer') || m.includes('bank') || m.includes('nayapay') || m.includes('easypaisa') || m.includes('jazzcash') || m.includes('card') || m.includes('online');
  };

  // Create Order Submission
  const handleCreateOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      toast.error('Please add at least one item to the order');
      return;
    }
    if (!customerState.customerName.trim() || !customerState.customerPhone.trim()) {
      toast.error('Please provide customer name and phone');
      return;
    }
    if (!customerState.customerAddress.trim() || !customerState.customerCity.trim()) {
      toast.error('Please provide customer shipping address and city');
      return;
    }

    setIsSaving(true);
    try {
      const supabase = createClient();

      const notes = `Address: ${customerState.customerAddress.trim()}\nCity: ${customerState.customerCity.trim()}\nPayment Method: ${paymentMethod}`;

      const creationLog: StatusLogItem = {
        id: crypto.randomUUID(),
        type: 'creation',
        message: 'Order created from Admin console',
        createdAt: new Date().toISOString()
      };

      const finalLogs: StatusLogItem[] = [creationLog];

      if (isPrepaid(paymentMethod)) {
        finalLogs.push({
          id: crypto.randomUUID(),
          type: 'payment',
          message: `Payment verified via ${paymentMethod}`,
          notes: 'Prepaid order Confirmed by Admin',
          createdAt: new Date().toISOString()
        });
      }

      const orderPayload = {
        customer_name: customerState.customerName.trim(),
        customer_phone: customerState.customerPhone.trim(),
        items: selectedItems,
        subtotal: subtotal,
        total: grandTotal,
        discount_amount: discCost,
        shipping_amount: shipCost,
        status: 'pending',
        notes: notes,
        staff_notes: staffNotes.trim() || null,
        status_logs: finalLogs,
        review_email_pending: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      let newRow: any;
      let insertAttempt = 0;
      const MAX_ATTEMPTS = 3;
      while (insertAttempt < MAX_ATTEMPTS) {
        insertAttempt++;
        const { data: result, error: err } = await supabase
          .from('orders')
          .insert(orderPayload)
          .select('*')
          .single();
        if (err) {
          const pgCode = (err as any)?.code;
          if (pgCode === '23505' && insertAttempt < MAX_ATTEMPTS) {
            console.warn(`[OrderCreate] 23505 duplicate order_number, retry ${insertAttempt}/${MAX_ATTEMPTS}`);
            await new Promise(r => setTimeout(r, 150));
            continue;
          }
          throw err;
        }
        newRow = result;
        break;
      }

      // Update Stock Levels
      for (const item of selectedItems) {
        if (item.product.id.startsWith('custom-')) continue;

        if (item.selectedVariant) {
          await supabase.rpc('decrement_variant_stock', {
            var_id: item.selectedVariant.id,
            qty: item.quantity
          });
        } else {
          await supabase.rpc('decrement_product_stock', {
            prod_id: item.product.id,
            qty: item.quantity
          });
        }
      }

      const formattedOrder: Order = {
        id: newRow.id,
        orderNumber: newRow.order_number || `#${newRow.id.slice(0, 8)}`,
        customerName: newRow.customer_name,
        customerPhone: newRow.customer_phone,
        items: newRow.items || [],
        subtotal: Number(newRow.subtotal),
        total: Number(newRow.total),
        status: newRow.status,
        notes: newRow.notes,
        createdAt: newRow.created_at,
        updatedAt: newRow.updated_at
      };

      onOrderCreated(formattedOrder);
      toast.success(`Order ${formattedOrder.orderNumber} created successfully!`);
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to create order');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    isLoadingProducts: productsState.isLoadingProducts,
    searchQuery: productsState.searchQuery,
    setSearchQuery: productsState.setSearchQuery,
    isDropdownOpen: productsState.isDropdownOpen,
    setIsDropdownOpen: productsState.setIsDropdownOpen,
    dropdownRef: productsState.dropdownRef,
    selectedProduct: productsState.selectedProduct,
    setSelectedProduct: productsState.setSelectedProduct,
    chosenSize: productsState.chosenSize,
    setChosenSize: productsState.setChosenSize,
    chosenColor: productsState.chosenColor,
    setChosenColor: productsState.setChosenColor,
    chosenVariantId: productsState.chosenVariantId,
    setChosenVariantId: productsState.setChosenVariantId,
    chosenQuantity: productsState.chosenQuantity,
    setChosenQuantity: productsState.setChosenQuantity,
    customUnitPrice: productsState.customUnitPrice,
    setCustomUnitPrice: productsState.setCustomUnitPrice,
    isAddingCustom,
    setIsAddingCustom,
    customItemName,
    setCustomItemName,
    customItemPrice,
    setCustomItemPrice,
    customItemQuantity,
    setCustomItemQuantity,
    selectedItems,
    customerName: customerState.customerName,
    setCustomerName: customerState.setCustomerName,
    customerPhone: customerState.customerPhone,
    setCustomerPhone: customerState.setCustomerPhone,
    customerAddress: customerState.customerAddress,
    setCustomerAddress: customerState.setCustomerAddress,
    customerCity: customerState.customerCity,
    setCustomerCity: customerState.setCustomerCity,
    customerSearchQuery: customerState.customerSearchQuery,
    setCustomerSearchQuery: customerState.setCustomerSearchQuery,
    customerResults: customerState.customerResults,
    isCustomerDropdownOpen: customerState.isCustomerDropdownOpen,
    setIsCustomerDropdownOpen: customerState.setIsCustomerDropdownOpen,
    isSearchingCustomer: customerState.isSearchingCustomer,
    paymentMethod,
    setPaymentMethod,
    paymentMethods,
    shippingFee,
    setShippingFee,
    discountAmount,
    setDiscountAmount,
    staffNotes,
    setStaffNotes,
    filteredProducts: productsState.filteredProducts,
    handleProductSelect: productsState.handleProductSelect,
    handleAddItem,
    handleAddCustomItem,
    handleRemoveItem,
    searchCustomer: customerState.searchCustomer,
    handleCustomerSelect: customerState.handleCustomerSelect,
    subtotal,
    shipCost,
    discCost,
    grandTotal,
    handleCreateOrderSubmit,
  };
}
