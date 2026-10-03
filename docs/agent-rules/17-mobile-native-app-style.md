# 17 — Mobile Card / Native App Style Rules

## Visual style (modern native-app feel)
- Rounded corners: consistent scale `rounded-xl`/`rounded-2xl` — sharp corners banned.
- Soft, elevation-based shadows — not harsh borders (`shadow-sm`/`shadow-md` scale).
- Card padding: `p-4` mobile, `p-5`/`p-6` desktop — no hardcoded values.
- Bottom sheet / drawer pattern for mobile actions (not full modal on small screens).
- Sticky bottom nav / action bar on mobile (cart, checkout, save).
- Pull-to-refresh where relevant (order list, product list).
- Micro-interactions: tap scale (`active:scale-95`), smooth transitions (150–200ms).

## Card component rules
- One `BaseCard` component — `ProductCard`, `OrderCard`, `StatCard` all extend it.
- Consistent card anatomy: image/icon top → title → meta/subtext → action row bottom.
- Swipe actions on mobile cards (edit/delete) — same gesture pattern everywhere.

## Responsive rules
- Mobile-first build: design mobile layout first, then add `sm:`/`md:`/`lg:` breakpoints.
- Grid: mobile = 1–2 col, tablet = 2–3 col, desktop = 3–4 col — consistent across store/admin.
- Touch targets minimum 44px height (buttons, icons, chips).
- Responsive font scale (`text-sm` mobile → `text-base` desktop) via a single typography scale, never per-page overrides.

## Anti-patterns
- ❌ Different card style on store vs. admin without reason.
- ❌ Desktop-first design squeezed onto mobile.
- ❌ Every page has its own bottom-sheet/modal pattern.
- ❌ Inconsistent corner-radius/shadow across cards.

## RULE M1 — Breakpoints
```
Default (mobile): 375px+
sm: 640px+   ← tablet portrait
md: 768px+   ← tablet landscape
lg: 1024px+  ← desktop
xl: 1280px+  ← wide desktop
```

## RULE M2 — Sticky cart bar
Always visible on mobile when cart has items:
```tsx
<div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
  <CartBar />
</div>
```

## RULE M3 — Touch gestures
- Product images: swipeable gallery (embla-carousel).
- Cart sheet: swipe down to close.
- Category filter: horizontal scroll, no wrap.

## RULE M4 — Touch-first scrollable overlays (v1.0.8)
All overlays, popups, filters, search-suggestion pools, and mobile drawer menus must scroll naturally from the top down:
- `overscroll-contain`, `touch-pan-y` enabled, no nested scroll containers hijacking touch gestures.
- **Scrolling smoothness**: all scrollable modal lists/cards/tables/dropdowns declare `overscroll-contain touch-pan-y` + inline `style={{ WebkitOverflowScrolling: 'touch' }}` for native momentum scrolling on iOS Safari/WebKit.

## RULE M5 — Desktop/mobile jitter prevention
CPU-heavy blur styles (`backdrop-blur-sm`, `backdrop-blur-xs`) on modals/filter overlays are forbidden — only high-contrast solid options (`bg-black/60`). GPU acceleration triggers `will-change-transform` + `transform-gpu` are mandatory on scrollable layers.

## RULE M6 — Single-Card Scroll Focus & Dynamic Proximity Algorithm
On touch/mobile catalog grids, exactly **one** card at a time holds `.is-in-focus` / `.active-card`
— the card nearest the mobile reading band. That focused card plays its hover image (2nd image /
zoom / slide etc.) AND spawns the quick-action icons (wishlist / quick-view / cart). This is the
Shopify-style behavior the store owner requires.

Implementation is the ONE shared coordinator `lib/hooks/useMobileCardFocus.ts`
(`MobileCardFocusManager` — a rAF-coalesced IntersectionObserver singleton). Do not hand-roll a
second scroll/focus mechanism (RULE SSOT1).
- **Dynamic Bounding Box**: read dimensions via `el.getBoundingClientRect()` every eval — never
  hardcode heights. Works with all theme aspect ratios (`square`, `3/4`, natural, compact).
- **Sweet-Spot Distance**: weighted Euclidean distance from card center to the mobile focal target
  (`window.innerHeight * 0.45`, `targetX = lastTouchX`); vertical weight 1.4.
- **18% Hysteresis Lock**: active card keeps focus until a neighbor is >18% closer
  (`effectiveDist = active ? dist * 0.82 : dist`) → no left/right flicker.
- **Direct Tap Override**: tapping a card locks focus for 750ms (`manualLockUntil`) so micro-scroll
  inertia doesn't dismiss it.
- **Action Icons**: hidden by default on touch; spawn on `.active-card` with hardware-accelerated
  `translate3d(0,0,0)`, `will-change: transform, opacity`, staggered delays (see `customCss.tsx`).
- **Navigation (Shopify single-tap)**: transparent full-card overlay `Link` at `z-[1]` → tap anywhere
  on the tile (image included) navigates directly to the product; title `Link` at `z-[2]`; action
  icons at `z-[25]` win over the overlay so their taps fire their own action, never navigate.
- **Desktop** (`@media (hover: hover) and (pointer: fine)`): pure CSS `:hover` drives the same reveal.
- The admin customizer preview toggles `.is-in-focus`/`.active-card` explicitly (deliberate
  simulation, allowed).
- Full guide: `docs/UI_RULES.md` §10 (RULE UI-CARD-INTERACTION) + `lib/hooks/useMobileCardFocus.ts`.

---

