import { NextRequest, NextResponse } from 'next/server';
import { upsertAbandonedCart } from '@/lib/services/abandonedCarts';
import { checkRateLimit, getClientIp, tooManyRequests } from '@/lib/security/abuseProtection';

/**
 * POST /api/abandoned-cart
 * Called from the client when cart data or checkout contact info changes.
 */
export async function POST(req: NextRequest) {
  try {
    // Abuse shield: 40 upserts / minute / IP (normal cart typing stays well under).
    const rl = checkRateLimit(`cart:${await getClientIp()}`, { max: 40, windowMs: 60_000 });
    if (!rl.allowed) return tooManyRequests(rl.retryAfter);

    const body = await req.json();
    const {
      sessionId,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      customerCity,
      customerApartment,
      customerPostalCode,
      items,
      subtotal,
      currency
    } = body;

    if (!sessionId || !items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Only track if cart has items
    if (items.length === 0) {
      return NextResponse.json({ skipped: true });
    }

    const cart = await upsertAbandonedCart({
      sessionId,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      customerCity,
      customerApartment,
      customerPostalCode,
      items,
      subtotal: subtotal ?? 0,
      currency: currency ?? 'PKR',
    });

    return NextResponse.json({ success: true, cartId: cart.id });
  } catch (err: unknown) {
    console.error('[abandoned-cart] POST failed:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
