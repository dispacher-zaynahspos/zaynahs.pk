'use client';

import React from 'react';
import { Layers } from '@/components/common/Icons';
import { formatPrice } from '@/lib/utils/whatsapp';

interface StatusBreakdownItem {
  status: string;
  count: number;
  sales: number;
}

interface StatusBreakdownCardProps {
  statusBreakdown: StatusBreakdownItem[];
  totalOrdersCount: number;
  currencySymbol: string;
}

export default function StatusBreakdownCard({
  statusBreakdown,
  totalOrdersCount,
  currencySymbol,
}: StatusBreakdownCardProps) {
  return (
    <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-xs p-5 md:p-6 space-y-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-gray-800/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              <Layers className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-black text-gray-900 dark:text-white tracking-tight">Status Breakdown</h3>
          </div>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
            {totalOrdersCount} Orders
          </span>
        </div>

        <div className="space-y-4 mt-4">
          {statusBreakdown.map((row) => {
            const pct = totalOrdersCount > 0 ? (row.count / totalOrdersCount) * 100 : 0;
            const statusConfig = {
              delivered: { color: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
              confirmed: { color: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' },
              shipped: { color: 'bg-indigo-500', text: 'text-indigo-600 dark:text-indigo-400' },
              pending: { color: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
              cancelled: { color: 'bg-red-500', text: 'text-red-600 dark:text-red-400' }
            }[row.status] || { color: 'bg-purple-500', text: 'text-purple-600 dark:text-purple-400' };

            return (
              <div key={row.status} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 capitalize font-bold text-gray-900 dark:text-white">
                    <span className={`h-2 w-2 rounded-full ${statusConfig.color}`} />
                    {row.status}
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-gray-500 dark:text-gray-400">
                      {row.count} ({pct.toFixed(0)}%)
                    </span>
                    <span className="font-black text-gray-900 dark:text-white">
                      {formatPrice(row.sales, currencySymbol)}
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800/80 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${statusConfig.color}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

