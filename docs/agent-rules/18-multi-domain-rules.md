# 18 — Multi-Domain System Rule

This app runs across ANY domain (localhost, custom domain, production). Never hardcode a domain or brand name.

## Always use
- **Server-side**: `getSiteUrl(settings)` from `@/lib/site-url-server` — uses `settings.storeUrl` first, then detects the `host` header.
- **Client-side**: `getClientSiteUrl(settings)` from `@/lib/site-url` — uses `settings.storeUrl` first, then `window.location.origin`.
- **URL cleanup**: `cleanLocalhostUrls(text, siteUrl)` from `@/lib/site-url` — replaces localhost URLs with the dynamic site URL.
- **Brand name**: `settings.storeName || process.env.NEXT_PUBLIC_BRAND_NAME || 'Zaynahs E-Store'`.
- **Logo**: `settings.logoUrl` — always from general settings, never fallback to Vercel/Next.js default favicon.
- **Favicon**: `settings.faviconUrl` — always from general settings, served via a `/favicon.ico` route that reads from DB.
- **OG image**: `settings.logoUrl` or `settings.bannerUrl` — never the Vercel/Next.js default og-image.
- **Google index / SEO**: all meta tags, JSON-LD schema, canonical URLs, sitemap, robots.txt use the `getSiteUrl()` value.
- All image URLs in meta tags use `cleanLocalhostUrls()` to guarantee absolute paths.

## CRITICAL — never use `getSiteUrl()` inside `generateMetadata`
- `getSiteUrl()` imports `headers()` from `next/headers`, which forces `cache-control: private, no-store`.
- Kills ISR (`revalidate`) and Cloudflare CDN cache.
- Always use directly: `settings?.storeUrl?.replace(/\/+$/, '') || process.env.NEXT_PUBLIC_SITE_URL || ''`.
- Exception: inside the page component (not `generateMetadata`) — allowed.
- See also RULE C1 in [08-caching-isr-ssr.md](08-caching-isr-ssr.md).

## Never use
- Hardcoded `totvogue.pk`, `zaynahs.pk`, `TotVogue.pk` — all values must come from DB settings or request headers.
- `process.env.NEXT_PUBLIC_SITE_URL` as a final fallback — use the `getSiteUrl()` helper inside page components instead.
- `.replace(/http:\/\/localhost:3000/g, '...')` — use `cleanLocalhostUrls()` instead.
- Vercel/Next.js default favicon, logo, or og-image — always read from DB settings.
- Hardcoded `favicon.ico` in `/public/` — the app serves favicon dynamically from `settings.faviconUrl`.

## OG Meta pattern
Full `generateMetadata()` template and rules: [14-design-system.md](14-design-system.md) "OG Meta Rule" section.

## RULE MD1 — Host canonicalization has EXACTLY ONE owner (never in code)
Root cause of a past `ERR_TOO_MANY_REDIRECTS` outage on ALL stores: `middleware.ts`
emitted a `www → apex` **301**, while the Vercel domain layer redirected `apex → www`.
Two layers pushing opposite directions = infinite loop. The 301 (permanent) also got
hard-cached by Cloudflare/browsers, so it survived deploys until an explicit purge.

Permanent rules:
1. **Canonical host = `www.<domain>`** (matches `NEXT_PUBLIC_SITE_URL=https://www.<domain>` for every store). This is the single agreed direction.
2. **Only ONE layer owns the host redirect: the Vercel Domains dashboard** (`apex → www`). NEVER add a host/www/apex redirect in `middleware.ts`, `next.config.ts` `redirects()`, `vercel.json`, or any `redirect()` in a page/layout. If you see one, delete it.
3. **`middleware.ts` matcher stays scoped to `/admin/:path*`** — it exists only for the admin auth gate + Supabase session refresh. Do NOT widen it to all routes (that reintroduces the risk and runs the edge auth check on every storefront request).
4. **Never emit a host redirect as 301 anywhere.** Permanent redirects get cached by CDN/browsers and are near-impossible to undo. Host canonicalization is the Vercel layer's job; leave it alone.
5. **After ANY deploy that changes redirects/canonical, purge cache AFTER the deploy is live**, not before. Order: push → wait for Vercel deploy to go live → `node scripts/purge-all-caches.mjs` → verify. Purging before the deploy re-caches the old redirect.
6. **Reviews/list pages must never redirect on query params** (`rating`, `sort`, `search`, `page`). Validate/clamp them in the server component; URL is the single source of truth and each filter action = exactly ONE `router.replace` (server-driven fetch, no duplicate client fetch).
7. **Regression guard**: run `npm run check:redirects` (`scripts/check-redirects.mjs`, per-store via `DOMAIN=<host>`) after any redirect/middleware/domain change. It fails on loops, >5 hops, or a non-canonical final host.



