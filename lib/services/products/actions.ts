'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { Product, ProductImage, ProductVariant, ProductModifier } from '@/lib/types';
import { revalidateProduct, revalidateTagSafe, revalidateAfterResponse, revalidateStorefrontEdge } from '@/lib/revalidate';
import { SHOP_CATEGORY_ID } from '@/lib/config/singleton-ids';
import { getProductById } from './queries';
import { slugify } from '@/lib/utils/slugify';

/**
 * RULE D13/SEO — canonical slug WRITE-BOUNDARY sanitizer (SSOT).
 * Every product slug that reaches the DB MUST be clean, lowercase, hyphenated,
 * URL-safe (no spaces, capitals, pipes, or special chars). No matter what a
 * caller passes (raw product name, AI output, pasted title, legacy value), the
 * stored slug is always run through `slugify`. If the result is empty, we derive
 * it from the product name; the id-based fallback guarantees non-empty + unique.
 * This is the single place slug cleaning happens — never trust the caller.
 */
function cleanProductSlug(rawSlug?: string | null, name?: string | null, idSeed?: string): string {
  const fromSlug = slugify(rawSlug || '');
  if (fromSlug) return fromSlug;
  const fromName = slugify(name || '');
  if (fromName) return fromName;
  // Last-resort deterministic fallback so NOT NULL/UNIQUE never fails.
  return `product-${(idSeed || Date.now().toString(36)).replace(/[^a-z0-9]/gi, '').toLowerCase()}`;
}


/**
 * RULE D15 — compensating rollback for a failed `createProductAction`.
 * Deletes the just-created product row and every child row so a mid-write failure
 * can never leave a partial/half-saved brand-new product.
 */
async function rollbackCreatedProduct(
  supabase: typeof supabaseAdmin,
  productId: string,
): Promise<void> {
  try {
    const childTables = ['product_images', 'product_variants', 'product_modifiers', 'product_categories'] as const;
    for (const table of childTables) {
      await supabase.from(table).delete().eq('product_id', productId);
    }
    await supabase.from('products').delete().eq('id', productId);
    console.warn(`[products] createProductAction: rolled back partially-created product ${productId} after a write failure (RULE D15).`);
  } catch (rollbackErr) {
    console.error(`[products] CRITICAL: rollback FAILED for partially-created product ${productId}. Manual cleanup needed:`, rollbackErr);
  }
}

