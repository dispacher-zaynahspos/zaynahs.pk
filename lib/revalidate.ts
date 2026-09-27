import { getSiteUrl } from '@/lib/site-url-server';
import { notifyGoogleIndexing } from '@/lib/googleIndexing';
import { pingIndexNow } from '@/lib/indexNow';

async function getCacheMethods() {
  if (typeof window !== 'undefined') {
    return {
      revalidateTag: (_tag: string) => {},
      revalidatePath: (_path: string, _type?: 'layout' | 'page') => {},
    };
  }
  try {
    const { revalidateTag, revalidatePath } = await import('next/cache');
    return { revalidateTag, revalidatePath };
  } catch {
    return {
      revalidateTag: (_tag: string) => {},
      revalidatePath: (_path: string, _type?: 'layout' | 'page') => {},
    };
  }
}

async function resolveSiteUrl(): Promise<string> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data } = await supabase
      .from('store_settings')
      .select('store_url')
      .eq('id', '00000000-0000-4000-8000-000000000001')
      .maybeSingle();
    return getSiteUrl({ store_url: data?.store_url });
  } catch (e) {
    console.warn('Failed to resolve dynamic siteUrl:', e);
  }
  return getSiteUrl();
}

async function purgeCloudflareEverything() {
  const multiStoreConfigStr = process.env.MULTI_STORE_CLOUDFLARE_CONFIG;
  let cfConfigs: Array<{ zoneId: string; apiToken: string; name?: string }> = [];

  if (multiStoreConfigStr) {
    try {
      const isBase64 = !multiStoreConfigStr.startsWith('[');
      const decodedStr = isBase64 ? Buffer.from(multiStoreConfigStr, 'base64').toString('utf-8') : multiStoreConfigStr;
      cfConfigs = JSON.parse(decodedStr);
    } catch (e) {
      console.warn('Failed to parse MULTI_STORE_CLOUDFLARE_CONFIG', e);
    }
  }

  if (cfConfigs.length === 0) {
    const zone = process.env.CLOUDFLARE_ZONE_ID;
    const token = process.env.CLOUDFLARE_API_TOKEN;
    if (zone && token) {
      cfConfigs.push({ zoneId: zone, apiToken: token, name: 'Current Store' });
    }
  }

  if (cfConfigs.length === 0) {
    console.warn('Cloudflare credentials missing. Skipping complete cache purge.');
    return;
  }

  for (const cfg of cfConfigs) {
    try {
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${cfg.zoneId}/purge_cache`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cfg.apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ purge_everything: true }),
        }
      );

      const data = await res.json();
      if (!res.ok || !data.success) {
        console.error(`Failed to purge Cloudflare for ${cfg.name || cfg.zoneId}:`, data);
      } else {
        console.log(`Successfully purged Cloudflare for ${cfg.name || cfg.zoneId}`);
      }
    } catch (error) {
      console.error(`Error purging Cloudflare for ${cfg.name || cfg.zoneId}:`, error);
    }
  }
}

export async function revalidateProduct(slug: string, action: 'UPDATED' | 'DELETED' = 'UPDATED') {
  try {
    const { revalidateTag, revalidatePath } = await getCacheMethods();
    (revalidateTag as any)(`product-${slug}`);
    (revalidateTag as any)('products');
    (revalidateTag as any)('homepage');
    (revalidateTag as any)('reviews');

    revalidatePath('/');
    (revalidatePath as any)('/', 'page');
    (revalidatePath as any)('/', 'layout');
    (revalidatePath as any)('/(store)', 'layout');
    (revalidatePath as any)('/(store)', 'page');
    revalidatePath('/shop');
    revalidatePath('/admin', 'layout');
    if (action !== 'DELETED') revalidatePath(`/product/${slug}`);

    await purgeCloudflareEverything();

    // Notify search engines for instant indexing
    const siteUrl = await resolveSiteUrl();
    const productUrl = `${siteUrl}/product/${slug}`;

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

export async function revalidateBanner() {
  try {
    const { revalidateTag, revalidatePath } = await getCacheMethods();
    (revalidateTag as any)('banners');
    (revalidateTag as any)('homepage');
    (revalidateTag as any)('homepage_sections');
    (revalidateTag as any)('products');
    (revalidateTag as any)('verticals');

    // Purge page routing cache
    revalidatePath('/');
    (revalidatePath as any)('/', 'page');
    (revalidatePath as any)('/', 'layout');
    (revalidatePath as any)('/(store)', 'layout');
    (revalidatePath as any)('/(store)', 'page');
    revalidatePath('/shop');
    revalidatePath('/store', 'layout');
    revalidatePath('/admin', 'layout');

    await purgeCloudflareEverything();
    console.log('[revalidate] Banners & homepage revalidated');
  } catch (error) {
    console.error('Error in revalidateBanner:', error);
    throw error;
  }
}

export async function revalidateCategory(slug: string, action: 'UPDATED' | 'DELETED' = 'UPDATED') {
  try {
    const { revalidateTag, revalidatePath } = await getCacheMethods();
    (revalidateTag as any)(`category-${slug}`);
    (revalidateTag as any)('categories');
    (revalidateTag as any)('products');

    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/admin', 'layout');
    if (action !== 'DELETED') revalidatePath(`/category/${slug}`);

    await purgeCloudflareEverything();

    const siteUrl = await resolveSiteUrl();
    const categoryUrl = `${siteUrl}/shop?category=${slug}`;

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
    const { revalidateTag, revalidatePath } = await getCacheMethods();
    (revalidateTag as any)('homepage');
    (revalidateTag as any)('products');
    (revalidateTag as any)('verticals');

    revalidatePath('/');
    (revalidatePath as any)('/', 'page');
    (revalidatePath as any)('/', 'layout');
    (revalidatePath as any)('/(store)', 'layout');
    (revalidatePath as any)('/(store)', 'page');
    revalidatePath('/shop');
    revalidatePath('/store', 'layout');
    revalidatePath('/admin', 'layout');

    await purgeCloudflareEverything();

    const dynamicSiteUrl = await resolveSiteUrl();
    const urls = [
      `${dynamicSiteUrl}/`,
      `${dynamicSiteUrl}/shop`,
      `${dynamicSiteUrl}/store`,
    ];
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
    (revalidateTag as any)('verticals');
    (revalidateTag as any)('homepage');
    (revalidateTag as any)('products');
    (revalidateTag as any)('homepage_sections');

    revalidatePath('/store');
    revalidatePath(`/store/${slug}`);
    revalidatePath(`/store/${slug}/shop`);
    revalidatePath('/');
    revalidatePath('/admin', 'layout');

    // RULE C9: never rely on URL-based purge (silent mismatch on www / protocol) — full zone purge.
    await purgeCloudflareEverything();
    console.log(`[revalidate] Vertical revalidated: ${slug}`);
  } catch (error) {
    console.error(`Error in revalidateVertical for ${slug}:`, error);
  }
}

export async function revalidateTagSafe(tag: string) {
  try {
    const { revalidateTag } = await getCacheMethods();
    (revalidateTag as any)(tag);
  } catch (error) {
    console.error(`Error in revalidateTagSafe for tag ${tag}:`, error);
  }
}

export async function revalidateSettings() {
  try {
    const { revalidateTag, revalidatePath } = await getCacheMethods();
    (revalidateTag as any)('settings');
    (revalidateTag as any)('homepage');
    (revalidateTag as any)('homepage_sections');
    (revalidateTag as any)('products');
    (revalidateTag as any)('categories');
    (revalidateTag as any)('banners');
    (revalidateTag as any)('verticals');
    (revalidateTag as any)('collections');

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
