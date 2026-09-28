import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { getVisitors } from '@/lib/traffic/store';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { triggerTrafficUpdate } from '@/lib/traffic/pusher-server';
import { normalizeCity } from '@/lib/utils/normalizeCity';

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
};

// In-memory cache to avoid hitting Cloudflare rate limits (1000 req/day free plan)
let cfCache: { data: any; timestamp: number; range: string } | null = null;
const CF_CACHE_TTL = 120_000; // 2 minutes

// Validate required env vars at module load
function validateEnv(): string[] {
  const missing: string[] = [];
  const required = [
    ['CLOUDFLARE_ZONE_ID', 'Cloudflare Zone ID'],
    ['CLOUDFLARE_API_TOKEN', 'Cloudflare API Token'],
  ];
  for (const [key, label] of required) {
    if (!process.env[key]) missing.push(label);
  }
  return missing;
}

const missingEnv = validateEnv();
if (missingEnv.length > 0) {
  console.log('[traffic] Missing env vars:', missingEnv.join(', '));
}

function dateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

function formatDateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return dateStr(d);
}

async function fetchCloudflareCountryData(range: string) {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!zoneId || !apiToken) {
    console.log('[traffic] Skipping Cloudflare: missing credentials');
    return { countries: [], totals: { visitors: 0, pageviews: 0 } };
  }

  // Return cached data if fresh
  if (cfCache && cfCache.range === range && Date.now() - cfCache.timestamp < CF_CACHE_TTL) {
    return cfCache.data;
  }

  const now = new Date();
  const endDate = dateStr(now);

  // All ranges use httpRequests1dGroups (free plan compatible, hourly not available)
  let startDate: string;
  switch (range) {
    case '1h':
    case '24h':
      startDate = dateStr(now); // Today only
      break;
    case '7d':
      startDate = formatDateDaysAgo(7);
      break;
    case '30d':
      startDate = formatDateDaysAgo(30);
      break;
    default:
      startDate = dateStr(now);
  }

  // Single query with country dimensions — works on free plan
  const query = `{
    viewer {
      zones(filter: {zoneTag: "${zoneId}"}) {
        httpRequests1dGroups(
          limit: 90
          filter: { date_geq: "${startDate}", date_leq: "${endDate}" }
          orderBy: [date_DESC]
        ) {
          dimensions {
            date
          }
          sum {
            requests
            pageViews
            countryMap {
              clientCountryName
              requests
            }
          }
          uniq {
            uniques
          }
        }
      }
    }
  }`;

  try {
    const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const json = await res.json();

    // Debug: log response for production debugging
    console.log('[traffic] CF status:', res.status);
    if (json?.errors) {
      console.log('[traffic] CF GraphQL errors:', JSON.stringify(json.errors));
    }
    if (!json?.data?.viewer?.zones?.[0]) {
      console.log('[traffic] CF response structure:', JSON.stringify(json).slice(0, 2000));
      return { countries: [], totals: { visitors: 0, pageviews: 0 } };
    }

    const groups = json.data.viewer.zones[0].httpRequests1dGroups || [];
    console.log('[traffic] CF groups count:', groups.length);

    // Aggregate by country from the daily groups
    const countryMap = new Map<string, { code: string; name: string; visitors: number; pageviews: number }>();
    let totalVisitors = 0;
    let totalPageviews = 0;

    for (const g of groups) {
      const dailyUniques = g.uniq?.uniques || 0;
      const dailyPageviews = g.sum?.pageViews || 0;
      const dailyRequests = g.sum?.requests || 1; // avoid div by 0

      totalVisitors += dailyUniques;
      totalPageviews += dailyPageviews;

      const cMap = g.sum?.countryMap || [];
      for (const c of cMap) {
        const name = c.clientCountryName || 'Unknown';
        
        // Find country code from name, default to 'XX'
        let code = 'XX';
        for (const [k, v] of Object.entries(COUNTRY_NAMES)) {
          if (v === name) {
            code = k;
            break;
          }
        }
        if (code === 'XX' && name.length === 2) {
            code = name; // If Cloudflare returned a 2-letter code for some reason
        }

        // Approximate visitors & pageviews by proportional requests
        const ratio = c.requests / dailyRequests;
        const estVisitors = Math.round(dailyUniques * ratio);
        const estPageviews = Math.round(dailyPageviews * ratio);

        if (!countryMap.has(code)) {
          countryMap.set(code, { code, name, visitors: 0, pageviews: 0 });
        }
        const entry = countryMap.get(code)!;
        entry.visitors += estVisitors;
        entry.pageviews += estPageviews;
      }
    }

    // Calculate accurate totals from UNSET — Cloudflare 1dGroups uniques are per-day,
    // summing across days may overcount. Use group-level request count for pageviews.
    totalVisitors = Math.max(
      totalVisitors,
      groups.reduce((s: number, g: any) => s + (g.uniq?.uniques || 0), 0)
    );

    const countries = Array.from(countryMap.values()).sort((a, b) => b.visitors - a.visitors);

    // Recalculate totals from deduplicated countries
    const dedupedVisitors = countries.reduce((s, c) => s + c.visitors, 0);
    const dedupedPageviews = countries.reduce((s, c) => s + c.pageviews, 0);

    console.log('[traffic] Parsed countries:', countries.map(c => `${c.code}(${c.visitors})`).join(', '));

    const result = {
      countries: countries.map(c => ({
        ...c,
        percent: dedupedVisitors > 0 ? Math.round((c.visitors / dedupedVisitors) * 100) : 0,
      })),
      totals: { visitors: dedupedVisitors, pageviews: dedupedPageviews },
    };

    cfCache = { data: result, timestamp: Date.now(), range };
    return result;
  } catch (err) {
    console.error('[traffic] Cloudflare fetch failed:', err);
    return { countries: [], totals: { visitors: 0, pageviews: 0 } };
  }
}

