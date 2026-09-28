import type { ShippingZone } from '@/lib/types';

/**
 * Pure, client-safe zone resolver (SSOT for city -> zone matching).
 * Used by the storefront checkout to pick a shipping cost from the entered city.
 *
 * Matching rule:
 *  1. First active zone whose `cities[]` contains the normalized city wins (by sort_order).
 *  2. Otherwise the active `is_default` (catch-all) zone.
 *  3. Otherwise null (caller falls back to the flat shipping-method cost — legacy behaviour).
 */
export function normalizeCity(city: string): string {
  return (city || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

export function resolveShippingZone(zones: ShippingZone[], city: string): ShippingZone | null {
  if (!Array.isArray(zones) || zones.length === 0) return null;
  const target = normalizeCity(city);
  const active = zones
    .filter(z => z.active)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  if (target) {
    const explicit = active.find(z =>
      (z.cities || []).some(c => normalizeCity(c) === target)
    );
    if (explicit) return explicit;
  }
  return active.find(z => z.is_default) || null;
}

/**
 * Effective shipping cost for a resolved zone + subtotal.
 * Returns null when no zone applies (caller keeps flat method cost).
 */
export function resolveZoneShippingCost(
  zone: ShippingZone | null,
  subtotal: number
): { cost: number; free: boolean } | null {
  if (!zone) return null;
  if (zone.free_threshold != null && subtotal >= zone.free_threshold) {
    return { cost: 0, free: true };
  }
  return { cost: Number(zone.cost) || 0, free: false };
}
