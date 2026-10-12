/**
 * Responsive Grid Column Helper for E-Commerce Catalog & Grids — SSOT.
 * (RULE DS24 / RULE SSOT-CATALOG-LAYOUTS)
 *
 * ONE shared system used by EVERY catalog/collection grid across the storefront:
 *  /shop, category pages, search, Home Featured/Tabbed/Flash Sale, Collections grid,
 *  PDP Related, PDP Recently Viewed — and the customizer preview.
 *
 * Columns are driven by inline CSS VARIABLES (not Tailwind `grid-cols-*`) because
 * Tailwind v4 purges dynamic class strings (`lg:grid-cols-${n}`) and the JS
 * `content`/safelist is not reliably honored — so chosen column counts silently had
 * no effect, and big screens looked compressed inside a narrow fixed container.
 * The `.catalog-grid` CSS (in app/globals.css) consumes these variables so the exact
 * chosen value ALWAYS applies (6 means 6) on every device + large screens, and works
 * identically in the live site and the resizable customizer preview.
 *
 * Breakpoints (match Tailwind): mobile <640, tablet 640–1023, desktop 1024–1535,
 * large desktop 1536+. A device with no value inherits the nearest set value.
 */

/* ──────────────────────────────────────────────────────────────────────────
 * Legacy static class maps (kept for backward compatibility only).
 * New code must use getCatalogGridStyle(). These string literals also keep the
 * classes present in source so any remaining Tailwind usage is not purged.
 * ────────────────────────────────────────────────────────────────────────── */
const MOBILE_COL_MAP: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
};

const TABLET_COL_MAP: Record<number, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
};

const DESKTOP_COL_MAP: Record<number, string> = {
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
  7: 'lg:grid-cols-7',
  8: 'lg:grid-cols-8',
};

export interface ResponsiveGridOptions {
  mobile?: number | string | null;
  tablet?: number | string | null;
  desktop?: number | string | null;
}

/**
 * @deprecated Prefer getCatalogGridStyle() which supports exact 2–8 columns, auto
 * mode, large-desktop and container-aware sizing. Retained so existing callers keep
 * compiling; returns static Tailwind classes clamped to the legacy ranges.
 */
export function getResponsiveGridClasses(options?: ResponsiveGridOptions): string {
  const m = Number(options?.mobile) || 2;
  const t = Number(options?.tablet) || 3;
  const d = Number(options?.desktop) || 4;

  const mobileCls = MOBILE_COL_MAP[Math.min(3, Math.max(1, m))] || 'grid-cols-2';
  const tabletCls = TABLET_COL_MAP[Math.min(4, Math.max(2, t))] || 'sm:grid-cols-3';
  const desktopCls = DESKTOP_COL_MAP[Math.min(8, Math.max(2, d))] || 'lg:grid-cols-4';

  return `${mobileCls} ${tabletCls} ${desktopCls}`;
}

export type GridGapOption = 'tight' | 'normal' | 'relaxed';

/**
 * Maps grid gap setting to responsive Tailwind gap classes.
 * - tight: gap-2 sm:gap-2.5 (compact catalog view)
 * - normal: gap-3.5 sm:gap-4 md:gap-4 lg:gap-5 (standard)
 * - relaxed: gap-5 sm:gap-6 (spacious)
 */
export function getGridGapClass(gap?: GridGapOption | string | null): string {
  if (gap === 'tight') return 'gap-2 sm:gap-2.5';
  if (gap === 'relaxed') return 'gap-5 sm:gap-6';
  return 'gap-3.5 sm:gap-4 md:gap-4 lg:gap-5';
}

/* ──────────────────────────────────────────────────────────────────────────
 * NEW SSOT engine — CSS-variable driven columns (auto / manual) + content width.
 * ────────────────────────────────────────────────────────────────────────── */

export type CatalogColumnsMode = 'auto' | 'manual';
export type ContentWidth = 'boxed' | 'wide' | 'full';

