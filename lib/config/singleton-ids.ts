/**
 * SINGLE SOURCE OF TRUTH for the fixed UUIDs of singleton configuration rows.
 *
 * Several tables in this project hold exactly ONE canonical row addressed by a
 * fixed UUID (seeded by migrations). These IDs were previously hardcoded as
 * string literals in ~15 files, which is a clone-readiness and SSOT hazard.
 * Import from here instead of pasting the literal.
 */

/** the single row in `store_settings` (all store-wide config + mirrored AI config) */
export const STORE_SETTINGS_ID = '00000000-0000-4000-8000-000000000001';

/**
 * the single row in `ai_settings`.
 * NOTE: `ai_enabled`, `auto_media_ai`, `auto_content_seo` etc. are mirrored
 * between `store_settings` and `ai_settings` by a DB trigger
 * (`20260617060000_add_global_ai_enabled_toggle.sql`). `store_settings` is the
 * canonical write target via `updateSettings()`; `ai_settings` is the mirror.
 */
export const AI_SETTINGS_ID = '00000000-0000-4000-8000-000000000002';

/**
 * the system "Shop" category every product is auto-linked to (storefront /shop
 * catalog). Seeded by migration; excluded from customer-facing category lists.
 */
export const SHOP_CATEGORY_ID = '00000000-0000-4000-8000-000000000099';
