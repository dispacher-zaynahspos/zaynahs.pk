import { getDomainConfig } from '@/lib/config/domains'
import { getSettings } from '@/lib/services/settings'

export async function getDomainBrand(): Promise<{ name: string; tagline: string; domain: string; protocol: string }> {
  try {
    let host = 'localhost:3000';
    let protocol = 'http';

    const settings = await getSettings().catch(() => null);

    if (
      typeof window !== 'undefined' &&
      window.location.host &&
      !window.location.hostname.includes('localhost') &&
      !window.location.hostname.includes('127.0.0.1')
    ) {
      host = window.location.host;
      protocol = window.location.protocol.replace(':', '') || 'https';
    } else {
      if (settings?.store_url) {
        try {
          const parsed = new URL(settings.store_url);
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
    }

    const config = getDomainConfig(host);
    if (settings?.store_name) {
      config.name = settings.store_name;
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
  // Legacy hardcoded names come from the environment — never from source.
  // LEGACY_BRAND_NAMES="OldBrand,OldBrand E-Store"
  const legacy = (process.env.LEGACY_BRAND_NAMES || '')
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length); // longest first: "OldBrand E-Store" before "OldBrand"

  return legacy.reduce(
    (acc, name) => acc.replace(new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), currentBrandName),
    text
  );
}
