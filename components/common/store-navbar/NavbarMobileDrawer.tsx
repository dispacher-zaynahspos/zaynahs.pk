'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Heart, User } from '@/components/common/Icons';
import ThemeToggle from '@/components/common/ThemeToggle';
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
  topBarEmail: string;
  storeName: string;
  renderMobileNavItem: (item: NavigationItem, depth?: number) => React.ReactNode;
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
  topBarEmail,
  storeName,
  renderMobileNavItem
}: NavbarMobileDrawerProps) {
  if (!mounted || !mobileMenuOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Drawer Container */}
      <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white dark:bg-[#0f0f1b] pt-5 pb-4 transition-transform duration-300 ease-in-out shadow-2xl">
        <div className="flex items-center justify-between px-4 pb-4 border-b border-gray-100 dark:border-gray-800">
          <span className="text-lg font-bold text-gray-900 dark:text-white">Menu</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="mt-2 flex-1 overflow-y-auto px-4 py-2 space-y-1">
          {navItems.map((item) => renderMobileNavItem(item))}
        </div>

        {/* Account / Quick Links */}
        {!isAdmin && (
          <div className="border-t border-gray-100 dark:border-gray-800 px-4 pt-4 space-y-3">
            <Link
              href={customerSession ? '/account' : '/login'}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-[#e94560]"
            >
              <User className="h-5 w-5" />
              <span>{customerSession ? 'My Account' : 'Login / Register'}</span>
            </Link>

            <Link
              href="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-[#e94560]"
            >
              <div className="flex items-center gap-3">
                <Heart className="h-5 w-5" />
                <span>Wishlist</span>
              </div>
              {wishlistCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-[#e94560]"
            >
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-5 w-5" />
                <span>Cart</span>
              </div>
              {totalItems > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e94560] text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        )}

        {/* Contact Info Footer */}
        <div className="mt-auto border-t border-gray-100 dark:border-gray-800 px-4 pt-4 text-xs text-gray-500 space-y-1">
          {topBarPhone && <p>📞 {topBarPhone}</p>}
          {topBarEmail && <p>✉️ {topBarEmail}</p>}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">© {storeName}</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