## RULE M7 — Scroll Snap-Back Prevention (MANDATORY)
**Problem fixed:** `#admin-main-content` was missing `overscroll-behavior-y: none` — macOS/iOS rubber-band bounce made scroll snap back at page edges, feeling like "koi kheench raha ho."

**Rules:**
1. Every primary scroll container (admin main, store page, drawer) MUST declare `overscroll-y-none` (Tailwind) OR `overscroll-behavior-y: none` (CSS).
2. In `globals.css`, `#admin-main-content` always has `overscroll-behavior-y: none`.
3. For store-side scrollable containers, use `overscroll-contain` (allows parent chain scroll, but no bounce).
4. NEVER use `overscroll-behavior: auto` (browser default) on any primary scroll container.

```tsx
// ✅ Correct — admin main content
<main id="admin-main-content" className="... overflow-y-auto overscroll-y-none">

// ✅ Correct — modal inner scroll
<div className="flex-1 overflow-y-auto overscroll-contain">

// ❌ Wrong — no overscroll rule = rubber-band bounce
<main className="overflow-y-auto">
```

---

## RULE M8 — No Global DOM Scroll Mutation (MANDATORY)
**Problem fixed:** `ReviewDetailSheet` was setting `document.documentElement.style.overscrollBehaviorY = 'contain'` on the `<html>` element. When the component unmounted abnormally (fast route change), the cleanup never ran → scroll stuck globally forever.

**Rules:**
1. **NEVER** mutate `document.documentElement.style.*` for scroll/overflow control in any component.
2. **NEVER** set `document.body.style.overflow = 'auto'` in cleanup — use `''` (empty string) to restore browser default.
3. Use the shared `lib/hooks/useBodyScrollLock.ts` hook for all body scroll locking — it reference-counts locks so they clean up safely.
4. If a component must lock scroll directly (legacy), ALWAYS restore to `''` not `'auto'` in the `useEffect` cleanup.

```ts
// ✅ Correct cleanup
useEffect(() => {
  document.body.style.overflow = 'hidden';
  return () => { document.body.style.overflow = ''; }; // '' = browser default
}, []);

// ❌ Wrong — 'auto' overrides other scroll managers
return () => { document.body.style.overflow = 'auto'; };

// ❌ Never — pollutes the root <html> element globally
document.documentElement.style.overscrollBehaviorY = 'contain';
```

---

## RULE M9 — Admin Sticky Action Bars (MANDATORY)
**Problem fixed:** Action bars (`ProductSaveBar`, `SettingsSaveBar`, `InventorySaveBar`) were floating 200px+ high up on mobile ("kafi upper h", "stil ziada upper h") because parent containers had `pb-36` padding traps, mobile bottom nav was `h-16`, and sticky offset was `bottom-16` / `bottom-4rem` adding double padding.

**Rules:**
1. Mobile bottom nav bar is standard `h-14` (56px = 3.5rem).
2. All admin sticky action bars MUST use:
   `sticky bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] md:bottom-0 left-0 right-0 z-30`
3. **NEVER** add excessive bottom padding (`pb-36`, `pb-24`) to parent `<form>` or page containers — sticky elements are bound to their parent container; large parent padding pushes sticky bars into mid-air!
4. Keep action bar compact: `py-2 sm:py-2.5 px-3 sm:px-6`, sleek buttons `min-h-[36px] sm:min-h-[38px]`, and clean solid background (`bg-white/98 dark:bg-[#16162a]/98 border-t border-gray-200/90 dark:border-gray-800 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] rounded-t-xl`).

```tsx
// ✅ Correct — well-aligned sticky action bar directly above mobile bottom nav
<div className="sticky bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] md:bottom-0 left-0 right-0 z-30 bg-white/98 dark:bg-[#16162a]/98 border-t border-gray-200/90 dark:border-gray-800 px-3 sm:px-6 py-2 sm:py-2.5 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] rounded-t-xl transition-all">
  {/* action bar content */}
</div>

// ❌ Wrong — parent has pb-36 which traps sticky element 144px above the bottom
<form className="space-y-4 pb-36">
  <ProductSaveBar className="sticky bottom-16" />
</form>
```

---

## RULE M10 — backdrop-blur Banned on Scroll-Adjacent Elements (MANDATORY)
**Problem fixed:** `backdrop-blur-xl` on `AdminHeader` and `backdrop-blur-md` on `ProductSaveBar` + `AdminMobileBottomBar` caused the GPU to repaint the ENTIRE page on every scroll pixel → visible flicker, fade-in/out of content, lag.

**Rules:**
1. **NEVER** use `backdrop-blur-*` on any element that is `fixed`, `sticky`, or sits adjacent to a scrollable container.
2. Use **solid backgrounds** instead: `bg-white` / `bg-white/95` (no blur needed when opaque).
3. `backdrop-blur` is ONLY permitted on full-screen modal overlays (`fixed inset-0`) where no scrollable content is behind it.
4. Also banned: `transition-all` and `transition-colors` on form card wrappers — these trigger on every parent re-render during scroll. Use targeted transitions on interactive elements only (`transition-colors` on buttons is fine).
5. `animate-pulse` / `animate-bounce` on elements inside scroll containers = constant GPU animation layers. Move them to isolated absolutely-positioned elements or remove.

```tsx
// ✅ Correct — solid, no blur
<header className="fixed ... bg-white dark:bg-[#0c0c16] border-b border-gray-200">

// ❌ Wrong — full repaint every scroll frame
<header className="fixed ... bg-white/90 backdrop-blur-xl">

// ✅ OK — full screen modal overlay (nothing scrollable behind it)
<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000]">
```

