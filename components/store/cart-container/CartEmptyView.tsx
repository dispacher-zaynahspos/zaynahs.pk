'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ShoppingCart } from '@/components/common/Icons';

export default function CartEmptyView() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-20 text-center space-y-5">
      <div className="relative">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
          <ShoppingBag className="h-12 w-12 text-gray-300 dark:text-gray-600" />
        </div>
        <div className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#e94560] text-white text-[10px] font-black">0</div>
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Your cart is empty</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">Looks like you haven&apos;t added anything yet. Browse our products to get started.</p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-2xl bg-[#e94560] hover:bg-[#d8344e] active:scale-95 text-white px-6 py-3.5 text-sm font-bold transition-all duration-200 shadow-lg shadow-red-500/20"
      >
        <ShoppingCart className="h-4 w-4" />
        Shop Now
      </Link>
    </div>
  );
}
