/**
 * Theme Customizer — Legacy ↔ responsive migration (Phase 1 foundation).
 *
 * Backward-compatible, lossless helpers to move between the legacy flat suffixed
 * keys (`foo_desktop`/`foo_tablet`/`foo_mobile`) and the new responsive object
 * `{ base, tablet?, mobile? }`. Reading old data never loses values; writing can
 * dual-write (both shapes) during the transition window so nothing breaks if some
 * storefront code still reads the old flat keys.
 */

import type { ResponsiveValue } from './responsive';

/**
 * Read a legacy flat responsive triple into a responsive object.
 * Only sets tablet/mobile when they differ from / are present alongside desktop.
 */
export function readFlatResponsive<T>(
  obj: Record<string, unknown> | undefined | null,
  baseKey: string,
  opts?: { desktopSuffix?: string },
): ResponsiveValue<T> | undefined {
  if (!obj) return undefined;
  const dSuffix = opts?.desktopSuffix ?? '_desktop';
  const d = obj[`${baseKey}${dSuffix}`];
  const t = obj[`${baseKey}_tablet`];
  const m = obj[`${baseKey}_mobile`];
  if (d === undefined && t === undefined && m === undefined) return undefined;
  const out: ResponsiveValue<T> = { base: (d as T) };
  if (t !== undefined) out.tablet = t as T;
  if (m !== undefined) out.mobile = m as T;
  return out;
}

/**
 * Write a responsive object back into legacy flat keys (dual-write for compatibility).
 * Returns a partial object you can spread into the payload.
 */
export function writeFlatResponsive<T>(
  baseKey: string,
  value: ResponsiveValue<T>,
  opts?: { desktopSuffix?: string },
): Record<string, T | undefined> {
  const dSuffix = opts?.desktopSuffix ?? '_desktop';
  return {
    [`${baseKey}${dSuffix}`]: value.base,
    [`${baseKey}_tablet`]: value.tablet ?? value.base,
    [`${baseKey}_mobile`]: value.mobile ?? value.tablet ?? value.base,
  };
}

/**
 * Fill any missing keys in `obj` with defaults (never overwrites existing values).
 * Used on load so a store saved before a new setting existed renders with the default.
 */
export function withDefaults<T extends Record<string, unknown>>(
  obj: T | undefined | null,
  defaults: Record<string, unknown>,
): T {
  const out: Record<string, unknown> = { ...(obj || {}) };
  for (const [k, v] of Object.entries(defaults)) {
    if (out[k] === undefined) out[k] = v;
  }
  return out as T;
}

/**
 * Coerce a value that might be legacy-flat OR already-responsive into a responsive
 * object, using the provided default for `base` when nothing is present.
 */
export function ensureResponsive<T>(
  value: ResponsiveValue<T> | T | undefined,
  fallback: T,
): ResponsiveValue<T> {
  if (value === undefined || value === null) return { base: fallback };
  if (typeof value === 'object' && value !== null && 'base' in (value as Record<string, unknown>)) {
    return value as ResponsiveValue<T>;
  }
  return { base: value as T };
}
