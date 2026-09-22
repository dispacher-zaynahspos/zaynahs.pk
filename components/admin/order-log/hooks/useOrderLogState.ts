'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStartISO, getEndISO } from '@/lib/utils/dateFilters';
import { Order, StoreSettings } from '@/lib/types';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { mapOrderRow, isOrderPaid } from '../orderLogUtils';
import { useOrderLogBulkActions } from './useOrderLogBulkActions';

interface UseOrderLogStateProps {
  initialOrders: Order[];
  settings: StoreSettings;
}

export function useOrderLogState({ initialOrders, settings }: UseOrderLogStateProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Layout and view states
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unfulfilled' | 'unpaid' | 'open' | 'archived'>('all');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  // Order Creator Canvas
  const [isCreateCanvasOpen, setIsCreateCanvasOpen] = useState(false);

  // Column Visibility Customizer
  const [visibleColumns] = useState<string[]>([
    'order', 'date', 'customer', 'channel', 'total', 'paymentStatus', 'fulfillmentStatus', 'items', 'deliveryStatus', 'paymentMethod'
  ]);
  const [sortKey] = useState<'date-desc' | 'date-asc' | 'order-asc' | 'order-desc' | 'customer-asc' | 'customer-desc' | 'total-desc' | 'total-asc'>('date-desc');

  // Search & Filters inputs
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [totalRows, setTotalRows] = useState(0);

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  // Sync dateFilter with URL search param
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const timeParam = params.get('timeRange');
      if (timeParam && ['all', 'today', 'yesterday', 'tomorrow', 'last7', 'last30', 'custom'].includes(timeParam)) {
        setDateFilter(timeParam);
      }
    }
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const timeParam = params.get('timeRange');
      if (timeParam && ['all', 'today', 'yesterday', 'tomorrow', 'last7', 'last30', 'custom'].includes(timeParam)) {
        setDateFilter(timeParam);
      } else {
        setDateFilter('today');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (dateFilter === 'today') {
        params.delete('timeRange');
      } else {
        params.set('timeRange', dateFilter);
      }
      const newQs = params.toString();
      const newUrl = window.location.pathname + (newQs ? '?' + newQs : '');
      window.history.replaceState(null, '', newUrl);
    }
  }, [dateFilter]);

  // Fetch orders from Supabase with date constraints + pagination
  const fetchOrdersByDate = async (filter: string, startDate?: string, endDate?: string, page = 1, rpp = 50) => {
    setIsRefreshing(true);
    try {
      const supabase = createClient();
      const from = (page - 1) * rpp;
      const to = from + rpp - 1;

      let query = supabase
        .from('orders')
        .select('*', { count: 'exact', head: false })
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(from, to);

      const now = new Date();

      if (filter === 'today') {
        query = query.gte('created_at', getStartISO(now)).lte('created_at', getEndISO(now));
      } else if (filter === 'yesterday') {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        query = query.gte('created_at', getStartISO(yesterday)).lte('created_at', getEndISO(yesterday));
      } else if (filter === 'tomorrow') {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        query = query.gte('created_at', getStartISO(tomorrow)).lte('created_at', getEndISO(tomorrow));
      } else if (filter === 'last7') {
        const seven = new Date(now);
        seven.setDate(seven.getDate() - 7);
        query = query.gte('created_at', getStartISO(seven)).lte('created_at', getEndISO(now));
      } else if (filter === 'last30') {
        const thirty = new Date(now);
        thirty.setDate(thirty.getDate() - 30);
        query = query.gte('created_at', getStartISO(thirty)).lte('created_at', getEndISO(now));
      } else if (filter === 'custom' && startDate && endDate) {
        query = query.gte('created_at', getStartISO(new Date(startDate))).lte('created_at', getEndISO(new Date(endDate)));
      }

      const { data, error, count } = await query;
      if (error) throw error;
      if (data) setOrders(data.map(mapOrderRow));
      if (count !== null) setTotalRows(count);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load orders');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchOrdersByDate(dateFilter, customStartDate, customEndDate, 1, rowsPerPage);
  }, [dateFilter, customStartDate, customEndDate]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    fetchOrdersByDate(dateFilter, customStartDate, customEndDate, page, rowsPerPage);
  };

  const handleRowsPerPageChange = (newRpp: number) => {
    setRowsPerPage(newRpp);
    setCurrentPage(1);
    fetchOrdersByDate(dateFilter, customStartDate, customEndDate, 1, newRpp);
  };

  // Realtime subscription setup
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('orders-log-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOrder = mapOrderRow(payload.new);
            setOrders(prev => {
              if (prev.some(o => o.id === newOrder.id)) return prev;
              return [newOrder, ...prev];
            });
            toast.info(`New Order received: ${newOrder.orderNumber}`);
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrder = mapOrderRow(payload.new);
            setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
          } else if (payload.eventType === 'DELETE') {
            setOrders(prev => prev.filter(o => o.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter & Search Logic
  const filteredOrders = orders.filter(o => {
    if (o.deletedAt) return false;

    if (activeTab === 'unfulfilled') {
      if (!['pending', 'placed', 'confirmed'].includes(o.status)) return false;
    } else if (activeTab === 'unpaid') {
      if (isOrderPaid(o)) return false;
    } else if (activeTab === 'open') {
      if (['delivered', 'cancelled', 'refunded'].includes(o.status)) return false;
    } else if (activeTab === 'archived') {
      if (!['delivered', 'cancelled', 'refunded'].includes(o.status)) return false;
    }

    if (statusFilter !== 'all' && o.status !== statusFilter) return false;

    const matchesSearch =
      !searchQuery.trim() ||
      (o.orderNumber && o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.customerName && o.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.customerPhone && o.customerPhone.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;

    const orderDate = new Date(o.createdAt);
    const orderTime = orderDate.getTime();
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

    if (dateFilter === 'today') {
      const start = getStartOfDay(now);
      const end = getEndOfDay(now);
      if (orderTime < start || orderTime > end) return false;
    } else if (dateFilter === 'yesterday') {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const start = getStartOfDay(yesterday);
      const end = getEndOfDay(yesterday);
      if (orderTime < start || orderTime > end) return false;
    } else if (dateFilter === 'tomorrow') {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const start = getStartOfDay(tomorrow);
      const end = getEndOfDay(tomorrow);
      if (orderTime < start || orderTime > end) return false;
    } else if (dateFilter === 'last7') {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      if (orderTime < getStartOfDay(sevenDaysAgo) || orderTime > getEndOfDay(now)) return false;
    } else if (dateFilter === 'last30') {
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      if (orderTime < getStartOfDay(thirtyDaysAgo) || orderTime > getEndOfDay(now)) return false;
    } else if (dateFilter === 'custom') {
      const start = customStartDate ? getStartOfDay(new Date(customStartDate)) : 0;
      const end = customEndDate ? getEndOfDay(new Date(customEndDate)) : Infinity;
      if (orderTime < start || orderTime > end) return false;
    }

    return true;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortKey === 'date-desc') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortKey === 'date-asc') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortKey === 'order-desc') {
      return (b.orderNumber || '').localeCompare(a.orderNumber || '');
    } else if (sortKey === 'order-asc') {
      return (a.orderNumber || '').localeCompare(b.orderNumber || '');
    } else if (sortKey === 'customer-desc') {
      return (b.customerName || '').localeCompare(a.customerName || '');
    } else if (sortKey === 'customer-asc') {
      return (a.customerName || '').localeCompare(b.customerName || '');
    } else if (sortKey === 'total-desc') {
      return b.total - a.total;
    } else if (sortKey === 'total-asc') {
      return a.total - b.total;
    }
    return 0;
  });

  const bulkActions = useOrderLogBulkActions(
    selectedOrderIds,
    setSelectedOrderIds,
    setOrders,
    setIsRefreshing
  );

  return {
    router,
    orders,
    isRefreshing,
    isFullWidth,
    setIsFullWidth,
    activeTab,
    setActiveTab,
    selectedOrderIds,
    setSelectedOrderIds,
    isSearchExpanded,
    setIsSearchExpanded,
    isFiltersExpanded,
    setIsFiltersExpanded,
    isCreateCanvasOpen,
    setIsCreateCanvasOpen,
    visibleColumns,
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
    rowsPerPage,
    totalRows,
    filteredOrders,
    sortedOrders,
    goToPage,
    handleRowsPerPageChange,
    ...bulkActions,
    fetchOrdersByDate,
  };
}
