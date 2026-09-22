'use client';

import React from 'react';
import { formatPrice } from '@/lib/utils/whatsapp';
import { ReportingMetrics } from './types';

interface ReportingMetricsGridProps {
  metrics: ReportingMetrics;
  currencySymbol: string;
}

export default function ReportingMetricsGrid({ metrics, currencySymbol }: ReportingMetricsGridProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-[#16162a] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Revenue</span>
          <span className="text-lg font-black text-gray-950 dark:text-white block mt-1">{formatPrice(metrics.sales, currencySymbol)}</span>
          <span className="text-[9px] text-emerald-500 font-bold">Non-cancelled orders</span>
        </div>
        <div className="bg-white dark:bg-[#16162a] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">COGS</span>
          <span className="text-lg font-black text-gray-950 dark:text-white block mt-1">{formatPrice(metrics.cogs, currencySymbol)}</span>
          <span className="text-[9px] text-gray-400 font-bold">Product cost × qty</span>
        </div>
        <div className="bg-white dark:bg-[#16162a] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Delivery Cost</span>
          <span className="text-lg font-black text-amber-500 block mt-1">{formatPrice(metrics.deliveryCost, currencySymbol)}</span>
          <span className="text-[9px] text-gray-400 font-bold">Shipping charges</span>
        </div>
        <div className="bg-white dark:bg-[#16162a] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Gross Profit</span>
          <span className="text-lg font-black text-emerald-500 block mt-1">{formatPrice(metrics.grossProfit, currencySymbol)}</span>
          <span className="text-[9px] text-gray-400 font-bold">Rev − COGS</span>
        </div>
        <div className="bg-white dark:bg-[#16162a] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Net Profit</span>
          <span className="text-lg font-black text-emerald-600 block mt-1">{formatPrice(metrics.netProfit, currencySymbol)}</span>
          <span className="text-[9px] text-gray-400 font-bold">Rev − COGS − Delivery</span>
        </div>
        <div className="bg-white dark:bg-[#16162a] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Net Margin</span>
          <span className="text-lg font-black text-indigo-500 block mt-1">{metrics.netMargin.toFixed(1)}%</span>
          <span className="text-[9px] text-gray-400 font-bold">Net profit %</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#16162a] p-3 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Orders</span>
          <span className="text-base font-black text-gray-950 dark:text-white block mt-0.5">{metrics.count}</span>
        </div>
        <div className="bg-white dark:bg-[#16162a] p-3 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">AOV</span>
          <span className="text-base font-black text-gray-950 dark:text-white block mt-0.5">{formatPrice(metrics.aov, currencySymbol)}</span>
        </div>
        <div className="bg-white dark:bg-[#16162a] p-3 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Projected COGS</span>
          <span className="text-base font-black text-amber-500 block mt-0.5">{formatPrice(metrics.projectedCOGS, currencySymbol)}</span>
          <span className="text-[8px] text-gray-400 font-medium">Unfulfilled orders</span>
        </div>
        <div className="bg-white dark:bg-[#16162a] p-3 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Cancelled Value</span>
          <span className="text-base font-black text-red-500 block mt-0.5">{formatPrice(metrics.cancelledTotal, currencySymbol)}</span>
        </div>
      </div>
    </div>
  );
}
