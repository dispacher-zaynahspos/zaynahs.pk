'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  pktStartISO, pktEndISO, pktStartISOFromYMD, pktEndISOFromYMD,
  pktStartMs, pktEndMs, pktStartMsFromYMD, pktEndMsFromYMD,
} from '@/lib/utils/dateFilters';
import { Order, StoreSettings } from '@/lib/types';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { mapOrderRow, isOrderPaid, isOrderUnfulfilled, isOrderFulfilled, OrderRow } from '../orderLogUtils';
import { useOrderLogBulkActions } from './useOrderLogBulkActions';
import { playOrderChime } from '@/lib/utils/orderChime';
import { getOrderNavContext, restoreOrderScrollAndHighlight, ORDERS_FILTER_STORAGE_KEY } from '@/lib/hooks/useOrderNav';

export interface CustomerFilter {
  id?: string;
  phone?: string;
  name?: string;
}

interface UseOrderLogStateProps {
  initialOrders: Order[];
  settings: StoreSettings;
}

const getInitialOrderFilters = () => {
  if (typeof window === 'undefined') {
    return {
      dateFilter: 'today',
      customStartDate: '',
      customEndDate: '',
      activeTab: 'all' as const,
      searchQuery: '',
      currentPage: 1,
    };
  }
  const params = new URLSearchParams(window.location.search);
  const timeParam = params.get('timeRange');
  const tabParam = params.get('tab') as 'all' | 'unfulfilled' | 'unpaid' | 'open' | 'archived' | null;
  const qParam = params.get('search');
  const pageParam = params.get('page');
  const sDate = params.get('startDate');
  const eDate = params.get('endDate');

  let saved: Record<string, any> = {};
  try {
    saved = JSON.parse(sessionStorage.getItem(ORDERS_FILTER_STORAGE_KEY) || '{}');
  } catch {}

  const dateFilter = (timeParam && ['today', 'yesterday', 'tomorrow', 'last7', 'last30', 'custom', 'all'].includes(timeParam))
    ? timeParam
    : (saved.dateFilter && ['today', 'yesterday', 'tomorrow', 'last7', 'last30', 'custom', 'all'].includes(saved.dateFilter))
      ? saved.dateFilter
      : 'today';

  const customStartDate = sDate || saved.customStartDate || '';
  const customEndDate = eDate || saved.customEndDate || '';

  const activeTab = (tabParam && ['all', 'unfulfilled', 'unpaid', 'open', 'archived'].includes(tabParam))
    ? tabParam
    : (saved.activeTab && ['all', 'unfulfilled', 'unpaid', 'open', 'archived'].includes(saved.activeTab))
      ? saved.activeTab
      : 'all';

  const searchQuery = qParam || saved.searchQuery || '';
  const currentPage = (pageParam && !isNaN(Number(pageParam)))
    ? Math.max(1, Number(pageParam))
    : (typeof saved.currentPage === 'number' && saved.currentPage > 0)
      ? saved.currentPage
      : 1;

  return { dateFilter, customStartDate, customEndDate, activeTab, searchQuery, currentPage };
};

