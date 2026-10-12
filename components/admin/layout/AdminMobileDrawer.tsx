'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import {
  Store,
  X,
  LogOut,
  ChevronDown,
  Search,
  User,
} from '@/components/common/Icons';
import { NavSection } from './adminNavSections';
import { SmartNavScrollbar } from './SmartNavScrollbar';
import { Modal } from '@/components/common/Modal';

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
  onOpenCommandPalette?: () => void;
  adminEmail?: string;
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
  todayCounts = {},
  onOpenCommandPalette,
  adminEmail,
}: AdminMobileDrawerProps) {
  const navRef = useRef<HTMLElement>(null);

  const getItemBadge = (badgeKey?: string) => {
    if (!badgeKey) return null;
    const count = todayCounts[badgeKey];
    if (count === undefined || count <= 0) return null;
    return count > 99 ? '99+' : count;
  };

  // Shared overlay system (RULE MODAL1) — smooth slide-in/out + scroll-lock + ESC + swipe.
  return (
    <Modal
      open={isMobileMenuOpen}
      onClose={() => setIsMobileMenuOpen(false)}
      variant="drawer-left"
      ariaLabel="Navigation Menu"
      showClose={false}
      className="lg:hidden !w-[86vw] !max-w-[340px] !bg-transparent !border-0"
    >
      <div
        style={{
          background:
            'linear-gradient(180deg, var(--color-primary, #C2185B) 0%, var(--color-secondary, #880E4F) 100%)',
        }}
        className="text-white flex flex-col h-full border-r border-white/10 pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]"
      >
        {/* Drawer Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/15 flex-shrink-0 bg-black/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden p-0.5 border border-white/20">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={storeName}
                  className="h-full w-full object-contain rounded-full"
                  loading="eager"
                />
              ) : (
                <div className="h-full w-full rounded-full bg-white/20 flex items-center justify-center">
                  <Store className="h-4.5 w-4.5 text-[var(--color-primary,#C2185B)]" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-sm tracking-tight truncate block text-white">
                {storeName}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-emerald-300 leading-none">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                Live Console
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="h-10 w-10 flex items-center justify-center rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all focus:outline-none active:scale-95 cursor-pointer"
            title="Close menu"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Search Trigger Inside Drawer */}
        {onOpenCommandPalette && (
          <div className="p-3 pb-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenCommandPalette();
              }}
              className="w-full flex items-center justify-between px-3 h-10 rounded-xl bg-black/35 hover:bg-black/45 text-white border border-white/20 shadow-inner transition-all cursor-pointer active:scale-98"
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-white/85" />
                <span className="text-xs font-semibold text-white/90">Quick search...</span>
              </div>
              <span className="text-[11px] font-black bg-white text-gray-950 px-2 py-0.5 rounded-md shadow-xs">
                Search
              </span>
            </button>
          </div>
        )}

        {/* Scrollable Navigation */}
        <div className="relative flex-1 min-h-0 overflow-hidden">
          <nav
            ref={navRef}
            aria-label="Mobile Navigation Links"
            className="h-full px-3 py-2.5 overflow-y-auto overscroll-contain touch-pan-y space-y-4 scrollbar-none [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]"
          >
            {navSections.map((section) => {
              const isExpanded = expandedSections[section.key] ?? true;

              return (
                <div key={section.key} className="space-y-1">
                  {section.label && (
                    <button
                      type="button"
                      onClick={() => toggleSection(section.key)}
                      aria-expanded={isExpanded}
                      className="flex items-center justify-between w-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-white/60 hover:text-white transition-colors cursor-pointer group"
                    >
                      <span>{section.label}</span>
                      <ChevronDown
                        className={`h-3 w-3 text-white/50 transition-transform duration-200 ${
                          isExpanded ? 'rotate-0' : '-rotate-90'
                        }`}
                      />
                    </button>
                  )}

                  {isExpanded && (
                    <div className="space-y-1 pt-0.5">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const active = isItemActive(item.href);
                        const badge = getItemBadge(item.badgeKey);

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 h-11 min-h-[44px] rounded-xl text-[14.5px] transition-all duration-150 active:scale-98 relative ${
                              active
                                ? 'bg-white text-gray-950 font-black shadow-md'
                                : 'text-white/85 hover:text-white hover:bg-white/12 font-medium'
                            }`}
                          >
                            {active && (
                              <span className="absolute left-0 inset-y-2 w-1 rounded-r-full bg-[var(--color-primary,#C2185B)]" />
                            )}
                            <Icon
                              className={`h-5 w-5 flex-shrink-0 ${
                                active
                                  ? 'text-[var(--color-primary,#C2185B)]'
                                  : 'text-white/80'
                              }`}
                            />
                            <span className="truncate">{item.label}</span>

                            {badge && (
                              <span
                                className={`ml-auto text-[11px] font-black px-2 py-0.5 rounded-full leading-none ${
                                  active
                                    ? 'bg-[var(--color-primary,#C2185B)] text-white shadow-xs'
                                    : 'bg-white text-[var(--color-primary,#C2185B)] shadow-xs'
                                }`}
                              >
                                {badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <SmartNavScrollbar containerRef={navRef} pillHeight={36} />
        </div>

        {/* 👤 Drawer Footer Profile & Sign Out */}
        <div className="p-3 border-t border-white/15 flex-shrink-0 bg-black/15 space-y-2.5">
          <div className="p-2.5 rounded-xl bg-black/20 border border-white/10 shadow-xs flex items-center justify-between gap-2.5">
            <Link
              href="/admin/settings/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 min-w-0 flex-1"
            >
              <div className="h-9 w-9 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-xs ring-1 ring-white/30 shrink-0">
                <User className="h-4.5 w-4.5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {adminEmail ? adminEmail.split('@')[0] : 'Store Admin'}
                </div>
                <div className="text-[10px] text-emerald-300 font-medium truncate">
                  Administrator
                </div>
              </div>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              handleLogout();
            }}
            className="flex w-full items-center justify-center gap-2 h-10 min-h-[44px] px-3 rounded-xl text-xs font-bold text-white/90 bg-white/10 hover:bg-rose-500/25 hover:text-white border border-white/10 hover:border-rose-400/40 transition-all cursor-pointer active:scale-98"
          >
            <LogOut className="h-4 w-4 text-white/70" />
            <span>Sign Out of Console</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
