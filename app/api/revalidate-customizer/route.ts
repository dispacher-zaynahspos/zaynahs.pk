import { NextRequest, NextResponse } from 'next/server';
import { revalidateSettings, revalidateHomepage, revalidateBanner } from '@/lib/revalidate';
import { createClient } from '@/lib/supabase/server';

/**
 * POST endpoint for manual cache purge from Admin panel.
 * Secured via Supabase session auth OR REVALIDATE_SECRET header.
 */
export async function POST(req: NextRequest) {
  try {
    // Auth check: either admin session or revalidate secret
    const secret = req.headers.get('x-revalidate-secret');
    const hasValidSecret = secret && secret === process.env.REVALIDATE_SECRET;

    if (!hasValidSecret) {
      // Check admin session
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    console.log('[Revalidate Customizer] Manual cache purge triggered from Admin');
    
    // Call the same revalidation functions that the webhook calls
    await revalidateHomepage();
    await revalidateBanner();
    await revalidateSettings();
    
    return NextResponse.json({ success: true, message: 'Cloudflare and Next.js cache purged successfully' });
  } catch (error: any) {
    console.error('[Revalidate Customizer] Error purging cache:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
