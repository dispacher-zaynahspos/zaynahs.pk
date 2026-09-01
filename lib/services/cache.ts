'use server';

import { revalidateSettings } from '@/lib/revalidate';
import { safeAction } from '@/lib/utils/serverAction';
import { supabaseAdmin } from '@/lib/supabase/admin';

const SETTINGS_ID = '00000000-0000-4000-8000-000000000001';

export const purgeAllCache = async () => {
  return safeAction(
    (async () => {
      // 1. Revalidate Next.js cache (tags & paths)
      await revalidateSettings();
      
      const vercelTime = new Date().toISOString();
      const { error: vError } = await supabaseAdmin.from('store_settings').update({ last_vercel_purge: vercelTime }).eq('id', SETTINGS_ID);
      if (vError) console.error('Vercel time save error:', vError);


      // 2. Perform real Cloudflare purge and capture response
      const multiStoreConfigStr = process.env.MULTI_STORE_CLOUDFLARE_CONFIG;
      let cfConfigs = [];

      if (multiStoreConfigStr) {
        try {
          const isBase64 = !multiStoreConfigStr.startsWith('[');
          const decodedStr = isBase64 ? Buffer.from(multiStoreConfigStr, 'base64').toString('utf-8') : multiStoreConfigStr;
          cfConfigs = JSON.parse(decodedStr);
        } catch (e) {
          console.warn('Failed to parse MULTI_STORE_CLOUDFLARE_CONFIG', e);
        }
      }

      // Fallback to single store if multi-store config is missing
      if (cfConfigs.length === 0) {
        if (process.env.CLOUDFLARE_ZONE_ID && process.env.CLOUDFLARE_API_TOKEN) {
          cfConfigs.push({
            zoneId: process.env.CLOUDFLARE_ZONE_ID,
            apiToken: process.env.CLOUDFLARE_API_TOKEN,
            name: 'Current Store'
          });
        }
      }

      if (cfConfigs.length === 0) {
        throw new Error('Cloudflare credentials missing. Vercel cache cleared, but CDN purge skipped.');
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
        } catch (err: any) {
          errors.push(`[${config.name || config.zoneId}] ${err.message || 'Fetch failed'}`);
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
