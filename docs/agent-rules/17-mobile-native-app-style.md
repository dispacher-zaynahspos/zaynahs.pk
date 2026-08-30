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
