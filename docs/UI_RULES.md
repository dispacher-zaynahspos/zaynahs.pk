# UI RULES — zaynahsestore-tv-main (design-system reference)

> Referenced by `docs/agent-rules/14-design-system.md` and `docs/DEEP_AUDIT_PLAN.md` (P7).
> Mobile-first, Shopify-style admin console. This is the single reference for consistent UI.

## 1. Buttons (RULE: use the shared primitive)
Use `components/common/Button.tsx` for all primary user actions. Do NOT hand-roll a
`<button className="bg-...">` for a primary/secondary/danger action — use the primitive so
color, height, touch-target and loading state stay consistent.

- Variants: `primary` (brand `#e94560`), `secondary`, `outline`, `accent`, `ghost`, `danger`, `whatsapp`.
- Sizes: `sm` / `md` / `lg` / `xl` / `full` — every size enforces a **≥44px touch target** (mobile).
- Loading: pass `isLoading` (shows spinner, disables) instead of manual disable+spinner.
- Icons: `leftIcon` / `rightIcon`.

Acceptable exceptions (inline `<button>` allowed): icon-only affordances inside dense tables/
cards (delete/edit/reorder icons, toggles, swatches, color pickers). These MUST still set
`type="button"` when inside a form or a clickable card.

## 2. Color tokens (no hardcoded hex for new work)
- Brand primary: `#e94560` (tokenised as `primary` / `--color-primary`).
- Use Tailwind theme tokens (`bg-surface-2`, `text-text`, `border-gray-*`) — every gray shade
  used MUST exist in `app/globals.css @theme` (Tailwind v4). Adding a new shade → define it there
  first (silent "invalid class renders nothing" bug otherwise — see U1).
- Dark mode: every surface/text/border needs a `dark:` counterpart.

## 3. Mobile-first (RULE #0.2)
- Design mobile first; desktop is the enhancement. Every table/grid that can be dense MUST have a
  `md:hidden` mobile card view (see `CollectionTable`, `VariantMobileCard`, inventory cards).
- Never ship a `hidden md:block`-only editor with no mobile equivalent (G1 regression).
- Touch targets ≥44px; inputs `min-h-[40px]` on mobile.

## 4. States (every list/data view)
Provide all four: **loading** (skeleton), **empty** (`EmptyState`), **error**, **populated**.
Never render a bare blank div while loading.

## 5. Consistency / anti-drift (RULE SSOT1)
- A control/option-list/setting that appears in 2+ screens MUST share ONE component + ONE
  source of option lists/defaults. Examples already centralised:
  - `lib/constants/productCardOptions.ts` — aspect ratios, hover styles, title limits, swatch scales.
  - `lib/constants/headerAnnouncementFields.ts` + `components/admin/shared/HeaderAnnouncementFields.tsx` — header/top-bar/announcement.
  - `components/admin/shared/reporting-widgets/*` — dashboard/reporting chart, top-products, status breakdown.
- Before adding a new settings field UI, grep for the `store_settings` column — if another screen
  edits it, reuse the shared component, don't re-implement.

## 6. Admin layout (Shopify-style)
- Clear hierarchy: page header → cards/panels → grouped fields.
- Consistent primary/secondary action placement (primary right-aligned on desktop).
- No orphaned/dead UI: a control that renders must actually persist and reflect on the storefront
  (no "saves but does nothing"). Remove or wire — never leave fake controls (CU2/CU4/DEAD* rules).

## 7. Forms & persistence
- Every field shown in a tab must persist through that tab's save path.
- WhatsApp phone fields are sanitised at the write boundary (`updateSettings`) — UIs just capture raw input.
- Multi-table writes must be atomic (RULE D15): snapshot + rollback on failure.

## 8. Media handling & pickers (RULE MEDIA1 — established Pass 3)
- The ONLY media library/picker is `MediaManager` + `MediaSelectorModal`. Never build a second
  picker; never enter media via a raw URL `<input>`/`<textarea>` in a settings panel.
