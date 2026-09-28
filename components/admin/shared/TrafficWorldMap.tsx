'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const NAME_ALIASES: Record<string, string> = {
  'United States': 'United States of America',
  'South Korea': 'Republic of Korea',
  'Russia': 'Russian Federation',
  'Iran': 'Iran (Islamic Republic of)',
  'Syria': 'Syrian Arab Republic',
  'Vietnam': 'Viet Nam',
  'Tanzania': 'United Republic of Tanzania',
  'Moldova': 'Republic of Moldova',
  'Bolivia': 'Bolivia (Plurinational State of)',
  'Venezuela': 'Venezuela (Bolivarian Republic of)',
  'Brunei': 'Brunei Darussalam',
  'Ivory Coast': "Côte d'Ivoire",
  'Czech Republic': 'Czechia',
  'East Timor': 'Timor-Leste',
  'Palestine': 'Palestine, State of',
  'Turkey': 'Türkiye',
  'Cape Verde': 'Cabo Verde',
  'DR Congo': 'Democratic Republic of the Congo',
  'North Korea': "Democratic People's Republic of Korea",
  'Myanmar': 'Myanmar',
  'Laos': "Lao People's Democratic Republic",
  'Türkiye': 'Turkey',
};

export const COUNTRY_CENTROIDS: Record<string, { lat: number; lng: number; label: string }> = {
  PK: { lat: 30.3753, lng: 69.3451, label: 'Pakistan' },
  US: { lat: 37.0902, lng: -95.7129, label: 'United States' },
  GB: { lat: 55.3781, lng: -3.4360, label: 'United Kingdom' },
  AE: { lat: 23.4241, lng: 53.8478, label: 'UAE' },
  SA: { lat: 23.8859, lng: 45.0792, label: 'Saudi Arabia' },
  CA: { lat: 56.1304, lng: -106.3468, label: 'Canada' },
  AU: { lat: -25.2744, lng: 133.7751, label: 'Australia' },
  IN: { lat: 20.5937, lng: 78.9629, label: 'India' },
  DE: { lat: 51.1657, lng: 10.4515, label: 'Germany' },
  FR: { lat: 46.2276, lng: 2.2137, label: 'France' },
  IT: { lat: 41.8719, lng: 12.5674, label: 'Italy' },
  ES: { lat: 40.4637, lng: -3.7492, label: 'Spain' },
  NL: { lat: 52.1326, lng: 5.2913, label: 'Netherlands' },
  QA: { lat: 25.3548, lng: 51.1839, label: 'Qatar' },
  KW: { lat: 29.3117, lng: 47.4818, label: 'Kuwait' },
  OM: { lat: 21.5126, lng: 55.9233, label: 'Oman' },
  BH: { lat: 26.0667, lng: 50.5577, label: 'Bahrain' },
  MY: { lat: 4.2105, lng: 101.9758, label: 'Malaysia' },
  SG: { lat: 1.3521, lng: 103.8198, label: 'Singapore' },
  TR: { lat: 38.9637, lng: 35.2433, label: 'Turkey' },
};

export interface Dot {
  city: string;
  lat: number;
  lng: number;
  count: number;
  type?: 'visitor' | 'order';
  revenue?: number;
}

export interface CountryData {
  code: string;
  name: string;
  visitors: number;
  percent?: number;
  pageviews?: number;
}

export interface TrafficWorldMapProps {
  visitorDots?: Dot[];
  orderDots?: Dot[];
  countries?: CountryData[];
  height?: number | string;
  className?: string;
  showControls?: boolean;
}

function resolveCountryName(apiName: string): string {
  return NAME_ALIASES[apiName] || apiName;
}

function getCountryColor(countryName: string, visitors: number, maxVisitors: number): string {
  if (countryName === 'Pakistan') {
    return visitors === 0 ? '#fed7aa' : '#ea580c'; // Vibrant orange
  }
  if (visitors === 0) return '#e2e8f0'; // Clean neutral light grey
  const ratio = maxVisitors > 0 ? visitors / maxVisitors : 0;
  if (ratio < 0.1) return '#ffedd5';
  if (ratio < 0.3) return '#fdba74';
  if (ratio < 0.6) return '#fb923c';
  return '#f97316';
}

