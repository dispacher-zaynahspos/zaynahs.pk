import { NextRequest, NextResponse } from 'next/server';
import { PostExClient } from '@/lib/postex/client';
import { getLatestPostExStatus, mapPostExToFulfillmentStatus } from '@/lib/postex/statusMapper';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
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

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const cn = String(body.trackingNumber || body.cn || '').trim();
  if (!cn) {
    return NextResponse.json({ error: 'Tracking number missing' }, { status: 400 });
  }

  const client = new PostExClient();
  const result = await client.trackSingleOrder(cn);
  return NextResponse.json(result);
}
