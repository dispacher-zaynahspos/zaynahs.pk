'use client';

import React from 'react';
import TrafficWorldMap, { Dot, CountryData } from '@/components/admin/shared/TrafficWorldMap';

interface TrafficGlobeProps {
  visitorDots: Dot[];
  orderDots: Dot[];
  countries?: CountryData[];
  height?: number | string;
  liveCount?: number;
  rangeLabel?: string;
  initialZoom?: number;
  initialCenter?: [number, number];
  focusTarget?: { city: string; lat: number; lng: number; zoom?: number; timestamp: number } | null;
}

export default function TrafficGlobe({
  visitorDots = [],
  orderDots = [],
  countries = [],
  height = 320,
  liveCount,
  rangeLabel,
  initialZoom = 5.0,
  initialCenter = [71.8, 30.8],
  focusTarget,
}: TrafficGlobeProps) {
  return (
    <TrafficWorldMap
      visitorDots={visitorDots}
      orderDots={orderDots}
      countries={countries}
      height={height}
      showControls={true}
      initialZoom={initialZoom}
      initialCenter={initialCenter}
      liveCount={liveCount}
      rangeLabel={rangeLabel}
      focusTarget={focusTarget}
    />
  );
}
