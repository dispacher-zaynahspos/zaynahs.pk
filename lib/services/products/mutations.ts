import { Product, ProductImage, ProductVariant, ProductModifier } from '@/lib/types';
import { SHOP_CATEGORY_ID } from '@/lib/config/singleton-ids';
import { revalidateProduct } from '@/lib/revalidate';
import { safeAction } from '@/lib/utils/serverAction';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getProductById } from './queries';

export const createProduct = async (
  product: Omit<Product, 'id' | 'images' | 'variants' | 'modifiers' | 'category' | 'created_at' | 'updated_at'>,
  images: Omit<ProductImage, 'id' | 'product_id' | 'created_at'>[],
  variants: Omit<ProductVariant, 'id' | 'product_id'>[],
  modifiers: Omit<ProductModifier, 'id' | 'product_id'>[]
): Promise<Product> => {
  try {
    const supabase = supabaseAdmin;

    const { data: prodData, error: prodError } = await supabase
      .from('products')
      .insert({
        name: product.name,
        slug: product.slug,
        description: product.description,
        short_description: product.short_description,
        price: product.price,
        compare_price: product.compare_price,
        cost: product.cost,
        sku: product.sku,
        category_id: product.category_id,
        stock: product.stock,
        has_variants: product.has_variants,
        is_service: product.is_service,
        is_featured: product.is_featured,
        is_active: product.is_active ?? true,
        enable_swatches: product.enable_swatches,
        show_swatches_on_archive: product.show_swatches_on_archive,
        custom_badge_id: product.custom_badge_id || null,
        badge_enabled: product.badge_enabled ?? true,
        size_guide_id: product.size_guide_id || null,
        frequently_bought_together_ids: product.frequently_bought_together_ids || [],
        flash_sale_enabled: product.flash_sale_enabled || false,
        flash_sale_start_date: product.flash_sale_start_date || null,
        flash_sale_end_date: product.flash_sale_end_date || null,
        flash_sale_discount_type: product.flash_sale_discount_type || 'fixed',
        flash_sale_discount_value: product.flash_sale_discount_value || 0,
        tags: product.tags,
        rating: product.rating,
        reviews_count: product.reviews_count,
        inventory_threshold: product.inventory_threshold || 0,
        variation_order: product.variation_order || null
      })
      .select('*')
      .single();

    if (prodError) throw prodError;
    const productId = prodData.id;

    if (images.length > 0) {
      const { error: imgError } = await supabase
        .from('product_images')
        .insert(images.map(img => ({
          product_id: productId,
          url: img.url,
          alt: img.alt,
          sort_order: img.sort_order,
          is_primary: img.is_primary
        })));
      if (imgError) throw imgError;
    }

    if (product.has_variants && variants.length > 0) {
      const { error: varError } = await supabase
        .from('product_variants')
        .insert(variants.map(v => ({
          product_id: productId,
          color: v.color,
          size: v.size,
          material: v.material,
          custom_option: v.custom_option,
          custom_value: v.custom_value,
          color_hex: v.color_hex,
          price: v.price,
          compare_price: v.compare_price,
          stock: v.stock,
          sku: v.sku,
          image_url: v.image_url,
          show_image_swatch: v.show_image_swatch,
          active: v.active,
          sort_order: v.sort_order,
          inventory_threshold: v.inventory_threshold || 0
        })));
      if (varError) throw varError;
    }

    if (modifiers.length > 0) {
      const { error: modError } = await supabase
        .from('product_modifiers')
        .insert(modifiers.map(m => ({
          product_id: productId,
          name: m.name,
          price: m.price,
          active: m.active,
          sort_order: m.sort_order
        })));
      if (modError) throw modError;
    }

    let categoryIdsToInsert = product.product_categories?.map(pc => pc.category_id) || [];
    if (categoryIdsToInsert.length === 0 && product.category_id) {
      categoryIdsToInsert.push(product.category_id);
    }
    if (!categoryIdsToInsert.includes(SHOP_CATEGORY_ID)) {
      categoryIdsToInsert.push(SHOP_CATEGORY_ID);
    }

    const { error: pcInsErr } = await supabase
      .from('product_categories')
      .insert(categoryIdsToInsert.map(categoryId => ({
        product_id: productId,
        category_id: categoryId
      })));
    if (pcInsErr) throw pcInsErr;

    const updatedProduct = await getProductById(productId);
    if (!updatedProduct) throw new Error('Product created but could not be retrieved');
    await revalidateProduct(updatedProduct.slug);
    return updatedProduct;
  } catch (error) {
    console.error('[products] createProduct failed:', error);
    throw error;
  }
};

