'use client';

import React from 'react';
import { ShoppingBag, MessageCircle, Star } from '@/components/common/Icons';

export type FilterTab = 'all' | 'store' | 'wall';

interface TabItem {
  key: FilterTab;
  label: string;
  count: number;
  icon?: React.ReactNode;
}

interface ReviewsTabsProps {
  activeTab: FilterTab;
  onChangeTab: (tab: FilterTab) => void;
  total: number;
  proofCount: number;
}

export default function ReviewsTabs({
  activeTab,
  onChangeTab,
  total,
  proofCount,
}: ReviewsTabsProps) {
  const tabs: TabItem[] = [
    {
      key: 'all',
      label: 'All Reviews',
      count: total + proofCount,
      icon: <Star className="w-3.5 h-3.5" />,
    },
    {
      key: 'store',
      label: 'Verified Store',
      count: total,
      icon: <ShoppingBag className="w-3.5 h-3.5" />,
    },
    {
      key: 'wall',
      label: 'Proof Wall',
      count: proofCount,
      icon: <MessageCircle className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="w-full flex justify-center mb-5">
      <div
        className="w-full max-w-lg h-11 p-1 grid grid-cols-3 gap-1 shadow-2xs"
        role="tablist"
        aria-label="Filter reviews view"
        style={{
          borderRadius: 'var(--border-radius-btn, 12px)',
          backgroundColor: '#f3f4f6',
          border: '1px solid #e5e7eb',
        }}
      >
        {tabs.map((t) => {
          const isActive = activeTab === t.key;

          return (
            <button
              key={t.key}
              role="tab"
              type="button"
              onClick={() => onChangeTab(t.key)}
              aria-selected={isActive}
              className={`swatch-btn inline-flex items-center justify-center gap-1 sm:gap-1.5 h-full px-1 sm:px-2.5 text-[11px] sm:text-xs md:text-sm font-bold transition-all cursor-pointer min-w-0 select-none whitespace-nowrap active:scale-95 ${
                isActive
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
              style={{
                borderRadius: 'calc(var(--border-radius-btn, 12px) - 2px)',
                backgroundColor: isActive ? 'var(--color-surface, #ffffff)' : 'transparent',
                border: 'none',
              }}
            >
              <span className="whitespace-nowrap font-bold">{t.label}</span>
              <span
                className="inline-flex items-center justify-center min-w-[17px] sm:min-w-[19px] h-[16px] sm:h-[18px] px-1 rounded-full text-[9.5px] sm:text-[11px] font-bold shrink-0 transition-colors"
                style={{
                  borderRadius: '9999px',
                  backgroundColor: isActive
                    ? 'color-mix(in srgb, var(--btn-primary-bg, var(--color-primary, #e94560)) 12%, transparent)'
                    : '#e5e7eb',
                  color: isActive
                    ? 'var(--btn-primary-bg, var(--color-primary, #e94560))'
                    : '#6b7280',
                }}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
