import { getSiteUrl } from '@/lib/site-url-server';
import { STORE_SETTINGS_ID } from '@/lib/config/singleton-ids';
import { notifyGoogleIndexing } from '@/lib/googleIndexing';
import { pingIndexNow } from '@/lib/indexNow';

type RevalidateTagFn = (tag: string) => void;
type RevalidatePathFn = (path: string, type?: 'layout' | 'page') => void;

async function getCacheMethods(): Promise<{ revalidateTag: RevalidateTagFn; revalidatePath: RevalidatePathFn }> {
  if (typeof window !== 'undefined') {
    return {
      revalidateTag: () => {},
      revalidatePath: () => {},
    };
  }
  try {
    let mod: any;
    try {
      mod = await import('next/cache');
    } catch {
      // In Node ESM runtime Next.js exports next/cache.js
      mod = await import('next/cache.js' as string);
    }
    const safeTag: RevalidateTagFn = (tag: string) => {
      try {
        if (typeof mod?.revalidateTag === 'function') {
          mod.revalidateTag(tag);
        }
      } catch (err) {
        console.warn(`[revalidateTag] Failed for tag ${tag}:`, err);
      }
    };
    const safePath: RevalidatePathFn = (path: string, type?: 'layout' | 'page') => {
      try {
        if (typeof mod?.revalidatePath === 'function') {
          mod.revalidatePath(path, type);
        }
      } catch (err) {
        console.warn(`[revalidatePath] Failed for path ${path}:`, err);
      }
    };
    return {
      revalidateTag: safeTag,
      revalidatePath: safePath,
    };
  } catch {
    return {
      revalidateTag: () => {},
      revalidatePath: () => {},
    };
  }
}

async function resolveSiteUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '').replace(/^http:\/\//, 'https://');
  }
  try {
    const { supabaseAdmin } = await import('@/lib/supabase/admin');
    const { data } = await supabaseAdmin
      .from('store_settings')
      .select('store_url')
      .eq('id', STORE_SETTINGS_ID)
      .maybeSingle();
    if (data?.store_url) return data.store_url.replace(/\/+$/, '').replace(/^http:\/\//, 'https://');
  } catch (e) {
    console.warn('Failed to resolve dynamic siteUrl via admin:', e);
  }
  return getSiteUrl();
}

/**
 * TARGETED PURGE STRATEGY (RULE C9 updated — synced with RULE C10):
 * - Product/category/banner/homepage-section/vertical saves: Next.js revalidateTag/revalidatePath ONLY.
 *   Next.js ISR + stale-while-revalidate ensures CDN freshness — no full CF zone purge needed.
 * - Global/layout-level saves (theme, store settings, storefrontEdge): purgeCloudflareEverything() — every page affected.
 * - Post-deploy + Manual "Purge Cache" button: purgeCloudflareEverything() always.
 * Rationale: full zone purge on every entity save caused unnecessary cache misses site-wide (RULE C10: targeted invalidation).
 */
function getCloudflareConfigs(): Array<{ zoneId: string; apiToken: string; name?: string }> {
  const cfConfigs: Array<{ zoneId: string; apiToken: string; name?: string }> = [];

  // Direct store credentials always take precedence (RULE CRED-ENVBACKUP)
  const zone = process.env.CLOUDFLARE_ZONE_ID?.trim();
  const token = process.env.CLOUDFLARE_API_TOKEN?.trim();
  if (zone && token) {
    cfConfigs.push({ zoneId: zone, apiToken: token, name: 'Current Store' });
  }

  // Fallback to MULTI_STORE_CLOUDFLARE_CONFIG only if direct env vars are absent
  if (cfConfigs.length === 0 && process.env.MULTI_STORE_CLOUDFLARE_CONFIG) {
    try {
      const raw = process.env.MULTI_STORE_CLOUDFLARE_CONFIG.trim();
      let parsed: unknown = null;
      if (raw.startsWith('[')) {
        parsed = JSON.parse(raw);
      } else {
        const decodedStr = Buffer.from(raw, 'base64').toString('utf-8');
        parsed = JSON.parse(decodedStr);
      }
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item && typeof item === 'object' && 'zoneId' in item && 'apiToken' in item) {
            cfConfigs.push(item as { zoneId: string; apiToken: string; name?: string });
          }
        }
      }
    } catch (e) {
      console.warn('Failed to parse MULTI_STORE_CLOUDFLARE_CONFIG', e);
    }
  }

  return cfConfigs;
}

