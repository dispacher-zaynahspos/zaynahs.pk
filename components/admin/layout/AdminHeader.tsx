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
    <header className="sticky top-0 z-40 w-full h-[calc(3.5rem+env(safe-area-inset-top,0px))] md:h-14 flex-shrink-0 bg-white/95 dark:bg-[#0c0c16]/95 backdrop-blur-md border-b border-gray-100 dark:border-white/5 flex items-center justify-between px-3 sm:px-4 md:px-6 pt-[env(safe-area-inset-top,0px)] md:pt-0 transition-colors">
      {/* Left: Mobile Menu Toggle + Title */}
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Hamburger Menu Toggle (Mobile & Tablet) - Pure Icon */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden h-9 w-9 flex items-center justify-center rounded-xl text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
          title="Open menu"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Right Actions: Clean Icons Only (No shadows, No box borders, No bulky pill text) */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* Quick Spotlight Search Icon */}
        {onOpenCommandPalette && (
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="h-9 w-9 flex items-center justify-center rounded-xl text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer"
            title="Search Navigation (⌘K)"
            aria-label="Search Navigation"
          >
            <Search className="h-4.5 w-4.5" />
          </button>
        )}

        {/* Pending Orders Icon with subtle badge */}
        {pendingOrdersCount > 0 && (
          <Link
            href="/admin/orders"
            className="relative h-9 w-9 flex items-center justify-center rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 active:scale-95 transition-colors"
            title={`${pendingOrdersCount} pending orders`}
            aria-label="Pending Orders"
          >
            <ClipboardList className="h-4.5 w-4.5" />
            <span className="absolute top-1 right-1 flex items-center justify-center min-w-[15px] h-3.5 px-1 rounded-full bg-amber-500 text-white text-[9px] font-bold leading-none">
              {pendingOrdersCount > 99 ? '99+' : pendingOrdersCount}
            </span>
          </Link>
        )}

        {/* PWA Install App Icon */}
        {installPrompt && !isInstalled && (
          <button
            type="button"
            onClick={handleInstallClick}
            className="h-9 w-9 flex items-center justify-center rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 active:scale-95 transition-colors cursor-pointer"
            title="Install Admin App"
            aria-label="Install Admin App"
          >
            <Download className="h-4.5 w-4.5" />
          </button>
        )}

        {/* Purge Cache Icon Only */}
        <PurgeCacheButton variant="minimal" iconOnly />

        {/* View Storefront Icon */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="h-9 w-9 flex items-center justify-center rounded-xl text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer"
          title="View Storefront (opens in new tab)"
          aria-label="View Storefront"
        >
          <ExternalLink className="h-4.5 w-4.5" />
        </Link>
      </div>
    </header>
  );
}
