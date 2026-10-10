/**
 * SINGLE SOURCE OF TRUTH for product sort options + sort logic.
 *
 * Used by EVERYWHERE a product list is sorted:
 *  - storefront /shop + category pages (components/store/shop-page/*)
 *  - admin category products table (components/admin/category-detail/*)
 *  - home customizer product sections (components/store/store-front/*)
 *
 * RULE: never hardcode a sort <option> label or an inline sort switch again.
 * Import `SORT_OPTIONS`, `getSortLabel`, `applySort`, `normalizeSortKey` here.
 *
 * NOTE on "manual" ordering (critical decoupling rule):
 *  - Category / Shop manual order = `product_categories.position` (per category),
 *    passed into `applySort` as `manualPositions` (productId -> position).
 *  - Home section manual order = that section's own `settings.manualProductIds`
 *    array (handled separately by the section renderer, NOT this comparator).
 *  There is NO shared global rank. See docs/agent-rules/30-sorting-reordering.md.
 */

export type SortKey =
  | 'manual'
  | 'newest'
  | 'oldest'
  | 'price_desc'
  | 'price_asc'
  | 'alpha_asc'
  | 'alpha_desc';

export interface SortOption {
  value: SortKey;
  label: string;
}

/** Canonical option list (value + label). The ONLY place labels are defined. */
export const SORT_OPTIONS: readonly SortOption[] = [
  { value: 'manual', label: 'Manual Order' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'alpha_asc', label: 'Alphabetically: A-Z' },
  { value: 'alpha_desc', label: 'Alphabetically: Z-A' },
] as const;

export const DEFAULT_SORT: SortKey = 'manual';

/**
 * Legacy / alias value mapping → canonical SortKey.
 * Keeps older saved `active_sort_preference` values and spec-named values working
 * without a data migration (permanent, no data breakage).
 */
const ALIAS_MAP: Record<string, SortKey> = {
  // spec names → canonical
  name_asc: 'alpha_asc',
  name_desc: 'alpha_desc',
  // legacy hyphenated set used by admin ProductList
  'created-desc': 'newest',
  'created-asc': 'oldest',
  'price-desc': 'price_desc',
  'price-asc': 'price_asc',
  'name-asc': 'alpha_asc',
  'name-desc': 'alpha_desc',
  // common synonyms
  recent: 'newest',
  featured: 'manual',
  all: 'manual',
  a_to_z: 'alpha_asc',
  z_to_a: 'alpha_desc',
  price_low: 'price_asc',
  price_high: 'price_desc',
};

const VALID_KEYS = new Set<string>(SORT_OPTIONS.map((o) => o.value));

/** Coerce any incoming string (URL param, saved pref, legacy value) to a valid SortKey. */
export function normalizeSortKey(value: string | null | undefined): SortKey {
  if (!value) return DEFAULT_SORT;
  if (VALID_KEYS.has(value)) return value as SortKey;
  return ALIAS_MAP[value] ?? DEFAULT_SORT;
}

export function getSortLabel(value: string | null | undefined): string {
  const key = normalizeSortKey(value);
  return SORT_OPTIONS.find((o) => o.value === key)?.label ?? key;
}

export function isValidSortKey(value: string | null | undefined): boolean {
  return !!value && (VALID_KEYS.has(value) || value in ALIAS_MAP);
}

/** Minimal shape `applySort` needs — any product-like record works. */
export interface SortableItem {
  id: string;
  name?: string | null;
  price?: number | null;
  created_at?: string | null;
  /** fallback global order (legacy); used only if no manualPositions provided */
  sort_order?: number | null;
}

const MANUAL_FALLBACK = 999999;

