/**
 * Product Card Styles SSOT & Canonical Sequence Registry
 * Maps sequential 01-15 cards to visual classes and legacy keys.
 */

export interface CardStyleOption {
  value: string;
  label: string;
  group: 'Core Standard Template' | 'Modern Showcase Layouts' | 'Premium Brand Themes' | 'Iconic Global Brand Archetypes';
  legacyKey: string;
  cssClass: string;
}

export const CARD_STYLE_OPTIONS: CardStyleOption[] = [
  {
    value: 'card_01',
    label: 'Card 01 — Classic Standard',
    group: 'Core Standard Template',
    legacyKey: 'style1',
    cssClass: 'sc-std',
  },
  {
    value: 'card_02',
    label: 'Card 02 — Neumorphic Soft Grey',
    group: 'Modern Showcase Layouts',
    legacyKey: 'showcase_1',
    cssClass: 'sc1',
  },
  {
    value: 'card_03',
    label: 'Card 03 — Geometric Mondrian',
    group: 'Modern Showcase Layouts',
    legacyKey: 'showcase_8',
    cssClass: 'sc8',
  },
  {
    value: 'card_04',
    label: 'Card 04 — Organic & Wavy',
    group: 'Modern Showcase Layouts',
    legacyKey: 'showcase_10',
    cssClass: 'sc10',
  },
  {
    value: 'card_05',
    label: 'Card 05 — Luxe Noir (Black & Gold)',
    group: 'Premium Brand Themes',
    legacyKey: 'showcase_11',
    cssClass: 'sc11',
  },
  {
    value: 'card_06',
    label: 'Card 06 — Pure Editorial (Scandi Minimal)',
    group: 'Premium Brand Themes',
    legacyKey: 'showcase_12',
    cssClass: 'sc12',
  },
  {
    value: 'card_07',
    label: 'Card 07 — Soft Pastel Glow (Beauty)',
    group: 'Premium Brand Themes',
    legacyKey: 'showcase_13',
    cssClass: 'sc13',
  },
  {
    value: 'card_08',
    label: 'Card 08 — Street Bold (Urban Streetwear)',
    group: 'Premium Brand Themes',
    legacyKey: 'showcase_14',
    cssClass: 'sc14',
  },
  {
    value: 'card_09',
    label: 'Card 09 — Frosted Glass (Apple-Style Clean)',
    group: 'Premium Brand Themes',
    legacyKey: 'showcase_15',
    cssClass: 'sc15',
  },
  {
    value: 'card_10',
    label: 'Card 10 — Terracotta Boutique (Artisan Earthy)',
    group: 'Premium Brand Themes',
    legacyKey: 'showcase_16',
    cssClass: 'sc16',
  },
  {
    value: 'card_11',
    label: 'Card 11 — Zara Haute Editorial (Slide-Drawer)',
    group: 'Iconic Global Brand Archetypes',
    legacyKey: 'showcase_20',
    cssClass: 'sc20',
  },
  {
    value: 'card_12',
    label: 'Card 12 — Daraz Deal Rush (Direct Cart & Urgency)',
    group: 'Iconic Global Brand Archetypes',
    legacyKey: 'showcase_21',
    cssClass: 'sc21',
  },
  {
    value: 'card_13',
    label: 'Card 13 — Nike Streetwear (Floating Corner FAB)',
    group: 'Iconic Global Brand Archetypes',
    legacyKey: 'showcase_22',
    cssClass: 'sc22',
  },
  {
    value: 'card_14',
    label: 'Card 14 — Amazon Marketplace (Split Dual-Action)',
    group: 'Iconic Global Brand Archetypes',
    legacyKey: 'showcase_23',
    cssClass: 'sc23',
  },
  {
    value: 'card_15',
    label: 'Card 15 — Sephora Chic (Center-Hover Pill)',
    group: 'Iconic Global Brand Archetypes',
    legacyKey: 'showcase_24',
    cssClass: 'sc24',
  },
];

export const LEGACY_CARD_STYLE_MAP: Record<string, string> = {
  style1: 'card_01',
  showcase_1: 'card_02',
  showcase_8: 'card_03',
  showcase_10: 'card_04',
  showcase_11: 'card_05',
  showcase_12: 'card_06',
  showcase_13: 'card_07',
  showcase_14: 'card_08',
  showcase_15: 'card_09',
  showcase_16: 'card_10',
  showcase_20: 'card_11',
  showcase_21: 'card_12',
  showcase_22: 'card_13',
  showcase_23: 'card_14',
  showcase_24: 'card_15',
};

export const STYLE_TO_CLASS_MAP: Record<string, string> = {
  card_01: 'sc-std',
  card_02: 'sc1',
  card_03: 'sc8',
  card_04: 'sc10',
  card_05: 'sc11',
  card_06: 'sc12',
  card_07: 'sc13',
  card_08: 'sc14',
  card_09: 'sc15',
  card_10: 'sc16',
  card_11: 'sc20',
  card_12: 'sc21',
  card_13: 'sc22',
  card_14: 'sc23',
  card_15: 'sc24',
  // Backward compatibility legacy lookups:
  style1: 'sc-std',
  showcase_1: 'sc1',
  showcase_8: 'sc8',
  showcase_10: 'sc10',
  showcase_11: 'sc11',
  showcase_12: 'sc12',
  showcase_13: 'sc13',
  showcase_14: 'sc14',
  showcase_15: 'sc15',
  showcase_16: 'sc16',
  showcase_20: 'sc20',
  showcase_21: 'sc21',
  showcase_22: 'sc22',
  showcase_23: 'sc23',
  showcase_24: 'sc24',
};

export function normalizeCardStyle(style?: string | null): string {
  if (!style) return 'card_01';
  return LEGACY_CARD_STYLE_MAP[style] || style;
}

export function getCardStyleClass(style?: string | null): string {
  if (!style) return 'sc-std';
  return STYLE_TO_CLASS_MAP[style] || STYLE_TO_CLASS_MAP[normalizeCardStyle(style)] || 'sc-std';
}
