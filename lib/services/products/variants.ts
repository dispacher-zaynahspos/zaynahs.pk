import { ProductVariant } from '@/lib/types';
import { revalidateProduct, revalidateTagSafe } from '@/lib/revalidate';
import { staticSupabase } from './mappers';

export const updateProductVariantFields = async (
  variantId: string,
  fields: Partial<ProductVariant>
): Promise<void> => {
  try {
    const supabase = staticSupabase;
    const updatePayload: Record<string, any> = {};
    if (fields.stock !== undefined) updatePayload.stock = fields.stock;
    if (fields.price !== undefined) updatePayload.price = fields.price;
    if (fields.comparePrice !== undefined) updatePayload.compare_price = fields.comparePrice;
    if (fields.inventoryThreshold !== undefined) updatePayload.inventory_threshold = fields.inventoryThreshold;
    if (fields.sku !== undefined) updatePayload.sku = fields.sku;
    if (fields.active !== undefined) updatePayload.active = fields.active;

    const { data: varData } = await supabase
      .from('product_variants')
      .select('product_id')
      .eq('id', variantId)
      .single();

    const { error } = await supabase
      .from('product_variants')
      .update(updatePayload)
      .eq('id', variantId);

    if (error) throw error;

    if (varData?.product_id) {
      const { data: prodData } = await supabase
        .from('products')
        .select('slug')
        .eq('id', varData.product_id)
        .single();

      if (prodData?.slug) {
        try {
          await revalidateProduct(prodData.slug);
        } catch (revalErr) {
          console.error('[products] revalidateProduct failed during updateProductVariantFields:', revalErr);
        }
      }
    }
    revalidateTagSafe('products');
  } catch (error) {
    console.error('[products] updateProductVariantFields failed:', error);
    throw error;
  }
};

