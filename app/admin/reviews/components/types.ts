import { Review } from '@/lib/types';

export type ReviewWithProduct = Review & {
  productName?: string;
  productImage?: string;
  productSlug?: string;
};
