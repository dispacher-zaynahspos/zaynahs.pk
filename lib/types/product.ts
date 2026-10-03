import type { Category, ProductCategoryRelation } from './category';

export interface Badge {
  id: string;
  name: string;
  bg_color: string;
  text_color: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt?: string;
  sort_order: number;
  is_primary: boolean;
  size?: number;
  mime_type?: string;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  color?: string;
  size?: string;
  material?: string;
  custom_option?: string;
  custom_value?: string;
  color_hex?: string;          // hex color for solid swatch
  price?: number;
  compare_price?: number;
  stock: number;
  sku?: string;
  image_url?: string;          // image linked to this variant
  show_image_swatch?: boolean;
  active: boolean;
  sort_order: number;
  inventory_threshold?: number;
}

export interface ProductModifier {
  id: string;
  product_id: string;
  name: string;
  price: number;
  active: boolean;
  sort_order: number;
}

export interface SizeGuide {
  id: string;
  name: string;
  chart_data: Array<Record<string, string>>;
  unit?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  compare_price?: number;
  cost?: number;
  sku?: string;
  category_id?: string;
  category?: Category;
  stock: number;
  has_variants: boolean;
  is_service: boolean;
  is_featured: boolean;
  is_active: boolean;
  enable_swatches: boolean;
  show_swatches_on_archive: boolean;
  custom_badge_id?: string;
  badge_enabled?: boolean;
  custom_badge?: Badge;
  tags: string[];
  images: ProductImage[];
  variants: ProductVariant[];
  modifiers: ProductModifier[];
  rating?: number;
  reviews_count?: number;
  size_guide_id?: string;
  size_guide?: SizeGuide;
  frequently_bought_together_ids?: string[];
  flash_sale_enabled?: boolean;
  flash_sale_start_date?: string | null;
  flash_sale_end_date?: string;
  flash_sale_discount_type?: 'percentage' | 'fixed';
  flash_sale_discount_value?: number;
  meta_sync_status?: 'pending' | 'synced' | 'error';
  meta_sync_error?: string | null;
  meta_last_synced_at?: string | null;
  deleted_at?: string | null;
  inventory_threshold?: number;
  sort_order?: number;
  product_categories?: ProductCategoryRelation[];
  variation_order?: string[];
  created_at: string;
  updated_at: string;
}

export interface ExportedImage {
  sort_order: number;
  is_primary: boolean;
  alt?: string;
  title?: string;
  description?: string;
  caption?: string;
  data_url: string;
  mime_type: string;
  original_url: string;
  file_name?: string;
  file_size?: number;
  ai_generated?: boolean;
  ai_enabled?: boolean;
}

export interface ExportedVariant {
  color?: string;
  size?: string;
  material?: string;
  custom_option?: string;
  custom_value?: string;
  color_hex?: string;
  price?: number;
  compare_price?: number;
  stock: number;
  sku?: string;
  image_url?: string;
  image_data_url?: string;
  image_mime_type?: string;
  show_image_swatch?: boolean;
  active: boolean;
  sort_order: number;
  ai_generated?: boolean;
  ai_enabled?: boolean;
}

export interface ExportedModifier {
  name: string;
  price: number;
  active: boolean;
  sort_order: number;
}

export interface ExportedCategoryData {
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  active: boolean;
}

export interface ExportedProduct {
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  compare_price?: number;
  cost?: number;
  sku?: string;
  stock: number;
  has_variants: boolean;
  is_service: boolean;
  is_featured: boolean;
  active: boolean;
  enable_swatches: boolean;
  show_swatches_on_archive: boolean;
  tags: string[];
  category_name?: string;
  category_slug?: string;
  category_data?: ExportedCategoryData;
  categories?: ExportedCategoryData[];
  images: ExportedImage[];
  variants: ExportedVariant[];
  modifiers: ExportedModifier[];
}

export interface ExportBundle {
  version: '1.0';
  exported_at: string;
  store_name: string;
  products: ExportedProduct[];
}

export interface ImportResult {
  success: boolean;
  product_name: string;
  status: 'skipped' | 'overwritten' | 'imported' | 'error';
  error?: string;
}
