/**
 * Product Card Styles SSOT & Canonical Sequence Registry
 * 10 Genuinely Distinct Structural Archetypes with 10 Different Layouts.
 * Each card features unique positions for Title, Price, Image, Swatches, Icons, and Buttons.
 */

export interface CardStyleOption {
  value: string;
  label: string;
  group: '10 Structural Brand Archetypes' | 'Classic Showcase Themes';
  legacyKey: string;
  cssClass: string;
  description: string;
}

export const CARD_STYLE_OPTIONS: CardStyleOption[] = [
  {
    value: 'card_01',
    label: 'Card 01 — Editorial Minimal (Zara / COS)',
    group: '10 Structural Brand Archetypes',
    legacyKey: 'showcase_20',
    cssClass: 'sc_editorial',
    description: 'Tall 3:4 image, bare thin heart, 1-line title & price, slide-up "+ QUICK ADD" drawer bar.',
  },
  {
    value: 'card_02',
    label: 'Card 02 — Marketplace Rating-First (Amazon / Daraz)',
    group: '10 Structural Brand Archetypes',
    legacyKey: 'showcase_23',
    cssClass: 'sc_marketplace',
    description: 'Red top deal ribbon, amber rating pill under image, price first, permanent bottom button with heart inside.',
  },
  {
    value: 'card_03',
    label: 'Card 03 — Athletic Floating FAB (Nike)',
    group: '10 Structural Brand Archetypes',
    legacyKey: 'showcase_22',
    cssClass: 'sc_athletic',
    description: 'Category kicker tag above title, condensed heavy typography, circular cart bubble overlapping image seam.',
  },
  {
    value: 'card_04',
    label: 'Card 04 — Flash Deal Rush (Daraz / Temu Refined)',
    group: '10 Structural Brand Archetypes',
    legacyKey: 'showcase_21',
    cssClass: 'sc_flashdeal',
    description: 'Corner discount ribbon, big price first, urgency bar, "Buy Now" pill on right of title row, eye text link.',
  },
  {
    value: 'card_05',
    label: 'Card 05 — Title-First Magazine (Scandi / Kinfolk)',
    group: '10 Structural Brand Archetypes',
    legacyKey: 'showcase_12',
    cssClass: 'sc_magazine',
    description: 'Title at the TOP above image, image centered with white margin, 50/50 split dual footer bar.',
  },
  {
    value: 'card_06',
    label: 'Card 06 — Polaroid Frame (Etsy / Depop)',
    group: '10 Structural Brand Archetypes',
    legacyKey: 'showcase_14',
    cssClass: 'sc_polaroid',
    description: 'White photo frame with thick bottom edge, handwritten title inside frame, rectangular add button.',
  },
  {
    value: 'card_07',
    label: 'Card 07 — Round Charm (Pandora / Swarovski)',
    group: '10 Structural Brand Archetypes',
    legacyKey: 'showcase_24',
    cssClass: 'sc_roundcharm',
    description: 'Circular cropped image, centered serif title, metallic dots, 3 text action links divided by lines.',
  },
  {
    value: 'card_08',
    label: 'Card 08 — Bottom Sheet (Native App / Nike App)',
    group: '10 Structural Brand Archetypes',
    legacyKey: 'showcase_10',
    cssClass: 'sc_bottomsheet',
    description: 'Slide-up sheet with drag handle over lower image, title left, price right, square icons far right.',
  },
  {
    value: 'card_09',
    label: 'Card 09 — Hang Tag (Boutique / Madewell)',
    group: '10 Structural Brand Archetypes',
    legacyKey: 'showcase_16',
    cssClass: 'sc_hangtag',
    description: 'Kraft paper hang tag overlapping image with price, heart bottom-left, underlined "Quick Add +" text link.',
  },
  {
    value: 'card_10',
    label: 'Card 10 — Story Swipe (Instagram Stories / Reels)',
    group: '10 Structural Brand Archetypes',
    legacyKey: 'showcase_15',
    cssClass: 'sc_storyswipe',
    description: 'Segmented story progress bars on top, dark bottom gradient overlay, round expanding "+" button.',
  },
  // Additional Classic & Showcase Templates
  {
    value: 'card_11',
    label: 'Card 11 — Classic Standard Clean',
    group: 'Classic Showcase Themes',
    legacyKey: 'style1',
    cssClass: 'sc-std',
    description: 'Default clean store layout with 3 circular top-right buttons.',
  },
  {
    value: 'card_12',
    label: 'Card 12 — Neumorphic Soft Grey',
    group: 'Classic Showcase Themes',
    legacyKey: 'showcase_1',
    cssClass: 'sc1',
    description: 'Soft grey inner shadows with pill status badges.',
  },
  {
    value: 'card_13',
    label: 'Card 13 — Geometric Mondrian',
    group: 'Classic Showcase Themes',
    legacyKey: 'showcase_8',
    cssClass: 'sc8',
    description: 'High-contrast bold black borders and architectural structure.',
  },
  {
    value: 'card_14',
    label: 'Card 14 — Luxe Noir (Black & Gold)',
    group: 'Classic Showcase Themes',
    legacyKey: 'showcase_11',
    cssClass: 'sc11',
    description: 'Luxury dark mode with gold-bordered accents.',
  },
  {
    value: 'card_15',
    label: 'Card 15 — Soft Pastel Glow (Beauty)',
    group: 'Classic Showcase Themes',
    legacyKey: 'showcase_13',
    cssClass: 'sc13',
    description: 'Rose blush tone for cosmetics and beauty products.',
  },
];

