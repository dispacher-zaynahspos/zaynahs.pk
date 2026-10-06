import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { normalizeCity } from '@/lib/utils/normalizeCity';

/**
 * GET /api/admin/traffic — first-party traffic analytics (admin only).
 *
 * SINGLE SOURCE OF TRUTH: reads real page-view rows written by /api/track and
 * aggregated in Postgres via get_traffic_stats(start, end). No Cloudflare
 * estimates, no synthesized cities.
 *
 * Ranges (all computed against the SAME table, so a custom range is just two
 * dates): 1h · 24h · 7d · 30d · 90d  OR  ?start=YYYY-MM-DD&end=YYYY-MM-DD
 * for any custom window up to the 90-day retention horizon.
 */
export const dynamic = 'force-dynamic';

const COUNTRY_NAMES: Record<string, string> = {
  PK: 'Pakistan', AE: 'United Arab Emirates', SA: 'Saudi Arabia',
  US: 'United States', GB: 'United Kingdom', CA: 'Canada', AU: 'Australia',
  IN: 'India', BD: 'Bangladesh', LK: 'Sri Lanka', NP: 'Nepal', CN: 'China',
  MY: 'Malaysia', SG: 'Singapore', ID: 'Indonesia', PH: 'Philippines',
  DE: 'Germany', FR: 'France', IT: 'Italy', ES: 'Spain', NL: 'Netherlands',
  SE: 'Sweden', NO: 'Norway', DK: 'Denmark', FI: 'Finland', CH: 'Switzerland',
  AT: 'Austria', BE: 'Belgium', IE: 'Ireland', PT: 'Portugal', GR: 'Greece',
  TR: 'Türkiye', QA: 'Qatar', KW: 'Kuwait', BH: 'Bahrain', OM: 'Oman',
  JO: 'Jordan', LB: 'Lebanon', EG: 'Egypt', MA: 'Morocco', NG: 'Nigeria',
  ZA: 'South Africa', KE: 'Kenya', BR: 'Brazil', MX: 'Mexico', AR: 'Argentina',
  RU: 'Russia', JP: 'Japan', KR: 'South Korea', HK: 'Hong Kong', TW: 'Taiwan',
  TH: 'Thailand', VN: 'Vietnam', IL: 'Israel', NZ: 'New Zealand',
};

const RANGE_MS: Record<string, number> = {
  '1h': 3600000,
  '24h': 86400000,
  '7d': 604800000,
  '30d': 2592000000,
  '90d': 7776000000,
};

interface StatsCountry { code: string; visitors: number; pageviews: number }
interface StatsCity { city: string; country: string; visitors: number }

/**
 * Resolve [start, end] from either a named range or explicit custom dates.
 * Custom range is clamped to the last 90 days (our retention window).
 */
function resolveWindow(req: NextRequest): { start: Date; end: Date } {
  const sp = req.nextUrl.searchParams;
  const startParam = sp.get('start');
  const endParam = sp.get('end');

  if (startParam && endParam) {
    const start = new Date(startParam);
    const end = new Date(endParam);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      // include the whole end day
      end.setHours(23, 59, 59, 999);
      const floor = new Date(Date.now() - RANGE_MS['90d']);
      return { start: start < floor ? floor : start, end };
    }
  }

  const range = sp.get('range') || '24h';
  const ms = RANGE_MS[range] || RANGE_MS['24h'];
  return { start: new Date(Date.now() - ms), end: new Date() };
}

async function fetchOrderCities(sinceIso: string) {
  try {
    let { data, error } = await supabaseAdmin
      .from('orders')
      .select('total, created_at, notes')
      .is('deleted_at', null)
      .not('status', 'in', '("cancelled","refunded")')
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      const fallback = await supabaseAdmin
        .from('orders')
        .select('total, created_at, notes')
        .is('deleted_at', null)
        .not('status', 'in', '("cancelled","refunded")')
        .order('created_at', { ascending: false })
        .limit(100);
      data = fallback.data || [];
    }

    const cityMap = new Map<string, { city: string; country: string; orders: number; revenue: number }>();
    for (const row of data || []) {
      const notes: string = row.notes || '';
      let rawCity = '';
      for (const line of notes.split('\n')) {
        if (line.toLowerCase().startsWith('city:')) {
          rawCity = line.substring(5).trim();
          break;
        }
      }
      if (!rawCity) continue;
      const city = normalizeCity(rawCity);
      if (!cityMap.has(city)) cityMap.set(city, { city, country: 'PK', orders: 0, revenue: 0 });
      const entry = cityMap.get(city)!;
      entry.orders++;
      entry.revenue += parseFloat(row.total?.toString() || '0');
    }

    return Array.from(cityMap.values()).sort((a, b) => {
      if (a.city === 'Unknown') return 1;
      if (b.city === 'Unknown') return -1;
      return b.orders - a.orders;
    });
  } catch (err) {
    console.error('[traffic] order cities failed:', err);
    return [];
  }
}

