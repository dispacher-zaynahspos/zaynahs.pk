import { Product, ProductImage, ProductVariant, ProductModifier, Category, ProductCategoryRelation } from '@/lib/types';
import { DBProductRow, DBProductImage, DBProductVariant, DBProductModifier } from './types';

export const mapProduct = (row: DBProductRow): Product => {
  const images: ProductImage[] = (row.product_images ?? []).map((img: DBProductImage) => ({
    id: img.id,
    productId: img.product_id,
    url: img.url,
    alt: img.alt || undefined,
    sortOrder: img.sort_order || 0,
    isPrimary: img.is_primary ?? false,
    size: img.size || undefined,
    mimeType: img.mime_type || undefined,
    createdAt: img.created_at
  })).sort((a: ProductImage, b: ProductImage) => a.sortOrder - b.sortOrder)
    .map((img, idx) => ({ ...img, isPrimary: idx === 0 }));

  const variants: ProductVariant[] = (row.product_variants ?? []).map((v: DBProductVariant) => ({
    id: v.id,
    productId: v.product_id,
    color: v.color || undefined,
    size: v.size || undefined,
    material: v.material || undefined,
    customOption: v.custom_option || undefined,
    customValue: v.custom_value || undefined,
    colorHex: v.color_hex || undefined,
    price: v.price ? parseFloat(v.price.toString()) : undefined,
    comparePrice: v.compare_price ? parseFloat(v.compare_price.toString()) : undefined,
    stock: v.stock || 0,
    sku: v.sku || undefined,
    imageUrl: v.image_url || undefined,
    showImageSwatch: v.show_image_swatch ?? false,
    active: v.active ?? true,
    sortOrder: v.sort_order || 0,
    inventoryThreshold: v.inventory_threshold || 0
  })).sort((a: ProductVariant, b: ProductVariant) => a.sortOrder - b.sortOrder);

  const modifiers: ProductModifier[] = (row.product_modifiers ?? []).map((m: DBProductModifier) => ({
    id: m.id,
    productId: m.product_id,
    name: m.name,
    price: m.price ? parseFloat(m.price.toString()) : 0,
    active: m.active ?? true,
    sortOrder: m.sort_order || 0
  })).sort((a: ProductModifier, b: ProductModifier) => a.sortOrder - b.sortOrder);

  const category: Category | undefined = row.categories ? {
    id: row.categories.id,
    name: row.categories.name,
    slug: row.categories.slug,
    description: row.categories.description || undefined,
    imageUrl: row.categories.image_url || undefined,
    sortOrder: row.categories.sort_order || 0,
    active: row.categories.active ?? true,
    createdAt: row.categories.created_at,
    updatedAt: row.categories.updated_at
  } : undefined;

  const productCategories: ProductCategoryRelation[] = (row.product_categories ?? []).map((pc: any) => ({
    productId: pc.product_id,
    categoryId: pc.category_id,
    category: pc.categories ? {
      id: pc.categories.id,
      name: pc.categories.name,
      slug: pc.categories.slug,
      description: pc.categories.description || undefined,
      imageUrl: pc.categories.image_url || undefined,
      sortOrder: pc.categories.sort_order || 0,
      active: pc.categories.active ?? true,
      createdAt: pc.categories.created_at,
      updatedAt: pc.categories.updated_at
    } : undefined
  }));

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || undefined,
    shortDescription: row.short_description || undefined,
    price: row.price ? parseFloat(row.price.toString()) : 0,
    comparePrice: row.compare_price ? parseFloat(row.compare_price.toString()) : undefined,
    cost: row.cost ? parseFloat(row.cost.toString()) : undefined,
    sku: row.sku || undefined,
    categoryId: row.category_id || undefined,
    category,
    stock: row.stock || 0,
    hasVariants: row.has_variants ?? false,
    isService: row.is_service ?? false,
    isFeatured: row.is_featured ?? false,
    isActive: row.is_active ?? true,
    enableSwatches: row.enable_swatches ?? true,
    showSwatchesOnArchive: row.show_swatches_on_archive ?? true,
    customBadgeId: row.custom_badge_id || undefined,
    badgeEnabled: row.badge_enabled ?? true,
    customBadge: row.badges ? {
      id: row.badges.id,
      name: row.badges.name,
      bgColor: row.badges.bg_color,
      textColor: row.badges.text_color
    } : undefined,
    sizeGuideId: row.size_guide_id || undefined,
    sizeGuide: row.size_guides ? {
      id: row.size_guides.id,
      name: row.size_guides.name,
      chart_data: Array.isArray(row.size_guides.chart_data) ? row.size_guides.chart_data : [],
      imageUrl: row.size_guides.image_url || undefined
    } : undefined,
    frequentlyBoughtTogetherIds: row.frequently_bought_together_ids || [],
    flashSaleEnabled: row.flash_sale_enabled ?? false,
    flashSaleStartDate: row.flash_sale_start_date || undefined,
    flashSaleEndDate: row.flash_sale_end_date || undefined,
    flashSaleDiscountType: (row.flash_sale_discount_type as any) || 'fixed',
    flashSaleDiscountValue: row.flash_sale_discount_value ? parseFloat(row.flash_sale_discount_value.toString()) : 0,
    tags: row.tags ?? [],
    images,
    variants,
    modifiers,
    rating: row.rating ? parseFloat(row.rating.toString()) : undefined,
    reviewsCount: row.reviews_count !== null && row.reviews_count !== undefined ? row.reviews_count : undefined,
    meta_sync_status: row.meta_sync_status as any || 'pending',
    meta_sync_error: row.meta_sync_error || undefined,
    meta_last_synced_at: row.meta_last_synced_at || undefined,
    sortOrder: row.sort_order || 0,
    deletedAt: row.deleted_at || undefined,
    inventoryThreshold: row.inventory_threshold || 0,
    productCategories,
    variationOrder: row.variation_order || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};
