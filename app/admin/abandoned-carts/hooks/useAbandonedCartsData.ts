'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useConfirm } from '@/components/admin/shared/AdminConfirmProvider';
import { formatPrice } from '@/lib/utils/whatsapp';
import { AbandonedCart } from '../components';

export function useAbandonedCartsData() {
  const { confirm } = useConfirm();
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const [selectedCartId, setSelectedCartId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchCarts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/abandoned-carts');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setCarts(data.carts || []);
    } catch {
      toast.error('Failed to load abandoned carts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCarts();

    const supabase = createClient();
    const mapRealtimeCart = (row: any): AbandonedCart => ({
      id: row.id,
      sessionId: row.session_id,
      customerName: row.customer_name ?? undefined,
      customerEmail: row.customer_email ?? undefined,
      customerPhone: row.customer_phone ?? undefined,
      customerAddress: row.customer_address ?? undefined,
      customerCity: row.customer_city ?? undefined,
      customerApartment: row.customer_apartment ?? undefined,
      customerPostalCode: row.customer_postal_code ?? undefined,
      items: row.items ?? [],
      subtotal: row.subtotal ? parseFloat(row.subtotal.toString()) : 0,
      currency: row.currency || 'PKR',
      emailSent: row.email_sent ?? false,
      emailSentAt: row.email_sent_at || undefined,
      orderPlaced: row.order_placed ?? false,
      orderId: row.order_id || undefined,
      recoveredAt: row.recovered_at || undefined,
      lastActivity: row.last_activity,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });

    const channel = supabase
      .channel('abandoned-carts-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'abandoned_carts' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newCart = mapRealtimeCart(payload.new);
            setCarts(prev => {
              if (prev.some(c => c.id === newCart.id)) return prev;
              return [newCart, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedCart = mapRealtimeCart(payload.new);
            setCarts(prev => prev.map(c => c.id === updatedCart.id ? updatedCart : c));
          } else if (payload.eventType === 'DELETE') {
            setCarts(prev => prev.filter(c => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCarts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateFilter, statusFilter, customStartDate, customEndDate]);

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Cart',
      message: 'Are you sure you want to delete this cart?',
      variant: 'danger',
      confirmText: 'Delete'
    });
    if (!confirmed) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/abandoned-carts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setCarts(prev => prev.filter(c => c.id !== id));
      if (selectedCartId === id) setSelectedCartId(null);
      toast.success('Cart removed successfully');
    } catch {
      toast.error('Failed to delete cart');
    } finally {
      setDeleting(null);
    }
  };

  const selectedCart = carts.find(c => c.id === selectedCartId) || null;

  const filteredCarts = carts.filter(c => {
    if (c.orderPlaced) return false;

    let matchesStatus = true;
    if (statusFilter === 'pending') matchesStatus = !c.emailSent;
    else if (statusFilter === 'emailed') matchesStatus = c.emailSent;

    const matchesSearch = 
      (c.customerName && c.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.customerPhone && c.customerPhone.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.customerEmail && c.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.sessionId && c.sessionId.toLowerCase().includes(searchQuery.toLowerCase()));

    const activityDate = new Date(c.lastActivity);
    const activityTime = activityDate.getTime();
    const now = new Date();
    
    const getStartOfDay = (d: Date) => {
      const copy = new Date(d);
      copy.setHours(0, 0, 0, 0);
      return copy.getTime();
    };
    
    const getEndOfDay = (d: Date) => {
      const copy = new Date(d);
      copy.setHours(23, 59, 59, 999);
      return copy.getTime();
    };
    
    let matchesDate = true;
    if (dateFilter === 'today') {
      const start = getStartOfDay(now);
      const end = getEndOfDay(now);
      matchesDate = activityTime >= start && activityTime <= end;
    } else if (dateFilter === 'yesterday') {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const start = getStartOfDay(yesterday);
      const end = getEndOfDay(yesterday);
      matchesDate = activityTime >= start && activityTime <= end;
    } else if (dateFilter === 'last7') {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      matchesDate = activityTime >= getStartOfDay(sevenDaysAgo) && activityTime <= getEndOfDay(now);
    } else if (dateFilter === 'last30') {
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      matchesDate = activityTime >= getStartOfDay(thirtyDaysAgo) && activityTime <= getEndOfDay(now);
    } else if (dateFilter === 'custom') {
      const start = customStartDate ? getStartOfDay(new Date(customStartDate)) : 0;
      const end = customEndDate ? getEndOfDay(new Date(customEndDate)) : Infinity;
      matchesDate = activityTime >= start && activityTime <= end;
    }

    return matchesStatus && matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredCarts.length / itemsPerPage);
  const paginatedCarts = filteredCarts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const dateFilteredCarts = carts.filter(c => {
    if (c.orderPlaced) return false;
    const activityTime = new Date(c.lastActivity).getTime();
    const now = new Date();
    const getStartOfDay = (d: Date) => { const cp = new Date(d); cp.setHours(0,0,0,0); return cp.getTime(); };
    const getEndOfDay = (d: Date) => { const cp = new Date(d); cp.setHours(23,59,59,999); return cp.getTime(); };
    let matchesDate = true;
    if (dateFilter === 'today') { const s=getStartOfDay(now), e=getEndOfDay(now); matchesDate = activityTime>=s && activityTime<=e; }
    else if (dateFilter === 'yesterday') { const y=new Date(now); y.setDate(y.getDate()-1); const s=getStartOfDay(y), e=getEndOfDay(y); matchesDate = activityTime>=s && activityTime<=e; }
    else if (dateFilter === 'last7') { const d=new Date(now); d.setDate(d.getDate()-7); matchesDate = activityTime>=getStartOfDay(d) && activityTime<=getEndOfDay(now); }
    else if (dateFilter === 'last30') { const d=new Date(now); d.setDate(d.getDate()-30); matchesDate = activityTime>=getStartOfDay(d) && activityTime<=getEndOfDay(now); }
    else if (dateFilter === 'custom') { const s=customStartDate?getStartOfDay(new Date(customStartDate)):0; const e=customEndDate?getEndOfDay(new Date(customEndDate)):Infinity; matchesDate = activityTime>=s && activityTime<=e; }
    return matchesDate;
  });

  const selectedCartIndex = selectedCart ? filteredCarts.findIndex(c => c.id === selectedCart.id) : -1;

  const handlePrevCart = () => {
    if (selectedCartIndex > 0) {
      setSelectedCartId(filteredCarts[selectedCartIndex - 1].id);
    }
  };

  const handleNextCart = () => {
    if (selectedCartIndex >= 0 && selectedCartIndex < filteredCarts.length - 1) {
      setSelectedCartId(filteredCarts[selectedCartIndex + 1].id);
    }
  };

  const stats = {
    total: dateFilteredCarts.length + carts.filter(c => c.orderPlaced).length,
    pending: dateFilteredCarts.filter(c => !c.emailSent).length,
    emailed: dateFilteredCarts.filter(c => c.emailSent).length,
    recovered: carts.filter(c => c.orderPlaced).length,
    totalValue: dateFilteredCarts.reduce((s, c) => s + c.subtotal, 0) + carts.filter(c => c.orderPlaced).reduce((s, c) => s + c.subtotal, 0),
    recoveredValue: carts.filter(c => c.orderPlaced).reduce((s, c) => s + c.subtotal, 0),
  };

  const handleCopyDetails = (cart: AbandonedCart) => {
    const itemsText = cart.items.map(item => {
      const variantParts = [];
      if (item.selectedVariant?.color) variantParts.push(item.selectedVariant.color);
      if (item.selectedVariant?.size) variantParts.push(item.selectedVariant.size);
      const variantStr = variantParts.length ? ` (${variantParts.join(', ')})` : '';
      return `• ${item.product.name}${variantStr} x${item.quantity} = ${formatPrice(item.price * item.quantity)}`;
    }).join('\n');

    const addressParts = [
      cart.customerAddress,
      cart.customerApartment,
      cart.customerCity,
      cart.customerPostalCode
    ].filter(Boolean).join(', ');

    const fullText = [
      `Abandoned Cart: ${cart.id}`,
      `Customer: ${cart.customerName || 'Anonymous Shopper'}`,
      `Phone: ${cart.customerPhone || 'N/A'}`,
      `Email: ${cart.customerEmail || 'N/A'}`,
      `Address: ${addressParts || 'N/A'}`,
      `Last Activity: ${new Date(cart.lastActivity).toLocaleString()}`,
      `Status: ${cart.orderPlaced ? 'RECOVERED' : cart.emailSent ? 'EMAIL SENT' : 'PENDING'}`,
      `\nItems:\n${itemsText}`,
      `\nTotal: ${formatPrice(cart.subtotal)}`,
    ].join('\n');

    navigator.clipboard.writeText(fullText);
    setCopiedId(cart.id);
    toast.success('Cart details copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadgeStyles = (cart: AbandonedCart) => {
    if (cart.orderPlaced) {
      return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50';
    }
    if (cart.emailSent) {
      return 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50';
    }
    return 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50';
  };

  return {
    carts,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    currentPage,
    setCurrentPage,
    selectedCartId,
    setSelectedCartId,
    selectedCart,
    deleting,
    copiedId,
    fetchCarts,
    handleDelete,
    filteredCarts,
    paginatedCarts,
    totalPages,
    selectedCartIndex,
    handlePrevCart,
    handleNextCart,
    stats,
    handleCopyDetails,
    getStatusBadgeStyles,
  };
}
