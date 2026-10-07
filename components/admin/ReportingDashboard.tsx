'use client';

import React, { useState, useMemo } from 'react';
import { Order, StoreSettings, Product } from '@/lib/types';
import { Calendar } from '@/components/common/Icons';
import {
  DateRange,
  StatusFilter,
  ReportTab,
  ReportingMetrics,
  TopProduct,
  StatusBreakdownRow,
  InventoryItem,
  PaymentLedgerRow,
  CancellationRow,
  ReportingMetricsGrid,
  RevenueChartSection,
  TopProductsSection,
  StatusBreakdownCard,
  InventoryReportTable,
  PaymentLedger,
  CancellationsRefundsTable,
} from './reporting';

interface ReportingDashboardProps {
  orders: Order[];
  settings: StoreSettings;
  products?: Product[];
  isEmbed?: boolean;
}

const TAB_LABELS: { key: ReportTab; label: string }[] = [
  { key: 'overview',      label: 'Overview' },
  { key: 'payments',      label: 'Payments' },
  { key: 'cancellations', label: 'Cancellations & Refunds' },
  { key: 'inventory',     label: 'Inventory' },
];

export default function ReportingDashboard({ orders, settings, products = [] }: ReportingDashboardProps) {
  const [activeTab, setActiveTab]           = useState<ReportTab>('overview');
  const [dateFilter, setDateFilter]         = useState<DateRange>('last30');
  const [statusFilter, setStatusFilter]     = useState<StatusFilter>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate]   = useState('');

  // ── Date filtering ────────────────────────────────────────────────────
  const getStartOfDay = (d: Date) => { const c = new Date(d); c.setHours(0,0,0,0); return c.getTime(); };
  const getEndOfDay   = (d: Date) => { const c = new Date(d); c.setHours(23,59,59,999); return c.getTime(); };

  const dateFilteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter(o => {
      const t = new Date(o.created_at).getTime();
      if (dateFilter === 'today')     { return t >= getStartOfDay(now) && t <= getEndOfDay(now); }
      if (dateFilter === 'yesterday') { const y = new Date(now); y.setDate(y.getDate()-1); return t >= getStartOfDay(y) && t <= getEndOfDay(y); }
      if (dateFilter === 'last7')     { const d = new Date(now); d.setDate(d.getDate()-7); return t >= getStartOfDay(d); }
      if (dateFilter === 'last30')    { const d = new Date(now); d.setDate(d.getDate()-30); return t >= getStartOfDay(d); }
      if (dateFilter === 'thisMonth') { const s = new Date(now.getFullYear(), now.getMonth(), 1); return t >= getStartOfDay(s); }
      if (dateFilter === 'lastMonth') {
        const s = new Date(now.getFullYear(), now.getMonth()-1, 1);
        const e = new Date(now.getFullYear(), now.getMonth(), 0);
        return t >= getStartOfDay(s) && t <= getEndOfDay(e);
      }
      if (dateFilter === 'custom') {
        const s = customStartDate ? getStartOfDay(new Date(customStartDate)) : 0;
        const e = customEndDate   ? getEndOfDay(new Date(customEndDate))     : Infinity;
        return t >= s && t <= e;
      }
      return true;
    });
  }, [orders, dateFilter, customStartDate, customEndDate]);

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return dateFilteredOrders;
    return dateFilteredOrders.filter(o => o.status === statusFilter);
  }, [dateFilteredOrders, statusFilter]);

  // ── Metrics ───────────────────────────────────────────────────────────
  const metrics: ReportingMetrics = useMemo(() => {
    const fulfilledStatuses = new Set(['shipped', 'out_for_delivery', 'delivered']);
    const revenueOrders  = filteredOrders.filter(o => o.status !== 'cancelled' && o.status !== 'refunded');
    const fulfilledOrders = filteredOrders.filter(o => fulfilledStatuses.has(o.status));

    let totalSales = 0, totalCOGS = 0, totalDeliveryCost = 0, fulfilledSales = 0, fulfilledCOGS = 0;

    revenueOrders.forEach(o => {
      totalSales += o.total;
      totalDeliveryCost += o.shipping_amount || 0;
      o.items.forEach(it => { const c = it.product.cost ? parseFloat(String(it.product.cost)) : 0; totalCOGS += c * it.quantity; });
    });
    fulfilledOrders.forEach(o => {
      fulfilledSales += o.total;
      o.items.forEach(it => { const c = it.product.cost ? parseFloat(String(it.product.cost)) : 0; fulfilledCOGS += c * it.quantity; });
    });

    const totalCancelled = filteredOrders.filter(o => o.status === 'cancelled' || o.status === 'refunded').reduce((s, o) => s + o.total, 0);
    const grossProfit = totalSales - totalCOGS;
    const netProfit   = totalSales - totalCOGS - totalDeliveryCost;
    const orderCount  = revenueOrders.length;
    const projectedCOGS = filteredOrders
      .filter(o => ['pending','placed','confirmed','processing'].includes(o.status))
      .reduce((s, o) => { o.items.forEach(it => { const c = it.product.cost ? parseFloat(String(it.product.cost)) : 0; s += c * it.quantity; }); return s; }, 0);

    const refundedTotal    = filteredOrders.filter(o => o.status === 'refunded').reduce((s, o) => s + o.total, 0);
    const paidTotal        = revenueOrders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + o.total, 0);
    const unpaidTotal      = revenueOrders.filter(o => o.payment_status !== 'paid').reduce((s, o) => s + o.total, 0);
    const countBy          = (st: string) => filteredOrders.filter(o => o.status === st).length;
    const discountGiven    = filteredOrders.reduce((s, o) => s + (o.discount_amount || 0), 0);
    const serviceItemRevenue = revenueOrders.reduce((s, o) =>
      s + o.items.filter(it => it.product?.is_service).reduce((a, it) => a + (it.unit_price || 0) * it.quantity, 0), 0);

    return {
      sales: totalSales, cogs: totalCOGS, deliveryCost: totalDeliveryCost,
      grossProfit, netProfit,
      grossMargin: totalSales > 0 ? (grossProfit / totalSales) * 100 : 0,
      netMargin:   totalSales > 0 ? (netProfit   / totalSales) * 100 : 0,
      count: orderCount, aov: orderCount > 0 ? totalSales / orderCount : 0,
      cancelledTotal: totalCancelled, fulfilledSales, fulfilledCOGS, projectedCOGS,
      refundedTotal, paidTotal, unpaidTotal,
      pendingCount:   countBy('pending'),
      confirmedCount: countBy('confirmed'),
      shippedCount:   countBy('shipped'),
      deliveredCount: countBy('delivered'),
      cancelledCount: countBy('cancelled'),
      refundedCount:  countBy('refunded'),
      serviceItemRevenue, discountGiven,
    };
  }, [filteredOrders]);

  const topProducts: TopProduct[] = useMemo(() => {
    const map: Record<string, TopProduct> = {};
    filteredOrders.filter(o => o.status !== 'cancelled' && o.status !== 'refunded').forEach(o => {
      o.items.forEach(it => {
        const id = it.product.id;
        if (!map[id]) map[id] = { id, name: it.product.name, qty: 0, sales: 0, profit: 0, cost: 0 };
        const c = it.product.cost ? parseFloat(String(it.product.cost)) : 0;
        map[id].qty    += it.quantity;
        map[id].sales  += it.total;
        map[id].cost   += c * it.quantity;
        map[id].profit += it.total - c * it.quantity;
      });
    });
    return Object.values(map).sort((a, b) => b.sales - a.sales).slice(0, 5);
  }, [filteredOrders]);

  const statusBreakdown: StatusBreakdownRow[] = useMemo(() => {
    const sm: Record<string, { count: number; sales: number; cost: number; delivery: number }> = {
      pending: {count:0,sales:0,cost:0,delivery:0}, confirmed: {count:0,sales:0,cost:0,delivery:0},
      shipped:  {count:0,sales:0,cost:0,delivery:0}, delivered: {count:0,sales:0,cost:0,delivery:0},
      cancelled:{count:0,sales:0,cost:0,delivery:0},
    };
    filteredOrders.forEach(o => {
      if (sm[o.status]) {
        sm[o.status].count    += 1;
        sm[o.status].sales    += o.total;
        sm[o.status].delivery += o.shipping_amount || 0;
        o.items.forEach(it => { const c = it.product.cost ? parseFloat(String(it.product.cost)) : 0; sm[o.status].cost += c * it.quantity; });
      }
    });
    return Object.entries(sm).map(([status, data]) => ({ status, ...data }));
  }, [filteredOrders]);

  const chartData = useMemo(() => {
    const dm: Record<string, { day: string; revenue: number; cogs: number; profit: number }> = {};
    filteredOrders.filter(o => o.status !== 'cancelled' && o.status !== 'refunded').forEach(o => {
      const day = new Date(o.created_at).toLocaleDateString('en-CA');
      if (!dm[day]) dm[day] = { day, revenue: 0, cogs: 0, profit: 0 };
      let oc = 0;
      o.items.forEach(it => { const c = it.product.cost ? parseFloat(String(it.product.cost)) : 0; oc += c * it.quantity; });
      dm[day].revenue += o.total; dm[day].cogs += oc; dm[day].profit += o.total - oc;
    });
    return Object.values(dm)
      .sort((a, b) => a.day.localeCompare(b.day))
      .map(({ day, revenue, cogs, profit }) => ({
        label: new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue, cogs, profit,
      }));
  }, [filteredOrders]);

  const inventoryData: InventoryItem[] = useMemo(() =>
    products.filter(p => p.is_active).map(p => {
      const stockUnits = p.variants?.length ? p.variants.reduce((s, v) => s + (v.stock || 0), 0) : (p.stock || 0);
      const costVal    = stockUnits * (p.cost || 0);
      const saleVal    = p.variants?.length
        ? p.variants.reduce((s, v) => s + (v.stock || 0) * (v.price || p.price), 0)
        : (p.stock || 0) * p.price;
      return {
        id: p.id, name: p.name, variants: p.variants?.length || 0, stockUnits,
        costValue: costVal, saleValue: saleVal, potentialProfit: saleVal - costVal,
        isService: p.is_service ?? false,
        lowStock: stockUnits > 0 && (p.inventory_threshold || 0) > 0 && stockUnits <= (p.inventory_threshold || 0),
        sku: p.sku,
      };
    }).sort((a, b) => b.saleValue - a.saleValue),
  [products]);

  // ── Payment Ledger data (derived from filteredOrders, no extra DB call) ──
  const paymentLedgerRows: PaymentLedgerRow[] = useMemo(() =>
    filteredOrders.map(o => ({
      orderId:       o.id,
      orderNumber:   String(o.order_number ?? o.id.slice(0, 8)),
      customerName:  o.customer_name ?? '—',
      total:         o.total,
      paymentStatus: o.payment_status ?? 'unpaid',
      orderStatus:   o.status,
      refundAmount:  o.refund_amount,
      paymentMethod: (() => {
        // Extract from notes or status_logs if present
        const noteLine = (o.notes ?? '').split('\n').find((l: string) => l.toLowerCase().startsWith('payment method:'));
        return noteLine ? noteLine.replace(/payment method:/i, '').trim() : undefined;
      })(),
      createdAt: o.created_at,
    })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  [filteredOrders]);

  // ── Cancellations / Refunds data ─────────────────────────────────────
  const cancellationRows: CancellationRow[] = useMemo(() =>
    filteredOrders
      .filter(o => o.status === 'cancelled' || o.status === 'refunded')
      .map(o => ({
        orderId:      o.id,
        orderNumber:  String(o.order_number ?? o.id.slice(0, 8)),
        customerName: o.customer_name ?? '—',
        total:        o.total,
        status:       o.status as 'cancelled' | 'refunded',
        cancelReason: (o as any).cancel_reason,
        refundAmount: o.refund_amount,
        createdAt:    o.created_at,
      })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  [filteredOrders]);

  const cur = settings.currency_symbol;

  return (
    <div className="space-y-6">
      {/* Header + filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#16162a] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white">Financial &amp; Sales Reporting</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-0.5">Revenue · Payments · Cancellations · Inventory</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)}
            className="text-xs font-bold bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 focus:outline-none text-gray-900 dark:text-white cursor-pointer">
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
            <select value={dateFilter} onChange={e => setDateFilter(e.target.value as DateRange)}
              className="bg-transparent border-0 text-xs font-bold focus:outline-none text-gray-900 dark:text-white cursor-pointer py-1.5">
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

      {/* Custom date pickers */}
      {dateFilter === 'custom' && (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400">Start:</span>
            <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)}
              className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-3 py-1.5 text-xs font-bold text-gray-900 dark:text-white focus:outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400">End:</span>
            <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)}
              className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-3 py-1.5 text-xs font-bold text-gray-900 dark:text-white focus:outline-none" />
          </div>
        </div>
      )}

      {/* ── Tab bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 rounded-2xl p-1 border border-gray-200 dark:border-gray-800 overflow-x-auto">
        {TAB_LABELS.map(({ key, label }) => (
          <button
            key={key}
            id={`report-tab-${key}`}
            onClick={() => setActiveTab(key)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 whitespace-nowrap cursor-pointer
              ${activeTab === key
                ? 'bg-white dark:bg-[#1e1e3a] text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            {label}
            {key === 'cancellations' && cancellationRows.length > 0 && (
              <span className="ml-1.5 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {cancellationRows.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Metrics grid — always visible ───────────────────────────── */}
      <ReportingMetricsGrid metrics={metrics} currencySymbol={cur} />

      {/* ── Tab content ─────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <>
          <RevenueChartSection chartData={chartData} currencySymbol={cur} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <TopProductsSection topProducts={topProducts} currencySymbol={cur} />
            <StatusBreakdownCard statusBreakdown={statusBreakdown} totalOrders={filteredOrders.length} currencySymbol={cur} />
          </div>
        </>
      )}

      {activeTab === 'payments' && (
        <PaymentLedger
          rows={paymentLedgerRows}
          currencySymbol={cur}
          paidTotal={metrics.paidTotal}
          unpaidTotal={metrics.unpaidTotal}
          refundedTotal={metrics.refundedTotal}
        />
      )}

      {activeTab === 'cancellations' && (
        <CancellationsRefundsTable
          rows={cancellationRows}
          currencySymbol={cur}
          cancelledTotal={filteredOrders.filter(o => o.status === 'cancelled').reduce((s, o) => s + o.total, 0)}
          refundedTotal={metrics.refundedTotal}
        />
      )}

      {activeTab === 'inventory' && (
        <InventoryReportTable inventoryData={inventoryData} currencySymbol={cur} />
      )}
    </div>
  );
}
