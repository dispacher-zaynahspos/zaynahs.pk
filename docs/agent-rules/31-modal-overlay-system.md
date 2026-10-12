# 31 — RULE MODAL1: One Shared Modal / Overlay System (MANDATORY)

> Hard architectural rule (RULE SSOT1 applied to overlays). Every popup, modal, dialog,
> bottom-sheet, drawer, lightbox, and filter sheet in the storefront renders through the
> ONE shared `components/common/Modal.tsx`. No per-popup overlay/scroll/focus logic.

## The rule
- All storefront overlays use `components/common/Modal.tsx` (portal + focus trap + ESC +
  overlay-click close + shared `useBodyScrollLock` + inner-scroll pattern). Never hand-roll a
  `fixed inset-0 bg-black/..` overlay, a per-modal `createPortal`, or a per-modal scroll lock.
- The shared Modal already implements UI_RULES §9 (panel `flex flex-col max-h-[92dvh]`, body
  `flex-1 min-h-0 overflow-y-auto overscroll-contain`) — the inner content scrolls, the page
  behind never does.
- Z-index: use the shared `--z-modal` layer (`z-[1000]` default) so modals sit above the
  header, floating WhatsApp/dev badge, toasts, and sticky bars. Never invent ad-hoc
  `z-[150]`/`z-[200]` values.

## Open/close motion (MANDATORY — one SSOT, every popup inherits it)
- The shared Modal owns ALL enter/exit animation. It stays mounted through its exit so the
  panel animates OUT (back to where it came from) instead of vanishing — the "smooth ghaib"
  feel. Nothing per-popup: no `animate-fade-in`, no `scale-up`, no `animate-in slide-in-*`
  utilities on individual popups.
- Motion is GPU-only (`transform` + `opacity`, `willChange`) so there is ZERO layout/paint
  cost — it must always feel faster/lighter, never add load. Timing is a single SSOT at the
  top of `Modal.tsx` (`ENTER_MS` / `EXIT_MS`): quick ease-out open, slightly faster ease-in
  close. Change timing there and all 46 popups follow.
- Per-variant hidden transform: `center`/`lightbox` = subtle `scale(0.96)` zoom, `sheet` =
  `translateY(100%)` (slides up from the bottom on mobile), `drawer-left`/`drawer-right` =
  `translateX(∓100%)` slide from the edge. The backdrop fades `opacity` in/out in lockstep.
- Reduced-motion: when the OS sets `prefers-reduced-motion: reduce`, the Modal drops the
  transform and uses a short plain opacity fade — calm + instant for motion-sensitive users.
- A popup that must delay the real unmount (e.g. plays its own fly-to-cart first) keeps an
  internal `open` state, flips it to `false`, and calls the parent `onClose` after the exit
  (~180ms). It must NOT re-add a bespoke overlay. See `QuickViewModal.tsx` for the pattern.
- Bespoke-visual popups (exit-intent, spin-wheel, size-guide) keep their custom card by
  passing it as the Modal child and making the panel chrome transparent
  (`className="!bg-transparent !border-0 !shadow-none !rounded-none !overflow-visible"`), but
  they STILL route through the shared Modal for motion + scroll-lock + overlay-close.

## Variants (one component, prop-driven)
- `center` — centered dialog on all screens.
- `sheet` — bottom sheet on mobile (drag handle, rounded top, `items-end`), centered dialog on
  `sm+`. Use for Quick View / Quick Buy, filter sheets, write-review form.
- `drawer-left` / `drawer-right` — full-height slide-in side panel (mobile nav, filters).
- `lightbox` — dark edge-to-edge media viewer (gallery zoom, review media), `object-contain`,
  floating close, next/prev + swipe/keyboard.

## Sizing by breakpoint (built into the `size` prop)
- Mobile `<768`: bottom sheet / drawer, full width, `max-h-[92dvh]`, safe-area aware.
- Tablet `768–1023`: centered ~90vw, `max-h-[90dvh]`.
- Laptop `1024–1439`: `size="xl"` → ~`min(1000px,90vw)`.
- Big `1440+`: `size="xl"` → up to 1200px; `1920+` up to ~1320px.
- Sticky footer (`footer` prop) is always visible with safe-area padding; primary actions
  (Add to Cart / Buy Now / Apply) never clip.

## Required behaviors
- `role="dialog"` + `aria-modal`, focus moves into the panel on open and restores to the
  opener on close, Tab is trapped, ESC closes (toggleable).
- No hydration mismatch: never read `window` size during first render — the Modal is portal +
  mounted-gated.
- Keyboard open on mobile must not hide footer buttons; resize/orientation reflows.

## Migrated overlays (reference)
QuickViewModal, PDP gallery lightbox (`ProductLightboxModal`), review media zoom
(`ReviewImageZoomModal`), shop filters sheet (`ShopPage`), size-guide/share
(`ProductDetailModals`), search (`NavbarSearchModal`), mobile nav drawer
(`NavbarMobileDrawer`), write-review form. Premium popups (exit-intent, spin-wheel) may keep
their bespoke visuals but MUST still use `useBodyScrollLock` + `--z-modal` + overlay-close.

## Cross-reference
- Scroll standard: `docs/UI_RULES.md` §9 (UI-POPUP-SCROLL). This rule is the component-level
  SSOT that enforces §9. Shared pieces: `lib/hooks/useBodyScrollLock.ts`,
  `components/common/Portal.tsx`.
