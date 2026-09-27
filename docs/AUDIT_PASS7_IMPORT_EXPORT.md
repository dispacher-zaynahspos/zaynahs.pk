# AUDIT PASS 7 — Import / Export System

Status: **audit complete; functional bugs fixed + verified (tsc = 0 real errors).**

## Systems found
- **Product catalog** export/import: `app/api/products/export/route.ts`, `app/api/products/import/route.ts` (+ `import/helpers.ts`). Admin UI: product list toolbar.
- **Category** export/import: `components/admin/category-manager/hooks/useCategoryImportExport.ts`, `components/admin/CategoryManager.tsx`.
- Bundle format: `ExportBundle` / `ExportedProduct` (`lib/types`), `version: '1.0'`.

## Verdicts

### Export — reads live DB (no stale cache) via `supabaseAdmin`. Fixed one correctness bug.
- **✅ F7-1 (FIXED) — exported `active` was always `true`.** `export/route.ts` read `product.active` from the raw `products` row, but the column is **`is_active`** (`SUPER_MASTER_SCHEMA.sql:151`; mapper reads `row.is_active`). So `product.active` was always `undefined` → the `?? true` fallback exported every product as active, and re-import silently reactivated disabled products. Fixed to `product.is_active ?? true`.
- Export includes images, variants, modifiers, primary + multi-category (junction), media_library metadata. Complete. No Base64 (URLs only) — keeps bundles small.

### Import — already atomic per-product; auth now enforced.
- **Atomicity (RULE D15):** on `overwrite`, children are snapshotted before the destructive delete and **restored on any failure** (`import/route.ts:128-141, 350-369`) — no half-imported product. Good.
- **Duplicate handling:** `skip` / `overwrite` / `rename` strategies, slug-collision-safe rename loop. Good.
- **snake_case:** import maps camelCase JSON keys → snake_case DB columns correctly (`helpers.ts` — `sortOrder→sort_order`, `isPrimary→is_primary`, `imageUrl→image_url`, `comparePrice→compare_price`, `customOption→custom_option`, etc.). DB writes are fully snake_case.
- **Auth (Pass 6):** upgraded from `getSession()`-only (any Supabase user) to `requireAdmin` (admin allow-list). Same for export + category import/export paths.
- **Cache:** post-import runs `revalidateHomepage()` (full purge) + product/category tags. Covered.

### ✅ F7-2 (FIXED) — hardcoded system-category UUID (clone-readiness)
The "Shop" system-category UUID `…099` was hardcoded as a string literal in **11 places** (import route, `products/actions.ts`, `updateProductFields.ts`, `categories.ts`, `mutations.ts`, `categories/mutate.ts`, `ProductGridSettings.tsx`, `CategoryCard.tsx`, `useCategoryImportExport.ts`, `CategoryManager.tsx`, `useShopPageFilters.ts`, `categories/[id]/page.tsx`). Centralized into `lib/config/singleton-ids.ts` as `SHOP_CATEGORY_ID` and replaced every literal. No hardcoded system IDs remain in source (clone-ready).

## Clone-readiness (Pass 7 goal)
A fresh clone can bulk-import its initial catalog through this same import path — no special-casing. The system-category is now referenced by the shared constant (seeded by migration), and the import auto-links every product to it.

## Noted (not changed — needs version bump, low priority)
The bundle JSON uses camelCase keys for **nested** objects (images/variants/categories) while top-level product fields are snake_case. It round-trips correctly (export writes ↔ import reads the same shape) and DB writes are snake_case. Making the JSON snake_case-pure would break existing `v1.0` export files and requires a `version` bump + import back-compat — deferred as a non-functional consistency nicety.

## Decisions made
- `SHOP_CATEGORY_ID` is the single source for the system-category UUID.
- Export reads canonical DB column names (`is_active`), not assumed aliases.
- Import stays on the atomic per-product snapshot/rollback model (RULE D15).
