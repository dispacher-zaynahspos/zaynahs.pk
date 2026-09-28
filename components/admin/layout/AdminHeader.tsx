'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Search, ClipboardList } from '@/components/common/Icons';
import PurgeCacheButton from '@/components/admin/shared/PurgeCacheButton';

interface AdminHeaderProps {
  pageTitle: string;
  setIsMobileMenuOpen: (open: boolean) => void;
  onOpenCommandPalette?: () => void;
  pendingOrdersCount?: number;
}

export function AdminHeader({
  pageTitle,
  setIsMobileMenuOpen,
  onOpenCommandPalette,
  pendingOrdersCount = 0,
}: AdminHeaderProps) {
  return (
    <header className="fixed md:relative top-0 left-0 right-0 z-30 md:z-auto h-[calc(3.5rem+env(safe-area-inset-top,0px))] md:h-14 flex-shrink-0 bg-white/95 dark:bg-[#16162a]/95 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800/80 flex items-center justify-between px-3 sm:px-4 md:px-6 pt-[env(safe-area-inset-top,0px)] md:pt-0 transition-colors">
      {/* Left: Hamburger (Mobile & Tablet) + Page Title */}
      <div className="flex items-center gap-2.5 min-w-0 max-w-[50%] sm:max-w-none">
        {/* 📱 Hamburger Menu Toggle (Visible on Mobile & Tablet Rail mode) */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden h-10 w-10 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 transition-all focus:outline-none active:scale-95 shrink-0 cursor-pointer"
          title="Open menu drawer"
          aria-label="Open menu drawer"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h2 className="text-sm sm:text-base md:text-lg font-black text-gray-900 dark:text-white tracking-tight truncate">
          {pageTitle}
        </h2>
      </div>

      {/* Right Actions: Quick Search, Orders Badge, Theme, Purge, View Store */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Quick Search Button */}
        {onOpenCommandPalette && (
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="h-9 sm:h-10 px-2 sm:px-3 rounded-xl flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700 active:scale-95"
            title="Search Navigation (Cmd+K)"
            aria-label="Search Navigation"
          >
            <Search className="h-4.5 w-4.5 text-gray-500 dark:text-gray-400" />
            <span className="hidden xl:inline text-xs font-semibold text-gray-500 dark:text-gray-400">
              Search
            </span>
            <kbd className="hidden sm:inline-block text-[10px] font-bold bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 font-mono">
              ⌘K
            </kbd>
          </button>
        )}

        {/* Pending Orders Notification Pill (Visible if pending orders > 0) */}
        {pendingOrdersCount > 0 && (
          <Link
            href="/admin/orders"
            className="h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1.5 transition-all text-xs font-bold shrink-0"
            title={`${pendingOrdersCount} pending orders require fulfillment`}
          >
            <ClipboardList className="h-4 w-4" />
            <span className="font-black">
              {pendingOrdersCount > 99 ? '99+' : pendingOrdersCount}
            </span>
            <span className="hidden sm:inline text-[11px] font-semibold">Orders</span>
          </Link>
        )}

        <PurgeCacheButton variant="ghost" />

        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="h-9 sm:h-10 flex items-center gap-1 text-xs font-bold text-[var(--color-primary,#C2185B)] hover:brightness-90 px-2 sm:px-3 rounded-xl hover:bg-rose-50/50 transition-all shrink-0 cursor-pointer"
          title="View Storefront (opens in new tab)"
        >
          <span className="hidden sm:inline">View Store</span>
          <span className="sm:hidden">Store</span>
          <span className="text-[12px] leading-none">↗</span>
        </Link>
      </div>
    </header>
  );
}
