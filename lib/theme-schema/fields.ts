/**
 * Theme Customizer — Field descriptor metadata (Phase 1 foundation, RULE SSOT1).
 *
 * A FieldDescriptor is the single source of truth for ONE setting: its type,
 * default, constraints, unit, device-scope, and UI presentation (label/help/group).
 * The shared control library renders a control purely from a descriptor, and the
 * storefront reads the same defaults — so customizer and storefront never drift.
 */

import type { Device } from './responsive';

export type FieldType =
  | 'toggle'
  | 'select'
  | 'segmented'
  | 'slider'
  | 'color'
  | 'text'
  | 'textarea'
  | 'link'
  | 'media'
  | 'spacing'
  | 'alignment'
  | 'typography'
  | 'border'
  | 'range'
  | 'repeater';

/** global = one value for all devices; responsive = per-device `{base,tablet,mobile}`. */
export type FieldScope = 'global' | 'responsive';

export interface FieldOption {
  label: string;
  value: string;
  /** optional icon key resolved by the control (from components/common/Icons). */
  icon?: string;
}

export interface FieldDescriptor<T = unknown> {
  /** storage key within section.settings / content_data / StoreSettings. */
  key: string;
  type: FieldType;
  label: string;
  help?: string;
  group?: string;
  scope?: FieldScope; // default 'global'
  default: T;
  // numeric / slider / range
  min?: number;
  max?: number;
  step?: number;
  unit?: string; // 'px' | '%' | 'ms' | 's' | 'rem' ...
  // select / segmented
  options?: FieldOption[];
  // color
  allowOpacity?: boolean;
  allowToken?: boolean;
  // media
  mediaKind?: 'image' | 'video' | 'any';
  // progressive disclosure: only show when another field in the same group is truthy/equals
  showIf?: { key: string; equals?: unknown; truthy?: boolean };
  /** free-form extra config for specialized controls (repeater item schema, presets…). */
  meta?: Record<string, unknown>;
}

/** Identity helper for authoring descriptors with full type inference. */
export function defineField<T>(d: FieldDescriptor<T>): FieldDescriptor<T> {
  return { scope: 'global', ...d };
}

/** A named, ordered group of fields (renders as one accordion section). */
export interface FieldGroup {
  id: string;
  label: string;
  /** tab bucket: Content | Layout | Style | Responsive | Advanced */
  tab?: 'content' | 'layout' | 'style' | 'responsive' | 'advanced';
  fields: FieldDescriptor[];
  /** collapsed by default? */
  collapsed?: boolean;
}

/** Build a flat default object from a list of descriptors. */
export function defaultsFromFields(fields: FieldDescriptor[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) out[f.key] = f.default;
  return out;
}

/** Should a field be visible given the current values (progressive disclosure)? */
export function isFieldVisible(field: FieldDescriptor, values: Record<string, unknown>): boolean {
  if (!field.showIf) return true;
  const target = values[field.showIf.key];
  if (field.showIf.truthy) return !!target;
  if ('equals' in field.showIf) return target === field.showIf.equals;
  return true;
}

export type { Device };
