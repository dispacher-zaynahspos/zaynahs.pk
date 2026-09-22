import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

export const staticSupabase = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
  global: { fetch: (url, init) => fetch(url, { ...init, cache: 'no-store' }) }
});

export interface DBProductImage {
  id: string;
  product_id: string;
  url: string;
  alt?: string | null;
  sort_order?: number | null;
  is_primary?: boolean | null;
  size?: number | null;
  mime_type?: string | null;
  created_at: string;
}

export interface DBProductVariant {
  id: string;
  product_id: string;
  color?: string | null;
  size?: string | null;
  material?: string | null;
  custom_option?: string | null;
  custom_value?: string | null;
  color_hex?: string | null;
  price?: string | number | null;
  compare_price?: string | number | null;
  stock?: number | null;
  sku?: string | null;
  image_url?: string | null;
  show_image_swatch?: boolean | null;
  active?: boolean | null;
  sort_order?: number | null;
  inventory_threshold?: number | null;
}

export interface DBProductModifier {
  id: string;
  product_id: string;
  name: string;
  price?: string | number | null;
  active?: boolean | null;
  sort_order?: number | null;
}

export interface DBCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  sort_order?: number | null;
  active?: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface DBProductRow {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  short_description?: string | null;
  price: string | number;
  compare_price?: string | number | null;
  cost?: string | number | null;
  sku?: string | null;
  category_id?: string | null;
  categories?: DBCategory | null;
  stock?: number | null;
  has_variants?: boolean | null;
  is_service?: boolean | null;
  is_featured?: boolean | null;
  is_active?: boolean | null;
  enable_swatches?: boolean | null;
  show_swatches_on_archive?: boolean | null;
  tags?: string[] | null;
  rating?: number | string | null;
  reviews_count?: number | null;
  product_images?: DBProductImage[] | null;
  product_variants?: DBProductVariant[] | null;
  product_modifiers?: DBProductModifier[] | null;
  custom_badge_id?: string | null;
  badge_enabled?: boolean | null;
  badges?: any | null;
  size_guide_id?: string | null;
  size_guides?: any | null;
  frequently_bought_together_ids?: string[] | null;
  flash_sale_enabled?: boolean | null;
  flash_sale_start_date?: string | null;
  flash_sale_end_date?: string | null;
  flash_sale_discount_type?: string | null;
  flash_sale_discount_value?: number | string | null;
  sort_order?: number | null;
  meta_sync_status?: string | null;
  meta_sync_error?: string | null;
  meta_last_synced_at?: string | null;
  inventory_threshold?: number | null;
  variation_order?: string[] | null;
  product_categories?: any[] | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}
