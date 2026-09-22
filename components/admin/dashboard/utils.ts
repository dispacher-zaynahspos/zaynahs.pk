import { Order } from '@/lib/types';
import { DateRange } from './types';

export function getStartOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy.getTime();
}

export function getEndOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(23, 59, 59, 999);
  return copy.getTime();
}

export function getPeriodBounds(filter: DateRange, now: Date): { start: number; end: number } {
  const end = getEndOfDay(now);
  let start: number;
  if (filter === 'today') {
    start = getStartOfDay(now);
  } else if (filter === 'last7') {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    start = getStartOfDay(d);
  } else if (filter === 'last30') {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    start = getStartOfDay(d);
  } else if (filter === 'thisMonth') {
    start = getStartOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
  } else {
    start = 0;
  }
  return { start, end };
}

export function getPreviousPeriodBounds(filter: DateRange, now: Date): { start: number; end: number } {
  const current = getPeriodBounds(filter, now);
  if (current.start === 0) return { start: 0, end: 0 };
  const rangeMs = current.end - current.start;
  return { start: current.start - rangeMs, end: current.start - 1 };
}

export function filterOrders(orders: Order[], start: number, end: number): Order[] {
  if (start === 0 && end === 0) return [];
  return orders.filter(o => {
    const t = new Date(o.createdAt).getTime();
    return t >= start && t <= end;
  });
}

export function computeMetrics(filteredOrders: Order[]) {
  const revenueOrders = filteredOrders.filter(o => o.status !== 'cancelled' && o.status !== 'refunded');
  let totalSales = 0, totalCOGS = 0, totalDeliveryCost = 0;
  revenueOrders.forEach(order => {
    totalSales += order.total;
    totalDeliveryCost += order.shippingAmount || 0;
    order.items.forEach(item => {
      const cost = item.product.cost ? parseFloat(item.product.cost.toString()) : 0;
      totalCOGS += cost * item.quantity;
    });
  });
  const grossProfit = totalSales - totalCOGS;
  const netProfit = totalSales - totalCOGS - totalDeliveryCost;
  return {
    sales: totalSales,
    cogs: totalCOGS,
    deliveryCost: totalDeliveryCost,
    grossProfit,
    netProfit,
    netMargin: totalSales > 0 ? (netProfit / totalSales) * 100 : 0,
    count: revenueOrders.length,
    avgOrderValue: revenueOrders.length > 0 ? totalSales / revenueOrders.length : 0,
    refundedCount: filteredOrders.filter(o => o.status === 'refunded').length,
    cancelledCount: filteredOrders.filter(o => o.status === 'cancelled').length,
    totalOrders: filteredOrders.length,
  };
}

export function pctChange(current: number, previous: number): { pct: number; direction: 'up' | 'down' | 'flat' } {
  if (previous === 0) return { pct: current > 0 ? 100 : 0, direction: current > 0 ? 'up' : 'flat' };
  const pct = ((current - previous) / previous) * 100;
  return { pct: Math.abs(pct), direction: pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat' };
}
