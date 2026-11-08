export async function getSiteUrl(settings?: { store_url?: string; storeUrl?: string }): Promise<string> {
  try {
    if (typeof window === 'undefined') {
      const { headers } = await import('next/headers');
      const headersList = await headers();
      const host = headersList.get('x-forwarded-host') || headersList.get('host');
      if (host) {
        const proto = headersList.get('x-forwarded-proto') || (host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https');
        return `${proto}://${host}`.replace(/\/+$/, '');
      }
    }
  } catch {
    // headers() throws during static site generation or outside of an active request lifecycle
  }

  const dbUrl = settings?.store_url || (settings as Record<string, unknown> | undefined)?.storeUrl as string | undefined;
  if (dbUrl) return dbUrl.replace(/\/+$/, '');

  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
}