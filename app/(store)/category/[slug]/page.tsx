import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getSettings } from '@/lib/services/settings';
import { getCategoryBySlug } from '@/lib/services/categories';
import { getDomainBrand, cleanBrandName } from '@/lib/utils/getDomainBrand';
import { Metadata } from 'next';

export const revalidate = 300; // Cache redirect for 5 minutes

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  try {
    const brand = await getDomainBrand();
    const { slug } = await params;

    const category = await getCategoryBySlug(slug);

    if (!category) return {};

    const { data: seoMeta } = await supabaseAdmin
      .from('seo_meta')
      .select('*')
      .eq('entity_type', 'category')
      .eq('entity_id', category.id)
      .maybeSingle();

    const settings = await getSettings();
    const siteUrl = `${brand.protocol}://${brand.domain}`;

    const title = cleanBrandName(seoMeta?.seo_title, brand.name) || `${category.name} | ${brand.name}`;
    const description = cleanBrandName(seoMeta?.meta_description, brand.name) || category.description || '';
    const imageUrl = category.imageUrl || settings.logoUrl || settings.faviconUrl || '';

    return {
      metadataBase: new URL(siteUrl),
      title,
      description,
      alternates: {
        canonical: `${siteUrl}/category/${slug}`
      },
      openGraph: {
        title,
        description,
        images: [{ url: imageUrl }]
      }
    };
  } catch {
    return {
      title: 'Shop',
      description: 'Browse our products.',
    };
  }
}

export default async function CategoryRedirectPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;


  // Legacy/default store → shop page with the category filter applied
  redirect(`/shop?category=${resolvedParams.slug}`);
}
