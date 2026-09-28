import type { Product, ProductVariant, ProductModifier } from './product';

export interface CartItem {
  id: string;                          // unique cart item id
  product: Product;
  selected_variant?: ProductVariant;
  selected_modifiers: ProductModifier[];
  quantity: number;
  unit_price: number;                   // final price (variant price or product price)
  total: number;                       // (unitPrice * quantity) - (discountAmount || 0) + modifiers
  discount_amount?: number;             // Actual subtracted amount
  discount_type?: 'percent' | 'fixed';  // Type of discount applied to this item
  discount_value?: number;              // The percentage (e.g. 10) or fixed amount
  added_later?: boolean;                // true if added by admin after order was placed
}

export interface StatusLogItem {
  id: string;
  type: 'creation' | 'status_change' | 'staff_note' | 'whatsapp_notification' | 'payment' | 'fulfillment';
  message: string;
  status?: string;
  notes?: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name?: string;
  customer_phone?: string;
  customer_id?: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  discount_amount?: number;
  shipping_amount?: number;
  shipping_method_name?: string;
  discount_code?: string;
  status: 'pending' | 'placed' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded';
  payment_status?: 'unpaid' | 'paid' | 'refunded';
  fulfillment_status?: 'unfulfilled' | 'fulfilled';
  tags?: string[];
  notes?: string;
  staff_notes?: string;
  status_logs?: StatusLogItem[];
  review_email_pending?: boolean;
  delivered_at?: string;
  tracking_number?: string;
  courier_name?: string;
  tracking_url?: string;
  cancel_reason?: string;
  customer_email?: string;
  refund_amount?: number;
  access_token?: string;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ShippingZone {
  id: string;
  name: string;
  cities: string[];
  cost: number;
  free_threshold?: number | null;
  estimated_days?: string;
  is_default: boolean;
  active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  cost: number;
  estimated_days?: string;
  active: boolean;
  sort_order: number;
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  active: boolean;
  instructions?: string;
  sort_order: number;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  value: number;
  min_cart_amount?: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}