export interface CatalogGridConfig {
  /** 'manual' = exact column counts apply. 'auto' = columns derived from container width + min card width. */
  mode?: CatalogColumnsMode | null;
  mobile?: number | string | null;
  tablet?: number | string | null;
  desktop?: number | string | null;
  /** Large desktop (1536px+). Falls back to desktop when unset. */
  wide?: number | string | null;
  /** Auto-mode minimum card width (px) per device so cards never look squeezed. */
  minMobile?: number | string | null;
  minTablet?: number | string | null;
  minDesktop?: number | string | null;
  /** Auto-mode min width on 1440+ (laptop/desktop step). Falls back to minDesktop. */
  minXl?: number | string | null;
  /** Auto-mode min width on 1920+ (large desktop). Falls back to minXl/minDesktop. */
  minXxl?: number | string | null;
  gap?: GridGapOption | string | null;
  /** Total tiles count — used to center incomplete rows while keeping tile size */
  tileCount?: number | null;
  /** If true, centers tiles when tileCount < columns, preserving exact column width */
  centerIncomplete?: boolean;
}

/** Safe per-device clamps (match the shared ResponsiveGridColumnsControl ranges; desktop extended to 8). */
const clampMobile = (n: number) => Math.min(3, Math.max(1, Math.round(n)));
const clampTablet = (n: number) => Math.min(4, Math.max(2, Math.round(n)));
const clampDesktop = (n: number) => Math.min(8, Math.max(2, Math.round(n)));

const num = (v: unknown, fallback: number): number => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

/** Gap in px per device, driven as a CSS variable (not purge-prone Tailwind classes). */
function gapVars(gap?: GridGapOption | string | null): { m: number; t: number; d: number } {
  if (gap === 'tight') return { m: 10, t: 10, d: 10 };
  if (gap === 'relaxed') return { m: 20, t: 24, d: 24 };
  return { m: 14, t: 16, d: 20 }; // normal
}

/**
 * Returns the className, data-mode and inline CSS variables for a catalog grid.
 * Spread the style + className + data-mode onto the grid element:
 *   const grid = getCatalogGridStyle(cfg);
 *   <div className={`catalog-grid ${extra}`} data-mode={grid.mode} style={grid.style}>
 */
