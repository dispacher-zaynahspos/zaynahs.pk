import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/services/products';

/**
 * GET /api/products/list
 * Public storefront endpoint — returns all active products.
 * Used by StoreFront client to hydrate remaining products after SSR initial batch.
 * 
 * Query params:
 *   ?offset=24  — skip first N (for pagination/after-SSR loading)
 *   ?category=slug (optional)
 */
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache for 1 hour on CDN

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const categoryId = searchParams.get('categoryId') || undefined;
    // Fetch all products (cached via unstable_cache — fast)
    const allProducts = await getProducts(categoryId, undefined);

    return NextResponse.json(
      { products: allProducts, total: allProducts.length },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=60',
          'cdn-cache-control': 'public, s-maxage=3600, stale-while-revalidate=60',
        },
      }
    );
  } catch (err) {
    console.error('[/api/products/list] Error:', err);
    return NextResponse.json({ products: [], total: 0 }, { status: 500 });
  }
}
