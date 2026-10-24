import { MetadataRoute } from 'next';
import { getSettings } from '@/lib/services/settings';
import { getSiteUrl } from '@/lib/site-url-server';

export default async function robots(): Promise<MetadataRoute.Robots> {
  let siteUrl = '';
  try {
    const settings = await getSettings();
    siteUrl = await getSiteUrl(settings);
  } catch (e) {
    console.warn('Failed to load settings in robots:', e);
  }

  const disallowedPaths = [
    '/admin',
    '/admin/',
    '/cart',
    '/checkout',
    '/account',
    '/account/',
    '/login',
    '/signup',
    '/reset-password',
    '/wishlist',
    '/track-order',
    '/api',
    '/api/',
    '/*?*sort=',
    '/*?*page=',
  ];

  const aiBots = [
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'PerplexityBot',
    'Perplexity-User',
    'Google-Extended',
    'ClaudeBot',
    'anthropic-ai',
    'Claude-Web',
    'Applebot',
    'Applebot-Extended',
    'Bingbot',
    'Googlebot',
    'Googlebot-Image',
    'DuckAssistBot',
    'Amazonbot',
    'meta-externalagent',
    'FacebookBot',
    'CCBot',
    'cohere-ai',
    'YouBot',
    'Bytespider',
    'Diffbot',
  ];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: disallowedPaths,
      },
      // Explicitly allow all major AI / answer-engine crawlers for storefront, but strictly disallow /admin
      ...aiBots.map((bot) => ({
        userAgent: bot,
        allow: '/',
        disallow: disallowedPaths,
      })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl || undefined,
  };
}
