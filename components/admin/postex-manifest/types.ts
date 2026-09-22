import { StoreSettings } from '@/lib/types';

export interface ManifestOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  notes: string;
  total: number;
  items: any[];
}

export interface EditableRow {
  selected: boolean;
  name: string;
  phone: string;
  address: string;
  city: string;
  cod: string;
  kg: string;
  shipmentType: string;
  fragile: string;
  pieces: string;
  remarks: string;
  invoiceDivision: string;
  paymentMethod: string;
  productDetail: string;
}

export interface PostExBookingManifestTableProps {
  orders: ManifestOrder[];
  settings: StoreSettings;
  onGoBack: () => void;
}
