import { NextRequest, NextResponse } from 'next/server';
import { markCartAsOrdered } from '@/lib/services/abandonedCarts';
import { checkRateLimit, getClientIp, tooManyRequests } from '@/lib/security/abuseProtection';

export async function POST(req: NextRequest) {
  try {
    const rl = checkRateLimit(`cart-ordered:${await getClientIp()}`, { max: 40, windowMs: 60_000 });
    if (!rl.allowed) return tooManyRequests(rl.retryAfter);

    const { sessionId, orderId } = await req.json();
    if (!sessionId || !orderId) {
      return NextResponse.json({ error: 'Missing sessionId or orderId' }, { status: 400 });
    }
    await markCartAsOrdered(sessionId, orderId);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('[abandoned-cart/mark-ordered] failed:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