/**
 * Targeted URL purge on Cloudflare edge (RULE C10):
 * Purges ONLY the specified URLs without wiping the rest of the zone or triggering full-site cache misses.
 * Automatically enforces HTTPS and purges both www and non-www variants to eliminate domain/protocol mismatch.
 */
/**
 * Targeted Purge on Cloudflare Edge:
 * Purges specified Cache-Tags AND specific file URLs with automatic retry (up to 3 attempts).
 * Next.js cache has ALREADY been refreshed before this is called.
 */
export async function purgeCloudflareTargeted({
  tags = [],
  urls = [],
  prefixes = [],
}: {
  tags?: string[];
  urls?: string[];
  prefixes?: string[];
}): Promise<void> {
  const cfConfigs = getCloudflareConfigs();
  if (cfConfigs.length === 0) return;

  const targetFiles = new Set<string>();
  for (const rawUrl of urls) {
    if (!rawUrl) continue;
    const httpsUrl = rawUrl.replace(/^http:\/\//, 'https://');
    const withSlash = httpsUrl.endsWith('/') ? httpsUrl : `${httpsUrl}/`;
    const noSlash = httpsUrl.endsWith('/') ? httpsUrl.slice(0, -1) : httpsUrl;

    [withSlash, noSlash].forEach((u) => {
      targetFiles.add(u);
      if (u.includes('://www.')) {
        targetFiles.add(u.replace('://www.', '://'));
      } else {
        targetFiles.add(u.replace('://', '://www.'));
      }
    });
  }

  const fileList = Array.from(targetFiles);
  const cleanTags = Array.from(new Set(tags.filter(Boolean)));
  const cleanPrefixes = Array.from(new Set(prefixes.filter(Boolean)));

  const payload: Record<string, unknown> = {};
  if (fileList.length > 0) payload.files = fileList;
  if (cleanTags.length > 0) payload.tags = cleanTags;
  if (cleanPrefixes.length > 0) payload.prefixes = cleanPrefixes;

  if (Object.keys(payload).length === 0) return;

  for (const cfg of cfConfigs) {
    let attempts = 0;
    const MAX_RETRIES = 3;
    while (attempts < MAX_RETRIES) {
      attempts++;
      try {
        const res = await fetch(
          `https://api.cloudflare.com/client/v4/zones/${cfg.zoneId}/purge_cache`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${cfg.apiToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          }
        );
        const data = await res.json();
        if (res.ok && data.success) {
          console.log(
            `[revalidate] Targeted CF purge succeeded (attempt ${attempts}) on ${cfg.name || cfg.zoneId} (tags: ${cleanTags.length}, files: ${fileList.length})`
          );
          break;
        } else {
          console.error(
            `[revalidate] CF purge error (attempt ${attempts}) on ${cfg.name || cfg.zoneId}:`,
            data.errors || data
          );
          if (attempts < MAX_RETRIES) await new Promise((r) => setTimeout(r, 800 * attempts));
        }
      } catch (err) {
        console.error(
          `[revalidate] CF purge network error (attempt ${attempts}) on ${cfg.name || cfg.zoneId}:`,
          err
        );
        if (attempts < MAX_RETRIES) await new Promise((r) => setTimeout(r, 800 * attempts));
      }
    }
  }
}

export async function purgeCloudflareUrls(urls: string[]): Promise<void> {
  return purgeCloudflareTargeted({ urls });
}

async function purgeCloudflareEverything() {
  const cfConfigs = getCloudflareConfigs();
  if (cfConfigs.length === 0) {
    console.warn('Cloudflare credentials missing. Skipping complete cache purge.');
    return;
  }

  for (const cfg of cfConfigs) {
    let attempts = 0;
    const MAX_RETRIES = 3;
    while (attempts < MAX_RETRIES) {
      attempts++;
      try {
        const res = await fetch(
          `https://api.cloudflare.com/client/v4/zones/${cfg.zoneId}/purge_cache`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${cfg.apiToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ purge_everything: true }),
          }
        );

        const data = await res.json();
        if (res.ok && data.success) {
          console.log(`Successfully purged Cloudflare everything on attempt ${attempts} for ${cfg.name || cfg.zoneId}`);
          break;
        } else {
          console.error(`Failed to purge Cloudflare for ${cfg.name || cfg.zoneId} (attempt ${attempts}):`, data);
          if (attempts < MAX_RETRIES) await new Promise((r) => setTimeout(r, 800 * attempts));
        }
      } catch (error) {
        console.error(`Error purging Cloudflare for ${cfg.name || cfg.zoneId} (attempt ${attempts}):`, error);
        if (attempts < MAX_RETRIES) await new Promise((r) => setTimeout(r, 800 * attempts));
      }
    }
  }
}

