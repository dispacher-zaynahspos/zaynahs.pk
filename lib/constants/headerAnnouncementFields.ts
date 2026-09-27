/**
 * SINGLE SOURCE OF TRUTH for the Header / Top-Bar / Announcement (newsletter) fields
 * (RULE SSOT1). These 5 store_settings columns were previously editable from FOUR
 * separate components (HeaderTab, PremiumTab, Customizer GlobalSettings header,
 * Announcement Bar panel) each with its own drifted labels, placeholders and defaults.
 * The shared `HeaderAnnouncementFields` component + these constants are the one source.
 */

export const HEADER_ANNOUNCEMENT_LABELS = {
  showTopBar: 'Show Contact Announcement Bar',
  showNewsletter: 'Show Marketing Announcement Bar',
  topBarPhone: 'Top Bar Phone / WhatsApp',
  topBarPhonePlaceholder: 'e.g. 0328-4114551',
  topBarEmail: 'Top Bar Email',
  topBarEmailPlaceholder: 'e.g. support@store.com',
  newsletterText: 'Announcement Text (one line per rotating message)',
  newsletterPlaceholder: 'Free Delivery across Pakistan!\nSummer Sale — 50% Off!\nShop our new arrivals now!',
} as const;

/** Canonical defaults — used in BOTH the Settings and Customizer trees so a fresh
 *  row shows identical initial state (fixes the toggle ON-vs-OFF divergence). */
export const HEADER_ANNOUNCEMENT_DEFAULTS = {
  header_show_top_bar: true,
  header_show_newsletter: true,
  header_top_bar_phone: '',
  header_top_bar_email: '',
  header_newsletter_text: '',
} as const;
