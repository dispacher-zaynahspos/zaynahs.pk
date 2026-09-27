import { StoreSettings } from '@/lib/types';

/**
 * SINGLE SOURCE OF TRUTH for premium / gated feature checks.
 *
 * Every storefront, customizer and admin gate MUST call `isFeatureEnabled`
 * (or `isSectionEnabled`) from this module instead of re-implementing an
 * inline `settings.<flag> === false` comparison. Adding a new gated feature
 * = one entry in `PREMIUM_FEATURE_FLAG` + `PREMIUM_FEATURE_LABEL`, and every
 * consumer picks it up automatically.
 *
 * Behavior is intentionally identical to the historical scattered checks:
 * a feature is considered DISABLED only when its flag is explicitly `false`.
 * Any other value (true / undefined / null) means ENABLED.
 */

export type PremiumFeature =
  | 'flash_sale'
  | 'social_feeds'
  | 'recent_buyers'
  | 'cookie_consent'
  | 'free_shipping_bar'
  | 'volume_discounts'
  | 'frequently_bought_together'
  | 'stock_urgency'
  | 'spin_wheel'
  | 'exit_intent'
  | 'cart_timer'
  | 'size_guide'
  | 'coupon_codes'
  | 'related_products';

/** feature key -> the `store_settings` boolean column that gates it */
export const PREMIUM_FEATURE_FLAG: Record<PremiumFeature, keyof StoreSettings> = {
  flash_sale: 'flash_sale_enabled',
  social_feeds: 'social_feeds_enabled',
  recent_buyers: 'recent_buyers_enabled',
  cookie_consent: 'cookie_consent_enabled',
  free_shipping_bar: 'free_shipping_bar_enabled',
  volume_discounts: 'volume_discounts_enabled',
  frequently_bought_together: 'frequently_bought_together_enabled',
  stock_urgency: 'stock_urgency_enabled',
  spin_wheel: 'spin_wheel_enabled',
  exit_intent: 'exit_intent_enabled',
  cart_timer: 'cart_timer_enabled',
  size_guide: 'size_guide_enabled',
  coupon_codes: 'coupon_codes_enabled',
  related_products: 'related_products_enabled',
};

/** human-facing labels used by admin toasts / lock badges */
export const PREMIUM_FEATURE_LABEL: Record<PremiumFeature, string> = {
  flash_sale: 'Flash Sale',
  social_feeds: 'Social Feeds',
  recent_buyers: 'Recent Buyers',
  cookie_consent: 'Cookie Consent',
  free_shipping_bar: 'Free Shipping Bar',
  volume_discounts: 'Volume Discounts',
  frequently_bought_together: 'Frequently Bought Together',
  stock_urgency: 'Stock Urgency',
  spin_wheel: 'Spin Wheel',
  exit_intent: 'Exit Intent',
  cart_timer: 'Cart Timer',
  size_guide: 'Size Guide',
  coupon_codes: 'Coupon Codes',
  related_products: 'Related Products',
};

/**
 * Homepage / customizer `section_type` -> the premium feature that gates it.
 * Section types not listed here are always available.
 */
export const SECTION_PREMIUM_FEATURE: Partial<Record<string, PremiumFeature>> = {
  flash_sale: 'flash_sale',
  social_feed: 'social_feeds',
};

/**
 * The one gate. Returns true unless the backing flag is explicitly `false`.
 */
export function isFeatureEnabled(
  settings: Partial<StoreSettings> | null | undefined,
  feature: PremiumFeature
): boolean {
  if (!settings) return true;
  const flag = PREMIUM_FEATURE_FLAG[feature];
  return settings[flag] !== false;
}

/** true if a given customizer/homepage section_type is currently allowed */
export function isSectionEnabled(
  settings: Partial<StoreSettings> | null | undefined,
  sectionType: string
): boolean {
  const feature = SECTION_PREMIUM_FEATURE[sectionType];
  if (!feature) return true;
  return isFeatureEnabled(settings, feature);
}

/** premium feature (if any) that gates a section_type — for lock badges/toasts */
export function sectionPremiumFeature(sectionType: string): PremiumFeature | null {
  return SECTION_PREMIUM_FEATURE[sectionType] ?? null;
}
