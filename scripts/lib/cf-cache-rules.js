/**
 * scripts/lib/cf-cache-rules.js — SINGLE SOURCE OF TRUTH for Cloudflare cache rules.
 *
 * Used by BOTH:
 *   - scripts/deploy-cloudflare-rules.js  (clone:setup / single store)
 *   - scripts/update-cf-cache-rules.mjs   (cf:rules:all / multi store)
 *
 * RULE CF-MANDATORY + RULE SSOT1: never duplicate the rule list again.
 *
 * IMPORTANT (2026-10-22 fix): the `html-pages` rule used to force
 * `edge_ttl: override_origin = 2592000` (30 days). That made Cloudflare cache
 * pages that Next.js serves with `Cache-Control: private, no-store`
 * (/shop, /product/*), so prices, stock, sold-out state and admin edits stayed
 * stale for up to a month (verified: cf-cache-status HIT with age > 2600s on a
 * no-store page).
 *
 * Always keep this TTL short (300s). Cloudflare keeps an HTML response eligible
 * for cache once the rule says `cache: true`, so the edge TTL — not the origin
 * header — is the real staleness ceiling. Instant price/stock updates come from
 * purge-on-write (`revalidateStorefrontEdge`), never from a long TTL.
 */

'use strict';

const DYNAMIC_PATHS = [
  '/cart',
  '/checkout',
  '/account',
  '/api',
  '/admin',
  '/wishlist',
  '/order',
  '/login',
  '/signup',
  '/reset-password',
];

const DYNAMIC_BYPASS_EXPR = DYNAMIC_PATHS.map(
  (p) => `(http.request.uri.path contains "${p}")`
).join(' or ');

/**
 * @returns {Array<object>} Cloudflare `http_request_cache_settings` rules.
 */
function buildCacheRules() {
  return [
    {
      expression: DYNAMIC_BYPASS_EXPR,
      description: 'no-cache-dynamic',
      action: 'set_cache_settings',
      action_parameters: { cache: false },
    },
    {
      expression: '(http.request.uri.path contains "/_next/static/")',
      description: 'static-assets',
      action: 'set_cache_settings',
      action_parameters: {
        cache: true,
        edge_ttl: { mode: 'override_origin', default: 31536000 },
      },
    },
    {
      expression: `(http.request.uri.path wildcard "/*") and not (${DYNAMIC_BYPASS_EXPR})`,
      description: 'html-pages',
      action: 'set_cache_settings',
      action_parameters: {
        cache: true,
        // 300s (5 min) — MUST stay short: Cloudflare keeps HTML eligible for
        // cache even when the origin sends `private, no-store`, so this TTL is
        // the real staleness ceiling. Admin writes purge the edge immediately
        // (revalidateStorefrontEdge), which is what makes price/stock instant.
        edge_ttl: { mode: 'override_origin', default: 300 },
        browser_ttl: { mode: 'override_origin', default: 0 },
      },
    },
    {
      expression: '(http.request.full_uri contains "supabase.co")',
      description: 'supabase-images',
      action: 'set_cache_settings',
      action_parameters: {
        cache: true,
        edge_ttl: { mode: 'override_origin', default: 2592000 },
      },
    },
  ];
}

module.exports = { buildCacheRules, DYNAMIC_PATHS, DYNAMIC_BYPASS_EXPR };
