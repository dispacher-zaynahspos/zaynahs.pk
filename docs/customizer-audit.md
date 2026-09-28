# Theme Customizer — Phase 0 Deep Audit

Route: `/admin/settings/customizer` · Stack: Next.js App Router + React/TS + Tailwind + Supabase
Status: **READ-ONLY AUDIT. No code changed.** Awaiting approval before Phase 1.

---

## 0. Executive summary

The customizer works but is architecturally inconsistent and incomplete:

- **No single source of truth.** The 12 section-type strings are duplicated across ~5 files; `settings`/`content_data` are untyped `Record<string, any>`; there is **no zod schema** anywhere. Validation is only informal TS + `??` defaults in the mapper.
- **No unified responsive model.** Responsive values are flat suffixed keys (`*_desktop/_tablet/_mobile`), never a nested `{ base, tablet, mobile }` object. The top-bar `viewportMode` is UI-context only.
- **Inconsistent panels.** Hero Banner is a huge flat form; most sections have partial controls; several pages (Shop, Global, Product Details) expose only a fraction of what the storefront hardcodes.
- **Big consume/hardcode gap.** Whole components (Mobile Bottom Nav, Category Filter chips, Checkout, Cart Bar, Quick View, Search, Ticker speed, Brands slider) are 100% hardcoded. Accent literals `#e94560` / `#10b981` / `#1a1a2e` are scattered everywhere and bypass the `theme_config` CSS-variable system.
- **Preview is good.** Real `<iframe>` at fixed device widths (1280/800/375) + `postMessage` sync — so breakpoints already fire correctly. (Prompt item #9 concern is largely already solved; the device widths just differ from the prompt's 1280/768/390.)

The screenshot problems are all confirmed with root causes (§7).

---

## 1. Architecture map

### Entry & pages
- Route: `app/admin/settings/customizer/page.tsx` (server; fetches sections, products, categories, collections, settings, reviews) → `components/admin/CustomizerEditor.tsx`.
- State hub: `components/admin/customizer-editor/hooks/useCustomizerState.ts` — `activePage ∈ {home, shop, product_detail, product_card, global, appearance}`, `viewportMode` (default `'mobile'`), `activeSubTab`, `storeSettings`, `sections`.
- Columns: `CustomizerTopBar` (Page dropdown + device switch + Save), `CustomizerLeftSidebar`, `CustomizerPreview`, `CustomizerRightSidebar`.
- Right-panel dispatch by `activePage` → page editors (`CustomizerRightSidebar.tsx:88-310`).

### Section-type registry (DUPLICATED across 5 places — no central registry)
1. Palette label map — `HomeSectionsStack.tsx:40-52` (note: "Promo Slider" = `hero_banner`; "Category Filter" = `category_list`).
2. Default titles — `useCustomizerState.ts:211-237` (fallback `'New Section'`).
3. Server insert defaults — `lib/services/sections/homepage-sections.ts:139-153` (only 5 types get non-empty defaults).
4. type→editor-panel map — `CustomizerRightSidebar.tsx:121-255`.
5. type→storefront-renderer — `components/store/StoreFront.tsx:168-215` (`category_grid` & `collections_grid` share `CategoryGridSection`).

### Schema & types
- `HomepageSection` — `lib/types/settings.ts:45-55`; `settings` + `content_data` are `Record<string, any>` (untyped).
- `StoreSettings` — `lib/types/settings.ts:57-394`; `ThemeConfig` — `:13-43`.
- **No zod.** Defaults: DB column defaults (`SUPER_MASTER_SCHEMA.sql:539-589`) + app `??` fallbacks in `dbToSettingsMapper.ts:4-309`.

### Persistence
- `homepage_sections` table (`SUPER_MASTER_SCHEMA.sql:1055-1065`): JSONB `settings`/`content_data`, `sort_order`, `active`. CRUD in `lib/services/sections/homepage-sections.ts`. Home layout = ordered set of rows (no `homepage_layout` column).
- `store_settings` table: theme/global/cards/`product_page_layout`. Save via `lib/services/settings/mutations.ts:12-369` (inline whitelist payload). Product-detail layout = `store_settings.product_page_layout` text array.
- Autosave: settings 1s debounce, sections 1.2s debounce; explicit "Save Layout" → `/api/revalidate-customizer` (Next tags + Cloudflare purge).

### Preview (already iframe-based)
- `CustomizerPreview.tsx` → real `<iframe src="/admin/settings/customizer/preview">` at fixed widths **1280 / 800 / 375** with CSS `transform: scale()` to fit. Storefront breakpoints fire correctly.
- `useCustomizerIframeSync.ts` postMessage bridge: parent → `sync`/`change_page`/`scroll_to_section`; iframe → `select_section`/`nav_to_page`/etc. Iframe target: `preview/PreviewClient.tsx` renders real storefront with `isPreview`.

### Responsive model
- Flat suffixed keys only (`shop_columns_desktop/tablet/mobile`, `height_desktop/tablet/mobile`, etc.). `viewportMode` decides which control to show; shared `ResponsiveGridColumnsControl.tsx` writes 3 flat keys. **No nested per-device object.**

### Sections stack (left, home)
- `HomeSectionsStack.tsx`: "+ Add Layout Section" (12 buttons, premium-gated via `isSectionEnabled`), Announcement Bar shortcut (pseudo-section `announcement_bar`, not a DB row), then the ordered stack. Eye toggle → `active`; up/down (button-only, **no drag-drop** — GripVertical is decorative); trash. Label = `section.title || section_type`.

---

## 2. Home-section control matrix

Legend — Device: ✅ per-device, ⚠️ columns-only, ❌ none. Editor files under `components/admin/customizer/sections/` unless noted.

| Section (type) | Editor | Controls present | Device | Key problems |
|---|---|---|---|---|
| Hero Banner / "Promo Slider" (`hero_banner`) | `HeroBannerSettings` + `hero-banner/*` | slides repeater (title/img/video/text/CTA), autoplay+speed, per-device height/width/position/align/focal/heading, overlay color/opacity, glassmorphism, heading/subtitle color | ✅ (text+dims) | Flat 3-block layout, no groups/collapse. Slide label blank when created in mobile view (writes `mobile_title`, never `title`; label reads desktop `title` only — `HeroSlideManager.tsx:57`, `HeroActiveSlideForm.tsx:144-162`). Image/video "(all devices)" mixed with per-device text = confusing. No arrows/dots/transition/loop/swipe/pause controls (all hardcoded in storefront). |
| Product Grid (`product_grid`) | `ProductGridSettings` + `product-grid/*` | show_title, source, sort, manual picker, limit, columns/device, upper+bottom View-All, load-more, infinite scroll, button colors | ⚠️ | No gap, aspect ratio, carousel mode, card-style override, "new/sale/best" sources. |
| Category Filter (`category_list`) | `CategoryListSettings` | heading text, show heading | ❌ | Only 2 controls. Chip design 100% hardcoded (`CategoryFilter.tsx`). |
| Category Grid (`category_grid`) | `CategoryGridSettings` | aspect ratio, columns/device, show title, card labels, cards repeater | ⚠️ | No hover effect, label position/style, gap, overlay controls. |
| Collections Grid (`collections_grid`) | `CollectionsGridSettings` | show title, upper+bottom View-All, aspect ratio, columns/device, card labels, cards repeater | ⚠️ | Same gaps as Category Grid. Default title "Nested Collections Grid" duplicates. |
| Promo Banner (`promo_banner`) | `PromoBannerSettings` | text, bg/text color, show button, link, button text | ❌ | Button always white (hardcoded). No image, per-device height, split layout, overlay. |
| Trust Badges (`trust_badges`) | **none** (static lock note) | — | ❌ | No editor; managed in General Settings. No columns/layout/icon controls. |
| Reviews Feed (`recent_reviews`) | `RecentReviewsSettings` | sort, manual picker, limit, show images, show View-All | ❌ | No layout (grid/carousel), star style, verified/photo toggles, autoplay, colors. |
| Brands Slider (`brands_logos`) | `BrandsLogosSettings` | logo URLs textarea only | ❌ | No media picker, columns, logo size, grayscale/hover, autoplay/direction. |
| Social Feed (`social_feed`, premium) | `SocialFeedSettings` + items editor | title/subtitle/desc, limit, columns/device, items repeater (image/username/link/caption/platform/video) | ⚠️ | Columns control doesn't receive `viewportMode`. No autoplay/direction/grayscale. |
| Scrolling Ticker (`ticker`) | `TickerSectionSettings` (sidebar) | enable (global), lines (global), bg/text color (section) | ❌ | Speed/direction/pause/separator/height/font all hardcoded (30s marquee). Color keys written but **no producer→consumer match** (reverse-dead). |
| Announcement Bar (`announcement_bar`, virtual) | `AnnouncementBarSettings`→`HeaderAnnouncementFields` | show top bar, phone, email, show newsletter, text (all global `StoreSettings`) | ❌ | No colors/height/sticky/dismissible/rotate-mode/per-device controls (storefront hardcodes those). |
| Flash Sale (`flash_sale`, premium) | `FlashSaleSettings` + `flash-sale/*` | start/end time, View-All, sort, limit, columns/device, bottom actions, per-category discount rules, per-product prices | ⚠️ | No timer style; countdown UI hardcoded. |

**Progressive disclosure** exists partially (Hero autoplay speed, video autoplay/mute, CTA blocks; Product Grid manual picker + view-all; Collections view-all; Reviews manual picker; Ticker; Announcement fields; Flash Sale bottom actions). Everything else renders flat.

---

## 3. Page matrix (non-home)

### Product Cards — `pages/ProductCardSettings.tsx` + `product-card/*`
Present: `card_style`, `image_hover_style`, `image_aspect_ratio`, `title_line_limit`, `card_alignment`, `card_elements_order`; visibility toggles (`card_show_stars/wishlist/quickview/quickcart/description` + swatch show/enable keys); swatch styling (`enable_variant_swatches`, `swatch_shape`, `swatch_limit`, `archive_swatch_size`, `archive_swatch_align`).
- **"Simulate Mobile Scroll Focus"** (`ProductCardPreviewStudio.tsx:16,99,219-230`) is a **manual class toggle** (`is-in-focus active-card`), NOT the real engine `lib/hooks/useMobileCardFocus.ts`. Prompt wants a **"Mobile activation mode: Touch | Scroll focus | Off"** setting — currently missing.
- Missing controls: card padding/radius/border/shadow/hover-lift; badge styles (sale %/featured/new colors+position); price colors incl. **compare-at strike (hardcoded gray)**; icon button style/size/position; image fit (contain hardcoded); rating style; quick-add/wishlist behavior. `card_variant` read but never exposed.

### Shop Page — `pages/ShopPageSettings.tsx`
Present (subtab `layout`): `default_variant_index`, `shop_category_chips_enabled`, `shop_infinite_scroll`, `shop_columns_desktop/tablet/mobile`, `shop_products_per_page_*`. (Swatches subtab is now an empty placeholder — moved to Product Cards.)
- Missing: sidebar/filter-drawer config, which filters, price/in-stock filter, sort-bar/default sort, pagination-mode selector, banner/header, empty state, breadcrumbs, grid gap, grid/list default view.

### Product Details — `pages/ProductDetailPageSettings.tsx` + `product-detail/*`, left `ProductDetailBlocksStack.tsx`
- **Confirmed:** default lands on `layout` subtab (`useCustomizerState.ts:66-67`) which is just a reorder list (`ProductLayoutSubTab.tsx:40-96`) — duplicates the left stack, "no real settings." Real per-block settings only show after clicking a block.
- **Confirmed:** every block shows `EyeOff` because it's a **destructive remove** from `product_page_layout` (`ProductDetailBlocksStack.tsx:145-157`), not a reversible visibility flag. No eye/eye-on state.
- **Confirmed:** "Product Sale Settings" locked behind `flash_sale` premium flag (`:59-87`, `ProductSaleSubTab.tsx:18-31`).
- Misleading map: `reviews` block → `urgency` subtab (stock/views).
- Real settings that DO exist: swatches, ticker, urgency (stock/views), related, recently_viewed, social_feed, delivery. Missing blocks the prompt wants: Size Guide, Delivery info block, Trust badges block, Sticky add-to-cart bar, gallery layout/zoom mode, variant selector style, tabs/accordion, share.

### Global Settings — `pages/GlobalSettings.tsx`
Present: branding (favicon/logo/logo width), header (sticky desktop+mobile, announcement fields), footer (copyright + social links).
- Missing: header layout variants, transparent-on-hero, search style, cart icon, menu/mega-menu, mobile drawer, header height/device; topbar beyond announcement; footer column/menu builder, newsletter, payment icons; **Mobile bottom nav (0 controls)**; WhatsApp/floating button config (position exists in settings but no customizer UI here); cart drawer; popups/cookie bar; SEO defaults; custom head/body code.

### Appearance — `pages/AppearanceSettings.tsx` + `appearance/*`
Present: preset list (`THEME_PRESETS`, premium gating), Colors tab (11 tokens → `theme_config.colors`), Fonts (heading/body/base size), Borders & Buttons (btn/card radius, primary button bg/text/hover), reset/export/import JSON. Applied via `ThemeStyleRegistry.tsx` → CSS variables on `:root` (good architecture).
- Missing: dark-mode token set (single palette only), secondary/ghost button styling, border-width, shadow/elevation tokens, spacing scale, container widths, semantic tokens (sale/success/warning/link — only `price` exists), font weight/line-height/letter-spacing, modular heading scale.

---

## 4. GAP LIST A — dead settings (in customizer/type, storefront doesn't consume)

| Key | Set in | Status |
|---|---|---|
| `enable_search` | settings form | No storefront read; search button always renders. |
| `header_sticky` (singular) | `useSettingsHeaderFooter.ts:34` | Storefront reads only `header_sticky_desktop/_mobile`. Singular never read. |
| `enable_safe_checkout` | `ProductDetailPageSettings.tsx:372` | No gate uses it (footer/cart gate on `enable_trust_badges` + `safe_checkout_methods`). |
| `swatch_size` (deprecated) | legacy | Superseded by `archive_swatch_size`/`product_swatch_size`. |
| `header_desktop_theme_align` | header align controls | Read (`Navbar.tsx:79`) but bound to the admin-link node, not a theme toggle; desktop has no ThemeToggle. |
| `tickerBgColor`/`ticker_bg_color`/`tickerTextColor`/`ticker_text_color` | Ticker editor writes them | **Reverse-dead:** read in `StoreFrontSections.tsx:235-236` but not in the type; producer/consumer key mismatch → always empty → hardcoded defaults. |

Reverse gap: `header_sticky_mobile` is consumed but has no matching customizer toggle in some paths (control gap on a live setting).

---

## 5. GAP LIST B — hardcoded values needing controls (by area)

- **Header/Nav:** height (h-16/h-14), shadow, z-[100], nav item colors/radius/padding, dropdown radius/width/z, hover delay (150ms), forced mobile logo center, announcement autoplay (4000ms), desktop ThemeToggle placement.
- **Announcement/Topbar:** padding/font/weight, ticker text sizing, arrow/spacer sizes, preview ring color.
- **Hero:** base bg `#1a1a2e`, dot color `#e94560`, arrow bg/opacity/glyphs, content paddings (p-16/p-12/p-6), gradient overlay, button radius/size, heading `font-serif`, focal transition; transition style/loop/arrows/dots/swipe/pause.
- **Product Grid:** grid gaps, default columns fallback, priority-image count (6), section padding, bottom-button default colors, infinite-scroll rootMargin/spinner color.
- **Category Filter:** entire chip design + "All Items" label + gaps (0 controls).
- **Category/Collections Grid:** overlay gradient/opacity, hover scale+duration (500ms), label styling, gaps, padding, demo default images.
- **Promo Banner:** button always white, padding, title size, default strings.
- **Trust Badges:** icon color `#e94560`, card radius/bg/shadow/padding, icon container, grid gap.
- **Reviews Feed:** avatar palette (7 hex), star sizes, card styling, verified color `#10b981`, thumb sizes, "View All" text/URL(`/reviews`)/color, grid layout.
- **Brands Slider:** logo box size, opacity/grayscale, gap, section bg/padding, title styling, demo logos; no columns/autoplay.
- **Social Feed:** card aspect (9/16), default columns, max items (8), pill colors, title, overlay opacity, brand icon colors, IO margin.
- **Ticker:** speed (30s), loop (4), separator `✦`, default colors, padding, border.
- **Flash Sale:** shell bg/radius/border, live-dot colors, countdown box sizing/labels, "View All" color, default title.
- **Footer:** bg/border/text colors, container width/padding, gap, link hover `#e94560`, social tile size/radius/hover colors, "Show More" threshold (6), Reviews link visibility, newsletter button color/radius/placeholder, default column strings.
- **Mobile Bottom Nav:** EVERYTHING (item set/labels/icons/order, enable, per-item visibility, height, colors, badge sizes, backdrop/blur/shadow, z-40). Only `--color-primary` themable.
- **Cart Bar / Checkout:** CartBar position/colors/radius/z/shadow/strings; checkout hardcoded country `🇵🇰 Pakistan`, all field labels/placeholders/examples, accent `#e94560`, submit color+label, progress-step text, sticky offset.
- **Quick View:** overlay/z/bg, panel radius/max-h, close button, thumb border, discount badge color, strike colors, add-to-cart colors, close delay (250ms).
- **Search:** overlay/z/bg, panel radius, input focus colors, search button color, default popular searches, recommended count (4), **price hardcoded `Rs.` (ignores `currency_symbol`)**, header copy.
- **WhatsApp/Floating:** icon size, brand colors/gradients, zIndex 120, gap, stacking offsets (56/176/160), tooltip; WhatsAppButton green colors, radius/padding, label, fallback number.
- **Pervasive:** literal `#e94560` / `#10b981` / `#1a1a2e` throughout bypass `theme_config` tokens.

---

## 6. Confirmed screenshot problems → root cause

| Screenshot issue | Root cause (file:line) |
|---|---|
| Hero one long flat list, no groups | `HeroBannerSettings.tsx` renders slides + form + global flat; no accordion. |
| Slide #1 name blank | Row label reads desktop `slide.title` only; created-in-mobile writes `mobile_title` (`HeroSlideManager.tsx:57`, `HeroActiveSlideForm.tsx:144-162`). |
| Broken banner preview (alt only) | Image URL empty/broken for that slide; no fallback. |
| "(all devices)" + "Showing MOBILE" confusing | Media is device-agnostic (`HeroActiveSlideForm.tsx:70-79`) while text is per-device — mixed in one panel. |
| "New Section" / duplicate "Nested Collections Grid" | `defaultTitles` fallback `'New Section'` + `collections_grid: 'Nested Collections Grid'`, no dedup/rename (`useCustomizerState.ts:217,229`). |
| Product Details right panel only shows order | Default subtab `layout` → `ProductLayoutSubTab` reorder-only (`useCustomizerState.ts:66-67`). |
| All blocks eye-off | Eye button is destructive remove, no visibility flag (`ProductDetailBlocksStack.tsx:145-157`). |
| Shop only 2 cards | Only `layout` subtab has controls; sidebar/sort/filters/etc. not built. |
| Global 3 small cards | Only branding/header/footer sub-tabs implemented. |
| Card "Simulate Scroll Focus" | Manual class toggle, not touch-mode setting (`ProductCardPreviewStudio.tsx:16,219-230`). |
| Preview media queries vs frame | Actually OK — real iframe at 1280/800/375 (`CustomizerPreview.tsx`). Prompt widths 390/768 differ slightly. |

---

## 7. Recommended target schema (for Phase 1 approval)

**A. SSOT zod schema** in `lib/theme-schema/` imported by BOTH customizer and storefront. Per setting: `type, default, min/max/step, unit, scope (global|responsive), label, help, group`.

**B. Responsive value model** — migrate flat `*_desktop/_tablet/_mobile` to `{ base, tablet?, mobile? }` with `resolve(value, device)`. Backward-compatible migration: read old flat keys → new object; write both during a transition window (no data loss, defaults for missing).

**C. Section registry** — one `SECTION_REGISTRY` (type → { label, defaultTitle, defaultSettings, defaultContent, editor, renderer, deviceAware, premium }) replacing the 5 scattered maps. Fixes naming/dedup and lets new sections register once.

**D. Shared control library** in `components/admin/customizer/controls/` — Toggle, Select, Segmented, Slider+unit, Color(token/custom/opacity), Media picker, Text/Textarea, Link picker, Spacing(4-side), Alignment, Typography, Border/Radius/Shadow, Repeater. Every responsive field gets a device badge + override dot + "reset to inherited". Accordion groups + progressive disclosure + search + tooltips.

**E. Product-detail visibility** — split order (reorder) from visibility (eye/eye-on boolean per block) instead of destructive array membership.

**F. Storefront token adoption** — replace hardcoded `#e94560`/`#10b981`/`#1a1a2e` and hardcoded dims with schema-driven CSS variables (defaults = current values → zero visual change).

---

## 8. Proposed phase order (unchanged from prompt, refined)
- **Phase 1** — schema + responsive model + migration + shared control library + section registry + naming/dedup + draft/publish + undo/redo.
- **Phase 2** — home sections, one at a time (Hero first; it's the biggest). Common tabs: Content | Layout | Style | Responsive/Visibility | Advanced.
- **Phase 3** — Product Cards (+ activation mode), Shop, Product Details (real per-block settings + reversible visibility).
- **Phase 4** — Global (incl. Mobile Bottom Nav, header variants, footer builder, floating) + Appearance (dark mode, semantic tokens, spacing scale).
- **Phase 5** — close Gap A (wire or remove dead settings) + Gap B (hardcoded → controls, defaults = current), storefront consumes shared schema via CSS vars, revalidate/purge verify, perf + a11y + QA.

---

## 9. Open decisions needing your call
1. **Responsive migration strategy:** dual-write (old flat + new object) during transition, then drop old — OK?
2. **Ticker/announcement**: promote to full section schema (speed/colors/height/sticky) — confirm scope.
3. **Mobile Bottom Nav**: build full item/visibility/color control set (currently 0) — confirm it's in scope for Phase 4.
4. **Compare-at strike color**: prompt wants "red default" but storefront currently renders gray strike on cards vs red elsewhere — standardize to red app-wide?
5. Preview device widths: keep current 1280/800/375 or switch to prompt's 1280/768/390?

**STOP — awaiting your approval / "next" to begin Phase 1.**

---

## 10. PROGRESS LOG (post-audit implementation)

Phases 1–3 + foundation shipped in prior sessions (theme-schema SSOT, shared control library, section-editor migration, product-detail reversible visibility, card appearance, shop grid). This session added:

### Gap A — dead settings closed
- **`enable_search`** — now gates the storefront search button (`components/common/Navbar.tsx` searchNode; only `setSearchOpen(true)` caller is that button, so disabling fully hides search). Was: button always rendered.
- **`enable_safe_checkout`** — now gates the product-detail "Safe Checkout" block (`components/store/product-detail/info/ProductDetailTrustBadges.tsx:55` → `settings.enable_safe_checkout !== false && ...`). Default-true so legacy stores unchanged. Was: toggle did nothing.
- **`swatch_size`** — re-verified: NOT dead, still an active fallback in `VariantSelector.tsx:46` / `ProductCard.tsx:123`. Left as-is (backward-compat).
- **ticker colors** — re-verified already fixed (editor writes both `tickerBgColor` + `bgColor`; storefront reads both).

### Phase 4 Global
- **Mobile Bottom Nav enable toggle** (was 0 controls) — new `mobile_bottom_nav_enabled` setting (migration `20260927190000`, applied 4/4 stores + master schema). Full chain: type → mapper types → dbToSettingsMapper → mutations whitelist → `GlobalSettings.tsx` toggle. `MobileBottomNav` accepts `enabled` prop; store layout + customizer preview both pass it. Default true = no visual change.

### Phase 4 Appearance — semantic tokens
- Added **`sale` / `success` / `warning` / `link`** color tokens (theme_config JSONB — no migration). Wired end-to-end: `ThemeConfig` type → `AppearanceColorTokensTab` UI (with sensible defaults #e94560/#10b981/#f59e0b/accent) → `ThemeStyleRegistry` emits `--color-sale/--color-success/--color-warning/--color-link` on `:root`. Storefront can now consume these vars instead of hardcoded hex.

Verified each batch: `tsc --noEmit` = 0 errors, `next build` ✓ 294/294 pages.

### Still open (large, tracked — recommend focused follow-up passes, not one burst)
- Phase 4 Global: header layout variants, footer column/menu builder, full mobile-bottom-nav **item builder** (labels/icons/order/per-item visibility/colors), WhatsApp floating button controls in customizer (currently in Settings form — functional, just not in customizer).
- Phase 4 Appearance: dark-mode token SET, secondary/ghost button styling, border-width/shadow/spacing-scale/container-width tokens, typography weight/line-height.
- Phase 5 Gap B: source-level replacement of pervasive `#e94560`/`#10b981`/`#1a1a2e` literals with the new tokens. NOTE: `ThemeStyleRegistry` already runtime-remaps these hex → theme vars (lines ~101-250), so themes already apply; source-level cleanup is polish, not a functional blocker.

