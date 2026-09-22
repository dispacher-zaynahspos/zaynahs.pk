'use client';

import React from 'react';
import { MessageSquare, Mail, Zap, ArrowUpRight } from '@/components/common/Icons';

interface LeadsStatsGridProps {
  stats: {
    total: number;
    today: number;
    wheel: number;
    exit: number;
  };
  emailSubsCount: number;
}

export default function LeadsStatsGrid({ stats, emailSubsCount }: LeadsStatsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-[#16162a] p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
            WhatsApp Leads
          </span>
          <span className="text-xl font-black text-gray-950 dark:text-white">{stats.total}</span>
        </div>
        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
          <MessageSquare className="h-5 w-5" />
        </div>
      </div>
      <div className="bg-white dark:bg-[#16162a] p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
            Newsletter Subs
          </span>
          <span className="text-xl font-black text-gray-950 dark:text-white">{emailSubsCount}</span>
        </div>
        <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
          <Mail className="h-5 w-5" />
        </div>
      </div>
      <div className="bg-white dark:bg-[#16162a] p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
            Spin Wheel
          </span>
          <span className="text-xl font-black text-gray-950 dark:text-white">{stats.wheel}</span>
        </div>
        <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <Zap className="h-5 w-5" />
        </div>
      </div>
      <div className="bg-white dark:bg-[#16162a] p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
            Exit-Intent
          </span>
          <span className="text-xl font-black text-gray-950 dark:text-white">{stats.exit}</span>
        </div>
        <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
          <ArrowUpRight className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