export function useOrderLogState({ initialOrders, settings }: UseOrderLogStateProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const init = getInitialOrderFilters();

  // Layout and view states
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unfulfilled' | 'unpaid' | 'open' | 'archived'>(init.activeTab);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isSearchExpanded, setIsSearchExpanded] = useState(Boolean(init.searchQuery));
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  // Order Creator Canvas
  const [isCreateCanvasOpen, setIsCreateCanvasOpen] = useState(false);

  // Column Visibility Customizer
  const [visibleColumns] = useState<string[]>([
    'order', 'date', 'customer', 'channel', 'total', 'paymentStatus', 'fulfillmentStatus', 'items', 'deliveryStatus', 'paymentMethod'
  ]);
  const [sortKey] = useState<'date-desc' | 'date-asc' | 'order-asc' | 'order-desc' | 'customer-asc' | 'customer-desc' | 'total-desc' | 'total-asc'>('date-desc');

  // Search & Filters inputs
  const [searchQuery, setSearchQuery] = useState(init.searchQuery);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>(init.dateFilter);
  const [customStartDate, setCustomStartDate] = useState(init.customStartDate);
  const [customEndDate, setCustomEndDate] = useState(init.customEndDate);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerFilter | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(init.currentPage);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [totalRows, setTotalRows] = useState(0);

  const isFirstFetch = useRef(true);

  useEffect(() => {
    if (!selectedCustomer && !searchQuery.trim()) {
      setOrders(initialOrders);
    }
  }, [initialOrders, selectedCustomer, searchQuery]);

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

  const fetchOrdersForCustomer = async (cust: CustomerFilter) => {
    setIsRefreshing(true);
    try {
      const supabase = createClient();
      let query = supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (cust.id && cust.phone) {
        const safePhone = cust.phone.replace(/[%,()*:]/g, ' ').trim();
        query = query.or(`customer_id.eq.${cust.id},customer_phone.ilike.%${safePhone}%`);
      } else if (cust.id) {
        query = query.eq('customer_id', cust.id);
      } else if (cust.phone) {
        const safePhone = cust.phone.replace(/[%,()*:]/g, ' ').trim();
        query = query.ilike('customer_phone', `%${safePhone}%`);
      } else if (cust.name) {
        const safeName = cust.name.replace(/[%,()*:]/g, ' ').trim();
        query = query.ilike('customer_name', `%${safeName}%`);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      if (data) {
        setOrders(data.map(mapOrderRow));
        setTotalRows(count ?? data.length);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load customer orders');
    } finally {
      setIsRefreshing(false);
    }
  };

  const clearCustomerFilter = () => {
    setSelectedCustomer(null);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.delete('customerId');
      params.delete('customerPhone');
      params.delete('customerName');
      const newQs = params.toString();
      const newUrl = window.location.pathname + (newQs ? '?' + newQs : '');
      window.history.replaceState(null, '', newUrl);
    }
    fetchOrdersByDate(dateFilter, customStartDate, customEndDate, 1, rowsPerPage);
  };

  useEffect(() => {
    if (!isInitialized) return;
    const term = searchQuery.trim();
    if (!term) {
      if (selectedCustomer) {
        fetchOrdersForCustomer(selectedCustomer);
      } else {
        fetchOrdersByDate(dateFilter, customStartDate, customEndDate, 1, rowsPerPage);
      }
      return;
    }
    const t = setTimeout(() => {
      searchOrders(term);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, searchQuery]);

  // Sync filters with URL search params and restore from sessionStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const hasUrlParams =
      params.has('timeRange') ||
      params.has('tab') ||
      params.has('search') ||
      params.has('customerId') ||
      params.has('customerPhone') ||
      params.has('customerName') ||
      params.has('startDate') ||
      params.has('endDate') ||
      params.has('page');

    if (hasUrlParams) {
      const timeParam = params.get('timeRange');
      if (timeParam && ['today', 'yesterday', 'tomorrow', 'last7', 'last30', 'custom', 'all'].includes(timeParam)) {
        setDateFilter(timeParam);
      }
      const sDate = params.get('startDate');
      if (sDate) setCustomStartDate(sDate);
      const eDate = params.get('endDate');
      if (eDate) setCustomEndDate(eDate);

      const tabParam = params.get('tab') as 'all' | 'unfulfilled' | 'unpaid' | 'open' | 'archived' | null;
      if (tabParam && ['all', 'unfulfilled', 'unpaid', 'open', 'archived'].includes(tabParam)) {
        setActiveTab(tabParam);
      }

      const qParam = params.get('search');
      if (qParam) {
        setSearchQuery(qParam);
        setIsSearchExpanded(true);
      }

      const pageParam = params.get('page');
      if (pageParam && !isNaN(Number(pageParam))) {
        setCurrentPage(Math.max(1, Number(pageParam)));
      }

      const cId = params.get('customerId') || undefined;
      const cPhone = params.get('customerPhone') || undefined;
      const cName = params.get('customerName') || undefined;
      if (cId || cPhone || cName) {
        const cust: CustomerFilter = { id: cId, phone: cPhone, name: cName };
        setSelectedCustomer(cust);
        fetchOrdersForCustomer(cust);
      }
    } else {
      // Restore from sessionStorage when navigating back or reopening orders
      try {
        const savedRaw = sessionStorage.getItem(ORDERS_FILTER_STORAGE_KEY);
        if (savedRaw) {
          const saved = JSON.parse(savedRaw);
          if (saved.dateFilter && ['today', 'yesterday', 'tomorrow', 'last7', 'last30', 'custom', 'all'].includes(saved.dateFilter)) {
            setDateFilter(saved.dateFilter);
          }
          if (saved.customStartDate) setCustomStartDate(saved.customStartDate);
          if (saved.customEndDate) setCustomEndDate(saved.customEndDate);
          if (saved.activeTab && ['all', 'unfulfilled', 'unpaid', 'open', 'archived'].includes(saved.activeTab)) {
            setActiveTab(saved.activeTab);
          }
          if (saved.searchQuery) {
            setSearchQuery(saved.searchQuery);
            setIsSearchExpanded(true);
          }
          if (saved.selectedCustomer) {
            setSelectedCustomer(saved.selectedCustomer);
            fetchOrdersForCustomer(saved.selectedCustomer);
          }
          if (saved.currentPage && typeof saved.currentPage === 'number') {
            setCurrentPage(saved.currentPage);
          }
        }
      } catch (e) {
        console.error('Failed to parse saved order filters', e);
      }
    }

    const handlePopState = () => {
      const p = new URLSearchParams(window.location.search);
      const timeParam = p.get('timeRange');
      if (timeParam && ['today', 'yesterday', 'tomorrow', 'last7', 'last30', 'custom', 'all'].includes(timeParam)) {
        setDateFilter(timeParam);
      } else {
        setDateFilter('today');
      }
      const tabParam = p.get('tab') as 'all' | 'unfulfilled' | 'unpaid' | 'open' | 'archived' | null;
      if (tabParam && ['all', 'unfulfilled', 'unpaid', 'open', 'archived'].includes(tabParam)) {
        setActiveTab(tabParam);
      } else {
        setActiveTab('all');
      }
      const qParam = p.get('search');
      setSearchQuery(qParam || '');
      const cId = p.get('customerId') || undefined;
      const cPhone = p.get('customerPhone') || undefined;
      const cName = p.get('customerName') || undefined;
      if (cId || cPhone || cName) {
        const cust: CustomerFilter = { id: cId, phone: cPhone, name: cName };
        setSelectedCustomer(cust);
        fetchOrdersForCustomer(cust);
      } else {
        setSelectedCustomer(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    setIsInitialized(true);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Save state to sessionStorage and update URL query params whenever filters change
  useEffect(() => {
    if (!isInitialized || typeof window === 'undefined') return;

    try {
      const stateToSave = {
        dateFilter,
        customStartDate,
        customEndDate,
        activeTab,
        searchQuery,
        selectedCustomer,
        currentPage,
        rowsPerPage,
      };
      sessionStorage.setItem(ORDERS_FILTER_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch {
      // ignore
    }

    const params = new URLSearchParams();
    if (dateFilter && dateFilter !== 'today') {
      params.set('timeRange', dateFilter);
    }
    if (customStartDate) params.set('startDate', customStartDate);
    if (customEndDate) params.set('endDate', customEndDate);
    if (activeTab && activeTab !== 'all') {
      params.set('tab', activeTab);
    }
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }
    if (selectedCustomer?.id) {
      params.set('customerId', selectedCustomer.id);
    }
    if (selectedCustomer?.phone) {
      params.set('customerPhone', selectedCustomer.phone);
    }
    if (selectedCustomer?.name) {
      params.set('customerName', selectedCustomer.name);
    }
    if (currentPage > 1) {
      params.set('page', String(currentPage));
    }

    const newQs = params.toString();
    const newUrl = window.location.pathname + (newQs ? '?' + newQs : '');
    window.history.replaceState(null, '', newUrl);
  }, [
    isInitialized,
    dateFilter,
    customStartDate,
    customEndDate,
    activeTab,
    searchQuery,
    selectedCustomer,
    currentPage,
    rowsPerPage,
  ]);

  // Fetch orders from Supabase with date constraints + tab/status filtering + pagination
  const fetchOrdersByDate = async (
    filter: string,
    startDate?: string,
    endDate?: string,
    page = 1,
    rpp = 50,
    tab = activeTab,
    stFilter = statusFilter
  ) => {
    setIsRefreshing(true);
    try {
      const supabase = createClient();
      const from = (page - 1) * rpp;
      const to = from + rpp - 1;

      let query = supabase
        .from('orders')
        .select('*', { count: 'exact', head: false })
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      // Tab filters on DB level so pagination & counts are exact
      if (tab === 'unfulfilled') {
        query = query
          .in('status', ['pending', 'placed', 'confirmed'])
          .or('fulfillment_status.is.null,fulfillment_status.neq.fulfilled');
      } else if (tab === 'unpaid') {
        query = query
          .neq('payment_status', 'paid')
          .not('status', 'in', '("cancelled","refunded")');
      } else if (tab === 'open') {
        query = query.not('status', 'in', '("delivered","cancelled","refunded")');
      } else if (tab === 'archived') {
        query = query.in('status', ['delivered', 'cancelled', 'refunded']);
      }

      // Status dropdown filter on DB
      if (stFilter && stFilter !== 'all') {
        query = query.eq('status', stFilter);
      }

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
        // Strict date-to-date requirement: do not load all-time orders when dates are missing
        if (!startDate || !endDate) {
          setOrders([]);
          setTotalRows(0);
          setIsRefreshing(false);
          return;
        }
        query = query.gte('created_at', pktStartISOFromYMD(startDate)).lte('created_at', pktEndISOFromYMD(endDate));
      }

      query = query.range(from, to);

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
    if (!isInitialized) return;
    if (selectedCustomer) return;
    if (searchQuery.trim()) return;

    if (dateFilter === 'custom' && (!customStartDate || !customEndDate)) {
      setOrders([]);
      setTotalRows(0);
      return;
    }

    if (isFirstFetch.current) {
      isFirstFetch.current = false;
      fetchOrdersByDate(dateFilter, customStartDate, customEndDate, currentPage, rowsPerPage, activeTab, statusFilter);
    } else {
      setCurrentPage(1);
      fetchOrdersByDate(dateFilter, customStartDate, customEndDate, 1, rowsPerPage, activeTab, statusFilter);
    }
  }, [isInitialized, dateFilter, customStartDate, customEndDate, activeTab, statusFilter]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    if (selectedCustomer || searchQuery.trim()) return;
    fetchOrdersByDate(dateFilter, customStartDate, customEndDate, page, rowsPerPage, activeTab, statusFilter);
  };

  const handleRowsPerPageChange = (newRpp: number) => {
    setRowsPerPage(newRpp);
    setCurrentPage(1);
    if (selectedCustomer || searchQuery.trim()) return;
    fetchOrdersByDate(dateFilter, customStartDate, customEndDate, 1, newRpp, activeTab, statusFilter);
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
            const newOrder = mapOrderRow(payload.new as unknown as OrderRow);
            setOrders(prev => {
              if (prev.some(o => o.id === newOrder.id)) return prev;
              return [newOrder, ...prev];
            });
            playOrderChime();
            toast.info(`New Order received: ${newOrder.order_number}`);
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrder = mapOrderRow(payload.new as unknown as OrderRow);
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
    if (o.deleted_at || (o.status as string) === 'trash' || (o.status as string) === 'deleted') return false;

    if (selectedCustomer) {
      const matchId = selectedCustomer.id && o.customer_id === selectedCustomer.id;
      const cleanFilterPhone = selectedCustomer.phone ? selectedCustomer.phone.replace(/\D/g, '') : '';
      const cleanOrderPhone = o.customer_phone ? o.customer_phone.replace(/\D/g, '') : '';
      const matchPhone = cleanFilterPhone && cleanOrderPhone && (cleanOrderPhone.includes(cleanFilterPhone) || cleanFilterPhone.includes(cleanOrderPhone));
      const matchName = selectedCustomer.name && o.customer_name && o.customer_name.toLowerCase().trim() === selectedCustomer.name.toLowerCase().trim();

      if (!matchId && !matchPhone && !matchName) return false;
    }

    if (activeTab === 'unfulfilled') {
      if (!isOrderUnfulfilled(o)) return false;
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

    // When customer filter, search query, or all-time filter is active, skip date-window filter
    if (selectedCustomer || searchQuery.trim() || dateFilter === 'all') {
      return true;
    }

    const orderTime = new Date(o.created_at).getTime();
    const now = Date.now();
    const DAY = 86400000;

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

  // Cache the active filtered orders in sessionStorage for 0ms order-detail adjacent swapping
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!sortedOrders || sortedOrders.length === 0) return;

    try {
      const orderIds = sortedOrders.map(o => o.id);
      const ordersMap: Record<string, Order> = {};
      // Cache up to 100 orders so sessionStorage remains light (~50-100KB)
      sortedOrders.slice(0, 100).forEach(o => {
        ordersMap[o.id] = o;
      });

      sessionStorage.setItem('admin_active_orders_cache', JSON.stringify({
        orderIds,
        orders: ordersMap,
        timestamp: Date.now(),
      }));
    } catch {
      // ignore storage quota error
    }
  }, [sortedOrders]);

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
    selectedCustomer,
    setSelectedCustomer,
    clearCustomerFilter,
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
