# DEEP AUDIT & PHASE PLAN — zaynahsestore-tv-main (v2, ultra-deep)

> Whole-codebase audit (analysis + planning). NO code/schema changed in THIS pass.
> Stack: Next.js App Router + Supabase + Vercel + Cloudflare · Shopify-style admin console.
> Regenerated: 2026-09-26. Verified against real code, real `SUPER_MASTER_SCHEMA.sql`, real RLS, real runtime flows.
> Legend: ✅ already fixed in prior passes · ⏳ remaining.

---

## 1. Executive Summary

The app is broadly functional; the core defects are **security (RLS/secrets)**, **write-atomicity**, and a large **duplicate-implementation (single-source-of-truth) debt** where the same `store_settings` columns are editable from 2–4 separate UIs writing through two independent React state trees (Settings manual-save vs Customizer autosave — last-writer-wins).

| # | Area | Severity | Status | One-line |
|---|------|----------|--------|----------|
| S1 | 4 tables no RLS (`schema_version`, `homepage_sections`, `whatsapp_subscribers`, `email_templates`) | Critical | ✅ **APPLIED + VERIFIED on all 4 live stores** (RLS ON, policies confirmed) + signup moved to service-role | done |
| S2 | `store_settings`/`customers`/`orders` `SELECT USING(true)` | Critical | ⏳ needs code-split (public-safe view + `getPublicSettings`) + staging runtime QA — blind-apply would break storefront `select('*')` | plan in `docs/SECURITY_STORE_SETTINGS_SECRETS_PLAN.md` |
| A1 | `createProductAction` no rollback | High | ✅ done | compensating rollback added (deletes partial product+children) |
| A2 | No DB transactions anywhere (multi-table writes) | High | ✅ updateProduct, createProduct, socialProof(submit+update), import-overwrite done; media+storage = safe as-is (DB-first, orphan file benign) | createOrder = benign (idempotent customer lookup, no stock deduction) |
| DUP1 | Product-card/swatch settings — **triple** duplicate | High | ✅ option lists centralized (`lib/constants/productCardOptions.ts`) — Settings + Customizer share one source | drift eliminated |
| DUP2 | Header/top-bar/newsletter — **quad** duplicate | High | ✅ done | 5 fields → one shared `HeaderAnnouncementFields` (Settings + Customizer Global + Announcement Bar); PremiumHeaderNewsCard deleted; shared constants kill label/default drift |
| DUP3 | Footer/social — double; `social_whatsapp` sanitized in one path only | Medium | ✅ done | sanitization moved to single write boundary (`updateSettings`) |
| DUP4 | Trust/safe-checkout/fake-views — triple; `enable_safe_checkout` conflict | High | ✅ hardcode fixed (independent toggle); ⏳ fake-views dedup | Settings no longer clobbers Customizer toggle |
| DUP5 | Ticker enable/text — triple | Medium | ✅ ticker color bug fixed (DEAD5) | dead camelCase `tickerBgColor`/`tickerTextColor` store_settings writes removed; colors now section-JSONB only |
| DUP6 | Dashboard vs Reporting widgets — duplicate set (both live) | Medium | ✅ done (A/B/C merged) | RevenueChart/TopProducts/StatusBreakdown → `admin/shared/reporting-widgets/`; metrics-grid + inventory kept separate (genuinely different) |
| CU1 | category_grid columns unconfigurable (locked 2/3/4) | High | ✅ done | ResponsiveGridColumnsControl added to editor |
| CU2 | category_list column settings dead (saved, never read) | Medium | ✅ done | dead cols removed; wired show_title toggle |
| CU3 | Global branding favicon/logo "Select media" buttons don't persist | High | ✅ done | resolved by snake_case cutover (keys now match mutations whitelist) |
| CU4 | Appearance preset picker dead (`AppearancePresetsList` never rendered) | Medium | ✅ done | now rendered in Appearance left sidebar |
| CU5 | Appearance page shows wrong left sidebar (Global tabs) | Low | ✅ done | dedicated appearance branch present |
| CU6 | Section eye-toggle/reorder/title/panels lost if leave before "Save Layout" | High | ✅ done | sections now autopersist (debounced), matching store_settings |
| G1 | Variant editor desktop-only (`hidden md:block`) | High | ✅ done | VariantMobileCard added (md:hidden card view) |
| D1 | `orders.customer_email` schema drift | High | ✅ done (v6.7.0) | column + migration added |
| D2 | `shop_products_per_page[_desktop/tablet/mobile]` drift | High | ✅ done (v6.7.0) | columns + mappers added |
| SNAKE | camelCase everywhere (types + JSONB) | High | ✅ done (v6.5–6.9) | 100% snake code + normalizers + migrations |
| U1 | ~100 invalid Tailwind gray shades | Medium | ✅ done | added to `@theme` |
| CACHE | write-path cache invalidation | Medium | ✅ mostly done | `revalidateEntity` + wired gaps |
| DEAD1 | 7 orphan `store/shared/*Filter` + deprecated `SizeGuidesTab` | Low | ✅ DEAD1 done (7 filters deleted, rule-15 updated); ⏳ SizeGuidesTab | remove |
| ST2 | `enable_safe_checkout` hardcoded to `enable_trust_badges` | Medium | ✅ done | independent toggle in Settings → Trust |
| U2 | "Buy Now" mislabel + `<button>` in `<Link>` | Low | ✅ done | relabelled "Add to Cart"; stretched-link un-nest |

