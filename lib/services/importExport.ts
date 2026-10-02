import { ExportBundle } from '@/lib/types';

/**
 * Initiates product export for the selected product IDs.
 * Returns the self-contained export bundle.
 */
export const exportProducts = async (productIds: string[]): Promise<ExportBundle> => {
  const res = await fetch('/api/products/export', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ productIds }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `Export API request failed: ${res.statusText}`);
  }

  return res.json();
};

/**
 * Client-driven sequential product import.
 * Completely immune to Vercel/serverless timeouts because each product
 * runs in its own fast ~1-2s atomic request.
 *
 * Hardened against the "stops after ~26-29 products" bug:
 *  - Each /item request has its own AbortController timeout, so a single
 *    hung connection (gateway idle-timeout, stalled image fetch) can NEVER
 *    freeze the whole loop — it fails fast and moves on.
 *  - Transient failures (network error, timeout, HTTP 429/5xx) are retried
 *    with exponential backoff before being marked as failed.
 *  - categoryCache is threaded forward sequentially so category creation
 *    stays de-duplicated across the run.
 */

/** Per-product request ceiling. Set above the server's maxDuration (60s) so a
 *  server-side timeout surfaces as an HTTP error (retryable) rather than the
 *  client aborting first; the abort is the last-resort safety net for a truly
 *  hung TCP connection that never settles. */
const ITEM_REQUEST_TIMEOUT_MS = 90_000;
/** Extra attempts after the first try (so 3 attempts total per product). */
const ITEM_MAX_RETRIES = 2;
/** Base backoff between retries (doubles each attempt). */
const ITEM_RETRY_BASE_DELAY_MS = 1_000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** HTTP statuses that are worth retrying (transient / timeout / rate-limit). */
const isRetryableStatus = (status: number) =>
  status === 408 || status === 425 || status === 429 || status === 500 || status === 502 || status === 503 || status === 504;

interface ImportItemOutcome {
  ok: boolean;
  result?: any;
  error?: string;
}

/** Fires a single /item request with a hard timeout. */
const importOneItemRequest = async (
  product: any,
  strategy: string,
  categoryCache: Record<string, string>,
): Promise<{ res: Response | null; aborted: boolean; networkError?: string }> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ITEM_REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch('/api/products/import/item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product, strategy, categoryCache }),
      signal: controller.signal,
    });
    return { res, aborted: false };
  } catch (err: any) {
    if (err?.name === 'AbortError') return { res: null, aborted: true };
    return { res: null, aborted: false, networkError: err?.message || 'Network error during import' };
  } finally {
    clearTimeout(timer);
  }
};

/** Imports a single product with timeout + retry/backoff resilience. */
const importOneItemResilient = async (
  product: any,
  strategy: string,
  categoryCache: Record<string, string>,
): Promise<ImportItemOutcome> => {
  let lastError = 'Import failed';

  for (let attempt = 0; attempt <= ITEM_MAX_RETRIES; attempt++) {
    const { res, aborted, networkError } = await importOneItemRequest(product, strategy, categoryCache);

    // Timed-out / network-level failure → retryable
    if (!res) {
      lastError = aborted
        ? `Request timed out after ${ITEM_REQUEST_TIMEOUT_MS / 1000}s`
        : networkError || 'Network error during import';
      if (attempt < ITEM_MAX_RETRIES) {
        await sleep(ITEM_RETRY_BASE_DELAY_MS * Math.pow(2, attempt));
        continue;
      }
      return { ok: false, error: lastError };
    }

    if (res.ok) {
      const result = await res.json().catch(() => ({}));
      return { ok: true, result };
    }

    // Non-OK HTTP: retry transient statuses, fail fast on deterministic 4xx
    const errBody = await res.json().catch(() => ({}));
    lastError = errBody.error || `HTTP ${res.status}: Failed to import`;
    if (isRetryableStatus(res.status) && attempt < ITEM_MAX_RETRIES) {
      await sleep(ITEM_RETRY_BASE_DELAY_MS * Math.pow(2, attempt));
      continue;
    }
    return { ok: false, error: lastError };
  }

  return { ok: false, error: lastError };
};

export const importProductsBatchClient = async (
  products: any[],
  strategy: 'skip' | 'overwrite' | 'rename',
  onProgress: (progress: any) => void
): Promise<void> => {
  onProgress({ type: 'start', total: products.length });

  let categoryCache: Record<string, string> = {};

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const outcome = await importOneItemResilient(p, strategy, categoryCache);

    if (outcome.ok) {
      const result = outcome.result || {};
      if (result.categoryCache) {
        categoryCache = { ...categoryCache, ...result.categoryCache };
      }
      onProgress(result);
    } else {
      console.error(`[Import Service] Failed for product ${p?.name} after retries:`, outcome.error);
      onProgress({
        success: false,
        productName: p?.name || `Product #${i + 1}`,
        status: 'error',
        error: outcome.error || 'Import failed',
      });
    }
  }

  // Final cache revalidation
  try {
    await fetch('/api/products/import/finish', { method: 'POST' });
  } catch (revalErr) {
    console.warn('[Import Service] Post-import revalidation error:', revalErr);
  }
};

/**
 * Legacy stream upload (kept for backward compatibility).
 */
export const importProductsStream = async (
  file: File,
  strategy: 'skip' | 'overwrite' | 'rename',
  onProgress: (progress: any) => void
): Promise<void> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('strategy', strategy);

  const res = await fetch('/api/products/import', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `Import API request failed: ${res.statusText}`);
  }

  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error('Readable stream response not supported by browser.');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');

      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          onProgress(parsed);
        } catch (err) {
          console.warn('[Import Service] Failed to parse stream line:', line, err);
        }
      }
    }

    if (buffer.trim()) {
      try {
        const parsed = JSON.parse(buffer);
        onProgress(parsed);
      } catch (err) {
        console.warn('[Import Service] Failed to parse final stream line:', buffer, err);
      }
    }
  } finally {
    reader.releaseLock();
  }
};
