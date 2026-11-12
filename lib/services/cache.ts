'use server';

import {
  revalidateSettings,
  revalidateHomepage,
  revalidateBanner,
  revalidateAllProducts,
  revalidateTagSafe,
  purgeCloudflareEverything,
  revalidateAfterResponse,
} from '@/lib/revalidate';
import { safeAction } from '@/lib/utils/serverAction';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { STORE_SETTINGS_ID as SETTINGS_ID } from '@/lib/config/singleton-ids';

export const purgeAllCache = async () => {
  return safeAction(
    (async () => {
      // 1. Revalidate Next.js cache (all tags & paths)
      await revalidateSettings();
      await revalidateHomepage();
      await revalidateBanner();
      await revalidateAllProducts();
      await revalidateTagSafe('products');
      await revalidateTagSafe('categories');
      await revalidateTagSafe('collections');
      await revalidateTagSafe('reviews');
      await revalidateTagSafe('banners');
      await revalidateTagSafe('homepage_sections');
      await revalidateTagSafe('verticals');
      
      const vercelTime = new Date().toISOString();
      const { error: vError } = await supabaseAdmin.from('store_settings').update({ last_vercel_purge: vercelTime }).eq('id', SETTINGS_ID);
      if (vError) console.error('Vercel time save error:', vError);

      // 2. Perform real Cloudflare purge across all zones
      await purgeCloudflareEverything();

      // 3. Two-pass edge purge: Next.js ISR serves stale HTML while background regenerating.
      // Purge edge a second time 4 seconds later so Cloudflare re-caches the FRESH origin HTML.
      await revalidateAfterResponse(async () => {
        await new Promise((resolve) => setTimeout(resolve, 4000));
        await purgeCloudflareEverything();
      });

      const cfTime = new Date().toISOString();
      const { error: cError } = await supabaseAdmin.from('store_settings').update({ last_cloudflare_purge: cfTime }).eq('id', SETTINGS_ID);
      if (cError) console.error('CF time save error:', cError);

      return { success: true, vercelTime, cfTime };
    })()
  );
};