export const updateProduct = async (
  id: string,
  product: Partial<Omit<Product, 'id' | 'images' | 'variants' | 'modifiers' | 'category' | 'created_at' | 'updated_at'>>,
  images: Omit<ProductImage, 'id' | 'product_id' | 'created_at'>[],
  variants: Omit<ProductVariant, 'id' | 'product_id'>[],
  modifiers: Omit<ProductModifier, 'id' | 'product_id'>[]
): Promise<Product> => {
  try {
    const supabase = supabaseAdmin;

    const updatePayload: Record<string, any> = {};
    if (product.name !== undefined) updatePayload.name = product.name;
    if (product.slug !== undefined) updatePayload.slug = product.slug;
    if (product.description !== undefined) updatePayload.description = product.description;
    if (product.short_description !== undefined) updatePayload.short_description = product.short_description;
    if (product.price !== undefined) updatePayload.price = product.price;
    updatePayload.compare_price = product.compare_price ?? null;
    if (product.cost !== undefined) updatePayload.cost = product.cost;
    if (product.sku !== undefined) updatePayload.sku = product.sku;
    if (product.category_id !== undefined) updatePayload.category_id = product.category_id;

    if (product.stock !== undefined) updatePayload.stock = product.stock;
    if (product.has_variants !== undefined) updatePayload.has_variants = product.has_variants;
    if (product.is_service !== undefined) updatePayload.is_service = product.is_service;
    if (product.is_featured !== undefined) updatePayload.is_featured = product.is_featured;
    if (product.is_active !== undefined) updatePayload.is_active = product.is_active;
    if (product.enable_swatches !== undefined) updatePayload.enable_swatches = product.enable_swatches;
    if (product.show_swatches_on_archive !== undefined) updatePayload.show_swatches_on_archive = product.show_swatches_on_archive;
    if (product.custom_badge_id !== undefined) updatePayload.custom_badge_id = product.custom_badge_id || null;
    if (product.badge_enabled !== undefined) updatePayload.badge_enabled = product.badge_enabled;
    if (product.size_guide_id !== undefined) updatePayload.size_guide_id = product.size_guide_id || null;
    if (product.frequently_bought_together_ids !== undefined) updatePayload.frequently_bought_together_ids = product.frequently_bought_together_ids;
    if (product.flash_sale_enabled !== undefined) updatePayload.flash_sale_enabled = product.flash_sale_enabled;
    if (product.flash_sale_start_date !== undefined) updatePayload.flash_sale_start_date = product.flash_sale_start_date || null;
    if (product.flash_sale_end_date !== undefined) updatePayload.flash_sale_end_date = product.flash_sale_end_date || null;
    if (product.flash_sale_discount_type !== undefined) updatePayload.flash_sale_discount_type = product.flash_sale_discount_type;
    if (product.flash_sale_discount_value !== undefined) updatePayload.flash_sale_discount_value = product.flash_sale_discount_value;
    if (product.tags !== undefined) updatePayload.tags = product.tags;
    if (product.rating !== undefined) updatePayload.rating = product.rating;
    if (product.reviews_count !== undefined) updatePayload.reviews_count = product.reviews_count;
    if (product.inventory_threshold !== undefined) updatePayload.inventory_threshold = product.inventory_threshold;
    if (product.variation_order !== undefined) updatePayload.variation_order = product.variation_order;

    const { error: prodError } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', id);

    if (prodError) throw prodError;

    const { error: imgDelError } = await supabase
      .from('product_images')
      .delete()
      .eq('product_id', id);
    if (imgDelError) throw imgDelError;

    if (images.length > 0) {
      const { error: imgInsError } = await supabase
        .from('product_images')
        .insert(images.map(img => ({
          product_id: id,
          url: img.url,
          alt: img.alt,
          sort_order: img.sort_order,
          is_primary: img.is_primary
        })));
      if (imgInsError) throw imgInsError;
    }

    // Only delete/replace variants if hasVariants is explicitly false (switching to simple product)
    // or if new valid variants are being inserted.
    // If hasVariants is true and variants is empty, do NOT delete existing variants to prevent data loss!
    const shouldManageVariants = product.has_variants === false || (variants && variants.length > 0);

    if (shouldManageVariants) {
      const { error: varDelError } = await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', id);
      if (varDelError) throw varDelError;

      if ((product.has_variants ?? true) && variants.length > 0) {
        const { error: varInsError } = await supabase
          .from('product_variants')
          .insert(variants.map(v => ({
            product_id: id,
            color: v.color,
            size: v.size,
            material: v.material,
            custom_option: v.custom_option,
            custom_value: v.custom_value,
            color_hex: v.color_hex,
            price: v.price,
            compare_price: v.compare_price,
            stock: v.stock,
            sku: v.sku,
            image_url: v.image_url,
            show_image_swatch: v.show_image_swatch,
            active: v.active,
            sort_order: v.sort_order,
            inventory_threshold: v.inventory_threshold || 0
          })));
        if (varInsError) throw varInsError;
      }
    }

    const { error: modDelError } = await supabase
      .from('product_modifiers')
      .delete()
      .eq('product_id', id);
    if (modDelError) throw modDelError;

    if (modifiers.length > 0) {
      const { error: modInsError } = await supabase
        .from('product_modifiers')
        .insert(modifiers.map(m => ({
          product_id: id,
          name: m.name,
          price: m.price,
          active: m.active,
          sort_order: m.sort_order
        })));
      if (modInsError) throw modInsError;
    }

    let categoryIdsToUpdate = product.product_categories?.map(pc => pc.category_id) || [];
    if (categoryIdsToUpdate.length === 0 && product.category_id) {
      categoryIdsToUpdate.push(product.category_id);
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

    const updatedProduct = await getProductById(id);
    if (!updatedProduct) throw new Error('Product updated but could not be retrieved');
    await revalidateProduct(updatedProduct.slug);
    return updatedProduct;
  } catch (error) {
    console.error('[products] updateProduct failed:', error);
    throw error;
  }
};

export { updateProductFields } from './updateProductFields';

export const createProductSafe = async (
  productPayload: any,
  images: any[],
  variants: any[],
  modifiers: any[]
) => safeAction(createProduct(productPayload, images, variants, modifiers));

export const updateProductSafe = async (
  productId: string,
  productPayload: any,
  images: any[],
  variants: any[],
  modifiers: any[]
) => safeAction(updateProduct(productId, productPayload, images, variants, modifiers));
