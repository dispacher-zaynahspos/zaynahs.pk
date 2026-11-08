# Fix Plan: Scroll Restore · Per-Page Limit · Title Clip

> **Status:** Fixed in commit `84fdf55` (2026-11-08)  
> Written so any AI model or developer can re-apply or verify these fixes.

---

## Issue 1 — Back Navigation Does NOT Land on Clicked Card

### Root Cause: Race Condition in StoreFront.tsx

```
Mount order:
  1. useState({})                 → loadMoreLimits = {} (only batchStep cards rendered)
  2. useIsomorphicLayoutEffect    → ScrollRestorer fires BEFORE useEffect
                                  → card #product-card-XYZ NOT in DOM yet
                                  → 2s timeout → falls back to wrong scrollY
  3. useEffect                    → NOW restores loadMoreLimits (too late)
```

### Fix: Move restore to useState initializer (synchronous, runs before first render)

**File:** `components/store/StoreFront.tsx`

Change:
```ts
const [loadMoreLimits, setLoadMoreLimits] = useState<Record<string,number>>({});
useEffect(() => { /* restore from sessionStorage */ }, []);
```

To:
```ts
const [loadMoreLimits, setLoadMoreLimits] = useState<Record<string,number>>(() => {
  if (typeof window === 'undefined') return {};
  try {
    const navEntries = performance?.getEntriesByType?.('navigation') as PerformanceNavigationTiming[];
    const isBackForward = navEntries?.[0]?.type === 'back_forward' || window.performance?.navigation?.type === 2;
    const currentPath = window.location.pathname + (window.location.search || '');
    const snap = getNavigationSnapshot(currentPath);
    const hasPendingCard = Boolean(snap?.clickedCardId && isSameStorePath(snap?.path ?? '', currentPath));
    const isNavBack = isBackForward || isPopNavigation() || hasPendingCard;
    if (isNavBack) {
      if (snap?.loadMoreLimits && Object.keys(snap.loadMoreLimits).length > 0) return snap.loadMoreLimits;
      const rawLimits = sessionStorage.getItem(LOAD_MORE_KEY);
      if (rawLimits) { const p = JSON.parse(rawLimits); if (p && typeof p === 'object') return p; }
    } else {
      sessionStorage.removeItem(LOAD_MORE_KEY);
    }
  } catch {}
  return {};
});
```

---

## Issue 2 — Per-Page Limit Shows Too Many Items on Fresh Load

### Root Cause: False-Positive Back-Nav Detection in useShopPageFilters.ts

ScrollRestorer writes `scroll:${pathname}` to sessionStorage on EVERY scroll.
The old code used that key to detect "back navigation" — so EVERY fresh page visit
looked like a back-nav, restoring stale load-more count instead of using PAGE_SIZE.

### Fix: Remove unreliable liveKey check

**File:** `components/store/shop-page/useShopPageFilters.ts`

REMOVE these lines from the useState initializer:
```ts
const rawScroll = sessionStorage.getItem(SCROLL_KEY);  // REMOVE
// ... isSameStorePath check on SCROLL_KEY ...          // REMOVE
const liveKey = `scroll:${window.location.pathname}?${cleanSearch}`;
if (sessionStorage.getItem(liveKey)) isReturnNav = true; // REMOVE — always true!
```

KEEP only reliable signals:
```ts
const isBackForward = navEntries?.[0]?.type === 'back_forward'; // browser-native
const hasPendingCard = Boolean(snap?.clickedCardId && ...);     // user clicked a card
const isPopNav = isPopNavigation();                             // popstate event
```

Add on fresh arrival:
```ts
} else {
  sessionStorage.removeItem(SHOP_LIMIT_KEY); // clear stale count
}
```

**Imports:** Remove `SCROLL_KEY`, `type ScrollRestoreData`. Add `isPopNavigation`.

---

## Issue 3 — Product Card Title Last Line Gets Clipped

### Root Cause A: pb-0.5 inside overflow:hidden

`-webkit-line-clamp` clips at the box boundary. `pb-0.5` was INSIDE the clamped element
so it was invisible. Last-line descenders (g, y, p) were cut off.

**File:** `components/store/product-card/StandardProductCard.tsx`

```tsx
// BEFORE
className={`... leading-tight pb-0.5 ${titleClampClass}`}

// AFTER — remove pb-0.5, use leading-snug (1.375 line height, not 1.25)
className={`... leading-snug ${titleClampClass}`}
```

### Root Cause B: Wrong min-h in getSharedTitleClampClass

**File:** `lib/utils/styles.ts`

```ts
// BEFORE (28px too small for 2 lines at leading-tight)
default: return 'title-clamp-2 line-clamp-2 min-h-[28px] sm:min-h-[32px]';

// AFTER (11px × 1.375 × 2 lines = ~30px)
default: return 'title-clamp-2 line-clamp-2 min-h-[30px] sm:min-h-[33px]';
// 1 line:
case '1': return 'title-clamp-1 line-clamp-1 min-h-[16px] sm:min-h-[18px]';
```

---

## Files Changed

| File | Change |
|------|--------|
| `components/store/StoreFront.tsx` | useState init synchronous (reads sessionStorage inline) |
| `components/store/shop-page/useShopPageFilters.ts` | Remove false-positive liveKey check; clear stale limit on fresh arrival |
| `components/store/product-card/StandardProductCard.tsx` | Remove pb-0.5; leading-tight → leading-snug |
| `lib/utils/styles.ts` | Fix min-h values in getSharedTitleClampClass |

---

## Why It Failed 10+ Times

- Issue 1 looked like ScrollRestorer bug → was actually StoreFront render-order
- Issue 2 looked like pagination logic bug → was actually sessionStorage false-positive  
- Issue 3 looked like CSS clamp bug → was actually invisible pb-0.5 inside overflow:hidden
- All 3 interrelated: fixing just 1 appeared to work but broke in edge cases
