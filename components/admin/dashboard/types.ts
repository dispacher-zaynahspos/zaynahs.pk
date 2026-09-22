import { Order, Product, StoreSettings } from '@/lib/types';

export type DateRange = 'today' | 'last7' | 'last30' | 'thisMonth' | 'all';

export interface DashboardClientProps {
  orders: Order[];
  products: Product[];
  customers: { id: string; name: string; createdAt: string }[];
  settings: StoreSettings;
}
