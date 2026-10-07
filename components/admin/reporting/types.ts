import { Order, StoreSettings, Product } from '@/lib/types';

export interface ReportingDashboardProps {
  orders: Order[];
  settings: StoreSettings;
  products?: Product[];
}

export type DateRange = 'today' | 'yesterday' | 'last7' | 'last30' | 'thisMonth' | 'lastMonth' | 'all' | 'custom';
export type StatusFilter = 'all' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type ReportTab = 'overview' | 'payments' | 'orders' | 'inventory' | 'cancellations' | 'products';

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
  // New fields
  refundedTotal: number;
  paidTotal: number;
  unpaidTotal: number;
  pendingCount: number;
  confirmedCount: number;
  shippedCount: number;
  deliveredCount: number;
  cancelledCount: number;
  refundedCount: number;
  serviceItemRevenue: number;
  discountGiven: number;
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
  isService: boolean;
  lowStock: boolean;
  sku?: string;
}

export interface PaymentLedgerRow {
  orderId: string;
  orderNumber: string;
  customerName: string;
  total: number;
  paymentStatus: string;
  orderStatus: string;
  refundAmount?: number;
  paymentMethod?: string;
  createdAt: string;
}

export interface CancellationRow {
  orderId: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: 'cancelled' | 'refunded';
  cancelReason?: string;
  refundAmount?: number;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  orderId: string;
  orderNumber: string;
  type: string;
  message: string;
  createdAt: string;
}
