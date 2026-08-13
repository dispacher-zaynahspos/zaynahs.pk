'use server';

import { revalidateSettings } from '@/lib/revalidate';
import { safeAction } from '@/lib/utils/serverAction';

export const purgeAllCache = async () => {
  return safeAction(
    (async () => {
      // 1. Revalidate Next.js cache (tags & paths)
      await revalidateSettings();

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

      return { success: true };
    })()
  );
};
