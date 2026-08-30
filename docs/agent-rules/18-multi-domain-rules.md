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
