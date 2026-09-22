'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { X, User, ShoppingCart, Heart, HelpCircle, Star, RefreshCw, Shield } from '@/components/common/Icons';
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

export default function NavbarMobileDrawer({
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
  renderMobileNavItem,
}: NavbarMobileDrawerProps) {
  if (!mounted || !mobileMenuOpen) return null;

  return createPortal(
    <div
      onClick={() => setMobileMenuOpen(false)}
      className="fixed inset-0 z-[150] bg-black/70 flex justify-start transition-all duration-300 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#16162a] w-4/5 max-w-xs h-[100dvh] shadow-2xl relative flex flex-col overflow-hidden scale-up duration-200 will-change-transform"
      >
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y p-6 pb-24">
          {/* Drawer Header */}
          <div className="flex items-center justify-between mb-6">
            <span className="font-black text-gray-900 dark:text-white uppercase tracking-wider">Menu</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer flex h-10 w-10 items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-white/5"
                title="Close Menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* 1. Custom Navigation Menu */}
          {!isAdmin && navItems.length > 0 && (
            <div className="mb-6">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-3">Navigation</span>
              <div className="space-y-1">
                {navItems.map((item) => renderMobileNavItem(item))}
              </div>
            </div>
          )}

          {/* 2. Secondary Links */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-3">Quick Links</span>
            <div className="space-y-2">
              {customerSession ? (
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 py-1.5 text-sm font-bold text-gray-900 dark:text-white hover:text-[#e94560] transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>My Account ({customerSession.name})</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 py-1.5 text-sm font-bold text-gray-900 dark:text-white hover:text-[#e94560] transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>Login / Register</span>
                </Link>
              )}
              <Link
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center gap-2.5 py-1.5 text-sm font-bold text-gray-900 dark:text-white hover:text-[#e94560] transition-colors cursor-pointer"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Shopping Cart {mounted && totalItems > 0 && `(${totalItems})`}</span>
              </Link>
              <Link
                href="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 py-1.5 text-sm font-bold text-gray-900 dark:text-white hover:text-[#e94560] transition-colors"
              >
                <Heart className="h-4 w-4" />
                <span>My Wishlist {mounted && wishlistCount > 0 && `(${wishlistCount})`}</span>
              </Link>
              {settings?.showFaqInNav !== false && (
                <Link
                  href="/faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 py-1.5 text-sm font-bold text-gray-900 dark:text-white hover:text-[#e94560] transition-colors"
                >
                  <HelpCircle className="h-4 w-4" />
                  <span>FAQ</span>
                </Link>
              )}
              <Link
                href="/reviews"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 py-1.5 text-sm font-bold text-gray-900 dark:text-white hover:text-[#e94560] transition-colors"
              >
                <Star className="h-4 w-4" />
                <span>Reviews</span>
              </Link>
              {settings?.showReturnsInNav !== false && (
                <Link
                  href="/returns"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 py-1.5 text-sm font-bold text-gray-900 dark:text-white hover:text-[#e94560] transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Return Policy</span>
                </Link>
              )}
              {settings?.showPrivacyInNav !== false && (
                <Link
                  href="/privacy-policy"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 py-1.5 text-sm font-bold text-gray-900 dark:text-white hover:text-[#e94560] transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  <span>Privacy Policy</span>
                </Link>
              )}
            </div>
          </div>

          {/* Contacts Section */}
          {(topBarPhone || topBarEmail) && (
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-3">Contact Us</span>
              <div className="space-y-3">
                {topBarPhone && (
                  <a
                    href={`tel:${topBarPhone.replace(/\D/g, '')}`}
                    className="flex items-center gap-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-[#e94560] transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6.62 10.79a15.15 15.15 0 006.57 6.57l2.2-2.2a1 1 0 01.9-.27 11.36 11.36 0 00.57 3.58 1 1 0 01-.27.9l-2.2 2.2z" />
                    </svg>
                    <span>{topBarPhone}</span>
                  </a>
                )}
                {topBarEmail && (
                  <a
                    href={`mailto:${topBarEmail}`}
                    className="flex items-center gap-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-[#e94560] transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    <span className="truncate">{topBarEmail}</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer strip */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400 dark:text-gray-500 font-semibold tracking-wider uppercase shrink-0">
          &copy; {new Date().getFullYear()} {storeName}
        </div>
      </div>
    </div>,
    document.body
  );
}
