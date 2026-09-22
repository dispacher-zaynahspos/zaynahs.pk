/**
 * Responsive Grid Column Helper for E-Commerce Catalog & Grids
 * Maps column counts to Tailwind CSS static classes across Mobile, Tablet, and Desktop.
 */

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
 * Returns Tailwind grid classes for mobile (1-3), tablet (2-4), and desktop (3-8).
 * Defaults: mobile=2, tablet=3, desktop=4.
 */
export function getResponsiveGridClasses(options?: ResponsiveGridOptions): string {
  const m = Number(options?.mobile) || 2;
  const t = Number(options?.tablet) || 3;
  const d = Number(options?.desktop) || 4;

  const mobileCls = MOBILE_COL_MAP[Math.min(3, Math.max(1, m))] || 'grid-cols-2';
  const tabletCls = TABLET_COL_MAP[Math.min(4, Math.max(2, t))] || 'sm:grid-cols-3';
  const desktopCls = DESKTOP_COL_MAP[Math.min(8, Math.max(3, d))] || 'lg:grid-cols-4';

  return `${mobileCls} ${tabletCls} ${desktopCls}`;
}
