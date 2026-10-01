# Scroll Restoration System — Complete Implementation Guide

> Reusable guide for implementing smooth back-navigation scroll restoration in any Next.js App Router project. Prevents banner/footer flash, restores exact product card position, and handles lazy-loaded content.

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Architecture Overview](#architecture-overview)
3. [Files & Components](#files--components)
4. [How It Works](#how-it-works)
5. [Implementation Steps](#implementation-steps)
6. [Common Pitfalls & Solutions](#common-pitfalls--solutions)
7. [Checklist](#checklist)

---

## Problem Statement

In Next.js App Router SPAs, pressing **Back** after viewing a product detail page causes:
1. **Banner flash** — page loads at `scrollTop: 0` (top/banner area)
2. **Footer jump** — scroll restoration falls back to wrong position
3. **Lost pagination** — "Load More" state resets, removing the target product from DOM
4. **Racing loops** — multiple components calling restoration independently

### Goal
Back navigation should **smoothly land on the exact product card** the user clicked from — no banner flash, no footer jump, no jitter.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                 ScrollRestorer                   │
│          (mounted in store layout)               │
│     SINGLE SOURCE OF TRUTH for all scroll        │
│              restoration logic                   │
├─────────────────────────────────────────────────┤
│                                                  │
│  saveScrollPosition(productId)                   │
│  ├── Called by ProductCard on click               │
│  ├── Saves: { scrollY, productId, path }          │
│  └── Stored in: sessionStorage['store_scroll_restore'] │
│                                                  │
│  ScrollRestorer (useEffect on route change)       │
│  ├── Card Restore: find #product-card-{id}        │
│  │   ├── MutationObserver watches DOM             │
│  │   ├── rAF polling as fallback                  │
│  │   ├── Overlay cloak prevents visual flash      │
│  │   └── scrollIntoView({ block: 'center' })      │
│  ├── ScrollY Restore: generic back nav            │
│  └── Fresh Nav: scrollTo(0)                       │
│                                                  │
│  Load More Persistence (sessionStorage)           │
│  └── Ensures products survive back navigation     │
└─────────────────────────────────────────────────┘
```

---

## Files & Components

### 1. `lib/hooks/useScrollRestoration.ts` — Data Store
```typescript
// Constants & types
export const SCROLL_KEY = 'store_scroll_restore';
export interface ScrollRestoreData {
  scrollY: number;
  productId: string;
  path: string;
  timestamp: number;
}

// Path comparison (handles query params, trailing slashes)
export function isSameStorePath(savedPath: string, currentPath: string): boolean

// Called by product cards before navigation
export const saveScrollPosition = (productId: string) => void

// No-op hook for backward compat (all logic in ScrollRestorer)
export const useScrollRestoration = () => {}
```

### 2. `components/store/ScrollRestorer.tsx` — Restoration Engine
- Mounted ONCE in the store layout (`app/(store)/layout.tsx`)
- Takes manual control: `history.scrollRestoration = 'manual'`
- Tracks `popstate` events to distinguish back/forward from fresh nav
- Three restoration paths:
  - **Card restore**: find product card by ID → `scrollIntoView({ block: 'center' })`
  - **ScrollY restore**: generic position-based (for pages without card data)
  - **Fresh nav**: `scrollTo(0)`

### 3. Product Cards — ID & Save
Every product card MUST have:
```tsx
<div id={`product-card-${product.id}`}>
```
And navigation handlers MUST call:
```tsx
onClick={() => saveScrollPosition(product.id)}
```

### 4. Load More Persistence
Any "Load More" state that affects which products are in the DOM must be persisted in `sessionStorage`:
```typescript
const LOAD_MORE_KEY = 'storefront_load_more_limits';

const [loadMoreLimits, setLoadMoreLimits] = useState<Record<string, number>>(() => {
  if (typeof window === 'undefined') return {};
  try {
    const saved = sessionStorage.getItem(LOAD_MORE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return {};
});

useEffect(() => {
  try {
    if (Object.keys(loadMoreLimits).length > 0) {
      sessionStorage.setItem(LOAD_MORE_KEY, JSON.stringify(loadMoreLimits));
    }
  } catch {}
}, [loadMoreLimits]);
```

---

## How It Works

### Forward Navigation (User clicks product)
1. `saveScrollPosition(product.id)` saves `{ scrollY, productId, path }` to `sessionStorage`
2. User navigates to `/product/slug`
3. ScrollRestorer fires → path doesn't match saved path → `scrollTo(0)` ✓

### Back Navigation (User presses back)
1. `popstate` fires → `isPopRef.current = true`
2. Next.js navigates back to listing page
3. ScrollRestorer effect fires (key changed)
4. Checks `SCROLL_KEY` → finds saved data → path matches!
5. **Visual Cloak**: overlay div covers screen (prevents banner/footer flash)
6. **Load More Restore**: `loadMoreLimits` restored from sessionStorage → all products render
7. **Card Search**: MutationObserver + rAF poll for `#product-card-{id}`
8. **Card Found**: `scrollIntoView({ block: 'center' })` → overlay fades out (120ms)
9. User sees the card centered — never saw the banner or footer ✅

### User Interruption
Any `wheel`, `touchmove`, or `touchstart` event during restoration:
- Immediately cancels the restore
- Removes the overlay
- User takes manual control

---

## Implementation Steps

### Step 1: Create Data Store
Create `lib/hooks/useScrollRestoration.ts`:
- Export `SCROLL_KEY`, `ScrollRestoreData` interface
- Export `saveScrollPosition(productId)` function
- Export `isSameStorePath(a, b)` for path comparison
- Export `useScrollRestoration()` as no-op (backward compat)

### Step 2: Create ScrollRestorer Component
Create `components/store/ScrollRestorer.tsx`:
- Use `usePathname()` + `useSearchParams()` for route key
- `history.scrollRestoration = 'manual'`
- Track `popstate` with `isPopRef`
- `activeRestoreRef` for exactly-one-restore-at-a-time
- Continuously save scroll position per URL key
- Main effect: check card data → popstate fallback → fresh nav

### Step 3: Mount in Layout
```tsx
// app/(store)/layout.tsx
import ScrollRestorer from '@/components/store/ScrollRestorer';

export default function StoreLayout({ children }) {
  return (
    <>
      <ScrollRestorer />
      {children}
    </>
  );
}
```

### Step 4: Add IDs to Product Cards
```tsx
<div id={`product-card-${product.id}`}>
  {/* card content */}
</div>
```

### Step 5: Save Position on Card Click
```tsx
import { saveScrollPosition } from '@/lib/hooks/useScrollRestoration';

const handleCardClick = () => {
  saveScrollPosition(product.id);
};

// On the full-card link:
<Link href={productUrl} onClick={handleCardClick} />
```

### Step 6: Persist Load More State
Any component with "Load More" that adds products client-side:
- Initialize state from sessionStorage
- Save state to sessionStorage on every change

---

## Common Pitfalls & Solutions

### ❌ Pitfall 1: Multiple restoration hooks
**Problem**: `useScrollRestoration()` called in `ShopPage`, `StoreFront`, etc. creates competing rAF loops.
**Solution**: Single ScrollRestorer in layout. Make `useScrollRestoration()` a no-op.

### ❌ Pitfall 2: `opacity: 0` on documentElement
**Problem**: Setting `opacity: 0` on `<html>` prevents browser lazy loading (`loading="lazy"`) from triggering.
**Solution**: Use a temporary overlay `<div>` with `position: fixed; z-index: 99999` that covers the screen but lets images load normally behind it.

### ❌ Pitfall 3: Early scrollY fallback
**Problem**: Falling back to raw `scrollY` after ~1 second when the card hasn't been found yet. If the page is shorter than saved scrollY (products haven't rendered), it clamps to footer.
**Solution**: When `productId` is available, NEVER fall back to scrollY early. Wait up to 5 seconds for the card, with scrollY only as absolute final fallback.

### ❌ Pitfall 4: Load More state lost on back nav
**Problem**: `useState({})` resets on component remount. Products from "Load More" batches disappear, card ID is not in DOM.
**Solution**: Persist `loadMoreLimits` in `sessionStorage`. Restore on mount.

### ❌ Pitfall 5: URL-based vs client-side pagination
**Problem**: Shop page uses `?page=X` (survives back nav), but homepage uses client-side state (lost on remount).
**Solution**: Ensure ALL pagination that affects product visibility is either URL-based or sessionStorage-persisted.

### ❌ Pitfall 6: `cancelActiveRestore` missing
**Problem**: Starting a new restoration without canceling the old one → two rAF loops fight.
**Solution**: `activeRestoreRef` tracks the current restore. `cancelActiveRestore()` runs at the top of every route change effect.

---

## Checklist

Before considering scroll restoration complete, verify:

- [ ] `ScrollRestorer` mounted ONCE in store layout
- [ ] No other component calls `restoreProductCardOrScroll()` directly
- [ ] `useScrollRestoration()` is a no-op (or removed)
- [ ] Every product card has `id={`product-card-${product.id}`}`
- [ ] Every card link calls `saveScrollPosition(product.id)` on click
- [ ] "Load More" state persisted in sessionStorage
- [ ] Visual cloak uses overlay div (NOT opacity on html/body)
- [ ] `history.scrollRestoration = 'manual'` set
- [ ] User interruption (wheel/touch) cancels restore + reveals page
- [ ] Hard timeout safety net (6s) prevents infinite loops
- [ ] `isSameStorePath` handles query params, trailing slashes
- [ ] Stale data cleanup (> 30 mins → remove from storage)
- [ ] Production build passes (`npm run build`)
- [ ] Test: homepage → load more → click product → back → lands on card ✓
- [ ] Test: shop?page=10 → click product → back → lands on card ✓
- [ ] Test: images load normally on product page (no lazy loading break)

---

## CSS (Optional Enhancement)

```css
/* Subtle highlight on restored card */
.scroll-restore-highlight {
  outline: 2px solid rgba(233, 69, 96, 0.4);
  outline-offset: 4px;
  border-radius: 16px;
  transition: outline-color 1.6s ease-out;
}
```
