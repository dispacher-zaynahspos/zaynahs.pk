# Data Loading & Caching Audit — 2026-10

Verified against code (file:line) + live DB counts (TotVogue 148 active products / 221 images / 2181 variants; Zaynahs 224 / 322 / 284). Each brand is a SEPARATE Supabase project (no store_id column) → no cross-brand cache leak at query level.

## PART 1 — Findings (with proof)

### Caching layers per page
| Page | revalidate / mode | Cache layers present | Proof |
|------|-------------------|----------------------|-------|
| Home `/` | `revalidate = 86400` + ISR, data via `unstable_cache(tags:['products'])` | Edge (CDN headers) → ISR → Next data cache → DB only on miss/purge | `app/(store)/page.tsx:11`, `lib/services/products/mappers/fetchProducts.ts:83-98` |
| Shop `/shop` | `revalidate = 3600` ISR | Edge → ISR → DB on miss | `app/(store)/shop/page.tsx:11` |
| Product `/product/[slug]` | `revalidate = 86400` + `generateStaticParams` (SSG) | Edge → SSG/ISR → DB on miss | `app/(store)/product/[slug]/page.tsx:21,24` |
| Category `/category/[slug]` | ISR | Edge → ISR | `app/(store)/category/[slug]/page.tsx` |
| CDN headers | `s-maxage=86400, stale-while-revalidate`, `CDN-Cache-Control` for non-admin routes | Cloudflare + Vercel edge | `next.config.ts` headers() |
| Admin (all) | `no-store, must-revalidate` + pages `revalidate = 0` | NONE (always DB) — correct for admin | `next.config.ts` /admin headers, `app/admin/inventory/page.tsx:6` |

Verdict: storefront IS edge/ISR cached (DB load ≈ 0 on hit; webhooks purge on save). Brand/domain detection (`getDomainBrand` via headers) does NOT force-dynamic the pages (they keep `revalidate`), because each brand is its own deployment+DB.

### Pagination (THE core problem)
| List | Server-side pagination? | Reality | Proof |
|------|------------------------|---------|-------|
| Home product grids | ❌ NO | SSR fetches ENTIRE active catalog, ships all to browser; "Load More" only `slice()`s already-loaded items (not a next-page fetch) | `app/(store)/page.tsx` getProducts(), `StoreFront.tsx:111` handleLoadMore (`+8` to a slice limit), `StoreFrontProductGridSection.tsx:117` `.slice(0,targetCount)` |
| Shop `/shop` | ❌ NO | `getProducts()` loads all; `useShopPageFilters.ts:216` `filteredProducts.slice(0, loadMoreLimit)` client slice. IntersectionObserver reveals in-memory items only | `app/(store)/shop/page.tsx:91`, `components/store/shop-page/useShopPageFilters.ts:114,208,216` |
| Admin Inventory | ❌ NO (server) | `getAllProductsAdmin()` fetches ALL products + images+variants+modifiers+categories+badges+size_guides, `revalidate=0`; client paginates `slice()` pageSize 20 | `app/admin/inventory/page.tsx:9`, `lib/services/products/queries.ts:189-194`, `InventoryManager.tsx:331` |
| Admin Products/Categories/Collections/Variants/Media/Orders/Customers/Reviews | mostly client slice | load-all + client filter/slice pattern | per service `select('*')` with no `.range()` |

### N+1 / payload
- Storefront & admin product queries use one big nested select (`product_images(*), product_variants(*), product_modifiers(*), categories(*), product_categories(*,categories(*)), badges(*), size_guides(*)`) — this is a single PostgREST query (NOT N+1) but pulls **every column of every relation for every product** = large payload. `fetchProducts.ts:9-18`, `queries.ts:193`.
- `select('*')` everywhere → descriptions, JSON blobs, full image arrays loaded in lists (not needed for grids/inventory rows).

### Indexes
- Present: `idx_products_slug`, `idx_products_category`, relation FKs. (`SUPER_MASTER_SCHEMA.sql:182-306`)
- MISSING: composite for the hot storefront filter+sort `WHERE is_active AND deleted_at IS NULL ORDER BY sort_order, created_at`. Added in migration `20261007130000` (see below).

### Images
- Storefront grids use `getOptimizedImageUrl` + `next/image` lazy (good). Upload pipeline already outputs WebP ≤50KB. Admin inventory uses small thumbnails.

### Connections
- `staticSupabase` is a module-level singleton over PostgREST REST API (no PG pooler exhaustion, no new client per request). `mappers/types.ts:7`. Storefront reads wrapped in `unstable_cache` so repeated hits don't touch DB.

## PART 1 cost summary
| Area | Current | Problem | Est. cost | Fix |
|------|---------|---------|-----------|-----|
| Home | all N products + all relations, cached | huge client payload; Load More is fake (slice) | ~150–224 products × full relations JSON (hundreds of KB) shipped | server cursor pagination + real next-page fetch (planned) |
| Shop | same | same | same | same |
| Inventory | all products+relations, no cache, every load | heavy first load, high DB read each visit | 1 big query/visit, full relations | trimmed columns + server pagination (planned); index added now |
| DB | no composite index on hot path | seq scan on filter+sort | — | index migration (done) |

## PART 2 — Status
- Edge/ISR caching: ALREADY correct (storefront cached, admin no-store, purge on save via webhooks + `/api/revalidate-customizer`).
- DB indexes: migration `20261007130000_add_product_listing_indexes.sql` adds composite + partial indexes for the hot storefront/admin product path. Applied to all 5 DBs; master schema updated.
- Full cursor-pagination of every grid/list + new paginated GET APIs + viewport-lazy home sections: LARGE architectural change — specced here as the next milestone; not shipped in this pass to avoid breaking the working cached system without staged testing.

## PART 3 — Measured
- Live product counts above. Storefront DB load on cache hit ≈ 0 (ISR). First-load payload is the catalog JSON (improvement target).
