/**
 * SINGLE SOURCE OF TRUTH for product-card / catalog option lists (RULE SSOT1).
 *
 * These option lists + defaults are shown in BOTH Settings → Products and the
 * Homepage Customizer → Product Cards / Shop pages. They previously drifted
 * (different aspect-ratio choices, labels and defaults in each place). Every
 * dropdown that offers these choices MUST import from here — never hardcode a
 * second copy.
 */

export interface SelectOption<T extends string | number = string> {
  value: T;
  label: string;
}

/** Product image aspect ratio (catalog cards + shop list). Canonical default: '3:4'. */
export const IMAGE_ASPECT_RATIO_OPTIONS: SelectOption[] = [
  { value: '3:4', label: '3:4 (Portrait — Fashion & Apparel)' },
  { value: '1:1', label: '1:1 (Square — Jewelry & Accessories)' },
  { value: '4:3', label: '4:3 (Landscape)' },
  { value: '16:9', label: '16:9 (Wide)' },
  { value: 'auto', label: 'Auto (Natural height)' },
];
export const DEFAULT_IMAGE_ASPECT_RATIO = '3:4';

/** Card image hover animation style. */
export const IMAGE_HOVER_STYLE_OPTIONS: SelectOption[] = [
  { value: 'second_image', label: 'Second Image (Fade Swap)' },
  { value: 'slide_left', label: 'Slide Left (Zara Style)' },
  { value: 'zoom_swap', label: 'Zoom & Swap (Luxury Editorial)' },
  { value: 'fade_up', label: 'Fade & Rise (Upward Drift)' },
  { value: 'blur_crossfade', label: 'Blur & Reveal (Apple Aesthetic)' },
  { value: 'flip_3d', label: '3D Card Turn (Jewelry/Accessories)' },
  { value: 'zoom', label: 'Primary Image Zoom' },
  { value: 'none', label: 'None (Static Image)' },
];
export const DEFAULT_IMAGE_HOVER_STYLE = 'second_image';

/** Archive/catalog title line clamp. */
export const TITLE_LINE_LIMIT_OPTIONS: SelectOption[] = [
  { value: '1', label: '1 Line Limit' },
  { value: '2', label: '2 Lines Limit (Default)' },
  { value: 'none', label: 'Full Title (Unlimited)' },
];
export const DEFAULT_TITLE_LINE_LIMIT = '2';

/** Variant swatch size scale (shared by archive + product swatch controls). */
export const SWATCH_SIZE_SCALE = ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;
export type SwatchSize = typeof SWATCH_SIZE_SCALE[number];
export const DEFAULT_SWATCH_SIZE: SwatchSize = 'md';

/** Variant swatch shape. */
export const SWATCH_SHAPE_SCALE = ['circle', 'square'] as const;
export type SwatchShape = typeof SWATCH_SHAPE_SCALE[number];
export const DEFAULT_SWATCH_SHAPE: SwatchShape = 'circle';

/** Swatch horizontal alignment on archive cards. */
export const SWATCH_ALIGN_SCALE = ['left', 'center', 'right'] as const;
export type SwatchAlign = typeof SWATCH_ALIGN_SCALE[number];
export const DEFAULT_SWATCH_ALIGN: SwatchAlign = 'left';

/** Action icon style preset options (5 presets). */
export const CARD_ICON_STYLE_OPTIONS: SelectOption[] = [
  { value: 'pill', label: 'Preset 1 — Modern Filled Pill (Solid High-Contrast Circles)' },
  { value: 'minimal', label: 'Preset 2 — Minimal Line (Thin Strokes, Borderless Floating)' },
  { value: 'luxe', label: 'Preset 3 — Luxury Metallic (Champagne Gold Accents)' },
  { value: 'brutalist', label: 'Preset 4 — Neo-Brutalist Sharp (Crisp 2px Border & Shadow)' },
  { value: 'glass', label: 'Preset 5 — Floating Frost Glass (Translucent Tactile Bubble)' },
];
export const DEFAULT_CARD_ICON_STYLE = 'pill';

/** Add to Cart Button Tactile Animation (PDP, Sticky Bar, QuickView Modal). */
export const ATC_ANIMATION_OPTIONS: SelectOption[] = [
  { value: 'none', label: 'None (Classic Solid Button)' },
  { value: 'morph_check', label: 'Morph Circle & Check (Spinner + Checkmark + Burst)' },
  { value: 'roll_swap', label: '3D Roll Swap (Icon & Text Flip)' },
  { value: 'ripple', label: 'Click Ripple (Radial Wave Fill)' },
  { value: 'border_draw', label: 'Border Draw (Outline Trace & Fill)' },
  { value: 'key_press', label: '3D Key Press (Tactile Push & Pop)' },
  { value: 'jelly', label: 'Jelly Bounce (Rubber Squash & Stretch)' },
  { value: 'plus_float', label: '+1 Floating Badge (Hop & Rise)' },
  { value: 'curtains', label: 'Curtains (Dual Side Slide & Reveal)' },
  { value: 'dots_tick', label: 'Dots to Tick (Bouncing Pulse & Check)' },
  { value: 'plus_tick', label: 'Plus to Tick (Rotating Morph & Circle)' },
  { value: 'sparkle', label: 'Sparkle Burst (Radiant Starburst Pop)' },
];
export const DEFAULT_ATC_ANIMATION = 'none';


