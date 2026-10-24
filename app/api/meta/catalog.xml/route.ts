import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getSettings } from '@/lib/services/settings';
import { generateMetaCatalogXml } from '@/lib/meta/catalogXml';
import type { Product, ProductImage, ProductVariant } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface RawImageRow {
  id: string;
  url: string;
  alt?: string | null;
  sort_order?: number | null;
  is_primary?: boolean | null;
  created_at?: string;
}

interface RawVariantRow {
  id: string;
  product_id?: string;
  color?: string | null;
  size?: string | null;
  material?: string | null;
  custom_option?: string | null;
  custom_value?: string | null;
  price?: number | string | null;
  compare_price?: number | string | null;
  stock?: number | null;
  sku?: string | null;
  image_url?: string | null;
  active?: boolean | null;
  sort_order?: number | null;
}

export async function GET(req: NextRequest) {
  try {
    const settings = await getSettings();

    // Dynamic URL resolution: prefer store_url or NEXT_PUBLIC_SITE_URL, fallback to request origin (RULE MD1 & E2)
    const siteUrl = settings?.store_url?.replace(/\/+$/, '') ||
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') ||
      req.nextUrl.origin;

    // Fetch meta category mappings directly via supabaseAdmin (no cookies/headers)
    const { data: mappingsList } = await supabaseAdmin
      .from('meta_category_mapping')
      .select('store_category_id, meta_category');

    const categoryMap: Record<string, string> = {};
    (mappingsList || []).forEach((m) => {
      categoryMap[m.store_category_id] = m.meta_category;
    });

    // Query all active products with images and variants
    const { data: dbProducts, error: prodErr } = await supabaseAdmin
      .from('products')
      .select(`
        id,
        name,
        slug,
        description,
        price,
        compare_price,
        category_id,
        stock,
        has_variants,
        is_service,
        is_featured,
        active,
        is_active,
        tags,
        created_at,
        updated_at,
        product_images (
          id,
          url,
          alt,
          sort_order,
          is_primary,
          created_at
        ),
        product_variants (
          id,
          product_id,
          color,
          size,
          material,
          custom_option,
          custom_value,
          price,
          compare_price,
          stock,
          sku,
          image_url,
          active,
          sort_order
        )
      `)
      .is('deleted_at', null)
      .eq('is_active', true);

    if (prodErr) {
      console.error('[MetaCatalogXml API] Database query error:', prodErr);
      return new NextResponse('Internal server error fetching products', { status: 500 });
    }

    const domain = siteUrl || req.nextUrl.origin;

    const formattedProducts: Product[] = (dbProducts || []).map((p) => {
      const rawImgs = Array.isArray(p.product_images) ? (p.product_images as unknown as RawImageRow[]) : [];
      const images: ProductImage[] = rawImgs.map((img) => ({
        id: img.id,
        product_id: p.id,
        url: img.url,
        alt: img.alt || undefined,
        sort_order: img.sort_order ?? 0,
        is_primary: Boolean(img.is_primary),
        created_at: img.created_at || new Date().toISOString(),
      }));

      const rawVariants = Array.isArray(p.product_variants) ? (p.product_variants as unknown as RawVariantRow[]) : [];
      const variants: ProductVariant[] = rawVariants.map((v) => ({
        id: v.id,
        product_id: p.id,
        color: v.color || undefined,
        size: v.size || undefined,
        material: v.material || undefined,
        custom_option: v.custom_option || undefined,
        custom_value: v.custom_value || undefined,
        price: v.price !== null && v.price !== undefined ? Number(v.price) : undefined,
        compare_price: v.compare_price !== null && v.compare_price !== undefined ? Number(v.compare_price) : undefined,
        stock: v.stock ?? 0,
        sku: v.sku || undefined,
        image_url: v.image_url || undefined,
        active: v.active !== false,
        sort_order: v.sort_order ?? 0,
      }));

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description || '',
        price: Number(p.price || 0),
        compare_price: p.compare_price ? Number(p.compare_price) : undefined,
        category_id: p.category_id || undefined,
        stock: p.stock ?? 0,
        has_variants: Boolean(p.has_variants),
        is_service: Boolean(p.is_service),
        is_featured: Boolean(p.is_featured),
        is_active: Boolean(p.is_active ?? p.active ?? true),
        enable_swatches: false,
        show_swatches_on_archive: false,
        tags: p.tags || [],
        images,
        variants,
        modifiers: [],
        created_at: p.created_at || new Date().toISOString(),
        updated_at: p.updated_at || new Date().toISOString(),
      };
    });

    const xml = generateMetaCatalogXml(formattedProducts, settings, categoryMap, domain);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'CDN-Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err) {
    console.error('[MetaCatalogXml API] Unhandled exception:', err);
    return new NextResponse('Internal server error generating XML catalog', { status: 500 });
  }
}
