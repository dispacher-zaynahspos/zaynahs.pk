import { resolveBrand } from '@/lib/brand/resolve';

/**
 * Thin compatibility layer kept for existing callers.
 * The real source is `lib/brand/resolve.ts` — do not add new logic here.
 */
export function getDomainConfig(hostOrUrl: string): { name: string; tagline: string } {
  const brand = resolveBrand(hostOrUrl);
  return {
    name: brand.name || 'Online Store',
    tagline: brand.tagline,
  };
}

export function getDomainName(hostOrUrl: string): string {
  return getDomainConfig(hostOrUrl).name;
}
