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
  items: any[];
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
