/**
 * SINGLE SOURCE OF TRUTH for widgets shared by the admin Dashboard and Reporting
 * pages (RULE SSOT1). Previously each page had its own near-identical copy of the
 * revenue chart, top-products table and status-breakdown card (DUP6). These are the
 * canonical shared shapes.
 */

/** Revenue/COGS/Profit chart point. `label` is the pre-formatted x-axis label. */
export interface RevenueChartPoint {
  label: string;
  revenue: number;
  cogs: number;
  profit: number;
}

/** Top-selling product row (shared by both pages). */
export interface TopProductRow {
  id: string;
  name: string;
  qty: number;
  sales: number;
  cost: number;
  profit: number;
}

/**
 * Order-status breakdown row. `cost`/`delivery` are OPTIONAL — the Reporting page
 * computes them, the Dashboard does not, so the extra line renders only when present.
 */
export interface StatusBreakdownRow {
  status: string;
  count: number;
  sales: number;
  cost?: number;
  delivery?: number;
}
