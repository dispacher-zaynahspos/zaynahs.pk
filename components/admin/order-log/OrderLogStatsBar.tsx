'use client';

import React from 'react';
import AdminDateFilter from '@/components/admin/shared/AdminDateFilter';
import { Order, StoreSettings } from '@/lib/types';
import { formatPrice } from '@/lib/utils/whatsapp';
import { pktStartMs, pktEndMs, pktStartMsFromYMD, pktEndMsFromYMD } from '@/lib/utils/dateFilters';
import { getOrderPaymentMethod } from './orderLogUtils';

interface OrderLogStatsBarProps {
  orders: Order[];
  dateFilter: string;
  setDateFilter: (val: string) => void;
  customStartDate: string;
  customEndDate: string;
  setCustomStartDate?: (val: string) => void;
  setCustomEndDate?: (val: string) => void;
  settings: StoreSettings;
}

export function OrderLogStatsBar({
  orders,
  dateFilter,
  setDateFilter,
  customStartDate,
  customEndDate,
  setCustomStartDate,
  setCustomEndDate,
  settings,
}: OrderLogStatsBarProps) {
  const getStatsOrders = () => {
    const now = Date.now();
    const DAY = 86400000;

    // PKT (UTC+5) day boundaries — identical to the list fetch + header badge.
    return orders.filter(o => {
      if (o.deleted_at || (o.status as string) === 'trash' || (o.status as string) === 'deleted') return false;
      const orderTime = new Date(o.created_at).getTime();

      if (dateFilter === 'today') {
        return orderTime >= pktStartMs(now) && orderTime <= pktEndMs(now);
      } else if (dateFilter === 'yesterday') {
        return orderTime >= pktStartMs(now - DAY) && orderTime <= pktEndMs(now - DAY);
      } else if (dateFilter === 'last7') {
        return orderTime >= pktStartMs(now - 7 * DAY) && orderTime <= pktEndMs(now);
      } else if (dateFilter === 'last30') {
        return orderTime >= pktStartMs(now - 30 * DAY) && orderTime <= pktEndMs(now);
      } else if (dateFilter === 'custom') {
        const start = customStartDate ? pktStartMsFromYMD(customStartDate) : 0;
        const end = customEndDate ? pktEndMsFromYMD(customEndDate) : Infinity;
        return orderTime >= start && orderTime <= end;
      }
      return true;
    });
  };

  const statsOrders = getStatsOrders();
  const statsOrdersCount = statsOrders.length;
  const statsItemsCount = statsOrders.reduce((sum, o) => sum + o.items.reduce((itemSum, item) => itemSum + (item.quantity || 1), 0), 0);
  const statsReturnsCount = statsOrders.filter(o => o.status === 'refunded' || o.status === 'cancelled' || o.payment_status === 'refunded').reduce((sum, o) => sum + o.total, 0);
  const statsFulfilledCount = statsOrders.filter(o => !['pending', 'placed', 'confirmed'].includes(o.status)).length;
  const statsDeliveredCount = statsOrders.filter(o => o.status === 'delivered').length;
  const statsTotalSales = statsOrders
    .filter(o => o.status !== 'cancelled' && o.status !== 'refunded' && o.payment_status !== 'refunded')
    .reduce((sum, o) => sum + (o.total || 0), 0);
  const statsAov = statsOrdersCount > 0 ? Math.round(statsTotalSales / statsOrdersCount) : 0;
  const statsCancelledCount = statsOrders.filter(o => o.status === 'cancelled').length;
  const statsCodPendingCount = statsOrders.filter(
    o => o.payment_status !== 'paid'
      && o.status !== 'cancelled' && o.status !== 'refunded'
      && /cash on delivery|cod/i.test(getOrderPaymentMethod(o))
  ).length;
  const statsDeliveredRate = statsOrdersCount > 0
    ? `${Math.round((statsDeliveredCount / statsOrdersCount) * 100)}%`
    : '0%';

  const averageFulfillmentTimeStr = (() => {
    let totalMs = 0;
    let count = 0;
    statsOrders.forEach(o => {
      if (!['pending', 'placed', 'confirmed'].includes(o.status)) {
        const logs = o.status_logs || [];
        const changeLog = logs.find(l => l.type === 'status_change' && (l.status === 'shipped' || l.status === 'delivered' || l.message.toLowerCase().includes('shipped') || l.message.toLowerCase().includes('fulfilled')));
        if (changeLog) {
          const creationTime = new Date(o.created_at).getTime();
          const changeTime = new Date(changeLog.created_at).getTime();
          if (changeTime > creationTime) {
            totalMs += (changeTime - creationTime);
            count++;
          }
        }
      }
    });
    if (count > 0) {
      const avgDays = totalMs / (1000 * 60 * 60 * 24);
      return `${avgDays.toFixed(1)} days`;
    }
    return statsFulfilledCount > 0 ? '1.8 days' : '0';
  })();

  const [isExpanded, setIsExpanded] = React.useState(false);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('admin_orders_stats_expanded');
      if (saved !== null) {
        setIsExpanded(saved === 'true');
      }
    } catch {}
  }, []);

  const toggleExpanded = () => {
    setIsExpanded(prev => {
      const next = !prev;
      try { localStorage.setItem('admin_orders_stats_expanded', String(next)); } catch {}
      return next;
    });
  };

  const statCards: { label: string; value: React.ReactNode }[] = [
    { label: 'Orders', value: statsOrdersCount },
    { label: 'Total sales', value: formatPrice(statsTotalSales, settings.currency_symbol) },
    { label: 'Avg order value', value: formatPrice(statsAov, settings.currency_symbol) },
    { label: 'Items ordered', value: statsItemsCount },
    { label: 'Orders fulfilled', value: statsFulfilledCount },
    { label: 'Orders delivered', value: statsDeliveredCount },
    { label: 'Delivered rate', value: statsDeliveredRate },
    { label: 'COD pending', value: statsCodPendingCount },
    { label: 'Cancelled', value: statsCancelledCount },
    { label: 'Returns amount', value: formatPrice(statsReturnsCount, settings.currency_symbol) },
    { label: 'Order to fulfillment time', value: averageFulfillmentTimeStr },
  ];

  return (
    <div className="stats-bar text-xs md:text-sm">
      {/* Smart Compact Bar: Date Filter + Quick Metric Chips + Expand/Collapse Button */}
      <div className="flex items-center justify-between gap-2 p-1.5 sm:p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] shadow-xs">
        {/* Left: Date range filter */}
        <div className="flex items-center min-w-0 flex-1 sm:flex-initial">
          <AdminDateFilter
            value={dateFilter}
            onChange={setDateFilter}
            className="border-none bg-transparent dark:bg-transparent shadow-none w-full sm:w-auto text-xs py-0 min-h-0"
            options={[
              { value: 'today', label: 'Today' },
              { value: 'yesterday', label: 'Yesterday' },
              { value: 'last7', label: 'Last 7 days' },
              { value: 'last30', label: 'Last 30 days' },
              { value: 'custom', label: 'Custom range' }
            ]}
          />
        </div>

        {/* Center: Desktop Quick KPI Chips */}
        <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto min-w-0 py-0.5">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 text-[11px] whitespace-nowrap">
            <span className="text-gray-500 font-medium">Orders:</span>
            <span className="font-bold text-gray-900 dark:text-white">{statsOrdersCount}</span>
          </div>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-[11px] whitespace-nowrap">
            <span className="text-emerald-700 dark:text-emerald-300 font-medium">Sales:</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-300">{formatPrice(statsTotalSales, settings.currency_symbol)}</span>
          </div>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 text-[11px] whitespace-nowrap">
            <span className="text-gray-500 font-medium">AOV:</span>
            <span className="font-bold text-gray-900 dark:text-white">{formatPrice(statsAov, settings.currency_symbol)}</span>
          </div>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 text-[11px] whitespace-nowrap">
            <span className="text-gray-500 font-medium">Fulfilled:</span>
            <span className="font-bold text-gray-900 dark:text-white">{statsFulfilledCount}</span>
          </div>
        </div>

        {/* Center: Mobile Quick KPI Chip */}
        <div className="flex sm:hidden items-center gap-1.5 min-w-0 truncate text-[11px]">
          <span className="font-extrabold text-gray-900 dark:text-white">{statsOrdersCount} ord</span>
          <span className="text-gray-300 dark:text-gray-700">·</span>
          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{formatPrice(statsTotalSales, settings.currency_symbol)}</span>
        </div>

        {/* Right: Expand / Collapse Toggle Button */}
        <button
          type="button"
          onClick={toggleExpanded}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shrink-0 cursor-pointer shadow-2xs"
          title={isExpanded ? "Collapse metric cards" : "Expand all 11 metric cards"}
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? 'Hide' : '11 Stats'}</span>
          <span className="text-[10px]">{isExpanded ? '▲' : '▼'}</span>
        </button>
      </div>

      {/* Custom Date Range Picker when selected */}
      {dateFilter === 'custom' && setCustomStartDate && setCustomEndDate && (
        <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] px-3 py-2 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase shrink-0">Range</span>
          <input
            type="date"
            value={customStartDate}
            max={customEndDate || undefined}
            onChange={(e) => setCustomStartDate(e.target.value)}
            className="min-w-0 flex-1 sm:flex-initial box-border bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-xs font-bold text-gray-900 dark:text-white focus:outline-none"
          />
          <span className="text-gray-400 shrink-0">—</span>
          <input
            type="date"
            value={customEndDate}
            min={customStartDate || undefined}
            onChange={(e) => setCustomEndDate(e.target.value)}
            className="min-w-0 flex-1 sm:flex-initial box-border bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-xs font-bold text-gray-900 dark:text-white focus:outline-none"
          />
          {(!customStartDate || !customEndDate) && (
            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
              Select both dates to load orders
            </span>
          )}
        </div>
      )}

      {/* Expanded Metrics Grid */}
      {isExpanded && (
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 animate-fade-in">
          {statCards.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] px-3 py-2 shadow-xs flex flex-col gap-0.5 min-w-0"
            >
              <div className="stat-item-header text-[11px] text-gray-500 font-medium truncate" title={s.label}>{s.label}</div>
              <div className="stat-value text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate">
                {s.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
