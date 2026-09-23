'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Store, X, LogOut, ChevronDown } from '@/components/common/Icons';
import { NavSection } from './adminNavSections';
import { SmartNavScrollbar } from './SmartNavScrollbar';

interface AdminMobileDrawerProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  logoUrl: string | null;
  storeName: string;
  navSections: NavSection[];
  expandedSections: Record<string, boolean>;
  toggleSection: (key: string) => void;
  isItemActive: (href: string) => boolean;
  handleLogout: () => void;
  todayCounts?: Record<string, number>;
}

export function AdminMobileDrawer({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  logoUrl,
  storeName,
  navSections,
  expandedSections,
  toggleSection,
  isItemActive,
  handleLogout,
  todayCounts = {}
}: AdminMobileDrawerProps) {
  const navRef = useRef<HTMLElement>(null);

  return (
    <>
      {/* 📱 Mobile Drawer Backdrop (overlay) */}
      <div
        onClick={() => setIsMobileMenuOpen(false)}
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* 📱 Mobile Drawer Container (Sleek SaaS w-64 matching desktop sidebar) */}
      <div
        style={{ 
          background: 'linear-gradient(180deg, var(--color-primary, #C2185B) 0%, var(--color-secondary, #880E4F) 100%)' 
        }}
        className={`fixed inset-y-0 left-0 w-64 max-w-[80vw] text-white z-50 transform transition-transform duration-300 md:hidden flex flex-col h-full border-r border-white/10 shadow-2xl ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Drawer Header (Aligned to h-12 SaaS height) */}
        <div className="h-12 flex items-center justify-between px-3.5 border-b border-white/15 flex-shrink-0 bg-black/10">
          <div className="flex items-center gap-2 min-w-0">
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
              <span className="font-extrabold text-xs tracking-tight truncate block text-white">{storeName}</span>
              <span className="inline-flex items-center gap-1 text-[8.5px] font-bold text-emerald-300 leading-none">
                <span className="h-1 w-1 rounded-full bg-emerald-300 animate-pulse" />
                Live Console
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setIsMobileMenuOpen(false); }}
            className="h-7.5 w-7.5 flex items-center justify-center rounded-lg text-white/75 hover:text-white hover:bg-white/10 transition-all focus:outline-none active:scale-95 cursor-pointer"
            title="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Relative wrapper holding both scrollable navigation and the Smart Navigation Line */}
        <div className="relative flex-1 min-h-0 overflow-hidden">
          {/* Scrollable Navigation */}
          <nav
            ref={navRef}
            className="h-full px-2.5 py-2.5 overflow-y-auto overscroll-contain touch-pan-y space-y-2 scrollbar-none [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]"
          >
            {navSections.map(section => (
              <div key={section.key} className="space-y-0.5">
                {section.label && (
                  <button
                    type="button"
                    onClick={() => toggleSection(section.key)}
                    className="flex items-center justify-between w-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white/60 hover:text-white transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{section.label}</span>
                      {section.key === 'orders' && (todayCounts.orders || 0) > 0 && (
                        <span className="text-[8px] font-black text-[var(--color-primary,#C2185B)] bg-white px-1 rounded-full leading-none shadow-xs">
                          {todayCounts.orders}
                        </span>
                      )}
                      {section.key === 'customers' && (todayCounts.leads || 0) > 0 && (
                        <span className="text-[8px] font-black text-[var(--color-primary,#C2185B)] bg-white px-1 rounded-full leading-none shadow-xs">
                          {todayCounts.leads}
                        </span>
                      )}
                    </div>
                    <ChevronDown className={`h-2.5 w-2.5 text-white/50 transition-transform duration-200 ${expandedSections[section.key] ? 'rotate-0' : '-rotate-90'}`} />
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
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-2 px-2.5 py-1.5 min-h-[32px] rounded-lg text-xs font-bold transition-all ${
                            active
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

          {/* 🌟 Smart Recreated Navigation Line (Compact, 32px pill, interactive, modern) */}
          <SmartNavScrollbar containerRef={navRef} pillHeight={32} />
        </div>

        {/* Mobile Drawer Footer Logout */}
        <div className="p-2 border-t border-white/15 flex-shrink-0 bg-black/10">
          <button
            type="button"
            onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
            className="flex w-full items-center gap-2 px-2.5 py-1.5 min-h-[32px] rounded-lg text-xs font-bold text-white/80 hover:bg-white/15 hover:text-white transition-all cursor-pointer text-left"
          >
            <LogOut className="h-3.5 w-3.5 text-white/60" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}
