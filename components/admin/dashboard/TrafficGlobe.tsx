'use client';

import React from 'react';
import TrafficWorldMap, { Dot, CountryData } from '@/components/admin/shared/TrafficWorldMap';

interface TrafficGlobeProps {
  visitorDots: Dot[];
  orderDots: Dot[];
  countries?: CountryData[];
  height?: number | string;
}

export default function TrafficGlobe({
  visitorDots = [],
  orderDots = [],
  countries = [],
  height = 300,
}: TrafficGlobeProps) {
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
