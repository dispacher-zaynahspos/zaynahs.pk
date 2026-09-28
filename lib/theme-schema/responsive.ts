/**
 * Theme Customizer — Responsive value model (Phase 1 foundation, RULE SSOT1).
 *
 * A responsive setting is stored as `{ base, tablet?, mobile? }` where:
 *   - `base`   = desktop value (always present, the source of truth)
 *   - `tablet` = optional override; inherits `base` when absent
 *   - `mobile` = optional override; inherits `tablet` (then `base`) when absent
 *
 * This replaces the legacy flat suffixed keys (`*_desktop/_tablet/_mobile`).
 * Migration helpers live in `./migrate` and keep old data readable (no data loss).
 */

import { z } from 'zod';

export type Device = 'desktop' | 'tablet' | 'mobile';

export interface ResponsiveValue<T> {
  base: T;
  tablet?: T;
  mobile?: T;
}

/** Zod schema factory for a responsive value of the given inner schema. */
export const responsiveSchema = <T extends z.ZodTypeAny>(inner: T) =>
  z.object({
    base: inner,
    tablet: inner.optional(),
    mobile: inner.optional(),
  });

/** Type guard: is this a `{ base, ... }` responsive object (vs a plain scalar)? */
export function isResponsive<T>(v: unknown): v is ResponsiveValue<T> {
  return typeof v === 'object' && v !== null && 'base' in (v as Record<string, unknown>);
}

/** Wrap a scalar into a responsive object (base only). */
export function toResponsive<T>(value: T): ResponsiveValue<T> {
  return { base: value };
}

/**
 * Resolve the effective value for a device, applying inheritance:
 *   mobile → (mobile ?? tablet ?? base)
 *   tablet → (tablet ?? base)
 *   desktop → base
 * Accepts a plain scalar too (treated as the same value on every device).
 */
export function resolve<T>(value: ResponsiveValue<T> | T | undefined, device: Device): T | undefined {
  if (value === undefined || value === null) return undefined;
  if (!isResponsive<T>(value)) return value as T;
  if (device === 'mobile') return value.mobile ?? value.tablet ?? value.base;
  if (device === 'tablet') return value.tablet ?? value.base;
  return value.base;
}

/** The raw (non-inherited) value stored for a device, or undefined if not overridden. */
export function getDeviceValue<T>(value: ResponsiveValue<T> | T | undefined, device: Device): T | undefined {
  if (value === undefined || value === null) return undefined;
  if (!isResponsive<T>(value)) return device === 'desktop' ? (value as T) : undefined;
  if (device === 'desktop') return value.base;
  return value[device];
}

/** Does this device have its own override (vs inheriting)? */
export function hasOverride<T>(value: ResponsiveValue<T> | T | undefined, device: Device): boolean {
  if (device === 'desktop') return true; // base always "set"
  if (!isResponsive<T>(value)) return false;
  return value[device] !== undefined;
}

/** Immutably set a device value. Setting desktop sets `base`; setting others sets the override. */
export function setDeviceValue<T>(
  value: ResponsiveValue<T> | T | undefined,
  device: Device,
  next: T,
): ResponsiveValue<T> {
  const current: ResponsiveValue<T> = isResponsive<T>(value)
    ? { ...value }
    : { base: (value as T) };
  if (device === 'desktop') current.base = next;
  else current[device] = next;
  return current;
}

/** Immutably clear a device override (resets it to inherit). Desktop cannot be cleared. */
export function clearDeviceOverride<T>(
  value: ResponsiveValue<T> | T | undefined,
  device: Device,
): ResponsiveValue<T> {
  const current: ResponsiveValue<T> = isResponsive<T>(value)
    ? { ...value }
    : { base: (value as T) };
  if (device !== 'desktop') delete current[device];
  return current;
}

export const DEVICES: Device[] = ['desktop', 'tablet', 'mobile'];

/** Preview iframe widths per device (px). */
export const DEVICE_WIDTHS: Record<Device, number> = {
  desktop: 1280,
  tablet: 768,
  mobile: 390,
};
