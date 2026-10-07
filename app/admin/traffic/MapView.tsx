'use client';

import React from 'react';
import TrafficWorldMap, { Dot, CountryData } from '@/components/admin/shared/TrafficWorldMap';

interface MapViewProps {
  visitorDots: Dot[];
  orderDots: Dot[];
  countries?: CountryData[];
  height?: number | string;
  liveCount?: number;
  rangeLabel?: string;
}

export default function MapView({
  visitorDots = [],
  orderDots = [],
  countries = [],
  height = 500,
  liveCount,
  rangeLabel,
}: MapViewProps) {
  return (
    <TrafficWorldMap
      visitorDots={visitorDots}
      orderDots={orderDots}
      countries={countries}
      height={height}
      showControls={true}
      initialZoom={4.5}
      initialCenter={[69.3, 30.4]}
      liveCount={liveCount}
      rangeLabel={rangeLabel}
    />
  );
}
