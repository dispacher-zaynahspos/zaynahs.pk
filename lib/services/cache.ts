'use server';

import { revalidateSettings } from '@/lib/revalidate';
import { safeAction } from '@/lib/utils/serverAction';

export const purgeAllCache = async () => {
  return safeAction(
    (async () => {
      // 1. Revalidate Next.js cache (tags & paths)
      await revalidateSettings();

      // 2. Perform real Cloudflare purge and capture response
      const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
      const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

      if (!CLOUDFLARE_ZONE_ID || !CLOUDFLARE_API_TOKEN) {
        throw new Error('Cloudflare credentials missing. Vercel cache cleared, but CDN purge skipped.');
      }

      const res = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ purge_everything: true }),
        }
      );

      const data = await res.json();
      if (!res.ok || !data.success) {
        const errorMsg = data.errors?.[0]?.message || 'Unknown Cloudflare API Error';
        throw new Error(`Cloudflare purge failed: ${errorMsg}`);
      }

      return { success: true };
    })()
  );
};
