import { getBrandRegistry, normalizeHost } from './registry';
import type { BrandConfig, BrandResolution } from './types';

/**
 * THE single entry point for brand data.
 *
 *   resolveBrand(req.headers.get('host'))  → BrandConfig
 *
 * Nothing else may read NEXT_PUBLIC_BRAND_* directly. Database `store_settings`
 * still wins for admin-editable values (name, colors, content); this is the
 * fallback/default layer and the host → brand mapping.
 */

export function resolveBrandDetailed(host?: string | null): BrandResolution {
  const registry = getBrandRegistry();
  const fallback = registry[0];
  const normalized = normalizeHost(host);

  if (!normalized) return { brand: fallback, matched: false, host: normalized };

  const match = registry.find((brand) => {
    const candidates = [...brand.hosts, brand.adminHost, brand.imageHost]
      .map((candidate) => normalizeHost(candidate))
      .filter(Boolean);
    return candidates.includes(normalized);
  });

  return match
    ? { brand: match, matched: true, host: normalized }
    : { brand: fallback, matched: false, host: normalized };
}

export function resolveBrand(host?: string | null): BrandConfig {
  return resolveBrandDetailed(host).brand;
}

export function getBrandBySlug(slug: string): BrandConfig | null {
  const normalized = (slug || '').trim().toLowerCase();
  if (!normalized) return null;
  return getBrandRegistry().find((brand) => brand.slug === normalized) || null;
}

export function isKnownBrandHost(host?: string | null): boolean {
  return resolveBrandDetailed(host).matched;
}

export type { BrandConfig, BrandResolution };
