'use client';

import React from 'react';
import { 
  ShoppingCart, 
  Users, 
  CheckCircle2, 
  DollarSign, 
  TrendingUp 
} from '@/components/common/Icons';
import { formatPrice } from '@/lib/utils/whatsapp';

interface AbandonedCartStatsProps {
  stats: {
    total: number;
    pending: number;
    emailed: number;
    recovered: number;
    totalValue: number;
    recoveredValue: number;
  };
}

export default function AbandonedCartStats({ stats }: AbandonedCartStatsProps) {
  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Carts', value: stats.total, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30' },
          { label: 'Pending recovery', value: stats.pending, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30' },
          { label: 'Recovered Carts', value: stats.recovered, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30' },
          { label: 'Unrecovered Value', value: formatPrice(stats.totalValue - stats.recoveredValue), icon: DollarSign, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/30' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-xs transition-colors">
              <div className={`inline-flex p-2.5 rounded-xl border ${stat.bg} mb-3`}>
                <Icon className={`h-4.5 w-4.5 ${stat.color}`} />
              </div>
              <div className="text-xl font-black text-gray-900 dark:text-white">{stat.value}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 font-bold mt-1 uppercase tracking-wider">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Recovery Rate Bar */}
      {stats.total > 0 && (
        <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-xs space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-emerald-500" />
              Recovery Revenue Conversion Rate
            </span>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              {stats.total > 0 ? Math.round((stats.recovered / stats.total) * 100) : 0}%
            </span>
          </div>
          <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 bg-linear-to-r from-emerald-400 to-emerald-600 rounded-full transition-all"
              style={{ width: `${stats.total > 0 ? (stats.recovered / stats.total) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-gray-400 dark:text-gray-500 font-bold">
            <span>Recovered Value: {formatPrice(stats.recoveredValue)}</span>
            <span>Total Lost Value: {formatPrice(stats.totalValue)}</span>
          </div>
        </div>
      )}
    </>
  );
}
