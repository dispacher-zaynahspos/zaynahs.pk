/**
 * Pure (non-server-action) stock-transition guards.
 * Kept OUT of stock-sync.ts because that file is `'use server'` and may only
 * export async Server Actions — exporting these sync helpers from there breaks
 * the build ("Server Actions must be async functions").
 */

const CANCELLATION_STATUSES = new Set<string>(['cancelled', 'refunded']);

/**
 * Guard: returns true if the status transition means stock should be restored.
 * Cancel from any non-cancelled state → restore. Re-cancelling → no-op.
 */
export function shouldRestoreStock(old_status: string, new_status: string): boolean {
  return CANCELLATION_STATUSES.has(new_status) && !CANCELLATION_STATUSES.has(old_status);
}

/**
 * Guard: returns true if the status transition means stock should be re-deducted.
 * Un-cancelling (cancelled → pending/confirmed/etc) → deduct again.
 */
export function shouldDeductStock(old_status: string, new_status: string): boolean {
  return CANCELLATION_STATUSES.has(old_status) && !CANCELLATION_STATUSES.has(new_status);
}
