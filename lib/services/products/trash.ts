import { Product } from '@/lib/types';
import { revalidateProduct, revalidateTagSafe } from '@/lib/revalidate';
import { staticSupabase, mapProduct } from './mappers';
import { getProductById } from './queries';

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const supabase = staticSupabase;

    const { data: prodData } = await supabase
      .from('products')
      .select('slug')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('products')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    if (prodData?.slug) {
      try {
        await revalidateProduct(prodData.slug);
      } catch (revalErr) {
        console.error('[products] revalidateProduct failed during deleteProduct:', revalErr);
      }
    } else {
      revalidateTagSafe('products');
    }

    try {
      const { syncProductToMeta } = await import('@/lib/meta/syncProduct');
      const fullProduct = await getProductById(id);
      if (fullProduct) {
        syncProductToMeta(fullProduct, 'DELETE').catch((metaErr: any) => {
          console.warn('[products] Meta DELETE sync failed for product:', id, metaErr?.message);
        });
      }
    } catch {
      // Non-blocking
    }
  } catch (error) {
    console.error('[products] deleteProduct failed:', error);
    throw error;
  }
};

export const getDeletedProducts = async (): Promise<Product[]> => {
  try {
    const supabase = staticSupabase;
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*), product_variants(*), product_modifiers(*), categories!category_id(*), product_categories(*, categories(*)), badges(*), size_guides(*)')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapProduct);
  } catch (error) {
    console.error('[products] getDeletedProducts failed:', error);
    throw error;
  }
};

export const restoreProduct = async (id: string): Promise<void> => {
  try {
    const supabase = staticSupabase;

    const { data: prodData } = await supabase
      .from('products')
      .select('slug')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('products')
      .update({ deleted_at: null })
      .eq('id', id);

    if (error) throw error;

    if (prodData?.slug) {
      try {
        await revalidateProduct(prodData.slug);
      } catch (revalErr) {
        console.error('[products] revalidateProduct failed during restoreProduct:', revalErr);
      }
    }
    revalidateTagSafe('products');
  } catch (error) {
    console.error('[products] restoreProduct failed:', error);
    throw error;
  }
};

export const hardDeleteProduct = async (id: string): Promise<void> => {
  try {
    const supabase = staticSupabase;
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidateTagSafe('products');
  } catch (error) {
    console.error('[products] hardDeleteProduct failed:', error);
    throw error;
  }
};

