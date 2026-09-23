'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { Product, ProductImage, ProductVariant, ProductModifier } from '@/lib/types';
import { revalidateProduct, revalidateTagSafe } from '@/lib/revalidate';
import { getProductById } from './queries';

export async function createProductAction(
  product: Omit<Product, 'id' | 'images' | 'variants' | 'modifiers' | 'category' | 'createdAt' | 'updatedAt'>,
  images: Omit<ProductImage, 'id' | 'productId' | 'createdAt'>[] = [],
  variants: Omit<ProductVariant, 'id' | 'productId'>[] = [],
  modifiers: Omit<ProductModifier, 'id' | 'productId'>[] = []
): Promise<Product> {
  try {
    const supabase = supabaseAdmin;

    const { data: prodData, error: prodError } = await supabase
      .from('products')
      .insert({
        name: product.name,
        slug: product.slug,
        description: product.description,
        short_description: product.shortDescription,
        price: product.price,
        compare_price: product.comparePrice ?? null,
        cost: product.cost,
        sku: product.sku,
        category_id: product.categoryId,
        stock: product.stock,
        has_variants: product.hasVariants,
        is_service: product.isService,
        is_featured: product.isFeatured,
        is_active: product.isActive ?? true,
        enable_swatches: product.enableSwatches,
        show_swatches_on_archive: product.showSwatchesOnArchive,
        custom_badge_id: product.customBadgeId || null,
        badge_enabled: product.badgeEnabled ?? true,
        size_guide_id: product.sizeGuideId || null,
        frequently_bought_together_ids: product.frequentlyBoughtTogetherIds || [],
        flash_sale_enabled: product.flashSaleEnabled || false,
        flash_sale_start_date: product.flashSaleStartDate || null,
        flash_sale_end_date: product.flashSaleEndDate || null,
        flash_sale_discount_type: product.flashSaleDiscountType || 'fixed',
        flash_sale_discount_value: product.flashSaleDiscountValue || 0,
        tags: product.tags,
        rating: product.rating,
        reviews_count: product.reviewsCount,
        inventory_threshold: product.inventoryThreshold || 0,
        variation_order: product.variationOrder || null
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
          sort_order: img.sortOrder,
          is_primary: img.isPrimary
        })));
      if (imgError) throw imgError;
    }

    if (product.hasVariants && variants.length > 0) {
      const { error: varError } = await supabase
        .from('product_variants')
        .insert(variants.map(v => ({
          product_id: productId,
          color: v.color,
          size: v.size,
          material: v.material,
          custom_option: v.customOption,
          custom_value: v.customValue,
          color_hex: v.colorHex,
          price: v.price,
          compare_price: v.comparePrice,
          stock: v.stock,
          sku: v.sku,
          image_url: v.imageUrl,
          show_image_swatch: v.showImageSwatch,
          active: v.active,
          sort_order: v.sortOrder,
          inventory_threshold: v.inventoryThreshold || 0
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
          sort_order: m.sortOrder
        })));
      if (modError) throw modError;
    }

    let categoryIdsToInsert = product.productCategories?.map(pc => pc.categoryId) || [];
    if (categoryIdsToInsert.length === 0 && product.categoryId) {
      categoryIdsToInsert.push(product.categoryId);
    }
    if (!categoryIdsToInsert.includes('00000000-0000-4000-8000-000000000099')) {
      categoryIdsToInsert.push('00000000-0000-4000-8000-000000000099');
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
    try {
      await revalidateProduct(updatedProduct.slug);
      revalidateTagSafe('products');
    } catch (revalErr) {
      console.warn('[products] createProductAction revalidation warning:', revalErr);
    }
    return updatedProduct;
  } catch (error) {
    console.error('[products] createProductAction failed:', error);
    throw error;
  }
}

