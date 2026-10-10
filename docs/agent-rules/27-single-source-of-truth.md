# 27 — RULE SSOT1: Single Source of Truth (ZERO duplicate implementations)

> Hard architectural rule. Applies to EVERY domain, module, menu, settings tab, customizer section, grid, button, toggle, and data model — no exception.

## The rule
- Agar koi feature/setting/control/grid/data **ek se zyada jagah** dikhta hai (Settings, Customizer, ya koi aur module), to uska **exactly ONE shared source** hona chahiye: ek shared component + ek shared data model + ek shared save/fetch logic — jahan bhi dikhe wahan **import/reuse** ho.
- Kabhi bhi kisi cheez ka **doosra, alag-coded version** mat banao jo pehle se kahin exist karta hai. Agar genuinely do jagah chahiye (e.g. Customizer me quick-access jo Settings me full form me hai), doosri jagah **wahi exact component/logic/state reuse** kare — re-implementation / copy-paste variant / "looks similar but different code" strictly BANNED.
- Ye applies to: settings tabs, form fields, buttons, grids (product/category/collections/variant), toggles, AI config, cache/save logic — har domain, har module, bina exception.

## Root-cause pattern to hunt (verified in this repo)
Settings form aur Homepage Customizer dono **same `store_settings` columns** likhte hain do **alag React state trees + alag save triggers** se (Settings = manual Save bar; Customizer = 1s debounced autosave) → **last-writer-wins drift**. Ye har duplicated column ka bug-source hai. Confirmed duplicate groups: product-card/swatch (triple), header/top-bar/newsletter (quad), footer/social, trust/safe-checkout/fake-views, ticker, dashboard-vs-reporting widgets. (Details + canonical decisions: `docs/DEEP_AUDIT_PLAN.md` §3.)

## RULE SYNC-SC — Settings ↔ Customizer Sync (MANDATORY)
If a Customizer section has a matching Shop Settings tab (Header, Footer, Products, Navigation, Trust & Badges, WhatsApp, Premium, etc.), both MUST read and write the SAME data — **same key, same default, same save path**. Never keep two copies.
- **Customizer** = the controls WITH live preview (desktop / tablet / mobile).
- **Settings tab** = the same controls, NO preview, same labels, same order, same validation.
- A new control added in the Customizer for a section that also has a Settings tab → MUST also appear in that tab, and the reverse.
- Controls with no visual effect on the storefront stay **Settings-only**.
- A visual Premium feature → controls live in the Customizer WITH preview (same key as the Settings toggle); add an "Edit in Customizer" link in the Settings tab and a "Manage in Settings" link in the Customizer where useful.
- Applies to header, footer, products, premium, and all future sections.

**Checklist before finishing any Settings/Customizer task:** same key? · same default? · same save path? · applied on storefront? · cache purge works? · both brands (Zaynahs.pk + TotVogue.pk) load their own values without breaking saved data?

## RULE TABS-ALIGN — Settings Tabs Alignment (MANDATORY)
The Shop Settings tab bar (`components/admin/settings-form/SettingsTabBar.tsx` → `TABS`) is ordered storefront-appearance first, operations after:
- Appearance: General · Header · Footer & Social · Navigation · Products · Trust & Badges · Customizer
- Operations: WhatsApp · Shipping & Pay · Courier Manager · Coupons · Policies & FAQ · Profile & Account · Premium Features · Pixels & SEO · AI Settings · Email & SMTP (· Meta Sync when enabled)
- Related tabs stay grouped; Header and Footer stay adjacent. Equal tab height/spacing, one consistent active state, no stray hover highlight.
- `?tab=...` deep-links MUST keep working; each tab saves only its own fields; warn on unsaved changes when switching tabs.
- Forms keep `pb-36 sm:pb-20` so the sticky bottom save bar never covers the last field (RULE DS6).

## Before writing ANY new code (mandatory pre-check)
1. Search `components/`, `lib/`, `app/` for an existing component/hook/util/column that already does this or something close.
2. Exist karta hai → **use/import/extend** the shared one. Duplicate/rewrite/copy-paste-tweak mat karo.
3. Naya sirf tab jab koi shared module reasonably cover na kare; naya shared piece `components/shared/` ya `components/common/` me jaaye.

## Consolidation procedure (when a duplicate is found)
a. Har duplicate pair/group list karo: kya hai, har copy ka exact path, same DB cols/service?, drifted?, canonical kaunsa.
b. ONE canonical shared implementation choose karo; baaki ko remove ya refactor-to-reuse. "Just in case" dono mat rakho.
c. Settings + Customizer ke andar har tab/section/grid/menu clean, logical, consistent order me ho — no missing options, no half-finished tabs, no orphaned/broken entries.
d. Koi grid/tab jo expected sub-options miss kar raha ho (jaise ek grid me responsive-columns control nahi jab similar grids me hai) = "broken/incomplete", flag + fix.

## Definition of done
- Poore app me **zero features** do alag code paths me.
- Har menu/tab/grid/setting complete, correctly ordered, aur ya to fully functional ya explicitly removed — kuch bhi half-built / fake / duplicated nahi.
- No per-case/per-page patches — fixes generic + reproducible across the whole system (see [01-core-operating-principles.md](01-core-operating-principles.md) RULE OP1).

