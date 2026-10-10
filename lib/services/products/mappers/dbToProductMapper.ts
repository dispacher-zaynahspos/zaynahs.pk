import { Product, ProductImage, ProductVariant, ProductModifier, Category, ProductCategoryRelation } from '@/lib/types';
import { DBProductRow, DBProductImage, DBProductVariant, DBProductModifier } from './types';

export const mapProduct = (row: DBProductRow): Product => {
  const images: ProductImage[] = (row.product_images ?? []).map((img: DBProductImage) => ({
    id: img.id,
    product_id: img.product_id,
    url: img.url,
    alt: img.alt || undefined,
    sort_order: img.sort_order || 0,
    is_primary: img.is_primary ?? false,
    size: img.size || undefined,
    mime_type: img.mime_type || undefined,
    created_at: img.created_at
  })).sort((a: ProductImage, b: ProductImage) => a.sort_order - b.sort_order)
    .map((img, idx) => ({ ...img, is_primary: idx === 0 }));

  const variants: ProductVariant[] = (row.product_variants ?? []).map((v: DBProductVariant) => ({
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
  })).sort((a: ProductVariant, b: ProductVariant) => a.sort_order - b.sort_order);

  const modifiers: ProductModifier[] = (row.product_modifiers ?? []).map((m: DBProductModifier) => ({
    id: m.id,
    product_id: m.product_id,
    name: m.name,
    price: m.price ? parseFloat(m.price.toString()) : 0,
    active: m.active ?? true,
    sort_order: m.sort_order || 0
  })).sort((a: ProductModifier, b: ProductModifier) => a.sort_order - b.sort_order);

  const category: Category | undefined = row.categories ? {
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

  const product_categories: ProductCategoryRelation[] = (row.product_categories ?? []).map((pc: any) => ({
    product_id: pc.product_id,
    category_id: pc.category_id,
    position: typeof pc.position === 'number' ? pc.position : null,
    category: pc.categories ? {
      id: pc.categories.id,
      name: pc.categories.name,
      slug: pc.categories.slug,
      description: pc.categories.description || undefined,
      image_url: pc.categories.image_url || undefined,
      sort_order: pc.categories.sort_order || 0,
      active: pc.categories.active ?? true,
      created_at: pc.categories.created_at,
      updated_at: pc.categories.updated_at
    } : undefined
  }));

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || undefined,
    short_description: row.short_description || undefined,
    price: row.price ? parseFloat(row.price.toString()) : 0,
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
    custom_badge: row.badges ? {
      id: row.badges.id,
      name: row.badges.name,
      bg_color: row.badges.bg_color,
      text_color: row.badges.text_color
    } : undefined,
    size_guide_id: row.size_guide_id || undefined,
    size_guide: row.size_guides ? {
      id: row.size_guides.id,
      name: row.size_guides.name,
      chart_data: Array.isArray(row.size_guides.chart_data)
        ? row.size_guides.chart_data
        : (Array.isArray((row.size_guides.chart_data as any)?.rows) ? (row.size_guides.chart_data as any).rows : []),
      unit: (row.size_guides as any).unit || (row.size_guides.chart_data as any)?.unit || 'INCHES',
      image_url: row.size_guides.image_url || undefined
    } : undefined,
    frequently_bought_together_ids: row.frequently_bought_together_ids || [],
    flash_sale_enabled: row.flash_sale_enabled ?? false,
    flash_sale_start_date: row.flash_sale_start_date || undefined,
    flash_sale_end_date: row.flash_sale_end_date || undefined,
    flash_sale_discount_type: (row.flash_sale_discount_type as any) || 'fixed',
    flash_sale_discount_value: row.flash_sale_discount_value ? parseFloat(row.flash_sale_discount_value.toString()) : 0,
    tags: row.tags ?? [],
    images,
    variants,
    modifiers,
    rating: row.rating ? parseFloat(row.rating.toString()) : undefined,
    reviews_count: row.reviews_count !== null && row.reviews_count !== undefined ? row.reviews_count : undefined,
    meta_sync_status: row.meta_sync_status as any || 'pending',
    meta_sync_error: row.meta_sync_error || undefined,
    meta_last_synced_at: row.meta_last_synced_at || undefined,
    sort_order: row.sort_order || 0,
    deleted_at: row.deleted_at || undefined,
    inventory_threshold: row.inventory_threshold || 0,
    product_categories,
    variation_order: row.variation_order || undefined,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
};
