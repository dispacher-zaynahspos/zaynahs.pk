# 08 — Caching / ISR / SSR Rules

## Strategy
Next.js built-in cache + `revalidateTag` (ISR) as primary strategy, combined with Cloudflare Edge CDN cache purging. Rationale: zero extra cost/infra, Vercel global CDN edge caching, on-demand revalidation (admin save → instant storefront refresh + Cloudflare purge).

## Never block SSR with non-critical data
Social proofs, banners, recommendations — anything non-critical must be:
- Fetched client-side (`'use client'` component + `useEffect` + dynamic import), OR
- Wrapped in `Promise.race` with a max-2s timeout, caught with `.catch(() => [])`.
- Default to `[]`, let client-side fetch populate.

## ISR pattern
`export const revalidate = 2592000` (30 days) on all storefront pages (RULE C12.3). Webhooks purge cache on admin save (`revalidateTag`, `revalidatePath`, `purgeCloudflareEverything()`). Since Cloudflare edge + Next.js tags are purged instantly on every admin mutation, long ISR guarantees 0 Vercel Fast Origin Transfer load without serving stale content to customers.

## Server/client split for site-url
- `lib/site-url-server.ts` = server-only (`next/headers`) — never import in client components.
- `lib/site-url.ts` = client-safe (`window.location.origin`), no `next/headers`.

## Cloudflare cache override
Always set `cdn-cache-control: public, s-maxage=2592000, stale-while-revalidate=86400` — CDN s-maxage matches long ISR to eliminate Vercel origin traffic. Admin mutations purge Cloudflare edge globally (< 1s), keeping customer experience 100% fresh.

## New feature caching checklist (whenever a new DB-driven page/feature is added)
1. Wrap data fetches in `unstable_cache(fn, keyParts, { revalidate: 3600, tags: [tag] })` in `lib/services/`.
2. Add a revalidation helper in `lib/revalidate.ts` that calls `revalidateTag`/`revalidatePath` and `purgeCloudflareEverything()` so both Vercel ISR and Cloudflare Edge are cleared immediately (RULE C10).
3. Call the revalidation helper inside the corresponding `create`/`update`/`delete` service functions.
4. Update `app/api/revalidate/route.ts` to route Supabase DB-trigger webhooks for the new table.

## Next.js 16 revalidateTag — legacy model (RULE C12.1)
This project does NOT use `cacheComponents: true`, so we're on the **Previous Model**.
- `revalidateTag(tag: string)` — single argument ONLY. No second arg.
- ❌ NEVER: `revalidateTag(tag, { expire: 0 })` — invalid, silently ignored
- ❌ NEVER: `revalidateTag(tag, 'max')` — only for cacheComponents model
- ✅ ALWAYS: `revalidateTag(tag)` — plain call
- The `safeTag` wrapper in `lib/revalidate.ts` already handles this correctly.
- If TS compile fails, cast: `(revalidateTag as any)('tag')` — but single-arg should work.

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

## RULE C9 — Cloudflare edge cache purging strategy (MANDATORY & PERMANENT)
- **Zero-lag updates on all writes**: Whenever ANY storefront entity (product, price, variant, banner, homepage section, collection, category, store settings, footer) is mutated in admin or via webhook:
  1. Next.js cache: `revalidateTag(tag)` (clean single-arg only — Next.js 16 compliant) + `revalidatePath(...)`.
  2. Cloudflare Edge cache: ALWAYS call `purgeCloudflareEverything()` (`purge_everything: true`).
- **NEVER use single-URL purge (`purgeCloudflareUrls`)**: Regional Cloudflare edge nodes (Karachi, Singapore, Muscat) do not reliably bust single URLs on free/standard zones due to protocol/host mismatches. `purge_everything: true` wipes edge cache globally in < 1 second.
- **Post-deploy + Manual "Purge Cache" button**: ALWAYS use `purgeCloudflareEverything()`.

## RULE C10 — Every admin write auto-invalidates ALL cache layers (STRICT)
Manual "Purge Cache" button sirf **emergency** ke liye hai. **Normal save ke baad kabhi bhi manual purge zaroori na ho** — har admin write khud saari cache layers invalidate kare, ek hi **shared utility** (`lib/revalidate.ts`) ke through.
- **Ek shared invalidation utility** (`lib/revalidate.ts`) har write path me call ho.
- Ek save par saari layers invalidate hon: **Next.js Tags & Paths** (`revalidateTag` + `revalidatePath`), **Vercel Data Cache** (`unstable_cache` TTL ≤ 300s), aur **Cloudflare edge** (`purgeCloudflareEverything()`).
- **No stale-data leakage**: save ke turant baad koi bhi layer purani value serve na kare.

