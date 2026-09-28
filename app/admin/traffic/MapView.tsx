'use client';

import React from 'react';
import TrafficWorldMap, { Dot, CountryData } from '@/components/admin/shared/TrafficWorldMap';

interface MapViewProps {
  visitorDots: Dot[];
  orderDots: Dot[];
  countries?: CountryData[];
  height?: number | string;
}

export default function MapView({
  visitorDots = [],
  orderDots = [],
  countries = [],
  height = 500,
}: MapViewProps) {
  return (
    <TrafficWorldMap
      visitorDots={visitorDots}
      orderDots={orderDots}
      countries={countries}
      height={height}
      showControls={true}
    />
  );
}
