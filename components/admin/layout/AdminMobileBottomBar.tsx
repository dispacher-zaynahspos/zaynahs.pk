'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  ClipboardList,
  ShoppingBag,
  Users,
  Menu,
} from '@/components/common/Icons';

interface AdminMobileBottomBarProps {
  pathname: string;
  todayCounts: Record<string, number>;
  onOpenMobileMenu: () => void;
}

export function AdminMobileBottomBar({
  pathname,
  todayCounts,
  onOpenMobileMenu,
}: AdminMobileBottomBarProps) {
  const tabs = [
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      isActive: (p: string) => p === '/admin/dashboard' || p === '/admin',
      count: undefined,
    },
    {
      label: 'Orders',
      href: '/admin/orders',
      icon: ClipboardList,
      isActive: (p: string) => p.startsWith('/admin/orders'),
      count: todayCounts.pending,
    },
    {
      label: 'Products',
      href: '/admin/products',
      icon: ShoppingBag,
      isActive: (p: string) => p.startsWith('/admin/products'),
      count: undefined,
    },
    {
      label: 'Customers',
      href: '/admin/customers',
      icon: Users,
      isActive: (p: string) => p.startsWith('/admin/customers'),
      count: undefined,
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#16162a]/95 backdrop-blur-md border-t border-gray-200/80 dark:border-gray-800/80 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] transition-colors duration-200 pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="flex items-center justify-around h-16 px-1">
        {/* First 4 main tabs */}
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.isActive(pathname);
          const count = tab.count;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              prefetch
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] relative text-[10.5px] font-bold transition-all active:scale-95 cursor-pointer ${
                active
                  ? 'text-[var(--color-primary,#C2185B)] font-black'
                  : 'text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`h-5 w-5 mb-0.5 shrink-0 transition-transform ${
                    active ? 'scale-110 text-[var(--color-primary,#C2185B)]' : ''
                  }`}
                />
                {count !== undefined && count > 0 && (
                  <span className="absolute -top-1.5 -right-3 min-w-[16px] h-4 px-1 rounded-full bg-[var(--color-primary,#C2185B)] text-white text-[9px] font-black flex items-center justify-center leading-none shadow-xs border border-white dark:border-[#16162a]">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full bg-[var(--color-primary,#C2185B)] shadow-xs" />
                )}
              </div>
              <span className="mt-0.5 tracking-tight leading-none">{tab.label}</span>
            </Link>
          );
        })}

        {/* 5th Tab: "More" -> Opens Mobile Drawer */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] relative text-[10.5px] font-medium text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all active:scale-95 cursor-pointer"
        >
          <div className="relative flex items-center justify-center">
            <Menu className="h-5 w-5 mb-0.5 shrink-0" />
          </div>
          <span className="mt-0.5 tracking-tight leading-none">More</span>
        </button>
      </div>
    </nav>
  );
}