## RULE C13 — Cloudflare Browser Cache TTL MUST be 0 (Respect Origin) (CRITICAL)
- **Root Cause Prevention**: Cloudflare Zone Setting `browser_cache_ttl` MUST ALWAYS be set to `0` (Respect existing headers).
- **NEVER set `browser_cache_ttl` to 14400 (4 hours) or any positive value** at the Cloudflare zone level!
  - If set to 14400, Cloudflare injects `cache-control: max-age=14400` into every HTML page.
  - As a result, visitor and admin browsers (Chrome, Safari, iPhone) store the page on device disk for 4 hours and refuse to ask the server again, making all admin updates appear stuck despite successful edge purges!
- **Enforcement**:
  - `scripts/deploy-cloudflare-rules.js` automatically patches `browser_cache_ttl = 0` during clone setup (`npm run clone:setup`).
  - Next.js responses serve `s-maxage=300, stale-while-revalidate=...` without browser `max-age`, ensuring browsers always fetch fresh HTML from Cloudflare edge.

---

## CACHE1 — Active cache/page rule table
| Cloudflare Cache Rule | Action | Notes |
|------|--------|-------|
| `no-cache-dynamic` | cache:false (bypass) | cart, checkout, account, api, admin, wishlist, order, login, signup |
| `static-assets` | cache:true + edge_ttl:1yr | `/_next/static/*` — hash filenames, never stale |
| `html-pages` | **cache:true + edge_ttl:300s (5 min)** | HTML cached at CF edge (55ms TTFB in PK) — Cloudflare full purge on admin writes |
| `supabase-images` | cache:true + edge_ttl:30d | supabase.co images |

> ⚡ **html-pages = cache:true, edge_ttl: 300s (5 min) + Webhook Full Purge (RULE C10 RESTORED)**:
> HTML is cached at the Cloudflare edge for blazing-fast ~55ms TTFB in Pakistan. Whenever ANY admin change or DB webhook fires (products, prices, banners, categories, sections, settings), the webhook calls `purgeCloudflareEverything()` (`purge_everything: true`).
> **Why full purge is mandatory:** Single-URL purge (`files: [url]`) does NOT reliably invalidate across regional Cloudflare POPs (Karachi, Singapore, Muscat). `purge_everything: true` guarantees instant (<1s) global cache invalidation while preserving 5-minute edge caching between writes!

Page Rules (legacy fallback): `cart*`, `checkout*`, `my-account*` → `cache_level: bypass`.

**Cache flow — any admin save (product/category/banner/settings):**
```
Admin DB change → Supabase webhook → /api/revalidate
  → revalidateTag(tag) + revalidatePath(path)
  → Next.js ISR regenerates fresh page
  → purgeCloudflareEverything() (purge_everything: true)
  → Cloudflare edge instantly purged worldwide (0s lag)
  → Next visitor re-warms Cloudflare edge with fresh HTML (55ms TTFB) ✅
```

## CACHE2 — Enforcement checklist for every NEW feature/table/admin tab
1. **DB trigger**: add `revalidate-<table_name>` to `SUPER_MASTER_SCHEMA.sql` (+ migration) POSTing to `https://domain.com/api/revalidate` with `x-revalidate-secret`.
2. **Cache tags**: new data queries use appropriate tags (e.g. `['new_feature']`) via `unstable_cache`.
3. **Revalidation logic**: update `app/api/revalidate/route.ts` / `lib/revalidate.ts` to handle the new table — call `revalidateTag`/`revalidatePath` ONLY. Do NOT add `purgeCloudflareEverything()` unless this is a global/layout-level change (RULE C9).
4. **Multi-project sync**: apply schema changes + webhooks across ALL active project databases (TotVogue, Zaynahspk, MiniMahal, LittleMister) simultaneously.

## RULE C11 — Data Loading & Caching (lists, pagination, cache layers)
Verified 2026-10 (see `docs/AUDIT_DATA_LOADING_2026-10.md`). Applies to every list/grid on storefront + admin, both brands, all devices.
- **Cache layer order (storefront):** browser → Cloudflare/Vercel edge (`s-maxage` + `stale-while-revalidate`, set in `next.config.ts`) → Next.js ISR + `unstable_cache` with tags → DB only on miss or after Save/Purge. Public pages MUST keep an `export const revalidate` (never `force-dynamic`) unless truly per-request. Brand/domain detection must NOT force-dynamic the page (each brand is its own deployment + Supabase project — no `store_id`; no cross-brand cache leak).
- **Invalidation:** tag-based `revalidateTag`/`revalidatePath` + Cloudflare purge ONLY on Save/Purge or when products/stock/orders change (webhooks). No time-based DB hammering.
- **Pagination (mandatory):** any list MUST be server-side paginated (cursor preferred; `.range()`/`.limit()` acceptable) with per-device page size (~8–12 mobile, 12–20 desktop). First load fetches ONLY page 1. NEVER `getProducts()`-all + client `.slice()` for the visible list. "Load More" / infinite scroll MUST fetch the NEXT PAGE from the server (IntersectionObserver sentinel + fallback button, skeletons, stable keys, no dupes, correct end state). "View All" → paginated shop page.
- **Columns:** `select` only the columns a list needs; never `select('*')` with every nested relation for grid/inventory rows. Lists use thumbnails only; defer heavy fields (long description, JSON blobs, full image arrays) to the detail view.
- **N+1:** batch related data in one PostgREST nested select or a single `.in()` query; never per-row fetches.
- **Indexes:** every filter/sort column combo used by a list needs an index (e.g. `idx_products_active_sort` for `is_active, deleted_at, sort_order, created_at`). Ship as a numbered migration + master schema + apply to all DBs.
- **Connections:** reuse the module-level `staticSupabase`/`supabaseAdmin` singleton; no new client per request; no window-focus refetch loops.
- **Checklist for every new list/page:** (1) page 1 only on first load, (2) server pagination, (3) needed columns only, (4) index for its filter/sort, (5) thumbnails + lazy images, (6) cached (storefront) or no-store (admin), (7) brand-scoped, (8) sentinel + fallback + skeleton + end state.

