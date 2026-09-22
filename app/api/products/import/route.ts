import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { ExportBundle } from '@/lib/types';
import { processProductImages, processProductVariants } from './helpers';

export async function POST(request: NextRequest) {
  try {
    // Authenticate admin session
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const strategy = (formData.get('strategy') as 'skip' | 'overwrite' | 'rename') || 'skip';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    const bundle = JSON.parse(text) as ExportBundle;

    if (!bundle || bundle.version !== '1.0' || !bundle.products || !Array.isArray(bundle.products)) {
      return NextResponse.json({ error: 'Invalid export file format' }, { status: 400 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Helper to send progress chunks
        const sendProgress = (result: any) => {
          controller.enqueue(encoder.encode(JSON.stringify(result) + '\n'));
        };

        // Notify client of start and total count
        sendProgress({ type: 'start', total: bundle.products.length });

        const categoryCache: Record<string, string> = {};

        for (const p of bundle.products) {
          try {
            // Check if product with the same slug already exists
            const { data: existing } = await supabaseAdmin
              .from('products')
              .select('id, name, slug')
              .eq('slug', p.slug)
              .maybeSingle();

            if (existing) {
              if (strategy === 'skip') {
                sendProgress({
                  success: true,
                  productName: p.name,
                  status: 'skipped',
                  message: `Product with slug "${p.slug}" already exists. Skipped.`
                });
                continue;
              }
            }

            // 1. Handle/Resolve Category (by slug)
            let categoryId = null;
            if (p.categorySlug) {
              if (categoryCache[p.categorySlug]) {
                categoryId = categoryCache[p.categorySlug];
              } else {
                const { data: cat } = await supabaseAdmin
                  .from('categories')
                  .select('id')
                  .eq('slug', p.categorySlug)
                  .maybeSingle();

                if (cat) {
                  categoryId = cat.id;
                  categoryCache[p.categorySlug] = cat.id;
                } else {
                  // Create category if it doesn't exist
                  const catData = p.categoryData || {
                    name: p.categoryName || 'Uncategorized',
                    slug: p.categorySlug,
                    active: true,
                    sortOrder: 0
                  };
                  const { data: newCat, error: catErr } = await supabaseAdmin
                    .from('categories')
                    .insert({
                      name: catData.name,
                      slug: catData.slug,
                      description: catData.description || null,
                      image_url: catData.imageUrl || null,
                      active: catData.active ?? true,
                      sort_order: catData.sortOrder || 0
                    })
                    .select('id')
                    .single();

                  if (catErr) {
                    console.error('[Import API] Failed to create category:', catErr);
                  } else if (newCat) {
                    categoryId = newCat.id;
                    categoryCache[p.categorySlug] = newCat.id;
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
                    short_description: p.shortDescription || null,
                    price: p.price,
                    compare_price: p.comparePrice || null,
                    cost: p.cost || null,
                    sku: p.sku || null,
                    stock: p.stock,
                    has_variants: p.hasVariants,
                    is_service: p.isService,
                    is_featured: p.isFeatured,
                    is_active: (p as any).isActive ?? p.active ?? true,
                    enable_swatches: p.enableSwatches,
                    show_swatches_on_archive: p.showSwatchesOnArchive,
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
                    short_description: p.shortDescription || null,
                    price: p.price,
                    compare_price: p.comparePrice || null,
                    cost: p.cost || null,
                    sku: p.sku || null,
                    stock: p.stock,
                    has_variants: p.hasVariants,
                    is_service: p.isService,
                    is_featured: p.isFeatured,
                    is_active: (p as any).isActive ?? p.active ?? true,
                    enable_swatches: p.enableSwatches,
                    show_swatches_on_archive: p.showSwatchesOnArchive,
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
                  short_description: p.shortDescription || null,
                  price: p.price,
                  compare_price: p.comparePrice || null,
                  cost: p.cost || null,
                  sku: p.sku || null,
                  stock: p.stock,
                  has_variants: p.hasVariants,
                  is_service: p.isService,
                  is_featured: p.isFeatured,
                  is_active: (p as any).isActive ?? p.active ?? true,
                  enable_swatches: p.enableSwatches,
                  show_swatches_on_archive: p.showSwatchesOnArchive,
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
                  sort_order: m.sortOrder || 0
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

                if (categoryCache[catItem.slug]) {
                  const cachedId = categoryCache[catItem.slug];
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
                  categoryCache[catItem.slug] = existingCat.id;
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
                      image_url: catItem.imageUrl || null,
                      active: catItem.active ?? true,
                      sort_order: catItem.sortOrder || 0
                    })
                    .select('id')
                    .single();

                  if (!catCreateErr && newCat) {
                    categoryCache[catItem.slug] = newCat.id;
                    if (!categoryIdsToLink.includes(newCat.id)) {
                      categoryIdsToLink.push(newCat.id);
                    }
                  } else {
                    console.error(`[Import API] Failed to create category '${catItem.slug}':`, catCreateErr);
                  }
                }
              }
            }

            const SHOP_CATEGORY_ID = '00000000-0000-4000-8000-000000000099';
            if (!categoryIdsToLink.includes(SHOP_CATEGORY_ID)) {
              categoryIdsToLink.push(SHOP_CATEGORY_ID);
            }

            if (categoryIdsToLink.length > 0) {
              const junctionRows = categoryIdsToLink.map(catId => ({
                product_id: productId,
                category_id: catId
              }));

              const { error: junctionErr } = await supabaseAdmin
                .from('product_categories')
                .upsert(junctionRows, { onConflict: 'product_id,category_id', ignoreDuplicates: true });

              if (junctionErr) {
                console.error(`[Import API] Failed to insert product_categories for ${finalName}:`, junctionErr);
              }
            }

            sendProgress({
              success: true,
              productName: finalName,
              status: statusAction,
              message: `Product "${finalName}" imported successfully.`
            });

          } catch (prodErr: any) {
            console.error(`[Import API] Failed to import product "${p.name}":`, prodErr);
            sendProgress({
              success: false,
              productName: p.name,
              status: 'error',
              error: prodErr.message || 'Unknown database write error'
            });
          }
        }

        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error: any) {
    console.error('[Import API] Import process crashed:', error);
    return NextResponse.json(
      { error: error.message || 'Import failed' },
      { status: 500 }
    );
  }
}
