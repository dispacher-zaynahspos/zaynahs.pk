# 08 — Caching / ISR / SSR Rules

## Strategy
Next.js built-in cache + `revalidateTag` (ISR) as primary strategy, combined with Cloudflare Edge CDN cache purging. Rationale: zero extra cost/infra, Vercel global CDN edge caching, on-demand revalidation (admin save → instant storefront refresh + Cloudflare purge).

## Never block SSR with non-critical data
Social proofs, banners, recommendations — anything non-critical must be:
- Fetched client-side (`'use client'` component + `useEffect` + dynamic import), OR
- Wrapped in `Promise.race` with a max-2s timeout, caught with `.catch(() => [])`.
- Default to `[]`, let client-side fetch populate.

## ISR pattern
`export const revalidate = 86400` on all storefront pages. Webhooks purge cache on admin save (`revalidateTag`, `revalidatePath`, Cloudflare purge).

## Server/client split for site-url
- `lib/site-url-server.ts` = server-only (`next/headers`) — never import in client components.
- `lib/site-url.ts` = client-safe (`window.location.origin`), no `next/headers`.

## Cloudflare cache override
Always set `cdn-cache-control: public, s-maxage=86400, stale-while-revalidate=60` — this makes Cloudflare cache even pages with `cache-control: private`.

## New feature caching checklist (whenever a new DB-driven page/feature is added)
1. Wrap data fetches in `unstable_cache(fn, keyParts, { revalidate: 3600, tags: [tag] })` in `lib/services/`.
2. Add a revalidation helper in `lib/revalidate.ts` that revalidates the tag AND purges the specific page URLs (or `purgeCloudflareEverything()` if layout-level).
3. Call the revalidation helper inside the corresponding `create`/`update`/`delete` service functions.
4. Update `app/api/revalidate/route.ts` to route Supabase DB-trigger webhooks for the new table.

## Next.js 16 type-safety standard
`revalidateTag` type expects 2 args at compile time, runtime only needs 1. MUST cast to `any`:
```ts
(revalidateTag as any)('your-cache-tag');
```
Never call `revalidateTag('tag')` directly — TS compile fails with `TS2554`.

## Automated cache/webhook/DNS setup
For new forks: use the 1-click terminal commands in `docs/CLOUDFLARE_SUPABASE_SETUP.md` (DB webhooks, Cloudflare cache rules, `google-site-verification` DNS TXT record) instead of manual dashboard work. The Cloudflare deployer script auto-creates/updates the DNS TXT record matching `GOOGLE_SITE_VERIFICATION` in `.env.local`.

---

## RULE C1 — Never `headers()`/`cookies()` in store pages
Calling either in ANY Server Component (especially `generateMetadata`) forces the ENTIRE page into dynamic rendering → `cache-control: private, no-store` → ISR completely disabled.
```ts
// ❌ FORBIDDEN in app/layout.tsx, app/(store)/**/page.tsx, any store component
import { headers } from 'next/headers';
const h = await headers(); // kills ISR for the ENTIRE app if in root layout

// ✅ USE THIS INSTEAD
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.totvogue.pk';
```
**Allowed only in**: `app/robots.ts`, `app/sitemap.ts`, `app/admin/**`, `app/api/**`.
**Verify clean before every deploy**:
```bash
grep -rn "headers()\|cookies()" app/ --include="*.tsx" --include="*.ts" | grep -v "robots\|sitemap\|admin\|api"
# Must be EMPTY
```

## RULE C2 — Webhook test command
```bash
curl -X POST https://www.totvogue.pk/api/revalidate \
  -H "Content-Type: application/json" \
  -H "x-revalidate-secret: zaynahs_secret_cache_revalidate_2026" \
  -d '{"type":"UPDATE","table":"products","record":{"id":"test","slug":"any-slug","name":"Test"}}'
# Expected: {"revalidated":true,"table":"products","type":"UPDATE"}
```

## RULE C3 — Expected cache headers (healthy state)
| Page | cache-control | x-vercel-cache |
|---|---|---|
| `/*` store pages | `public, s-maxage=86400` | `HIT` (2nd request) |
| `/_next/static/*` | `immutable, 1 year` | `HIT` |
| `/admin/*`, `/api/*` | `no-store` | `MISS` |

## RULE C4 — Middleware vs Proxy (RSC caching skew)
- Never name the root proxy file `middleware.ts` — avoid Next.js RSC caching skew bugs with Cloudflare. Always name it `proxy.ts`.
- **Redirect caching**: when redirecting from `proxy.ts` to an auth page, append `?_nocache=timestamp` and set `cdn-cache-control: no-store, no-cache, must-revalidate`.
- **Mobile auth cookies**: mobile browsers reject cookies over 4KB. Always explicitly copy chunked cookies from `supabaseResponse` to the `NextResponse.redirect(url)` response inside `proxy.ts` via `.getAll().forEach()`.

## RULE C5 — Instant price/sale updates (no PR, no redeploy, no direct DB hit)
```
Admin saves Flash Sale / Price change
  → Supabase DB Trigger fires webhook
  → POST /api/revalidate (x-revalidate-secret)
  → revalidateTag('products') clears server RAM cache instantly (< 0.1s)
  → Next user request → server fetches fresh DB data ONCE
  → Fresh data stored back in RAM cache (unstable_cache, 24h TTL)
  → All subsequent users served from RAM cache
```
**Rules (never break):**
1. Every product/price mutation MUST call `revalidateTag('products')` via `lib/revalidate.ts` — no exceptions.
2. `/api/products/list` MUST have `Cache-Control: no-store, no-cache, must-revalidate` — never a static TTL.
3. `unstable_cache` in `lib/services/products.ts` wraps ALL DB queries with tag `'products'`, `revalidate: 86400` — DB is only hit when cache is cold or after revalidation.
4. After any Vercel deploy: run `node scripts/post-deploy-fix.mjs` (via the synchronous bash chain in [00-prime-directives.md](00-prime-directives.md)) to purge Cloudflare Edge CDN and prevent `ChunkLoadError`.
5. NEVER remove `revalidateTag('products')` from any admin save handler.

