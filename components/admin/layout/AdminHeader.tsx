'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Search, ClipboardList, ExternalLink, Download } from '@/components/common/Icons';
import PurgeCacheButton from '@/components/admin/shared/PurgeCacheButton';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

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
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const nav = window.navigator as Navigator & { standalone?: boolean };
    if (window.matchMedia('(display-mode: standalone)').matches || nav.standalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
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
    <header className="sticky top-0 z-40 w-full h-[calc(3.5rem+env(safe-area-inset-top,0px))] md:h-14 flex-shrink-0 bg-white/85 dark:bg-[#0c0c16]/85 backdrop-blur-xl border-b border-gray-200/80 dark:border-white/10 flex items-center justify-between px-3 sm:px-4 md:px-6 pt-[env(safe-area-inset-top,0px)] md:pt-0 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5)] transition-all">
      {/* Left: Mobile Menu Toggle + Title */}
      <div className="flex items-center gap-2.5 min-w-0 max-w-[55%] sm:max-w-none">
        {/* Hamburger Menu Toggle (Mobile & Tablet) */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden h-9 w-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-gray-700 dark:text-gray-200 border border-gray-200/80 dark:border-white/10 shadow-2xs active:scale-95 transition-all cursor-pointer shrink-0"
          title="Open menu drawer"
          aria-label="Open menu drawer"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <div className="hidden sm:block h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 shrink-0" />
          <h1 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white tracking-tight truncate">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Right Actions: Search Pill, Pending Orders, Purge Cache, View Store */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Quick Spotlight Search Button */}
        {onOpenCommandPalette && (
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="group h-9 px-3 rounded-xl bg-slate-100/90 hover:bg-white dark:bg-white/[0.07] dark:hover:bg-white/[0.12] border border-gray-200/90 dark:border-white/10 flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all cursor-pointer active:scale-95 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-2xs"
            title="Search Navigation (Cmd+K)"
            aria-label="Search Navigation"
          >
            <Search className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
            <span className="hidden xl:inline text-xs font-semibold text-gray-600 dark:text-gray-300">Quick search...</span>
            <kbd className="hidden sm:inline-flex items-center text-[10px] font-bold bg-white dark:bg-white/15 px-1.5 py-0.5 rounded-md text-gray-600 dark:text-gray-200 border border-gray-200/90 dark:border-white/10 shadow-3xs font-mono">
              ⌘K
            </kbd>
          </button>
        )}

        {/* Pending Orders Notification Pill */}
        {pendingOrdersCount > 0 && (
          <Link
            href="/admin/orders"
            className="group h-9 px-2.5 sm:px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition-all text-xs font-bold shrink-0 shadow-2xs hover:shadow-xs active:scale-95"
            title={`${pendingOrdersCount} pending orders require fulfillment`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <ClipboardList className="h-3.5 w-3.5" />
            <span>{pendingOrdersCount > 99 ? '99+' : pendingOrdersCount}</span>
            <span className="hidden sm:inline text-[11px] font-semibold text-amber-700/90 dark:text-amber-300/80">Orders</span>
          </Link>
        )}

        {/* PWA Install App Button */}
        {installPrompt && !isInstalled && (
          <button
            type="button"
            onClick={handleInstallClick}
            className="h-9 px-3 rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border border-blue-600/30 flex items-center gap-1.5 transition-all text-xs font-bold shrink-0 shadow-xs hover:shadow-sm active:scale-95 cursor-pointer"
            title="Install Admin App (PWA)"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Install App</span>
          </button>
        )}

        {/* Purge Cache Button */}
        <PurgeCacheButton variant="ghost" />

        {/* Modern Flagship View Storefront Pill Button */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative h-9 px-3.5 rounded-xl bg-gradient-to-b from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 dark:from-white dark:to-gray-100 text-white dark:text-gray-950 border border-gray-900/10 dark:border-white/20 active:scale-95 transition-all duration-200 flex items-center gap-2 text-xs font-extrabold shadow-[0_2px_8px_-2px_rgba(0,0,0,0.25)] hover:shadow-[0_4px_16px_-2px_rgba(0,0,0,0.35)] shrink-0 cursor-pointer overflow-hidden"
          title="View Storefront (opens in new tab)"
        >
          <span className="relative z-10 flex items-center gap-1.5">
            <span className="hidden sm:inline">View Store</span>
            <span className="sm:hidden">Store</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </span>
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 pointer-events-none" />
        </Link>
      </div>
    </header>
  );
}
