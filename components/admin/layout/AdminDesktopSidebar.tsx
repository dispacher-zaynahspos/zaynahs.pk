'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Store, LogOut, ChevronDown } from '@/components/common/Icons';
import { NavSection } from './adminNavSections';
import { SmartNavScrollbar } from './SmartNavScrollbar';

interface AdminDesktopSidebarProps {
  logoUrl: string | null;
  storeName: string;
  navSections: NavSection[];
  expandedSections: Record<string, boolean>;
  toggleSection: (key: string) => void;
  isItemActive: (href: string) => boolean;
  todayCounts: Record<string, number>;
  handleLogout: () => void;
}

export function AdminDesktopSidebar({
  logoUrl,
  storeName,
  navSections,
  expandedSections,
  toggleSection,
  isItemActive,
  todayCounts,
  handleLogout
}: AdminDesktopSidebarProps) {
  const navRef = useRef<HTMLElement>(null);

  return (
    <aside 
      style={{ 
        background: 'linear-gradient(180deg, var(--color-primary, #C2185B) 0%, var(--color-secondary, #880E4F) 100%)' 
      }}
      className="admin-desktop-sidebar hidden md:flex md:w-64 text-white flex-col flex-shrink-0 md:h-screen md:sticky md:top-0 border-r border-white/10 shadow-2xl select-none"
    >
      {/* Brand logo header with live status */}
      <div className="flex h-12 md:h-13 items-center justify-between px-3.5 border-b border-white/15 bg-black/10 backdrop-blur-xs flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden p-0.5 border border-white/20">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={storeName}
                className="h-full w-full object-contain rounded-full"
                loading="eager"
              />
            ) : (
              <div className="h-full w-full rounded-full bg-white/20 flex items-center justify-center">
                <Store className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <span className="font-extrabold text-xs tracking-tight truncate block leading-tight text-white">{storeName}</span>
            <span className="inline-flex items-center gap-1.5 text-[8.5px] font-bold text-emerald-300 mt-0.5 leading-none">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
              Live Console
            </span>
          </div>
        </div>
      </div>

      {/* Relative wrapper holding both scrollable navigation and the Smart Navigation Line */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        {/* Desktop Vertical nav links */}
        <nav
          ref={navRef}
          className="h-full px-2.5 py-2.5 overflow-y-auto space-y-2 scrollbar-none [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]"
        >
          {navSections.map(section => (
            <div key={section.key} className="space-y-0.5">
              {section.label && (
                <button
                  type="button"
                  onClick={() => toggleSection(section.key)}
                  className="flex items-center justify-between w-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white/60 hover:text-white transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="group-hover:translate-x-0.5 transition-transform">{section.label}</span>
                    {section.key === 'orders' && todayCounts.orders > 0 && (
                      <span className="text-[8px] font-black text-[var(--color-primary,#C2185B)] bg-white px-1 rounded-full leading-none shadow-xs">
                        {todayCounts.orders}
                      </span>
                    )}
                    {section.key === 'customers' && todayCounts.leads > 0 && (
                      <span className="text-[8px] font-black text-[var(--color-primary,#C2185B)] bg-white px-1 rounded-full leading-none shadow-xs">
                        {todayCounts.leads}
                      </span>
                    )}
                  </div>
                  <ChevronDown className={`h-2.5 w-2.5 text-white/50 group-hover:text-white transition-transform duration-200 ${expandedSections[section.key] ? 'rotate-0' : '-rotate-90'}`} />
                </button>
              )}
              {expandedSections[section.key] && (
                <div className="space-y-0.5">
                  {section.items.map(item => {
                    const Icon = item.icon;
                    const active = isItemActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${active
                            ? 'bg-white text-gray-950 font-black shadow-sm'
                            : 'text-white/80 hover:text-white hover:bg-white/10 font-semibold'
                          }`}
                      >
                        <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${active ? 'text-[var(--color-primary,#C2185B)]' : 'text-white/70'}`} />
                        <span className="truncate">{item.label}</span>
                        {(item.label === 'Orders Log' || item.label === 'Abandoned Carts' || item.label === 'WhatsApp Leads') && (
                          (() => {
                            const count = item.label === 'Orders Log' ? todayCounts.pending
                              : item.label === 'Abandoned Carts' ? todayCounts.pendingCarts
                                : todayCounts.leads;
                            if (count !== undefined && count > 0) return (
                              <span className={`ml-auto text-[8px] font-black px-1.5 py-0.5 rounded-full leading-none ${
                                active ? 'bg-[var(--color-primary,#C2185B)] text-white shadow-2xs' : 'bg-white/90 text-[var(--color-primary,#C2185B)]'
                              }`}>
                                {count > 99 ? '99+' : count}
                              </span>
                            );
                            return null;
                          })()
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* 🌟 Smart Recreated Navigation Line (Compact, 34px pill, interactive, modern) */}
        <SmartNavScrollbar containerRef={navRef} pillHeight={34} />
      </div>

      {/* Desktop Footer Logout */}
      <div className="p-2 border-t border-white/15 bg-black/10 flex-shrink-0">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white/80 hover:bg-white/15 hover:text-white transition-all cursor-pointer text-left group"
        >
          <LogOut className="h-3.5 w-3.5 text-white/60 group-hover:text-white transition-colors" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
