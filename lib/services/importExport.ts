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
 * runs in its own fast ~1-2s atomic request. Never hangs or sleeps.
 */
export const importProductsBatchClient = async (
  products: any[],
  strategy: 'skip' | 'overwrite' | 'rename',
  onProgress: (progress: any) => void
): Promise<void> => {
  onProgress({ type: 'start', total: products.length });

  let categoryCache: Record<string, string> = {};

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    try {
      const res = await fetch('/api/products/import/item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product: p,
          strategy,
          categoryCache,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        onProgress({
          success: false,
          productName: p.name || `Product #${i + 1}`,
          status: 'error',
          error: errBody.error || `HTTP ${res.status}: Failed to import`,
        });
        continue;
      }

      const result = await res.json();
      if (result.categoryCache) {
        categoryCache = { ...categoryCache, ...result.categoryCache };
      }
      onProgress(result);
    } catch (err: any) {
      console.error(`[Import Service] Failed for product ${p.name}:`, err);
      onProgress({
        success: false,
        productName: p.name || `Product #${i + 1}`,
        status: 'error',
        error: err.message || 'Network error during import',
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
