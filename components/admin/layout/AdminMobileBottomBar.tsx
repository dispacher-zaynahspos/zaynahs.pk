'use client';

import React from 'react';
import Link from 'next/link';
import { ClipboardList, Star, Users, ShoppingCart, MessageSquare } from '@/components/common/Icons';

interface AdminMobileBottomBarProps {
  pathname: string;
  todayCounts: Record<string, number>;
}

export function AdminMobileBottomBar({ pathname, todayCounts }: AdminMobileBottomBarProps) {
  const tabs = [
    { label: 'Orders', href: '/admin/orders', icon: ClipboardList, countKey: 'pending' },
    { label: 'Reviews', href: '/admin/reviews', icon: Star, countKey: undefined },
    { label: 'Customers', href: '/admin/customers', icon: Users, countKey: undefined },
    { label: 'Carts', href: '/admin/abandoned-carts', icon: ShoppingCart, countKey: 'pendingCarts' },
    { label: 'Leads', href: '/admin/leads', icon: MessageSquare, countKey: 'leads' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#16162a]/95 backdrop-blur-md border-t border-gray-200/80 dark:border-gray-800/80 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] transition-colors duration-200">
      <div className="flex items-center justify-around h-16 px-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const active = pathname.startsWith(tab.href);
          const count = tab.countKey ? todayCounts[tab.countKey] : undefined;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 h-full relative text-[10px] font-bold transition-all active:scale-95 ${
                active
                  ? 'text-[#e94560] font-black'
                  : 'text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={`h-5 w-5 mb-0.5 shrink-0 transition-transform ${active ? 'scale-110' : ''}`} />
                {count !== undefined && count > 0 && (
                  <span className="absolute -top-1.5 -right-3 min-w-[16px] h-4 px-1 rounded-full bg-[#e94560] text-white text-[9px] font-black flex items-center justify-center leading-none shadow-xs">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full bg-[#e94560] shadow-xs" />
                )}
              </div>
              <span className="mt-0.5 tracking-tight leading-none">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

