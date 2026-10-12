'use client';

import React from 'react';
import { ToggleControl } from '@/components/admin/customizer/controls';

export interface FillRowsControlProps {
  value?: boolean;
  onChange: (value: boolean) => void;
  label?: string;
}

/**
 * Shared SSOT "Fill rows" toggle (RULE DS24).
 * When ON (default), the visible/batch count rounds UP to a full row when more
 * products exist, so the last row is never half-empty. When the catalog is
 * exhausted the remainder shows as-is (partial last row). Pairs with
 * applyFillRows() / useCatalogColumns() on the storefront.
 */
export default function FillRowsControl({
  value = true,
  onChange,
  label = 'Fill Rows (no half-empty last row)',
}: FillRowsControlProps) {
  return (
    <ToggleControl
      label={label}
      help="Rounds the shown count up to a full row when more products exist, so the last row is never half empty. The remainder shows normally once products run out."
      value={value !== false}
      onChange={onChange}
    />
  );
}
