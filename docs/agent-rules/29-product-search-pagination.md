# 29 — RULE PS1: Product Search & Pagination Engine (ONE shared system)

> Hard architectural rule. EVERY place in the app where products are searched, filtered by text, picked, linked, recommended, or paginated — admin AND storefront — uses the ONE canonical engine. No per-page search algorithms, no inline `.filter(includes)`.

## Canonical location
`lib/services/product-search/` — the single source of truth for product search + ranking across `/admin/**` and `/store/**`.

| File | Job |
|------|-----|
| `types.ts` | `ProductSearchResult`, `ProductSearchConfig`, `ProductSearchFilters`, `DEFAULT_SEARCH_WEIGHTS` (ranking weights live here ONCE) |
| `normalization.ts` | query normalize, tokenize, age parsing ("2y/24m/1-3yrs"→months), `highlightMatch` |
| `ranking.ts` | `rankSearchResults()` — the ONE scoring algorithm |
| `server-search.ts` | `searchProductsServer()` — Postgres full-text (`search_vector` GIN) + `pg_trgm` fuzzy, paginated; `searchProductsByIds()` |
| `client-search.ts` | fetch wrapper + 30s in-memory cache + `invalidateSearchCache()` |
| `useProductSearch.ts` | React hook: debounce + cache + AbortController + loadMore |
| `useInMemoryProductSearch.ts` | `rankProducts(products, query)` + `useInMemoryProductSearch()` for admin pickers that already hold the list in memory (same ranking, zero extra DB load) |
| `ProductSearchModal.tsx` | shared modal UI (single/multi select, filters) |
| API `app/api/search/products/route.ts` | `GET /api/search/products` (q, limit, offset, filters), cache `max-age=30, swr=60` |

## RULE PS1 — never re-implement product search
- Inline `products.filter(p => p.name.toLowerCase().includes(q))` for PRODUCT search is **BANNED**. Call:
  - **Server (large/unknown lists, storefront, live search):** `useProductSearch()` hook or `GET /api/search/products`.
  - **In-memory (admin picker already holding the array):** `rankProducts(products, query)` or `useInMemoryProductSearch({ products })`.
- Ranking weights change in **ONE** place: `DEFAULT_SEARCH_WEIGHTS` (`types.ts`). Never hardcode scoring per component.
- Collection/category/review/city/media filters that are NOT product search stay as-is (out of scope) — this rule is product discovery only.

## RULE PS2 — searchable fields + ranking order (deterministic)
Default priority (high→low), from `DEFAULT_SEARCH_WEIGHTS`:
1. Title exact (100) → 2. Title prefix (80) → 3. SKU exact/partial (90) → 4. Title keyword (60) → 5. Variant exact (50) → 6. Title partial (30) → 7. Variant partial (25) → 8. Short description (20) → 9. Tags (15) → 10. Category (15) → 11. Long description (10) → 12. Age exact (40) / compatible (20).
Tie-breakers: featured first → in-stock first → newer.
**Main cheezein pehle:** title → category/variation → tags/short desc → long desc → age fallback. Ek hi query par ultra-long weak matches sabse neeche.

## RULE PS3 — DB-side, low-usage (mandatory)
- Server search uses the `search_vector` tsvector GIN index + `pg_trgm` trigram indexes. NEVER load the full catalog into the browser for a large store.
- Pagination: default **50/page** server, load-more / infinite scroll. Admin in-memory pickers slice after ranking.
- `GET /api/search/products` is cached: `Cache-Control: public, max-age=30, stale-while-revalidate=60` + client 30s Map cache. Debounce 300ms (server) / 150ms (in-memory). AbortController cancels stale requests.
- Age-aware search needs `recommended_age_min_months`, `recommended_age_max_months`, `age_group` columns (in master schema + all stores).

