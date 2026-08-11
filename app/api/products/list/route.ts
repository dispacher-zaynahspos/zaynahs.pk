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
export const revalidate = 0; // Fresh response always

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
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'cdn-cache-control': 'no-store',
        },
      }
    );
  } catch (err) {
    console.error('[/api/products/list] Error:', err);
    return NextResponse.json({ products: [], total: 0 }, { status: 500 });
  }
}
