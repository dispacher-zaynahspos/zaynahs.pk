'use client';

import { useEffect, useState } from 'react';
import {
  resolveActiveColumns,
  applyFillRows,
  resolveLimit,
  type CatalogGridConfig,
  type LimitConfig,
} from '@/lib/utils/responsiveGrid';

/**
 * Shared SSOT hook (RULE DS24 — Fill rows + per-layout auto limit).
 * Tracks the live viewport width and returns the number of columns the catalog
 * grid is currently rendering for that width, plus helpers to:
 *  - round a batch / limit up to a full row (fill rows), and
 *  - resolve the per-layout limit (auto = columns × rows, or manual).
 *
 * Used by every catalog grid (shop, home featured, tabbed, flash sale, related,
 * recently viewed, collections) so the math matches what the shared
 * `.catalog-grid` CSS actually renders.
 */
export function useCatalogColumns(cfg: CatalogGridConfig | null | undefined) {
  // Default to a desktop-ish width during SSR / first paint to avoid layout jump.
  const [width, setWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1280,
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setWidth(window.innerWidth));
    };
    onResize();
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const columns = resolveActiveColumns(cfg, width);

  /**
   * Round `desired` up to a full row (capped by `available`) when `fillRows` is on.
   */
  const fill = (desired: number, available: number, fillRows: boolean = true): number =>
    applyFillRows(desired, columns, available, fillRows);

  /**
   * Resolve the layout's base limit (auto = columns × rows, or manual), then round
   * it up to a full row when `fillRows` is on and more products exist.
   */
  const limit = (
    limitCfg: LimitConfig | null | undefined,
    available: number,
    fillRows: boolean = true,
    fallbackManual = 8,
  ): number => {
    const base = resolveLimit(limitCfg, columns, fallbackManual);
    return applyFillRows(base, columns, available, fillRows);
  };

  return { columns, width, fill, limit };
}
