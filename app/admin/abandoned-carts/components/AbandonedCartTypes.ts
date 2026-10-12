export interface AbandonedCartItem {
  product?: {
    name?: string;
    price?: number;
    images?: Array<{ url?: string }>;
  };
  productName?: string;
  name?: string;
  quantity?: number;
  price?: number;
  unit_price?: number;
  total?: number;
  selected_variant?: { color?: string; size?: string; material?: string } | null;
  selectedVariant?: { color?: string; size?: string; material?: string } | null;
  [key: string]: unknown;
}

export interface AbandonedCart {
  id: string;
  sessionId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCity?: string;
  customerApartment?: string;
  customerPostalCode?: string;
  items: AbandonedCartItem[];
  subtotal: number;
  currency: string;
  emailSent: boolean;
  emailSentAt?: string;
  orderPlaced: boolean;
  orderId?: string;
  recoveredAt?: string;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
}
