'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  pktStartISO, pktEndISO, pktStartISOFromYMD, pktEndISOFromYMD,
  pktStartMs, pktEndMs, pktStartMsFromYMD, pktEndMsFromYMD,
} from '@/lib/utils/dateFilters';
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

  // Global order search: when the user types a query, search the FULL orders table
  // (ignoring the date window) instead of only filtering the current date-paginated
  // page. Debounced so we don't hit Supabase on every keystroke. When the query is
  // cleared we fall back to the normal date-based fetch (handled by the effect below).
  const searchOrders = async (rawQuery: string) => {
    const term = rawQuery.trim();
    if (!term) return;
    setIsRefreshing(true);
    try {
      const supabase = createClient();
      // Strip PostgREST filter metacharacters to avoid `.or()` filter injection.
      const safe = term.replace(/[%,()*:]/g, ' ').trim();
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .is('deleted_at', null)
        .or(
          `order_number.ilike.%${safe}%,customer_name.ilike.%${safe}%,customer_phone.ilike.%${safe}%`
        )
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      if (data) {
        setOrders(data.map(mapOrderRow));
        setTotalRows(data.length);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to search orders');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const term = searchQuery.trim();
    // Empty query → restore the date-filtered list.
    if (!term) {
      fetchOrdersByDate(dateFilter, customStartDate, customEndDate, 1, rowsPerPage);
      return;
    }
    const t = setTimeout(() => {
      searchOrders(term);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Sync dateFilter with URL search param
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const timeParam = params.get('timeRange');
      if (timeParam && ['today', 'yesterday', 'tomorrow', 'last7', 'last30', 'custom'].includes(timeParam)) {
        setDateFilter(timeParam);
      }
    }
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const timeParam = params.get('timeRange');
      if (timeParam && ['today', 'yesterday', 'tomorrow', 'last7', 'last30', 'custom'].includes(timeParam)) {
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

      const now = Date.now();
      const DAY = 86400000;

      if (filter === 'today') {
        query = query.gte('created_at', pktStartISO(now)).lte('created_at', pktEndISO(now));
      } else if (filter === 'yesterday') {
        query = query.gte('created_at', pktStartISO(now - DAY)).lte('created_at', pktEndISO(now - DAY));
      } else if (filter === 'tomorrow') {
        query = query.gte('created_at', pktStartISO(now + DAY)).lte('created_at', pktEndISO(now + DAY));
      } else if (filter === 'last7') {
        query = query.gte('created_at', pktStartISO(now - 7 * DAY)).lte('created_at', pktEndISO(now));
      } else if (filter === 'last30') {
        query = query.gte('created_at', pktStartISO(now - 30 * DAY)).lte('created_at', pktEndISO(now));
      } else if (filter === 'custom') {
        // Apply whichever bound(s) the admin has chosen (end date is inclusive).
        if (startDate) query = query.gte('created_at', pktStartISOFromYMD(startDate));
        if (endDate) query = query.lte('created_at', pktEndISOFromYMD(endDate));
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
            toast.info(`New Order received: ${newOrder.order_number}`);
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
    if (o.deleted_at) return false;

    if (activeTab === 'unfulfilled') {
      if (o.fulfillment_status === 'fulfilled') return false;
      if (['delivered', 'cancelled', 'refunded'].includes(o.status)) return false;
    } else if (activeTab === 'unpaid') {
      if (isOrderPaid(o)) return false;
      if (['cancelled', 'refunded'].includes(o.status)) return false;
    } else if (activeTab === 'open') {
      if (['delivered', 'cancelled', 'refunded'].includes(o.status)) return false;
    } else if (activeTab === 'archived') {
      if (!['delivered', 'cancelled', 'refunded'].includes(o.status)) return false;
    }

    if (statusFilter !== 'all' && o.status !== statusFilter) return false;

    const matchesSearch =
      !searchQuery.trim() ||
      (o.order_number && o.order_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.customer_phone && o.customer_phone.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;

    const orderTime = new Date(o.created_at).getTime();
    const now = Date.now();
    const DAY = 86400000;

    // When a search query is active we search across ALL dates (results are fetched
    // globally), so skip the date-window filter to avoid hiding valid matches.
    if (searchQuery.trim()) {
      return true;
    }

    // All boundaries use PKT (UTC+5) days — matches the server fetch + badge count.
    if (dateFilter === 'today') {
      if (orderTime < pktStartMs(now) || orderTime > pktEndMs(now)) return false;
    } else if (dateFilter === 'yesterday') {
      if (orderTime < pktStartMs(now - DAY) || orderTime > pktEndMs(now - DAY)) return false;
    } else if (dateFilter === 'tomorrow') {
      if (orderTime < pktStartMs(now + DAY) || orderTime > pktEndMs(now + DAY)) return false;
    } else if (dateFilter === 'last7') {
      if (orderTime < pktStartMs(now - 7 * DAY) || orderTime > pktEndMs(now)) return false;
    } else if (dateFilter === 'last30') {
      if (orderTime < pktStartMs(now - 30 * DAY) || orderTime > pktEndMs(now)) return false;
    } else if (dateFilter === 'custom') {
      const start = customStartDate ? pktStartMsFromYMD(customStartDate) : 0;
      const end = customEndDate ? pktEndMsFromYMD(customEndDate) : Infinity;
      if (orderTime < start || orderTime > end) return false;
    }

    return true;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortKey === 'date-desc') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortKey === 'date-asc') {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    } else if (sortKey === 'order-desc') {
      return (b.order_number || '').localeCompare(a.order_number || '');
    } else if (sortKey === 'order-asc') {
      return (a.order_number || '').localeCompare(b.order_number || '');
    } else if (sortKey === 'customer-desc') {
      return (b.customer_name || '').localeCompare(a.customer_name || '');
    } else if (sortKey === 'customer-asc') {
      return (a.customer_name || '').localeCompare(b.customer_name || '');
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
