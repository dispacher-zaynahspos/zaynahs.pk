import { Product, ProductImage, ProductVariant, ProductModifier } from '@/lib/types';
import { revalidateProduct } from '@/lib/revalidate';
import { safeAction } from '@/lib/utils/serverAction';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getProductById } from './queries';

export const createProduct = async (
  product: Omit<Product, 'id' | 'images' | 'variants' | 'modifiers' | 'category' | 'createdAt' | 'updatedAt'>,
  images: Omit<ProductImage, 'id' | 'productId' | 'createdAt'>[],
  variants: Omit<ProductVariant, 'id' | 'productId'>[],
  modifiers: Omit<ProductModifier, 'id' | 'productId'>[]
): Promise<Product> => {
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
        compare_price: product.comparePrice,
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
    await revalidateProduct(updatedProduct.slug);
    return updatedProduct;
  } catch (error) {
    console.error('[products] createProduct failed:', error);
    throw error;
  }
};

export const updateProduct = async (
  id: string,
  product: Partial<Omit<Product, 'id' | 'images' | 'variants' | 'modifiers' | 'category' | 'createdAt' | 'updatedAt'>>,
  images: Omit<ProductImage, 'id' | 'productId' | 'createdAt'>[],
  variants: Omit<ProductVariant, 'id' | 'productId'>[],
  modifiers: Omit<ProductModifier, 'id' | 'productId'>[]
): Promise<Product> => {
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

    // Only delete/replace variants if hasVariants is explicitly false (switching to simple product)
    // or if new valid variants are being inserted.
    // If hasVariants is true and variants is empty, do NOT delete existing variants to prevent data loss!
    const shouldManageVariants = product.hasVariants === false || (variants && variants.length > 0);

    if (shouldManageVariants) {
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
