/**
 * Product Card Styles SSOT & Canonical Sequence Registry
 * 10 Genuinely Distinct Structural Archetypes with 10 Different Layouts.
 * Each card features unique positions for Title, Price, Image, Swatches, Icons, and Buttons.
 */

export interface CardStyleOption {
  value: string;
  label: string;
  group: '10 Structural Brand Archetypes' | 'Classic Showcase Themes' | 'Ella Theme';
  legacyKey: string;
  cssClass: string;
  description: string;
}

export const CARD_STYLE_OPTIONS: CardStyleOption[] = [
  {
    value: 'card_01',
    label: 'Product Card Style 1 (Corner FAB (+) & Side Rail)',
    group: '10 Structural Brand Archetypes',
    legacyKey: 'showcase_22',
    cssClass: 'sc_style1',
    description: 'Heart top-right, side eye & compare icons, bottom-left size letters, and floating coral FAB (+) at the image seam.',
  },
  {
    value: 'card_02',
    label: 'Product Card Style 2 (Between-Seam 4-Icon Row)',
    group: '10 Structural Brand Archetypes',
    legacyKey: 'showcase_23',
    cssClass: 'sc_style2',
    description: 'Horizontal row of 4 circular outline buttons between image and title: Bag, Wishlist, Quickview, Compare.',
  },
  {
    value: 'card_03',
    label: 'Product Card Style 3 (Bottom 3-Action Segmented Pill)',
    group: '10 Structural Brand Archetypes',
    legacyKey: 'showcase_20',
    cssClass: 'sc_style3',
    description: 'White floating pill segmented with fine dividers [ 🛍️ | 👁 | 🔄 ] centered at bottom of image.',
  },
  {
    value: 'card_04',
    label: 'Product Card Style 4 (Split Options Drawer [Choose options | 👁])',
    group: '10 Structural Brand Archetypes',
    legacyKey: 'showcase_21',
    cssClass: 'sc_style4',
    description: 'Clean bottom split drawer [ Choose options ] button on left + square [ 👁 ] quick view button on right.',
  },
  {
    value: 'card_05',
    label: 'Product Card Style 5 (4-Icon Vertical Right Rail)',
    group: '10 Structural Brand Archetypes',
    legacyKey: 'showcase_12',
    cssClass: 'sc_style5',
    description: 'Vertical stack of 4 round white action buttons on right: Wishlist, Quickview, Compare, Add to Bag.',
  },
  {
    value: 'card_06',
    label: 'Product Card Style 6 (Seam Full-Width Black Cart Bar)',
    group: '10 Structural Brand Archetypes',
    legacyKey: 'showcase_14',
    cssClass: 'sc_style6',
    description: 'Solid black full-width rectangular "Add to cart" bar at the image bottom seam + 3 vertical side icons.',
  },
  {
    value: 'card_07',
    label: 'Product Card Style 7 (Floating 3-Bubble Center Row)',
    group: '10 Structural Brand Archetypes',
    legacyKey: 'showcase_24',
    cssClass: 'sc_style7',
    description: '3 separate circular white buttons floating horizontally over image bottom center: Bag, Quickview, Compare.',
  },
  {
    value: 'card_08',
    label: 'Product Card Style 8 (Bottom Sticky Add to Cart Bar)',
    group: '10 Structural Brand Archetypes',
    legacyKey: 'showcase_10',
    cssClass: 'sc_style8',
    description: 'Full-width coral rounded "Add to cart" button placed at the very bottom of the card below swatches and size pills.',
  },
  {
    value: 'card_09',
    label: 'Product Card Style 9 (In-Between Seam Add to Cart Bar)',
    group: '10 Structural Brand Archetypes',
    legacyKey: 'showcase_16',
    cssClass: 'sc_style9',
    description: 'Coral rounded full-width "Add to cart" button placed between the image and the product title.',
  },
  {
    value: 'card_10',
    label: 'Product Card Style 10 (In-Card Quick Shop Sheet)',
    group: '10 Structural Brand Archetypes',
    legacyKey: 'showcase_15',
    cssClass: 'sc_style10',
    description: 'In-card interactive modal overlay with color selector, size circles, quantity stepper [- 1 +], and Add to cart.',
  },
  // Additional Classic & Showcase Themes
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
  // ── Ella Theme (8 Ella-inspired storefront card styles) ──
  {
    value: 'card_16',
    label: 'Ella 1 — Centered Clothing (hover icons + ADD TO CART bar)',
    group: 'Ella Theme',
    legacyKey: 'ella_1',
    cssClass: 'sc_ella1',
    description: 'Portrait, centered text; square Sale/Bundle badge top-left; vertical heart+eye icons top-right on hover; full-width outlined ADD TO CART bar at image bottom; vendor + 2-line title + From/sale price + centered swatches with +N.',
  },
  {
    value: 'card_17',
    label: 'Ella 2 — Bordered Parts (left text, lifted shadow)',
    group: 'Ella Theme',
    legacyKey: 'ella_2',
    cssClass: 'sc_ella2',
    description: 'Bordered card, soft shadow on hover; Sale badge top-right, heart top-left on hover; Quick View label; left-aligned vendor/title/stars/price; always-visible outlined ADD TO CART.',
  },
  {
    value: 'card_18',
    label: 'Ella 3 — Centered Menswear (navy cart bar + quick view strip)',
    group: 'Ella Theme',
    legacyKey: 'ella_3',
    cssClass: 'sc_ella3',
    description: 'Portrait centered; Sale badge top-right; centered heart + navy full-width ADD TO CART + stars on hover; QUICK VIEW strip under image; centered swatches with ring and +N.',
  },
  {
    value: 'card_19',
    label: 'Ella 4 — Fashion Left (quick view tab + wishlist link)',
    group: 'Ella Theme',
    legacyKey: 'ella_4',
    cssClass: 'sc_ella4',
    description: 'Portrait, left text; small SALE badge top-left; Quick view tab top-right on hover; outlined ADD TO CART + heart wishlist link below image; vendor row with stars right; 1-line title; left swatches.',
  },
  {
    value: 'card_20',
    label: 'Ella 5 — Fashion Gold (tan sale, overlay cart)',
    group: 'Ella Theme',
    legacyKey: 'ella_5',
    cssClass: 'sc_ella5',
    description: 'Portrait, left text; tan/gold Sale badge top-left; white eye circle top-right + white ADD TO CART overlay at image bottom; vendor + heart row; swatches; 1-line title; From/gold sale price; stars left + MORE SIZES AVAILABLE right.',
  },
  {
    value: 'card_21',
    label: 'Ella 6 — Eyewear Minimal (contained image, airy)',
    group: 'Ella Theme',
    legacyKey: 'ella_6',
    cssClass: 'sc_ella6',
    description: 'Contained image on white with soft shadow and extra whitespace; Sale badge top-right; left vendor + 2-line title + bold sale price; left swatches with +N.',
  },
  {
    value: 'card_22',
    label: 'Ella 7 — Swimwear Carousel (percent badge, arrows)',
    group: 'Ella Theme',
    legacyKey: 'ella_7',
    cssClass: 'sc_ella7',
    description: 'Portrait; salmon -N% badge top-left; white heart circle bottom-right (pink when active); white square < > arrows on hover; single-line title; From/pink-red sale price; left swatches; MORE SIZES AVAILABLE.',
  },
  {
    value: 'card_23',
    label: 'Ella 8 — Wigs (outlined badge, image swatches, right icon rail)',
    group: 'Ella Theme',
    legacyKey: 'ella_8',
    cssClass: 'sc_ella8',
    description: 'Light-grey image bg; outlined red Sale badge top-left; heart circle bottom-right always; vertical right rail (heart/eye/compare/bag) on hover; bold vendor + 1-line title; strike + From + red price + red (-N%); round image-thumbnail swatches.',
  },
];

