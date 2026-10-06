'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Projection scale used by <ComposableMap projectionConfig={{ scale }} />.
// Mirrored here so we can compute RELATIVE screen positions for label-collision
// and marker clustering without importing d3-geo (translate is irrelevant for
// relative distances; mercator is a linear scale factor).
const PROJECTION_SCALE = 145;

/** Manual Mercator projection (relative units) — matches react-simple-maps geoMercator. */
function projectMercator(lng: number, lat: number): { x: number; y: number } {
  const clampedLat = Math.max(-85, Math.min(85, lat));
  const lambda = (lng * Math.PI) / 180;
  const phi = (clampedLat * Math.PI) / 180;
  const x = PROJECTION_SCALE * lambda;
  const y = -PROJECTION_SCALE * Math.log(Math.tan(Math.PI / 4 + phi / 2));
  return { x, y };
}

const NAME_ALIASES: Record<string, string> = {
  'United States': 'United States of America',
  'South Korea': 'Republic of Korea',
  Russia: 'Russian Federation',
  Iran: 'Iran (Islamic Republic of)',
  Syria: 'Syrian Arab Republic',
  Vietnam: 'Viet Nam',
  Tanzania: 'United Republic of Tanzania',
  Moldova: 'Republic of Moldova',
  Bolivia: 'Bolivia (Plurinational State of)',
  Venezuela: 'Venezuela (Bolivarian Republic of)',
  Brunei: 'Brunei Darussalam',
  'Ivory Coast': "Côte d'Ivoire",
  'Czech Republic': 'Czechia',
  'East Timor': 'Timor-Leste',
  Palestine: 'Palestine, State of',
  Turkey: 'Türkiye',
  'Cape Verde': 'Cabo Verde',
  'DR Congo': 'Democratic Republic of the Congo',
  'North Korea': "Democratic People's Republic of Korea",
  Myanmar: 'Myanmar',
  Laos: "Lao People's Democratic Republic",
};

export const COUNTRY_CENTROIDS: Record<string, { lat: number; lng: number; label: string }> = {
  PK: { lat: 30.3753, lng: 69.3451, label: 'Pakistan' },
  US: { lat: 37.0902, lng: -95.7129, label: 'United States' },
  GB: { lat: 54.0, lng: -2.436, label: 'United Kingdom' },
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
  /** Initial zoom level (default 1.5). Traffic page passes a higher value to open on cities. */
  initialZoom?: number;
  /** Initial map center [lng, lat] (default Pakistan-region). */
  initialCenter?: [number, number];
  /** Zoom at/above which individual CITY markers replace COUNTRY markers (default 2.6). */
  cityZoomThreshold?: number;
}

const MIN_ZOOM = 0.8;
const MAX_ZOOM = 16;
const CLUSTER_PX = 46; // screen-space radius for grouping nearby markers
const LABEL_H = 14; // approx label box height (screen px)

function resolveCountryName(apiName: string): string {
  return NAME_ALIASES[apiName] || apiName;
}

function getCountryColor(countryName: string, visitors: number, maxVisitors: number): string {
  if (countryName === 'Pakistan' || countryName === 'Türkiye') {
    // keep Pakistan as the home accent
  }
  if (countryName === 'Pakistan') return visitors === 0 ? '#ffedd5' : '#fb923c';
  if (visitors === 0) return '#eef2f7';
  const ratio = maxVisitors > 0 ? visitors / maxVisitors : 0;
  if (ratio < 0.1) return '#dbeafe';
  if (ratio < 0.3) return '#bfdbfe';
  if (ratio < 0.6) return '#93c5fd';
  return '#60a5fa';
}

interface MapPoint {
  id: string;
  city: string;
  lng: number;
  lat: number;
  count: number;
  type: 'visitor' | 'order' | 'country';
  bx: number; // base-projected x (relative units)
  by: number; // base-projected y
}

interface RenderedMarker extends MapPoint {
  members: number; // how many points this bubble represents (>1 = cluster)
}

