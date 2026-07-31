'use client';

/**
 * useProductNav — Product Next/Previous Navigation System
 *
 * How it works:
 * 1. Source pages (Products list, Inventory, Category detail) call `saveProductNavContext()`
 *    before navigating to the edit page. This stores the ordered list of product IDs + source label.
 * 2. The edit page calls `getProductNavContext(currentId)` to get prev/next IDs.
 * 3. Context is stored in sessionStorage so it survives page navigation but not browser closes.
 */

const SESSION_KEY = 'product_nav_context';

export interface ProductNavContext {
  ids: string[];       // ordered list of product IDs from the source view
  source: string;      // label e.g. "Products", "Inventory", "Shop" (category name)
  sourceUrl: string;   // back URL e.g. "/admin/products", "/admin/inventory"
}

/** Save navigation context before navigating to edit page */
export function saveProductNavContext(ctx: ProductNavContext): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(ctx));
  } catch {
    // sessionStorage unavailable (SSR or private mode) — silently ignore
  }
}

/** Read saved context and derive prev/next IDs for current product */
export function getProductNavContext(currentId: string): {
  prev: string | null;
  next: string | null;
  source: string;
  sourceUrl: string;
  position: number;
  total: number;
} {
  const empty = { prev: null, next: null, source: 'Products', sourceUrl: '/admin/products', position: 0, total: 0 };
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return empty;
    const ctx: ProductNavContext = JSON.parse(raw);
    const idx = ctx.ids.indexOf(currentId);
    if (idx === -1) return { ...empty, source: ctx.source, sourceUrl: ctx.sourceUrl };
    return {
      prev: idx > 0 ? ctx.ids[idx - 1] : null,
      next: idx < ctx.ids.length - 1 ? ctx.ids[idx + 1] : null,
      source: ctx.source,
      sourceUrl: ctx.sourceUrl,
      position: idx + 1,
      total: ctx.ids.length,
    };
  } catch {
    return empty;
  }
}

/** Clear nav context (e.g. after navigating away from edit page) */
export function clearProductNavContext(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {}
}
