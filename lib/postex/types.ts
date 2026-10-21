export interface PostExOrderDist {
  trackingNumber: string;
  orderRefNumber?: string;
  transactionStatus?: string;
  orderStatus?: string;
  transactionDate?: string;
  customerName?: string;
  customerPhone?: string;
  cityName?: string;
  deliveryAddress?: string;
  invoicePayment?: number;
  items?: number;
  transactionStatusHistory?: Array<{
    datetime?: string;
    createdDatetime?: string;
    modifiedDatetime?: string;
    transactionStatusMessage?: string;
  }>;
}

export type CleanFulfillmentStatus = 
  | 'PENDING_LOADSHEET'
  | 'BOOKED'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'ACTION_REQUIRED'
  | 'DELIVERED'
  | 'RETURNED'
  | 'CANCELLED';
