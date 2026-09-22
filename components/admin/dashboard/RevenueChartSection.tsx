'use client';

import React from 'react';
import { formatPrice } from '@/lib/utils/whatsapp';
import {
  Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart, Legend
} from 'recharts';

interface ChartDataItem {
  label: string;
  revenue: number;
  cogs: number;
  profit: number;
}

interface RevenueChartSectionProps {
  chartData: ChartDataItem[];
  chartEmpty: boolean;
  currencySymbol: string;
}

export default function RevenueChartSection({
  chartData,
  chartEmpty,
  currencySymbol,
}: RevenueChartSectionProps) {
  return (
    <div className="lg:col-span-2 bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-xs p-5 md:p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-black text-gray-900 dark:text-white tracking-tight">Revenue vs Cost vs Profit</h3>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 font-semibold mt-0.5">Financial trajectory across selected period</p>
        </div>
      </div>

      {chartEmpty ? (
        <div className="h-72 flex flex-col items-center justify-center text-sm text-gray-400 font-semibold gap-2 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
          <span>No sales recorded in this period</span>
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" opacity={0.15} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} angle={-15} textAnchor="end" height={45} stroke="#9ca3af" strokeOpacity={0.2} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(v) => formatPrice(v, '')} stroke="#9ca3af" strokeOpacity={0.2} />
              <Tooltip
                formatter={(value: any) => [formatPrice(Number(value), currencySymbol), '']}
                contentStyle={{
                  backgroundColor: 'rgba(22, 22, 42, 0.95)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '10px 14px',
                }}
                labelStyle={{ color: '#9ca3af', fontWeight: 700, marginBottom: '4px' }}
                itemStyle={{ padding: '2px 0' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontWeight: 700 }}
              />
              <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" radius={[4, 4, 0, 0]} maxBarSize={32} />
              <Bar dataKey="cogs" fill="#f43f5e" name="COGS" radius={[4, 4, 0, 0]} maxBarSize={32} />
              <Line type="monotone" dataKey="profit" stroke="#10b981" name="Net Profit" strokeWidth={2.5} dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

