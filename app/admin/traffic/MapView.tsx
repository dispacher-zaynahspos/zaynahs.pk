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
  focusTarget?: { city: string; lat: number; lng: number; zoom?: number; timestamp: number } | null;
}

export default function MapView({
  visitorDots = [],
  orderDots = [],
  countries = [],
  height = 500,
  liveCount,
  rangeLabel,
  focusTarget,
}: MapViewProps) {
  return (
    <TrafficWorldMap
      visitorDots={visitorDots}
      orderDots={orderDots}
      countries={countries}
      height={height}
      showControls={true}
      initialZoom={5.8}
      initialCenter={[71.8, 30.8]}
      liveCount={liveCount}
      rangeLabel={rangeLabel}
      focusTarget={focusTarget}
    />
  );
}
