import type { BrandConfig } from './types';

/**
 * Brand registry — built from the environment, so adding a brand needs **no code
 * edit**: point a deployment at that brand's env file and everything below
 * resolves from it.
 *
 * Resolution order for each field:
 *   brand-specific env (BRAND_*) → site env (NEXT_PUBLIC_*) → neutral default
 *
 * No domain, name or ID is hardcoded here.
 */

export function normalizeHost(rawHost: string | null | undefined): string {
  if (!rawHost) return '';
  return rawHost
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    .split(':')[0]
    .replace(/^www\./, '');
}

function hostFromUrl(value: string | undefined): string {
  const raw = (value || '').trim();
  if (!raw) return '';
  try {
    return normalizeHost(new URL(raw).host);
  } catch {
    return normalizeHost(raw);
  }
}

function splitList(value: string | undefined): string[] {
  return (value || '')
    .split(',')
    .map((entry) => normalizeHost(entry))
    .filter(Boolean);
}

function titleFromHost(host: string): string {
  if (!host) return 'Online Store';
  const label = host.split('.')[0];
  if (!label || label === 'localhost' || label === '127.0.0.1') return 'Online Store';
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function slugFromHost(host: string): string {
  if (!host) return 'store';
  return host
    .split('.')[0]
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'store';
}

/** Hosts for this deployment: explicit list, else SITE_URL (apex + www). */
export function resolveHosts(): string[] {
  const explicit = splitList(process.env.BRAND_HOSTS);
  if (explicit.length > 0) return explicit;

  const site = hostFromUrl(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL);
  if (!site) return [];
  return [site, `www.${site}`];
}

export function buildDefaultBrand(): BrandConfig {
  const hosts = resolveHosts();
  const primaryHost = hosts[0] || '';
  const slug = (process.env.BRAND_SLUG || '').trim() || slugFromHost(primaryHost);
  const name =
    (process.env.NEXT_PUBLIC_BRAND_NAME || '').trim() || titleFromHost(primaryHost);

  return {
    slug,
    hosts,
    adminHost: (process.env.ADMIN_HOST || (primaryHost ? `admin.${primaryHost}` : '')).trim(),
    imageHost: (process.env.IMG_HOST || (primaryHost ? `img.${primaryHost}` : '')).trim(),
    name,
    tagline: (process.env.NEXT_PUBLIC_BRAND_TAGLINE || '').trim(),
    twitterHandle: (process.env.NEXT_PUBLIC_TWITTER_HANDLE || '').trim(),
    locale: (process.env.BRAND_LOCALE || 'en-PK').trim(),
    currency: (process.env.BRAND_CURRENCY || 'PKR').trim(),
    whatsapp: (process.env.NEXT_PUBLIC_WHATSAPP || '').trim(),
    supportEmail: (process.env.NEXT_PUBLIC_SUPPORT_EMAIL || '').trim(),
    socialLinks: {
      facebook: (process.env.NEXT_PUBLIC_FACEBOOK_URL || '').trim(),
      instagram: (process.env.NEXT_PUBLIC_INSTAGRAM_URL || '').trim(),
      tiktok: (process.env.NEXT_PUBLIC_TIKTOK_URL || '').trim(),
      twitter: (process.env.NEXT_PUBLIC_TWITTER_URL || '').trim(),
      youtube: (process.env.NEXT_PUBLIC_YOUTUBE_URL || '').trim(),
    },
  };
}

/**
 * Dynamically builds a BrandConfig for any attached domain on the fly.
 * Guarantees zero hardcoded domains — any attached domain is auto-configured.
 */
export function buildBrandForHost(rawHost: string): BrandConfig {
  const norm = normalizeHost(rawHost);
  const primaryHost = norm || 'store';
  const slug = (process.env.BRAND_SLUG || '').trim() || slugFromHost(primaryHost);
  const name =
    (process.env.NEXT_PUBLIC_BRAND_NAME || '').trim() || titleFromHost(primaryHost);

  return {
    slug,
    hosts: [primaryHost, `www.${primaryHost}`],
    adminHost: (process.env.ADMIN_HOST || (primaryHost ? `admin.${primaryHost}` : '')).trim(),
    imageHost: (process.env.IMG_HOST || (primaryHost ? `img.${primaryHost}` : '')).trim(),
    name,
    tagline: (process.env.NEXT_PUBLIC_BRAND_TAGLINE || '').trim(),
    twitterHandle: (process.env.NEXT_PUBLIC_TWITTER_HANDLE || '').trim(),
    locale: (process.env.BRAND_LOCALE || 'en-PK').trim(),
    currency: (process.env.BRAND_CURRENCY || 'PKR').trim(),
    whatsapp: (process.env.NEXT_PUBLIC_WHATSAPP || '').trim(),
    supportEmail: (process.env.NEXT_PUBLIC_SUPPORT_EMAIL || '').trim(),
    socialLinks: {
      facebook: (process.env.NEXT_PUBLIC_FACEBOOK_URL || '').trim(),
      instagram: (process.env.NEXT_PUBLIC_INSTAGRAM_URL || '').trim(),
      tiktok: (process.env.NEXT_PUBLIC_TIKTOK_URL || '').trim(),
      twitter: (process.env.NEXT_PUBLIC_TWITTER_URL || '').trim(),
      youtube: (process.env.NEXT_PUBLIC_YOUTUBE_URL || '').trim(),
    },
  };
}

/**
 * All brands this deployment knows about. Today: exactly one (one Worker per
 * brand). Future multi-brand: merge entries from a brand config file here —
 * consumers stay unchanged.
 */
export function getBrandRegistry(): BrandConfig[] {
  return [buildDefaultBrand()];
}
