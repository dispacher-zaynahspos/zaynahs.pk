import { mapProductToMeta, type MetaCatalogItem } from './mapProduct';
import { getSettings } from '@/lib/services/settings';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Product } from '@/lib/types';

interface MetaBatchRequest {
  method: 'UPDATE' | 'DELETE';
  retailer_id: string;
  data?: MetaCatalogItem;
}

interface MetaSyncLogRow {
  product_id: string;
  status: 'synced' | 'error' | 'skipped';
  action: 'UPDATE' | 'DELETE';
  error?: string;
}

// ---------------------------------------------------------------------------
// In-memory cache — avoids 84k+ repeated DB fetches for near-static data
// ---------------------------------------------------------------------------
const CACHE_TTL_MS = 60 * 60 * 1000; // 60 minutes

let _categoryMapCache: Record<string, string> | null = null;
let _categoryMapCachedAt = 0;

async function getCategoryMap(): Promise<Record<string, string>> {
  if (_categoryMapCache && Date.now() - _categoryMapCachedAt < CACHE_TTL_MS) {
    return _categoryMapCache;
  }
  const { data: mappings } = await supabaseAdmin
    .from('meta_category_mapping')
    .select('store_category_id, meta_category');
  const map: Record<string, string> = {};
  if (mappings) mappings.forEach(m => { map[m.store_category_id] = m.meta_category; });
  _categoryMapCache = map;
  _categoryMapCachedAt = Date.now();
  return map;
}

let _settingsCache: Awaited<ReturnType<typeof getSettings>> | null = null;
let _settingsCachedAt = 0;

async function getCachedSettings() {
  if (_settingsCache && Date.now() - _settingsCachedAt < CACHE_TTL_MS) {
    return _settingsCache;
  }
  _settingsCache = await getSettings();
  _settingsCachedAt = Date.now();
  return _settingsCache;
}

/**
 * Writes sync result to meta_sync_log table ONLY.
 * NEVER writes to products table — avoids infinite webhook loop.
 */
async function logSyncResult(
  productId: string,
  status: 'synced' | 'error' | 'skipped',
  action: 'UPDATE' | 'DELETE',
  error?: string
): Promise<void> {
  try {
    await supabaseAdmin
      .from('meta_sync_log')
      .insert({
        product_id: productId,
        status,
        action,
        error: error ?? null,
      });
  } catch (logErr) {
    // Log failure is non-fatal — don't throw
    console.error('[MetaSync] Failed to write to meta_sync_log:', logErr);
  }
}

/**
 * Queries Meta Graph API for all items currently registered under this product group or standalone retailer ID.
 * This ensures that when variants are changed, regenerated, or deleted, old ghost variants in Meta are cleaned up.
 */
async function getExistingMetaItemsForProduct(
  productId: string,
  catalogId: string,
  accessToken: string,
  apiVersion: string
): Promise<{ retailer_id: string }[]> {
  try {
    const url = `https://graph.facebook.com/${apiVersion}/${catalogId}/products?limit=100&fields=id,retailer_id&filter=${encodeURIComponent(
      JSON.stringify({ retailer_product_group_id: { eq: productId } })
    )}&access_token=${accessToken}`;

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    const items: { retailer_id: string }[] = json?.data || [];

    // Also check for legacy standalone item with retailer_id === productId
    const singleUrl = `https://graph.facebook.com/${apiVersion}/${catalogId}/products?limit=10&fields=id,retailer_id&filter=${encodeURIComponent(
      JSON.stringify({ retailer_id: { eq: productId } })
    )}&access_token=${accessToken}`;

    const singleRes = await fetch(singleUrl, { cache: 'no-store' });
    if (singleRes.ok) {
      const singleJson = await singleRes.json();
      if (singleJson?.data) {
        singleJson.data.forEach((s: { retailer_id: string }) => {
          if (!items.some(i => i.retailer_id === s.retailer_id)) {
            items.push(s);
          }
        });
      }
    }

    return items;
  } catch (err) {
    console.warn(`[MetaSync] Warning: Failed to query existing items for product ${productId}:`, err);
    return [];
  }
}

/**
 * Syncs a single product (including its variants) to Meta Catalog.
 * Results are written to meta_sync_log — NOT to products table.
 */
