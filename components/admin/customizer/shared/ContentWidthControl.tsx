'use client';

import React from 'react';
import { SegmentedControl } from '@/components/admin/customizer/controls';

export interface ContentWidthControlProps {
  value?: 'boxed' | 'wide' | 'full' | string;
  onChange: (value: 'boxed' | 'wide' | 'full') => void;
  label?: string;
}

/**
 * Shared SSOT content-width selector (RULE DS24 / RULE SSOT-CATALOG-LAYOUTS).
 * Controls how wide a catalog section container is on large screens:
 *  - Boxed = classic 1280px (default, keeps existing stores unchanged)
 *  - Wide  = roomy 1600px for big screens
 *  - Full  = edge-to-edge (with side padding)
 * Pairs with getContentWidthClass() in lib/utils/responsiveGrid.ts.
 */
export default function ContentWidthControl({
  value = 'boxed',
  onChange,
  label = 'Content Width',
}: ContentWidthControlProps) {
  return (
    <SegmentedControl
      label={label}
      value={value || 'boxed'}
      onChange={(v) => onChange(v as 'boxed' | 'wide' | 'full')}
      options={[
        { label: 'Boxed', value: 'boxed' },
        { label: 'Wide', value: 'wide' },
        { label: 'Full', value: 'full' },
      ]}
    />
  );
}
