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
}

export default function TrafficGlobe({
  visitorDots = [],
  orderDots = [],
  countries = [],
  height = 320,
  liveCount,
  rangeLabel,
  initialZoom = 2.8,
  initialCenter = [69.3, 30.4],
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
    />
  );
}