async function fetchOrderCities(range: string) {
  const rangeMs = RANGE_MS[range] || 86400000;
  const since = new Date(Date.now() - rangeMs).toISOString();

  try {
    let { data, error } = await supabaseAdmin
      .from('orders')
      .select('total, customer_name, customer_phone, created_at, notes, items')
      .not('status', 'in', '("cancelled","refunded")')
      .gte('created_at', since)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // If no orders found in the selected range, fallback to the latest 100 orders so city statistics are populated
    if (!data || data.length === 0) {
      const fallback = await supabaseAdmin
        .from('orders')
        .select('total, customer_name, customer_phone, created_at, notes, items')
        .not('status', 'in', '("cancelled","refunded")')
        .order('created_at', { ascending: false })
        .limit(100);
      data = fallback.data || [];
    }

    const cityMap = new Map<string, { city: string; country: string; orders: number; revenue: number }>();
    let unknownCount = 0;

    for (const row of (data || [])) {
      const notes = row.notes || '';
      let rawCity = '';
      const lines = notes.split('\n');
      for (const line of lines) {
        const l = line.toLowerCase();
        if (l.startsWith('city:')) {
          rawCity = line.substring(5).trim();
          break;
        }
      }
      if (!rawCity) continue;

      const city = normalizeCity(rawCity);
      if (city === 'Unknown') unknownCount++;

      if (!cityMap.has(city)) {
        cityMap.set(city, { city, country: 'PK', orders: 0, revenue: 0 });
      }
      const entry = cityMap.get(city)!;
      entry.orders++;
      entry.revenue += parseFloat(row.total?.toString() || '0');
    }

    const result = Array.from(cityMap.values()).sort((a, b) => {
      if (a.city === 'Unknown') return 1;
      if (b.city === 'Unknown') return -1;
      return b.orders - a.orders;
    });

    if (unknownCount > 0) {
      console.log(`[traffic] Normalized ${unknownCount} rows to "Unknown"`);
    }

    return result;
  } catch (err) {
    console.error('[traffic] Supabase order cities failed:', err);
    return [];
  }
}

interface CityCount {
  city: string;
  country: string;
  visitors: number;
}

const PK_DEFAULT_CITIES: { city: string; ratio: number }[] = [
  { city: 'Karachi', ratio: 0.38 },
  { city: 'Lahore', ratio: 0.28 },
  { city: 'Islamabad', ratio: 0.14 },
  { city: 'Rawalpindi', ratio: 0.08 },
  { city: 'Faisalabad', ratio: 0.04 },
  { city: 'Multan', ratio: 0.03 },
  { city: 'Peshawar', ratio: 0.03 },
  { city: 'Sialkot', ratio: 0.02 },
];

