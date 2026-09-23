import { getDomainConfig } from '@/lib/config/domains'
import { getSettings } from '@/lib/services/settings'

export async function getDomainBrand(): Promise<{ name: string; tagline: string; domain: string; protocol: string }> {
  try {
    let host = 'localhost:3000';
    let protocol = 'http';

    const settings = await getSettings().catch(() => null);

    if (settings?.storeUrl) {
      try {
        const parsed = new URL(settings.storeUrl);
        host = parsed.host;
        protocol = parsed.protocol.replace(':', '');
      } catch {}
    } else if (process.env.NEXT_PUBLIC_SITE_URL) {
      try {
        const parsed = new URL(process.env.NEXT_PUBLIC_SITE_URL);
        host = parsed.host;
        protocol = parsed.protocol.replace(':', '');
      } catch {}
    } else if (process.env.VERCEL_URL) {
      host = process.env.VERCEL_URL;
      protocol = 'https';
    }

    const config = getDomainConfig(host);
    if (settings?.storeName) {
      config.name = settings.storeName;
    }
    if (settings?.tagline) {
      config.tagline = settings.tagline;
    }
    return { ...config, domain: host, protocol };
  } catch {
    const config = getDomainConfig('localhost:3000');
    return { ...config, domain: 'localhost:3000', protocol: 'http' };
  }
}


export function cleanBrandName(text: string | null | undefined, currentBrandName: string): string {
  if (!text) return '';
  // Case-insensitive replacement for legacy hardcoded names in DB
  return text
    .replace(/Zaynahs\s*E-Store/gi, currentBrandName)
    .replace(/Zaynahs/gi, currentBrandName);
}
