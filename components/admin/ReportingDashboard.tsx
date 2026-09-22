'use client';

import React, { useState, useMemo } from 'react';
import { Order, StoreSettings, Product } from '@/lib/types';
import { Calendar } from '@/components/common/Icons';
import {
  DateRange,
  StatusFilter,
  ReportingMetrics,
  TopProduct,
  StatusBreakdownRow,
  InventoryItem,
  ReportingMetricsGrid,
  RevenueChartSection,
  TopProductsSection,
  StatusBreakdownCard,
  InventoryReportTable
} from './reporting';

interface ReportingDashboardProps {
  orders: Order[];
  settings: StoreSettings;
  products?: Product[];
  isEmbed?: boolean;
}

export default function ReportingDashboard({ orders, settings, products = [], isEmbed = false }: ReportingDashboardProps) {
  const [dateFilter, setDateFilter] = useState<DateRange>('last30');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

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

  const dateFilteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter(o => {
      const orderTime = new Date(o.createdAt).getTime();

      if (dateFilter === 'today') {
        const start = getStartOfDay(now);
        const end = getEndOfDay(now);
        return orderTime >= start && orderTime <= end;
      } else if (dateFilter === 'yesterday') {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return orderTime >= getStartOfDay(yesterday) && orderTime <= getEndOfDay(yesterday);
      } else if (dateFilter === 'last7') {
        const d = new Date(now);
        d.setDate(d.getDate() - 7);
        return orderTime >= getStartOfDay(d) && orderTime <= getEndOfDay(now);
      } else if (dateFilter === 'last30') {
        const d = new Date(now);
        d.setDate(d.getDate() - 30);
        return orderTime >= getStartOfDay(d) && orderTime <= getEndOfDay(now);
      } else if (dateFilter === 'thisMonth') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        return orderTime >= getStartOfDay(start) && orderTime <= getEndOfDay(now);
      } else if (dateFilter === 'lastMonth') {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        return orderTime >= getStartOfDay(start) && orderTime <= getEndOfDay(end);
      } else if (dateFilter === 'custom') {
        const start = customStartDate ? getStartOfDay(new Date(customStartDate)) : 0;
        const end = customEndDate ? getEndOfDay(new Date(customEndDate)) : Infinity;
        return orderTime >= start && orderTime <= end;
      }

      return true;
    });
  }, [orders, dateFilter, customStartDate, customEndDate]);

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return dateFilteredOrders;
    return dateFilteredOrders.filter(o => o.status === statusFilter);
  }, [dateFilteredOrders, statusFilter]);

  const metrics: ReportingMetrics = useMemo(() => {
    const fulfilledStatuses = new Set(['shipped', 'out_for_delivery', 'delivered']);
    const revenueOrders = filteredOrders.filter(o => o.status !== 'cancelled' && o.status !== 'refunded');
    const fulfilledOrders = filteredOrders.filter(o => fulfilledStatuses.has(o.status));

    let totalSales = 0;
    let totalCOGS = 0;
    let totalDeliveryCost = 0;
    let fulfilledSales = 0;
    let fulfilledCOGS = 0;

    revenueOrders.forEach(order => {
      totalSales += order.total;
      totalDeliveryCost += order.shippingAmount || 0;
      order.items.forEach(item => {
        const cost = item.product.cost ? parseFloat(item.product.cost.toString()) : 0;
        totalCOGS += cost * item.quantity;
      });
    });

    fulfilledOrders.forEach(order => {
      fulfilledSales += order.total;
      order.items.forEach(item => {
        const cost = item.product.cost ? parseFloat(item.product.cost.toString()) : 0;
        fulfilledCOGS += cost * item.quantity;
      });
    });

    const totalCancelled = filteredOrders.filter(o => o.status === 'cancelled' || o.status === 'refunded')
      .reduce((s, o) => s + o.total, 0);

    const grossProfit = totalSales - totalCOGS;
    const netProfit = totalSales - totalCOGS - totalDeliveryCost;
    const grossMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;
    const netMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;
    const orderCount = revenueOrders.length;
    const aov = orderCount > 0 ? totalSales / orderCount : 0;

    const projectedCOGS = filteredOrders
      .filter(o => o.status === 'pending' || o.status === 'placed' || o.status === 'confirmed' || o.status === 'processing')
      .reduce((s, o) => {
        o.items.forEach(item => {
          const cost = item.product.cost ? parseFloat(item.product.cost.toString()) : 0;
          s += cost * item.quantity;
        });
        return s;
      }, 0);

    return {
      sales: totalSales,
      cogs: totalCOGS,
      deliveryCost: totalDeliveryCost,
      grossProfit,
      netProfit,
      grossMargin,
      netMargin,
      count: orderCount,
      aov,
      cancelledTotal: totalCancelled,
      fulfilledSales,
      fulfilledCOGS,
      projectedCOGS
    };
  }, [filteredOrders]);

  const topProducts: TopProduct[] = useMemo(() => {
    const productMap: Record<string, TopProduct> = {};

    filteredOrders.filter(o => o.status !== 'cancelled' && o.status !== 'refunded').forEach(order => {
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

    return Object.values(productMap)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [filteredOrders]);

  const statusBreakdown: StatusBreakdownRow[] = useMemo(() => {
    const statusMap: Record<string, { count: number; sales: number; cost: number; delivery: number }> = {
      pending: { count: 0, sales: 0, cost: 0, delivery: 0 },
      confirmed: { count: 0, sales: 0, cost: 0, delivery: 0 },
      shipped: { count: 0, sales: 0, cost: 0, delivery: 0 },
      delivered: { count: 0, sales: 0, cost: 0, delivery: 0 },
      cancelled: { count: 0, sales: 0, cost: 0, delivery: 0 }
    };

    filteredOrders.forEach(o => {
      if (statusMap[o.status]) {
        statusMap[o.status].count += 1;
        statusMap[o.status].sales += o.total;
        statusMap[o.status].delivery += o.shippingAmount || 0;
        o.items.forEach(item => {
          const cost = item.product.cost ? parseFloat(item.product.cost.toString()) : 0;
          statusMap[o.status].cost += cost * item.quantity;
        });
      }
    });

    return Object.entries(statusMap).map(([status, data]) => ({ status, ...data }));
  }, [filteredOrders]);

  const chartData = useMemo(() => {
    const dayMap: Record<string, { date: string; revenue: number; cogs: number; profit: number }> = {};

    filteredOrders.filter(o => o.status !== 'cancelled' && o.status !== 'refunded').forEach(order => {
      const day = new Date(order.createdAt).toLocaleDateString('en-CA');
      if (!dayMap[day]) dayMap[day] = { date: day, revenue: 0, cogs: 0, profit: 0 };
      dayMap[day].revenue += order.total;
      let orderCogs = 0;
      order.items.forEach(item => {
        const cost = item.product.cost ? parseFloat(item.product.cost.toString()) : 0;
        orderCogs += cost * item.quantity;
      });
      dayMap[day].cogs += orderCogs;
      dayMap[day].profit += order.total - orderCogs;
    });

    return Object.values(dayMap).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredOrders]);

  const inventoryData: InventoryItem[] = useMemo(() => {
    return products
      .filter(p => p.isActive)
      .map(p => {
        const stockUnits = p.variants && p.variants.length > 0
          ? p.variants.reduce((s, v) => s + (v.stock || 0), 0)
          : (p.stock || 0);
        const costVal = stockUnits * (p.cost || 0);
        const saleVal = stockUnits * p.price;
        return {
          id: p.id,
          name: p.name,
          variants: p.variants?.length || 0,
          stockUnits,
          costValue: costVal,
          saleValue: saleVal,
          potentialProfit: saleVal - costVal
        };
      })
      .filter(i => i.stockUnits > 0)
      .sort((a, b) => b.saleValue - a.saleValue);
  }, [products]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#16162a] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 transition-colors shadow-xs">
        <div>
          {!isEmbed && (
            <>
              <h1 className="text-xl font-black text-gray-900 dark:text-white">Financial & Sales Reporting</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-0.5">Track revenue, costs, profit margins, and inventory</p>
            </>
          )}
          {isEmbed && (
            <div className="text-sm font-bold text-gray-900 dark:text-white">Financial Summary & Performance Report</div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="text-xs font-bold bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 focus:outline-none text-gray-900 dark:text-white cursor-pointer"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>

          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-1.5">
            <Calendar className="h-4 w-4 text-gray-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateRange)}
              className="bg-transparent border-0 text-xs font-bold focus:outline-none text-gray-900 dark:text-white cursor-pointer py-1.5"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last7">Last 7 Days</option>
              <option value="last30">Last 30 Days</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="all">All Time</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>
      </div>

      {dateFilter === 'custom' && (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400">Start:</span>
            <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)}
              className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-3 py-1.5 text-xs font-bold text-gray-900 dark:text-white focus:outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400">End:</span>
            <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)}
              className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-3 py-1.5 text-xs font-bold text-gray-900 dark:text-white focus:outline-none" />
          </div>
        </div>
      )}

      <ReportingMetricsGrid metrics={metrics} currencySymbol={settings.currencySymbol} />

      <RevenueChartSection chartData={chartData} currencySymbol={settings.currencySymbol} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TopProductsSection topProducts={topProducts} currencySymbol={settings.currencySymbol} />
        <StatusBreakdownCard statusBreakdown={statusBreakdown} totalOrders={filteredOrders.length} currencySymbol={settings.currencySymbol} />
      </div>

      <InventoryReportTable inventoryData={inventoryData} currencySymbol={settings.currencySymbol} />
    </div>
  );
}

