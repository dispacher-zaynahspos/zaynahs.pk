'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, StoreSettings } from '@/lib/types';
import { CheckCircle2, X } from '@/components/common/Icons';
import { getSharedAspectClass } from '@/lib/utils/styles';

interface RecentBuyerTickerProps {
  settings: StoreSettings;
  product: Product;
  buyer: { name: string; city: string };
  timeAgo: string;
  onClose: () => void;
}

export default function RecentBuyerTicker({
  settings,
  product,
  buyer,
  timeAgo,
  onClose,
}: RecentBuyerTickerProps) {
  return (
    <div className="fixed bottom-24 left-4 z-[110] flex items-center max-w-[280px] sm:max-w-xs p-3 bg-white dark:bg-[#16162a] border border-gray-100 dark:border-gray-800/80 rounded-2xl shadow-xl transition-all duration-500 animate-slide-up">
      <Link href={`/product/${product.slug}`} className="flex items-center gap-3 w-full">
        {product.images?.[0]?.url && (
          <div className={`relative w-12 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden ${getSharedAspectClass(settings?.imageAspectRatio)}`}>
            <Image
              src={product.images?.[0]?.url}
              alt={product.name}
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
            <span className="font-semibold text-gray-900 dark:text-gray-100">{buyer.name}</span>
            from {buyer.city}
          </p>
          <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate mt-0.5">
            Bought {product.name}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[9px] text-gray-400 dark:text-gray-500">{timeAgo}</span>
            <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-500 font-semibold bg-emerald-50 dark:bg-emerald-950/20 px-1 rounded-sm">
              <CheckCircle2 className="w-2.5 h-2.5" /> Verified
            </span>
          </div>
        </div>
      </Link>
      <button
        onClick={onClose}
        className="absolute -top-1.5 -right-1.5 p-1 bg-white dark:bg-[#16162a] border border-gray-100 dark:border-gray-800 rounded-full shadow-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
