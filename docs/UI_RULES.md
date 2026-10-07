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

## 12. Product Card Multi-Archetype Standard (RULE DS12)
- Distinct layouts across brand templates (Zara slide-drawer, Daraz deal-rush direct button, Nike corner FAB, Amazon split dual-action, Sephora center-hover pill).
- Every card must support all image aspect ratios (3:4, 1:1, auto) and both `cover` & `contain` modes.
- Zero CPU blur (`backdrop-blur` banned), hardware-accelerated CSS transforms for 60fps scrolling.
- See full specification in `docs/UI_CARDS.md` and `docs/agent-rules/14-design-system.md` RULE DS12.

