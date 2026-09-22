'use client';

import React, { useState, useMemo } from 'react';
import { formatPrice } from '@/lib/utils/whatsapp';

import {
  DashboardClientProps,
  DateRange,
  getPeriodBounds,
  getPreviousPeriodBounds,
  filterOrders,
  computeMetrics,
  DashboardMetricsGrid,
  RevenueChartSection,
  StatusBreakdownCard,
  TopProductsSection,
  RecentActivityCard,
  InventorySnapshotCard,
} from './dashboard';

export default function DashboardClient({ orders, products, customers, settings }: DashboardClientProps) {
  const [dateFilter, setDateFilter] = useState<DateRange>('all');

  const now = new Date();

  const currentBounds = useMemo(() => getPeriodBounds(dateFilter, now), [dateFilter]);
  const prevBounds = useMemo(() => getPreviousPeriodBounds(dateFilter, now), [dateFilter]);

  const currentOrders = useMemo(() => filterOrders(orders, currentBounds.start, currentBounds.end), [orders, currentBounds]);
  const prevOrders = useMemo(() => filterOrders(orders, prevBounds.start, prevBounds.end), [orders, prevBounds]);

  const metrics = useMemo(() => computeMetrics(currentOrders), [currentOrders]);
  const prevMetrics = useMemo(() => computeMetrics(prevOrders), [prevOrders]);

  const statusBreakdown = useMemo(() => {
    const statusMap: Record<string, { count: number; sales: number }> = {
      pending: { count: 0, sales: 0 },
      confirmed: { count: 0, sales: 0 },
      shipped: { count: 0, sales: 0 },
      delivered: { count: 0, sales: 0 },
      cancelled: { count: 0, sales: 0 }
    };
    currentOrders.forEach(o => {
      if (statusMap[o.status]) {
        statusMap[o.status].count += 1;
        statusMap[o.status].sales += o.total;
      }
    });
    return Object.entries(statusMap).map(([status, data]) => ({ status, ...data }));
  }, [currentOrders]);

  const topProducts = useMemo(() => {
    const productMap: Record<string, { id: string; name: string; qty: number; sales: number; profit: number; cost: number }> = {};
    const revenueOrders = currentOrders.filter(o => o.status !== 'cancelled' && o.status !== 'refunded');
    revenueOrders.forEach(order => {
      order.items.forEach(item => {
        const pId = item.product.id;
        if (!productMap[pId]) {
          productMap[pId] = { id: pId, name: item.product.name, qty: 0, sales: 0, profit: 0, cost: 0 };
        }
        const cost = item.product.cost ? parseFloat(item.product.cost.toString()) : 0;
        productMap[pId].qty += item.quantity;
        productMap[pId].sales += item.total;
        productMap[pId].cost += cost * item.quantity;
        productMap[pId].profit += item.total - (cost * item.quantity);
      });
    });
    return Object.values(productMap).sort((a, b) => b.sales - a.sales).slice(0, 5);
  }, [currentOrders]);

  const chartData = useMemo(() => {
    const rangeDays = dateFilter === 'today' ? 1 : dateFilter === 'last7' ? 7 : dateFilter === 'last30' ? 30 : dateFilter === 'thisMonth' ? new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() : 365;
    const groupByWeek = rangeDays > 60;
    const groupByMonth = rangeDays > 180;
    const revenueOrders = currentOrders.filter(o => o.status !== 'cancelled' && o.status !== 'refunded');

    const map: Record<string, { label: string; revenue: number; cogs: number; profit: number }> = {};
    revenueOrders.forEach(order => {
      const d = new Date(order.createdAt);
      let key: string;
      if (groupByMonth) {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      } else if (groupByWeek) {
        const startOfWeek = new Date(d);
        startOfWeek.setDate(d.getDate() - d.getDay());
        key = startOfWeek.toLocaleDateString('en-CA');
      } else {
        key = d.toLocaleDateString('en-CA');
      }
      if (!map[key]) map[key] = { label: key, revenue: 0, cogs: 0, profit: 0 };
      map[key].revenue += order.total;
      let orderCogs = 0;
      order.items.forEach(item => {
        const cost = item.product.cost ? parseFloat(item.product.cost.toString()) : 0;
        orderCogs += cost * item.quantity;
      });
      map[key].cogs += orderCogs;
      map[key].profit += order.total - orderCogs;
    });

    return Object.values(map).sort((a, b) => a.label.localeCompare(b.label)).map(d => ({
      ...d,
      label: groupByMonth
        ? (() => { const [y, m] = d.label.split('-'); const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return `${months[parseInt(m)-1]} ${y}`; })()
        : groupByWeek
        ? `Wk ${new Date(d.label + 'T00:00:00').toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}`
        : new Date(d.label + 'T00:00:00').toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })
    }));
  }, [currentOrders, dateFilter]);

  const recentActivity = useMemo(() => {
    const events: { id: string; type: 'order' | 'customer' | 'product'; text: string; time: string }[] = [];
    orders.forEach(o => {
      events.push({
        id: `o-${o.id}`,
        type: 'order',
        text: `${o.orderNumber} placed — ${o.items.length} item${o.items.length !== 1 ? 's' : ''} · ${formatPrice(o.total, settings.currencySymbol)}`,
        time: o.createdAt
      });
    });
    customers.forEach(c => {
      events.push({
        id: `c-${c.id}`,
        type: 'customer',
        text: `${c.name} registered`,
        time: c.createdAt
      });
    });
    products.forEach(p => {
      events.push({
        id: `p-${p.id}`,
        type: 'product',
        text: `"${p.name}" updated`,
        time: p.updatedAt
      });
    });
    return events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);
  }, [orders, customers, products, settings.currencySymbol]);

  const inventorySnapshot = useMemo(() => {
    const active = products.filter(p => p.isActive);
    const totalSKUs = active.length;
    let totalStockUnits = 0;
    let totalCostValue = 0;
    let totalSaleValue = 0;

    active.forEach(p => {
      if (p.variants && p.variants.length > 0) {
        p.variants.forEach(v => {
          const stock = v.stock || 0;
          totalStockUnits += stock;
          totalCostValue += stock * (p.cost || 0);
          totalSaleValue += stock * (v.price || p.price);
        });
      } else {
        const stock = p.stock || 0;
        totalStockUnits += stock;
        totalCostValue += stock * (p.cost || 0);
        totalSaleValue += stock * p.price;
      }
    });

    return { totalSKUs, totalStockUnits, totalCostValue, totalSaleValue };
  }, [products]);

  const filters: { key: DateRange; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'last7', label: '7d' },
    { key: 'last30', label: '30d' },
    { key: 'thisMonth', label: 'Month' },
    { key: 'all', label: 'All Time' },
  ];

  const chartEmpty = chartData.length === 0 || chartData.every(d => d.revenue === 0 && d.cogs === 0 && d.profit === 0);

  return (
    <div className="space-y-6">
      {/* Filter bar - Modern segmented pill container */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Business Performance</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Real-time revenue, margins, and sales metrics</p>
        </div>
        <div className="inline-flex items-center p-1 bg-gray-100/80 dark:bg-[#16162a] border border-gray-200/80 dark:border-gray-800/80 rounded-2xl shadow-xs self-start sm:self-auto overflow-x-auto max-w-full">
          {filters.map(f => {
            const active = dateFilter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setDateFilter(f.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#1a1a2e] text-white dark:bg-[#e94560] shadow-sm scale-[1.02]'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Metric cards */}
      <DashboardMetricsGrid
        metrics={metrics}
        prevMetrics={prevMetrics}
        dateFilter={dateFilter}
        currencySymbol={settings.currencySymbol}
      />

      {/* Chart + Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueChartSection
          chartData={chartData}
          chartEmpty={chartEmpty}
          currencySymbol={settings.currencySymbol}
        />
        <StatusBreakdownCard
          statusBreakdown={statusBreakdown}
          totalOrdersCount={currentOrders.length}
          currencySymbol={settings.currencySymbol}
        />
      </div>

      {/* Top Products + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TopProductsSection
          topProducts={topProducts}
          currencySymbol={settings.currencySymbol}
        />
        <RecentActivityCard
          recentActivity={recentActivity}
        />
      </div>

      {/* Inventory Snapshot Widget */}
      <InventorySnapshotCard
        inventorySnapshot={inventorySnapshot}
        currencySymbol={settings.currencySymbol}
      />
    </div>
  );
}