export async function GET(request: NextRequest) {
  const _denied = await requireAdmin(request);
  if (_denied) return _denied;

  try {
    const { start, end } = resolveWindow(request);

    const [{ data: stats, error }, orderCities, liveStats] = await Promise.all([
      supabaseAdmin.rpc('get_traffic_stats', {
        p_start: start.toISOString(),
        p_end: end.toISOString(),
      }),
      fetchOrderCities(start.toISOString()),
      // live = unique visitors in the last 30 minutes
      supabaseAdmin.rpc('get_traffic_stats', {
        p_start: new Date(Date.now() - 1800000).toISOString(),
        p_end: new Date().toISOString(),
      }),
    ]);

    if (error) throw error;

    const s = (stats || {}) as {
      totalPageviews?: number;
      totalVisitors?: number;
      countries?: StatsCountry[];
      cities?: StatsCity[];
    };

    // ── Merge order locations into Countries + Cities (SSOT) ──────────────────
    // A placed order is a real location signal too (a visitor from that
    // city/country). We fold order counts into the visitor aggregates so the
    // Countries/Cities sections populate the moment an order lands — even before
    // any page-view beacon has fired for that location.
    const countryMap = new Map<string, { code: string; visitors: number; pageviews: number }>();
    for (const c of s.countries || []) {
      countryMap.set(c.code, {
        code: c.code,
        visitors: Number(c.visitors || 0),
        pageviews: Number(c.pageviews || 0),
      });
    }

    const cityMap = new Map<string, { city: string; country: string; visitors: number }>();
    for (const c of s.cities || []) {
      const key = `${c.city}|${c.country || 'PK'}`;
      cityMap.set(key, {
        city: c.city,
        country: c.country || 'PK',
        visitors: Number(c.visitors || 0),
      });
    }

    for (const oc of orderCities) {
      if (!oc.city || oc.city === 'Unknown') continue;
      const code = (oc.country || 'PK').toUpperCase();
      const existingCountry = countryMap.get(code);
      if (existingCountry) existingCountry.visitors += oc.orders;
      else countryMap.set(code, { code, visitors: oc.orders, pageviews: 0 });

      const cityKey = `${oc.city}|${code}`;
      const existingCity = cityMap.get(cityKey);
      if (existingCity) existingCity.visitors += oc.orders;
      else cityMap.set(cityKey, { city: oc.city, country: code, visitors: oc.orders });
    }

    const totalVisitors = Number(s.totalVisitors || 0);
    const mergedCountries = Array.from(countryMap.values()).sort((a, b) => b.visitors - a.visitors);
    const totalForPercent = mergedCountries.reduce((sum, c) => sum + c.visitors, 0) || totalVisitors;
    const countries = mergedCountries.map((c) => ({
      code: c.code,
      name: COUNTRY_NAMES[c.code] || c.code,
      visitors: c.visitors,
      pageviews: c.pageviews,
      percent: totalForPercent > 0 ? Math.round((c.visitors / totalForPercent) * 100) : 0,
    }));

    const cities = Array.from(cityMap.values()).sort((a, b) => b.visitors - a.visitors);

    const liveCount = Number((liveStats?.data as { totalVisitors?: number })?.totalVisitors || 0);

    return NextResponse.json({
      liveCount,
      totalVisitors,
      totalPageviews: Number(s.totalPageviews || 0),
      countries,
      cities,
      orderCities,
    });
  } catch (err) {
    console.error('[traffic] API route failed:', err);
    return NextResponse.json({
      liveCount: 0,
      totalVisitors: 0,
      totalPageviews: 0,
      countries: [],
      cities: [],
      orderCities: [],
    });
  }
}