## RULE PS3b — Catalog-size strategy + NON-NEGOTIABLE query safety (learned the hard way)
> A 2026-10 "optimization" wired `/shop` + search modal to the server path and **lost data**: `product_images!inner` / `product_variants!inner` INNER JOINs silently dropped every product without an image or active variant (winter 36 → 5), and the list query had no `{ count: 'exact' }` so `total` was wrong and pagination/infinite-scroll died. Root cause = app code, NOT the DB (tsvector/indexes were correct). Permanent rules:
>
> 1. **Small catalog (≤ ~2000 products) → CLIENT path.** `/shop`, category pages, and the storefront navbar suggestions use the in-memory `filterProductsList()` + `rankProducts()` over the already-loaded catalog. One source → correct total, every field matched, zero DB round-trip, no data-loss. This is the DEFAULT and the recommended path for all current stores.
> 2. **Large catalog → SERVER path** (`searchProductsServer` / `/api/search/products`) only when the full catalog is too big to hold in memory.
> 3. **Relation joins in product search are NORMAL joins, NEVER `!inner`.** A product missing an image/variant must still appear. `!inner` on `product_images`/`product_variants` is BANNED in any search/listing query.
> 4. **Any list query that reports a total MUST use `{ count: 'exact' }`.** `hasMore = offset + results.length < total`. Never `results.length === limit`.
> 5. **Search + category:** only apply a `categoryId`/category filter when it comes from the URL (`?category=`) or an explicit chip — never from leftover state, or search-alone silently returns 0.
> 6. **Multi-word** = every word must match somewhere (AND across words, OR across fields). Synonyms/Roman-Urdu via `components/store/shop-page/searchSynonyms.ts` (`expandSynonyms`, easy to extend: sardi=winter, larkay=boys, bachon=kids).
> 7. **Count parity:** modal count, `/shop?search=` count, and admin count all come from the SAME engine → numbers always match.

## RULE PS4 — DB objects (migration SSOT)
`supabase/migrations/20261009190000_product_search_optimization.sql` (reflected in `SUPER_MASTER_SCHEMA.sql`):
- `products.search_vector tsvector` + `idx_products_search_vector` GIN
- `pg_trgm` extension + trigram indexes on name/description/short_description/sku + variant color/size/material/custom_value/sku
- `products.recommended_age_min_months / recommended_age_max_months / age_group` + `idx_products_age_range`
- `build_product_search_vector(uuid)` + BEFORE INSERT/UPDATE trigger on products, AFTER triggers on product_variants / product_categories / categories(rename), + `refresh_all_product_search_vectors()`
- Idempotent (`IF NOT EXISTS` / `CREATE OR REPLACE` / `DROP TRIGGER IF EXISTS`). Applied to ALL stores via `node scripts/apply-migration-all-stores.mjs <sql>`.

## RULE PS5 — pagination system (shared)
- Admin tables/pickers → `components/admin/PaginationFooter.tsx` (page + pageSize). `totalItems` = ranked/filtered length.
- Storefront shop → device page size (`shop_products_per_page[_mobile|_tablet|_desktop]`), load-more or infinite scroll; when a text query is active the Shop page uses **server search** (`useShopSearch`) with server `total` + `hasMore` + `loadMore`.
- Never render an unbounded list in a modal/dropdown — always slice/paginate after ranking.

## Integrating in a NEW place (do this, nothing else)
- Admin picker holding `Product[]` → `const ranked = rankProducts(products, query)` (or `useInMemoryProductSearch`). Slice for display.
- Storefront / unknown-size / live → `useProductSearch({ config:{ limit, filters } })` or hit `/api/search/products`.
- Need a full modal → `<ProductSearchModal selectionMode="single|multiple" ... />`.

## Migrated entry points (reference)
Navbar live search, Shop page text search, Admin ProductList, Category detail + add modal, Order editor, Order create, Bought-together, Nav menu picker, Post-review modal, Review detail sheet, Customizer product picker, QuickView. Full table + remaining out-of-scope list: `docs/product-search.md`.

## Definition of done (any search/pagination task)
- No new inline product `.filter(includes)` — uses `rankProducts()` or server API.
- Ranking from `DEFAULT_SEARCH_WEIGHTS` only; title-first order preserved.
- Server path uses `search_vector`/trigram + pagination + cache; no full-catalog client load for big stores.
- Migration (if schema touched) idempotent, in master schema, applied to all stores, `npm run check:setup` green.
- `docs/product-search.md` updated with the new/changed entry point.
