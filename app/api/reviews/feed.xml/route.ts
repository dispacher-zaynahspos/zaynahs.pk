import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getSettings } from '@/lib/services/settings';
import { getDomainBrand } from '@/lib/utils/getDomainBrand';

export const dynamic = 'force-dynamic';

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(req: NextRequest) {
  try {
    const settings = await getSettings();
    let siteUrl = settings?.store_url?.replace(/\/+$/, '') ||
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') ||
      req.nextUrl.origin;

    let brandName = settings?.store_name || '';
    if (!brandName) {
      try {
        const brand = await getDomainBrand();
        brandName = brand.name;
        if (!siteUrl) siteUrl = `${brand.protocol}://${brand.domain}`;
      } catch {
        brandName = 'Store';
      }
    }

    // Fetch all approved, active reviews
    const { data: reviews, error: revErr } = await supabaseAdmin
      .from('reviews')
      .select('id, product_id, customer_name, rating, comment, images, screenshot_url, created_at, is_verified_purchase')
      .eq('approved', true)
      .eq('hidden', false)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (revErr) {
      console.error('[reviews/feed.xml] Error fetching reviews:', revErr);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    // Collect product ids
    const productIds = Array.from(new Set((reviews || []).map(r => r.product_id).filter(Boolean))) as string[];
    const productMap: Record<string, { name: string; slug: string; sku?: string }> = {};

    if (productIds.length > 0) {
      const { data: products } = await supabaseAdmin
        .from('products')
        .select('id, name, slug, sku')
        .in('id', productIds);

      (products || []).forEach(p => {
        productMap[p.id] = { name: p.name, slug: p.slug, sku: p.sku || undefined };
      });
    }

    // Build Google Product Reviews XML (Schema version 2.3)
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<feed xmlns:vc="http://www.w3.org/2007/XMLSchema-versioning"\n`;
    xml += `      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n`;
    xml += `      xsi:noNamespaceSchemaLocation="http://www.google.com/shopping/reviews/schema/product/2.3/product_reviews.xsd">\n`;
    xml += `  <version>2.3</version>\n`;
    xml += `  <aggregator>\n`;
    xml += `    <name>${escapeXml(brandName)} Reviews</name>\n`;
    xml += `  </aggregator>\n`;
    xml += `  <publisher>\n`;
    xml += `    <name>${escapeXml(brandName)}</name>\n`;
    xml += `    <favicon>${escapeXml(settings?.favicon_url || `${siteUrl}/favicon.ico`)}</favicon>\n`;
    xml += `  </publisher>\n`;
    xml += `  <reviews>\n`;

    for (const r of (reviews || [])) {
      const product = r.product_id ? productMap[r.product_id] : null;
      if (!product) continue;

      const reviewDate = r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString();
      const productUrl = `${siteUrl}/product/${product.slug}`;
      const reviewUrl = `${productUrl}#review-${r.id}`;
      const reviewerName = r.customer_name?.trim() || 'Verified Customer';

      const photoList: string[] = Array.isArray(r.images) && r.images.length > 0
        ? r.images
        : r.screenshot_url
        ? [r.screenshot_url]
        : [];

      xml += `    <review>\n`;
      xml += `      <review_id>${escapeXml(r.id)}</review_id>\n`;
      xml += `      <reviewer>\n`;
      xml += `        <name is_anonymous="false">${escapeXml(reviewerName)}</name>\n`;
      xml += `      </reviewer>\n`;
      xml += `      <review_timestamp>${reviewDate}</review_timestamp>\n`;
      if (r.comment) {
        xml += `      <content>${escapeXml(r.comment)}</content>\n`;
      }
      xml += `      <review_url type="singleton">${escapeXml(reviewUrl)}</review_url>\n`;
      xml += `      <ratings>\n`;
      xml += `        <overall min="1" max="5">${r.rating}</overall>\n`;
      xml += `      </ratings>\n`;
      xml += `      <products>\n`;
      xml += `        <product>\n`;
      xml += `          <product_ids>\n`;
      if (product.sku) {
        xml += `            <skus><sku>${escapeXml(product.sku)}</sku></skus>\n`;
      }
      xml += `          </product_ids>\n`;
      xml += `          <product_name>${escapeXml(product.name)}</product_name>\n`;
      xml += `          <product_url>${escapeXml(productUrl)}</product_url>\n`;
      xml += `        </product>\n`;
      xml += `      </products>\n`;

      if (photoList.length > 0) {
        xml += `      <reviewer_images>\n`;
        for (const img of photoList) {
          xml += `        <image_url>${escapeXml(img)}</image_url>\n`;
        }
        xml += `      </reviewer_images>\n`;
      }

      xml += `    </review>\n`;
    }

    xml += `  </reviews>\n`;
    xml += `</feed>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('[reviews/feed.xml] Fatal error generating feed:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
