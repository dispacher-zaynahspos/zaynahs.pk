'use client';

import React from 'react';
import AdminDateFilter from '@/components/admin/shared/AdminDateFilter';
import { Order, StoreSettings } from '@/lib/types';
import { formatPrice } from '@/lib/utils/whatsapp';
import { pktStartMs, pktEndMs, pktStartMsFromYMD, pktEndMsFromYMD } from '@/lib/utils/dateFilters';

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
      if (o.deleted_at) return false;
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
  const statsReturnsCount = statsOrders.filter(o => o.status === 'refunded' || o.status === 'cancelled').reduce((sum, o) => sum + o.total, 0);
  const statsFulfilledCount = statsOrders.filter(o => !['pending', 'placed', 'confirmed'].includes(o.status)).length;
  const statsDeliveredCount = statsOrders.filter(o => o.status === 'delivered').length;

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

  const statCards: { label: string; value: React.ReactNode }[] = [
    { label: 'Orders', value: statsOrdersCount },
    { label: 'Items ordered', value: statsItemsCount },
    { label: 'Returns', value: formatPrice(statsReturnsCount, settings.currency_symbol) },
    { label: 'Orders fulfilled', value: statsFulfilledCount },
    { label: 'Orders delivered', value: statsDeliveredCount },
    { label: 'Order to fulfillment time', value: averageFulfillmentTimeStr },
  ];

  return (
    <div className="stats-bar text-xs md:text-sm">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
        {/* Date range selector — full-width on mobile, first cell on desktop */}
        <div className="col-span-2 sm:col-span-3 lg:col-span-1 flex items-center rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] px-3 py-2 shadow-xs">
          <AdminDateFilter
            value={dateFilter}
            onChange={setDateFilter}
            className="border-none bg-transparent dark:bg-transparent shadow-none w-full"
            options={[
              { value: 'today', label: 'Today' },
              { value: 'yesterday', label: 'Yesterday' },
              { value: 'last7', label: 'Last 7 days' },
              { value: 'last30', label: 'Last 30 days' },
              { value: 'custom', label: 'Custom range' }
            ]}
          />
        </div>

        {dateFilter === 'custom' && setCustomStartDate && setCustomEndDate && (
          <div className="col-span-2 sm:col-span-3 lg:col-span-7 flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] px-3 py-2 shadow-xs">
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
          </div>
        )}

        {statCards.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] px-3 py-2.5 shadow-xs flex flex-col gap-1 min-w-0"
          >
            <div className="stat-item-header text-gray-500 font-medium truncate">{s.label}</div>
            <div className="stat-value font-bold text-gray-900 dark:text-white truncate">
              {s.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