---

## 2. Findings by Domain

### 2.1 Database, Security & Atomicity
- **S1 (Critical):** RLS absent on `schema_version` (schema:991), `homepage_sections` (:1042), `whatsapp_subscribers` (:1057), `email_templates` (:1070). Correct = enable RLS + public-read only where needed, authenticated full, service-role bypass.
- **S2 (Critical):** `store_settings` `SELECT USING(true)` (:831) exposes `smtp_app_password` (:623), `postex_api_token` (:653), `content_keys`/`vision_keys` (:598/601), `ai_model_credentials` (:594). `customers` (:841) + `orders` (:845) also public. Correct = public-safe view/column-scoped policy; secrets + PII to authenticated/service-role only.
- **A1/A2 (High):** No transactions. `createProductAction` (products/actions.ts) has no rollback (its `updateProductAction` twin does ✅). Other partial-save paths: `createOrder` (customer+order), `submitSocialProof`/`updateSocialProof`, product import pipeline, media+storage deletes, bulk leads/inventory. Correct = `apply_bundle` transactional RPC + `operation_id` idempotency (RULE D15).
- **UUID/snake_case:** ✅ compliant. Every app table UUID PK (only `schema_version`=TEXT metadata, `product_categories`=composite UUID). All columns snake_case; TS types now 100% snake (v6.5–6.9). Master schema matches; drift D1/D2 fixed.

### 2.2 Admin Settings
- Save flow: `SettingsForm` → `buildSettingsPayload` → `updateSettings` (`mutations.ts`), single `store_settings` row. All inline tabs verified persisting EXCEPT:
  - **ST2:** `enable_safe_checkout` hardcoded to `enable_trust_badges` (`buildSettingsPayload.ts:107`) — no independent UI; conflicts with Customizer's independent toggle.
  - `target_audiences`/`product_types` flat columns never written (survive via `ai_persona_config` JSONB) — read/write asymmetry.
- Separate-route tabs (Profile, Courier, Customizer) bypass main save — by design.

### 2.3 Homepage Customizer (per-page, verified)
Persistence model: **store_settings fields autosave (~1s debounce); section fields persist only on "Save Layout"** — this asymmetry causes CU6.
- **Home:** all section editors wired; per-device only on hero_banner (full), product_grid cols, collections_grid cols.
- **CU1:** `category_grid` editor (`CategoryGridSettings.tsx`) has no responsive-columns control, but storefront `CategoryGridSection` reads `mobile/tablet/desktop_columns` (`StoreFrontSections.tsx:96-100`) → locked at 2/3/4.
- **CU2:** `category_list` cols saved (`CategoryListSettings.tsx:30,44`) but storefront `renderCategoryList` (`StoreFront.tsx:118-135`) ignores them → dead.
- **Shop page:** ✅ all controls persist + in schema (shop_columns_*, shop_products_per_page_* now added).
- **Product Details:** block layout (`product_page_layout`) autopersists ✅; related/recently-viewed per-device cols ✅.
- **Product Cards:** superset card controls persist ✅; `card_mobile_columns` orphan (no UI); no per-device (global design).
- **CU3 (Global branding):** favicon/logo "Select media" buttons call `onSelectMedia('faviconUrl'/'logoUrl')` (camelCase) → dropped by snake whitelist → don't persist (typing URL works). `GlobalSettings.tsx:35,59` + `useCustomizerState.ts:230-235`.
- **CU4 (Appearance):** `AppearancePresetsList` exported but never rendered → no in-editor preset selection (only JSON import sets `theme_preset`).
- **CU5:** Appearance page renders Global left sidebar (`CustomizerLeftSidebar.tsx:124` else-branch).
- **Section Settings panel** (Zoom/Shift/Heading/Glassmorphism/Overlay): exist ONLY on hero_banner. promo_banner, category_grid, collections_grid render bg images + would logically need overlay/focal controls but have none.
- **Flash Sale lock:** ✅ real, gated on `flash_sale_enabled` (schema:501) across add/panel/storefront.
- **CU6:** section eye-toggle/reorder/title/per-section panels lost on navigate before Save Layout.

