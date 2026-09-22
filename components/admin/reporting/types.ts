import { Order, StoreSettings, Product } from '@/lib/types';

export interface ReportingDashboardProps {
  orders: Order[];
  settings: StoreSettings;
  products?: Product[];
  isEmbed?: boolean;
}

export type DateRange = 'today' | 'yesterday' | 'last7' | 'last30' | 'thisMonth' | 'lastMonth' | 'all' | 'custom';
export type StatusFilter = 'all' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface ReportingMetrics {
  sales: number;
  cogs: number;
  deliveryCost: number;
  grossProfit: number;
  netProfit: number;
  grossMargin: number;
  netMargin: number;
  count: number;
  aov: number;
  cancelledTotal: number;
  fulfilledSales: number;
  fulfilledCOGS: number;
  projectedCOGS: number;
}

export interface TopProduct {
  id: string;
  name: string;
  qty: number;
  sales: number;
  profit: number;
  cost: number;
}

export interface StatusBreakdownRow {
  status: string;
  count: number;
  sales: number;
  cost: number;
  delivery: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  variants: number;
  stockUnits: number;
  costValue: number;
  saleValue: number;
  potentialProfit: number;
}
