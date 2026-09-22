'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, Heart, User } from '@/components/common/Icons';

interface NavbarActionsProps {
  isAdmin: boolean;
  customTextColorStyle: React.CSSProperties;
  setSearchOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  mounted: boolean;
  wishlistCount: number;
  totalItems: number;
  customerSession: any;
}

export function NavSearchButton({
  isAdmin,
  setSearchOpen,
  customTextColorStyle,
}: Pick<NavbarActionsProps, 'isAdmin' | 'setSearchOpen' | 'customTextColorStyle'>) {
  if (isAdmin) return null;
  return (
    <button
      key="search"
      onClick={() => setSearchOpen(true)}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-[#1a1a2e] dark:hover:text-white transition-all cursor-pointer animate-fade-in"
      title="Search Store"
    >
      <Search className="h-5 w-5" style={customTextColorStyle} />
    </button>
  );
}

export function NavWishlistLink({
  isAdmin,
  isMobile,
  mounted,
  wishlistCount,
  customTextColorStyle,
}: Pick<NavbarActionsProps, 'isAdmin' | 'mounted' | 'wishlistCount' | 'customTextColorStyle'> & { isMobile?: boolean }) {
  if (isAdmin) return null;
  return (
    <Link
      href="/wishlist"
      key="wishlist"
      id={isMobile ? 'header-wishlist-icon-mobile' : 'header-wishlist-icon-desktop'}
      className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-[#1a1a2e] dark:hover:text-white transition-all"
      title="My Wishlist"
    >
      <Heart className="h-5 w-5" style={customTextColorStyle} />
      {mounted && wishlistCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-[#0f0f1b]">
          {wishlistCount}
        </span>
      )}
    </Link>
  );
}

export function NavCartLink({
  isAdmin,
  isMobile,
  mounted,
  totalItems,
  customTextColorStyle,
}: Pick<NavbarActionsProps, 'isAdmin' | 'mounted' | 'totalItems' | 'customTextColorStyle'> & { isMobile?: boolean }) {
  if (isAdmin) return null;
  return (
    <Link
      href="/cart"
      key="cart"
      id={isMobile ? 'header-cart-icon-mobile' : 'header-cart-icon-desktop'}
      className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-[#1a1a2e] dark:hover:text-white transition-all cursor-pointer"
    >
      <ShoppingCart className="h-5 w-5" style={customTextColorStyle} />
      {mounted && totalItems > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#e94560] text-[10px] font-bold text-white ring-2 ring-white dark:ring-[#0f0f1b]">
          {totalItems}
        </span>
      )}
    </Link>
  );
}

export function NavAccountLink({
  isAdmin,
  customerSession,
  customTextColorStyle,
}: Pick<NavbarActionsProps, 'isAdmin' | 'customerSession' | 'customTextColorStyle'>) {
  if (isAdmin) return null;
  return (
    <Link
      href={customerSession ? '/account' : '/login'}
      key="account"
      className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-[#1a1a2e] dark:hover:text-white transition-all"
      title={customerSession ? 'My Account' : 'Login / Register'}
    >
      <User className="h-5 w-5" style={customTextColorStyle} />
    </Link>
  );
}

export function NavAdminLink({
  isAdmin,
  customTextColorStyle,
}: Pick<NavbarActionsProps, 'isAdmin' | 'customTextColorStyle'>) {
  if (!isAdmin) return null;
  return (
    <Link
      href="/"
      key="admin-link"
      className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-[#e94560] transition-colors shrink-0"
      style={customTextColorStyle}
    >
      <span>Go to Shop</span>
    </Link>
  );
}

export function NavMobileMenuButton({
  setMobileMenuOpen,
  customTextColorStyle,
}: Pick<NavbarActionsProps, 'setMobileMenuOpen' | 'customTextColorStyle'>) {
  return (
    <button
      key="mobile-menu"
      onClick={() => setMobileMenuOpen(true)}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-[#1a1a2e] dark:hover:text-white transition-all cursor-pointer"
      title="Open Menu"
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={customTextColorStyle}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}