Result: price change visible to customers in < 1 second, zero DB hits per page load, no PR/redeploy/manual clear needed.

## RULE C6 — Cross-store import/export column mapping (MANDATORY)
- `products` table uses `is_active` (boolean) — NOT `active`. Different from `product_variants`, `categories`, `product_modifiers` which use `active`.
- `app/api/products/import/route.ts` MUST map: `is_active: (p as any).isActive ?? p.active ?? true` for all insert/update on `products`.
- NEVER use `active: p.active` on `products` — PostgREST throws `PGRST204: Could not find 'active' column`, crashing cross-store catalog import.
- Export route must output `isActive` (camelCase) so a future store clone can correctly re-import it.

## RULE C7 — Navigation progress bar on all route changes (MANDATORY)
- A visible red progress bar (`NextTopLoader` + `NavigationProgress`) MUST appear on EVERY internal navigation — menu clicks, category clicks, product clicks, back/forward, "View All", "Shop Now", etc.
- `NextTopLoader` alone does NOT catch `<Link>` clicks in App Router. `components/common/NavigationProgress.tsx` fills the gap by globally intercepting `<a>` clicks and calling `NProgress.start()`.
- Both MUST render in `app/layout.tsx` inside `<ThemeProvider>`:
  ```tsx
  <NextTopLoader color="#e94560" showSpinner={false} height={5} shadow="0 0 10px #e94560,0 0 5px #e94560" />
  <NavigationProgress />
  ```
- NEVER remove `NavigationProgress`. NEVER set `height` below 4. Keep `showSpinner={false}`.
- Any new navigation pattern (programmatic `router.push`, custom buttons with `window.location`) must also trigger the progress bar.

## RULE C8 — Stuck Vercel Data Cache & cache-key bumping (MANDATORY)
- **Bug**: `unstable_cache` on Vercel Data Cache occasionally ignores `revalidateTag` calls from webhooks (Next.js 14/15 bug), serving permanently stale product slugs/images/prices EVEN AFTER a fresh Vercel redeploy (Vercel Data Cache persists across deployments).
- **Symptom**: Supabase DB is correct, but the live storefront (e.g. `/shop`) keeps rendering old/deleted slugs → 404s for users on fresh devices.
- **Nuclear fix**: If a user reports products not updating/missing/404ing despite a correct DB, immediately bump the cache-key suffix in `lib/services/products.ts` (e.g. `['products-list']` → `['products-list-v2']` → `v3`...) and push a commit. This forces Vercel to treat it as a brand-new cache query, abandoning the poisoned cache node.

## RULE C9 — Cloudflare edge cache purging strategy (MANDATORY)
- NEVER use `purgeCloudflareUrls()` — Cloudflare URL purging is strict (exact protocol, `www` vs non-`www` matching) and silently fails on a slight mismatch.
- ALWAYS use `purgeCloudflareEverything()` inside `lib/revalidate.ts` functions (`revalidateBanner`, `revalidateHomepage`, `revalidateSettings`, etc.).
- Any admin save of layout, setting, product, or category → webhook must trigger a FULL zone purge for instant fresh data.

---

## CACHE1 — Active cache/page rule table
| Cloudflare Cache Rule | Action | Notes |
|------|--------|-------|
| `no-cache-dynamic` | cache:true + edge_ttl:0 + browser_ttl:0 | cart, checkout, account, api, admin |
| `static-assets` | cache:true + edge_ttl:1yr | `/_next/static/*` |
| `html-pages` | cache:true + edge_ttl:24h | all HTML pages (`/*`) |
| `supabase-images` | cache:true + edge_ttl:30d | supabase.co images |

Page Rules (fallback): `cart*`, `checkout*`, `my-account*` → `cache_level: bypass`.

⚠️ Cloudflare Free tier may still cache 200 HTML responses despite bypass rules — Pro plan ($20/mo) needed for strict bypass enforcement on cart/checkout/account.

**Cache purge flow**:
```
Admin DB change → Supabase webhook → /api/revalidate
  → revalidateTag() + revalidatePath() + purgeCloudflareEverything()
  → next visitor → MISS → fresh data → re-cached as HIT
```

## CACHE2 — Enforcement checklist for every NEW feature/table/admin tab
1. **DB trigger**: add `revalidate-<table_name>` to `SUPER_MASTER_SCHEMA.sql` (+ migration) POSTing to `https://domain.com/api/revalidate` with `x-revalidate-secret`.
2. **Cache tags**: new data queries use appropriate tags (e.g. `['new_feature']`) via `unstable_cache`.
3. **Revalidation logic**: update `app/api/revalidate/route.ts` / `lib/revalidate.ts` to handle the new table — call `revalidateTag` and trigger a Cloudflare purge.
4. **Multi-project sync**: apply schema changes + webhooks across ALL active project databases (TotVogue, Zaynahspk, MiniMahal, LittleMister) simultaneously.
