import { Review } from '@/lib/types';

export interface DBReview {
  id: string;
  product_id?: string | null;
  customer_name: string;
  customer_phone?: string | null;
  customer_email?: string | null;
  rating: number;
  comment?: string | null;
  approved: boolean;
  hidden: boolean;
  is_manual?: boolean;
  screenshot_url?: string | null;
  images?: string[] | null;
  deleted_at?: string | null;
  created_at: string;
}

export const mapReview = (row: DBReview): Review => ({
  id: row.id,
  productId: row.product_id ?? undefined,
  customerName: row.customer_name,
  customerPhone: row.customer_phone || undefined,
  customerEmail: row.customer_email || undefined,
  contact: row.customer_email || row.customer_phone || undefined,
  rating: row.rating,
  comment: row.comment || undefined,
  approved: row.approved ?? false,
  hidden: row.hidden ?? false,
  isManual: row.is_manual ?? false,
  screenshotUrl: row.screenshot_url || undefined,
  images: Array.isArray(row.images) ? row.images.filter(Boolean) : (row.screenshot_url ? [row.screenshot_url] : []),
  deletedAt: row.deleted_at || undefined,
  createdAt: row.created_at
});

export interface GlobalReviewFilters {
  search?: string;
  rating?: number;
  sort?: 'newest' | 'oldest' | 'highest' | 'lowest';
  page?: number;
  limit?: number;
}