export async function revalidateProduct(slug: string, action: 'UPDATED' | 'DELETED' = 'UPDATED') {
  try {
    // 1. Next.js cache refresh FIRST
    const { revalidateTag, revalidatePath } = await getCacheMethods();
    const safeTag = slug.replace(/[^a-zA-Z0-9-_]/g, '_');
    revalidateTag(`product-${slug}`);
    revalidateTag(`product-${safeTag}`);
    revalidateTag('products');
    revalidateTag('homepage');
    revalidateTag('reviews');

    revalidatePath('/');
    revalidatePath('/shop');
    if (action !== 'DELETED') {
      revalidatePath(`/product/${slug}`);
    }

    const siteUrl = await resolveSiteUrl();
    const productUrl = `${siteUrl}/product/${slug}`;

    // 2. Cloudflare targeted purge SECOND (Next.js is already fresh)
    await purgeCloudflareTargeted({
      tags: ['product', 'products', `product-${slug}`],
      urls: [productUrl, `${siteUrl}/`, `${siteUrl}/shop`],
    });

    if (action === 'DELETED') {
      await notifyGoogleIndexing(productUrl, 'URL_DELETED');
    } else {
      await notifyGoogleIndexing(productUrl, 'URL_UPDATED');
    }

    await pingIndexNow([productUrl], siteUrl);
    console.log(`[revalidate] Product ${action}: ${slug}`);
  } catch (error) {
    console.error(`Error in revalidateProduct for ${slug}:`, error);
  }
}

/** Public wrapper so route handlers can schedule a follow-up edge purge. */
export async function purgeAllCloudflareZones(): Promise<void> {
  await purgeCloudflareEverything();
}

/**
 * Fallback for DB triggers that send only `{ type, table }` (no row data).
 */
export async function revalidateAllProducts() {
  try {
    const { revalidateTag, revalidatePath } = await getCacheMethods();
    revalidateTag('products');
    revalidateTag('homepage');
    revalidateTag('reviews');

    revalidatePath('/');
    revalidatePath('/shop');

    await purgeCloudflareTargeted({
      tags: ['products', 'homepage', 'shop'],
    });
    console.log('[revalidate] All product tags refreshed via targeted CF purge');
  } catch (error) {
    console.error('Error in revalidateAllProducts:', error);
  }
}

