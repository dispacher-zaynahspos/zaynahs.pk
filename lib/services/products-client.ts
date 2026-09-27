import { createClient } from '@/lib/supabase/client';
import { Product } from '@/lib/types';

const mapClientProduct = (row: any): Product => {
  const images = (row.product_images ?? []).map((img: any) => ({
    id: img.id,
    product_id: img.product_id,
    url: img.url,
    alt: img.alt || undefined,
    sort_order: img.sort_order || 0,
    is_primary: img.is_primary ?? false,
    created_at: img.created_at
  })).sort((a: any, b: any) => a.sort_order - b.sort_order);

  const variants = (row.product_variants ?? []).map((v: any) => ({
    id: v.id,
    product_id: v.product_id,
    color: v.color || undefined,
    size: v.size || undefined,
    material: v.material || undefined,
    custom_option: v.custom_option || undefined,
    custom_value: v.custom_value || undefined,
    color_hex: v.color_hex || undefined,
    price: v.price ? parseFloat(v.price.toString()) : undefined,
    compare_price: v.compare_price ? parseFloat(v.compare_price.toString()) : undefined,
    stock: v.stock || 0,
    sku: v.sku || undefined,
    image_url: v.image_url || undefined,
    show_image_swatch: v.show_image_swatch ?? false,
    active: v.active ?? true,
    sort_order: v.sort_order || 0,
    inventory_threshold: v.inventory_threshold || 0
  })).sort((a: any, b: any) => a.sort_order - b.sort_order);

  const category = row.categories ? {
    id: row.categories.id,
    name: row.categories.name,
    slug: row.categories.slug,
    description: row.categories.description || undefined,
    image_url: row.categories.image_url || undefined,
    sort_order: row.categories.sort_order || 0,
    active: row.categories.active ?? true,
    created_at: row.categories.created_at,
    updated_at: row.categories.updated_at
  } : undefined;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || undefined,
    short_description: row.short_description || undefined,
    price: typeof row.price === 'string' ? parseFloat(row.price) : row.price,
    compare_price: row.compare_price ? parseFloat(row.compare_price.toString()) : undefined,
    cost: row.cost ? parseFloat(row.cost.toString()) : undefined,
    sku: row.sku || undefined,
    category_id: row.category_id || undefined,
    category,
    stock: row.stock || 0,
    has_variants: row.has_variants ?? false,
    is_service: row.is_service ?? false,
    is_featured: row.is_featured ?? false,
    is_active: row.is_active ?? true,
    enable_swatches: row.enable_swatches ?? true,
    show_swatches_on_archive: row.show_swatches_on_archive ?? true,
    custom_badge_id: row.custom_badge_id || undefined,
    badge_enabled: row.badge_enabled ?? true,
    tags: row.tags || [],
    images,
    variants,
    modifiers: [],
    rating: row.rating ? parseFloat(row.rating.toString()) : undefined,
    reviews_count: row.reviews_count || 0,
    sort_order: row.sort_order || 0,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
};

export const getProductsClient = async (categoryId?: string): Promise<Product[]> => {
  try {
    const supabase = createClient();
    let query = supabase
      .from('products')
      .select('*, product_images(*), product_variants(*), categories!category_id(*)')
      .is('deleted_at', null)
      .eq('is_active', true);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data ?? []).map(mapClientProduct);
  } catch (error) {
    console.error('[products-client] getProductsClient failed:', error);
    throw error;
  }
};

export const getProductsByIdsClient = async (ids: string[]): Promise<Product[]> => {
  if (!ids || ids.length === 0) return [];
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*), product_variants(*), categories!category_id(*)')
      .is('deleted_at', null)
      .in('id', ids);

    if (error) throw error;
    
    const productsMap = (data ?? []).map(mapClientProduct);
    
    // Maintain requested order of IDs
    return ids
      .map(id => productsMap.find(p => p.id === id))
      .filter((p): p is Product => !!p);
  } catch (error) {
    console.error('[products-client] getProductsByIdsClient failed:', error);
    throw error;
  }
};

export const getDeletedProductsClient = async (): Promise<Product[]> => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*), product_variants(*), categories!category_id(*)')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapClientProduct);
  } catch (error) {
    console.error('[products-client] getDeletedProductsClient failed:', error);
    throw error;
  }
};

export const restoreProductClient = async (id: string): Promise<void> => {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('products')
      .update({ deleted_at: null })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('[products-client] restoreProductClient failed:', error);
    throw error;
  }
};

export const hardDeleteProductClient = async (id: string): Promise<void> => {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('[products-client] hardDeleteProductClient failed:', error);
    throw error;
  }
};
