import { Product } from '@/lib/types';
import { revalidateProduct, revalidateTagSafe } from '@/lib/revalidate';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const updateProductFields = async (
  id: string,
  fields: Partial<Product>
): Promise<void> => {
  try {
    const supabase = supabaseAdmin;
    const updatePayload: Record<string, any> = {};
    if (fields.name !== undefined) updatePayload.name = fields.name;
    if (fields.slug !== undefined) updatePayload.slug = fields.slug;
    if (fields.description !== undefined) updatePayload.description = fields.description;
    if (fields.shortDescription !== undefined) updatePayload.short_description = fields.shortDescription;
    if (fields.price !== undefined) updatePayload.price = fields.price;
    if (fields.comparePrice !== undefined) updatePayload.compare_price = fields.comparePrice;
    if (fields.cost !== undefined) updatePayload.cost = fields.cost;
    if (fields.sku !== undefined) updatePayload.sku = fields.sku;
    if (fields.categoryId !== undefined) updatePayload.category_id = fields.categoryId;
    if (fields.stock !== undefined) updatePayload.stock = fields.stock;
    if (fields.hasVariants !== undefined) updatePayload.has_variants = fields.hasVariants;
    if (fields.isService !== undefined) updatePayload.is_service = fields.isService;
    if (fields.isFeatured !== undefined) updatePayload.is_featured = fields.isFeatured;
    if (fields.isActive !== undefined) updatePayload.is_active = fields.isActive;
    if (fields.enableSwatches !== undefined) updatePayload.enable_swatches = fields.enableSwatches;
    if (fields.showSwatchesOnArchive !== undefined) updatePayload.show_swatches_on_archive = fields.showSwatchesOnArchive;
    if (fields.customBadgeId !== undefined) updatePayload.custom_badge_id = fields.customBadgeId || null;
    if (fields.badgeEnabled !== undefined) updatePayload.badge_enabled = fields.badgeEnabled;
    if (fields.sizeGuideId !== undefined) updatePayload.size_guide_id = fields.sizeGuideId || null;
    if (fields.frequentlyBoughtTogetherIds !== undefined) updatePayload.frequently_bought_together_ids = fields.frequentlyBoughtTogetherIds;
    if (fields.flashSaleEnabled !== undefined) updatePayload.flash_sale_enabled = fields.flashSaleEnabled;
    if (fields.flashSaleStartDate !== undefined) updatePayload.flash_sale_start_date = fields.flashSaleStartDate || null;
    if (fields.flashSaleEndDate !== undefined) updatePayload.flash_sale_end_date = fields.flashSaleEndDate || null;
    if (fields.flashSaleDiscountType !== undefined) updatePayload.flash_sale_discount_type = fields.flashSaleDiscountType;
    if (fields.flashSaleDiscountValue !== undefined) updatePayload.flash_sale_discount_value = fields.flashSaleDiscountValue;
    if (fields.tags !== undefined) updatePayload.tags = fields.tags;
    if (fields.rating !== undefined) updatePayload.rating = fields.rating;
    if (fields.reviewsCount !== undefined) updatePayload.reviews_count = fields.reviewsCount;
    if (fields.inventoryThreshold !== undefined) updatePayload.inventory_threshold = fields.inventoryThreshold;
    if (fields.sortOrder !== undefined) updatePayload.sort_order = fields.sortOrder;

    const { data: prodData } = await supabase
      .from('products')
      .select('slug')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', id);

    if (error) throw error;

    if (fields.productCategories !== undefined || fields.categoryId !== undefined) {
      let categoryIdsToUpdate = fields.productCategories?.map(pc => pc.categoryId) || [];
      if (categoryIdsToUpdate.length === 0 && fields.categoryId) {
        categoryIdsToUpdate.push(fields.categoryId);
      }
      if (!categoryIdsToUpdate.includes('00000000-0000-4000-8000-000000000099')) {
        categoryIdsToUpdate.push('00000000-0000-4000-8000-000000000099');
      }

      const { error: pcDelError } = await supabase
        .from('product_categories')
        .delete()
        .eq('product_id', id);
      if (pcDelError) throw pcDelError;

      if (categoryIdsToUpdate.length > 0) {
        const { error: pcInsError } = await supabase
          .from('product_categories')
          .insert(categoryIdsToUpdate.map(categoryId => ({
            product_id: id,
            category_id: categoryId
          })));
        if (pcInsError) throw pcInsError;
      }
    }

    if (prodData?.slug) {
      try {
        await revalidateProduct(prodData.slug);
      } catch (revalErr) {
        console.error('[products] revalidateProduct failed during updateProductFields:', revalErr);
      }
    } else {
      revalidateTagSafe('products');
    }
  } catch (error) {
    console.error('[products] updateProductFields failed:', error);
    throw error;
  }
};

