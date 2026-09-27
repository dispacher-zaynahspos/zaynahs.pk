# AUDIT PASS 8 — Performance, Caching Efficiency, Storage & DB Bandwidth

Status: **audit done; additive index migration authored (reviewable). Findings below are what was actually verified in code/schema — not assumed.**

## 1. Indexes — gaps found → `supabase/migrations/20260926160000_REVIEW_perf_indexes.sql`
The schema is already well-indexed (39 indexes: product FKs, slugs, `deleted_at`, reviews, social proof, abandoned carts, etc.). Verified gaps on hot paths:
- **`product_categories(category_id)`** — PK is `(product_id, category_id)`, so filtering products **by category** (the storefront category page) isn't covered by the PK prefix. Added.
- **`orders(created_at DESC)` + `orders(status)`** — admin Orders Log sorts by newest / filters by status; only `deleted_at` was indexed. Added.
- **`products(is_active)` partial + `products(is_featured)` partial** — storefront catalog listing filters. Added as partial indexes (small).
- `coupons.code` and `orders.order_number` are `UNIQUE` → already indexed (no action).

## 2. N+1 / query patterns
- **Storefront reads use joins, not N+1.** `getProducts` selects `*, product_images(*), product_variants(*), product_modifiers(*), product_categories(*, categories(*))` in one query (`lib/services/products`). Product detail, shop, home all go through this. Good.
- **Export route has an intentional per-image / per-variant `media_library` lookup loop** (`export/route.ts:110-130,165-178`) — a genuine N+1, but it's an **admin batch operation** run on demand for a selected set, not a storefront hot path. Acceptable; could be batched later (low priority).
- No evidence of storefront pages re-fetching settings repeatedly per render — `getSettings` is called once per request in the page/layout and passed down.

## 3. Caching efficiency (cross-ref Pass 5)
- Reads are tag-cached (`unstable_cache` tags) so repeated reads within/without a request hit the Next.js data cache.
- **Full-zone Cloudflare purge on every write is intentional** (RULE C9 — URL-scoped purge is unreliable on this multi-domain/www setup). It is the correctness-over-granularity trade-off; not accidental over-purging. High-frequency public writes (review submit) are tag-only by design (Pass 5) to avoid purge storms.
- `revalidateStorefrontEdge` (Pass 5) scopes admin-domain writes to the needed tags + a full purge — consistent, not per-handler ad-hoc.

## 4. Storage / bandwidth
- Uploads go through `/api/media/upload` → bucket `product-images`; images are Sharp-converted to WebP server-side (`lib/uploadImage.ts`) — **not served raw/uncompressed**. Good.
- **Orphan media cleanup gap (from Pass 5):** `media.ts` `restoreMedia`/`hardDeleteMedia` and post-delete flows don't proactively clean storage objects for deleted products/sections. Media Manager has a "cleaner" UI for unused assets, but there's no automatic orphan sweep. Low-to-medium: storage grows with churn. Tracked as a follow-up (a scheduled orphan-sweep job or delete-hook), not fixed here.
- Storefront images use Next.js `<Image>` with `sizes`/`fill` and preset URLs (`getPresetImageUrl`), with `loading="lazy"` on non-first grid images and `priority` on the first — verified in `ProductCard`/`HeroSlideItem`. Reasonable.

## 5. Honest "verified vs not"
- **Verified in code/schema:** index gaps, join-based reads, WebP conversion, lazy-loading, cache purge strategy, export N+1.
- **NOT load-tested** (no runtime profiling here): actual query timings, real bandwidth numbers, Supabase egress. Those need production metrics; this pass fixes the structural gaps (indexes) and confirms the patterns are sound.

## Decisions made
- Additive indexes shipped as a reviewable migration (safe, but DDL on a live DB → review + optionally `CONCURRENTLY` on large tables).
- Export's admin-batch N+1 left as-is (low frequency); storage orphan-sweep tracked as a follow-up job rather than a risky bulk delete now.
