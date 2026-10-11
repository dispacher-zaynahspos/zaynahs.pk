'use client';

import React from 'react';
import { SegmentedControl } from '@/components/admin/customizer/controls';

export interface GridGapControlProps {
  value?: 'tight' | 'normal' | 'relaxed' | string;
  onChange: (value: 'tight' | 'normal' | 'relaxed') => void;
  label?: string;
}

/**
 * Shared SSOT Grid Gap selector for all Catalog, Products, and Collections layouts.
 * Options: Tight, Normal, Relaxed.
 */
export default function GridGapControl({
  value = 'normal',
  onChange,
  label = 'Grid Gap',
}: GridGapControlProps) {
  return (
    <SegmentedControl
      label={label}
      value={value || 'normal'}
      onChange={(v) => onChange(v as 'tight' | 'normal' | 'relaxed')}
      options={[
        { label: 'Tight', value: 'tight' },
        { label: 'Normal', value: 'normal' },
        { label: 'Relaxed', value: 'relaxed' },
      ]}
    />
  );
}