### 2.4 Product/Catalog Grids
- **G1 (High):** variant editor desktop-only (`variants-section/index.tsx:298` `hidden md:block`) — invisible on phone (mobile-first violation).
- CollectionTable no mobile view + missing `type="button"`. Admin grids otherwise wired + persist.
- Storefront: real data; cosmetic 5-star fallback for unrated. ShopPage renders `ProductCard` in its own inline grid instead of reusing `ProductGrid` (minor divergence).
- **U2:** `ShopProductListCard.tsx:190` "Buy Now" = add-to-cart (mislabel) + `<button>` nested in `<Link>`.

### 2.5 AI System
✅ Fixed: valid `gemini-2.0-flash`, admin model respected, errors surfaced. **Single-source** — no Customizer duplicate (premise disproven). Business presets/persona/prompts/automation all in `AITab` + consumed by `callAI`/`routeText`/`routeVision`. Word-limit/template enforcement lives in prompt-building (functional). `test-key` validates via models-list (false-green) — Low enhancement.

### 2.6 Cache + Sync
✅ Core paths invalidate via `lib/revalidate.ts` + `revalidateEntity`; import/seo/media wired; C9 fixed. Remaining low-impact: variant_presets + media trash bulk (reads not tagged).

### 2.7 UI/UX Consistency
✅ Tailwind invalid shades fixed. ⏳ Button conventions inconsistent (primary color/height vary; `components/common/Button.tsx` under-used). No `docs/UI_RULES.md`. Sidebar/settings order is logical.

---

## 3. Duplicate / Dead / Fake Code Map (Single-Source-of-Truth)

**Root cause of most drift:** Settings form and Customizer both write the SAME `store_settings` columns through TWO independent state trees + save triggers.