export async function revalidateBanner() {
  try {
    // 1. Next.js refresh FIRST
    const { revalidateTag, revalidatePath } = await getCacheMethods();
    revalidateTag('banners');
    revalidateTag('homepage');
    revalidateTag('homepage_sections');
    revalidateTag('products');
    revalidateTag('verticals');

    // Purge canonical page routing cache
    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/admin', 'layout');

    const siteUrl = await resolveSiteUrl();

    // 2. Cloudflare targeted purge SECOND
    await purgeCloudflareTargeted({
      tags: ['homepage', 'banners'],
      urls: [`${siteUrl}/`],
    });

    console.log('[revalidate] Banners & homepage revalidated');
  } catch (error) {
    console.error('Error in revalidateBanner:', error);
    throw error;
  }
}

export async function revalidateCategory(slug: string, action: 'UPDATED' | 'DELETED' = 'UPDATED') {
  try {
    // 1. Next.js refresh FIRST
    const { revalidateTag, revalidatePath } = await getCacheMethods();
    revalidateTag(`category-${slug}`);
    revalidateTag('categories');
    revalidateTag('products');

    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/admin', 'layout');
    if (action !== 'DELETED') revalidatePath(`/category/${slug}`);

    const siteUrl = await resolveSiteUrl();
    const categoryUrl = `${siteUrl}/category/${slug}`;

    // 2. Cloudflare targeted purge SECOND
    await purgeCloudflareTargeted({
      tags: ['category', 'categories', `category-${slug}`],
      urls: [categoryUrl, `${siteUrl}/shop`, `${siteUrl}/`],
    });

    if (action === 'DELETED') {
      await notifyGoogleIndexing(categoryUrl, 'URL_DELETED');
    } else {
      await notifyGoogleIndexing(categoryUrl, 'URL_UPDATED');
    }

    await pingIndexNow([categoryUrl], siteUrl);
    console.log(`[revalidate] Category ${action}: ${slug}`);
  } catch (error) {
    console.error(`Error in revalidateCategory for ${slug}:`, error);
  }
}

export async function revalidateHomepage() {
  try {
    // 1. Next.js refresh FIRST
    const { revalidateTag, revalidatePath } = await getCacheMethods();
    revalidateTag('homepage');
    revalidateTag('products');
    revalidateTag('verticals');

    revalidatePath('/');
    revalidatePath('/shop');

    const dynamicSiteUrl = await resolveSiteUrl();
    const urls = [
      `${dynamicSiteUrl}/`,
      `${dynamicSiteUrl}/shop`,
    ];

    // 2. Cloudflare targeted purge SECOND
    await purgeCloudflareTargeted({
      tags: ['homepage', 'banners'],
      urls: [`${dynamicSiteUrl}/`],
    });

    for (const url of urls) {
      await notifyGoogleIndexing(url, 'URL_UPDATED');
    }
    await pingIndexNow(urls, dynamicSiteUrl);
    console.log('[revalidate] Homepage revalidated');
  } catch (error) {
    console.error('Error in revalidateHomepage:', error);
  }
}

export async function revalidateVertical(slug: string) {
  try {
    const { revalidateTag, revalidatePath } = await getCacheMethods();
    revalidateTag('verticals');
    revalidateTag('homepage');
    revalidateTag('products');
    revalidateTag('homepage_sections');

    revalidatePath('/store');
    revalidatePath(`/store/${slug}`);
    revalidatePath(`/store/${slug}/shop`);
    revalidatePath('/');
    revalidatePath('/admin', 'layout');

    // Reliable complete Cloudflare zone purge on vertical save (RULE C10)
    await purgeCloudflareEverything();

    console.log(`[revalidate] Vertical revalidated: ${slug}`);
  } catch (error) {
    console.error(`Error in revalidateVertical for ${slug}:`, error);
  }
}

export async function revalidateTagSafe(tag: string) {
  try {
    const { revalidateTag } = await getCacheMethods();
    revalidateTag(tag);
  } catch (error) {
    console.error(`Error in revalidateTagSafe for tag ${tag}:`, error);
  }
}

/**
 * RULE C10 — storefront-visible ADMIN write invalidation.
 *
 * For admin-initiated writes to storefront-visible domains that don't have a
 * dedicated per-slug revalidator (collections, coupons, badges, size guides,
 * social proof, payment/shipping methods, admin review moderation), this
 * invalidates the given Next.js tags AND runs targeted Cloudflare URL purges —
 * so the change is never left stale at the CDN edge without wiping the whole site.
 */
