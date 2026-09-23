import { NextRequest, NextResponse } from 'next/server';
import { revalidateSettings, revalidateHomepage, revalidateBanner } from '@/lib/revalidate';
import { purgeAllCache } from '@/lib/services/cache';
import { createClient } from '@/lib/supabase/server';

/**
 * POST endpoint for cache purge when Customizer is saved or triggered from Admin.
 * Secured via Supabase session auth, REVALIDATE_SECRET header, or admin cookie/referer check.
 */
export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get('x-revalidate-secret');
    const hasValidSecret = secret && secret === process.env.REVALIDATE_SECRET;

    if (!hasValidSecret) {
      // Check admin session via Supabase Auth
      try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          // Check if referer is /admin or internal
          const referer = req.headers.get('referer') || '';
          const origin = req.headers.get('origin') || '';
          const isFromAdmin = referer.includes('/admin') || origin.includes('localhost') || origin.includes('vercel.app');
          if (!isFromAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }
        }
      } catch (authErr) {
        console.warn('[Revalidate Customizer] Auth check warn:', authErr);
      }
    }

    console.log('[Revalidate Customizer] Purge triggered from Admin/Customizer');
    
    // 1. Revalidate Next.js ISR & tags
    await revalidateHomepage();
    await revalidateBanner();
    await revalidateSettings();

    // 2. Perform Cloudflare Edge purge
    try {
      await purgeAllCache();
    } catch (cfErr) {
      console.warn('[Revalidate Customizer] Cloudflare purge non-fatal error:', cfErr);
    }
    
    return NextResponse.json({ success: true, message: 'Cloudflare and Next.js cache purged successfully' });
  } catch (error: any) {
    console.error('[Revalidate Customizer] Error purging cache:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
