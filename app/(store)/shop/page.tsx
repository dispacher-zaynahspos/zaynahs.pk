import React from 'react';
import ShopPage from '@/components/store/ShopPage';
import { getProducts } from '@/lib/services/products';
import { getCategories, getCategoryBySlug } from '@/lib/services/categories';
import { getCollections, fetchCollectionBySlug } from '@/lib/services/collections';
import { getSettings } from '@/lib/services/settings';
import { getDomainBrand, cleanBrandName } from '@/lib/utils/getDomainBrand';
import { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const revalidate = 3600; // 1 hour ISR — webhooks purge on admin save

interface PageProps {
  searchParams: Promise<{ category?: string; collection?: string; search?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  try {
    const brand = await getDomainBrand();
    const { category: categorySlug, collection: collectionSlug } = await searchParams;
    const settings = await getSettings();
    const siteUrl = `${brand.protocol}://${brand.domain}`;

    let title = `Shop Products | ${brand.name}`;
    let description = (settings.meta_description || brand.tagline).slice(0, 160);
    let imageUrl = settings.banner_url || settings.logo_url || settings.favicon_url || '';
    let canonicalUrl = `${siteUrl}/shop`;

    if (categorySlug) {
      const category = await getCategoryBySlug(categorySlug);
      if (category) {
        const { data: seoMeta } = await supabaseAdmin
          .from('seo_meta')
          .select('*')
          .eq('entity_type', 'category')
          .eq('entity_id', category.id)
          .maybeSingle();

        title = cleanBrandName(seoMeta?.seo_title, brand.name) || `${category.name} | ${brand.name}`;
        
        let catDesc = cleanBrandName(seoMeta?.meta_description, brand.name) || category.description || `Explore our ${category.name} collection at ${brand.name}.`;
        description = catDesc.replace(/<[^>]*>?/gm, '').slice(0, 160);
        
        imageUrl = category.image_url || imageUrl;
        canonicalUrl = `${siteUrl}/shop?category=${categorySlug}`;
      }
    } else if (collectionSlug) {
      const collection = await fetchCollectionBySlug(collectionSlug);
      if (collection) {
        title = `${collection.name} Collection | ${brand.name}`;
        
        let colDesc = collection.description || `Explore our ${collection.name} collection at ${brand.name}.`;
        description = colDesc.replace(/<[^>]*>?/gm, '').slice(0, 160);
        
        imageUrl = collection.image_url || imageUrl;
        canonicalUrl = `${siteUrl}/shop?collection=${collectionSlug}`;
      }
    }

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
        images: [{ url: imageUrl, width: 1200, height: 630, alt: brand.name }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
      }
    };
  } catch {
    return {
      title: 'Shop',
      description: 'Browse our products.',
    };
  }
}

export default async function StoreShopPage({ searchParams }: PageProps) {
  const { category: categorySlug, collection: collectionSlug } = await searchParams;
  
  const [categories, collections, settings, brand, products] = await Promise.all([
    getCategories(),
    getCollections(),
    getSettings(),
    getDomainBrand(),
    getProducts()
  ]);

  const activeCat = categorySlug ? categories.find(c => c.slug === categorySlug) : undefined;


  const siteUrl = `${brand.protocol}://${brand.domain}`;

  let faqSchema: any = null;
  if (categorySlug) {
    const category = categories.find(c => c.slug === categorySlug);
    if (category) {
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
          "mainEntity": seoMeta.faq_schema.map((item: any) => ({
            "@type": "Question",
            "name": item.q,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": item.a
            }
          }))
        };
      }
    }
  }

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": products.map((p, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${siteUrl}/product/${p.slug}`,
      "name": p.name
    }))
  };

  // BreadcrumbList for the shop / category listing (helps Google & answer engines)
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": `${siteUrl}/` },
      { "@type": "ListItem", "position": 2, "name": "Shop", "item": `${siteUrl}/shop` },
      ...(activeCat
        ? [{ "@type": "ListItem", "position": 3, "name": activeCat.name, "item": `${siteUrl}/shop?category=${activeCat.slug}` }]
        : []),
    ],
  };

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
      <ShopPage
        initialProducts={products}
        categories={categories}
        collections={collections}
        settings={settings}
      />
    </>
  );
}