export async function syncProductToMeta(
  product: Product,
  action: 'UPDATE' | 'DELETE' = 'UPDATE'
): Promise<{ success: boolean; error?: unknown }> {
  try {
    if (process.env.DISABLE_META_SYNC === 'true') {
      console.log('[MetaSync] Meta sync is temporarily disabled via env variable.');
      return { success: true };
    }

    const catalogId = process.env.META_CATALOG_ID;
    const accessToken = process.env.META_ACCESS_TOKEN;
    const apiVersion = process.env.META_GRAPH_API_VERSION || 'v21.0';

    if (!catalogId || !accessToken) {
      const errMsg = 'Meta Catalog ID or Access Token is missing in environment variables.';
      console.warn(`[MetaSync] ${errMsg}`);
      await logSyncResult(product.id, 'error', action, errMsg);
      return { success: false, error: errMsg };
    }

    // 1. Fetch category mapping configuration (cached 60 min)
    const categoryMap = await getCategoryMap();

    // 2. Fetch global shop configuration settings (cached 60 min)
    const settings = await getCachedSettings();
    if (!settings.meta_sync_enabled) {
      console.log('[MetaSync] Meta sync is disabled via store settings.');
      return { success: true, error: 'Meta Catalog Sync is disabled' };
    }

    // 3. Reconcile existing Meta items to guarantee zero ghost variants or stale images survive
    const existingMetaItems = await getExistingMetaItemsForProduct(
      product.id,
      catalogId,
      accessToken,
      apiVersion
    );

    let requests: MetaBatchRequest[] = [];
    const activeVariants = product.variants ? product.variants.filter(v => v.active) : [];

    if (action === 'DELETE' || product.deleted_at || !product.is_active) {
      // Complete cleanup: delete parent item, all current variants, AND any ghost items found in Meta
      const toDeleteRetailerIds = new Set<string>();
      toDeleteRetailerIds.add(product.id);
      activeVariants.forEach(v => toDeleteRetailerIds.add(v.id));
      existingMetaItems.forEach(item => toDeleteRetailerIds.add(item.retailer_id));

      requests = Array.from(toDeleteRetailerIds).map(id => ({
        method: 'DELETE',
        retailer_id: id,
        data: { id } as MetaCatalogItem,
      }));
    } else {
      const mappedItems = mapProductToMeta(product, settings, categoryMap);
      const isVariantProduct = mappedItems.some(item => item.item_group_id === product.id);
      const currentValidIds = new Set(mappedItems.map(item => item.id));

      // CRITICAL ORPHAN & GHOST CLEANUP:
      // Any item currently in Meta for this product that is NOT in current mapped items is deleted.
      // This permanently prevents old images (e.g. Purple tracksuit) from surviving when an article is replaced/edited.
      const cleanupRequests: MetaBatchRequest[] = [];

      existingMetaItems.forEach(item => {
        if (!currentValidIds.has(item.retailer_id)) {
          cleanupRequests.push({
            method: 'DELETE',
            retailer_id: item.retailer_id,
            data: { id: item.retailer_id } as MetaCatalogItem,
          });
        }
      });

      // If product has variants, always ensure the standalone parent item is deleted from Meta
      if (isVariantProduct && !cleanupRequests.some(r => r.retailer_id === product.id)) {
        cleanupRequests.push({
          method: 'DELETE',
          retailer_id: product.id,
          data: { id: product.id } as MetaCatalogItem,
        });
      }

      requests = [
        ...cleanupRequests,
        ...mappedItems.map(item => ({
          method: 'UPDATE' as const,
          retailer_id: item.id,
          data: item,
        })),
      ];
    }

    if (requests.length === 0) {
      await logSyncResult(product.id, 'skipped', action);
      return { success: true };
    }

    // 4. Send API request to Meta Graph API
    // item_type must be at the TOP LEVEL of the batch body — not inside individual item data
    const url = `https://graph.facebook.com/${apiVersion}/${catalogId}/items_batch`;
    const response = await fetch(`${url}?access_token=${accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_type: 'PRODUCT_ITEM', requests })
    });

    const result = await response.json();

    if (result.error) {
      const errDetail = result.error.message || JSON.stringify(result.error);
      console.error('[MetaSync] Graph API error:', errDetail);
      await logSyncResult(product.id, 'error', action, errDetail);
      return { success: false, error: errDetail };
    }

    // ✅ Success — write ONLY to meta_sync_log, NOT to products table
    await logSyncResult(product.id, 'synced', action);
    console.log(`[MetaSync] Product ${product.id} synced successfully.`);
    return { success: true };

  } catch (error: unknown) {
    console.error(`[MetaSync] Failed to sync product ${product.id}:`, error);
    await logSyncResult(product.id, 'error', action, error instanceof Error ? error.message : 'Unknown error occurred during sync.');
    return { success: false, error };
  }
}

/**
 * Performs bulk synchronization of multiple products to Meta in chunks of 50.
 * Results are written to meta_sync_log — NOT to products table.
 */
export async function bulkSyncProductsToMeta(
  products: Product[],
  action: 'UPDATE' | 'DELETE' = 'UPDATE'
): Promise<{ success: boolean; totalSynced: number; errors: string[] }> {
  if (process.env.DISABLE_META_SYNC === 'true') {
    console.log('[MetaSync] Bulk sync is temporarily disabled via env variable.');
    return { success: true, totalSynced: 0, errors: [] };
  }

  const catalogId = process.env.META_CATALOG_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;
  const apiVersion = process.env.META_GRAPH_API_VERSION || 'v21.0';

  if (!catalogId || !accessToken) {
    const errMsg = 'Meta Catalog ID or Access Token is missing in environment variables.';
    return { success: false, totalSynced: 0, errors: [errMsg] };
  }

  try {
    // 1. Fetch category mappings (cached 60 min)
    const categoryMap = await getCategoryMap();

    // 2. Fetch settings (cached 60 min)
    const settings = await getCachedSettings();
    if (!settings.meta_sync_enabled) {
      console.log('[MetaSync] Bulk sync is disabled via store settings.');
      return { success: true, totalSynced: 0, errors: [] };
    }

    // 3. Build all requests + track which productId maps to what
    const allRequests: MetaBatchRequest[] = [];
    const productIdForChunk: string[] = [];
    const errorProductIds = new Set<string>();
    const validationErrors: Record<string, string> = {};

    for (const product of products) {
      try {
        let requests: MetaBatchRequest[] = [];
        const activeVariants = product.variants ? product.variants.filter(v => v.active) : [];

        if (action === 'DELETE' || product.deleted_at || !product.is_active) {
          requests = [
            { method: 'DELETE', retailer_id: product.id, data: { id: product.id } as MetaCatalogItem },
            ...activeVariants.map(v => ({
              method: 'DELETE' as const,
              retailer_id: v.id,
              data: { id: v.id } as MetaCatalogItem,
            })),
          ];
        } else {
          const mappedItems = mapProductToMeta(product, settings, categoryMap);
          const isVariantProduct = mappedItems.some(item => item.item_group_id === product.id);

          const cleanupRequests: MetaBatchRequest[] = isVariantProduct
            ? [{ method: 'DELETE', retailer_id: product.id, data: { id: product.id } as MetaCatalogItem }]
            : [];

          requests = [
            ...cleanupRequests,
            ...mappedItems.map(item => ({
              method: 'UPDATE' as const,
              retailer_id: item.id,
              data: item,
            })),
          ];
        }
        requests.forEach(() => productIdForChunk.push(product.id));
        allRequests.push(...requests);
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Validation failed';
        console.error(`[MetaSync] Skipped product ${product.id} during mapping:`, errMsg);
        errorProductIds.add(product.id);
        validationErrors[product.id] = errMsg;
      }
    }

    if (allRequests.length === 0 && errorProductIds.size === 0) {
      return { success: true, totalSynced: 0, errors: [] };
    }

    // 4. Batch submit in chunks of 50
    const chunkSize = 50;
    const errors: string[] = [];
    let totalSynced = 0;
    const successProductIds = new Set<string>();

    for (let i = 0; i < allRequests.length; i += chunkSize) {
      const chunk = allRequests.slice(i, i + chunkSize);
      const chunkProductIds = productIdForChunk.slice(i, i + chunkSize);

      const url = `https://graph.facebook.com/${apiVersion}/${catalogId}/items_batch`;
      const response = await fetch(`${url}?access_token=${accessToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // item_type must be at the TOP LEVEL of the batch body
        body: JSON.stringify({ item_type: 'PRODUCT_ITEM', requests: chunk })
      });

      const result = await response.json();

      if (result.error) {
        const errMsg = result.error.message || JSON.stringify(result.error);
        errors.push(errMsg);
        chunkProductIds.forEach(id => errorProductIds.add(id));
      } else {
        totalSynced += chunk.length;
        chunkProductIds.forEach(id => successProductIds.add(id));
      }
    }

    // 5. ✅ Write results ONLY to meta_sync_log — NOT to products table
    const logRows: MetaSyncLogRow[] = [];
    successProductIds.forEach(id => {
      // Don't double-log as error
      if (!errorProductIds.has(id)) {
        logRows.push({ product_id: id, status: 'synced', action });
      }
    });
    errorProductIds.forEach(id => {
      const errMsg = validationErrors[id] || errors[0] || 'Unknown error';
      logRows.push({ product_id: id, status: 'error', action, error: errMsg });
    });

    if (logRows.length > 0) {
      await supabaseAdmin.from('meta_sync_log').insert(logRows);
    }

    return { success: errors.length === 0, totalSynced, errors };
  } catch (error: unknown) {
    console.error('[MetaSync] Bulk sync failed:', error);
    return { success: false, totalSynced: 0, errors: [error instanceof Error ? error.message : 'Unknown error'] };
  }
}
