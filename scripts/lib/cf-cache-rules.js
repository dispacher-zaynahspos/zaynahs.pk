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

// Paths that must bypass cache but are NOT real pages:
//   /.well-known/ — SSL probe pings (1.4k/day fake health checks)
//   /cdn-cgi/     — Cloudflare internal (RUM analytics, etc.)
//   /s7pc/        — Third-party tracking scripts
// These are excluded from html-pages caching so they don't inflate
// "uncached HTML" metrics and waste Vercel invocations.
const PROBE_BYPASS_PATHS = [
  '/.well-known/',
  '/cdn-cgi/',
  '/s7pc/',
];

const PROBE_BYPASS_EXPR = PROBE_BYPASS_PATHS.map(
  (p) => `(http.request.uri.path contains "${p}")`
).join(' or ');

const DYNAMIC_BYPASS_EXPR = DYNAMIC_PATHS.map(
  (p) => `(http.request.uri.path contains "${p}")`
).join(' or ');

// Combined expression — dynamic user routes + probe/bot paths
const ALL_BYPASS_EXPR = `${DYNAMIC_BYPASS_EXPR} or ${PROBE_BYPASS_EXPR}`;

/**
 * @returns {Array<object>} Cloudflare `http_request_cache_settings` rules.
 */
function buildCacheRules() {
  return [
    {
      // Block caching for dynamic user routes AND probe/bot paths
      expression: ALL_BYPASS_EXPR,
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
      expression: '(http.request.uri.path wildcard "/storage/*")',
      description: 'storage-images',
      action: 'set_cache_settings',
      action_parameters: {
        cache: true,
        edge_ttl: { mode: 'override_origin', default: 31536000 },
        browser_ttl: { mode: 'override_origin', default: 31536000 },
      },
    },
    {
      // Only cache real HTML pages — excludes dynamic + probe paths
      expression: `(http.request.uri.path wildcard "/*") and not (${ALL_BYPASS_EXPR})`,
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
  ];
}

module.exports = { buildCacheRules, DYNAMIC_PATHS, PROBE_BYPASS_PATHS, DYNAMIC_BYPASS_EXPR, PROBE_BYPASS_EXPR, ALL_BYPASS_EXPR };
