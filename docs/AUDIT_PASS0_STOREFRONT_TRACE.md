# AUDIT PASS 0 — Storefront → Admin Flow Trace

Status: **in progress** (read-only trace complete; fixes tracked in later passes)
Scope: every `app/(store)/**` page traced backwards into `app/admin/**` + `store_settings` / `ai_settings` / domain tables.
Method: static code trace (`.from(...)`, service layer in `lib/services/**`, section render switch in `components/store/store-front/StoreFront.tsx`). Not yet verified against live DB rows.

---

## Shared service layer (single source, good)

All storefront reads flow through `lib/services/**`:

- `getSettings()` → `store_settings` — `lib/services/settings/queries.ts:6`
- `getProducts()` → `products` / `product_variants` / `product_images` / `product_categories` / `product_modifiers` — `lib/services/products/`
- `getHomepageSections()` → `homepage_sections` — `lib/services/sections/homepage-sections.ts:18`
- reviews → `reviews`; social proof → `social_proof` / `social_proof_products`

---

## (A) Per-page trace

| Page (file) | Data source | Admin control | Interactive elements |
|---|---|---|---|
| Home `app/(store)/page.tsx` | `getProducts`, `getCategories`, `getSettings`, `getTopReviews`, `getHomepageSections`, `getActiveSocialProofCount` (76–83) → `StoreFront` | Homepage Customizer → `homepage_sections`; Settings tabs → `store_settings` | Category filter, Load-More, Add-to-Cart, Flash Sale — wired. Render switch `StoreFront.tsx:166-215` |
| Shop `app/(store)/shop/page.tsx` | `getProducts`, `getCategories`, `getCollections`, `getSettings`, `getDomainBrand` (92–98); category SEO `seo_meta` (32) | Products/Categories/Collections admin, Customizer `ShopPageSettings`, Premium (`shop_*`) | Filters/sort/price/color/size/material, grid⇄list, infinite-scroll+Load-More, add-to-cart, wishlist — wired via `useShopPageFilters` |
| Category `app/(store)/category/[slug]/page.tsx` | metadata from `getCategoryBySlug` + `seo_meta`; **body = `redirect('/shop?category=slug')`** (68) | Categories admin (SEO only) | none (redirect) |
| Product `app/(store)/product/[slug]/page.tsx` | `getProductBySlug`, `getSettings`, reviews, `getRelatedProducts`, social proof, `seo_meta` (127–144); layout order `settings.product_page_layout` (146) | Product form, Customizer `ProductDetailPageSettings`/`ProductLayoutSubTab`, Premium | Add-to-Cart, Wishlist, variant selector, qty stepper, WhatsApp CTA — wired. Ticker gated `product_detail_enable_ticker` (243); related gated `related_products_enabled` (284) |
| Cart `app/(store)/cart/page.tsx` | `getSettings` (16) → `CartContainer`; items from Zustand `cartStore`; shipping/payment `shipping_methods`/`payment_methods` | Shipping & Pay, Premium (coupon/free-ship/volume/timer) | qty, remove, coupon (`validateCouponCode`→`coupons`), free-ship bar, volume discount, WhatsApp order (`createOrder`→`orders`) — wired |
| Checkout `app/(store)/checkout/page.tsx` | `redirect('/cart?step=checkout')` (6) | n/a | none (redirect) |
| Account `app/(store)/account/page.tsx` | `getCustomerSession`+`getCustomerOrders`→`customers`/`orders`; redirects `/login` if no session | Customers/Orders (read) | server-gated dashboard; logout/security — wired |
| Wishlist `app/(store)/wishlist/page.tsx` | `getProducts`+`getSettings`; wishlist IDs from `localStorage` | none dedicated; styling from settings | add/remove wishlist, add-to-cart — wired |
| Reviews `app/(store)/reviews/page.tsx` | `getGlobalReviews`→`reviews` + `getSocialProofs`→`social_proof` | Reviews admin, social-proof | search/rating/sort/pagination via searchParams — wired |
| Login/Signup | client; `customerLogin`/`customerSignup`→`customers` | none (auth) | wired |
| Contact `app/(store)/contact/page.tsx` | POST `/api/contact` → email trigger only; **no DB persistence** (`app/api/contact/route.ts:17`) | **NONE / hardcoded** | submit wired to email only |
| FAQ / Returns / Privacy | `settings.faq_content` / `return_policy_content` / `privacy_policy_content` w/ hardcoded fallbacks | Settings → Policies & FAQ | static render |

### Pass-0 flagged items (for later passes)
- **F0-1** `app/(store)/contact/page.tsx` + `app/api/contact/route.ts` use an **email trigger** and **persist nothing** — violates AGENTS.md Rule #6 (WhatsApp-only, no email) and creates no lead row. → Pass 1/2.
- **F0-2** `app/(store)/product/page.tsx` (slug-less `/product`) — verify orphan; remove if dead. → Pass 1.
- **F0-3** Category page is a pure redirect to `/shop` — acceptable, but confirm SEO canonical is correct. → Pass 1.

---

## (B) Premium / gating trace — SSOT VIOLATION (primary Pass-0 fix)

There is **no master premium flag and no shared gating helper**. "Premium" = the Settings → *Premium Features* tab toggling independent `*_enabled` booleans on `store_settings`. Every consumer re-implements `settings.<flag> === false`.

**Storage:** `store_settings` boolean columns, mapped in `lib/services/settings/mappers/dbToSettingsMapper.ts`. Flags: `flash_sale_enabled, social_feeds_enabled, recent_buyers_enabled, cookie_consent_enabled, free_shipping_bar_enabled, volume_discounts_enabled, frequently_bought_together_enabled, stock_urgency_enabled, spin_wheel_enabled, exit_intent_enabled, cart_timer_enabled, size_guide_enabled, coupon_codes_enabled, related_products_enabled` (+ `ai_enabled` on `ai_settings`).

