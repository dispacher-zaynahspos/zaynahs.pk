# Product Search Engine — Architecture & Integration Guide

## Overview

This document describes the centralized, reusable product search system implemented across the entire application (both `/admin/**` and `/store/**` routes).

**Location:** `lib/services/product-search/`

---

## Architecture

```
lib/services/product-search/
├── index.ts                 # Main exports
├── types.ts                 # TypeScript interfaces & config
├── normalization.ts         # Query normalization, age parsing, highlighting
├── ranking.ts               # Weighted relevance scoring algorithm
├── server-search.ts         # Server-side search (Postgres full-text + trigram)
├── client-search.ts         # Client-side search with caching
├── useProductSearch.ts      # React hook (debounce, cache, abort)
├── ProductSearchModal.tsx   # Shared modal component
├── useAdminProductSearch.ts # Admin-specific search hook
└── useCategorySearch.ts     # Category-specific search hook
```

### API Endpoint
- `GET /api/search/products` — Server-side search with filters, pagination, caching

### Database Optimizations (Migration: `20261009190000_product_search_optimization.sql`)
- `search_vector` tsvector column on `products` with GIN index
- `pg_trgm` extension for fuzzy matching
- Trigram indexes on `name`, `description`, `short_description`, `sku`, variant attributes
- Auto-update triggers on product/variant/category changes

---

## Searchable Fields & Ranking

Default weights (configurable via `DEFAULT_SEARCH_WEIGHTS`):

| Priority | Field | Weight | Match Type |
|----------|-------|--------|------------|
| 1 | Title (exact) | 100 | Exact match |
| 2 | Title (prefix) | 80 | Starts with |
| 3 | Title (keyword) | 60 | Word boundary |
| 4 | SKU | 90 | Exact/partial |
| 5 | Variant (exact) | 50 | Color/size/material/SKU word boundary |
| 6 | Variant (partial) | 25 | Substring |
| 7 | Short description | 20 | Substring |
| 8 | Tags | 15 | Substring |
| 9 | Category | 15 | Substring |
| 10 | Long description | 10 | Substring |
| 11 | Age (exact) | 40 | Exact age match |
| 12 | Age (compatible) | 20 | Overlapping range |

**Tie-breakers:** Featured → In stock → Newer

---

## Age-Aware Search

### Query Parsing
Supports natural language age expressions:
- `2 years`, `2 yrs`, `24 months` → 24 months
- `1-3 years`, `1 to 3 years` → 12-36 months range
- `age 2` → 24 months
- Gender: `boy`, `girl`, `unisex` / `kids`, `children`, `baby`

### Product Age Metadata (Optional Schema Fields)
Add to `products` table for full support:
```sql
recommended_age_min_months integer,
recommended_age_max_months integer,
age_group text  -- legacy text field, parsed automatically
```

Matching logic:
- **Exact:** Query age falls within product range → +40 score
- **Compatible:** Ranges overlap or within 6 months → +20 score
- **No match:** No age data or outside range → 0 score

---

## Integration Guide

### 1. Basic Hook Usage (Client Components)

```tsx
import { useProductSearch } from '@/lib/services/product-search';

function MyComponent() {
  const { query, setQuery, results, isLoading, error, search, clear, loadMore } = 
    useProductSearch({
      debounceMs: 300,
      minQueryLength: 1,
      config: {
        limit: 20,
        filters: { categoryId: 'uuid', inStockOnly: true }
      },
      onResults: (results) => console.log('Found:', results.length),
      onError: (err) => toast.error(err.message),
    });

  return (
    <input 
      value={query} 
      onChange={(e) => setQuery(e.target.value)} 
      placeholder="Search products..."
    />
  );
}
```

### 2. Shared Modal Component

```tsx
import ProductSearchModal from '@/lib/services/product-search/ProductSearchModal';

function MyPage() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Search</button>
      <ProductSearchModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelect={(product) => console.log('Selected:', product)}
        title="Select Product"
        placeholder="Search by name, SKU, category, variant, tag, or age..."
        selectionMode="single"
        showVariants={true}
        showSKU={true}
        showCategory={true}
        showTags={true}
      />
    </>
  );
}
```

