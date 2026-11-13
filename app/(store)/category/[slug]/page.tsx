import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getSettings } from '@/lib/services/settings';
import { getCategories, getCategoryBySlug } from '@/lib/services/categories';
import { getCollections } from '@/lib/services/collections';
import { getProducts } from '@/lib/services/products';
import { getDomainBrand, cleanBrandName } from '@/lib/utils/getDomainBrand';
import { Metadata } from 'next';
import { stripHtmlTags } from '@/lib/utils/stripHtml';
import ShopPage from '@/components/store/ShopPage';

export const revalidate = 2592000; // 30 days ISR — webhooks purge instantly on admin change (RULE C10/C12)
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const categories = await getCategories();
    return categories.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  try {
    const brand = await getDomainBrand();
    const { slug } = await params;
    let decodedSlug = slug;
    try { decodedSlug = decodeURIComponent(slug); } catch {}

    const category = await getCategoryBySlug(decodedSlug);
    if (!category) return {};

    const { data: seoMeta } = await supabaseAdmin
      .from('seo_meta')
      .select('*')
      .eq('entity_type', 'category')
      .eq('entity_id', category.id)
      .maybeSingle();

    const settings = await getSettings();
    const siteUrl = `${brand.protocol}://${brand.domain}`;

    const title = cleanBrandName(seoMeta?.seo_title, brand.name) || `Buy ${category.name} Online in Pakistan | ${brand.name}`;
    const rawDesc = cleanBrandName(seoMeta?.meta_description, brand.name) || category.description || `Explore our ${category.name} collection at ${brand.name}. High quality, best prices, cash on delivery across Pakistan.`;
    const description = stripHtmlTags(rawDesc).slice(0, 160);
    const imageUrl = category.image_url || settings.banner_url || settings.logo_url || settings.favicon_url || '';
    const canonicalUrl = `${siteUrl}/category/${slug}`;

    return {
      metadataBase: new URL(siteUrl),
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        type: 'website',
        images: [{ url: imageUrl, width: 1200, height: 630, alt: `${category.name} | ${brand.name}` }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch {
    return {
      title: 'Category',
      description: 'Browse our collection.',
    };
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  let decodedSlug = slug;
  try { decodedSlug = decodeURIComponent(slug); } catch {}

  const [categories, collections, settings, brand, products, category] = await Promise.all([
    getCategories(),
    getCollections(),
    getSettings(),
    getDomainBrand(),
    getProducts(),
    getCategoryBySlug(decodedSlug),
  ]);

  if (!category) {
    notFound();
  }

  const siteUrl = `${brand.protocol}://${brand.domain}`;
  const canonicalUrl = `${siteUrl}/category/${slug}`;

  // Filter products belonging to this category for the ItemList schema
  const categoryProducts = products.filter(
    (p) => p.category_id === category.id || (p as { category?: { slug?: string } }).category?.slug === decodedSlug
  );

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${category.name} | ${brand.name}`,
    "itemListElement": (categoryProducts.length > 0 ? categoryProducts : products.slice(0, 24)).map((p, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${siteUrl}/product/${p.slug}`,
      "name": p.name,
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": `${siteUrl}/` },
      { "@type": "ListItem", "position": 2, "name": "Shop", "item": `${siteUrl}/shop` },
      { "@type": "ListItem", "position": 3, "name": category.name, "item": canonicalUrl },
    ],
  };

  let faqSchema: Record<string, unknown> | null = null;
  const { data: seoMeta } = await supabaseAdmin
    .from('seo_meta')
    .select('faq_schema')
    .eq('entity_type', 'category')
    .eq('entity_id', category.id)
    .maybeSingle();

  if (seoMeta?.faq_schema && Array.isArray(seoMeta.faq_schema) && seoMeta.faq_schema.length > 0) {
    faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": (seoMeta.faq_schema as Array<{ q: string; a: string }>).map((item) => ({
        "@type": "Question",
        "name": item.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.a,
        },
      })),
    };
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <Suspense fallback={<div className="min-h-screen py-10 flex items-center justify-center text-gray-400">Loading category...</div>}>
        <ShopPage
          initialProducts={products}
          categories={categories}
          collections={collections}
          settings={settings}
        />
      </Suspense>
    </>
  );
}
