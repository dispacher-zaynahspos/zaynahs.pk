'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Heart, User, X, Search, Truck, ChevronRight, WhatsAppIcon } from '@/components/common/Icons';
import { cleanWhatsAppPhone } from '@/lib/utils/whatsapp';
import { NavigationItem, StoreSettings } from '@/lib/types';

interface NavbarMobileDrawerProps {
  mounted: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  isAdmin: boolean;
  navItems: NavigationItem[];
  customerSession: any;
  totalItems: number;
  wishlistCount: number;
  settings?: StoreSettings;
  topBarPhone: string;
  topBarEmail?: string;
  storeName: string;
  renderMobileNavItem: (item: NavigationItem, depth?: number) => React.ReactNode;
  logoUrl?: string;
  onOpenSearch?: () => void;
}

export function NavbarMobileDrawer({
  mounted,
  mobileMenuOpen,
  setMobileMenuOpen,
  isAdmin,
  navItems,
  customerSession,
  totalItems,
  wishlistCount,
  settings,
  topBarPhone,
  storeName,
  renderMobileNavItem,
  logoUrl,
  onOpenSearch,
}: NavbarMobileDrawerProps) {
  if (!mounted || !mobileMenuOpen) return null;

  const whatsappNumber = settings?.whatsapp_number || settings?.floating_whatsapp_number || topBarPhone;
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${cleanWhatsAppPhone(whatsappNumber)}?text=${encodeURIComponent(
        `Hello! I am browsing ${storeName} and need some assistance.`
      )}`
    : null;

  const handleSearchClick = () => {
    setMobileMenuOpen(false);
    if (onOpenSearch) onOpenSearch();
  };

  return (
    <div className="fixed inset-0 z-[999] flex md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Drawer Container */}
      <div className="relative flex w-full max-w-[340px] sm:max-w-sm flex-1 flex-col bg-white dark:bg-[#0c0c16] text-gray-900 dark:text-white shadow-2xl h-full transition-transform duration-300 ease-in-out border-r border-gray-100 dark:border-white/5 animate-in slide-in-from-left duration-300 select-none">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2.5 min-w-0">
            {logoUrl ? (
              <div className="relative h-8 w-28 shrink-0">
                <Image
                  src={logoUrl}
                  alt={storeName}
                  fill
                  sizes="120px"
                  className="object-contain object-left"
                />
              </div>
            ) : (
              <span className="text-base font-black tracking-tight text-gray-950 dark:text-white truncate">
                {storeName}
              </span>
            )}
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Official Store</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100/80 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all cursor-pointer active:scale-90"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Search Trigger */}
        {onOpenSearch && (
          <div className="px-4 pt-3 pb-1">
            <button
              type="button"
              onClick={handleSearchClick}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gray-100/70 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-200/60 dark:border-white/5 text-gray-400 dark:text-gray-500 text-xs font-semibold transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
                <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">
                  Search products, collections...
                </span>
              </div>
            </button>
          </div>
        )}

        {/* Navigation Items (Main Catalog List) */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-2 space-y-0.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-3 pt-2.5 pb-1">
            Collections & Categories
          </div>
          {navItems.map((item) => renderMobileNavItem(item))}
        </div>

        {/* Smart Compact Quick Actions (4-Column Bar) */}
        {!isAdmin && (
          <div className="border-t border-gray-100 dark:border-white/5 px-3 py-2 bg-gray-50/70 dark:bg-white/[0.02]">
            <div className="grid grid-cols-4 gap-1.5">
              {/* Account */}
              <Link
                href={customerSession ? '/account' : '/login'}
                onClick={() => setMobileMenuOpen(false)}
                className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-white dark:hover:bg-white/10 active:scale-95 transition-all text-center group"
              >
                <div className="h-8 w-8 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-700 dark:text-gray-200 shrink-0 group-hover:scale-105 transition-transform">
                  <User className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold text-gray-800 dark:text-gray-200 mt-1 truncate max-w-full">
                  {customerSession ? 'Account' : 'Sign In'}
                </span>
              </Link>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-white dark:hover:bg-white/10 active:scale-95 transition-all text-center relative group"
              >
                <div className="h-8 w-8 rounded-xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-600 shrink-0 group-hover:scale-105 transition-transform">
                  <Heart className="h-4 w-4 fill-rose-600/20" />
                </div>
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-2 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[8.5px] font-black text-white shadow-xs">
                    {wishlistCount}
                  </span>
                )}
                <span className="text-[10px] font-bold text-gray-800 dark:text-gray-200 mt-1 truncate max-w-full">
                  Wishlist
                </span>
              </Link>

              {/* Shopping Cart */}
              <Link
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-white dark:hover:bg-white/10 active:scale-95 transition-all text-center relative group"
              >
                <div className="h-8 w-8 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                {totalItems > 0 && (
                  <span
                    style={{ backgroundColor: 'var(--color-primary, #0f172a)' }}
                    className="absolute top-1 right-2 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full text-[8.5px] font-black text-white shadow-xs"
                  >
                    {totalItems}
                  </span>
                )}
                <span className="text-[10px] font-bold text-gray-800 dark:text-gray-200 mt-1 truncate max-w-full">
                  Cart
                </span>
              </Link>

              {/* Track Order */}
              <Link
                href="/track-order"
                onClick={() => setMobileMenuOpen(false)}
                className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-white dark:hover:bg-white/10 active:scale-95 transition-all text-center group"
              >
                <div className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-105 transition-transform">
                  <Truck className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold text-gray-800 dark:text-gray-200 mt-1 truncate max-w-full">
                  Track
                </span>
              </Link>
            </div>
          </div>
        )}

        {/* WhatsApp Customer Support - Slim Luxury Row */}
        {whatsappUrl && (
          <div className="px-3 py-1.5 border-t border-gray-100 dark:border-white/5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200 transition-all cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-6 w-6 rounded-lg bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-2xs">
                  <WhatsAppIcon className="h-3.5 w-3.5 fill-current" />
                </div>
                <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100 truncate">
                  WhatsApp Support
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        )}

        {/* Drawer Footer - Minimal & Well-Aligned */}
        <div className="mt-auto border-t border-gray-100 dark:border-white/5 px-5 pt-3.5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0.75rem))] text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
          <span className="font-bold text-gray-700 dark:text-gray-300 tracking-tight">© {storeName}</span>
          {topBarPhone && (
            <a
              href={`tel:${topBarPhone.replace(/\D/g, '')}`}
              className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white font-medium transition-colors"
            >
              {topBarPhone}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
