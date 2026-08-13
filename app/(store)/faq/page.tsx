import React from 'react';
import { getSettings } from '@/lib/services/settings';
import { getDomainBrand } from '@/lib/utils/getDomainBrand';
import { Metadata } from 'next';

export const revalidate = 60; // Cache for 1 minute

export async function generateMetadata(): Promise<Metadata> {
  try {
    const brand = await getDomainBrand();
    const settings = await getSettings();
    const siteUrl = settings?.storeUrl?.replace(/\/+$/, '') || process.env.NEXT_PUBLIC_SITE_URL || '';
    const ogImage = settings.bannerUrl || settings.logoUrl || '';
    const title = `Frequently Asked Questions (FAQ) | ${brand.name}`;
    const description = `Find answers to frequently asked questions at ${brand.name} about shipping, delivery, payments, returns, and orders.`;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${siteUrl}/faq`,
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
      title: 'Frequently Asked Questions (FAQ)',
      description: 'Find answers to frequently asked questions.',
    };
  }
}


export default async function FaqPage() {
  const settings = await getSettings();
  const content = settings.faqContent || '<h3>Frequently Asked Questions</h3><p>We are currently updating our FAQ section. Please check back later or contact us directly on WhatsApp!</p>';

  // Check if string contains HTML tags
  const isHtml = /<[a-z][\s\S]*>/i.test(content);

  return (
    <div className="min-h-[60vh] bg-gray-50 dark:bg-[#0f0f1b] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-[#16162a] rounded-3xl border border-gray-150 dark:border-gray-800 p-8 sm:p-10 shadow-sm">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
          Frequently Asked Questions
        </h1>
        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
          {isHtml ? (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            <div className="whitespace-pre-wrap">{content}</div>
          )}
        </div>
      </div>
    </div>
  );
}
