import type { Category, ProductCategoryRelation } from './category';

export interface Badge {
  id: string;
  name: string;
  bgColor: string;
  textColor: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  alt?: string;
  sortOrder: number;
  isPrimary: boolean;
  size?: number;
  mimeType?: string;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  color?: string;
  size?: string;
  material?: string;
  customOption?: string;
  customValue?: string;
  colorHex?: string;          // hex color for solid swatch
  price?: number;
  comparePrice?: number;
  stock: number;
  sku?: string;
  imageUrl?: string;          // image linked to this variant
  showImageSwatch?: boolean;
  active: boolean;
  sortOrder: number;
  inventoryThreshold?: number;
}

export interface ProductModifier {
  id: string;
  productId: string;
  name: string;
  price: number;
  active: boolean;
  sortOrder: number;
}

export interface SizeGuide {
  id: string;
  name: string;
  chart_data: Array<Record<string, string>>;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  cost?: number;
  sku?: string;
  categoryId?: string;
  category?: Category;
  stock: number;
  hasVariants: boolean;
  isService: boolean;
  isFeatured: boolean;
  isActive: boolean;
  enableSwatches: boolean;
  showSwatchesOnArchive: boolean;
  customBadgeId?: string;
  badgeEnabled?: boolean;
  customBadge?: Badge;
  tags: string[];
  images: ProductImage[];
  variants: ProductVariant[];
  modifiers: ProductModifier[];
  rating?: number;
  reviewsCount?: number;
  sizeGuideId?: string;
  sizeGuide?: SizeGuide;
  frequentlyBoughtTogetherIds?: string[];
  flashSaleEnabled?: boolean;
  flashSaleStartDate?: string | null;
  flashSaleEndDate?: string;
  flashSaleDiscountType?: 'percentage' | 'fixed';
  flashSaleDiscountValue?: number;
  meta_sync_status?: 'pending' | 'synced' | 'error';
  meta_sync_error?: string | null;
  meta_last_synced_at?: string | null;
  deletedAt?: string | null;
  inventoryThreshold?: number;
  sortOrder?: number;
  productCategories?: ProductCategoryRelation[];
  variationOrder?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ExportedImage {
  sortOrder: number;
  isPrimary: boolean;
  alt?: string;
  title?: string;
  description?: string;
  caption?: string;
  dataUrl: string;
  mimeType: string;
  originalUrl: string;
  fileName?: string;
  fileSize?: number;
  aiGenerated?: boolean;
  aiEnabled?: boolean;
}

export interface ExportedVariant {
  color?: string;
  size?: string;
  material?: string;
  customOption?: string;
  customValue?: string;
  colorHex?: string;
  price?: number;
  comparePrice?: number;
  stock: number;
  sku?: string;
  imageUrl?: string;
  imageDataUrl?: string;
  imageMimeType?: string;
  showImageSwatch?: boolean;
  active: boolean;
  sortOrder: number;
  aiGenerated?: boolean;
  aiEnabled?: boolean;
}

export interface ExportedModifier {
  name: string;
  price: number;
  active: boolean;
  sortOrder: number;
}

export interface ExportedCategoryData {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  active: boolean;
}

export interface ExportedProduct {
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  cost?: number;
  sku?: string;
  stock: number;
  hasVariants: boolean;
  isService: boolean;
  isFeatured: boolean;
  active: boolean;
  enableSwatches: boolean;
  showSwatchesOnArchive: boolean;
  tags: string[];
  categoryName?: string;
  categorySlug?: string;
  categoryData?: ExportedCategoryData;
  categories?: ExportedCategoryData[];
  images: ExportedImage[];
  variants: ExportedVariant[];
  modifiers: ExportedModifier[];
}

export interface ExportBundle {
  version: '1.0';
  exportedAt: string;
  storeName: string;
  products: ExportedProduct[];
}

export interface ImportResult {
  success: boolean;
  productName: string;
  status: 'skipped' | 'overwritten' | 'imported' | 'error';
  error?: string;
}