| # | Feature | Copies (files) | Same cols? | Drifted? | Canonical → action |
|---|---------|----------------|-----------|----------|--------------------|
| DUP1 | Product card/swatch | `settings/ProductsTab`(+products/*) · `customizer/pages/ProductCardSettings`(+product-card/*) · `customizer/pages/ShopPageSettings` | Yes | Yes (size lists xxs/xs, aspect defaults 3:4 vs 1:1, 16:9) | Customizer ProductCard (superset, DS2) → others reuse/trim |
| DUP2 | Header/top-bar/newsletter | `settings/HeaderTab` · `settings/PremiumTab`(PremiumHeaderNewsCard) · `customizer/pages/GlobalSettings` · `customizer-editor/sidebar/AnnouncementBarSettings` | Yes | label drift | Announcement Bar panel → keep; remove dup blocks |
| DUP3 | Footer/social | `settings/FooterTab`(+footer/*) · `customizer/pages/GlobalSettings` footer | Yes | `social_whatsapp` sanitized only in Settings | Settings Footer → keep; route customizer through cleaner or remove |
| DUP4 | Trust/safe-checkout/fake-views | `settings/TrustTab`(+trust/*) · `settings/PremiumTab`(PremiumViewerAndTickerCard) · `customizer/pages/ProductDetailPageSettings` | Yes | `enable_safe_checkout` hardcode conflict; fake-views in 2 Settings tabs | Settings Trust → keep; fix hardcode; drop Premium fake-views |
| DUP5 | Ticker enable/text | `settings/PremiumTab` · `customizer-editor/sidebar/TickerSectionSettings` | Yes | colors only in customizer | Customizer Ticker → keep |
| DUP6 | Dashboard vs Reporting widgets | `dashboard/{RevenueChartSection,TopProductsSection,StatusBreakdownCard,DashboardMetricsGrid,InventorySnapshotCard}` vs `reporting/{...,ReportingMetricsGrid,InventoryReportTable}` | render-props | prop shapes | Consolidate into `admin/shared/reporting-widgets/` |
| DEAD1 | Orphan store filters (0 importers) | `store/shared/{CategoryFilter,AvailabilityFilter,ColorFilter,MaterialFilter,PriceRangeFilter,SizeFilter,SortDropdown}` | — | ✅ DELETED + rule-15 updated | done |
| DEAD2 | Orphan size guides | `settings/SizeGuidesTab` + `settings/size-guides/*` | — | ✅ DELETED (0 importers) | canonical `app/admin/size-guides/` kept |
| DEAD3 | Appearance preset picker | `customizer/pages/appearance/AppearancePresetsList` (never rendered) | — | ✅ WIRED (CU4) | done |
| DEAD4 | `ReportingDashboard.isEmbed` branch | only ever false | — | ✅ removed | prop + dead branch deleted |
| DEAD5 | orphan columns | dead camelCase writes (`tickerBgColor`/`tickerTextColor`) | — | ✅ removed (ticker) | `card_mobile_columns`/media keys remain minor |

**NOT duplicated (verified):** AI config (single-source in AITab). ProductGrid storefront (single canonical, minor ShopPage inline divergence).

---

## 4. Phase-by-Phase Fix Plan (dependency-ordered)

**PHASE 1 — Security/RLS (Critical, live DB via Management API):** enable RLS on the 4 tables; lock `store_settings` secrets (public-safe view) + `customers`/`orders` SELECT to authenticated/service-role. Migration + master schema + RLS docs. Verify: anon key can't read secrets/PII; storefront still renders; admin unaffected.

**PHASE 2 — Schema drift:** ✅ DONE (D1/D2, v6.7.0).

**PHASE 3 — Atomic bundles (High):** `bundle_operations` + `apply_bundle` RPC; migrate `createProductAction`, product import, `createOrder`, social_proof, media+storage, bulk. Verify: inject mid-bundle failure → DB unchanged; retry same `operation_id` → no dup.

**PHASE 4 — Single-Source-of-Truth consolidation (High):** resolve DUP1–DUP6 — pick canonical per table above, refactor others to reuse the same component/state or remove overlaps; fix `enable_safe_checkout` hardcode; unify option lists/defaults. Verify: grep shows each `store_settings` column edited from exactly one component; edit in canonical reflects everywhere.

**PHASE 5 — Customizer fixes:** CU1 (category_grid cols control), CU2 (wire or remove category_list cols), CU3 (favicon/logo media snake key), CU4 (render AppearancePresetsList), CU5 (appearance left branch), CU6 (autosave section active/reorder or unsaved-guard), section titles for social_feed/ticker, overlay/focal controls for bg sections. Verify each control: set → reflects on storefront per device; no lost-on-navigate.

**PHASE 6 — Grids & mobile (High G1):** mobile variant editor; CollectionTable mobile + `type="button"`; Buy Now label + un-nest; star-rating fallback decision. Verify on 375px viewport.

**PHASE 7 — UI polish:** ✅ Tailwind shades done. ✅ `docs/UI_RULES.md` authored (design-system reference: shared Button primitive, tokens, mobile-first, states, SSOT). Button primitive documented as the standard; mass per-button migration left as ongoing guideline (low value/high churn to force at once).

**PHASE 8 — Dead code cleanup:** delete DEAD1/DEAD2, remove DEAD4 branch/orphan columns; update rule-15. Verify: `next build` + tsc green, no broken imports.

Cache invalidation (RULE C10) folded into every phase touching a write path.

---

## 5. Decisions Needed (defaults chosen; proceed unless overridden)
1. store_settings secrets → **public-safe view** (default) vs separate locked table.
2. Product-card duplicate canonical → **Customizer ProductCard page** (default, DS2).
3. Header/footer/trust dup → **remove Customizer/Premium overlaps, keep as noted** (default).
4. Dashboard/Reporting widgets → **consolidate into shared set** (default; both live).
5. `enable_safe_checkout` → **independent toggle in Settings Trust** (default) — stop clobbering Customizer.
6. Theme design-token JSONB keys (`theme_config.colors.textPrimary`) + section-settings JSONB → **keep camelCase** (self-contained payloads; default).

---

**AUDIT COMPLETE — WAITING FOR APPROVAL TO START PHASE 1.**