export function getCatalogGridStyle(cfg?: CatalogGridConfig | null): {
  className: string;
  mode: CatalogColumnsMode;
  style: React.CSSProperties;
} {
  const mode: CatalogColumnsMode = cfg?.mode === 'auto' ? 'auto' : 'manual';

  const m = clampMobile(num(cfg?.mobile, 2));
  const t = clampTablet(num(cfg?.tablet, 3));
  const d = clampDesktop(num(cfg?.desktop, 4));
  const w = clampDesktop(num(cfg?.wide, d)); // large desktop inherits desktop when unset

  const minM = num(cfg?.minMobile, 160);
  const minT = num(cfg?.minTablet, 200);
  const minD = num(cfg?.minDesktop, 220);
  const minXl = num(cfg?.minXl, minD);   // 1440+ step
  const minXxl = num(cfg?.minXxl, minXl); // 1920+ step

  const g = gapVars(cfg?.gap);

  const tileCount = cfg?.tileCount != null ? Math.max(1, Math.floor(Number(cfg.tileCount))) : null;
  const centerTiles = Boolean(cfg?.centerIncomplete && tileCount !== null);

  // Target columns for baseline card width sizing:
  // Desktop standard card width is based on at least 4 columns (or merchant preference if >= 3).
  // If merchant selected 2 columns with 2 tiles, baseline to 4 so tiles stay standard card size
  // (~285px) and center neatly in the container instead of bloating to 50% width (~600px).
  const targetD = d <= 2 && (tileCount ?? 0) <= 2 ? 4 : d;
  const targetW = w <= 2 && (tileCount ?? 0) <= 2 ? 4 : w;
  const targetT = Math.max(t, 3);
  const targetM = Math.max(m, 2);

  let activeD = d;
  let activeW = w;
  let activeT = t;
  let activeM = m;
  let maxWD: string | undefined;
  let maxWW: string | undefined;
  let maxWT: string | undefined;
  let maxWM: string | undefined;

  let effectiveMode: CatalogColumnsMode = mode;

  if (centerTiles && tileCount !== null) {
    if (tileCount < targetD) {
      activeD = Math.max(1, tileCount);
      const frac = activeD / targetD;
      const rem = (targetD - activeD) / targetD;
      maxWD = `calc(${frac * 100}% - ${rem} * var(--cat-gap-d))`;
    }
    if (tileCount < targetW) {
      activeW = Math.max(1, tileCount);
      const frac = activeW / targetW;
      const rem = (targetW - activeW) / targetW;
      maxWW = `calc(${frac * 100}% - ${rem} * var(--cat-gap-d))`;
    }
    if (tileCount < targetT) {
      activeT = Math.max(1, tileCount);
      const frac = activeT / targetT;
      const rem = (targetT - activeT) / targetT;
      maxWT = `calc(${frac * 100}% - ${rem} * var(--cat-gap-t))`;
    }
    if (tileCount < targetM) {
      activeM = Math.max(1, tileCount);
      const frac = activeM / targetM;
      const rem = (targetM - activeM) / targetM;
      maxWM = `calc(${frac * 100}% - ${rem} * var(--cat-gap-m))`;
    }

    // When tiles are fewer than target columns, enforce exact active column count
    // so auto-fill doesn't generate empty tracks on the right.
    if (tileCount < targetD) {
      effectiveMode = 'manual';
    }
  }

  const style: Record<string, string | number> = {
    '--cat-cols-m': activeM,
    '--cat-cols-t': activeT,
    '--cat-cols-d': activeD,
    '--cat-cols-w': activeW,
    '--cat-min-m': `${minM}px`,
    '--cat-min-t': `${minT}px`,
    '--cat-min-d': `${minD}px`,
    '--cat-min-xl': `${minXl}px`,
    '--cat-min-xxl': `${minXxl}px`,
    '--cat-gap-m': `${g.m}px`,
    '--cat-gap-t': `${g.t}px`,
    '--cat-gap-d': `${g.d}px`,
  };

  if (maxWM) style['--cat-max-w-m'] = maxWM;
  if (maxWT) style['--cat-max-w-t'] = maxWT;
  if (maxWD) style['--cat-max-w-d'] = maxWD;
  if (maxWW) style['--cat-max-w-w'] = maxWW;

  return { className: 'catalog-grid', mode: effectiveMode, style: style as React.CSSProperties };
}

/**
 * Content-width wrapper class for catalog sections (and the hero, so they align).
 * - boxed = classic 1280px (max-w-7xl)
 * - wide  = roomy large-screen container (~1920px) — default, so big screens use
 *           the width well and line up with the full-width hero instead of sitting
 *           in a narrow centered box
 * - full  = edge-to-edge (with fluid side padding from the wrapper)
 */
export function getContentWidthClass(width?: ContentWidth | string | null): string {
  if (width === 'full') return 'max-w-full';
  if (width === 'boxed') return 'max-w-7xl';
  return 'max-w-[1920px]'; // 'wide' is the default
}

/**
 * Shared fluid side-padding for catalog section containers. Scales up on large
 * screens so wide/full content never touches the edges. SSOT — use everywhere a
 * catalog section builds its own container.
 */
export const CATALOG_SECTION_PADDING = 'px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-14';

/**
 * Fill-rows (RULE DS24): round a visible/batch count UP to a full row when more
 * products exist, so the last visible row is never half-empty. When the catalog
 * is exhausted the remainder is shown as-is (partial last row is fine — we never
 * invent or duplicate products).
 *
 * @param desired     the requested limit / batch target (e.g. 8)
 * @param columns     columns currently rendered for the active device
 * @param available   total products available in this section/list
 * @param fillRows    whether fill-rows is enabled (default behavior ON)
 * @returns the number of products to show
 */
