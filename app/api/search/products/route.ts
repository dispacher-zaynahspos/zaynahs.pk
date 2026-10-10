import { NextRequest, NextResponse } from 'next/server';
import { searchProductsServer } from '@/lib/services/product-search/server-search';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const query = searchParams.get('q') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const includeDraft = searchParams.get('includeDraft') === 'true';
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const filters: Record<string, any> = {};
    
    const categoryId = searchParams.get('categoryId');
    if (categoryId) filters.categoryId = categoryId;
    
    const collectionId = searchParams.get('collectionId');
    if (collectionId) filters.collectionId = collectionId;
    
    const tag = searchParams.get('tag');
    if (tag) filters.tag = tag;
    
    const priceMin = searchParams.get('priceMin');
    if (priceMin) filters.priceMin = parseFloat(priceMin);
    
    const priceMax = searchParams.get('priceMax');
    if (priceMax) filters.priceMax = parseFloat(priceMax);
    
    if (searchParams.get('inStockOnly') === 'true') filters.inStockOnly = true;
    if (searchParams.get('onSaleOnly') === 'true') filters.onSaleOnly = true;
    
    const hasVariants = searchParams.get('hasVariants');
    if (hasVariants !== null) filters.hasVariants = hasVariants === 'true';
    
    const isFeatured = searchParams.get('isFeatured');
    if (isFeatured !== null) filters.isFeatured = isFeatured === 'true';
    
    const ageGroup = searchParams.get('ageGroup');
    if (ageGroup) filters.ageGroup = ageGroup;
    
    const gender = searchParams.get('gender');
    if (gender) filters.gender = gender;

    const response = await searchProductsServer(query, {
      limit,
      offset,
      includeDraft,
      includeInactive,
      filters,
    });

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
        'cdn-cache-control': 'public, max-age=30',
      },
    });
  } catch (error) {
    console.error('[/api/search/products] Error:', error);
    return NextResponse.json(
      { results: [], total: 0, hasMore: false, query: '', tookMs: 0, error: 'Search failed' },
      { status: 500 }
    );
  }
}