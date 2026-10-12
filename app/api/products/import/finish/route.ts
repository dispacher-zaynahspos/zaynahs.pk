import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { revalidateTagSafe, revalidateHomepage } from '@/lib/revalidate';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    await revalidateTagSafe('products');
    await revalidateTagSafe('categories');
    await revalidateHomepage();

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.warn('[Import Finish API] Cache purge error:', err);
    const warning = err instanceof Error ? err.message : 'Cache purge error';
    return NextResponse.json({ success: true, warning });
  }
}