- The media modal must reset ALL dispatch state (`mediaSelectCallback` AND `mediaUploadTarget`) on
  close — a picker opened and dismissed without a selection must never leak stale state into the
  next picker (root cause of the fixed "banner video selector lands on wrong section" bug).
- Uploads go through `/api/media/upload` (bucket `product-images`); videos skip Sharp conversion.
- Video sections layer a responsive preset `<img>` under the `<video>` as poster/fallback and
  crossfade on `onLoadedData/onCanPlay/onPlaying`. Do not regress to a static single-size poster.
- Effects that migrate/seed section `content_data` must depend on PRIMITIVES (ids, counts), never on
  the unstable `content_data`/`slides` object refs, to avoid per-render churn.
- Planned single shared components (do not duplicate): `MediaField` (input+preview+Select),
    `MediaCardListEditor` (add/remove/reorder media cards — Hero/Category/Collections/Social/Brands),
    `ImageCarousel` (thumbnails+arrows+dots — product gallery/quick-view/hero). See
    `docs/AUDIT_PASS3_CUSTOMIZER.md`.

## 9. Popups / modals / bottom-sheets / overlays — scroll standard (RULE: UI-POPUP-SCROLL)
Every popup, modal, bottom-sheet, and overlay in this app MUST have a properly scrollable inner
content container, independent of the background page, that works reliably on every load — no
exceptions. The scrollable region must:
- **(a)** use the correct overflow property on the correct INNER element, never the outer overlay
  wrapper. In a `flex flex-col` panel the scroll child MUST also carry `min-h-0` — a flex child
  defaults to `min-height:auto` and refuses to shrink below its content, which silently kills
  `overflow-y-auto` (this was the confirmed root cause of the Quick View "sometimes scrolls,
  sometimes doesn't" bug). Pattern: panel = `flex flex-col max-h-[92dvh]`, scroll body =
  `flex-1 min-h-0 overflow-y-auto overscroll-contain`.
- **(b)** never conflict with any drag-handle, swipe-gesture, or carousel touch handling inside it
  — vertical content scroll takes priority unless the touch started specifically on a horizontal
  swipe/carousel element (e.g. the Embla gallery track uses `touch-pan-y` so vertical scroll passes
  through).
- **(c)** lock background page scroll while open and restore it (and the exact scroll position) on
  close. Use the ONE shared hook `lib/hooks/useBodyScrollLock.ts` — never hand-roll
  `document.body.style.overflow = 'hidden'` per-modal (that alone does not stop iOS background
  scroll and loses scroll position). The hook is ref-counted so stacked overlays behave correctly.
- **(d)** be verified on both SHORT content (few options) and LONG content (many
  variants/description) before being considered done.

All popups/modals/overlays must use the same shared scroll-container + `useBodyScrollLock`
implementation — no per-popup custom scroll logic (RULE SSOT1). This explicitly INCLUDES side
drawers and the mobile navigation menu / search overlay (any full-height slide-in panel whose inner
list can exceed the viewport). Reference implementations: `components/store/QuickViewModal.tsx`,
`components/common/store-navbar/NavbarMobileDrawer.tsx` (+ `useNavbarState.ts` for the lock),
`components/store/ShopPage.tsx` mobile filter drawer. Migrate any existing overlay to this pattern
when touched.

## 10. Product Card interactive overlays — interaction trigger (RULE: UI-CARD-INTERACTION)
Product Card interactive overlays (wishlist, quick-view, add-to-cart icons) and the second-image
hover effect are revealed by genuine interaction, Shopify-style:
- On **hover-capable pointer devices** (`@media (hover: hover) and (pointer: fine)`), reveal on real
  `:hover`/`:focus` (pure CSS).
- On **touch devices**, exactly **one** card at a time holds `.is-in-focus`/`.active-card` — the card
  nearest the mobile reading band (weighted-Euclidean proximity to `innerHeight * 0.45`, `targetX =
  lastTouchX`, 18% hysteresis lock). That focused card plays its hover image AND spawns the action
  icons. This is driven by the ONE shared coordinator `lib/hooks/useMobileCardFocus.ts`
  (`MobileCardFocusManager`, a rAF-coalesced IntersectionObserver singleton). Do not hand-roll a
  second scroll/focus mechanism (RULE SSOT1).
- Navigation is Shopify-style single-tap: a transparent full-card overlay `Link` at `z-[1]` means a
  tap anywhere on the tile (including the image after it is focused) navigates DIRECTLY to the product;
  the title is its own `Link` at `z-[2]`; action icons at `z-[25]` win over the overlay so their taps
  fire their own action and never navigate.
- A direct touch on a card also locks focus onto it for 750ms so scroll inertia doesn't dismiss it.

This applies to the single shared Product Card component used everywhere (home, shop, category,
collections, search results) — no per-grid exceptions (RULE SSOT1). The admin customizer preview
toggles `.is-in-focus`/`.active-card` explicitly to SIMULATE the focus state — a deliberate control,
allowed.

## 9. Price display order (RULE PRICE1 — established, price-order bug fix)
- Discounted price order is **fixed app-wide: SALE price FIRST (prominent), then the STRIKETHROUGH original price SECOND.** Never the reverse, anywhere (shop/home/category/collections/search grid cards, product detail, quick view, wishlist, cart lines, order summaries, customizer preview).
- Standard convention: lead with what the customer actually pays.
- Verified consistent across `StandardProductCard`, `ProductCardShowcaseContent` (was reversed — fixed), `ShopProductListCard`, `QuickViewModal`, product detail. If a new price display is added, follow this order (ideally extract a shared `PriceDisplay` so it can't drift again).

## 11. Admin Action & Save Bar Sticky Standard (RULE DS6)
All save/cancel action bars across the Admin Console must be sticky at the bottom on both mobile and desktop:
- Class: `sticky bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#16162a]/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 px-3 sm:px-6 py-2.5 sm:py-3.5 shadow-2xl rounded-t-2xl transition-all`
- All forms/tables must have `pb-28 sm:pb-20` so the last inputs or table rows can always be scrolled cleanly above the sticky bar.
- Never place save buttons as static elements at the end of long forms/sidebars.
- Modal forms must use sticky footers (`shrink-0 border-t bg-gray-50 dark:bg-[#11111e] p-6 pt-4`) outside the scroll body.
- See full rule: `docs/agent-rules/14-design-system.md` RULE DS6.

## 12. Product Card Standards & Core Themes (RULE BASE-CARDS & RULE DS2)
- **Base Store Themes (Protected — NEVER TOUCH)**: The 5 original foundation themes (`style1`, `showcase_1`, `showcase_8`, `showcase_11`, `showcase_13`) mapped as Base Card 01 to 05 are the core foundation of this e-store and must NEVER be altered, stripped down, or broken.
- **Elessi Theme (10 Styles)**: Implements 10 distinct layouts (`card_01` through `card_10`) with full spatial differentiation.
- **Ella Theme (8 Styles)**: Implements 8 distinct layouts (`card_ella_01` through `card_ella_08`) via the shared `components/product-cards/` module. Follow the same protected base-card, swatch SSOT, unified action rail, and zero-dummy-data rules.
- **Strict Ban on Compare Arrow Icon `[ 🔄 ]`**: No comparison feature exists in this e-store. `CardCompareIcon` is strictly banned and removed.
- **Unified Action Rail (Wishlist Synchronized Spawning)**: Wishlist button must NOT be isolated sticky in the top-right corner. It must sit inside the action rail or row with Quick View and Cart, and spawn together on hover or mobile focus.
- **1000% Reactive Swatches & Zero Dummy Data**: Swatches must render via `finalRenderedGroups` from `ProductCardSwatches.tsx`. Never hardcode dummy sizes `['L', 'M', 'S']` or fake color dots. Size pills only render when enabled in settings AND present on real product variants.
- Zero CPU blur (`backdrop-blur` banned), hardware-accelerated CSS transforms for 60fps scrolling.
- See full specification in `docs/UI_CARDS.md` and `docs/agent-rules/14-design-system.md` RULE DS2 & RULE BASE-CARDS.

## 13. Card Collision Prevention, Grid Baseline & Icon Presets (RULE DS13)
- **Collision-Free Geometry**: Badges strictly anchored top-left (`top: 8px; left: 8px; z-10; max-w-[calc(100%-46px)]`), action buttons strictly anchored in their designated rail/row at `z-25`. No CSS position overrides (`position: relative` banned on action buttons).
- **Grid Baseline Alignment**: Card body flex layout must use `flex flex-col flex-1 justify-between` and button wrappers must have `mt-auto w-full` so adjacent cards always align horizontally across the grid row.
- **Single-Line Button Typography**: Buttons must use `whitespace-nowrap truncate` to prevent word-splitting onto two lines on mobile.
- **5 Icon Style Presets**: Support 5 visual presets (`pill`, `minimal`, `luxe`, `brutalist`, `glass`) with distinct matching SVG glyphs.
- **Multi-Aspect Ratio Standard**: Universal support for `3:4` portrait, `1:1` square, `4:3` landscape, `16:9` wide, and `auto` natural height without hardcoded height or aspect overrides.
- See full rule: `docs/agent-rules/14-design-system.md` RULE DS13 and `docs/UI_CARDS.md`.

## 14. Single Variation Swatches Instance & Zero Duplication (RULE SWATCH-DEDUPLICATION)
- **Zero Duplicate Swatches**: Under NO circumstances may any product card render duplicate or double sets of variation swatches (e.g., rendering swatches inside an in-card drawer or quick-shop sheet AND simultaneously rendering swatches below the product price/title in the card footer).
- **Canonical In-Drawer Placement**: For styles featuring an interactive in-card drawer or quick-shop sheet (such as Elessi Style 10 `card_10` / `sc_style10`), the single canonical instance of swatches (`finalRenderedGroups` from `ProductCardSwatches.tsx`) must be placed directly INSIDE the interactive sheet/drawer where the customer makes their selection. It must NEVER be duplicated in the card body below the price.
- **Canvas Containment & Alignment**: The drawer, sheet, and swatches must remain cleanly aligned and contained within the card canvas boundaries (`inset-x-2 bottom-2` or designated container) without horizontal overflow, clipping, or modal jitter.
- **Universal Customizer Wiring**: Swatches rendered inside drawers/sheets must remain 1000% reactive to all merchant customizer controls: image swatches, color hex swatches, swatch shapes (`swatch_shape`), sizes (`archive_swatch_size`), swatch limits (`swatch_limit` with `+N` counter), and instant active image switching upon variant selection.
- See full rule: `docs/agent-rules/14-design-system.md` RULE DS14 and `docs/UI_CARDS.md`.

## 15. Real Variant Swatches Standard — 100% Admin Fidelity (RULE REAL-PRODUCT-SWATCHES)
- **100% Match with Admin Product Configuration**: Product card swatches must reflect the real colors and images configured by the merchant on the Admin Product Edit page (`VariantAxisCard.tsx` / `VariantTableRow.tsx`).
- **Dynamic Color Hex & Multi-Color**: Custom hexes and multi-color gradients render via `getSwatchStyle(color_hex)`. Named colors without manual hex are dynamically resolved using `extractColorsFromName(color)` from `lib/utils/swatch.ts`. Never render arbitrary fallback colors (such as dark blue `#2b3f56`) or blank transparent circles.
- **Real Variant Image Swatches**: When a variant has a linked image URL and `show_image_swatch === true` (or settings specify image swatches, or image is present without a custom color hex), the card swatch MUST render the real variant thumbnail via `getPresetImageUrl(image_url, 'card')` with `object-cover`.
- **Richest Variant Attribute Merge**: Reducers that group variants by color must merge attributes across all rows of that color so real images or custom hexes are never lost across sparse variant rows.
- See full rule: `docs/agent-rules/14-design-system.md` RULE DS15 and `docs/UI_CARDS.md`.

## 16. Universal Customizer Controls Enforcement Standard (RULE CARD-ALL-CONTROLS)
- **Title Line Limit**: Must strictly honor `settings.title_line_limit` via `getSharedTitleClampClass` (`line-clamp-1`, `line-clamp-2`, `line-clamp-none`). Hardcoded `truncate` on `card-title` is strictly banned.
- **Card & Body Alignment**: Dynamically applies `settings.card_alignment` (`items-start text-left`, `items-center text-center`, `items-end text-right`).
- **All Visibility Toggles**: Star ratings (`card_show_stars`), description (`card_show_description`), action buttons (`card_show_wishlist`, `card_show_quickview`, `card_show_quickcart`), badges (`card_show_badge`, `show_sale_badge`), and swatches (`enable_variant_swatches`, slot toggles, limit, shape, size, alignment) must be 100% functional and reactive across all card styles.
- See full rule: `docs/agent-rules/14-design-system.md` RULE DS16 and `docs/UI_CARDS.md`.

## 17. Universal Swatch Interaction Image Swap Standard (RULE SWATCH-CLICK-IMAGE-SWAP & RULE DS17)
- **Instant Swap on Hover & Click**: On EVERY product card across all themes (Base, Elessi, Ella, Showcases), hovering over or clicking any variant swatch (color, size, material, custom) MUST instantly swap the main product image to the variant's linked image (`v.image_url`).
- **Secondary Image Fade Override Protection**: When a variant is active/selected or hovered, generic catalog second image hover (`.hover-fade-in` / `.i2`) is blocked (`!isVariantSelected && !hoveredImage`) so it never covers the user's variant image.
- **SSOT Image Precedence**: All card archetypes must prioritize parent-provided `activeImage` / `p.image`. Never hardcode `p.swatches[0]?.image` over `p.image`.
- See full rule: `docs/agent-rules/14-design-system.md` RULE DS17 and `docs/UI_CARDS.md` Section 11.

## 18. Footer Social Icons & Grid View All Visibility Standard (RULE SOCIAL-VIEWALL-CONTRAST & RULE DS19)
- **Footer Social Hover Contrast**: Every social link in `FooterSocialLinks.tsx` has branded hover background colors (`#1877F2` for Facebook, `#E1306C` for Instagram, `#25D366` for WhatsApp, `#FF0000` for YouTube, `#000000` for TikTok/Twitter, `#FFFC00` for Snapchat) with guaranteed high-contrast icon color (`#ffffff` / `#000000`), smooth lift, and dark mode compatibility. Resting icon color defaults to visible slate (`#334155`).
## 19. Universal Cart & Wishlist Drop/Fly Animation Standard (RULE DS23 & RULE FLY-ANIMATION-UNIVERSAL)
- **SSOT Animation Engine**: All Add-to-Cart and Wishlist triggers across all devices (mobile, tablet, desktop) and tabs (catalog, shop, homepage, related products, product detail, quickview) MUST use the shared engine in `lib/utils/flyAnimation.ts` (`flyToCart` / `flyToWishlist`).
- **Device-Aware Speed & Trajectory**:
  - **Desktop / Laptop / Tablet**: Trajectory travels to header icons in **840ms–950ms** via a smooth parabolic arc (`cubic-bezier(0.04, 0.72, 0.32, 1.1)`) so customers can clearly see the article image gliding across the screen.
  - **Mobile Native App View**: Drops into the sticky bottom navigation bar (`mobile-bottom-cart-icon` or `mobile-bottom-wishlist-icon`) in **720ms** with natural gravity acceleration (`cubic-bezier(0.42, 0, 0.28, 1)`).
- **Celebratory Target Bucket & Badge Pop**:
  - Upon landing, the target bucket element AND its live count badge pill (`span`) MUST trigger `.bucket-animate` (`@keyframes bucket-bounce` + `@keyframes badge-pop`), producing an elastic 1.3x scale bounce.
- **Fail-Safe Source & Target Resolution**:
  - Every card root element (`.pc`, `.z-card-container`, `article`) MUST set `id={`product-card-${product.id}`}` and `data-product-id={product.id}`.
  - If event target is unmounted or missing, the engine automatically resolves the card element or thumbnail, guaranteeing zero failures and zero console errors.





