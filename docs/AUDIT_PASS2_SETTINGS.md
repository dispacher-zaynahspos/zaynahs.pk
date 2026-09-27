# AUDIT PASS 2 — Settings Domain ↔ Storefront Linkage

Status: **in progress.** Premium-gating consolidation (the confirmed broken linkage) is **complete + verified**. Remaining settings-tab field-by-field persistence trace and AI de-duplication are outlined below and continue in this pass.

## ✅ Premium / gating linkage — COMPLETE (verified, `tsc --noEmit` = 0 errors)

Every storefront + customizer premium/gated feature now flows through the single `lib/features/premium.ts` helper created in Pass 0. Repo-wide scan for inline `settings.<x>_enabled === false` / `!== false` gates in consumer code returns **CLEAN**.

Consumers migrated in this pass (in addition to the 11 from Pass 0):
- `components/common/FloatingContacts.tsx` (recent_buyers, spin_wheel)
- `components/store/product-detail/ProductDetailInfo.tsx` (stock_urgency, size_guide ×2)
- `components/store/product-detail/ProductDetailModals.tsx` (size_guide)
- `components/store/PremiumFeaturesProvider.tsx` (cookie_consent ×2, exit_intent ×2, spin_wheel, recent_buyers)
- `components/store/cart-container/CartSummaryPanel.tsx` (coupon_codes, free_shipping_bar, volume_discounts)
- `components/store/cart-container/useCartContainerState.ts` (free_shipping_bar, volume_discounts)
- `components/store/cart-container/hooks/useCartTimer.ts` (cart_timer)
- `components/store/premium-features/hooks/useRecentBuyerTicker.ts` (recent_buyers)
- `components/store/CartContainer.tsx` (cart_timer)
- `app/(store)/product/[slug]/page.tsx` (related_products)
- `app/admin/settings/customizer/preview/preview-client/ProductPageBlocks.tsx` (related_products)
- `components/admin/customizer/pages/ProductDetailPageSettings.tsx` (related_products checkbox)

**Not changed (correct as raw column access):** the settings-form read/write layer — `useSettingsPopupsAndPixels.ts` (form state), `buildSettingsPayload.ts` (save payload), `lib/services/settings/mutations.ts` + `dbToSettingsMapper.ts` (persistence) — these are the editor and DB boundary and must read/write the raw column. React `useEffect` dependency arrays that reference the raw flag are also left intact (they memoize on the value, they don't gate).

**Behavior preserved:** `isFeatureEnabled` returns "enabled unless flag is explicitly `false`". Because `dbToSettingsMapper` always concretizes each flag to a real boolean (`?? true`/`?? false`), storefront settings never carry `undefined`, so opt-in features (flash_sale/exit_intent/spin_wheel, default `false`) behave identically to the previous truthy checks.

**Result:** Settings → Premium toggle now has exactly ONE gate implementation shared by storefront render, cart, product detail, floating widgets, popups, and the customizer add/reorder/lock UI. Toggling a flag in Settings → Premium affects every consumer consistently. This closes the "tabs not properly linked to Customizer and storefront" class of bug for all 14 premium flags.

## ✅ Pass 2b — AI de-duplication + singleton-ID centralization (COMPLETE, tsc = 0 errors)

**Confirmed AI duplicate fixed.** `ai_settings.auto_media_ai` was toggled/read by two independent inline code paths (`MediaManager.tsx` write + `useMediaAI.ts` read) separate from the Settings→AI tab. Created `lib/services/ai/ai-settings-client.ts` with `getAutoMediaAi()` / `setAutoMediaAi()` / `getAiEnabled()` as the single client-side read/write path. Migrated:
- `components/admin/media-manager/hooks/useMediaAI.ts` → `getAutoMediaAi()`
- `components/admin/MediaManager.tsx` → `setAutoMediaAi()`
- `app/admin/seo/bulk/BulkConsoleClient.tsx` → `getAiEnabled()`

**Singleton-ID SSOT (clone-readiness).** The fixed UUIDs for the `store_settings` and `ai_settings` singleton rows were hardcoded as string literals in 15 files. Created `lib/config/singleton-ids.ts` (`STORE_SETTINGS_ID`, `AI_SETTINGS_ID`) and replaced every literal across `lib/ai/settings.ts`, `lib/revalidate.ts`, `lib/services/cache.ts`, `lib/services/settings/mappers/types.ts` (now re-exports the deprecated `SETTINGS_ID` alias), all `app/api/*` routes (`ai-check`, `settings`, `products/export`, `seo/optimize`), and the SEO/media admin clients. Repo scan for the literal now returns only `singleton-ids.ts` itself + `badges-constants.ts` (badge IDs, different concern). This is required for the clone-ready goal — no shop-specific/hardcoded row identifiers scattered in source.

Documented the mirror-trigger relationship (`store_settings` ↔ `ai_settings` for `ai_enabled`/`auto_media_ai`/`auto_content_seo`) in `singleton-ids.ts` so future code knows `store_settings` is the canonical write target.

## ⏳ Remaining in Pass 2

- **Field-by-field persistence trace** for every non-premium settings tab (General, Header, Navigation, Products, Trust, WhatsApp, Policies, Footer, Shipping, Coupons, Pixels, Email, Meta Sync) — confirm each control saves and the storefront consumes it. Cross-referenced with the Settings↔Customizer last-writer-wins drift documented in `docs/DEEP_AUDIT_PLAN.md §3` (shared-column duplication). Note: the bundled `Promise.all` ai_enabled+store read in `ProductsSEOClient`/`CategoriesSEOClient` was left intact (efficient single round-trip; IDs now centralized).

## Decisions made
- Canonical premium gate = `lib/features/premium.ts` (locked in `docs/agent-rules/27-single-source-of-truth.md`). No inline `_enabled === false` gates permitted anywhere in consumer code going forward.
- Canonical AI client read/write = `lib/services/ai/ai-settings-client.ts`. Canonical singleton row IDs = `lib/config/singleton-ids.ts`. `store_settings` is the canonical write target; `ai_settings` is a trigger-mirrored copy.
