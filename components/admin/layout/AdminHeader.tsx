'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Search, ClipboardList, ExternalLink, Download } from '@/components/common/Icons';
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
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    try {
      installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice?.outcome === 'accepted') {
        setInstallPrompt(null);
      }
    } catch {
      // ignore
    }
  };
  return (
    <header className="fixed md:relative top-0 left-0 right-0 z-30 md:z-auto h-[calc(3.5rem+env(safe-area-inset-top,0px))] md:h-14 flex-shrink-0 bg-white dark:bg-[#0c0c16] border-b border-gray-200 dark:border-white/10 flex items-center justify-between px-3 sm:px-4 md:px-6 pt-[env(safe-area-inset-top,0px)] md:pt-0 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {/* Left: Mobile Menu Toggle + Title */}
      <div className="flex items-center gap-2.5 min-w-0 max-w-[55%] sm:max-w-none">
        {/* Hamburger Menu Toggle (Mobile & Tablet) */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden h-9 w-9 flex items-center justify-center rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/10 transition-all focus:outline-none active:scale-95 shrink-0 cursor-pointer border border-gray-200/60 dark:border-white/10"
          title="Open menu drawer"
          aria-label="Open menu drawer"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white tracking-tight truncate">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Right Actions: Search Pill, Pending Orders, Purge Cache, View Store */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Quick Spotlight Search Button */}
        {onOpenCommandPalette && (
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="h-9 px-2.5 sm:px-3 rounded-xl bg-gray-100/80 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200/70 dark:border-white/10 flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all cursor-pointer active:scale-95 shadow-2xs"
            title="Search Navigation (Cmd+K)"
            aria-label="Search Navigation"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="hidden xl:inline text-xs font-medium">Search...</span>
            <kbd className="hidden sm:inline-flex items-center text-[10px] font-bold bg-white dark:bg-white/10 px-1.5 py-0.5 rounded text-gray-500 dark:text-gray-300 border border-gray-200/80 dark:border-white/10 font-mono shadow-3xs">
              ⌘ / Ctrl K
            </kbd>
          </button>
        )}

        {/* Pending Orders Notification Pill */}
        {pendingOrdersCount > 0 && (
          <Link
            href="/admin/orders"
            className="h-9 px-2.5 sm:px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/25 flex items-center gap-1.5 transition-all text-xs font-bold shrink-0 shadow-2xs active:scale-95"
            title={`${pendingOrdersCount} pending orders require fulfillment`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <ClipboardList className="h-3.5 w-3.5" />
            <span>{pendingOrdersCount > 99 ? '99+' : pendingOrdersCount}</span>
            <span className="hidden sm:inline text-[11px] font-medium text-amber-600 dark:text-amber-400/80">Orders</span>
          </Link>
        )}

        {/* PWA Install App Button */}
        {installPrompt && !isInstalled && (
          <button
            type="button"
            onClick={handleInstallClick}
            className="h-9 px-2.5 sm:px-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800/60 flex items-center gap-1.5 transition-all text-xs font-bold shrink-0 shadow-2xs active:scale-95 cursor-pointer"
            title="Install Admin App (PWA)"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Install App</span>
          </button>
        )}

        {/* Purge Cache Button */}
        <PurgeCacheButton variant="ghost" />

        {/* View Storefront Pill Button */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="group h-9 px-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200/80 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:border-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/10 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-bold shadow-2xs shrink-0 cursor-pointer"
          title="View Storefront (opens in new tab)"
        >
          <span className="hidden sm:inline">View Store</span>
          <span className="sm:hidden">Store</span>
          <ExternalLink className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </Link>
      </div>
    </header>
  );
}
