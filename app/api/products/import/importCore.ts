import { supabaseAdmin } from '@/lib/supabase/admin';
import { SHOP_CATEGORY_ID } from '@/lib/config/singleton-ids';
import { processProductImages, processProductVariants } from './helpers';

export interface ImportProductResult {
  success: boolean;
  productName: string;
  status: 'skipped' | 'overwritten' | 'imported' | 'error';
  message?: string;
  error?: string;
  categoryCache?: Record<string, string>;
}

/**
 * Core atomic function to import a single product, including images, variants, modifiers, and categories.
 * RULE D15: Atomic write and overwrite rollback if anything fails.
 */
export async function importSingleProductCore(
  p: any,
  strategy: 'skip' | 'overwrite' | 'rename',
  categoryCache: Record<string, string> = {}
): Promise<ImportProductResult> {
  const updatedCategoryCache = { ...categoryCache };
  let overwriteSnapshot: {
    productId: string;
    product_images: Record<string, unknown>[];
    product_variants: Record<string, unknown>[];
    product_modifiers: Record<string, unknown>[];
    product_categories: Record<string, unknown>[];
  } | null = null;

  try {
    // Check if product with the same slug already exists
    const { data: existing } = await supabaseAdmin
      .from('products')
      .select('id, name, slug')
      .eq('slug', p.slug)
      .maybeSingle();

    if (existing) {
      if (strategy === 'skip') {
        return {
          success: true,
          productName: p.name,
          status: 'skipped',
          message: `Product with slug "${p.slug}" already exists. Skipped.`,
          categoryCache: updatedCategoryCache
        };
      }
    }

    // 1. Handle/Resolve Category (by slug)
    let categoryId = null;
    if (p.category_slug) {
      if (updatedCategoryCache[p.category_slug]) {
        categoryId = updatedCategoryCache[p.category_slug];
      } else {
        const { data: cat } = await supabaseAdmin
          .from('categories')
          .select('id')
          .eq('slug', p.category_slug)
          .maybeSingle();

        if (cat) {
          categoryId = cat.id;
          updatedCategoryCache[p.category_slug] = cat.id;
        } else {
          // Create category if it doesn't exist
          const catData = p.category_data || {
            name: p.category_name || 'Uncategorized',
            slug: p.category_slug,
            active: true,
            sort_order: 0
          };
          const { data: newCat, error: catErr } = await supabaseAdmin
            .from('categories')
            .insert({
              name: catData.name,
              slug: catData.slug,
              description: catData.description || null,
              image_url: catData.image_url || null,
              active: catData.active ?? true,
              sort_order: catData.sort_order || 0
            })
            .select('id')
            .single();

          if (!catErr && newCat) {
            categoryId = newCat.id;
            updatedCategoryCache[p.category_slug] = newCat.id;
          }
        }
      }
    }

    let productId = '';
    let finalName = p.name;
    let finalSlug = p.slug;
    let statusAction: 'imported' | 'overwritten' = 'imported';

    if (existing) {
      if (strategy === 'overwrite') {
        productId = existing.id;
        statusAction = 'overwritten';

        // Snapshot children BEFORE the destructive delete (rollback insurance)
        const [imgSnap, varSnap, modSnap, pcSnap] = await Promise.all([
          supabaseAdmin.from('product_images').select('*').eq('product_id', productId),
          supabaseAdmin.from('product_variants').select('*').eq('product_id', productId),
          supabaseAdmin.from('product_modifiers').select('*').eq('product_id', productId),
          supabaseAdmin.from('product_categories').select('*').eq('product_id', productId),
        ]);
        overwriteSnapshot = {
          productId,
          product_images: imgSnap.data ?? [],
          product_variants: varSnap.data ?? [],
          product_modifiers: modSnap.data ?? [],
          product_categories: pcSnap.data ?? [],
        };

        // Delete variant, modifier, and category associations to prevent conflicts/duplicates
        await supabaseAdmin.from('product_images').delete().eq('product_id', productId);
        await supabaseAdmin.from('product_variants').delete().eq('product_id', productId);
        await supabaseAdmin.from('product_modifiers').delete().eq('product_id', productId);
        await supabaseAdmin.from('product_categories').delete().eq('product_id', productId);

        // Update existing product details
        const { error: updateErr } = await supabaseAdmin
          .from('products')
          .update({
            name: p.name,
            description: p.description || null,
            short_description: p.short_description || null,
            price: p.price,
            compare_price: p.compare_price || null,
            cost: p.cost || null,
            sku: p.sku || null,
            stock: p.stock,
            has_variants: p.has_variants,
            is_service: p.is_service,
            is_featured: p.is_featured,
            is_active: (p as any).isActive ?? p.active ?? true,
            enable_swatches: p.enable_swatches,
            show_swatches_on_archive: p.show_swatches_on_archive,
            tags: p.tags,
            category_id: categoryId,
            deleted_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', productId);

        if (updateErr) throw updateErr;
      } else if (strategy === 'rename') {
        let suffix = 1;
        finalSlug = `${p.slug}-${suffix}`;
        finalName = `${p.name} (Copy ${suffix})`;
        while (true) {
          const { data: existsSlug } = await supabaseAdmin
            .from('products')
            .select('id')
            .eq('slug', finalSlug)
            .maybeSingle();
          if (!existsSlug) break;
          suffix++;
          finalSlug = `${p.slug}-${suffix}`;
          finalName = `${p.name} (Copy ${suffix})`;
        }

        const { data: newProd, error: insertErr } = await supabaseAdmin
          .from('products')
          .insert({
            name: finalName,
            slug: finalSlug,
            description: p.description || null,
            short_description: p.short_description || null,
            price: p.price,
            compare_price: p.compare_price || null,
            cost: p.cost || null,
            sku: p.sku || null,
            stock: p.stock,
            has_variants: p.has_variants,
            is_service: p.is_service,
            is_featured: p.is_featured,
            is_active: (p as any).isActive ?? p.active ?? true,
            enable_swatches: p.enable_swatches,
            show_swatches_on_archive: p.show_swatches_on_archive,
            tags: p.tags,
            category_id: categoryId
          })
          .select('id')
          .single();

        if (insertErr) throw insertErr;
        productId = newProd.id;
      }
    } else {
      // Insert a new product
      const { data: newProd, error: insertErr } = await supabaseAdmin
        .from('products')
        .insert({
          name: p.name,
          slug: p.slug,
          description: p.description || null,
          short_description: p.short_description || null,
          price: p.price,
          compare_price: p.compare_price || null,
          cost: p.cost || null,
          sku: p.sku || null,
          stock: p.stock,
          has_variants: p.has_variants,
          is_service: p.is_service,
          is_featured: p.is_featured,
          is_active: (p as any).isActive ?? p.active ?? true,
          enable_swatches: p.enable_swatches,
          show_swatches_on_archive: p.show_swatches_on_archive,
          tags: p.tags,
          category_id: categoryId
        })
        .select('id')
        .single();

      if (insertErr) throw insertErr;
      productId = newProd.id;
    }

    // 2. Upload Product-level images
    const uploadedUrlsMap = await processProductImages(productId, finalName, p.slug, p.images || []);

    // 3. Upload variant images & Insert Variants
    await processProductVariants(productId, finalName, p.slug, p.variants || [], uploadedUrlsMap);

    // 4. Insert Modifiers
    for (const m of (p.modifiers || [])) {
      await supabaseAdmin
        .from('product_modifiers')
        .insert({
          product_id: productId,
          name: m.name,
          price: m.price,
          active: m.active ?? true,
          sort_order: m.sort_order || 0
        });
    }

    // 5. Create product_categories junction records for all categories
    const categoryIdsToLink: string[] = [];

    if (categoryId) {
      categoryIdsToLink.push(categoryId);
    }

    if (p.categories && Array.isArray(p.categories)) {
      for (const catItem of p.categories) {
        if (!catItem.slug || catItem.slug === 'shop') continue;

        if (updatedCategoryCache[catItem.slug]) {
          const cachedId = updatedCategoryCache[catItem.slug];
          if (!categoryIdsToLink.includes(cachedId)) {
            categoryIdsToLink.push(cachedId);
          }
          continue;
        }

        const { data: existingCat } = await supabaseAdmin
          .from('categories')
          .select('id')
          .eq('slug', catItem.slug)
          .maybeSingle();

        if (existingCat) {
          updatedCategoryCache[catItem.slug] = existingCat.id;
          if (!categoryIdsToLink.includes(existingCat.id)) {
            categoryIdsToLink.push(existingCat.id);
          }
        } else {
          const { data: newCat, error: catCreateErr } = await supabaseAdmin
            .from('categories')
            .insert({
              name: catItem.name,
              slug: catItem.slug,
              description: catItem.description || null,
              image_url: catItem.image_url || null,
              active: catItem.active ?? true,
              sort_order: catItem.sort_order || 0
            })
            .select('id')
            .single();

          if (!catCreateErr && newCat) {
            updatedCategoryCache[catItem.slug] = newCat.id;
            if (!categoryIdsToLink.includes(newCat.id)) {
              categoryIdsToLink.push(newCat.id);
            }
          }
        }
      }
    }

    if (!categoryIdsToLink.includes(SHOP_CATEGORY_ID)) {
      categoryIdsToLink.push(SHOP_CATEGORY_ID);
    }

    if (categoryIdsToLink.length > 0) {
      const junctionRows = categoryIdsToLink.map(catId => ({
        product_id: productId,
        category_id: catId
      }));

      await supabaseAdmin
        .from('product_categories')
        .upsert(junctionRows, { onConflict: 'product_id,category_id', ignoreDuplicates: true });
    }

    return {
      success: true,
      productName: finalName,
      status: statusAction,
      message: `Product "${finalName}" imported successfully.`,
      categoryCache: updatedCategoryCache
    };

  } catch (prodErr: any) {
    console.error(`[Import API] Failed to import product "${p.name}":`, prodErr);
    if (overwriteSnapshot) {
      try {
        const { productId: snapId } = overwriteSnapshot;
        const childTables = ['product_images', 'product_variants', 'product_modifiers', 'product_categories'] as const;
        for (const table of childTables) {
          await supabaseAdmin.from(table).delete().eq('product_id', snapId);
          const rows = overwriteSnapshot[table];
          if (rows.length > 0) {
            await supabaseAdmin.from(table).insert(rows);
          }
        }
      } catch (restoreErr) {
        console.error(`[Import API] overwrite rollback failed:`, restoreErr);
      }
    }
    return {
      success: false,
      productName: p.name,
      status: 'error',
      error: prodErr.message || 'Unknown database write error',
      categoryCache: updatedCategoryCache
    };
  }
}
