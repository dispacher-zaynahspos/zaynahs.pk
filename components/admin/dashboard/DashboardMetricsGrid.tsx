'use client';

import React from 'react';
import { formatPrice } from '@/lib/utils/whatsapp';
import { DateRange } from './types';
import { pctChange } from './utils';

interface Metrics {
  sales: number;
  cogs: number;
  deliveryCost: number;
  grossProfit: number;
  netProfit: number;
  netMargin: number;
  count: number;
  avgOrderValue: number;
  refundedCount: number;
  cancelledCount: number;
  totalOrders: number;
}

interface DashboardMetricsGridProps {
  metrics: Metrics;
  prevMetrics: Metrics;
  dateFilter: DateRange;
  currencySymbol: string;
}

function MetricCard({
  label,
  value,
  sub,
  prevValue,
  dateFilter,
}: {
  label: string;
  value: number | string;
  sub: string;
  prevValue: number;
  dateFilter: DateRange;
}) {
  const change =
    label === 'Net Margin' || label === 'Orders'
      ? undefined
      : pctChange(typeof value === 'number' ? value : 0, prevValue);
  return (
    <div className="bg-white dark:bg-[#16162a] p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-xs hover:shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-center justify-between gap-1">
        <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider block truncate">{label}</span>
        {change && dateFilter !== 'all' && (
          <span
            className={`text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shrink-0 ${
              change.direction === 'up'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : change.direction === 'down'
                ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
            }`}
          >
            {change.direction === 'up' ? '↑' : change.direction === 'down' ? '↓' : '→'}
            {change.pct.toFixed(1)}%
          </span>
        )}
      </div>
      <div className="mt-2">
        <span className="text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight block">{value}</span>
        <span className="text-[10px] text-gray-400 dark:text-gray-400 font-semibold block mt-0.5 truncate">{sub}</span>
      </div>
    </div>
  );
}

export default function DashboardMetricsGrid({
  metrics,
  prevMetrics,
  dateFilter,
  currencySymbol,
}: DashboardMetricsGridProps) {
  return (
    <div className="space-y-4">
      {/* 6 Primary Financial Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <MetricCard
          label="Revenue"
          value={formatPrice(metrics.sales, currencySymbol)}
          sub={`${metrics.count} orders`}
          prevValue={prevMetrics.sales}
          dateFilter={dateFilter}
        />
        <MetricCard
          label="COGS"
          value={formatPrice(metrics.cogs, currencySymbol)}
          sub="Product cost × qty"
          prevValue={prevMetrics.cogs}
          dateFilter={dateFilter}
        />
        <MetricCard
          label="Delivery Cost"
          value={formatPrice(metrics.deliveryCost, currencySymbol)}
          sub="Shipping charges"
          prevValue={prevMetrics.deliveryCost}
          dateFilter={dateFilter}
        />
        <MetricCard
          label="Gross Profit"
          value={formatPrice(metrics.grossProfit, currencySymbol)}
          sub="Rev − COGS"
          prevValue={prevMetrics.grossProfit}
          dateFilter={dateFilter}
        />
        <MetricCard
          label="Net Profit"
          value={formatPrice(metrics.netProfit, currencySymbol)}
          sub="Rev − COGS − Deliv"
          prevValue={prevMetrics.netProfit}
          dateFilter={dateFilter}
        />
        <MetricCard
          label="Net Margin"
          value={`${metrics.netMargin.toFixed(1)}%`}
          sub="Net profit ratio"
          prevValue={prevMetrics.netMargin}
          dateFilter={dateFilter}
        />
      </div>

      {/* Secondary metric row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white dark:bg-[#16162a] p-3.5 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Orders</span>
            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-base md:text-lg font-black text-gray-900 dark:text-white">{metrics.count}</span>
            {dateFilter !== 'all' && prevMetrics.count > 0 && (() => {
              const ch = pctChange(metrics.count, prevMetrics.count);
              return (
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                  ch.direction === 'up'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : ch.direction === 'down'
                    ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                }`}>
                  {ch.direction === 'up' ? '↑' : ch.direction === 'down' ? '↓' : '→'} {ch.pct.toFixed(1)}%
                </span>
              );
            })()}
          </div>
        </div>

        <div className="bg-white dark:bg-[#16162a] p-3.5 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Order Value</span>
            <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-base md:text-lg font-black text-gray-900 dark:text-white">
              {formatPrice(metrics.avgOrderValue, currencySymbol)}
            </span>
            {dateFilter !== 'all' && (() => {
              const ch = pctChange(metrics.avgOrderValue, prevMetrics.avgOrderValue);
              return (
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                  ch.direction === 'up'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : ch.direction === 'down'
                    ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                }`}>
                  {ch.direction === 'up' ? '↑' : ch.direction === 'down' ? '↓' : '→'} {ch.pct.toFixed(1)}%
                </span>
              );
            })()}
          </div>
        </div>

        <div className="bg-white dark:bg-[#16162a] p-3.5 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cancelled Orders</span>
            <span className="h-2 w-2 rounded-full bg-red-500"></span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-base md:text-lg font-black text-red-500">{metrics.cancelledCount}</span>
            <span className="text-[9px] text-gray-500 dark:text-gray-400 font-bold bg-red-500/10 px-1.5 py-0.5 rounded-md">
              {metrics.totalOrders > 0 ? ((metrics.cancelledCount / metrics.totalOrders) * 100).toFixed(1) : '0'}%
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#16162a] p-3.5 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Refunded Orders</span>
            <span className="h-2 w-2 rounded-full bg-rose-500"></span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-base md:text-lg font-black text-rose-500">{metrics.refundedCount}</span>
            <span className="text-[9px] text-gray-500 dark:text-gray-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded-md">
              {metrics.totalOrders > 0 ? ((metrics.refundedCount / metrics.totalOrders) * 100).toFixed(1) : '0'}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
