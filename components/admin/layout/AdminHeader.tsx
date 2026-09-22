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
    <header className="fixed md:relative top-0 left-0 right-0 z-30 md:z-auto h-12 md:h-13 flex-shrink-0 bg-white/95 dark:bg-[#16162a]/95 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800/80 flex items-center justify-between px-3 md:px-6 transition-colors">
      <div className="flex items-center gap-2.5">
        {/* 📱 Hamburger Menu Toggle Button */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden min-h-[38px] min-w-[38px] p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-all focus:outline-none active:scale-95"
          title="Open menu"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>
        <h2 className="text-sm md:text-base font-black text-gray-900 dark:text-white tracking-tight">
          {pageTitle}
        </h2>
      </div>
      <div className="flex items-center gap-1.5 md:gap-2.5">
        <ThemeToggle />
        <PurgeCacheButton variant="ghost" className="scale-85 md:scale-95 origin-right" />
        <Link 
          href="/" 
          target="_blank"
          className="text-xs font-bold text-[#e94560] hover:text-[#d33a53] hover:underline whitespace-nowrap px-2 py-1 rounded-lg hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-all"
        >
          View Store ↗
        </Link>
      </div>
    </header>
  );
}
