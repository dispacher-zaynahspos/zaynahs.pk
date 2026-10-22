import { NextResponse } from 'next/server';
import { pingIndexNow } from '@/lib/indexNow';
import { requireAdmin } from '@/lib/auth/requireAdmin';

/**
 * POST /api/indexnow — admin-only (RULE #16 / SEC1).
 * Called from the admin category manager; never from the public storefront.
 */
export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { urls } = (body ?? {}) as { urls?: unknown };

    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json({ error: 'Missing or invalid urls array' }, { status: 400 });
    }

    // Check if IndexNow is configured before attempting
    const key = process.env.INDEXNOW_API_KEY || '';
    if (!key || key === 'yahan_indexnow_api_key_paste_karo') {
      // Not configured — return success with skip message (not 500)
      return NextResponse.json({ success: false, skipped: true, reason: 'INDEXNOW_API_KEY not configured' });
    }

    const success = await pingIndexNow(urls as string[]);

    if (!success) {
      // IndexNow ping failed but this is non-critical — don't return 500
      return NextResponse.json({ success: false, reason: 'IndexNow ping returned false' });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[IndexNow API] Ping failed:', error);
    // Non-critical SEO feature — never return 500
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Ping failed' });
  }
}
