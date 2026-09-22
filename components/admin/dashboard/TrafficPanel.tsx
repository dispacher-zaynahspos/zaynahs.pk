'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Globe, ChevronRight } from '@/components/common/Icons';
import TrafficGlobe from './TrafficGlobe';
import { KNOWN_CITIES } from '@/lib/traffic/cities';

interface TrafficData {
  liveCount: number;
  totalVisitors: number;
  totalPageviews: number;
  countries: { code: string; name: string; visitors: number; percent: number }[];
  cities: { city: string; country: string; visitors: number }[];
  orderCities: { city: string; country: string; orders: number; revenue: number }[];
}

const typeColors: Record<string, string> = {
  pending: 'bg-amber-500',
  confirmed: 'bg-blue-500',
  shipped: 'bg-purple-500',
  delivered: 'bg-emerald-500',
  cancelled: 'bg-red-500',
};

function getCountryFlag(code: string): string {
  if (!code || code.length !== 2) return '';
  return code
    .toUpperCase()
    .split('')
    .map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65))
    .join('');
}

export default function TrafficPanel() {
  const [data, setData] = useState<TrafficData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [range, setRange] = useState<string>('24h');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/traffic?range=${range}`);
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      setData(json);
      setLastUpdated(new Date());
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchData();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Pusher real-time subscription (optional)
    let pusher: any = null;
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (pusherKey && pusherCluster && typeof window !== 'undefined') {
      import('pusher-js').then(({ default: Pusher }) => {
        pusher = new Pusher(pusherKey, { cluster: pusherCluster });
        const channel = pusher.subscribe('traffic-channel');
        channel.bind('traffic-update', (incoming: any) => {
          setData((prev) => prev ? { ...prev, liveCount: incoming.liveCount, totalVisitors: incoming.totalVisitors, totalPageviews: incoming.totalPageviews } : prev);
          setLastUpdated(new Date());
        });
      });
    }

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (pusher) {
        pusher.unsubscribe('traffic-channel');
        pusher.disconnect();
      }
    };
  }, [fetchData]);

  const visitorDotMap = new Map<string, number>();
  if (data) {
    for (const c of data.cities) {
      const coords = KNOWN_CITIES[c.city];
      if (coords) {
        visitorDotMap.set(c.city, (visitorDotMap.get(c.city) || 0) + c.visitors);
      }
    }
  }

  const visitorDots = Array.from(visitorDotMap.entries()).map(([city, count]) => {
    const coords = KNOWN_CITIES[city];
    return { city, lat: coords.lat, lng: coords.lng, count };
  });

  const orderDotMap = new Map<string, number>();
  if (data) {
    for (const oc of data.orderCities) {
      const coords = KNOWN_CITIES[oc.city];
      if (coords) {
        orderDotMap.set(oc.city, (orderDotMap.get(oc.city) || 0) + oc.orders);
      }
    }
  }

  const orderDots = Array.from(orderDotMap.entries()).map(([city, count]) => {
    const coords = KNOWN_CITIES[city];
    return { city, lat: coords.lat, lng: coords.lng, count };
  });

  const topCountry = data?.countries?.[0];

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs p-5">
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 md:p-6 pb-4 border-b border-gray-100 dark:border-gray-800/80 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Globe className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-900 dark:text-white tracking-tight">Live Traffic & Regional Visitors</h3>
            <p className="text-[11px] text-gray-400 font-medium">Real-time visitor distribution across cities and countries</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!error && (
            <span className="flex items-center gap-1.5 text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              ~{Math.max(0, data?.liveCount ?? 0)} online now
            </span>
          )}
          {error && (
            <span className="text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              API offline
            </span>
          )}
          <div className="inline-flex items-center p-0.5 bg-gray-100 dark:bg-gray-800/80 rounded-xl border border-gray-200/80 dark:border-gray-700/60">
            {['1h', '24h', '7d', '30d'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => { setRange(r); setLoading(true); }}
                className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                  range === r
                    ? 'bg-white dark:bg-[#16162a] text-gray-900 dark:text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-5 md:p-6 pb-2">
        <div className="bg-gray-50/70 dark:bg-white/5 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800/80">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Total Visitors</span>
          <span className="text-xl font-black text-gray-900 dark:text-white block mt-1">{data?.totalVisitors?.toLocaleString() ?? 0}</span>
        </div>
        <div className="bg-gray-50/70 dark:bg-white/5 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800/80">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Total Pageviews</span>
          <span className="text-xl font-black text-gray-900 dark:text-white block mt-1">{data?.totalPageviews?.toLocaleString() ?? 0}</span>
        </div>
        <div className="bg-gray-50/70 dark:bg-white/5 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800/80">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Leading Region</span>
          {topCountry ? (
            <span className="text-base font-black text-gray-900 dark:text-white block mt-1">
              {getCountryFlag(topCountry.code)} {topCountry.name} ({topCountry.percent}%)
            </span>
          ) : (
            <span className="text-sm font-bold text-gray-400 block mt-1">—</span>
          )}
        </div>
      </div>

      {/* Globe */}
      <TrafficGlobe visitorDots={visitorDots} orderDots={orderDots} countries={data?.countries || []} height={280} />

      {/* Country list */}
      <div className="p-5 md:p-6 pt-2 space-y-2">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-2">Top Country Distribution</span>
        {data?.countries.slice(0, 5).map(c => (
          <div key={c.code} className="flex items-center gap-3 text-xs bg-gray-50/50 dark:bg-white/3 p-2 rounded-xl border border-gray-100/60 dark:border-gray-800/40">
            <span className="text-lg shrink-0">{getCountryFlag(c.code)}</span>
            <span className="font-bold text-gray-900 dark:text-white flex-1 truncate">{c.name}</span>
            <div className="flex-1 h-2 bg-gray-200/70 dark:bg-gray-800 rounded-full overflow-hidden max-w-[120px]">
              <div className="h-full rounded-full bg-indigo-500" style={{ width: `${c.percent}%` }} />
            </div>
            <span className="font-black text-gray-900 dark:text-white w-12 text-right">{c.visitors}</span>
            <span className="text-[11px] font-bold text-gray-400 w-10 text-right">{c.percent}%</span>
          </div>
        ))}
        {(!data?.countries || data.countries.length === 0) && (
          <div className="text-xs text-gray-400 text-center py-4 font-medium">No regional traffic data recorded yet</div>
        )}
      </div>

      {/* Footer link */}
      <div className="px-5 md:px-6 py-3.5 border-t border-gray-100 dark:border-gray-800/80 bg-gray-50/30 dark:bg-white/2 flex items-center justify-between">
        <Link
          href="/admin/traffic"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#e94560] hover:text-[#d33a53] group"
        >
          View Full Traffic Analytics
          <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
        {lastUpdated && (
          <span className="text-[10px] text-gray-400 font-bold">
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}