export async function revalidateStorefrontEdge(...tags: string[]): Promise<void> {
  try {
    const { revalidateTag, revalidatePath } = await getCacheMethods();
    for (const tag of tags) revalidateTag(tag);
    revalidatePath('/', 'layout');
    revalidatePath('/shop');
    revalidatePath('/admin', 'layout');

    // Reliable complete Cloudflare zone purge on storefront-visible admin saves (RULE C10)
    await purgeCloudflareEverything();

    console.log(`[revalidate] Storefront edge purge for tags: ${tags.join(', ')}`);
  } catch (error) {
    console.error(`Error in revalidateStorefrontEdge for tags ${tags.join(', ')}:`, error);
  }
}

export async function revalidateSettings() {
  try {
    const { revalidateTag, revalidatePath } = await getCacheMethods();
    revalidateTag('settings');
    revalidateTag('homepage');
    revalidateTag('homepage_sections');
    revalidateTag('products');
    revalidateTag('categories');
    revalidateTag('banners');
    revalidateTag('verticals');
    revalidateTag('collections');

    // Revalidate the entire site (including layout metadata, favicon, titles)
    revalidatePath('/', 'layout');
    revalidatePath('/admin', 'layout');

    await purgeCloudflareEverything();
    console.log('[revalidate] Settings revalidated + complete Cloudflare cache purged');
  } catch (error) {
    console.error('Error in revalidateSettings:', error);
    throw error;
  }
}

/**
 * RULE C10 — Single shared cache-invalidation entry point.
 * EVERY admin write path (create/update/delete of any entity) should call this so cache
 * invalidation across all layers (Next.js tags/paths + Cloudflare full-zone purge) is
 * guaranteed and consistent — no per-handler custom purge, no manual "Purge Cache" needed.
 *
 * For entities that don't map to a specific domain revalidator, this falls back to a
 * settings-level purge (tags + full Cloudflare zone purge), which is always safe.
 */
export type WriteEntity =
  | 'product'
  | 'category'
  | 'banner'
  | 'homepage'
  | 'vertical'
  | 'settings'
  | string;

export async function revalidateEntity(
  entity: WriteEntity,
  slug?: string,
  action: 'UPDATED' | 'DELETED' = 'UPDATED',
): Promise<void> {
  switch (entity) {
    case 'product':
      if (slug) return void (await revalidateProduct(slug, action));
      break;
    case 'category':
      if (slug) return void (await revalidateCategory(slug, action));
      break;
    case 'banner':
      return void (await revalidateBanner());
    case 'homepage':
      return void (await revalidateHomepage());
    case 'vertical':
      if (slug) return void (await revalidateVertical(slug));
      break;
    case 'settings':
      return void (await revalidateSettings());
  }
  // Fallback for any other table/entity: tag by name (if a matching cache tag exists)
  // + always purge everything so no stale data can leak (RULE C10 / OP2).
  await revalidateTagSafe(entity);
  await revalidateSettings();
}

// Exposed for the emergency "Purge Cache" button only (normal saves must NOT depend on it — RULE C10).
export { purgeCloudflareEverything };

/**
 * Run a cache-invalidation task AFTER the HTTP response is sent, so admin saves
 * return instantly instead of blocking on the (network-bound) full Cloudflare
 * zone purge. Uses Next.js `after()` when in a request scope (reliable on
 * Vercel — the function stays alive for the task); falls back to inline await
 * when called outside a request (scripts, webhooks).
 *
 * Trade-off: the storefront reflects a moment later (once the background purge
 * finishes) instead of after the save's await — but the admin UI no longer hangs.
 */
export async function revalidateAfterResponse(task: () => Promise<void>): Promise<void> {
  try {
    const { after } = await import('next/server');
    after(task);
  } catch {
    await task();
  }
}
