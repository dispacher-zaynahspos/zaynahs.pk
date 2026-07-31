'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProductNavContext } from '@/lib/hooks/useProductNav';

interface ProductNavButtonsProps {
  currentProductId: string;
}

export default function ProductNavButtons({ currentProductId }: ProductNavButtonsProps) {
  const router = useRouter();
  const [nav, setNav] = useState<{
    prev: string | null;
    next: string | null;
    source: string;
    sourceUrl: string;
    position: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    const ctx = getProductNavContext(currentProductId);
    if (ctx.total > 0) setNav(ctx);
  }, [currentProductId]);

  if (!nav || nav.total === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Position indicator */}
      <span className="text-xs text-gray-400 dark:text-gray-500 font-mono select-none tabular-nums">
        {nav.position} / {nav.total}
      </span>

      {/* Prev / Next buttons — same style as Orders */}
      <div className="flex items-center border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
        <button
          onClick={() => { if (nav.prev) router.push(`/admin/products/${nav.prev}`); }}
          disabled={!nav.prev}
          className="px-2.5 py-1.5 bg-white dark:bg-[#16162a] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border-r border-gray-200 dark:border-gray-800"
          title="Previous product"
        >
          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          onClick={() => { if (nav.next) router.push(`/admin/products/${nav.next}`); }}
          disabled={!nav.next}
          className="px-2.5 py-1.5 bg-white dark:bg-[#16162a] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Next product"
        >
          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