export async function updateProductAction(
  id: string,
  product: Partial<Omit<Product, 'id' | 'images' | 'variants' | 'modifiers' | 'category' | 'createdAt' | 'updatedAt'>>,
  images: Omit<ProductImage, 'id' | 'productId' | 'createdAt'>[] = [],
  variants: Omit<ProductVariant, 'id' | 'productId'>[] = [],
  modifiers: Omit<ProductModifier, 'id' | 'productId'>[] = []
): Promise<Product> {
  try {
    const supabase = supabaseAdmin;

    const updatePayload: Record<string, any> = {};
    if (product.name !== undefined) updatePayload.name = product.name;
    if (product.slug !== undefined) updatePayload.slug = product.slug;
    if (product.description !== undefined) updatePayload.description = product.description;
    if (product.shortDescription !== undefined) updatePayload.short_description = product.shortDescription;
    if (product.price !== undefined) updatePayload.price = product.price;
    updatePayload.compare_price = product.comparePrice ?? null;
    if (product.cost !== undefined) updatePayload.cost = product.cost;
    if (product.sku !== undefined) updatePayload.sku = product.sku;
    if (product.categoryId !== undefined) updatePayload.category_id = product.categoryId;

    if (product.stock !== undefined) updatePayload.stock = product.stock;
    if (product.hasVariants !== undefined) updatePayload.has_variants = product.hasVariants;
    if (product.isService !== undefined) updatePayload.is_service = product.isService;
    if (product.isFeatured !== undefined) updatePayload.is_featured = product.isFeatured;
    if (product.isActive !== undefined) updatePayload.is_active = product.isActive;
    if (product.enableSwatches !== undefined) updatePayload.enable_swatches = product.enableSwatches;
    if (product.showSwatchesOnArchive !== undefined) updatePayload.show_swatches_on_archive = product.showSwatchesOnArchive;
    if (product.customBadgeId !== undefined) updatePayload.custom_badge_id = product.customBadgeId || null;
    if (product.badgeEnabled !== undefined) updatePayload.badge_enabled = product.badgeEnabled;
    if (product.sizeGuideId !== undefined) updatePayload.size_guide_id = product.sizeGuideId || null;
    if (product.frequentlyBoughtTogetherIds !== undefined) updatePayload.frequently_bought_together_ids = product.frequentlyBoughtTogetherIds;
    if (product.flashSaleEnabled !== undefined) updatePayload.flash_sale_enabled = product.flashSaleEnabled;
    if (product.flashSaleStartDate !== undefined) updatePayload.flash_sale_start_date = product.flashSaleStartDate || null;
    if (product.flashSaleEndDate !== undefined) updatePayload.flash_sale_end_date = product.flashSaleEndDate || null;
    if (product.flashSaleDiscountType !== undefined) updatePayload.flash_sale_discount_type = product.flashSaleDiscountType;
    if (product.flashSaleDiscountValue !== undefined) updatePayload.flash_sale_discount_value = product.flashSaleDiscountValue;
    if (product.tags !== undefined) updatePayload.tags = product.tags;
    if (product.rating !== undefined) updatePayload.rating = product.rating;
    if (product.reviewsCount !== undefined) updatePayload.reviews_count = product.reviewsCount;
    if (product.inventoryThreshold !== undefined) updatePayload.inventory_threshold = product.inventoryThreshold;
    if (product.variationOrder !== undefined) updatePayload.variation_order = product.variationOrder;

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
          sort_order: img.sortOrder,
          is_primary: img.isPrimary
        })));
      if (imgInsError) throw imgInsError;
    }

    const { error: varDelError } = await supabase
      .from('product_variants')
      .delete()
      .eq('product_id', id);
    if (varDelError) throw varDelError;

    if ((product.hasVariants ?? true) && variants.length > 0) {
      const { error: varInsError } = await supabase
        .from('product_variants')
        .insert(variants.map(v => ({
          product_id: id,
          color: v.color,
          size: v.size,
          material: v.material,
          custom_option: v.customOption,
          custom_value: v.customValue,
          color_hex: v.colorHex,
          price: v.price,
          compare_price: v.comparePrice,
          stock: v.stock,
          sku: v.sku,
          image_url: v.imageUrl,
          show_image_swatch: v.showImageSwatch,
          active: v.active,
          sort_order: v.sortOrder,
          inventory_threshold: v.inventoryThreshold || 0
        })));
      if (varInsError) throw varInsError;
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
          sort_order: m.sortOrder
        })));
      if (modInsError) throw modInsError;
    }

    let categoryIdsToUpdate = product.productCategories?.map(pc => pc.categoryId) || [];
    if (categoryIdsToUpdate.length === 0 && product.categoryId) {
      categoryIdsToUpdate.push(product.categoryId);
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

    const updatedProduct = await getProductById(id);
    if (!updatedProduct) throw new Error('Product updated but could not be retrieved');
    try {
      await revalidateProduct(updatedProduct.slug);
      revalidateTagSafe('products');
    } catch (revalErr) {
      console.warn('[products] updateProductAction revalidation warning:', revalErr);
    }
    return updatedProduct;
  } catch (error) {
    console.error('[products] updateProductAction failed:', error);
    throw error;
  }
}

export async function updateProductFieldsAction(
  id: string,
  fields: Partial<Product>
): Promise<void> {
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
        console.error('[products] revalidateProduct failed during updateProductFieldsAction:', revalErr);
      }
    }
    revalidateTagSafe('products');
  } catch (error) {
    console.error('[products] updateProductFieldsAction failed:', error);
    throw error;
  }
}

export async function deleteProductAction(id: string): Promise<void> {
  try {
    const supabase = supabaseAdmin;

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
        console.error('[products] revalidateProduct failed during deleteProductAction:', revalErr);
      }
    }
    revalidateTagSafe('products');
  } catch (error) {
    console.error('[products] deleteProductAction failed:', error);
    throw error;
  }
}