> NOTE (known debt, tracked in audit): home/shop/inventory currently load the full catalog then client-slice. Convert to true server pagination per this rule as the next milestone.

## RULE C12 — Cache Invalidation Correctness (MANDATORY — NEVER BREAK)
**Root cause (2026-10 post-mortem):** Admin changes were invisible on storefront across ALL 5 stores because of 3 interacting cache bugs. These rules prevent recurrence PERMANENTLY.

### C12.1 — `revalidateTag` signature (Next.js 16 legacy model)
- **Project does NOT use `cacheComponents: true`** → we are on the **"Previous Model"** (`unstable_cache` + `revalidateTag`).
- In Next.js 16 legacy model: `revalidateTag(tag: string)` — **NO second argument**. The old `{ expire: 0 }` pattern is INVALID and silently ignored, causing stale-while-revalidate to serve old content indefinitely.
- ❌ **NEVER**: `revalidateTag(tag, { expire: 0 })` — does nothing, stale forever
- ❌ **NEVER**: `revalidateTag(tag, 'max')` — that's for `cacheComponents` model only
- ✅ **ALWAYS**: `revalidateTag(tag)` — plain single-arg call
- The `safeTag` wrapper in `lib/revalidate.ts` MUST call `mod.revalidateTag(tag)` with NO second arg.
- `app/api/revalidate/route.ts` direct calls MUST also be single-arg.

### C12.2 — CDN `s-maxage` ≤ ISR `revalidate` (cache coherence)
- `next.config.ts` `CDN-Cache-Control: s-maxage` MUST be ≤ the `unstable_cache({ revalidate })` value.
- If ISR revalidate = 300s (5 min), CDN s-maxage MUST be ≤ 300s.
- Otherwise CF/Vercel edge serves stale for hours/days even after ISR regeneration.
- Current correct values: `s-maxage=300, stale-while-revalidate=60` for storefront HTML.

### C12.3 — `unstable_cache` revalidate ≤ 300s for storefront-visible data
- Settings, homepage sections, banners, products — any data that admin can change and should appear on storefront — MUST use `revalidate: 300` (5 min max), NOT 86400.
- `revalidate: 86400` causes Vercel to add `stale-while-revalidate: 31535700` (365 DAYS!) to the response → stale content served for up to a year after tag invalidation.
- `revalidate: 300` → `stale-while-revalidate` window is small → changes visible within minutes even if tag purge has issues.

### C12.4 — Every admin save MUST trigger CF zone purge for settings/layout changes
- `revalidateSettings()` MUST call `purgeCloudflareEverything()` — always.
- `revalidateBanner()` / `revalidateHomepage()` MUST at minimum do targeted CF URL purge.
- Customizer save calls `/api/revalidate-customizer` which does both Next.js + CF purge.
- After CF purge, next visitor gets fresh page from Vercel origin.

### C12.5 — Clone setup MUST verify CF cache rules exist (SYNC check)
- `check-setup-sync.mjs` MUST verify every store in `env-backups/` has Cloudflare cache rules deployed.
- `clone-setup.mjs` step `cf:rules` MUST NOT be `{ optional: true }` — it's mandatory.
- Missing CF cache rules = storefront serves origin-only (2-7s TTFB) + no edge caching = terrible UX.

### C12.6 — Verification after ANY cache-related change
After touching revalidation, caching, CDN headers, or CF rules, run this verification:
```bash
# 1. Check cache headers are correct
curl -sI https://www.totvogue.pk/ | grep -i "cache-control\|stale-while-revalidate\|cf-cache"
# Expected: s-maxage=300, stale-while-revalidate=60, cf-cache-status: HIT

# 2. Test admin save → storefront freshness
node scripts/verify-store-network.mjs

# 3. Verify all stores have CF cache rules
node scripts/update-cf-cache-rules.mjs
```