function manualCompare<T extends SortableItem>(
  a: T,
  b: T,
  manualPositions?: Record<string, number>
): number {
  const posA = manualPositions?.[a.id];
  const posB = manualPositions?.[b.id];
  const orderA =
    typeof posA === 'number'
      ? posA
      : typeof a.sort_order === 'number' && a.sort_order > 0
        ? a.sort_order
        : MANUAL_FALLBACK;
  const orderB =
    typeof posB === 'number'
      ? posB
      : typeof b.sort_order === 'number' && b.sort_order > 0
        ? b.sort_order
        : MANUAL_FALLBACK;
  if (orderA !== orderB) return orderA - orderB;
  // stable tiebreaker: newest first, then id for determinism
  const timeA = new Date(a.created_at || 0).getTime();
  const timeB = new Date(b.created_at || 0).getTime();
  if (timeA !== timeB) return timeB - timeA;
  return a.id.localeCompare(b.id);
}

/**
 * Pure sort — returns a NEW array, never mutates the input.
 *
 * @param items           products to sort
 * @param sortKey         any value (normalized internally)
 * @param manualPositions productId -> position map for `manual` mode (per-category).
 *                        If omitted, `manual` falls back to each item's `sort_order`.
 */
export function applySort<T extends SortableItem>(
  items: T[],
  sortKey: string | null | undefined,
  manualPositions?: Record<string, number>
): T[] {
  const key = normalizeSortKey(sortKey);
  const list = [...items];
  const idTiebreak = (cmp: number, a: T, b: T) =>
    cmp !== 0 ? cmp : a.id.localeCompare(b.id);

  switch (key) {
    case 'manual':
      list.sort((a, b) => manualCompare(a, b, manualPositions));
      break;
    case 'newest':
      list.sort((a, b) =>
        idTiebreak(
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime(),
          a,
          b
        )
      );
      break;
    case 'oldest':
      list.sort((a, b) =>
        idTiebreak(
          new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime(),
          a,
          b
        )
      );
      break;
    case 'price_desc':
      list.sort((a, b) => idTiebreak((Number(b.price) || 0) - (Number(a.price) || 0), a, b));
      break;
    case 'price_asc':
      list.sort((a, b) => idTiebreak((Number(a.price) || 0) - (Number(b.price) || 0), a, b));
      break;
    case 'alpha_asc':
      list.sort((a, b) =>
        idTiebreak(
          (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }),
          a,
          b
        )
      );
      break;
    case 'alpha_desc':
      list.sort((a, b) =>
        idTiebreak(
          (b.name || '').localeCompare(a.name || '', undefined, { sensitivity: 'base' }),
          a,
          b
        )
      );
      break;
  }
  return list;
}

/** A single ORDER BY clause descriptor for building DB queries. */
export interface OrderByClause {
  column: string;
  ascending: boolean;
}

/**
 * DB ORDER BY builder matching `applySort`. For `manual` we order by the
 * per-category join column when a list is scoped to a category; callers that
 * read the global products table pass `manualColumn = 'sort_order'`.
 * Always appends `created_at DESC, id ASC` as a stable tiebreaker.
 */
export function buildOrderBy(
  sortKey: string | null | undefined,
  manualColumn = 'sort_order'
): OrderByClause[] {
  const key = normalizeSortKey(sortKey);
  const tiebreak: OrderByClause[] = [
    { column: 'created_at', ascending: false },
    { column: 'id', ascending: true },
  ];
  switch (key) {
    case 'manual':
      return [{ column: manualColumn, ascending: true }, ...tiebreak];
    case 'newest':
      return [{ column: 'created_at', ascending: false }, { column: 'id', ascending: true }];
    case 'oldest':
      return [{ column: 'created_at', ascending: true }, { column: 'id', ascending: true }];
    case 'price_desc':
      return [{ column: 'price', ascending: false }, ...tiebreak];
    case 'price_asc':
      return [{ column: 'price', ascending: true }, ...tiebreak];
    case 'alpha_asc':
      return [{ column: 'name', ascending: true }, ...tiebreak];
    case 'alpha_desc':
      return [{ column: 'name', ascending: false }, ...tiebreak];
    default:
      return [{ column: manualColumn, ascending: true }, ...tiebreak];
  }
}
