/**
 * scripts/lib/cf-cache-rules.js — SINGLE SOURCE OF TRUTH for Cloudflare cache rules.
 *
 * Used by BOTH:
 *   - scripts/deploy-cloudflare-rules.js  (clone:setup / single store)
 *   - scripts/update-cf-cache-rules.mjs   (cf:rules:all / multi store)
 *
 * RULE CF-MANDATORY + RULE SSOT1: never duplicate the rule list again.
 *
 * IMPORTANT (2026-10-22 audit): do NOT force a short TTL here. The rule is
 * 30 days on purpose — every admin write purges the edge
 * (`revalidateStorefrontEdge` → purge_everything), so freshness does not depend
 * on the TTL. A short TTL only multiplies Vercel origin hits and burns
 * bandwidth (the exact reason this rule caches HTML at all).
 *
 * Cloudflare keeps HTML cache-eligible once a rule says `cache: true`, so if a
 * store ever serves stale pages, fix the PURGE path — never lower this TTL.
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
        // 30 days — safe because every admin write purges the edge
        // (revalidateStorefrontEdge + purge_everything). A short TTL only
        // increases Vercel origin hits/bandwidth, which is what we are avoiding.
        edge_ttl: { mode: 'override_origin', default: 2592000 },
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