export default function TrafficWorldMap({
  visitorDots = [],
  orderDots = [],
  countries = [],
  height = 460,
  className = '',
  showControls = true,
}: TrafficWorldMapProps) {
  const [tooltip, setTooltip] = useState<{
    title: string;
    visitors?: number;
    orders?: number;
    percent?: number;
    x: number;
    y: number;
  } | null>(null);
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: [69, 28],
    zoom: 1.5,
  });

  const countryMap = useMemo(() => {
    const map = new Map<string, CountryData>();
    for (const c of countries) {
      map.set(resolveCountryName(c.name), c);
      map.set(c.code.toUpperCase(), c);
    }
    return map;
  }, [countries]);

  const maxVisitors = useMemo(() => {
    return Math.max(...countries.map((c) => c.visitors), 1);
  }, [countries]);

  // Consolidate markers: if city dots exist for a country, don't duplicate with country centroid
  const synthesizedVisitorDots = useMemo(() => {
    const list: Dot[] = [...visitorDots];
    const visitedCities = new Set(visitorDots.map((d) => d.city.toLowerCase()));
    const hasPakistanDots = visitorDots.some(
      (d) =>
        d.city.toLowerCase() === 'pakistan' ||
        (d.lat > 23 && d.lat < 37 && d.lng > 60 && d.lng < 78)
    );

    for (const c of countries) {
      if (c.visitors > 0) {
        if (c.code.toUpperCase() === 'PK' && hasPakistanDots) {
          continue; // Already covered by specific city pins
        }
        const centroid = COUNTRY_CENTROIDS[c.code.toUpperCase()];
        if (centroid && !visitedCities.has(centroid.label.toLowerCase())) {
          list.push({
            city: centroid.label,
            lat: centroid.lat,
            lng: centroid.lng,
            count: c.visitors,
            type: 'visitor',
          });
        }
      }
    }
    return list;
  }, [visitorDots, countries]);

  const hasData = countries.some((c) => c.visitors > 0) || synthesizedVisitorDots.length > 0;

  const handleZoomIn = () =>
    setPosition((p) => ({ ...p, zoom: Math.min(Number((p.zoom * 1.35).toFixed(2)), 8) }));
  const handleZoomOut = () =>
    setPosition((p) => ({ ...p, zoom: Math.max(Number((p.zoom / 1.35).toFixed(2)), 0.8) }));
  const handleReset = () => {
    setPosition({ coordinates: [69, 28], zoom: 1.5 });
  };

  const handleCountryHover = useCallback(
    (geo: { properties: Record<string, unknown> }, evt: React.MouseEvent) => {
      const name = geo.properties.name as string;
      const data = countryMap.get(name);
      if (data && data.visitors > 0) {
        setTooltip({
          title: data.name,
          visitors: data.visitors,
          percent: data.percent,
          x: evt.clientX,
          y: evt.clientY,
        });
      } else if (name === 'Pakistan') {
        setTooltip({
          title: 'Pakistan (Home)',
          visitors: data?.visitors || 0,
          percent: data?.percent,
          x: evt.clientX,
          y: evt.clientY,
        });
      }
    },
    [countryMap]
  );

  return (
    <div
      className={`relative w-full overflow-hidden select-none bg-[#f8fafc] dark:bg-[#0f0f1b] ${className}`}
      style={{ height }}
    >
      {/* 🟢 Live Radar Status Badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-white/90 dark:bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200/80 dark:border-gray-800 shadow-xs">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
        <span className="text-[11px] font-black text-gray-800 dark:text-gray-200 tracking-tight">
          Live Traffic Map
        </span>
        {countries.length > 0 && (
          <span className="text-[10px] font-bold text-gray-400 border-l border-gray-200 dark:border-gray-700 pl-2">
            {countries.reduce((s, c) => s + c.visitors, 0)} Active Visitors
          </span>
        )}
      </div>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 145 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup
          center={position.coordinates}
          zoom={position.zoom}
          minZoom={0.8}
          maxZoom={8}
          onMoveEnd={({ coordinates, zoom }) => setPosition({ coordinates, zoom })}
        >
          {/* Countries layer with heat color */}
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const name = geo.properties.name as string;
                const data = countryMap.get(name);
                const visitors = data?.visitors || 0;
                const fill = getCountryColor(name, visitors, maxVisitors);

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke="#ffffff"
                    strokeWidth={Math.max(0.3, 0.6 / position.zoom)}
                    style={{
                      default: { outline: 'none' },
                      hover: {
                        fill: visitors > 0 || name === 'Pakistan' ? '#ea580c' : '#cbd5e1',
                        outline: 'none',
                        cursor: visitors > 0 || name === 'Pakistan' ? 'pointer' : 'default',
                      },
                      pressed: { outline: 'none' },
                    }}
                    onMouseEnter={(e: React.MouseEvent) => handleCountryHover(geo, e)}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })
            }
          </Geographies>

          {/* 🟢 Visitor Markers (Glowing Pulsing Pins) - Counter-scaled on zoom */}
          {synthesizedVisitorDots.map((dot, i) => {
            const radius = Math.max(4.5, Math.min(8, 3.5 + Math.log2(dot.count + 1) * 0.8));

            return (
              <Marker
                key={`visitor-${dot.city}-${i}`}
                coordinates={[dot.lng, dot.lat]}
              >
                <g
                  transform={`scale(${1 / position.zoom})`}
                  style={{ transformOrigin: '0 0' }}
                  className="cursor-pointer"
                  onMouseEnter={(e: React.MouseEvent) => {
                    setTooltip({
                      title: dot.city,
                      visitors: dot.count,
                      x: e.clientX,
                      y: e.clientY,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {/* Outer animated radar pulse ring */}
                  <circle
                    r={radius * 1.8}
                    fill="#22c55e"
                    opacity={0.3}
                    className="animate-ping"
                  />
                  {/* Secondary halo */}
                  <circle r={radius * 1.3} fill="#22c55e" opacity={0.25} />
                  {/* Core solid marker */}
                  <circle
                    r={radius}
                    fill="#16a34a"
                    stroke="#ffffff"
                    strokeWidth={1.5}
                    className="drop-shadow-xs"
                  />
                  {/* Label text */}
                  <text
                    textAnchor="start"
                    dx={radius + 4}
                    dy={3.5}
                    fill="#0f172a"
                    fontSize={9}
                    fontWeight={800}
                    paintOrder="stroke"
                    stroke="#ffffff"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {dot.city} ({dot.count})
                  </text>
                </g>
              </Marker>
            );
          })}

          {/* 🟠 Order Markers (Orders by City) - Counter-scaled on zoom */}
          {orderDots.map((dot, i) => {
            const radius = Math.max(4.5, Math.min(8, 3.5 + Math.log2(dot.count + 1) * 0.8));

            return (
              <Marker
                key={`order-${dot.city}-${i}`}
                coordinates={[dot.lng, dot.lat]}
              >
                <g
                  transform={`scale(${1 / position.zoom})`}
                  style={{ transformOrigin: '0 0' }}
                  className="cursor-pointer"
                  onMouseEnter={(e: React.MouseEvent) => {
                    setTooltip({
                      title: dot.city,
                      orders: dot.count,
                      x: e.clientX,
                      y: e.clientY,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                >
                  <circle
                    r={radius * 1.8}
                    fill="#f97316"
                    opacity={0.3}
                    className="animate-ping"
                  />
                  <circle r={radius * 1.3} fill="#f97316" opacity={0.25} />
                  <circle
                    r={radius}
                    fill="#ea580c"
                    stroke="#ffffff"
                    strokeWidth={1.5}
                    className="drop-shadow-xs"
                  />
                  <text
                    textAnchor="start"
                    dx={radius + 4}
                    dy={3.5}
                    fill="#9a3412"
                    fontSize={9}
                    fontWeight={800}
                    paintOrder="stroke"
                    stroke="#ffffff"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {dot.city} ({dot.count} orders)
                  </text>
                </g>
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>

      {/* 🔍 Zoom & Pan Controls */}
      {showControls && (
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-8 h-8 flex items-center justify-center bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 font-black text-base cursor-pointer active:scale-95 transition-all"
            title="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-8 h-8 flex items-center justify-center bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 font-black text-base cursor-pointer active:scale-95 transition-all"
            title="Zoom out"
          >
            −
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="w-8 h-8 flex items-center justify-center bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xs text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-bold cursor-pointer active:scale-95 transition-all"
            title="Reset to Pakistan & regional center"
          >
            ⌖
          </button>
        </div>
      )}

      {/* Empty State Overlay */}
      {!hasData && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="bg-white/95 dark:bg-[#16162a]/95 border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-2.5 shadow-lg">
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              Listening for incoming visitor traffic...
            </span>
          </div>
        </div>
      )}

      {/* Floating Hover Tooltip */}
      {tooltip && (
        <div
          className="absolute z-30 pointer-events-none bg-gray-900/95 text-white backdrop-blur-md border border-white/10 rounded-xl shadow-2xl px-3.5 py-2 text-xs whitespace-nowrap animate-in fade-in duration-100"
          style={{ left: tooltip.x + 14, top: tooltip.y - 12 }}
        >
          <div className="font-extrabold text-[13px]">{tooltip.title}</div>
          {tooltip.visitors !== undefined && (
            <div className="text-emerald-400 font-bold mt-0.5">
              {tooltip.visitors} visitors {tooltip.percent ? `(${tooltip.percent}%)` : ''}
            </div>
          )}
          {tooltip.orders !== undefined && (
            <div className="text-amber-400 font-bold mt-0.5">
              {tooltip.orders} orders
            </div>
          )}
        </div>
      )}

      {/* Legend & Hint */}
      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-3 bg-white/90 dark:bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200/80 dark:border-gray-800 shadow-xs text-[10px] font-bold text-gray-600 dark:text-gray-300">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" /> Visitors
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-xs" /> Orders
        </span>
        <span className="text-gray-400 border-l border-gray-200 dark:border-gray-700 pl-2">
          Scroll or drag to explore
        </span>
      </div>
    </div>
  );
}
