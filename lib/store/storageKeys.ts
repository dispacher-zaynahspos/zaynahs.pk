/**
 * Brand-neutral browser storage keys — single source of truth.
 *
 * LEGACY_STORAGE_KEYS are data-migration identifiers only (old brand-prefixed
 * keys written by previous versions). They are read once to migrate existing
 * carts/sessions so no customer loses a cart. New writes always use the
 * neutral keys below.
 */

export const CART_PERSIST_KEY = 'store-cart';
export const CART_SESSION_KEY = 'store_cart_session';

const LEGACY_STORAGE_KEYS: Array<{ current: string; legacy: string }> = [
  { current: CART_PERSIST_KEY, legacy: 'zaynahs-cart' },
  { current: CART_SESSION_KEY, legacy: 'zaynahs_cart_session' },
];

function safeStorage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Copy legacy keys to their neutral names when the neutral key is absent.
 * Safe to call repeatedly; never overwrites newer data.
 */
export function migrateLegacyStorageKeys(): void {
  const storage = safeStorage();
  if (!storage) return;
  try {
    for (const { current, legacy } of LEGACY_STORAGE_KEYS) {
      if (!storage.getItem(current)) {
        const value = storage.getItem(legacy);
        if (value) storage.setItem(current, value);
      }
    }
  } catch {
    // storage disabled or quota exceeded — non-fatal
  }
}
