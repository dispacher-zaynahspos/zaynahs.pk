import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * POST /api/track — first-party page-view beacon.
 *
 * Called once per storefront navigation by <TrafficBeacon>. Writes ONE row to
 * `page_views` (real pageview + unique-visitor + geo). This is the ONLY source
 * of truth for the admin traffic dashboard — no Cloudflare estimates.
 *
 * Geo comes from the edge/CDN request headers (Cloudflare `cf-ipcountry` /
 * `cf-ipcity`, with Vercel `x-vercel-ip-*` as fallback). No IP is ever stored.
 * Fire-and-forget: always returns 204 so it never blocks the visitor.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function header(req: NextRequest, ...keys: string[]): string {
  for (const k of keys) {
    const v = req.headers.get(k);
    if (v) return v;
  }
  return '';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const path = typeof body.path === 'string' ? body.path.slice(0, 512) : '/';
    const visitorId = typeof body.visitorId === 'string' ? body.visitorId.slice(0, 64) : null;
    const referrer = typeof body.referrer === 'string' ? body.referrer.slice(0, 512) : null;

    // Ignore admin / api / internal paths — storefront traffic only.
    if (path.startsWith('/admin') || path.startsWith('/api') || path.startsWith('/_next')) {
      return new NextResponse(null, { status: 204 });
    }

    const country =
      header(req, 'cf-ipcountry', 'x-vercel-ip-country').toUpperCase().slice(0, 2) || null;

    let city =
      header(req, 'cf-ipcity', 'x-vercel-ip-city') || '';
    try {
      city = decodeURIComponent(city);
    } catch {
      /* keep raw */
    }
    city = city.slice(0, 120) || null as unknown as string;

    await supabaseAdmin.from('page_views').insert({
      path,
      country,
      city: city || null,
      visitor_id: visitorId,
      referrer,
    });

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('[track] failed:', err);
    // Never surface errors to the visitor.
    return new NextResponse(null, { status: 204 });
  }
}