export const LEGACY_CARD_STYLE_MAP: Record<string, string> = {
  // Legacy aliases to 10 structural archetypes:
  showcase_22: 'card_01',
  showcase_23: 'card_02',
  showcase_20: 'card_03',
  showcase_21: 'card_04',
  showcase_12: 'card_05',
  showcase_14: 'card_06',
  showcase_24: 'card_07',
  showcase_10: 'card_08',
  showcase_16: 'card_09',
  showcase_15: 'card_10',
  // Classic themes aliases:
  ella_1: 'card_16', ella_2: 'card_17', ella_3: 'card_18', ella_4: 'card_19',
  ella_5: 'card_20', ella_6: 'card_21', ella_7: 'card_22', ella_8: 'card_23',
  style1: 'card_11',
  showcase_1: 'card_12',
  showcase_8: 'card_13',
  showcase_11: 'card_14',
  showcase_13: 'card_15',
};

export const STYLE_TO_CLASS_MAP: Record<string, string> = {
  card_01: 'sc_style1',
  card_02: 'sc_style2',
  card_03: 'sc_style3',
  card_04: 'sc_style4',
  card_05: 'sc_style5',
  card_06: 'sc_style6',
  card_07: 'sc_style7',
  card_08: 'sc_style8',
  card_09: 'sc_style9',
  card_10: 'sc_style10',
  card_11: 'sc-std',
  card_12: 'sc1',
  card_13: 'sc8',
  card_14: 'sc11',
  card_15: 'sc13',
  card_16: 'sc_ella1', card_17: 'sc_ella2', card_18: 'sc_ella3', card_19: 'sc_ella4',
  card_20: 'sc_ella5', card_21: 'sc_ella6', card_22: 'sc_ella7', card_23: 'sc_ella8',
  // Backward compatibility direct lookups:
  sc_athletic: 'sc_style1',
  sc_marketplace: 'sc_style2',
  sc_editorial: 'sc_style3',
  sc_flashdeal: 'sc_style4',
  sc_magazine: 'sc_style5',
  sc_polaroid: 'sc_style6',
  sc_roundcharm: 'sc_style7',
  sc_bottomsheet: 'sc_style8',
  sc_hangtag: 'sc_style9',
  sc_storyswipe: 'sc_style10',
  showcase_22: 'sc_style1',
  showcase_23: 'sc_style2',
  showcase_20: 'sc_style3',
  showcase_21: 'sc_style4',
  showcase_12: 'sc_style5',
  showcase_14: 'sc_style6',
  showcase_24: 'sc_style7',
  showcase_10: 'sc_style8',
  showcase_15: 'sc_style10',
};

export function normalizeCardStyle(style?: string | null): string {
  if (!style) return 'card_01';
  return LEGACY_CARD_STYLE_MAP[style] || style;
}

export function getCardStyleClass(style?: string | null): string {
  if (!style) return 'sc_editorial';
  return STYLE_TO_CLASS_MAP[style] || STYLE_TO_CLASS_MAP[normalizeCardStyle(style)] || 'sc_editorial';
}
