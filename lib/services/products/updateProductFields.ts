import { Product } from '@/lib/types';
import { SHOP_CATEGORY_ID } from '@/lib/config/singleton-ids';
import { revalidateProduct, revalidateTagSafe, revalidateAfterResponse } from '@/lib/revalidate';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { slugify } from '@/lib/utils/slugify';

export const updateProductFields = async (
  id: string,
  fields: Partial<Product>
): Promise<void> => {
  try {
    const supabase = supabaseAdmin;
    const updatePayload: Record<string, any> = {};
    if (fields.name !== undefined) updatePayload.name = fields.name;
    // Write-boundary slug sanitize (SSOT) — never store spaces/caps/pipes.
    if (fields.slug !== undefined) {
      const clean = slugify(fields.slug || '') || slugify(fields.name || '');
      if (clean) updatePayload.slug = clean;
    }
    if (fields.description !== undefined) updatePayload.description = fields.description;
    if (fields.short_description !== undefined) updatePayload.short_description = fields.short_description;
    if (fields.price !== undefined) updatePayload.price = fields.price;
    if (fields.compare_price !== undefined) updatePayload.compare_price = fields.compare_price;
    if (fields.cost !== undefined) updatePayload.cost = fields.cost;
    if (fields.sku !== undefined) updatePayload.sku = fields.sku;
    if (fields.category_id !== undefined) updatePayload.category_id = fields.category_id;
    if (fields.stock !== undefined) updatePayload.stock = fields.stock;
    if (fields.has_variants !== undefined) updatePayload.has_variants = fields.has_variants;
    if (fields.is_service !== undefined) updatePayload.is_service = fields.is_service;
    if (fields.is_featured !== undefined) updatePayload.is_featured = fields.is_featured;
    if (fields.is_active !== undefined) updatePayload.is_active = fields.is_active;
    if (fields.enable_swatches !== undefined) updatePayload.enable_swatches = fields.enable_swatches;
    if (fields.show_swatches_on_archive !== undefined) updatePayload.show_swatches_on_archive = fields.show_swatches_on_archive;
    if (fields.custom_badge_id !== undefined) updatePayload.custom_badge_id = fields.custom_badge_id || null;
    if (fields.badge_enabled !== undefined) updatePayload.badge_enabled = fields.badge_enabled;
    if (fields.size_guide_id !== undefined) updatePayload.size_guide_id = fields.size_guide_id || null;
    if (fields.frequently_bought_together_ids !== undefined) updatePayload.frequently_bought_together_ids = fields.frequently_bought_together_ids;
    if (fields.flash_sale_enabled !== undefined) updatePayload.flash_sale_enabled = fields.flash_sale_enabled;
    if (fields.flash_sale_start_date !== undefined) updatePayload.flash_sale_start_date = fields.flash_sale_start_date || null;
    if (fields.flash_sale_end_date !== undefined) updatePayload.flash_sale_end_date = fields.flash_sale_end_date || null;
    if (fields.flash_sale_discount_type !== undefined) updatePayload.flash_sale_discount_type = fields.flash_sale_discount_type;
    if (fields.flash_sale_discount_value !== undefined) updatePayload.flash_sale_discount_value = fields.flash_sale_discount_value;
    if (fields.tags !== undefined) updatePayload.tags = fields.tags;
    if (fields.rating !== undefined) updatePayload.rating = fields.rating;
    if (fields.reviews_count !== undefined) updatePayload.reviews_count = fields.reviews_count;
    if (fields.inventory_threshold !== undefined) updatePayload.inventory_threshold = fields.inventory_threshold;
    if (fields.sort_order !== undefined) updatePayload.sort_order = fields.sort_order;

    const { data: prodData } = await supabase
      .from('products')
      .select('slug')
      .eq('id', id)
      .maybeSingle();

    const { error } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', id);

    if (error) throw error;

    if (fields.product_categories !== undefined || fields.category_id !== undefined) {
      let categoryIdsToUpdate = fields.product_categories?.map(pc => pc.category_id) || [];
      if (categoryIdsToUpdate.length === 0 && fields.category_id) {
        categoryIdsToUpdate.push(fields.category_id);
      }
      if (!categoryIdsToUpdate.includes(SHOP_CATEGORY_ID)) {
        categoryIdsToUpdate.push(SHOP_CATEGORY_ID);
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
      const slug = prodData.slug;
      revalidateTagSafe('products');
      await revalidateAfterResponse(async () => {
        await revalidateProduct(slug);
      });
    } else {
      revalidateTagSafe('products');
    }
  } catch (error) {
    console.error('[products] updateProductFields failed:', error);
    throw error;
  }
};

