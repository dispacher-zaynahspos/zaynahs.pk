'use client';

import Link from 'next/link';
import { Zap, ArrowRight } from '@/components/common/Icons';

interface BulkOptimizeCardProps {
  pPending: number;
  cPending: number;
}

/**
 * Entry point into the full Bulk SEO Console (`/admin/seo/bulk`).
 *
 * Previously this card ran its own one-shot `/api/seo/bulk` call behind a
 * progress bar that never advanced (the `current` counter stayed at 0 — a
 * fake/demo progress indicator) and duplicated the bulk logic that already
 * lives in `app/admin/seo/bulk/BulkConsoleClient.tsx`. That console is the
 * ONE canonical bulk experience (live per-type progress, logs, stop control),
 * so this card now navigates there instead of re-implementing the run.
 */
export function BulkOptimizeCard({ pPending, cPending }: BulkOptimizeCardProps) {
  const totalPending = pPending + cPending;

  return (
    <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
            Bulk SEO Engine
          </h4>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Automatically write meta tags, long descriptions, and FAQ schemas for all {totalPending} pending items, with live progress and logs.
          </p>
        </div>

        <Link
          href="/admin/seo/bulk"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 active:scale-95 cursor-pointer min-h-[44px] text-sm transition-all w-full sm:w-auto"
        >
          <Zap className="w-4 h-4" />
          <span>Open Bulk Console ({totalPending})</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
