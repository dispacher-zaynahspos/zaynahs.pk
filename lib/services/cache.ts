'use server';

import { revalidateSettings, revalidateHomepage, revalidateBanner } from '@/lib/revalidate';
import { safeAction } from '@/lib/utils/serverAction';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { STORE_SETTINGS_ID as SETTINGS_ID } from '@/lib/config/singleton-ids';

export const purgeAllCache = async () => {
  return safeAction(
    (async () => {
      // 1. Revalidate Next.js cache (tags & paths)
      await revalidateSettings();
      await revalidateHomepage();
      await revalidateBanner();
      
      const vercelTime = new Date().toISOString();
      const { error: vError } = await supabaseAdmin.from('store_settings').update({ last_vercel_purge: vercelTime }).eq('id', SETTINGS_ID);
      if (vError) console.error('Vercel time save error:', vError);


      // 2. Perform real Cloudflare purge and capture response
      const cfCtx = (() => {
        try {
          const sym = Symbol.for('__cloudflare-context__');
          return (globalThis as any)[sym];
        } catch {
          return null;
        }
      })();

      const zoneId = (process.env.CLOUDFLARE_ZONE_ID || cfCtx?.env?.CLOUDFLARE_ZONE_ID || '')?.trim();
      const apiToken = (process.env.CLOUDFLARE_API_TOKEN || cfCtx?.env?.CLOUDFLARE_API_TOKEN || '')?.trim();
      const multiStoreConfigStr = process.env.MULTI_STORE_CLOUDFLARE_CONFIG || cfCtx?.env?.MULTI_STORE_CLOUDFLARE_CONFIG;

      let cfConfigs: Array<{ zoneId: string; apiToken: string; name?: string }> = [];

      if (multiStoreConfigStr) {
        try {
          const str = String(multiStoreConfigStr).trim();
          const isBase64 = !str.startsWith('[');
          const decodedStr = isBase64 ? Buffer.from(str, 'base64').toString('utf-8') : str;
          cfConfigs = JSON.parse(decodedStr);
        } catch (e) {
          console.warn('Failed to parse MULTI_STORE_CLOUDFLARE_CONFIG', e);
        }
      }

      // Fallback to single store if multi-store config is missing
      if (cfConfigs.length === 0 && zoneId && apiToken) {
        cfConfigs.push({
          zoneId,
          apiToken,
          name: 'Current Store',
        });
      }

      if (cfConfigs.length === 0) {
        throw new Error('Cloudflare credentials missing. Cache tags refreshed, but CDN purge skipped.');
      }

      const errors = [];
      
      for (const config of cfConfigs) {
        try {
          const res = await fetch(
            `https://api.cloudflare.com/client/v4/zones/${config.zoneId}/purge_cache`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${config.apiToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ purge_everything: true }),
            }
          );

          const data = await res.json();
          if (!res.ok || !data.success) {
            const errorMsg = data.errors?.[0]?.message || 'Unknown Cloudflare API Error';
            errors.push(`[${config.name || config.zoneId}] ${errorMsg}`);
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Fetch failed';
          errors.push(`[${config.name || config.zoneId}] ${msg}`);
        }
      }

      if (errors.length > 0) {
        throw new Error(`Cloudflare purge failed: ${errors.join(', ')}`);
      }

      const cfTime = new Date().toISOString();
      const { error: cError } = await supabaseAdmin.from('store_settings').update({ last_cloudflare_purge: cfTime }).eq('id', SETTINGS_ID);
      if (cError) console.error('CF time save error:', cError);

      return { success: true, vercelTime, cfTime };
    })()
  );
};