export async function updateProductVariantFieldsAction(
  variantId: string,
  fields: Partial<ProductVariant>
): Promise<void> {
  try {
    const supabase = supabaseAdmin;
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
          console.error('[products] revalidateProduct failed during updateProductVariantFieldsAction:', revalErr);
        }
      }
    }
    revalidateTagSafe('products');
  } catch (error) {
    console.error('[products] updateProductVariantFieldsAction failed:', error);
    throw error;
  }
}

function extractErrorMessage(err: unknown, fallback: string): string {
  if (!err) return fallback;
  if (typeof err === 'string' && err.trim().length > 0) return err.trim();
  if (err instanceof Error && err.message && err.message.trim().length > 0) return err.message.trim();
  if (typeof err === 'object') {
    const record = err as Record<string, any>;
    if (typeof record.message === 'string' && record.message.trim().length > 0) return record.message.trim();
    if (typeof record.error_description === 'string' && record.error_description.trim().length > 0) return record.error_description.trim();
    if (typeof record.details === 'string' && record.details.trim().length > 0) return record.details.trim();
    if (typeof record.hint === 'string' && record.hint.trim().length > 0) return record.hint.trim();
    try {
      const json = JSON.stringify(err);
      if (json && json !== '{}') return json;
    } catch {
      // ignore
    }
  }
  return fallback;
}

// Aliases for seamless drop-in backwards compatibility with safeAction call sites
export async function createProductSafe(
  productPayload: any,
  images: any[],
  variants: any[],
  modifiers: any[]
) {
  try {
    const data = await createProductAction(productPayload, images, variants, modifiers);
    return { success: true as const, data, error: null };
  } catch (err: unknown) {
    console.error('[createProductSafe] error:', err);
    return { success: false as const, data: null, error: extractErrorMessage(err, 'Failed to create product') };
  }
}

export async function updateProductSafe(
  productId: string,
  productPayload: any,
  images: any[],
  variants: any[],
  modifiers: any[]
) {
  try {
    const data = await updateProductAction(productId, productPayload, images, variants, modifiers);
    return { success: true as const, data, error: null };
  } catch (err: unknown) {
    console.error('[updateProductSafe] error:', err);
    return { success: false as const, data: null, error: extractErrorMessage(err, 'Failed to update product') };
  }
}

export interface BulkInventoryUpdateItem {
  id: string;
  stock?: number;
  inventoryThreshold?: number;
}

export interface BulkInventoryVariantUpdateItem {
  id: string;
  productId?: string;
  stock?: number;
  inventoryThreshold?: number;
}

export interface BulkInventoryPayload {
  products?: BulkInventoryUpdateItem[];
  variants?: BulkInventoryVariantUpdateItem[];
}

export async function bulkUpdateInventoryAction(payload: BulkInventoryPayload): Promise<void> {
  const supabase = supabaseAdmin;
  const productSlugsToRevalidate = new Set<string>();

  // 1. Update Products
  if (payload.products && payload.products.length > 0) {
    for (const item of payload.products) {
      const updateData: Record<string, number> = {};
      if (item.stock !== undefined) updateData.stock = item.stock;
      if (item.inventoryThreshold !== undefined) updateData.inventory_threshold = item.inventoryThreshold;

      if (Object.keys(updateData).length > 0) {
        const { data: prod } = await supabase
          .from('products')
          .update(updateData)
          .eq('id', item.id)
          .select('slug')
          .single();
        if (prod?.slug) productSlugsToRevalidate.add(prod.slug);
      }
    }
  }

  // 2. Update Variants
  if (payload.variants && payload.variants.length > 0) {
    for (const item of payload.variants) {
      const updateData: Record<string, number> = {};
      if (item.stock !== undefined) updateData.stock = item.stock;
      if (item.inventoryThreshold !== undefined) updateData.inventory_threshold = item.inventoryThreshold;

      if (Object.keys(updateData).length > 0) {
        await supabase
          .from('product_variants')
          .update(updateData)
          .eq('id', item.id);

        if (item.productId) {
          const { data: prod } = await supabase
            .from('products')
            .select('slug')
            .eq('id', item.productId)
            .single();
          if (prod?.slug) productSlugsToRevalidate.add(prod.slug);
        }
      }
    }

    // Recompute total stock on parent products
    const parentProductIds = [...new Set(payload.variants.map(v => v.productId).filter(Boolean))] as string[];
    for (const parentId of parentProductIds) {
      const { data: vars } = await supabase
        .from('product_variants')
        .select('stock')
        .eq('product_id', parentId);
      if (vars) {
        const totalStock = vars.reduce((sum, v) => sum + (v.stock || 0), 0);
        await supabase
          .from('products')
          .update({ stock: totalStock })
          .eq('id', parentId);
      }
    }
  }

  // 3. Revalidate ISR cache
  for (const slug of productSlugsToRevalidate) {
    try {
      await revalidateProduct(slug);
    } catch (err) {
      console.warn('[inventory] Revalidate slug failed:', slug, err);
    }
  }
  revalidateTagSafe('products');
}

