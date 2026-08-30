# 15 — Shared Components / UI Modules (SHARED_MODULES_RULE, STRICTLY ENFORCED)

Any new page/feature in `/admin` or `/store` MUST reuse these shared modules. If a pattern doesn't exist yet, build it inside the shared directory first (`components/admin/shared/`, `components/store/shared/`, `components/common/`), then consume it — NEVER build inline, page-local UI/logic for anything conceptually reusable.

## Golden rule
- Naya page banane se pehle existing components check karo — naya mat banao.
- Ek hi type ka UI element = ek hi component, poore app mein reuse.

## 🚫 Absolutely forbidden practices
- `window.confirm()` / native `alert()` → BANNED. Use `AdminConfirmDialog` / `useConfirm`.
- Inline `<input>` for search/filter → BANNED. Use `AdminSearchInput` (admin) or `SearchBar` (store).
- Inline `<svg>` / direct `lucide-react` imports on pages → BANNED. Import from `@/components/common/Icons`.
- Inline `<button>` blocks for Prev/Next pagination → BANNED. Use `PaginationFooter`.
- Hardcoded `<table>` headers with no responsive mobile fallback → BANNED.
- Custom "No data found" `<div className="text-gray-500">` → BANNED. Use `EmptyState`.

## ✅ Mandatory component map
| Component/Feature | Required Module | Path |
|---|---|---|
| Icons | Central registry only | `@/components/common/Icons` |
| Search bar (Admin) | `AdminSearchInput` | `@/components/admin/shared/AdminSearchInput` |
| Search bar (Store) | `SearchBar` | `@/components/store/SearchBar` |
| Pagination | `PaginationFooter` | `@/components/admin/PaginationFooter` |
| Date filters | `AdminDateFilter` | `@/components/admin/shared/AdminDateFilter` (backed by `lib/utils/dateFilters.ts`) |
| Confirmation dialogs | `useConfirm` / `AdminConfirmProvider` (raw `window.confirm()` forbidden) | `@/components/admin/shared/AdminConfirmProvider` |
| Empty states | `EmptyState` | `@/components/common/EmptyState` |
| Loading states | `LoadingSkeleton` variants | `@/components/common/LoadingSkeleton` |
| Admin page headers | `AdminPageHeader` | `@/components/admin/shared/AdminPageHeader` |
| Admin cards/panels | `AdminCard` | `@/components/admin/shared/AdminCard` |
| Admin bulk actions | `AdminBulkActionBar` | `@/components/admin/shared/AdminBulkActionBar` |
| Admin toolbars | `AdminToolbar` | `@/components/admin/shared/AdminToolbar` |
| Storefront filters | `CategoryFilter`, `PriceRangeFilter`, `ColorFilter`, `SizeFilter`, `MaterialFilter`, `SortDropdown` | `@/components/store/shared/*` |
| Tab management | `useAdminTab.ts` pattern | `lib/hooks/useAdminTab` |

## ✅ Mandatory utility map
- Reordering arrays / drag & drop → `import { arrayMove } from '@/lib/utils/arrayMove'`
- Formatting price/currency → `import { formatPrice } from '@/lib/utils/whatsapp'`
- Date math / ISO strings / time-ago → `import { timeAgo, getStartISO, getEndISO } from '@/lib/utils/dateFilters'`
- Storage URLs / image parsing → `import { isOwnStorageUrl, processImageUrl } from '@/lib/services/storage'`

## Folder structure (mandatory)
```
/components
  /ui          → base atoms (list below)
  /layout      → Header, Sidebar, Footer, PageWrapper, Container
  /shared      → reusable business components (ProductCard, OrderRow, StatCard)
  /forms       → form-specific composites (SearchForm, FilterForm, CheckoutForm)
  /store       → store-only composites
  /admin       → admin-only composites
```

## Design tokens (single source of truth)
Colors, spacing, radius, shadow, font-size — defined ONLY in `tailwind.config` / `theme.ts`. Hardcoded values (`#3b82f6`, `padding:13px`) are banned everywhere. Every new UI element uses an existing token.

## Complete shared component list (`/components/ui/`)
**Navigation & structure**: Navbar/TopBar, Sidebar (collapsible), Breadcrumb, Tabs, Pagination, BottomNav (mobile)
**Inputs & forms**: Button (primary/secondary/outline/ghost/danger/icon-button), Input (text/number/password/with-icon), SearchBar (debounce, clear icon, suggestions dropdown), Select/Dropdown, MultiSelect, Checkbox, RadioGroup, Switch/Toggle, Textarea, DatePicker/DateRangePicker, FileUpload/ImageUpload (drag-drop), FormField wrapper (label + error + hint, consistent everywhere)
**Data display**: Card (base + ProductCard/StatCard/OrderCard variants), Table (sortable, paginated, row-select), List (drag-reorder), Badge, Chip/Tag (removable/filter/category), Avatar, Tooltip, StatWidget, EmptyState, Skeleton/Loader (page/card/table variants)
**Icons**: single `Icon` wrapper (lucide-react based) — no mixed icon libraries; size scale `sm/md/lg`, no hardcoded px
**Feedback & overlay**: Modal/Dialog, Drawer (side panel — mobile filters, cart), Toast/Notification, ConfirmDialog (destructive actions), ProgressBar, Spinner
**Drag & interaction**: DragHandle + SortableList (dnd-kit based), Draggable Card (kanban/order board), Swipeable row (mobile delete/edit)
**E-commerce/POS specific**: ProductCard (grid + list), CartItem row, QuantityStepper (+/-), PriceTag (discount strike-through), StockBadge (in/low/out-of-stock), OrderStatusBadge, PaymentMethodIcon set, CategoryChip/FilterChip bar

## Consistency checklist (agent runs on EVERY new page)
1. Same `PageWrapper`/layout used?
2. Same Button/Input/Card/Chip component used (not a new one)?
3. Spacing/typography scale matches other pages?
4. Same loading/error/empty-state pattern?
5. New pattern needed → check 2–3 existing pages first.
6. **MANDATORY**: any admin page showing a product/image thumbnail follows `docs/UI_PERFORMANCE_GUIDE.md` (`TableThumbnail` click → Modal, `getOptimizedImageUrl()`, URL-driven sort/filter, page-load performance standards — applies to storefront components too).
7. **Supabase stored images compressed** (WebP ≤100KB, URL-preserving): run `scripts/convert-images-webp.mjs` + follow `docs/SUPABASE_IMAGE_CONVERTER.md` (TEST_LIMIT → full run → verify). Never curl/raw-fetch upload — always `supabase-js` `upload(..., { upsert: true })`.
8. **New store setup — push brand content everywhere (MANDATORY)**: follow `docs/NEW_PROJECT_SETUP_GUIDE.md` §3.3b — ask the user first (brand name, business type, tagline, product order), then run `node scripts/seed-brand.mjs` to push everywhere (store_settings, ai_settings, seo_meta, categories sort_order). Never assume/hardcode brand values.

## Anti-patterns (never do)
- ❌ Every page has its own custom Button/Card
- ❌ Different card design per page for the same data
- ❌ Mixed icon libraries (lucide, heroicons, raw svg)
- ❌ Copy-paste + modify instead of extending the original component
- ❌ Drag-drop implemented per-page with a different library/logic each time

## Enforcement
- Before building new UI, agent checks: "kya ye `/components/ui/` mein already hai?"
- Maintain `COMPONENTS.md` — list of all shared components + their use-case.

## Modularity — one file per modal/tab (RULE O1)
Full detail: [23-code-architecture-modularity.md](23-code-architecture-modularity.md).