**Multi-select mode:**
```tsx
<ProductSearchModal
  selectionMode="multiple"
  selectedIds={selectedIds}
  onSelectMultiple={(ids) => setSelectedIds(ids)}
/>
```

### 3. Admin Search Hook (Includes Draft/Inactive)

```tsx
import { useAdminProductSearch } from '@/components/admin/useAdminProductSearch';

function AdminProductList({ initialProducts }) {
  const { searchQuery, setSearchQuery, filteredProducts, totalFiltered, isSearching } =
    useAdminProductSearch({
      initialProducts,
      includeInactive: true,
      includeDraft: true,
    });
  
  // filteredProducts already ranked and filtered
}
```

### 4. Category Search Hook (With Add Modal Support)

```tsx
import { useAdminCategorySearch } from '@/components/admin/useCategorySearch';

function CategoryDetail({ products, allStoreProducts }) {
  const {
    searchQuery, setSearchQuery,
    filteredProducts, totalFiltered,
    modalSearchQuery, setModalSearchQuery,
    filteredModalProducts,
  } = useAdminCategorySearch({
    products,
    allStoreProducts,
    includeInactive: true,
  });
}
```

### 5. Shop Page Search (Hybrid)

```tsx
import { useShopSearch } from '@/components/store/shop-page/useShopSearch';

function ShopPage({ initialProducts, searchQuery, categoryId }) {
  const { searchResults, isSearching, loadMore } = useShopSearch({
    initialProducts,
    searchQuery,
    categoryId,
    enabled: true,
  });
}
```

---

## Configuration Options

### ProductSearchConfig
```ts
interface ProductSearchConfig {
  includeDraft?: boolean;      // Admin: include draft products
  includeInactive?: boolean;   // Admin: include inactive products
  includeArchived?: boolean;   // Admin: include archived
  storeId?: string;            // Multi-store isolation
  limit?: number;              // Page size (default 50, max 100)
  offset?: number;             // Pagination offset
  filters?: ProductSearchFilters;
}
```

### ProductSearchFilters
```ts
interface ProductSearchFilters {
  categoryId?: string;
  collectionId?: string;
  tag?: string;
  priceMin?: number;
  priceMax?: number;
  inStockOnly?: boolean;
  onSaleOnly?: boolean;
  hasVariants?: boolean;
  isFeatured?: boolean;
  ageGroup?: string;
  gender?: string;
}
```

---

## Migration Checklist

### Completed Locations

| # | Location | Component | Migration |
|---|----------|-----------|-----------|
| 1 | Navbar live search | `useNavbarSearch.ts` | ✅ in-memory `rankProducts` + synonyms (client, full catalog) |
| 2 | Shop page text search | `shopFilterUtils.ts` (`filterProductsList` + `rankProducts` + `searchSynonyms`) | ✅ CLIENT path — `useShopSearch` removed (see RULE PS3b) |
| 3 | Admin products list | `ProductList.tsx` | ✅ `rankProducts` (title-first) |
| 4 | Category detail | `CategoryDetailManager.tsx` | ✅ `useAdminCategorySearch` |
| 5 | Category add modal | `CategoryDetailManager.tsx` | ✅ `useAdminCategorySearch` |
| 6 | Order product search (editor) | `OrderProductSearch.tsx` | ✅ `rankProducts` |
| 7 | Bought together | `ProductFormBoughtTogetherSection.tsx` | ✅ `rankProducts` |
| 8 | Navigation menu | `MenuItemFormModal.tsx` | ✅ `rankProducts` |
| 9 | Reviews post modal | `PostReviewModal.tsx` | ✅ `rankProducts` |
| 10 | Customizer product picker | `ManualProductPicker.tsx` | ✅ `rankProducts` |
| 11 | Review detail sheet | `ReviewDetailSheet.tsx` | ✅ `rankProducts` |
| 12 | Order create products | `useOrderCreateProducts.ts` | ✅ `rankProducts` |
| 13 | Quick view modal | `QuickViewModal.tsx` | ✅ Uses shop filters |

### Remaining (collection-name / non-product OR low-priority)

