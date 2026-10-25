import React from 'react';
import type { Metadata } from 'next';
import { getGlobalReviews } from '@/lib/services/reviews';
import { getSocialProofs } from '@/lib/services/social-proof';
import { getSettings } from '@/lib/services/settings';
import { getDomainConfig } from '@/lib/config/domains';
import { getDomainBrand } from '@/lib/utils/getDomainBrand';
import { supabaseAdmin } from '@/lib/supabase/admin';
import ReviewsPageClient from './ReviewsPageClient';

interface PageProps {
  searchParams: Promise<{ search?: string; rating?: string; sort?: string; page?: string; tab?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const brand = await getDomainBrand();
    const settings = await getSettings();
    const siteUrl = settings?.store_url?.replace(/\/+$/, '') || process.env.NEXT_PUBLIC_SITE_URL || '';
    const ogImage = settings.banner_url || settings.logo_url || '';
    const title = `Customer Reviews | ${brand.name}`;
    const description = `Read authentic customer reviews and ratings at ${brand.name}. See what our customers are saying about our products.`;
    return {
      title,
      description,
      alternates: { canonical: `${siteUrl}/reviews` },
      openGraph: {
        title,
        description,
        url: `${siteUrl}/reviews`,
        type: 'website',
        images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: brand.name }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ogImage ? [ogImage] : [],
      },
    };
  } catch {
    return {
      title: 'Customer Reviews',
      description: 'Read authentic customer reviews and ratings.',
    };
  }
}

export default async function ReviewsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const settings = await getSettings();
  let siteUrl = settings?.store_url?.replace(/\/+$/, '') || '';
  if (!siteUrl) {
    try {
      const brand = await getDomainBrand();
      siteUrl = `${brand.protocol}://${brand.domain}`;
    } catch {
      siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.totvogue.pk';
    }
  }

  const { reviews, total } = await getGlobalReviews({
    search: sp.search,
    rating: sp.rating ? parseInt(sp.rating) : undefined,
    sort: (sp.sort as 'newest' | 'oldest' | 'highest' | 'lowest') || 'newest',
    page: parseInt(sp.page || '1'),
    limit: 20,
  });

  const socialProofs = await getSocialProofs();

  const storeName = getDomainConfig(siteUrl || 'localhost:3000').name;

  const combinedTotal = total + socialProofs.length;

  // Rating distribution calculation from approved reviews
  const distribution: Record<number, number> = { 5: socialProofs.length, 4: 0, 3: 0, 2: 0, 1: 0 };
  try {
    const { data: ratingRows } = await supabaseAdmin
      .from('reviews')
      .select('rating')
      .eq('approved', true)
      .eq('hidden', false)
      .is('deleted_at', null);

    if (ratingRows) {
      for (const row of ratingRows) {
        const r = Math.round(row.rating);
        if (r >= 1 && r <= 5) {
          distribution[r] = (distribution[r] || 0) + 1;
        }
      }
    }
  } catch (err) {
    console.error('Error fetching rating distribution:', err);
  }

  // Active products for Write Review modal product picker
  let activeProducts: { id: string; name: string; slug: string; image?: string; price?: number }[] = [];
  try {
    const { data: productsData } = await supabaseAdmin
      .from('products')
      .select('id, name, slug, price, product_images(url, is_primary, sort_order)')
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })
      .limit(100);

    if (productsData) {
      activeProducts = productsData.map((p) => {
        const row = p as { id: string; name: string; slug: string; price: number; product_images?: Array<{ url?: string; is_primary?: boolean | null; sort_order?: number | null }> };
        const imgs = Array.isArray(row.product_images) ? row.product_images : [];
        const sorted = [...imgs].sort(
          (a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || (a.sort_order ?? 0) - (b.sort_order ?? 0)
        );
        return {
          id: row.id,
          name: row.name,
          slug: row.slug,
          price: row.price,
          image: sorted[0]?.url || '',
        };
      });
    }
  } catch (err) {
    console.error('Error fetching active products:', err);
  }

  // Generate Google-compliant Schema.org Store and Breadcrumb rich snippets
  const aggregateRating = reviews.length + socialProofs.length > 0
    ? {
        average: (reviews.reduce((sum, r) => sum + r.rating, 0) + socialProofs.length * 5) / (reviews.length + socialProofs.length),
        count: combinedTotal,
      }
    : null;

  const storeSchema = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: storeName,
    url: siteUrl,
    ...(aggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: aggregateRating.average.toFixed(1),
        reviewCount: aggregateRating.count,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    ...(reviews.length > 0 && {
      review: reviews.slice(0, 10).map((r) => ({
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: r.customer_name || 'Customer',
        },
        datePublished: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        reviewBody: r.comment || '',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: r.rating.toString(),
          bestRating: '5',
          worstRating: '1',
        },
      })),
    }),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Reviews',
        item: `${siteUrl}/reviews`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ReviewsPageClient
        initialReviews={reviews}
        initialTotal={total}
        initialSocialProofs={socialProofs}
        storeUrl={siteUrl}
        ratingDistribution={distribution}
        products={activeProducts}
      />
    </>
  );
}
