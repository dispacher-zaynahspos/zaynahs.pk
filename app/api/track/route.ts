import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * POST /api/track — first-party page-view beacon.
 *
 * Called once per storefront navigation by <TrafficBeacon>. Writes ONE row to
 * `page_views` (real pageview + unique-visitor + geo). This is the ONLY source
 * of truth for the admin traffic dashboard — no Cloudflare estimates.
 *
 * Only REAL human storefront traffic is recorded:
 *   - Bots / crawlers / monitors (by user-agent) are dropped.
 *   - Admin / api / internal paths are skipped.
 *   - Geo (country ISO-2 + city) comes from the SAME edge request headers
 *     (Cloudflare `cf-ipcountry`/`cf-ipcity`, Vercel `x-vercel-ip-*` fallback),
 *     so country and city always belong to one another. No IP is ever stored.
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

// Known bots, crawlers, previewers and uptime monitors. These are NOT real
// visitors and must never pollute the traffic numbers.
const BOT_UA =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|facebot|embedly|quora|pinterest|whatsapp|telegram|discord|slack|vkshare|preview|monitor|uptime|pingdom|lighthouse|headless|phantom|puppeteer|playwright|curl|wget|python-requests|axios|go-http|java\/|okhttp|scrapy|semrush|ahrefs|mj12|dotbot|petalbot|yandex|baidu|google-|gtmetrix|statuscake|datadog|newrelic/i;

export async function POST(req: NextRequest) {
  try {
    // 1) Drop bots / crawlers / monitors by user-agent (no real human).
    const ua = req.headers.get('user-agent') || '';
    if (!ua || BOT_UA.test(ua)) {
      return new NextResponse(null, { status: 204 });
    }

    const body = await req.json().catch(() => ({}));

    const path = typeof body.path === 'string' ? body.path.slice(0, 512) : '/';
    const visitorId = typeof body.visitorId === 'string' ? body.visitorId.slice(0, 64) : null;
    const referrer = typeof body.referrer === 'string' ? body.referrer.slice(0, 512) : null;

    // 2) Storefront traffic only — skip admin / api / internal paths.
    if (path.startsWith('/admin') || path.startsWith('/api') || path.startsWith('/_next')) {
      return new NextResponse(null, { status: 204 });
    }

    // 3) Geo — country + city from the SAME edge request so they match.
    const country =
      header(req, 'cf-ipcountry', 'x-vercel-ip-country').toUpperCase().slice(0, 2) || null;

    let city = header(req, 'cf-ipcity', 'x-vercel-ip-city') || '';
    try {
      city = decodeURIComponent(city);
    } catch {
      /* keep raw */
    }
    city = city.replace(/\+/g, ' ').trim().slice(0, 120);

    // Ignore placeholder / unknown geo tokens the edge sometimes emits.
    const bad = /^(xx|t1|zz|unknown|null|undefined|localhost)$/i;
    const cleanCountry = country && !bad.test(country) ? country : null;
    const cleanCity = city && !bad.test(city) ? city : null;

    await supabaseAdmin.from('page_views').insert({
      path,
      country: cleanCountry,
      city: cleanCity,
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
