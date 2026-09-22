export async function getSiteUrl(settings?: { storeUrl?: string }): Promise<string> {
  if (settings?.storeUrl) return settings.storeUrl.replace(/\/+$/, '');
  try {
    if (typeof window === 'undefined') {
      const { headers } = await import('next/headers');
      const headersList = await headers();
      const host = headersList.get('host') || 'localhost:3000';
      const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
      return `${protocol}://${host}`;
    }
  } catch {
    return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  }
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}