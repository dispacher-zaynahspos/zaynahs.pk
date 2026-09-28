/**
 * Theme Customizer — Section registry (Phase 1 foundation, RULE SSOT1).
 *
 * ONE source of truth for every home-page layout section type. This consolidates
 * the 5 previously-scattered maps (palette labels, default titles, server insert
 * defaults, type→editor, type→renderer) into a single object so a new section is
 * registered once and naming/dedup is consistent.
 *
 * NOTE (Phase 1): this is additive — existing panels keep working. Phase 2 rewires
 * the scattered maps to read from here. `defaultSettings`/`defaultContent` mirror
 * the current server defaults so behaviour is unchanged.
 */

export type SectionType =
  | 'hero_banner'
  | 'product_grid'
  | 'category_list'
  | 'category_grid'
  | 'collections_grid'
  | 'promo_banner'
  | 'trust_badges'
  | 'recent_reviews'
  | 'brands_logos'
  | 'social_feed'
  | 'ticker'
  | 'flash_sale';

export interface SectionDef {
  type: SectionType;
  /** Label shown in the "Add Layout Section" palette. */
  paletteLabel: string;
  /** Default title assigned to a newly-created section (before dedup). */
  defaultTitle: string;
  /** Premium/plan-gated section (needs isSectionEnabled/feature flag). */
  premium?: boolean;
  /** Has any per-device controls (columns / dimensions). */
  deviceAware?: boolean;
  /** Default section.settings on insert (mirrors current server defaults). */
  defaultSettings?: Record<string, unknown>;
  /** Default section.content_data on insert. */
  defaultContent?: Record<string, unknown>;
  /** Short description for the palette tooltip. */
  description?: string;
}

export const SECTION_REGISTRY: Record<SectionType, SectionDef> = {
  hero_banner: {
    type: 'hero_banner',
    paletteLabel: 'Promo Slider',
    defaultTitle: 'Promo Slider',
    deviceAware: true,
    defaultSettings: { height_desktop: '450px', height_mobile: '220px', overlay_opacity: 0.3 },
    description: 'Full-width hero/slider with slides, video, text and CTAs.',
  },
  product_grid: {
    type: 'product_grid',
    paletteLabel: 'Product Grid',
    defaultTitle: 'Featured Products',
    deviceAware: true,
    defaultSettings: { limit: 8, columns_desktop: 4, columns_mobile: 2, source: 'all' },
    description: 'Grid/carousel of products from a source.',
  },
  category_list: {
    type: 'category_list',
    paletteLabel: 'Category Filter',
    defaultTitle: 'Shop By Category',
    deviceAware: true,
    defaultSettings: { columns_desktop: 6, columns_mobile: 3 },
    description: 'Horizontal category chip filter.',
  },
  category_grid: {
    type: 'category_grid',
    paletteLabel: 'Category Grid',
    defaultTitle: 'Featured Collection Highlights',
    deviceAware: true,
    description: 'Image grid of categories.',
  },
  collections_grid: {
    type: 'collections_grid',
    paletteLabel: 'Collections Grid',
    defaultTitle: 'Nested Collections Grid',
    deviceAware: true,
    description: 'Image grid of collections.',
  },
  promo_banner: {
    type: 'promo_banner',
    paletteLabel: 'Promo Banner',
    defaultTitle: 'Limited Time Deal',
    description: 'Single promotional banner with a CTA.',
  },
  trust_badges: {
    type: 'trust_badges',
    paletteLabel: 'Trust Badges',
    defaultTitle: 'Our Promises',
    description: 'Row of trust/USP badges.',
  },
  recent_reviews: {
    type: 'recent_reviews',
    paletteLabel: 'Reviews Feed',
    defaultTitle: 'Customer Reviews',
    defaultSettings: { limit: 3 },
    description: 'Recent customer reviews.',
  },
  brands_logos: {
    type: 'brands_logos',
    paletteLabel: 'Brands Slider',
    defaultTitle: 'Our Premium Partners',
    description: 'Row/slider of brand logos.',
  },
  social_feed: {
    type: 'social_feed',
    paletteLabel: 'Social Feed',
    defaultTitle: 'Follow Us',
    premium: true,
    deviceAware: true,
    description: 'Social media post grid (premium).',
  },
  ticker: {
    type: 'ticker',
    paletteLabel: 'Scrolling Ticker',
    defaultTitle: 'Announcement Ticker',
    description: 'Scrolling marquee of messages.',
  },
  flash_sale: {
    type: 'flash_sale',
    paletteLabel: 'Flash Sale Grid',
    defaultTitle: 'Super Flash Sale',
    premium: true,
    deviceAware: true,
    defaultSettings: { startTime: '', endTime: '', viewAllText: 'View All', viewAllUrl: '/shop' },
    defaultContent: { products: [] },
    description: 'Countdown flash-sale product grid (premium).',
  },
};

export const SECTION_TYPES = Object.keys(SECTION_REGISTRY) as SectionType[];

export function getSectionDef(type: string): SectionDef | undefined {
  return SECTION_REGISTRY[type as SectionType];
}

/** Palette list (ordered) for "Add Layout Section". */
export const SECTION_PALETTE: Array<{ type: SectionType; label: string; premium?: boolean; description?: string }> =
  SECTION_TYPES.map((t) => ({
    type: t,
    label: SECTION_REGISTRY[t].paletteLabel,
    premium: SECTION_REGISTRY[t].premium,
    description: SECTION_REGISTRY[t].description,
  }));

/**
 * Human label for a section, with de-duplication across the current stack.
 * Ensures two same-type sections get "Nested Collections Grid" + "Nested Collections Grid 2"
 * instead of two identical names, and never falls back to a generic "New Section".
 */
export function resolveDefaultTitle(
  type: string,
  existingTitles: string[],
): string {
  const def = getSectionDef(type);
  const base = def?.defaultTitle || (type ? type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Section');
  if (!existingTitles.includes(base)) return base;
  let n = 2;
  while (existingTitles.includes(`${base} ${n}`)) n++;
  return `${base} ${n}`;
}