| # | Location | Component | Reason |
|---|----------|-----------|--------|
| 14 | Collection table | `CollectionTable.tsx` | Searches COLLECTIONS (name/slug), not products — out of engine scope |
| 15 | Customizer collections grid | `CollectionsGridSettings.tsx` | Searches COLLECTIONS, not products |
| 16 | Recent reviews settings | `RecentReviewsSettings.tsx` | Filters REVIEWS, not products |
| 17 | Trash console | `TrashProductsTable.tsx` | Trash list filter (small set) |
| 18 | Import/Export modal | `ImportExportModal.tsx` | Local export selection filter |
| 19 | SearchBar | `SearchBar.tsx` | Redirects to `/shop?search=` (uses engine) |

**Shared in-memory helper:** `rankProducts(products, query)` and `useInMemoryProductSearch()` in
`lib/services/product-search/useInMemoryProductSearch.ts` — same canonical ranking as the server
engine, zero extra DB load, used by all admin pickers that already hold the product list in memory.

---

## Running the Migration

1. **Apply database migration:**
```bash
# Via Supabase CLI
supabase db push

# Or run migration manually in Supabase SQL Editor
# File: supabase/migrations/20261009190000_product_search_optimization.sql
```

2. **Verify indexes:**
```sql
\d public.products
\di idx_products_*
```

3. **Test search:**
```sql
-- Full-text search
SELECT id, name, ts_rank_cd(search_vector, plainto_tsquery('simple', 'shirt')) as rank
FROM public.products 
WHERE search_vector @@ plainto_tsquery('simple', 'shirt')
AND is_active = true AND deleted_at IS NULL
ORDER BY rank DESC LIMIT 10;

-- Trigram similarity
SELECT id, name, similarity(name, 'shert') as sim
FROM public.products 
WHERE name % 'shert'
AND is_active = true AND deleted_at IS NULL
ORDER BY sim DESC LIMIT 10;
```

---

## Performance Notes

- **Server search:** Uses `search_vector` GIN index + trigram indexes — O(log N) lookup
- **Client cache:** 30s TTL, auto-invalidates on query change
- **Debounce:** 300ms default (configurable)
- **Request cancellation:** AbortController on rapid query changes
- **Pagination:** 50 results/page, load more on scroll
- **No full catalog loading:** Only matching results transferred

---

## Extending the Search

### Add Custom Weights
```ts
import { rankSearchResults, DEFAULT_SEARCH_WEIGHTS } from '@/lib/services/product-search';

const customWeights = {
  ...DEFAULT_SEARCH_WEIGHTS,
  titleExact: 150,  // Boost exact title matches
  sku: 120,         // Boost SKU searches
};

const ranked = rankSearchResults(products, query, customWeights);
```

### Add New Searchable Field
1. Add column to `products` or related table
2. Update `build_product_search_vector()` in migration
3. Add trigram index if fuzzy matching needed
4. Update `ProductSearchResult` type
5. Add weight to `DEFAULT_SEARCH_WEIGHTS`
6. Update `calculateSearchScore()` in `ranking.ts`

### Add Age Fields to Schema
```sql
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS recommended_age_min_months integer,
ADD COLUMN IF NOT EXISTS recommended_age_max_months integer,
ADD COLUMN IF NOT EXISTS age_group text;

CREATE INDEX IF NOT EXISTS idx_products_age_range 
ON public.products (recommended_age_min_months, recommended_age_max_months);
```

Then run `refresh_all_product_search_vectors()` to populate.

---

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Search returns no results | Migration not applied | Run migration, verify `search_vector` column exists |
| Slow search (>500ms) | Missing indexes | Check `idx_products_search_vector` exists |
| Fuzzy match not working | `pg_trgm` not enabled | Run `CREATE EXTENSION IF NOT EXISTS pg_trgm;` |
| Age matching not working | Age fields missing | Add age columns to products table |
| Cache stale | 30s TTL | Call `invalidateSearchCache()` on product updates |
| Modal not closing | Portal issue | Ensure `createPortal` target exists |

---

## Future Improvements

- [ ] Synonyms/thesaurus support (e.g., "tee" → "t-shirt")
- [ ] Search analytics & popular queries tracking
- [ ] Autocomplete suggestions API
- [ ] Vector/embedding search for semantic matching
- [ ] Search result personalization
- [ ] Multi-language support (Arabic/Urdu)