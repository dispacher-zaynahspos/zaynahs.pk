import React from 'react';
import StoreFront from '@/components/store/StoreFront';
import { getProducts } from '@/lib/services/products';
import { getCategories } from '@/lib/services/categories';
import { getSettings } from '@/lib/services/settings';
import { getTopReviews } from '@/lib/services/reviews';
import { getHomepageSections } from '@/lib/services/sections';
import { getActiveSocialProofCount } from '@/lib/services/socialProof';
import { getDomainBrand } from '@/lib/utils/getDomainBrand';
import { Metadata } from 'next';

export const revalidate = 86400; // 24 hours — webhooks purge on admin save

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getSettings();
    const brandName = settings.storeName || process.env.NEXT_PUBLIC_BRAND_NAME || 'Store';
    const brandTagline = settings.tagline || process.env.NEXT_PUBLIC_BRAND_TAGLINE || '';
    const siteUrl = settings?.storeUrl?.replace(/\/+$/, '') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const banner = settings.bannerUrl || settings.logoUrl || settings.faviconUrl || '';
    const title = settings.metaTitle || (brandTagline ? `${brandName} - ${brandTagline}` : brandName);
    const desc = (settings.metaDescription || brandTagline).slice(0, 160);

    return {
      metadataBase: new URL(siteUrl),
      title: {
        absolute: title
      },
      description: desc,
      alternates: { canonical: siteUrl },
      other: {
        'og:locale': 'en_US',
      },
      openGraph: {
        title: title,
        description: desc,
        url: siteUrl,
        siteName: brandName,
        type: 'website',
        locale: 'en_US',
        images: [{ url: banner, width: 1200, height: 630, alt: brandName }],
      },
      twitter: {
        card: 'summary_large_image',
        title: title,
        description: desc,
        images: [banner],
        site: settings.twitter_handle || process.env.NEXT_PUBLIC_TWITTER_HANDLE || '',
        creator: settings.twitter_handle || process.env.NEXT_PUBLIC_TWITTER_HANDLE || '',
      }
    };
  } catch {
    return {
      title: 'Store',
      description: 'Premium online store.',
      openGraph: {
        type: 'website',
        title: 'Store',
        description: 'Premium online store.',
        images: [{ url: '/favicon.ico' }],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Store',
        description: 'Premium online store.',
        images: ['/favicon.ico'],
      }
    };
  }
}

export default async function CatalogPage() {
  // Fetch all active products on SSR to prevent layout shifts and missing products in Featured/Category grids.
  // The data is cached via unstable_cache in getProducts, so DB load is 0.
  const [products, categories, settings, reviews, sections] = await Promise.all([
    getProducts(),
    getCategories(),
    getSettings(),
    getTopReviews(3),
    getHomepageSections(true),
  ]);

  const socialProofCount = await getActiveSocialProofCount();

  return (
    <StoreFront
      initialProducts={products}
      categories={categories}
      settings={settings}
      reviews={reviews}
      sections={sections}
      socialProofCount={socialProofCount}
    />
  );
}
