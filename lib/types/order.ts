import type { Product, ProductVariant, ProductModifier } from './product';

export interface CartItem {
  id: string;                          // unique cart item id
  product: Product;
  selectedVariant?: ProductVariant;
  selectedModifiers: ProductModifier[];
  quantity: number;
  unitPrice: number;                   // final price (variant price or product price)
  total: number;                       // (unitPrice * quantity) - (discountAmount || 0) + modifiers
  discountAmount?: number;             // Actual subtracted amount
  discountType?: 'percent' | 'fixed';  // Type of discount applied to this item
  discountValue?: number;              // The percentage (e.g. 10) or fixed amount
  addedLater?: boolean;                // true if added by admin after order was placed
}

export interface StatusLogItem {
  id: string;
  type: 'creation' | 'status_change' | 'staff_note' | 'whatsapp_notification' | 'payment';
  message: string;
  status?: string;
  notes?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName?: string;
  customerPhone?: string;
  customerId?: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  discountAmount?: number;
  shippingAmount?: number;
  shippingMethodName?: string;
  discountCode?: string;
  status: 'pending' | 'placed' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded';
  notes?: string;
  staffNotes?: string;
  statusLogs?: StatusLogItem[];
  reviewEmailPending?: boolean;
  deliveredAt?: string;
  trackingNumber?: string;
  courierName?: string;
  trackingUrl?: string;
  cancelReason?: string;
  customerEmail?: string;
  refundAmount?: number;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  cost: number;
  estimatedDays?: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  active: boolean;
  instructions?: string;
  sortOrder: number;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minCartAmount?: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
