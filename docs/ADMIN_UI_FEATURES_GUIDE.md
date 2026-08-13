# Admin UI Features Guide

This document outlines the standard UI features, components, and behaviors that must be implemented across all current and future Admin pages (e.g., Products, Inventory, Categories, Collections, etc.). 

By following these guidelines, you ensure the Zaynahs E-Store admin panel remains consistent and feels like a cohesive native app.

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