export function applyFillRows(
  desired: number,
  columns: number,
  available: number,
  fillRows: boolean = true,
): number {
  const d = Math.max(0, Math.floor(desired));
  const cols = Math.max(1, Math.floor(columns));
  const avail = Math.max(0, Math.floor(available));
  if (!fillRows || cols <= 1) return Math.min(d, avail);
  // Round the target up to a full row.
  const rounded = Math.ceil(d / cols) * cols;
  // Only grow up to what's actually available; if fewer remain, show the remainder.
  return Math.min(rounded, avail);
}

/**
 * Resolve the active column count for the CURRENT viewport width using the same
 * breakpoints as the CSS (mobile <640, tablet 640–1023, desktop 1024–1535,
 * large 1536+). Used by fill-rows math so the batch matches what the grid renders.
 * In auto mode columns are derived from width ÷ min card width.
 */
export function resolveActiveColumns(
  cfg: CatalogGridConfig | null | undefined,
  viewportWidth: number,
): number {
  const mode: CatalogColumnsMode = cfg?.mode === 'auto' ? 'auto' : 'manual';
  const m = clampMobile(num(cfg?.mobile, 2));
  const t = clampTablet(num(cfg?.tablet, 3));
  const d = clampDesktop(num(cfg?.desktop, 4));
  const w = clampDesktop(num(cfg?.wide, d));

  if (mode === 'auto') {
    const minM = num(cfg?.minMobile, 160);
    const minT = num(cfg?.minTablet, 200);
    const minD = num(cfg?.minDesktop, 220);
    const min = viewportWidth < 640 ? minM : viewportWidth < 1024 ? minT : minD;
    // Approximate usable width (container minus side padding).
    const usable = Math.max(min, viewportWidth - 48);
    return Math.max(1, Math.floor(usable / min));
  }

  if (viewportWidth < 640) return m;
  if (viewportWidth < 1024) return t;
  if (viewportWidth < 1536) return d;
  return w;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Per-layout AUTO limit (RULE DS24 — each catalog layout has its own limit).
 * ────────────────────────────────────────────────────────────────────────── */

export type LimitMode = 'auto' | 'manual';

export interface LimitConfig {
  /** 'auto' = columns × rows (fills exact rows). 'manual' = exact number. */
  mode?: LimitMode | null;
  /** manual target count (e.g. 8) */
  manual?: number | string | null;
  /** auto rows per device (1–6, default 2) */
  rows?: number | string | null;
}

/**
 * Resolve the base limit (before fill-rows rounding) for a layout.
 * - Auto:   columns × rows  (so 5 cols × 2 rows = 10)
 * - Manual: the exact number the merchant set
 * `columns` is the active column count for the current device/viewport.
 */
export function resolveLimit(cfg: LimitConfig | null | undefined, columns: number, fallbackManual = 8): number {
  const cols = Math.max(1, Math.floor(columns));
  if (cfg?.mode === 'auto') {
    const rows = Math.min(6, Math.max(1, Math.floor(num(cfg?.rows, 2))));
    return cols * rows;
  }
  return Math.max(1, Math.floor(num(cfg?.manual, fallbackManual)));
}

/**
 * Even-fill tile columns (RULE DS24 FIX2): for a known tile COUNT, pick a column
 * count close to the merchant's preference that divides the count evenly so rows
 * fill without a lonely half row (e.g. 6 tiles → 6/3/2, never 4+2). Falls back to
 * the preferred value when no even divisor is near.
 *
 * @param preferred  the device's configured column count
 * @param count      number of tiles to render
 * @param maxCols    hard cap for the device (e.g. 6 desktop, 4 tablet, 3 mobile)
 */
export function evenFillColumns(preferred: number, count: number, maxCols: number): number {
  const pref = Math.max(1, Math.min(maxCols, Math.floor(preferred)));
  const n = Math.max(1, Math.floor(count));
  if (n <= pref) return n; // few tiles → one full row
  // Search outward from the preferred value for a divisor of n within [2, maxCols].
  for (let delta = 0; delta <= maxCols; delta++) {
    const up = pref + delta;
    const down = pref - delta;
    if (up <= maxCols && up >= 2 && n % up === 0) return up;
    if (down >= 2 && down <= maxCols && n % down === 0) return down;
  }
  return pref; // no clean divisor nearby → keep preference
}
