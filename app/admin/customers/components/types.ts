export interface CustomerRecord {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  ordersCount: number;
  totalSpent: number;
}
