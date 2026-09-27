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
Product Card interactive overlays (wishlist, quick-view, add-to-cart icons) must only be triggered
by genuine user interaction:
- On **hover-capable pointer devices only** (`@media (hover: hover) and (pointer: fine)`), reveal on
  real `:hover`/`:focus`.
- On **touch devices**, the icons are ALWAYS visible (deliberate, touch-friendly) and a tap on the
  card tile navigates DIRECTLY to the product page — there is no "tap-to-focus / reveal" intermediate
  state.
- Scroll position, viewport visibility, or IntersectionObserver state must NEVER drive this UI. Any
  scroll/proximity-based "focus" mechanism is forbidden here (the removed
  `useMobileCardFocus`/`MobileCardFocusManager` was the confirmed root cause of icons appearing on
  cards while merely scrolling past them — do not reintroduce it).

This applies to the single shared Product Card component used everywhere (home, shop, category,
collections, search results, customizer preview) — no per-grid exceptions (RULE SSOT1). The admin
customizer preview may still toggle `.is-in-focus`/`.active-card` explicitly to SIMULATE a hover
state — that is a deliberate control, not scroll-driven, and is allowed.

## 9. Price display order (RULE PRICE1 — established, price-order bug fix)
- Discounted price order is **fixed app-wide: SALE price FIRST (prominent), then the STRIKETHROUGH original price SECOND.** Never the reverse, anywhere (shop/home/category/collections/search grid cards, product detail, quick view, wishlist, cart lines, order summaries, customizer preview).
- Standard convention: lead with what the customer actually pays.
- Verified consistent across `StandardProductCard`, `ProductCardShowcaseContent` (was reversed — fixed), `ShopProductListCard`, `QuickViewModal`, product detail. If a new price display is added, follow this order (ideally extract a shared `PriceDisplay` so it can't drift again).