export async function createProductAction(
  product: Omit<Product, 'id' | 'images' | 'variants' | 'modifiers' | 'category' | 'created_at' | 'updated_at'>,
  images: Omit<ProductImage, 'id' | 'product_id' | 'created_at'>[] = [],
  variants: Omit<ProductVariant, 'id' | 'product_id'>[] = [],
  modifiers: Omit<ProductModifier, 'id' | 'product_id'>[] = []
): Promise<Product> {
  try {
    const supabase = supabaseAdmin;

    const { data: prodData, error: prodError } = await supabase
      .from('products')
      .insert({
        name: product.name,
        slug: cleanProductSlug(product.slug, product.name),
        description: product.description,
        short_description: product.short_description,
        price: product.price,
        compare_price: product.compare_price ?? null,
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

    // RULE D15 (atomic write): the product row is now created. Any failure in the
    // subsequent child-table inserts must roll the whole thing back — otherwise a
    // half-saved product (no images/variants/categories) is left behind. Since this
    // is a brand-new product, the compensating action is to delete it + all children.
    try {
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
    } catch (writeErr) {
      // Compensating rollback — remove the partially-created product + all children.
      await rollbackCreatedProduct(supabase, productId);
      throw writeErr;
    }

    const updatedProduct = await getProductById(productId);
    if (!updatedProduct) throw new Error('Product created but could not be retrieved');
    // Run the network-bound cache purge + search-engine ping AFTER the response is
    // sent so the admin save returns instantly (RULE C10 / instant-save). The
    // storefront reflects the change a moment later once the background task runs.
    revalidateTagSafe('products');
    await revalidateAfterResponse(async () => {
      await revalidateProduct(updatedProduct.slug);
    });
    return updatedProduct;
  } catch (error) {
    console.error('[products] createProductAction failed:', error);
    throw error;
  }
}

interface ProductWriteSnapshot {
  products: Record<string, unknown> | null;
  product_images: Record<string, unknown>[];
  product_variants: Record<string, unknown>[];
  product_modifiers: Record<string, unknown>[];
  product_categories: Record<string, unknown>[];
}

/**
 * RULE D15 — compensating rollback for the multi-table product write.
 * Restores products + all child tables to the snapshot captured before the write,
 * so a failure mid-write can never leave a product in a partial/half-saved state.
 */
async function restoreProductSnapshot(
  supabase: typeof supabaseAdmin,
  id: string,
  snap: ProductWriteSnapshot,
): Promise<void> {
  try {
    if (snap.products) {
      await supabase.from('products').update(snap.products).eq('id', id);
    }
    const childTables = ['product_images', 'product_variants', 'product_modifiers', 'product_categories'] as const;
    for (const table of childTables) {
      await supabase.from(table).delete().eq('product_id', id);
      const rows = snap[table];
      if (rows.length > 0) {
        await supabase.from(table).insert(rows);
      }
    }
    console.warn(`[products] updateProductAction: rolled back product ${id} to pre-write snapshot after a write failure (RULE D15).`);
  } catch (restoreErr) {
    console.error(`[products] CRITICAL: snapshot rollback FAILED for product ${id}. Manual check needed:`, restoreErr);
  }
}

export async function updateProductAction(
  id: string,
  product: Partial<Omit<Product, 'id' | 'images' | 'variants' | 'modifiers' | 'category' | 'created_at' | 'updated_at'>>,
  images: Omit<ProductImage, 'id' | 'product_id' | 'created_at'>[] = [],
  variants: Omit<ProductVariant, 'id' | 'product_id'>[] = [],
  modifiers: Omit<ProductModifier, 'id' | 'product_id'>[] = []
): Promise<Product> {
  try {
    const supabase = supabaseAdmin;

    const updatePayload: Record<string, any> = {};
    if (product.name !== undefined) updatePayload.name = product.name;
    if (product.slug !== undefined) updatePayload.slug = cleanProductSlug(product.slug, product.name ?? undefined, id);
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

    // RULE D15 (atomic write): snapshot full prior state BEFORE any mutation so a mid-write
    // failure can be fully rolled back — no partial/lost product data.
    const [imgSnap, varSnap, modSnap, pcSnap, prodSnap] = await Promise.all([
      supabase.from('product_images').select('*').eq('product_id', id),
      supabase.from('product_variants').select('*').eq('product_id', id),
      supabase.from('product_modifiers').select('*').eq('product_id', id),
      supabase.from('product_categories').select('*').eq('product_id', id),
      supabase.from('products').select('*').eq('id', id).single(),
    ]);
    const snapshot: ProductWriteSnapshot = {
      products: prodSnap.data ?? null,
      product_images: imgSnap.data ?? [],
      product_variants: varSnap.data ?? [],
      product_modifiers: modSnap.data ?? [],
      product_categories: pcSnap.data ?? [],
    };

    try {
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

      // RULE OP1/D15: do NOT wipe existing variants when hasVariants is true but the incoming
      // array is empty (stale/filtered client state) — that is the "save succeeds then variants
      // vanish" data-loss bug. Only manage variants when switching to a simple product
      // (hasVariants === false) OR we actually have variants to insert.
      const shouldManageVariants = product.has_variants === false || variants.length > 0;

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
    } catch (writeErr) {
      // Any part failed → restore the pre-write snapshot so nothing is left half-saved.
      await restoreProductSnapshot(supabase, id, snapshot);
      throw writeErr;
    }

    const updatedProduct = await getProductById(id);
    if (!updatedProduct) throw new Error('Product updated but could not be retrieved');
    // Network-bound purge + indexing runs AFTER the response so the save is instant.
    revalidateTagSafe('products');
    await revalidateAfterResponse(async () => {
      await revalidateProduct(updatedProduct.slug);
    });
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
    if (fields.slug !== undefined) updatePayload.slug = cleanProductSlug(fields.slug, fields.name ?? undefined, id);
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
      .single();

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
      await revalidateAfterResponse(async () => {
        await revalidateProduct(slug);
      });
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
      const slug = prodData.slug;
      await revalidateAfterResponse(async () => {
        await revalidateProduct(slug);
      });
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
    if (fields.compare_price !== undefined) updatePayload.compare_price = fields.compare_price;
    if (fields.inventory_threshold !== undefined) updatePayload.inventory_threshold = fields.inventory_threshold;
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
        const slug = prodData.slug;
        await revalidateAfterResponse(async () => {
          await revalidateProduct(slug);
        });
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

/**
 * Server Action: Add products to a category using service role (bypasses RLS)
 */
export async function addProductsToCategoryAction(
  productIds: string[],
  categoryId: string
): Promise<void> {
  if (!productIds || productIds.length === 0 || !categoryId) return;
  try {
    const supabase = supabaseAdmin;
    const inserts = productIds.map(productId => ({
      product_id: productId,
      category_id: categoryId,
    }));

    const { error: relError } = await supabase
      .from('product_categories')
      .upsert(inserts, { onConflict: 'product_id,category_id', ignoreDuplicates: true });

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
        .filter(prod => prod.slug)
        .map(prod =>
          revalidateProduct(prod.slug!).catch(e =>
            console.error(`[products] revalidateProduct failed for ${prod.slug}:`, e)
          )
        );
      await Promise.allSettled(revalidatePromises);
    }

    revalidateTagSafe('products');
    revalidateTagSafe('categories');
    await revalidateAfterResponse(async () => {
      await revalidateStorefrontEdge('products', 'categories');
    });
  } catch (error) {
    console.error('[products] addProductsToCategoryAction failed:', error);
    throw error;
  }
}

/**
 * Server Action: Remove products from a category using service role (bypasses RLS)
 */
export async function removeProductsFromCategoryAction(
  productIds: string[],
  categoryId: string
): Promise<void> {
  if (categoryId === SHOP_CATEGORY_ID) return;
  if (!productIds || productIds.length === 0) return;
  try {
    const supabase = supabaseAdmin;
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
      await Promise.allSettled(revalidatePromises);
    }

    revalidateTagSafe('products');
    revalidateTagSafe('categories');
    await revalidateAfterResponse(async () => {
      await revalidateStorefrontEdge('products', 'categories');
    });
  } catch (error) {
    console.error('[products] removeProductsFromCategoryAction failed:', error);
    throw error;
  }
}

/**
 * Server Action: Update sort order and sort preference for category products
 */
export async function updateCategorySortOrderAction(
  categoryId: string,
  productIds: string[],
  activeSortPreference?: string
): Promise<void> {
  try {
    const supabase = supabaseAdmin;
    if (productIds && productIds.length > 0) {
      await Promise.all(
        productIds.map((id, idx) =>
          supabase
            .from('products')
            .update({ sort_order: idx + 1 })
            .eq('id', id)
        )
      );
    }

    if (activeSortPreference) {
      await supabase
        .from('categories')
        .update({ active_sort_preference: activeSortPreference })
        .eq('id', categoryId);
    }

    revalidateTagSafe('products');
    revalidateTagSafe('categories');
    await revalidateAfterResponse(async () => {
      await revalidateStorefrontEdge('products', 'categories');
    });
  } catch (error) {
    console.error('[products] updateCategorySortOrderAction failed:', error);
    throw error;
  }
}