/** Greedy screen-space clustering: group points whose on-screen distance < CLUSTER_PX. */
function clusterPoints(points: MapPoint[], zoom: number): RenderedMarker[] {
  const sorted = [...points].sort((a, b) => b.count - a.count);
  const used = new Set<string>();
  const clusters: RenderedMarker[] = [];
  for (const seed of sorted) {
    if (used.has(seed.id)) continue;
    used.add(seed.id);
    let count = seed.count;
    let members = 1;
    for (const other of sorted) {
      if (used.has(other.id)) continue;
      const dx = (seed.bx - other.bx) * zoom;
      const dy = (seed.by - other.by) * zoom;
      if (Math.hypot(dx, dy) < CLUSTER_PX) {
        used.add(other.id);
        count += other.count;
        members += 1;
      }
    }
    clusters.push({ ...seed, count, members });
  }
  return clusters;
}

function markerRadius(count: number): number {
  // sqrt scaling → area roughly proportional to count; clamped to a readable range
  return Math.max(6, Math.min(20, 6 + Math.sqrt(count) * 1.6));
}

export default function TrafficWorldMap({
  visitorDots = [],
  orderDots = [],
  countries = [],
  height = 460,
  className = '',
  showControls = true,
  initialZoom = 1.5,
  initialCenter = [69, 28],
  cityZoomThreshold = 2.6,
}: TrafficWorldMapProps) {
  const [tooltip, setTooltip] = useState<{
    title: string;
    subtitle?: string;
    visitors?: number;
    orders?: number;
    percent?: number;
    x: number;
    y: number;
  } | null>(null);
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: initialCenter,
    zoom: initialZoom,
  });

  const countryMap = useMemo(() => {
    const map = new Map<string, CountryData>();
    for (const c of countries) {
      map.set(resolveCountryName(c.name), c);
      map.set(c.code.toUpperCase(), c);
    }
    return map;
  }, [countries]);

  const maxVisitors = useMemo(() => Math.max(...countries.map((c) => c.visitors), 1), [countries]);

  const showCities = position.zoom >= cityZoomThreshold;

  // Build the active point set depending on zoom level (country OR city — never both).
  const activeMarkers = useMemo<RenderedMarker[]>(() => {
    if (!showCities) {
      // COUNTRY-level bubbles only
      const pts: MapPoint[] = [];
      for (const c of countries) {
        if (c.visitors <= 0) continue;
        const centroid = COUNTRY_CENTROIDS[c.code.toUpperCase()];
        if (!centroid) continue;
        const p = projectMercator(centroid.lng, centroid.lat);
        pts.push({
          id: `country-${c.code}`,
          city: centroid.label,
          lng: centroid.lng,
          lat: centroid.lat,
          count: c.visitors,
          type: 'country',
          bx: p.x,
          by: p.y,
        });
      }
      return clusterPoints(pts, position.zoom);
    }

    // CITY-level markers — visitors and orders clustered within their own type.
    const visitorPts: MapPoint[] = visitorDots.map((d, i) => {
      const p = projectMercator(d.lng, d.lat);
      return { id: `v-${d.city}-${i}`, city: d.city, lng: d.lng, lat: d.lat, count: d.count, type: 'visitor', bx: p.x, by: p.y };
    });
    const orderPts: MapPoint[] = orderDots.map((d, i) => {
      const p = projectMercator(d.lng, d.lat);
      return { id: `o-${d.city}-${i}`, city: d.city, lng: d.lng, lat: d.lat, count: d.count, type: 'order', bx: p.x, by: p.y };
    });
    return [...clusterPoints(visitorPts, position.zoom), ...clusterPoints(orderPts, position.zoom)];
  }, [showCities, countries, visitorDots, orderDots, position.zoom]);

  // Label-collision pass (screen space): show labels for the biggest markers that
  // don't overlap already-placed labels; the rest reveal their label on hover.
  const labelVisible = useMemo(() => {
    const sorted = [...activeMarkers].sort((a, b) => b.count - a.count);
    const placed: { x: number; y: number; w: number; h: number }[] = [];
    const show = new Set<string>();
    const intersects = (
      a: { x: number; y: number; w: number; h: number },
      b: { x: number; y: number; w: number; h: number }
    ) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

    for (const m of sorted) {
      const r = markerRadius(m.count);
      const text = m.members > 1 ? `${m.city} +${m.members - 1} (${m.count})` : `${m.city} (${m.count})`;
      const w = text.length * 6.1 + 10;
      const cx = m.bx * position.zoom;
      const cy = m.by * position.zoom;
      const box = { x: cx + r + 4, y: cy - LABEL_H / 2, w, h: LABEL_H };
      if (!placed.some((p) => intersects(p, box))) {
        placed.push(box);
        show.add(m.id);
      }
    }
    return show;
  }, [activeMarkers, position.zoom]);

  const hasData = countries.some((c) => c.visitors > 0) || visitorDots.length > 0 || orderDots.length > 0;

  const handleZoomIn = () =>
    setPosition((p) => ({ ...p, zoom: Math.min(Number((p.zoom * 1.6).toFixed(2)), MAX_ZOOM) }));
  const handleZoomOut = () =>
    setPosition((p) => ({ ...p, zoom: Math.max(Number((p.zoom / 1.6).toFixed(2)), MIN_ZOOM) }));
  const handleReset = () => setPosition({ coordinates: initialCenter, zoom: initialZoom });

  const handleCountryHover = useCallback(
    (geo: { properties: Record<string, unknown> }, evt: React.MouseEvent) => {
      const name = geo.properties.name as string;
      const data = countryMap.get(name);
      if (data && data.visitors > 0) {
        setTooltip({ title: data.name, visitors: data.visitors, percent: data.percent, x: evt.clientX, y: evt.clientY });
      } else if (name === 'Pakistan') {
        setTooltip({ title: 'Pakistan (Home)', visitors: data?.visitors || 0, percent: data?.percent, x: evt.clientX, y: evt.clientY });
      }
    },
    [countryMap]
  );

  const activeTotal = countries.reduce((s, c) => s + c.visitors, 0);

  return (
    <div
      className={`relative w-full overflow-hidden select-none bg-gradient-to-b from-[#eef4fb] to-[#dce9f7] dark:from-[#0b1020] dark:to-[#0f1629] ${className}`}
      style={{ height }}
    >
      {/* Live status badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-white/90 dark:bg-black/60 px-3 py-1.5 rounded-full border border-gray-200/80 dark:border-gray-800 shadow-xs">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
        <span className="text-[11px] font-black text-gray-800 dark:text-gray-200 tracking-tight">Live Traffic Map</span>
        {countries.length > 0 && (
          <span className="text-[10px] font-bold text-gray-400 border-l border-gray-200 dark:border-gray-700 pl-2">
            {activeTotal} Active Visitors
          </span>
        )}
        <span className="text-[9px] font-bold text-gray-400 border-l border-gray-200 dark:border-gray-700 pl-2 uppercase tracking-wide">
          {showCities ? 'City view' : 'Country view'}
        </span>
      </div>

      <ComposableMap projection="geoMercator" projectionConfig={{ scale: PROJECTION_SCALE }} style={{ width: '100%', height: '100%' }}>
        <ZoomableGroup
          center={position.coordinates}
          zoom={position.zoom}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          onMoveEnd={({ coordinates, zoom }) => setPosition({ coordinates, zoom })}
        >
          {/* Country choropleth */}
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
                    strokeWidth={Math.max(0.25, 0.5 / position.zoom)}
                    style={{
                      default: { outline: 'none' },
                      hover: {
                        fill: visitors > 0 || name === 'Pakistan' ? '#f59e0b' : '#cbd5e1',
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

          {/* Markers (country OR city, clustered + collision-aware labels) */}
          {activeMarkers.map((m) => {
            const r = markerRadius(m.count);
            const isCluster = m.members > 1;
            const isOrder = m.type === 'order';
            const core = isOrder ? '#ea580c' : m.type === 'country' ? '#f59e0b' : '#16a34a';
            const ring = isOrder ? '#f97316' : m.type === 'country' ? '#fbbf24' : '#22c55e';
            const labelFill = isOrder ? '#9a3412' : m.type === 'country' ? '#92400e' : '#065f46';
            const showLabel = labelVisible.has(m.id);
            const labelText = isCluster
              ? `${m.city} +${m.members - 1} (${m.count})`
              : `${m.city} (${m.count}${isOrder ? ' orders' : ''})`;

            return (
              <Marker key={m.id} coordinates={[m.lng, m.lat]}>
                {/* counter-scale so markers/labels keep constant screen size at any zoom */}
                <g
                  transform={`scale(${1 / position.zoom})`}
                  style={{ transformOrigin: '0 0' }}
                  className="cursor-pointer"
                  onMouseEnter={(e: React.MouseEvent) =>
                    setTooltip({
                      title: m.city,
                      subtitle: isCluster ? `${m.members} locations` : undefined,
                      ...(isOrder ? { orders: m.count } : { visitors: m.count }),
                      x: e.clientX,
                      y: e.clientY,
                    })
                  }
                  onMouseLeave={() => setTooltip(null)}
                >
                  {/* soft radar pulse (single markers only, keeps clusters calm) */}
                  {!isCluster && <circle r={r * 1.9} fill={ring} opacity={0.22} className="animate-ping" />}
                  <circle r={r * 1.25} fill={ring} opacity={0.28} />
                  <circle r={r} fill={core} stroke="#ffffff" strokeWidth={2} />
                  {isCluster && (
                    <text textAnchor="middle" dy={r * 0.36} fill="#ffffff" fontSize={r * 0.95} fontWeight={900}>
                      {m.count}
                    </text>
                  )}
                  {showLabel && (
                    <text
                      textAnchor="start"
                      dx={r + 5}
                      dy={3.5}
                      fill={labelFill}
                      fontSize={10}
                      fontWeight={800}
                      paintOrder="stroke"
                      stroke="#ffffff"
                      strokeWidth={2.75}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {labelText}
                    </text>
                  )}
                </g>
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>

      {/* Zoom & pan controls */}
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
            title="Reset view"
          >
            ⌖
          </button>
        </div>
      )}

      {/* Empty state */}
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

      {/* Hover tooltip */}
      {tooltip && (
        <div
          className="absolute z-30 pointer-events-none bg-gray-900/95 text-white border border-white/10 rounded-xl shadow-2xl px-3.5 py-2 text-xs whitespace-nowrap animate-in fade-in duration-100"
          style={{ left: tooltip.x + 14, top: tooltip.y - 12 }}
        >
          <div className="font-extrabold text-[13px]">{tooltip.title}</div>
          {tooltip.subtitle && <div className="text-gray-400 text-[10px] font-semibold">{tooltip.subtitle}</div>}
          {tooltip.visitors !== undefined && (
            <div className="text-emerald-400 font-bold mt-0.5">
              {tooltip.visitors} visitors {tooltip.percent ? `(${tooltip.percent}%)` : ''}
            </div>
          )}
          {tooltip.orders !== undefined && <div className="text-amber-400 font-bold mt-0.5">{tooltip.orders} orders</div>}
        </div>
      )}

      {/* Legend & hint */}
      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-3 bg-white/90 dark:bg-black/60 px-3 py-1.5 rounded-xl border border-gray-200/80 dark:border-gray-800 shadow-xs text-[10px] font-bold text-gray-600 dark:text-gray-300">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" /> Visitors
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-xs" /> Orders
        </span>
        <span className="text-gray-400 border-l border-gray-200 dark:border-gray-700 pl-2">
          {showCities ? 'Zoom out for countries' : 'Zoom in for cities'} · scroll / drag
        </span>
      </div>
    </div>
  );
}
