# AUDIT PASS 10 — Final Polish + End-to-End Verification

Status: **low-risk polish applied + verified (tsc = 0 real errors). End-to-end flow traced in code.**

## Polish applied

### P10-1 — Secret inputs: "leave blank to keep current" (follow-through on Pass 6)
After Pass 6 stopped sending secrets to the client, the admin SMTP / PostEx / AI-key inputs load **empty** (correct, secure). Without a hint an admin could think the saved secret was lost. Updated placeholders so the write-only-if-provided behavior is self-explanatory:
- `components/admin/settings/EmailTab.tsx` — "Leave blank to keep saved password"
- `components/admin/courier-manager/PostExApiSettings.tsx` — "Leave blank to keep saved token"
- `components/admin/settings/ai/AIModelsSection.tsx` — "Leave blank to keep saved key(s) — or enter one per line for rotation"

### P10-2 — Label consistency
Sidebar "Premium" → "Premium Features" to match the settings tab bar (`adminNavSections.ts`). (Trust & Badges icon drift Shield-vs-Zap noted; harmless, left.)

## End-to-end scenario — traced in code (connected system verification)
Flow: add product → set variants → feature it in a homepage Product Grid via customizer with a Shop button + a banner (video/carousel) → save → storefront reflects immediately.

1. **Add product / variants** → `createProductAction` (atomic, RULE D15 rollback) writes `products` + `product_variants` + images/modifiers + auto-links `SHOP_CATEGORY_ID` → `revalidateProduct(slug)` (full purge). ✅
2. **Feature in homepage grid** → Customizer edits `homepage_sections` (live iframe preview via postMessage — renders the REAL `StoreFront`, so preview == live). Section autosave → `revalidateBanner()` (full purge). Flash Sale / Social gated via the single `lib/features/premium.ts`. ✅
3. **Banner media** → single `MediaManager`/`MediaSelectorModal` picker; the Pass 3 fix means picking a video no longer lands on the wrong section (stale-state cleared on close). ✅
4. **Save Layout** → `/api/revalidate-customizer` → homepage/banner/settings revalidate + `purgeAllCache`. ✅
5. **Storefront reflects** → home/shop/product read via joined queries through the shared service layer; product card rendered by the single `ProductCard` (wishlist via shared `useWishlist`); prices/badges computed once. Cache purged on every write path (Pass 5, incl. `revalidateStorefrontEdge` for the 8 previously edge-stale domains). ✅
6. **Import/export** consistency (Pass 7): export reads canonical `is_active`; import is atomic per-product and maps camelCase→snake_case; both admin-guarded. ✅

Every hop above is a single shared implementation (no duplicate code paths), auth-guarded server-side (Pass 6), and cache-consistent (Pass 5). This is the "admin and storefront move together as ONE system" goal, verified at the code level.

## Not done in this pass (honest)
- Exhaustive empty/loading/error-state + money/percentage formatting sweep across every screen — a broad UI audit; spot-checks (ProductCard, cart, grids) were consistent, but a full sweep is tracked with the deferred follow-ups.
- Live runtime walkthrough (needs the running app + live DB) — traced in code instead.

## Decisions made
- Secret inputs are write-only with an explicit "leave blank to keep" affordance (matches the server write-only-if-provided rule).
