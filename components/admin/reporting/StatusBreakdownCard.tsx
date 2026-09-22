'use client';

import React from 'react';
import { Layers } from '@/components/common/Icons';
import { formatPrice } from '@/lib/utils/whatsapp';
import { StatusBreakdownRow } from './types';

interface StatusBreakdownCardProps {
  statusBreakdown: StatusBreakdownRow[];
  totalOrders: number;
  currencySymbol: string;
}

export default function StatusBreakdownCard({ statusBreakdown, totalOrders, currencySymbol }: StatusBreakdownCardProps) {
  return (
    <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs p-5 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800/80">
        <Layers className="h-4.5 w-4.5 text-gray-400" />
        <h3 className="text-sm font-black text-gray-900 dark:text-white">Status Breakdown</h3>
      </div>

      <div className="space-y-4">
        {statusBreakdown.map((row) => {
          const pct = totalOrders > 0 ? (row.count / totalOrders) * 100 : 0;
          return (
            <div key={row.status} className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="capitalize font-bold text-gray-800 dark:text-gray-200">{row.status}</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {row.count} · {formatPrice(row.sales, currencySymbol)}
                </span>
              </div>
              <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    row.status === 'delivered'
                      ? 'bg-emerald-500'
                      : row.status === 'confirmed'
                      ? 'bg-blue-500'
                      : row.status === 'pending'
                      ? 'bg-amber-500'
                      : row.status === 'cancelled'
                      ? 'bg-red-500'
                      : 'bg-purple-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="text-[9px] text-gray-400 font-medium">
                Cost: {formatPrice(row.cost, currencySymbol)} · Delivery: {formatPrice(row.delivery, currencySymbol)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
