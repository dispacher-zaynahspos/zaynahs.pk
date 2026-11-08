export function getClientSiteUrl(settings?: { store_url?: string; storeUrl?: string }): string {
  // If in browser on a production/custom domain, the actual attached origin ALWAYS wins:
  if (
    typeof window !== 'undefined' &&
    window.location.origin &&
    !window.location.hostname.includes('localhost') &&
    !window.location.hostname.includes('127.0.0.1')
  ) {
    return window.location.origin.replace(/\/+$/, '');
  }

  const dbUrl = settings?.store_url || (settings as Record<string, unknown> | undefined)?.storeUrl as string | undefined;
  if (dbUrl) return dbUrl.replace(/\/+$/, '');

  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }

  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
}

export function cleanLocalhostUrls(text: string, siteUrl: string): string {
  if (!text) return '';
  return text.replace(/http:\/\/localhost:\d+/g, siteUrl.replace(/\/+$/, ''));
}