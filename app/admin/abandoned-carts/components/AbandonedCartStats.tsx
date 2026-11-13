'use client';

import React, { useState, useEffect } from 'react';
import AdminDateFilter from '@/components/admin/shared/AdminDateFilter';
import { 
  ShoppingCart, 
  Users, 
  CheckCircle2, 
  DollarSign, 
  TrendingUp,
  ChevronDown
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
  dateFilter: string;
  setDateFilter: (val: string) => void;
  customStartDate?: string;
  customEndDate?: string;
  setCustomStartDate?: (val: string) => void;
  setCustomEndDate?: (val: string) => void;
}

export default function AbandonedCartStats({
  stats,
  dateFilter,
  setDateFilter,
  customStartDate,
  customEndDate,
  setCustomStartDate,
  setCustomEndDate,
}: AbandonedCartStatsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin_abandoned_stats_expanded');
      if (saved !== null) {
        setIsExpanded(saved === 'true');
      }
    } catch {}
  }, []);

  const toggleExpanded = () => {
    setIsExpanded(prev => {
      const next = !prev;
      try { localStorage.setItem('admin_abandoned_stats_expanded', String(next)); } catch {}
      return next;
    });
  };

  const recoveryRate = stats.total > 0 ? Math.round((stats.recovered / stats.total) * 100) : 0;
  const unrecoveredVal = Math.max(0, stats.totalValue - stats.recoveredValue);

  return (
    <div className="stats-bar text-xs md:text-sm space-y-3">
      {/* Smart Compact Bar: Date Filter + Quick Metric Chips + Expand/Collapse Button (Matches Orders Log) */}
      <div className="flex items-center justify-between gap-2 p-1.5 sm:p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] shadow-xs">
        {/* Left: Date range filter */}
        <div className="flex items-center min-w-0 flex-1 sm:flex-initial">
          <AdminDateFilter
            value={dateFilter}
            onChange={setDateFilter}
            className="border-none bg-transparent dark:bg-transparent shadow-none w-full sm:w-auto text-xs py-0 min-h-0"
            options={[
              { value: 'today', label: 'Today' },
              { value: 'yesterday', label: 'Yesterday' },
              { value: 'last7', label: 'Last 7 days' },
              { value: 'last30', label: 'Last 30 days' },
              { value: 'custom', label: 'Custom range' }
            ]}
          />
        </div>

        {/* Center: Desktop Quick KPI Chips */}
        <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto min-w-0 py-0.5">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 text-[11px] whitespace-nowrap">
            <span className="text-gray-500 font-medium">Carts:</span>
            <span className="font-bold text-gray-900 dark:text-white">{stats.total}</span>
          </div>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-[11px] whitespace-nowrap">
            <span className="text-amber-700 dark:text-amber-400 font-medium">Pending:</span>
            <span className="font-bold text-amber-900 dark:text-amber-300">{stats.pending}</span>
          </div>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-[11px] whitespace-nowrap">
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">Recovered:</span>
            <span className="font-bold text-emerald-900 dark:text-emerald-300">{stats.recovered} ({recoveryRate}%)</span>
          </div>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-[11px] whitespace-nowrap">
            <span className="text-rose-700 dark:text-rose-400 font-medium">Lost Value:</span>
            <span className="font-bold text-rose-900 dark:text-rose-300">{formatPrice(unrecoveredVal)}</span>
          </div>
        </div>

        {/* Right: Expand/Collapse button */}
        <button
          type="button"
          onClick={toggleExpanded}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors shrink-0"
          title={isExpanded ? 'Collapse metrics' : 'Expand full metrics'}
        >
          <span className="hidden md:inline">{isExpanded ? 'Hide metrics' : 'Show metrics'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Expandable Grid & Progress */}
      {isExpanded && (
        <div className="space-y-3 animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Total Carts', value: stats.total, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30' },
              { label: 'Pending Recovery', value: stats.pending, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30' },
              { label: 'Recovered Carts', value: stats.recovered, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30' },
              { label: 'Unrecovered Value', value: formatPrice(unrecoveredVal), icon: DollarSign, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/30' },
            ].map(stat => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-white dark:bg-[#16162a] rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-xs transition-colors">
                  <div className={`inline-flex p-2 rounded-lg border ${stat.bg} mb-2`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <div className="text-lg font-black text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Recovery Rate Progress Bar */}
          {stats.total > 0 && (
            <div className="bg-white dark:bg-[#16162a] rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-xs space-y-2.5 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  Recovery Revenue Conversion Rate
                </span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  {recoveryRate}% ({stats.recovered} of {stats.total} carts)
                </span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-emerald-400 to-emerald-600 rounded-full transition-all"
                  style={{ width: `${Math.min(100, recoveryRate)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10.5px] text-gray-400 dark:text-gray-500 font-semibold">
                <span>Recovered: {formatPrice(stats.recoveredValue)}</span>
                <span>Total Abandoned Value: {formatPrice(stats.totalValue)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
