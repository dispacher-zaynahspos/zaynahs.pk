'use client';

import React from 'react';
import { formatPrice } from '@/lib/utils/whatsapp';
import {
  Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart, Legend
} from 'recharts';

interface RevenueChartSectionProps {
  chartData: Array<{ date: string; revenue: number; cogs: number; profit: number }>;
  currencySymbol: string;
}

export default function RevenueChartSection({ chartData, currencySymbol }: RevenueChartSectionProps) {
  if (chartData.length === 0) return null;

  return (
    <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs p-5">
      <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4">Revenue vs Cost vs Profit</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => {
              const d = new Date(v + 'T00:00:00');
              return d.toLocaleDateString('en-PK', { month: 'short', day: 'numeric' });
            }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatPrice(v, '')} />
            <Tooltip formatter={(value: any) => formatPrice(Number(value), currencySymbol)} />
            <Legend />
            <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" radius={[3, 3, 0, 0]} />
            <Bar dataKey="cogs" fill="#ef4444" name="COGS" radius={[3, 3, 0, 0]} />
            <Line type="monotone" dataKey="profit" stroke="#10b981" name="Profit" strokeWidth={2} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
