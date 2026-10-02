import React from 'react';
import { getSettings } from '@/lib/services/settings';
import { getDomainBrand } from '@/lib/utils/getDomainBrand';
import { Metadata } from 'next';

export const revalidate = 60; // Cache for 1 minute

export async function generateMetadata(): Promise<Metadata> {
  try {
    const brand = await getDomainBrand();
    const settings = await getSettings();
    const siteUrl = settings?.store_url?.replace(/\/+$/, '') || process.env.NEXT_PUBLIC_SITE_URL || '';
    const ogImage = settings.banner_url || settings.logo_url || '';
    const title = `Frequently Asked Questions (FAQ) | ${brand.name}`;
    const description = `Find answers to frequently asked questions at ${brand.name} about shipping, delivery, payments, returns, and orders.`;
    return {
      title,
      description,
      alternates: { canonical: `${siteUrl}/faq` },
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

/**
 * Parse freeform FAQ HTML into {question, answer} pairs for FAQPage JSON-LD.
 * Treats h2/h3/h4/<strong> as questions and the text until the next heading as the answer.
 */
function parseFaqPairs(html: string): { question: string; answer: string }[] {
  if (!html) return [];
  const stripTags = (s: string) => s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const pairs: { question: string; answer: string }[] = [];
  const headingRe = /<(h2|h3|h4|strong|b)[^>]*>([\s\S]*?)<\/\1>/gi;
  const matches: { q: string; end: number; start: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = headingRe.exec(html)) !== null) {
    matches.push({ q: stripTags(m[2]), start: m.index, end: headingRe.lastIndex });
  }
  for (let i = 0; i < matches.length; i++) {
    const q = matches[i].q;
    if (!q || q.length < 3) continue;
    const answerHtml = html.slice(matches[i].end, i + 1 < matches.length ? matches[i + 1].start : html.length);
    const answer = stripTags(answerHtml);
    if (answer && answer.length > 1) pairs.push({ question: q, answer: answer.slice(0, 800) });
  }
  return pairs.slice(0, 50);
}


export default async function FaqPage() {
  const settings = await getSettings();
  const content = settings.faq_content || '<h3>Frequently Asked Questions</h3><p>We are currently updating our FAQ section. Please check back later or contact us directly on WhatsApp!</p>';

  // Check if string contains HTML tags
  const isHtml = /<[a-z][\s\S]*>/i.test(content);

  const faqPairs = parseFaqPairs(content);
  const faqSchema = faqPairs.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqPairs.map((p) => ({
          '@type': 'Question',
          name: p.question,
          acceptedAnswer: { '@type': 'Answer', text: p.answer },
        })),
      }
    : null;

  return (
    <div className="min-h-[60vh] bg-gray-50 dark:bg-[#0f0f1b] py-12 px-4 sm:px-6 lg:px-8">
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}      <div className="max-w-3xl mx-auto bg-white dark:bg-[#16162a] rounded-3xl border border-gray-150 dark:border-gray-800 p-8 sm:p-10 shadow-sm">
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