## Canonical shared modules (the ONLY entry point for their job)
- **Premium / feature gating** → `lib/features/premium.ts` (`isFeatureEnabled`, `isSectionEnabled`, `sectionPremiumFeature`, `PREMIUM_FEATURE_FLAG`, `PREMIUM_FEATURE_LABEL`, `SECTION_PREMIUM_FEATURE`). NEVER write an inline `settings.<x>_enabled === false` gate again — call `isFeatureEnabled(settings, feature)`. New gated feature = add ONE row to `PREMIUM_FEATURE_FLAG` + `PREMIUM_FEATURE_LABEL` (and to `SECTION_PREMIUM_FEATURE` if it gates a homepage/customizer section). Established Pass 0 (`docs/AUDIT_PASS0_STOREFRONT_TRACE.md`).
- **Singleton config row IDs** → `lib/config/singleton-ids.ts` (`STORE_SETTINGS_ID`, `AI_SETTINGS_ID`). NEVER paste the literal `'00000000-0000-4000-8000-0000000000xx'` UUID in code — import the constant. Required for clone-readiness (no hardcoded row identifiers in source). Established Pass 2b (`docs/AUDIT_PASS2_SETTINGS.md`).
- **AI settings client read/write** → `lib/services/ai/ai-settings-client.ts` (`getAutoMediaAi`, `setAutoMediaAi`, `getAiEnabled`). NEVER inline a `.from('ai_settings')...` read/write from a component. `store_settings` is the canonical write target; `ai_settings` is mirrored by a DB trigger. Established Pass 2b.
- **Storefront wishlist toggle** → `components/store/product-card/hooks/useWishlist.ts` (`useWishlist(productId, flyImage)` → `{ isInWishlist, toggleWishlist }`). NEVER inline the localStorage add/remove + fly-animation + `wishlist-updated` broadcast in a card. Established Pass 4 (`docs/AUDIT_PASS4_GRIDS.md`).
- **Media picker / carousel (planned)** → `MediaManager`+`MediaSelectorModal` (picker, existing canonical), plus planned `MediaCardListEditor` / `ImageCarousel`. See `docs/AUDIT_PASS3_CUSTOMIZER.md` + `docs/UI_RULES.md` RULE MEDIA1.
- **Customizer URL field** → `components/admin/customizer/shared/MediaField.tsx` (label + URL input + Select-from-library). Used by HeroActiveSlideForm + GlobalSettings; NEVER re-inline an input+Select block. Established Pass 3b.
- **Gallery carousel wiring** → `components/store/product-card/hooks/useEmblaGallery.ts` (Embla init + swipe⇄index sync), shared by ProductDetailGallery + QuickViewModal. Their overlay chrome (zoom/lightbox/badges vs compact modal) is an intentional variation and stays per-component. Established Pass 3b.
- **List reorder** → `lib/utils/arrayMove.ts` `moveItemInArray(arr, index, 'up'|'down')` for adjacent up/down (all 7 customizer list editors) and `arrayMove(arr, from, to)` for drag reordering. NEVER inline a temp-swap reorder again. Established Pass 3b.
- **Cache invalidation** → `lib/revalidate.ts`. Per-slug: `revalidateProduct/Category`; broad: `revalidateBanner/Homepage/Settings/Vertical`; storefront-visible admin domains without a per-slug revalidator (collections, coupons, badges, size guides, social proof, payment/shipping methods, admin review moderation): `revalidateStorefrontEdge(...tags)` (tags + paths + full Cloudflare purge). NEVER use bare `revalidateTagSafe` for a storefront-visible admin write (it skips the CDN edge). Public/high-frequency writes stay tag-only by design. Established Pass 5 (`docs/AUDIT_PASS5_CACHE_PURGE.md`).
- **Admin authorization** → `lib/auth/requireAdmin.ts` (`requireAdmin(req)` at the top of EVERY privileged API route) + root `middleware.ts` (admin UI gate). NEVER hand-roll an inline `getUser()`/`getSession()` admin check in a route. Model: Supabase session + `NEXT_PUBLIC_ADMIN_EMAIL` allow-list. Established Pass 6 (`docs/AUDIT_PASS6_SECURITY.md`).
- **Server-only secrets** → `lib/services/settings/server-secrets.ts` (SMTP) + `getAISettings()` (AI keys). Secrets (`smtp_app_password`, `postex_api_token`, `content_keys`, `vision_keys`, `ai_model_credentials`) are NEVER mapped into the client-facing `StoreSettings` object, NEVER returned by `/api/settings`, and are written **write-only-if-provided**. Established Pass 6.
- **Product Badges SSOT** → `components/store/product-card/ProductCardBadges.tsx`. Universal entry point for all product badges across cards (Standard, Showcases 01–16, Ella 01–08), QuickView modals, and ProductDetailGallery PDP. Synchronizes with `/admin/badges` system & custom badges with zero duplicate JSX (RULE DS-BADGES).
- **Product search engine SSOT** → `lib/services/product-search/` (the ONLY ranking/search logic for the whole app — admin + storefront). Entry points: server search `searchProductsServer()` + `/api/search/products` (full-text `search_vector` + trigram, paginated); client hook `useProductSearch()` (debounce + 30s cache + AbortController); in-memory ranker `rankProducts(products, query)` / `useInMemoryProductSearch()` for admin pickers that already hold the list; shared UI `ProductSearchModal`. NEVER write an inline `products.filter(p => p.name.toLowerCase().includes(q))` for product search again — call `rankProducts()` (in-memory) or the server API. Ranking weights live ONCE in `DEFAULT_SEARCH_WEIGHTS` (`types.ts`). Full rules + searchable fields + pagination: see [29-product-search-pagination.md](29-product-search-pagination.md).

