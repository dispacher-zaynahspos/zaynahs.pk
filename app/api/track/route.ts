import { NextRequest, NextResponse } from 'next/server';
import { PostExClient } from '@/lib/postex/client';
import { getLatestPostExStatus, mapPostExToFulfillmentStatus } from '@/lib/postex/statusMapper';
import { checkRateLimit, getClientIp, tooManyRequests } from '@/lib/security/abuseProtection';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

function getHeader(req: NextRequest, ...keys: string[]): string {
  for (const k of keys) {
    const v = req.headers.get(k);
    if (v) return v;
  }
  return '';
}

/**
 * GET /api/track — Courier order tracking lookup (PostEx).
 * Query params: ?cn=<tracking_number> or ?trackingNumber=<tracking_number>
 */
export async function GET(req: NextRequest) {
  // Abuse shield: 60 lookups / minute / IP (protects the PostEx quota).
  const rl = checkRateLimit(`track:${await getClientIp()}`, { max: 60, windowMs: 60_000 });
  if (!rl.allowed) return tooManyRequests(rl.retryAfter);

  const cn = (
    req.nextUrl.searchParams.get('cn') ||
    req.nextUrl.searchParams.get('trackingNumber') ||
    ''
  ).trim();

  if (!cn) {
    return NextResponse.json({ error: 'Tracking number (cn) required' }, { status: 400 });
  }

  try {
    const client = new PostExClient();
    const result = await client.trackSingleOrder(cn);

    if (result.statusCode !== 200 && result.statusCode !== '200') {
      return NextResponse.json(
        { error: result.statusMessage || 'Tracking information not found' },
        {
          status: 404,
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          },
        }
      );
    }

    const rawStatus = getLatestPostExStatus(result.dist);
    const cleanStatus = mapPostExToFulfillmentStatus(rawStatus);

    // Sort timeline descending (latest first)
    const rawTimeline = result.dist?.transactionStatusHistory || [];
    const timeline = [...rawTimeline].sort((a, b) => {
      const timeA = new Date(a.modifiedDatetime || a.createdDatetime || a.datetime || 0).getTime();
      const timeB = new Date(b.modifiedDatetime || b.createdDatetime || b.datetime || 0).getTime();
      return timeB - timeA;
    });

    const isDelivered = cleanStatus === 'DELIVERED';
    const isReturnedOrCancelled = cleanStatus === 'RETURNED' || cleanStatus === 'CANCELLED';
    // Delivered/Returned parcels never change → cache for 24 hours at Cloudflare edge
    // Active parcels → cache for 5 minutes (300s) to prevent spamming PostEx or Vercel
    const cacheHeader = (isDelivered || isReturnedOrCancelled)
      ? 'public, s-maxage=86400, stale-while-revalidate=86400'
      : 'public, s-maxage=300, stale-while-revalidate=600';

    return NextResponse.json(
      {
        ok: true,
        trackingNumber: cn,
        rawStatus,
        cleanStatus,
        timeline,
        recipient: {
          name: result.dist?.customerName,
          phone: result.dist?.customerPhone,
          city: result.dist?.cityName,
          address: result.dist?.deliveryAddress,
        },
        payment: {
          codAmount: result.dist?.invoicePayment,
        },
        courier: {
          name: 'PostEx',
          trackingUrl: `https://postex.pk/tracking?cn=${encodeURIComponent(cn)}`,
        },
        lastSyncedAt: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': cacheHeader,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: unknown) {
    console.error('[API /api/track] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracking details. Please try again later.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/track — Handles TWO paths:
 * 1. First-party Traffic Analytics Beacon (<TrafficBeacon /> sends { path, visitorId, referrer })
 * 2. PostEx order tracking lookup via POST body ({ cn: string } or { trackingNumber: string })
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // ── PATH 1: Traffic Analytics Beacon (Storefront Page Views) ──────────────
    if ('path' in body || 'visitorId' in body) {
      const path = typeof body.path === 'string' ? body.path.slice(0, 512) : '/';
      const visitorId = typeof body.visitorId === 'string' ? body.visitorId.slice(0, 64) : null;
      const referrer = typeof body.referrer === 'string' ? body.referrer.slice(0, 512) : null;

      // Ignore admin / api / internal paths — storefront traffic only (RULE TA2)
      if (path.startsWith('/admin') || path.startsWith('/api') || path.startsWith('/_next')) {
        return new NextResponse(null, { status: 204 });
      }

      const country =
        getHeader(req, 'cf-ipcountry', 'x-vercel-ip-country').toUpperCase().slice(0, 2) || null;

      let city = getHeader(req, 'cf-ipcity', 'x-vercel-ip-city') || '';
      try {
        city = decodeURIComponent(city);
      } catch {
        /* keep raw */
      }
      city = city.slice(0, 120);

      await supabaseAdmin.from('page_views').insert({
        path,
        country: country || null,
        city: city || null,
        visitor_id: visitorId,
        referrer,
      });

      return new NextResponse(null, { status: 204 });
    }

    // ── PATH 2: PostEx Courier Order Tracking ────────────────────────────────
    const cn = String(body.trackingNumber || body.cn || '').trim();
    if (cn) {
      const rl = checkRateLimit(`track:${await getClientIp()}`, { max: 60, windowMs: 60_000 });
      if (!rl.allowed) return tooManyRequests(rl.retryAfter);

      const client = new PostExClient();
      const result = await client.trackSingleOrder(cn);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid tracking payload' }, { status: 400 });
  } catch (err) {
    console.error('[API /api/track POST] Error:', err);
    // Never surface errors to the visitor beacon
    return new NextResponse(null, { status: 204 });
  }
}

