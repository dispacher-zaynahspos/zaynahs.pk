'use client';

import React from 'react';
import { Check, Package } from '@/components/common/Icons';

interface OrderStatusBadgeProps {
  status: string;
  isUpdating?: boolean;
  itemCount?: number;
  size?: 'sm' | 'md';
  className?: string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  isUpdating = false,
  itemCount,
  size = 'sm',
  className = '',
}) => {
  const pad = size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-[10px]';

  // 1. Loading state during status update (per user requirement)
  if (isUpdating) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-md font-bold uppercase tracking-wide bg-slate-800 text-white shadow-2xs animate-pulse shrink-0 ${pad} ${className}`}
      >
        <span className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
        Updating...
      </span>
    );
  }

  const s = (status || 'pending').toLowerCase();
  const countSuffix = itemCount !== undefined ? ` (${itemCount})` : '';

  // 2. Real status badges matching exact admin actions
  switch (s) {
    case 'pending':
    case 'placed':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-md font-extrabold uppercase tracking-wide bg-amber-500 text-white shadow-2xs ring-1 ring-amber-600/30 shrink-0 ${pad} ${className}`}
        >
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
          </span>
          Pending{countSuffix}
        </span>
      );

    case 'confirmed':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-md font-extrabold uppercase tracking-wide bg-blue-600 text-white shadow-2xs ring-1 ring-blue-700/30 shrink-0 ${pad} ${className}`}
        >
          <Check className="h-3 w-3 stroke-[3] text-white shrink-0" />
          Confirmed{countSuffix}
        </span>
      );

    case 'shipped':
    case 'out_for_delivery':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-md font-extrabold uppercase tracking-wide bg-purple-600 text-white shadow-2xs ring-1 ring-purple-700/30 shrink-0 ${pad} ${className}`}
        >
          <Package className="h-3 w-3 text-white shrink-0" />
          Shipped{countSuffix}
        </span>
      );

    case 'delivered':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-md font-extrabold uppercase tracking-wide bg-emerald-600 text-white shadow-2xs ring-1 ring-emerald-700/30 shrink-0 ${pad} ${className}`}
        >
          <Check className="h-3 w-3 stroke-[3] text-white shrink-0" />
          Delivered{countSuffix}
        </span>
      );

    case 'cancelled':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-md font-bold uppercase tracking-wide bg-rose-600 text-white shadow-2xs shrink-0 ${pad} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
          Cancelled{countSuffix}
        </span>
      );

    case 'refunded':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-md font-bold uppercase tracking-wide bg-red-700 text-white shadow-2xs shrink-0 ${pad} ${className}`}
        >
          Refunded{countSuffix}
        </span>
      );

    case 'returned':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-md font-bold uppercase tracking-wide bg-slate-600 text-white shadow-2xs shrink-0 ${pad} ${className}`}
        >
          Returned{countSuffix}
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-md font-bold uppercase tracking-wide bg-gray-700 text-white shadow-2xs shrink-0 ${pad} ${className}`}
        >
          {status.toUpperCase()}{countSuffix}
        </span>
      );
  }
};

export default OrderStatusBadge;
