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
  | 'value_props'
  | 'flash_sale'
  | 'image_with_text'
  | 'tabbed_product_grid'
  | 'circular_categories'
  | 'faq_accordion'
  | 'rich_text';

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
  value_props: {
    type: 'value_props',
    paletteLabel: 'Value Props',
    defaultTitle: 'Why Shop With Us',
    description: 'Premium icon + title + subtitle USP columns (delivery, COD, quality, returns).',
    defaultContent: {
      items: [
        { icon: 'truck', title: 'Fast Delivery', subtitle: '2–4 days nationwide' },
        { icon: 'cash', title: 'Cash on Delivery', subtitle: 'Pay when it arrives' },
        { icon: 'sparkles', title: 'Premium Quality', subtitle: 'Handpicked products' },
        { icon: 'returns', title: 'Easy Returns', subtitle: '7-day return policy' },
      ],
    },
    defaultSettings: { columns_desktop: 4, columns_mobile: 2, style: 'card' },
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
  image_with_text: {
    type: 'image_with_text',
    paletteLabel: 'Image + Text',
    defaultTitle: 'Our Brand Story',
    description: 'Left/right split: image on one side, heading + body + CTA on the other.',
    defaultSettings: { layout: 'image_left', image_width: 50, aspect_ratio: '4/3', text_align: 'left' },
    defaultContent: {
      heading: 'Our Story',
      body: 'Tell your brand story here...',
      button_text: 'Learn More',
      button_link: '/shop',
      image_url: '',
    },
  },
  tabbed_product_grid: {
    type: 'tabbed_product_grid',
    paletteLabel: 'Tabbed Products',
    defaultTitle: 'Explore Collection',
    deviceAware: true,
    description: 'New Arrivals / Best Sellers / Sale tabs in one section.',
    defaultSettings: {
      columns_desktop: 4,
      columns_tablet: 3,
      columns_mobile: 2,
      limit_per_tab: 8,
    },
    defaultContent: {
      tabs: [
        { id: 'new', label: 'New Arrivals', source: 'recent' },
        { id: 'best', label: 'Best Sellers', source: 'featured' },
        { id: 'sale', label: 'On Sale', source: 'sale' },
      ],
    },
  },
  circular_categories: {
    type: 'circular_categories',
    paletteLabel: 'Round Categories',
    defaultTitle: 'Shop By Style',
    deviceAware: true,
    description: 'Circular image chips in a horizontal scroll row.',
    defaultSettings: { item_size: 80, show_labels: true },
    defaultContent: { items: [] },
  },
  faq_accordion: {
    type: 'faq_accordion',
    paletteLabel: 'FAQ Accordion',
    defaultTitle: 'Frequently Asked Questions',
    description: 'Expandable Q&A accordion.',
    defaultSettings: {},
    defaultContent: {
      items: [
        { q: 'What are your delivery timelines?', a: '2–4 business days nationwide.' },
        { q: 'Do you offer Cash on Delivery?', a: 'Yes! COD is available on all orders.' },
        { q: 'How do I return an item?', a: 'Contact us on WhatsApp within 7 days.' },
      ],
    },
  },
  rich_text: {
    type: 'rich_text',
    paletteLabel: 'Rich Text',
    defaultTitle: 'About Our Brand',
    description: 'Simple text block — heading, paragraph, optional CTA button.',
    defaultSettings: { text_align: 'center', max_width: 'narrow' },
    defaultContent: {
      heading: 'Welcome to Our Store',
      body: 'We bring you the finest quality kids clothing and jewelry from Pakistan.',
      button_text: '',
      button_link: '',
    },
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

/**
 * SSOT — pure builder for a section's default `settings` + `content_data`.
 * Used by BOTH the server insert action and the client-side (draft) "Add Section".
 * Mirrors the registry defaults plus the few historical per-type merges so
 * local-add and server-insert produce identical shapes.
 */
export function buildSectionDefaults(sectionType: string): {
  settings: Record<string, any>;
  content_data: Record<string, any>;
} {
  const def = getSectionDef(sectionType);
  let settings: Record<string, any> = def?.defaultSettings ? { ...def.defaultSettings } : {};
  let content_data: Record<string, any> = def?.defaultContent ? { ...def.defaultContent } : {};

  if (sectionType === 'product_grid') {
    settings = { limit: 8, columns_desktop: 4, columns_mobile: 2, source: 'all', ...settings };
  } else if (sectionType === 'category_list') {
    settings = { columns_desktop: 6, columns_mobile: 3, ...settings };
  } else if (sectionType === 'hero_banner') {
    settings = { height_desktop: '450px', height_mobile: '220px', overlay_opacity: 0.3, ...settings };
  } else if (sectionType === 'recent_reviews') {
    settings = { limit: 3, ...settings };
  } else if (sectionType === 'flash_sale') {
    settings = { startTime: '', endTime: '', viewAllText: 'View All', viewAllUrl: '/shop', ...settings };
    content_data = { products: [], ...content_data };
  } else if (sectionType === 'value_props') {
    settings = { columns_desktop: 4, columns_mobile: 2, style: 'card', ...settings };
  }

  return { settings, content_data };
}
