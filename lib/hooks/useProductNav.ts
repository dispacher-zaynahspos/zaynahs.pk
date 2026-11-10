'use client';

/**
 * useProductNav — Admin Product Navigation & State Memory System
 * Single Source of Truth (RULE SSOT1 & RULE N1/N5).
 *
 * How it works:
 * 1. Source pages (Products list, Inventory, Category detail) call `saveProductNavContext()`
 *    before navigating to the edit page. This stores ordered product IDs, current page,
 *    search query, filters, scroll position, and the clicked product ID.
 * 2. The edit page calls `getProductNavContext(currentId)` to get prev/next IDs and dynamic back URL.
 * 3. On back navigation, source views call `getAdminNavContext()` to synchronously restore
 *    their exact page, filters, scroll position, and highlight/scroll the last opened product.
 */

const SESSION_KEY = 'product_nav_context';

export interface ProductNavContext {
  ids: string[];              // ordered list of product IDs from the source view
  source: string;             // label e.g. "Products", "Inventory", "Category"
  sourceUrl: string;          // back URL e.g. "/admin/products", "/admin/inventory"
  lastOpenedId?: string;      // product ID that was opened / edited
  page?: number;              // pagination page (e.g. 1, 2, 3)
  pageSize?: number;          // items per page (e.g. 20, 50)
  searchQuery?: string;       // active search term
  selectedCategory?: string;  // active category filter
  sortBy?: string;            // active sort option
  scrollPosition?: number;    // scroll offset of #admin-main-content or window
  timestamp?: number;
}

/** Save navigation context before navigating to edit page */
export function saveProductNavContext(ctx: ProductNavContext): void {
  try {
    const payload = { ...ctx, timestamp: Date.now() };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
    const cleanSource = ctx.sourceUrl.split('?')[0];
    sessionStorage.setItem(`admin_nav_context_${cleanSource}`, JSON.stringify(payload));
  } catch {
    // sessionStorage unavailable (SSR or private mode) — silently ignore
  }
}

/** Update the last opened product ID when traversing Next / Previous in edit mode */
export function updateProductNavContextCurrentId(currentId: string): void {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return;
    const ctx: ProductNavContext = JSON.parse(raw);
    ctx.lastOpenedId = currentId;
    const idx = ctx.ids.indexOf(currentId);
    if (idx !== -1 && ctx.pageSize && ctx.pageSize > 0) {
      ctx.page = Math.floor(idx / ctx.pageSize) + 1;
    }
    saveProductNavContext(ctx);
  } catch {}
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
    if (idx === -1) return { ...empty, source: ctx.source || 'Products', sourceUrl: ctx.sourceUrl || '/admin/products' };
    return {
      prev: idx > 0 ? ctx.ids[idx - 1] : null,
      next: idx < ctx.ids.length - 1 ? ctx.ids[idx + 1] : null,
      source: ctx.source || 'Products',
      sourceUrl: ctx.sourceUrl || '/admin/products',
      position: idx + 1,
      total: ctx.ids.length,
    };
  } catch {
    return empty;
  }
}

/** Retrieve saved context for a specific source view (e.g. '/admin/products' or '/admin/inventory') */
export function getAdminNavContext(sourceUrl: string): ProductNavContext | null {
  try {
    const cleanSource = sourceUrl.split('?')[0];
    const raw = sessionStorage.getItem(`admin_nav_context_${cleanSource}`) || sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const ctx: ProductNavContext = JSON.parse(raw);
    if (ctx.sourceUrl && ctx.sourceUrl.split('?')[0] === cleanSource) {
      return ctx;
    }
    return null;
  } catch {
    return null;
  }
}

/** Clear nav context (e.g. after navigating away) */
export function clearProductNavContext(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {}
}

export function clearAdminNavContext(sourceUrl: string): void {
  try {
    const cleanSource = sourceUrl.split('?')[0];
    sessionStorage.removeItem(`admin_nav_context_${cleanSource}`);
  } catch {}
}
