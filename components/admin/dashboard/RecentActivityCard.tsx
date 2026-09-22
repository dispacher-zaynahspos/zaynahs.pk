'use client';

import React from 'react';
import { TrendingUp, Package, User, Edit2 } from '@/components/common/Icons';
import { timeAgo } from '@/lib/utils/dateFilters';

interface ActivityEvent {
  id: string;
  type: 'order' | 'customer' | 'product';
  text: string;
  time: string;
}

interface RecentActivityCardProps {
  recentActivity: ActivityEvent[];
}

export default function RecentActivityCard({ recentActivity }: RecentActivityCardProps) {
  return (
    <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-xs p-5 md:p-6 space-y-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-gray-800/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-black text-gray-900 dark:text-white tracking-tight">Recent Activity</h3>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Feed
          </span>
        </div>

        <div className="space-y-1 mt-2">
          {recentActivity.map((event) => {
            const config = {
              order: { color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', icon: Package },
              customer: { color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', icon: User },
              product: { color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', icon: Edit2 },
            }[event.type] || { color: 'bg-gray-500/10 text-gray-600 border-gray-500/20', icon: Package };
            const Icon = config.icon;

            return (
              <div
                key={event.id}
                className="flex items-start gap-3 py-2.5 border-b border-gray-100/70 dark:border-gray-800/50 last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/5 px-2 rounded-xl transition-colors"
              >
                <span className={`mt-0.5 shrink-0 w-6 h-6 rounded-lg flex items-center justify-center border ${config.color}`}>
                  <Icon className="h-3 w-3" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{event.text}</p>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{timeAgo(event.time)}</p>
                </div>
              </div>
            );
          })}

          {recentActivity.length === 0 && (
            <div className="py-8 text-center text-xs text-gray-400 font-medium">No activity recorded yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