export const LEGACY_CARD_STYLE_MAP: Record<string, string> = {
  // Legacy aliases to 10 structural archetypes:
  showcase_20: 'card_01',
  showcase_23: 'card_02',
  showcase_22: 'card_03',
  showcase_21: 'card_04',
  showcase_12: 'card_05',
  showcase_14: 'card_06',
  showcase_24: 'card_07',
  showcase_10: 'card_08',
  showcase_16: 'card_09',
  showcase_15: 'card_10',
  // Classic themes aliases:
  style1: 'card_11',
  showcase_1: 'card_12',
  showcase_8: 'card_13',
  showcase_11: 'card_14',
  showcase_13: 'card_15',
};

export const STYLE_TO_CLASS_MAP: Record<string, string> = {
  card_01: 'sc_editorial',
  card_02: 'sc_marketplace',
  card_03: 'sc_athletic',
  card_04: 'sc_flashdeal',
  card_05: 'sc_magazine',
  card_06: 'sc_polaroid',
  card_07: 'sc_roundcharm',
  card_08: 'sc_bottomsheet',
  card_09: 'sc_hangtag',
  card_10: 'sc_storyswipe',
  card_11: 'sc-std',
  card_12: 'sc1',
  card_13: 'sc8',
  card_14: 'sc11',
  card_15: 'sc13',
  // Backward compatibility direct lookups:
  showcase_20: 'sc_editorial',
  showcase_23: 'sc_marketplace',
  showcase_22: 'sc_athletic',
  showcase_21: 'sc_flashdeal',
  showcase_12: 'sc_magazine',
  showcase_14: 'sc_polaroid',
  showcase_24: 'sc_roundcharm',
  showcase_10: 'sc_bottomsheet',
  showcase_16: 'sc_hangtag',
  showcase_15: 'sc_storyswipe',
  style1: 'sc-std',
  showcase_1: 'sc1',
  showcase_8: 'sc8',
  showcase_11: 'sc11',
  showcase_13: 'sc13',
};

export function normalizeCardStyle(style?: string | null): string {
  if (!style) return 'card_01';
  return LEGACY_CARD_STYLE_MAP[style] || style;
}

export function getCardStyleClass(style?: string | null): string {
  if (!style) return 'sc_editorial';
  return STYLE_TO_CLASS_MAP[style] || STYLE_TO_CLASS_MAP[normalizeCardStyle(style)] || 'sc_editorial';
}
