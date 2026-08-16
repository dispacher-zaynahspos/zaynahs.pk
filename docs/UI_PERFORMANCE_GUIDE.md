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
