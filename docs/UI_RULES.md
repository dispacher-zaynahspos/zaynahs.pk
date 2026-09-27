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
