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

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
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
        ],
      },
      // Explicitly allow all major AI / answer-engine crawlers (AEO)
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Perplexity-User', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'anthropic-ai', allow: '/' },
      { userAgent: 'Claude-Web', allow: '/' },
      { userAgent: 'Applebot', allow: '/' },
      { userAgent: 'Applebot-Extended', allow: '/' },
      { userAgent: 'Bingbot', allow: '/' },
      { userAgent: 'Googlebot', allow: '/' },
      { userAgent: 'Googlebot-Image', allow: '/' },
      { userAgent: 'DuckAssistBot', allow: '/' },
      { userAgent: 'Amazonbot', allow: '/' },
      { userAgent: 'meta-externalagent', allow: '/' },
      { userAgent: 'FacebookBot', allow: '/' },
      { userAgent: 'CCBot', allow: '/' },
      { userAgent: 'cohere-ai', allow: '/' },
      { userAgent: 'YouBot', allow: '/' },
      { userAgent: 'Bytespider', allow: '/' },
      { userAgent: 'Diffbot', allow: '/' },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl || undefined,
  };
}
