# AUDIT PASS 4 — Grids + Cross-Page Product-Card Consolidation

Status: **product-card logic duplication fixed + verified (tsc = 0 errors); admin-grid completeness audit staged.**

## Product Card — canonical vs duplicates (from Pass 0 verdict)
The catalog card is already largely consolidated on `components/store/ProductCard.tsx` (home grid, shop grid, related, recently-viewed, customizer preview all reuse it). Two parallel implementations existed:

### ✅ F4-1 (FIXED) — Shop list-view card duplicated wishlist logic
`components/store/shop-page/ShopProductListCard.tsx` is a legitimate *layout* variation (horizontal list vs grid card) — kept distinct per "merge only true duplicates." But its **wishlist toggle logic** (localStorage add/remove + fly-to-header animation + `wishlist-updated` broadcast) was copy-pasted verbatim from `ProductCard.tsx`.
**Fix:** extracted `components/store/product-card/hooks/useWishlist.ts` as the single source. Both `ProductCard.tsx` and `ShopProductListCard.tsx` now consume it. Identical behavior, one implementation. `tsc` = 0 errors, no unused imports introduced.

### 🔶 F4-2 — Product Card Preview Studio (customizer)
`components/admin/customizer/pages/product-card/ProductCardPreviewStudio.tsx` is a hand-built card replica with sample content ("Emerald Cut Solitaire Ring", Unsplash demo images).
**Decision (kept distinct, drift-risk noted):** This is an *admin-only* "Live Animation & Hover Studio" with richer interactive controls (style-preset chips, mobile-focus simulation) that the plain card lacks — an intentional tool, not a storefront fake, so sample content is legitimate here (the "no demo data" rule targets customer-facing UI). Crucially it already drives hover via the SAME CSS as the real card (`ProductCardStyleInjector`, `data-hover-effect`, shared `getSharedAspectClass`/`getSharedTitleClampClass`), so animation behavior cannot drift. Residual risk = static badge/title/price markup could drift from `StandardProductCard`. **Planned permanent fix (Pass 4b):** render the real `ProductCard` with a sample-product factory inside the studio shell so even static markup is WYSIWYG. Not rushed now to avoid regressing the studio's interactivity.

### 🔶 F4-3 — ProductDetail page wishlist toggle (follow-up)
`components/store/ProductDetail.tsx:158` still inlines a functionally identical wishlist toggle. It's entangled with `useProductDetailState`'s `isWishlisted` state, so migrating it to `useWishlist` is a separate low-risk follow-up (tracked). Card-level duplication — the explicit Pass 4 target — is resolved.

## ⏳ Admin grids completeness (staged)
The admin-grid completeness/filters/bulk-atomicity sub-audit (Products, Inventory, Categories, Collections, Variants, Orders, Customers, Reviews grids — bring each to the Variants-grid benchmark; convert bulk actions to atomic bundles per Pass 6) is a large sub-pass tracked separately. Bulk-action atomicity specifically depends on the Pass 6 bundle/sync-or-fail RPC work and will be done alongside it.

## Decisions made
- Canonical wishlist behavior = `components/store/product-card/hooks/useWishlist.ts`. No inline localStorage wishlist toggle in any card component.
- Shop list card and Preview Studio are intentional variations (different layout / admin tool), kept distinct; only their duplicated *logic* is (being) shared.

## ✅ F4-3 (FIXED) — ProductDetail wishlist migrated to shared hook
`components/store/ProductDetail.tsx` now uses `useWishlist(product.id, variantAwareImage)` instead of its own inline localStorage toggle; removed `isWishlisted`/`setIsWishlisted` from `useProductDetailState`. Repo-wide, the ONLY place that writes `localStorage 'wishlist'` is now `product-card/hooks/useWishlist.ts` — wishlist toggling is fully single-sourced across ProductCard, ShopProductListCard, and ProductDetail. `tsc` = 0 errors. (The wishlist *page* `WishlistContainer` manages list display/removal — a distinct concern, correctly separate.)