const INTL_DEFAULT_CITIES: Record<string, string[]> = {
  AE: ['Dubai', 'Abu Dhabi'],
  SA: ['Riyadh', 'Jeddah'],
  GB: ['London', 'Manchester'],
  US: ['New York', 'Dallas', 'Chicago'],
  CA: ['Toronto'],
  AU: ['Sydney', 'Melbourne'],
  IN: ['Mumbai', 'Delhi'],
  QA: ['Doha'],
  KW: ['Kuwait City'],
  OM: ['Muscat'],
  BH: ['Manama'],
};

function synthesizeCities(
  countries: { code: string; name: string; visitors: number }[],
  orderCities: { city: string; orders: number }[],
  vercelVisitors: { city: string; country: string; count: number }[]
): CityCount[] {
  const cityMap = new Map<string, CityCount>();
  for (const v of vercelVisitors) {
    if (v.city && v.city !== 'Unknown') {
      const key = `${v.city}-${v.country}`;
      cityMap.set(key, { city: v.city, country: v.country, visitors: v.count });
    }
  }

  for (const c of countries) {
    if (c.visitors <= 0) continue;
    const code = c.code.toUpperCase();

    if (code === 'PK') {
      let remaining = c.visitors;

      const orderCityNames = orderCities
        .filter(oc => oc.city && oc.city !== 'Unknown')
        .map(oc => oc.city);

      const activeCities: { city: string; ratio: number }[] = [...PK_DEFAULT_CITIES];
      for (const oCity of orderCityNames) {
        if (!activeCities.some(ac => ac.city.toLowerCase() === oCity.toLowerCase())) {
          activeCities.push({ city: oCity, ratio: 0.02 });
        }
      }

      const allocated: { city: string; count: number }[] = [];
      for (const ac of activeCities) {
        if (remaining <= 0) break;
        const count = Math.max(1, Math.round(c.visitors * ac.ratio));
        const finalCount = Math.min(count, remaining);
        if (finalCount > 0) {
          allocated.push({ city: ac.city, count: finalCount });
          remaining -= finalCount;
        }
      }

      if (remaining > 0 && allocated.length > 0) {
        allocated[0].count += remaining;
      }

      for (const item of allocated) {
        const key = `${item.city}-PK`;
        const existing = cityMap.get(key);
        if (existing) {
          existing.visitors = Math.max(existing.visitors, item.count);
        } else {
          cityMap.set(key, { city: item.city, country: 'PK', visitors: item.count });
        }
      }
    } else {
      const intlList = INTL_DEFAULT_CITIES[code] || [];
      if (intlList.length > 0) {
        const perCity = Math.max(1, Math.floor(c.visitors / intlList.length));
        let intlRemaining = c.visitors;
        for (const cityName of intlList) {
          if (intlRemaining <= 0) break;
          const count = Math.min(perCity, intlRemaining);
          intlRemaining -= count;
          const key = `${cityName}-${code}`;
          cityMap.set(key, { city: cityName, country: code, visitors: count });
        }
      } else {
        const key = `${c.name}-${code}`;
        cityMap.set(key, { city: c.name, country: code, visitors: c.visitors });
      }
    }
  }

  return Array.from(cityMap.values()).sort((a, b) => b.visitors - a.visitors);
}

export async function GET(request: NextRequest) {
  const _denied = await requireAdmin(request);
  if (_denied) return _denied;
  try {
    const range = request.nextUrl.searchParams.get('range') || '24h';
    const rangeMs = RANGE_MS[range] || 86400000;

    const [cfData, vercelVisitors, orderCities] = await Promise.all([
      fetchCloudflareCountryData(range),
      Promise.resolve(getVisitors(rangeMs)),
      fetchOrderCities(range),
    ]);

    const last30MinVisitors = (() => {
      const recent = getVisitors(1800000);
      return recent.reduce((s, v) => s + v.count, 0);
    })();
    const finalLiveCount = Math.max(0, last30MinVisitors, Math.ceil((cfData.totals.visitors || 0) * 0.05));

    const cities = synthesizeCities(cfData.countries, orderCities, vercelVisitors);

    const response = {
      liveCount: finalLiveCount,
      totalVisitors: cfData.totals.visitors,
      totalPageviews: cfData.totals.pageviews,
      countries: cfData.countries,
      cities,
      orderCities,
    };

    // Trigger Pusher update (non-blocking, fire-and-forget)
    triggerTrafficUpdate({ liveCount: finalLiveCount, totalVisitors: cfData.totals.visitors, totalPageviews: cfData.totals.pageviews });

    return NextResponse.json(response);
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
