'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ShoppingBag, FolderOpen, ClipboardList, TrendingUp, ChevronRight } from '@/components/common/Icons';
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

export default function DashboardClient({ orders, products, categories = [], customers, settings }: DashboardClientProps) {
  const [dateFilter, setDateFilter] = useState<DateRange>('last30');

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
    const revenueOrders = currentOrders.filter(o => !o.deleted_at && o.status !== 'cancelled' && o.status !== 'refunded' && o.payment_status !== 'refunded' && (o.status as string) !== 'trash');
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
    const revenueOrders = currentOrders.filter(o => !o.deleted_at && o.status !== 'cancelled' && o.status !== 'refunded' && o.payment_status !== 'refunded' && (o.status as string) !== 'trash');

    const map: Record<string, { label: string; revenue: number; cogs: number; profit: number }> = {};
    revenueOrders.forEach(order => {
      const d = new Date(order.created_at);
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
      if (o.deleted_at || (o.status as string) === 'trash' || (o.status as string) === 'deleted') return;
      events.push({
        id: `o-${o.id}`,
        type: 'order',
        text: `${o.order_number} placed — ${o.items.length} item${o.items.length !== 1 ? 's' : ''} · ${formatPrice(o.total, settings.currency_symbol)}`,
        time: o.created_at
      });
    });
    customers.forEach(c => {
      if ((c as any).deleted_at) return;
      events.push({
        id: `c-${c.id}`,
        type: 'customer',
        text: `${c.name} registered`,
        time: c.createdAt
      });
    });
    products.forEach(p => {
      if (p.deleted_at) return;
      events.push({
        id: `p-${p.id}`,
        type: 'product',
        text: `"${p.name}" updated`,
        time: p.updated_at
      });
    });
    return events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);
  }, [orders, customers, products, settings.currency_symbol]);

  const inventorySnapshot = useMemo(() => {
    const active = products.filter(p => p.is_active);
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
    { key: 'all', label: 'All' },
  ];

  const filterLabel = useMemo(() => {
    switch (dateFilter) {
      case 'today': return 'Today';
      case 'last7': return 'Last 7 Days';
      case 'last30': return 'Last 30 Days';
      case 'thisMonth': return 'This Month';
      case 'all': return 'All Time';
      default: return '';
    }
  }, [dateFilter]);

  const cleanProductsCount = products.filter(p => !p.deleted_at).length;
  const cleanCategoriesCount = categories.filter(c => !(c as unknown as { deleted_at?: string }).deleted_at).length;
  const filteredSales = metrics.sales;
  const filteredOrdersCount = currentOrders.length;

  const primaryStats = [
    { 
      label: 'Total Products', 
      value: cleanProductsCount.toLocaleString(), 
      icon: ShoppingBag, 
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', 
      glow: 'from-blue-500/15 via-blue-500/5 to-transparent',
      href: '/admin/products' 
    },
    { 
      label: 'Total Categories', 
      value: cleanCategoriesCount.toLocaleString(), 
      icon: FolderOpen, 
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', 
      glow: 'from-amber-500/15 via-amber-500/5 to-transparent',
      href: '/admin/categories' 
    },
    { 
      label: `Orders (${filterLabel})`, 
      value: filteredOrdersCount.toLocaleString(), 
      icon: ClipboardList, 
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', 
      glow: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
      href: '/admin/orders' 
    },
    { 
      label: `Sales (${filterLabel})`, 
      value: formatPrice(filteredSales, settings.currency_symbol), 
      icon: TrendingUp, 
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', 
      glow: 'from-rose-500/15 via-rose-500/5 to-transparent',
      href: '/admin/orders' 
    },
  ];

  const chartEmpty = chartData.length === 0 || chartData.every(d => d.revenue === 0 && d.cogs === 0 && d.profit === 0);

  return (
    <div className="space-y-6">
      {/* Top Filter Bar - Controls the Entire Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Business Performance</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Real-time revenue, margins, and sales metrics ({filterLabel})</p>
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

      {/* 4 Primary Stat Cards - Fully Synchronized with Selected Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {primaryStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link
              key={i}
              href={stat.href}
              className="relative overflow-hidden bg-white dark:bg-[#16162a] p-5 md:p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between group text-gray-900 dark:text-white"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${stat.glow} rounded-bl-full pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity`} />
              
              <div className="space-y-1.5 relative z-10 min-w-0 pr-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  {stat.label}
                  <ChevronRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-gray-400" />
                </span>
                <p className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight truncate">
                  {stat.value}
                </p>
              </div>

              <div className={`relative z-10 h-12 w-12 rounded-2xl border flex items-center justify-center ${stat.color} group-hover:scale-110 group-hover:rotate-3 transition-all duration-200 flex-shrink-0 shadow-xs`}>
                <Icon className="h-6 w-6" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Metric cards */}
      <DashboardMetricsGrid
        metrics={metrics}
        prevMetrics={prevMetrics}
        dateFilter={dateFilter}
        currencySymbol={settings.currency_symbol}
      />

      {/* Chart + Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueChartSection
          chartData={chartData}
          chartEmpty={chartEmpty}
          currencySymbol={settings.currency_symbol}
        />
        <StatusBreakdownCard
          statusBreakdown={statusBreakdown}
          totalOrders={currentOrders.length}
          currencySymbol={settings.currency_symbol}
        />
      </div>

      {/* Top Products + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TopProductsSection
          topProducts={topProducts}
          currencySymbol={settings.currency_symbol}
        />
        <RecentActivityCard
          recentActivity={recentActivity}
        />
      </div>

      {/* Inventory Snapshot Widget */}
      <InventorySnapshotCard
        inventorySnapshot={inventorySnapshot}
        currencySymbol={settings.currency_symbol}
      />
    </div>
  );
}
