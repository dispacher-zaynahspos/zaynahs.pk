# UI & Performance Guide

This document outlines the standard UI features, components, performance rules, and behaviors that must be implemented across all current and future pages — Admin (Products, Inventory, Categories, Collections, etc.) AND Storefront (shop, product, home).

**Contents**: Section 1–2 = Admin UI patterns (shared table modules, forms) · Section 3 = URL-driven sort/filter/Load More pattern · Section 4 = Page load performance standards · Section 5 = Image optimization (`getOptimizedImageUrl`).

By following these guidelines, the store remains consistent across every surface and loads fast on all devices.


---

## 1. Shared Table Modules

All admin tables must use standardized shared modules to maintain visual and functional consistency.

### 1.1 Image Preview in Tables (Thumbnail Clicks)
**Requirement**: Whenever a small product or category thumbnail is displayed in a table, the user MUST be able to click on the thumbnail to open a full-size modal preview of the image (exactly like the behavior in the "Edit Product" page's image uploader).

**Implementation Guide**:
Do NOT use generic `<img />` tags or `<Image />` tags directly in table cells. Instead, use the `TableThumbnail` wrapper component.

1. **Import the components**:
   ```tsx
   import TableThumbnail from '@/components/admin/TableThumbnail';
   import ImagePreviewModal from '@/components/admin/ImagePreviewModal';
   ```
2. **Add state at the top level of your Client Component**:
   ```tsx
   const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
   ```
3. **Render the thumbnail inside your map/loop**:
   ```tsx
   <TableThumbnail 
     url={item.imageUrl || null} 
     alt={item.name} 
     onPreview={setPreviewImageUrl} 
     className="h-10 w-10" // Optional overrides
   />
   ```
4. **Render the Modal at the root of your component** (outside any loops):
   ```tsx
   <ImagePreviewModal 
     url={previewImageUrl} 
     onClose={() => setPreviewImageUrl(null)} 
   />
   ```

### 1.2 Interactive Table Rows
**Requirement**: Table rows should visually respond to user interaction.
- Always apply `hover:bg-gray-50/20 dark:hover:bg-white/5` (or similar) to `<tr>` elements.
- When rows are selectable, apply an active styling class when checked (e.g., `bg-primary/5`).

---

## 2. Forms & Inputs

- Never hardcode custom padding or border radii that deviate from `rounded-lg` or `rounded-xl` for standard inputs.
- Keep the touch targets large enough (`min-h-[44px]`) on mobile-friendly inputs.
- Follow the rules defined in `AGENTS.md` and `GEMINI.md` regarding `components/ui` reuse.

---

## 3. Sort / Filter / Load More — URL Query Param Pattern (MANDATORY)

**Applies to**: Every catalog/listing view that shows a sort dropdown, filter rail (availability, price range, category, etc.), and a "Load More" pagination button — storefront `/shop` (all category variants) AND any admin/POS listing that reuses the same pattern.

**Golden Rule**: Sort + filter state must live in the URL query params, NEVER only in React state. This makes every filtered/sorted view linkable, shareable, bookmarked, and back/forward-navigation friendly. "Load More" must always preserve the active sort/filter.

### 3.1 Standard Query Param Names (use these exact keys everywhere)
| Param | Values | Notes |
|-------|--------|-------|
| `sort` | `newest` / `oldest` / `price_desc` / `price_asc` / `alpha_asc` / `alpha_desc` | Omit entirely for "Manual Order" |
| `availability` | comma-separated: `on-sale,in-stock,out-of-stock` | Single param, multiple flags |
| `minPrice` / `maxPrice` | numbers | Both optional; debounced writes |
| `page` | number | Load More pagination; delete on any filter change |
| `category` / `collection` / `search` | existing params | Always preserved (not filter — page context) |

### 3.2 Implementation Checklist (follow every point)
1. **Read params at init**: initialize `sortBy` / availability / price states from `useSearchParams()` so a shared link opens directly into that sorted/filtered view.
2. **Write on change**: every user change (sort select, checkbox toggle, price commit) does `router.replace(pathname?params, { scroll: false })` — never `router.push` (no history spam).
3. **Sync effect from URL**: an effect reading `searchParams` keeps state in sync for back/forward nav and shared links. Must NOT re-write the URL (guard the debounced writer with a "skip if URL unchanged" check to avoid infinite loops).
4. **Price debounce**: price range uses a ~500ms debounced writer (slider fires hundreds of `onChange`s). Keep a `priceDirtyRef` so catalog hydration (price limits change) doesn't clobber user input.
5. **Reset pagination on filter change**: any sort/availability/price change must delete `page` and reset the load-more limit to one page — otherwise the user sees a stale deep page.
6. **Load More preserves everything**: `handleLoadMore` copies `searchParams.toString()` and only sets `page` — sort/filter params survive untouched.
7. **Active filter pills**: every active filter has its own removable pill (Sort, Availability, Price, Category, Search…). Pills update the URL on remove. "Clear All" deletes ALL filter/sort params (`sort`, `availability`, `minPrice`, `maxPrice`, `search`, `page`) but KEEPS `category`/`collection` (page context).
8. **Sort fallback**: when no `sort` param exists, fall back to the category's admin-configured `activeSortPreference`; when a `sort` param exists it wins.
9. **Single implementation**: apply the fix once in the shared listing component so every category variant + "Shop All" behaves identically (e.g. `components/store/ShopPage.tsx`).

### 3.3 Reference Implementation
The canonical working implementation is `components/store/ShopPage.tsx` (handlers: `handleSortChange`, `handleAvailabilityChange`, `removeSortPill`, `removePricePill`, `handleClearFilters` + the three URL sync effects + debounced price writer). Copy this pattern — do not re-invent.

### 3.4 Verify Before Done
- URL updates on every sort/filter change (`?category=womens-clothing&sort=price_asc&availability=on-sale&minPrice=298&maxPrice=4250`).
- Refreshing / opening the link restores the exact same sorted/filtered grid.
- Clicking "Load More" multiple times keeps one continuous sorted/filtered sequence (no reorder, no duplication, no state loss).
- Back/forward browser buttons restore state.
- Mobile filter drawer uses the same handlers (shared `renderFiltersContent`).

---

## 4. Page Load Performance Standards (MANDATORY)

**Applies to**: Every storefront page (home, `/shop`, category, product) and any future listing page.

### 4.1 Baseline — Already In Place (NEVER remove or weaken)
| Area | Rule |
|------|------|
| SSR payload | Server renders ONLY first **24 products** per page (`getProducts(id, 24)`); the rest loads client-side after hydration via `/api/products/list` |
| ISR | Home = `revalidate 86400`, Shop = `3600`, Product = `86400`; admin save webhooks purge via `revalidateTag` — never set `revalidate = 0` on catalog pages |
| Fonts | `next/font/google` with `display: 'swap'` — never self-host heavy fonts, never block render on fonts |
| DB cache | ALL storefront DB reads wrapped in `unstable_cache` with tags (`products`, `categories`, `settings`, `social_proof`…) — raw `supabaseAdmin` queries in SSR are FORBIDDEN unless the data is per-user/uncacheable |
| Images | `next/image` everywhere (lazy loading + responsive sizes); never bare `<img>` in storefront |
| CDN | Cloudflare edge cache + `cdn-cache-control` headers; purge everything after every deploy (`post-deploy-fix.mjs`) |
| Shop filters | Sort/availability/price filtering is 100% client-side on the cached full list — zero DB hits after hydration |
| Streaming | `Promise.all` for all parallel SSR fetches — never sequential `await` chains |

### 4.2 Rules for New Pages / Features
1. **Never add an uncached `supabaseAdmin` query inside a Server Component render or `generateMetadata`.** If the value is the same for all users (counts, banners, lists), wrap it in `unstable_cache` — e.g. social proof counts use `getActiveSocialProofCount()` / `getSocialProofCountForProduct()` (5-min revalidate, `social_proof` tag).
2. **SSR only what first paint + SEO needs.** Lists over ~24 items must follow the "SSR 24 + client hydration" pattern (`/api/products/list` supports `?categoryId=` if category-scoped hydration is needed).
3. **Non-critical sections** (social feed, recommendations, banners) → client-side fetch with `Promise.race` timeout + graceful `.catch(() => [])` fallback — NEVER block SSR.
4. **`generateMetadata` must be cheap**: only cached lookups (`getSettings`, `getProductBySlug`, seo_meta) — never `getProducts()` full-catalog calls.
5. **Before deploying**: run `npm run build` locally; then push + `node scripts/post-deploy-fix.mjs` (Cloudflare purge) — never deploy with pending build errors.

---

## 5. Image Optimization (MANDATORY — storefront display)

**Context**: `next.config` has `images.unoptimized: true` (Vercel image-optimization limits), so Next does NOT resize images. Without transformation, every product image downloads at its FULL original upload size (1–4MB each) — this was the #1 cause of slow image loading.

**Solution**: Use `getOptimizedImageUrl(url, width)` from `@/lib/utils/imageUrl` on every **storefront display** image URL. It appends Supabase Storage transform params (`?width=<width>&quality=80`) so Supabase's CDN resizes + compresses before serving (~80-90% smaller files).

### 5.1 Rules
1. **Never render a raw Supabase product/banner URL in the storefront.** Always wrap with `getOptimizedImageUrl(url, width)`.
2. **Helper is 100% safe** (this is why it's mandatory, not optional):
   - Non-Supabase hosts (Unsplash, custom CDN) → URL returned unchanged.
   - URLs already having a `width` param → untouched.
   - If the project has no image-transformation feature → Supabase ignores the params and serves the original (graceful degradation, nothing breaks).
   - `data:` / `blob:` / relative URLs → returned unchanged.
3. **Standard widths** (match the render size ×2 for retina):
   | Surface | Width |
   |---------|-------|
   | Grid cards (`ProductCard`) | `600` |
   | List-row image (`ShopPage` list card) | `400` |
   | Product gallery main (`ProductDetail`) | `1200` |
   | Product thumbnails / cart / bundle mini | `160` |
   | QuickView gallery | `900` |
   | Social feed posts | `400` |
   | Hero slider / banners (`StoreFront`) | `1600` |
4. **Admin pages keep ORIGINAL URLs** (no transform) — editing/uploading needs full resolution. Never apply the helper to admin displays.
5. **Applied files** (reference — don't regress): `ProductCard.tsx`, `ShopPage.tsx`, `ProductDetail.tsx`, `StoreFront.tsx`, `QuickViewModal.tsx`, `CartContainer.tsx`, `SocialFeedRibbon.tsx`.

---

## 6. Mobile Layout Overlaps & Navigation Interception (MANDATORY)

**Context**: In responsive headers (e.g., `Navbar.tsx`), flex containers like `flex-1` expand to fill empty space. If side containers have a higher z-index than center absolute elements (like the Logo), the side containers' invisible empty space will intercept and block touch events on the center element. Furthermore, custom routing handlers can silently fail if the JS chunk is stale.

**Rules**:
1. **Z-Index & Pointer Events**: Always set `pointer-events-none` on flexible spacer containers (`flex-1`) that overlap other components, and `[&>*]:pointer-events-auto` on their children. Use a higher z-index (e.g. `z-40`) for absolute centered elements that must receive clicks over flexible side columns.
2. **Customizer Size Limits**: NEVER restrict user-customizable logos with `max-w-[50%] overflow-hidden`, as it breaks the clickable area for scaled logos (making the visual edges unclickable). Use a safe bounding box like `max-w-[65%]` without overflow hiding.
3. **Routing Cache Trap**: Do NOT use `e.preventDefault()` with `router.push('/')` on logo clicks. This pattern is vulnerable to silent failures (frozen page) during Cloudflare cache mismatches (`ChunkLoadError`). Always use the native Next.js `<Link>` behavior, coupled with an 800ms `setTimeout` fallback that forces `window.location.href = '/'` if client-side routing gets stuck.

---

## 7. Mobile Product Card Scroll-Focus & Action Icon Spawning (MANDATORY)

**Context**: In multi-column mobile catalog grids (2-column layouts on smartphones), desktop CSS `:hover` states do not exist. Naive implementations cause three major UX failures:
1. **Ghost / Sticky Clutter**: Action buttons (Wishlist, Quick View, Cart) stay permanently visible across all visible cards simultaneously, cluttering the UI.
2. **Column Flickering & Ghost Focus**: When users scroll, focus rapidly jitters between adjacent columns or jumps erratically to upper/lower cards.
3. **Static Offset Failure**: Hardcoded pixel offsets fail when cards have dynamic heights or aspect ratios (natural, 1:1 square, 3:4 portrait, compact, or custom theme heights).

### 7.1 Core Architecture & Principles
Every current and future store must implement the **Mobile Single-Card Focus Coordinator** pattern:
1. **Strict Single-Card Focus**: At any time, strictly **one** card in the entire viewport holds `.is-in-focus` / `.active-card`. All other cards remain in their resting idle state.
2. **Dynamic Bounding-Box Detection**:
   - Never rely on static pixel heights (e.g. `300px` or `400px`).
   - Query runtime dimensions dynamically via `el.getBoundingClientRect()`.
   - Adapts seamlessly to any customizer aspect ratio (`aspect-square`, `aspect-[3/4]`, natural height).
3. **Center-Proximity Sweet-Spot Algorithm**:
   - **Eye-Level Focal Anchor**: Target anchor is set to `window.innerHeight * 0.45` (natural 45% mobile eye-level reading line).
   - **Touch & Thumb Tracking**: Target horizontal axis tracks `lastTouchX` (recorded via passive `touchstart` / `touchmove` / `pointerdown`) to determine which column the user is browsing.
   - **Weighted Euclidean Distance**:
     $$\text{distance} = \sqrt{(\text{cardCenterX} - \text{targetX})^2 + ((\text{cardCenterY} - \text{targetY}) \times 1.4)^2}$$
     Vertical scrolling intent is weighted at $1.4\times$ to avoid premature column jumping during vertical swipes.
4. **18% Hysteresis / Threshold Lock (Anti-Jitter)**:
   - Once a card gains focus, it receives an 18% mathematical advantage:
     $$\text{effectiveDistance} = \text{isCurrentlyFocused} \ ? \ (\text{distance} \times 0.82) : \text{distance}$$
   - A neighboring card can **never** steal focus until the user scrolls enough to bring the new card **>18% closer** to the focal sweet spot.
5. **Direct Touch & Tap Override (Sticky Lock)**:
   - When a user directly touches or taps a card, `setManualFocus(el)` immediately awards focus and activates a 750ms lock (`manualLockUntil = Date.now() + 750`).
   - Inertia micro-scrolls immediately following a finger tap will NOT cancel or shift focus away while the card remains in view.
6. **Automatic Cleanup & Pagination / Infinite Scroll**:
   - Cards register on mount (`register(el)`) and unregister on unmount (`unregister(el)`).
   - On each evaluation pass, any disconnected elements (`!el.isConnected`) are pruned from memory to eliminate memory leaks during pagination or "Load More".
   - `rebindAll()` utility allows re-binding dynamically loaded cards from AJAX / Infinite Scroll.
7. **60 FPS Performance**:
   - All evaluation calls are throttled and coalesced via `requestAnimationFrame` (rAF).
   - Window listeners use `{ passive: true }`.

---

### 7.2 Hardware-Accelerated CSS Implementation
Action icons and hover animations must be hardware-accelerated using `translate3d` and `will-change`.

```css
/* Base: Action icons hidden & translated on mobile */
@media (max-width: 768px), (hover: none) {
  .z-card-container .card-actions,
  .z-card-container .aic {
    opacity: 0 !important;
    transform: translate3d(10px, 0, 0) !important;
    will-change: transform, opacity;
    pointer-events: none !important;
    right: 6px !important;
    top: 6px !important;
    gap: 5px !important;
    transition: opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1), transform 0.28s cubic-bezier(0.16, 1, 0.3, 1) !important;
  }

  .z-card-container .action-btn,
  .z-card-container .ai {
    width: 28px !important;
    height: 28px !important;
    min-width: 28px !important;
    min-height: 28px !important;
    background: rgba(255, 255, 255, 0.92) !important;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.14) !important;
    will-change: transform, opacity;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease !important;
  }

  /* ACTIVE / FOCUSED CARD STATE: Spawn icons smoothly */
  .z-card-container.is-in-focus .card-actions,
  .z-card-container.is-in-focus .aic,
  .z-card-container.active-card .card-actions,
  .z-card-container.active-card .aic {
    opacity: 1 !important;
    transform: translate3d(0, 0, 0) !important;
    pointer-events: auto !important;
  }

  /* Staggered in-animation for action buttons */
  .z-card-container.is-in-focus .card-actions > *:nth-child(1),
  .z-card-container.active-card .card-actions > *:nth-child(1) { transition-delay: 0ms !important; }
  .z-card-container.is-in-focus .card-actions > *:nth-child(2),
  .z-card-container.active-card .card-actions > *:nth-child(2) { transition-delay: 40ms !important; }
  .z-card-container.is-in-focus .card-actions > *:nth-child(3),
  .z-card-container.active-card .card-actions > *:nth-child(3) { transition-delay: 80ms !important; }

  /* Active card title highlight */
  .z-card-container.is-in-focus .product-card-title,
  .z-card-container.active-card .product-card-title {
    color: var(--color-primary, #C2185B) !important;
    transition: color 0.25s ease !important;
  }
}
```

---

### 7.3 Reference Files
- Hook & Manager: `lib/hooks/useMobileCardFocus.ts`
- Product Card Integration: `components/store/product-card/StandardProductCard.tsx`
- Showcase Cards Integration: `components/store/product-card/ProductCardShowcases.tsx`
- CSS Rules & Hover Animations: `components/store/product-card/customCss.tsx`

