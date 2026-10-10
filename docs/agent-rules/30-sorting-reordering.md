# 30 — Sorting & Reordering (SORT1, REORDER1 — STRICT, SSOT)

> Permanent architectural law. Two sorting systems that MUST stay independent, one shared sort-option source, one shared reorder UI. Added after the sorting-system rebuild (migration `20261010120000_product_categories_position.sql`).

## RULE SORT1 — Two separate sorting systems, never coupled
1. **Home customizer sections** and **/shop + category pages** have SEPARATE sorting systems. They MUST NOT share position columns, queries, or cache keys.
2. **Category / Shop manual order** = `product_categories.position` (per `(category_id, product_id)`). Each category — including the system Shop category (`SHOP_CATEGORY_ID`) — has its OWN independent order. Written ONLY by the atomic RPC `reorder_category_products(p_category_id, p_product_ids)` via `updateCategorySortOrderAction`.
3. **Home section manual order** = that section's own `homepage_sections.settings.manualProductIds` (ordered string[] in the section JSON). NEVER reads category rank/position.
4. The global `products.sort_order` column is a **legacy base-order fallback only**. The category/shop reorder flow NEVER writes it anymore. Do not re-introduce a global write — that was the original coupling bug (reordering one category changed Home + every other category).
5. `lib/services/products/categories.ts::updateProductSortOrders` was removed on purpose. Do NOT re-add a global `sort_order` reorder helper.

## RULE SORT2 — One shared sort-option source (SSOT)
- All sort options + labels + comparator live ONLY in `lib/sorting/sortOptions.ts`:
  - `SORT_OPTIONS` (value + label), `getSortLabel`, `normalizeSortKey`, `isValidSortKey`
  - `applySort(items, sortKey, manualPositions?)` — pure, returns a NEW array, stable `id` tiebreaker
  - `buildOrderBy(sortKey, manualColumn?)` — matching DB ORDER BY builder
- Canonical keys: `manual · newest · oldest · price_desc · price_asc · alpha_asc · alpha_desc`.
- `normalizeSortKey` maps legacy/spec aliases (`name_asc`→`alpha_asc`, `created-desc`→`newest`, `price_low`→`price_asc`, `recent`→`newest`, `all`/`featured`→`manual`, etc.) so NO data migration of saved `active_sort_preference` is ever needed.
- NEVER hardcode a sort `<option>` label or an inline sort switch/`.sort()` chain again. Every dropdown renders `SORT_OPTIONS.map(...)`; every in-memory sort calls `applySort`.
- Current consumers (keep in sync): `shopFilterUtils.ts`, `ShopPageControls.tsx`, `CategoryDetailManager.tsx`, `ProductList.tsx` + `ProductListToolbar.tsx`. Storefront home sections keep their own `source`/`sortMethod` section semantics but should map labels through this SSOT where a dropdown is shown.

## RULE REORDER1 — One shared reorder UI (SSOT)
- Any reorderable list MUST use the shared system — never a one-off drag/move UI:
  - `components/common/reorder/SortableList.tsx` (`<SortableList />`) — dnd-kit vertical drag + up/down chevrons + three-dots menu + long-press Move modal + keyboard + optimistic rollback + disabled hint.
  - `lib/hooks/useReorder.ts` — order operations (up/down, top/bottom, move-to-position, drag, multi-select, pagination-aware global index).
  - `lib/hooks/useLongPress.ts` — 500ms long-press (10px tolerance, refs not state, `contextmenu` preventDefault, `navigator.vibrate`).
  - `components/common/reorder/ReorderMoveModal.tsx` — Top/Up/Down/Bottom/Move-to-position, rendered through a Portal to `document.body` (never clipped), `z-[120]`, body-scroll-locked.
- Current shared consumers (keep using these primitives, never fork):
  - **Admin category products** (`CategoryProductsTable.tsx`) — desktop table rows AND mobile card view both use `useSortable` + `useLongPress` + `ReorderMoveModal`. Bulk multi-select move uses the same `moveSelectedToPosition` algorithm.
  - **Customizer manual product picker** (`ManualProductPicker.tsx`) — uses `<SortableList />` directly.
  - **Customizer Home Section Stack** (`HomeSectionsStack.tsx`) — dnd-kit drag + grip on `SectionStackRow` + long-press Move modal + up/down + move-to-position (`handleReorderSections` / `handleMoveSectionToPosition` in `useCustomizerState`). `handleMoveSection` uses shared `moveItemInArray`.
- Required features on every reorder surface: drag handle, up/down, move menu, long-press modal, keyboard, optimistic update + rollback, 44px touch targets, disabled-with-hint when sort ≠ Manual (`"Switch to Manual Order to reorder"`).
- Do NOT add a second DnD library. The repo standard is `@dnd-kit/*`. `@hello-pangea/dnd` is unused/dead — don't import it.

## RULE REORDER2 — Transactional + pagination-aware
- Category reorder persists via ONE transaction (the `reorder_category_products` RPC, RULE D15). The admin always sends the FULL ordered id list for the category, so a move on page 2 computes the correct GLOBAL position (not a page-local index). Rank badges show the real global `#` using `rankOffset`.
- All sorts use a stable tiebreaker (`id`) so products never duplicate/disappear across pages.

## RULE REORDER3 — Scoped cache invalidation
- Category/shop order change → purge products + categories tags + edge (via `updateCategorySortOrderAction` → `revalidateStorefrontEdge`). The `product_categories` DB trigger (`revalidate-product_categories`) also fires `/api/revalidate`.
- Saving a Home customizer section → home/banner tags only. Never cross-purge between the two systems.

## Independence tests (MANDATORY when touching sorting)
- Reorder a product in /shop → Home order unchanged.
- Reorder in a category → Home + other categories unchanged.
- Change a Home section sort → /shop + categories unchanged.
- Long-press opens the Move modal (iOS Safari, Android Chrome, desktop).
- Move-to-position works across pages (e.g. #1 → #25).
- No duplicate/missing products across pagination after reorder.
- `sort != manual` disables reordering with the hint.
- Unit tests for `applySort` + the reorder transaction live in `__tests__/sorting/` (`sortOptions.test.mjs` + `reorderFlow.test.mjs`, run with `node`). The e2e-ish flow test covers drag→save payload, move-to-position, multi-select, category independence, and long-press timing (fires @500ms, cancels >10px, survives wobble).

## Cross-references
- RULE SSOT1 ([27](27-single-source-of-truth.md)) — zero duplicate implementations.
- RULE 15 (shared components) — `<SortableList />` is the mandated reorder module.
- RULE D15 ([05](05-database-supabase.md)) — atomic writes (reorder RPC).
- RULE C10 ([08](08-caching-isr-ssr.md)) — scoped cache invalidation.
