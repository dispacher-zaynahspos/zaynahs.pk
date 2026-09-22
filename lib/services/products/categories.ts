import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidateProduct, revalidateTagSafe } from '@/lib/revalidate';
import { staticSupabase } from './mappers';

export const updateProductCategoryRelationFields = async (
  productId: string,
  categoryId: string,
  _fields: Record<string, never>
): Promise<void> => {
  return;
};

export const addProductToCategory = async (
  productId: string,
  categoryId: string
): Promise<void> => {
  try {
    const supabase = staticSupabase;

    const { error: relError } = await supabase
      .from('product_categories')
      .insert({
        product_id: productId,
        category_id: categoryId
      });

    if (relError) throw relError;

    const { data: prodData } = await supabase
      .from('products')
      .select('slug, category_id')
      .eq('id', productId)
      .single();

    if (prodData && !prodData.category_id) {
      await supabase
        .from('products')
        .update({ category_id: categoryId })
        .eq('id', productId);
    }

    if (prodData?.slug) {
      try {
        await revalidateProduct(prodData.slug);
      } catch (revalErr) {
        console.error('[products] revalidateProduct failed during addProductToCategory:', revalErr);
      }
    }
    revalidateTagSafe('products');
    revalidateTagSafe('categories');
  } catch (error) {
    console.error('[products] addProductToCategory failed:', error);
    throw error;
  }
};

export const addProductsToCategory = async (
  productIds: string[],
  categoryId: string
): Promise<void> => {
  try {
    const supabase = staticSupabase;

    const inserts = productIds.map(productId => ({
      product_id: productId,
      category_id: categoryId
    }));

    const { error: relError } = await supabase
      .from('product_categories')
      .insert(inserts);

    if (relError) throw relError;

    const { data: prodData } = await supabase
      .from('products')
      .select('id, slug, category_id')
      .in('id', productIds);

    if (prodData && prodData.length > 0) {
      const nullCatProdIds = prodData.filter(p => !p.category_id).map(p => p.id);
      if (nullCatProdIds.length > 0) {
        await supabase
          .from('products')
          .update({ category_id: categoryId })
          .in('id', nullCatProdIds);
      }

      const revalidatePromises = prodData
        .filter((prod) => prod.slug)
        .map((prod) =>
          revalidateProduct(prod.slug!).catch((e) =>
            console.error(`[products] revalidateProduct failed for ${prod.slug}:`, e)
          )
        );
      await Promise.allSettled(revalidatePromises);
    }

    revalidateTagSafe('products');
    revalidateTagSafe('categories');
  } catch (error) {
    console.error('[products] addProductsToCategory failed:', error);
    throw error;
  }
};

export const removeProductFromCategory = async (
  productId: string,
  categoryId: string
): Promise<void> => {
  try {
    if (categoryId === '00000000-0000-4000-8000-000000000099') return;

    const supabase = staticSupabase;

    const { error: relError } = await supabase
      .from('product_categories')
      .delete()
      .eq('product_id', productId)
      .eq('category_id', categoryId);

    if (relError) throw relError;

    const { data: prodData } = await supabase
      .from('products')
      .select('slug, category_id')
      .eq('id', productId)
      .single();

    if (prodData && prodData.category_id === categoryId) {
      const { data: otherCats } = await supabase
        .from('product_categories')
        .select('category_id')
        .eq('product_id', productId)
        .limit(1);

      const nextCatId = otherCats?.[0]?.category_id || null;

      await supabase
        .from('products')
        .update({ category_id: nextCatId })
        .eq('id', productId);
    }

    if (prodData?.slug) {
      try {
        await revalidateProduct(prodData.slug);
      } catch (revalErr) {
        console.error('[products] revalidateProduct failed during removeProductFromCategory:', revalErr);
      }
    }
    revalidateTagSafe('products');
    revalidateTagSafe('categories');
  } catch (error) {
    console.error('[products] removeProductFromCategory failed:', error);
    throw error;
  }
};

export const removeProductsFromCategory = async (
  productIds: string[],
  categoryId: string
): Promise<void> => {
  try {
    if (categoryId === '00000000-0000-4000-8000-000000000099') return;
    if (!productIds || productIds.length === 0) return;

    const supabase = staticSupabase;

    const { error: relError } = await supabase
      .from('product_categories')
      .delete()
      .eq('category_id', categoryId)
      .in('product_id', productIds);

    if (relError) throw relError;

    const { data: prodData } = await supabase
      .from('products')
      .select('id, slug, category_id')
      .in('id', productIds);

    if (prodData && prodData.length > 0) {
      const primaryCatProdIds = prodData.filter(p => p.category_id === categoryId).map(p => p.id);

      if (primaryCatProdIds.length > 0) {
        await supabase
          .from('products')
          .update({ category_id: null })
          .in('id', primaryCatProdIds);
      }

      const revalidatePromises = prodData
        .filter(prod => prod.slug)
        .map(prod =>
          revalidateProduct(prod.slug!).catch(e =>
            console.error(`[products] revalidateProduct failed for ${prod.slug}:`, e)
          )
        );
      
      Promise.allSettled(revalidatePromises).catch(console.error);
    }

    revalidateTagSafe('products');
    revalidateTagSafe('categories');
  } catch (error) {
    console.error('[products] removeProductsFromCategory failed:', error);
    throw error;
  }
};

export const updateProductSortOrders = async (productIds: string[]): Promise<void> => {
  if (!productIds || productIds.length === 0) return;
  try {
    await Promise.all(
      productIds.map((id, idx) =>
        supabaseAdmin
          .from('products')
          .update({ sort_order: idx + 1 })
          .eq('id', id)
      )
    );
    revalidateTagSafe('products');
  } catch (error) {
    console.error('[products] updateProductSortOrders failed:', error);
    throw error;
  }
};