**Admin surface:** Settings → Premium Features — `SettingsTabBar.tsx:32`, `SettingsTabRendererAdvanced.tsx:77` → `components/admin/settings/PremiumTab.tsx` (+ `PremiumFeaturesChecklist`, `PremiumFlashSaleCard`, `PremiumViewerAndTickerCard`, `PremiumPopupsAndWheelSection`, `PremiumRecentBuyersSection`).

**Distinct scattered gating checks (to be routed through one util):**
1. `components/store/store-front/FlashSaleSection.tsx:19`
2. `lib/services/products/mappers/flashSaleDiscounts.ts:7`
3. `components/store/product-detail/useProductDetailState.ts:128-159`
4. `app/admin/settings/customizer/preview/preview-client/useLiveProducts.ts:10`
5. `components/admin/customizer/pages/product-detail/ProductSaleSubTab.tsx:17`
6. `components/admin/customizer-editor/CustomizerRightSidebar.tsx:238`
7. `components/admin/customizer-editor/sidebar/ProductDetailBlocksStack.tsx:27,79`
8. `components/admin/customizer-editor/sidebar/HomeSectionsStack.tsx:55,63,135`

Plus per-flag checks in `PremiumFeaturesProvider.tsx` (cookie/exit-intent/spin-wheel/recent-buyers), `CartSummaryPanel.tsx` (coupon/free-ship/volume), `ProductDetailInfo.tsx` (fake-views/stock-urgency).

**FIX (this pass):** add `lib/features/premium.ts` — a single `isFeatureEnabled(settings, feature)` + `PREMIUM_FEATURES` registry. Route every check above through it. No behavior change; eliminates the duplication and gives every future feature one entry point.

### ✅ FIX APPLIED (verified, `tsc --noEmit` = 0 errors)
Created `lib/features/premium.ts` (`isFeatureEnabled`, `isSectionEnabled`, `sectionPremiumFeature`, `PREMIUM_FEATURE_FLAG`, `PREMIUM_FEATURE_LABEL`, `SECTION_PREMIUM_FEATURE`). Behavior-preserving: a feature is disabled only when its flag is explicitly `false`.
Routed all previously-scattered inline gates through it:
- `components/store/store-front/FlashSaleSection.tsx`
- `lib/services/products/mappers/flashSaleDiscounts.ts`
- `app/admin/settings/customizer/preview/preview-client/useLiveProducts.ts`
- `components/admin/customizer-editor/sidebar/HomeSectionsStack.tsx` (add-list + reorder list; toast label now derived from `PREMIUM_FEATURE_LABEL`)
- `components/admin/customizer-editor/sidebar/ProductDetailBlocksStack.tsx` (flash + social)
- `components/admin/customizer-editor/CustomizerRightSidebar.tsx` (flash + social)
- `components/admin/customizer/pages/product-detail/ProductSaleSubTab.tsx`
- `components/admin/customizer/pages/product-detail/ProductSocialFeedSubTab.tsx`
- `components/store/store-front/StoreFrontSections.tsx`
- `components/store/SocialFeedRibbon.tsx`
- `app/admin/settings/customizer/preview/preview-client/ProductPageBlocks.tsx`

Repo-wide grep for `flash_sale_enabled === false` / `social_feeds_enabled === false` now returns **CLEAN** (0 matches). Remaining premium flags (coupon/free-ship/volume/stock-urgency/exit-intent/spin-wheel/recent-buyers/cookie-consent) will be migrated to `isFeatureEnabled` in Pass 2 alongside the Settings-tab linkage work, since they live in provider/cart/product components audited there.
Note: `components/store/product-detail/useProductDetailState.ts` was intentionally **not** changed — it reads **product-level** `product.flash_sale_enabled` + date window, which is distinct per-product logic, not the store-wide premium gate.

---

## (C) Duplicate implementations

1. **AI "auto media AI" toggle in two admin screens** — canonical `components/admin/settings/AITab.tsx` (`ai/AIPersonaSection.tsx` `autoMediaAi`) **and** independently in `components/admin/MediaManager.tsx:102` (writes `ai_settings.auto_media_ai`). Plus `ai_settings.ai_enabled` re-fetched ad-hoc in `media-manager/hooks/useMediaAI.ts:21`, `category-manager/hooks/useCategoryManagerState.ts:193`, `app/admin/seo/*Client.tsx:42`, `seo/bulk/BulkConsoleClient.tsx:47`, `app/admin/layout.tsx:89`. → consolidate to one `useAiEnabled` hook. (Note: the reference prompt's claim of "AI settings inside the Customizer" is **not** supported by the code — real duplication is AITab ↔ MediaManager.) → Pass 2.
2. **Product Card** — mostly consolidated on `components/store/ProductCard.tsx` (home/shop-grid/related/recently-viewed/customizer-preview all reuse it). **Two genuine parallel implementations remain:** `components/store/shop-page/ShopProductListCard.tsx` (shop list-view, own wishlist/add-to-cart markup) and `components/admin/customizer/pages/product-card/ProductCardPreviewStudio.tsx` (hand-built preview w/ hardcoded "Emerald Cut Solitaire Ring" sample). → Pass 4.

---

## Decisions made (per Execution Authority)
- **Canonical gating:** single `lib/features/premium.ts` registry is the ONLY gating entry point. All inline `=== false` checks redirect to it.
- **Destructive DB work** (PK→UUID, drops, snake_case renames) is being authored as **reviewable numbered migrations** rather than executed against the live DB, since the store is live. Traceable, matches AGENTS.md "numbered migrations only".
