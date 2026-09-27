'use client';

import React from 'react';
import Link from 'next/link';
import { Menu } from '@/components/common/Icons';
import PurgeCacheButton from '@/components/admin/shared/PurgeCacheButton';
import ThemeToggle from '@/components/common/ThemeToggle';

interface AdminHeaderProps {
  pageTitle: string;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export function AdminHeader({ pageTitle, setIsMobileMenuOpen }: AdminHeaderProps) {
  return (
    <header className="fixed md:relative top-0 left-0 right-0 z-30 md:z-auto h-[calc(3rem+env(safe-area-inset-top,0px))] md:h-13 flex-shrink-0 bg-white/95 dark:bg-[#16162a]/95 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800/80 flex items-center justify-between px-2.5 sm:px-4 md:px-6 pt-[env(safe-area-inset-top,0px)] md:pt-0 transition-colors">
      <div className="flex items-center gap-2 min-w-0 max-w-[45%] sm:max-w-none">
        {/* 📱 Hamburger Menu Toggle Button */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden h-8.5 w-8.5 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-all focus:outline-none active:scale-95 shrink-0 cursor-pointer"
          title="Open menu"
          aria-label="Open menu"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>
        <h2 className="text-xs sm:text-sm md:text-base font-black text-gray-900 dark:text-white tracking-tight truncate">
          {pageTitle}
        </h2>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <ThemeToggle className="h-8 w-8 sm:h-8.5 sm:w-8.5 rounded-lg" iconClassName="h-4 w-4 sm:h-4.5 sm:w-4.5" />
        <PurgeCacheButton variant="ghost" />
        <Link 
          href="/" 
          target="_blank"
          className="h-8 sm:h-8.5 flex items-center gap-0.5 text-xs font-bold text-[#e94560] hover:text-[#d33a53] hover:underline whitespace-nowrap px-2 sm:px-2.5 rounded-lg hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-all shrink-0 cursor-pointer"
          title="View Storefront (opens in new tab)"
        >
          <span className="hidden sm:inline">View Store</span>
          <span className="sm:hidden">Store</span>
          <span className="text-[11px] leading-none">↗</span>
        </Link>
      </div>
    </header>
  );
}
