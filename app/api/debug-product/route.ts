import { NextResponse } from 'next/server';

export const revalidate = 0;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug') || 'elegant-black-wide-leg-trousers-with-textured-fabric';
  const results: Record<string, any> = {};
  const step = async (name: string, fn: () => Promise<any>) => {
    try {
      results[name] = { ok: true, data: await fn() };
    } catch (e: any) {
      results[name] = { ok: false, error: String(e?.message || e), stack: String(e?.stack || '').slice(0, 1500) };
    }
  };

  const { supabaseAdmin } = await import('@/lib/supabase/admin');
  const { getSettings } = await import('@/lib/services/settings');
  const { getProductBySlug, getRelatedProducts } = await import('@/lib/services/products');
  const { getProductReviews, getAverageRating } = await import('@/lib/services/reviews');
  const { getSiteUrl } = await import('@/lib/site-url-server');
  const { getDomainBrand } = await import('@/lib/utils/getDomainBrand');

  await step('getSettings', () => getSettings());
  await step('getDomainBrand', () => getDomainBrand());
  await step('getProductBySlug', () => getProductBySlug(slug));
  const product = results.getProductBySlug?.ok ? results.getProductBySlug.data : null;
  if (product) {
    await step('seo_meta', async () => {
      const r = await supabaseAdmin.from('seo_meta').select('*').eq('entity_type', 'product').eq('entity_id', product.id).maybeSingle();
      return r.data;
    });
    await step('getProductReviews', () => getProductReviews(product.id));
    await step('getAverageRating', () => getAverageRating(product.id));
    await step('getRelatedProducts', () => getRelatedProducts(product.id, product.categoryId, 4));
    await step('social_proof_count', async () => {
      const r = await supabaseAdmin.from('social_proof_products').select('product_id', { count: 'exact', head: true }).eq('product_id', product.id);
      return r;
    });
    await step('getSiteUrl', () => getSiteUrl(results.getSettings.ok ? results.getSettings.data : undefined));
  }

  return NextResponse.json({ node: process.version, env: { url: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30) }, results });
}
