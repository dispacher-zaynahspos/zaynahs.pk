'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import {
  Store,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  ExternalLink,
  User,
  Sun,
  Moon,
} from '@/components/common/Icons';
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
  isCollapsed: boolean;
  toggleCollapse: () => void;
  onOpenCommandPalette: () => void;
  adminEmail?: string;
}

export function AdminDesktopSidebar({
  logoUrl,
  storeName,
  navSections,
  expandedSections,
  toggleSection,
  isItemActive,
  todayCounts,
  handleLogout,
  isCollapsed,
  toggleCollapse,
  onOpenCommandPalette,
  adminEmail,
}: AdminDesktopSidebarProps) {
  const navRef = useRef<HTMLElement>(null);

  // Helper to extract badge count for an item
  const getItemBadge = (badgeKey?: string) => {
    if (!badgeKey) return null;
    const count = todayCounts[badgeKey];
    if (count === undefined || count <= 0) return null;
    return count > 99 ? '99+' : count;
  };

  return (
    <aside
      aria-label="Admin Navigation"
      style={{
        background:
          'linear-gradient(180deg, var(--color-primary, #C2185B) 0%, var(--color-secondary, #880E4F) 100%)',
      }}
      className={`admin-desktop-sidebar hidden md:flex text-white flex-col flex-shrink-0 h-screen sticky top-0 border-r border-white/10 shadow-2xl select-none transition-[width] duration-200 ease-in-out z-30 ${
        isCollapsed ? 'w-[76px]' : 'w-[280px]'
      }`}
    >
      {/* 🏷️ Top Brand Block */}
      <div
        className={`flex items-center border-b border-white/15 bg-black/10 backdrop-blur-xs flex-shrink-0 transition-all ${
          isCollapsed ? 'h-16 px-2 justify-center flex-col gap-1' : 'h-16 px-3.5 justify-between'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Logo */}
          <Link
            href="/admin/dashboard"
            className="h-9 w-9 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden p-0.5 border border-white/20 hover:scale-105 transition-transform"
            title={`${storeName} - Dashboard`}
          >
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
          </Link>

          {/* Store Info (Expanded Only) */}
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[13.5px] tracking-tight truncate block leading-tight text-white">
                  {storeName}
                </span>
                <Link
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white transition-colors"
                  title="View Storefront (new tab)"
                >
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-emerald-300 mt-0.5 leading-none">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                Live Console
              </span>
            </div>
          )}
        </div>

        {/* Collapse Toggle Button */}
        <button
          type="button"
          onClick={toggleCollapse}
          className="h-7 w-7 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar to rail'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* 🔍 Search / Command Palette Trigger */}
      <div className={`flex-shrink-0 ${isCollapsed ? 'p-2 flex justify-center' : 'px-3 py-2.5'}`}>
        {isCollapsed ? (
          <div className="relative group">
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="h-11 w-11 rounded-xl bg-black/35 hover:bg-black/50 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 active:scale-95 shadow-inner"
              aria-label="Quick Search (Cmd+K)"
            >
              <Search className="h-5 w-5" />
            </button>
            <div className="absolute left-[82px] top-1/2 -translate-y-1/2 z-50 px-2.5 py-1.5 rounded-lg bg-gray-950/95 text-white text-xs font-bold whitespace-nowrap shadow-xl border border-white/15 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-1.5">
              <span>Quick Search</span>
              <kbd className="text-[10px] bg-white text-gray-950 font-black px-1.5 py-0.5 rounded font-mono">⌘ / Ctrl K</kbd>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-3 h-10 rounded-xl bg-black/35 hover:bg-black/45 text-white border border-white/20 shadow-inner transition-all cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 active:scale-98"
          >
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-white/85 group-hover:text-white transition-colors" />
              <span className="text-xs font-semibold text-white/90">Quick search...</span>
            </div>
            <kbd className="text-[11px] font-black bg-white text-gray-950 px-2 py-0.5 rounded-md shadow-xs border border-white/40 font-mono tracking-tight">
              ⌘ / Ctrl K
            </kbd>
          </button>
        )}
      </div>

      {/* 🧭 Vertical Scrollable Navigation */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        {/* Subtle Top Fade Shadow */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-black/15 to-transparent z-10" />

        <nav
          ref={navRef}
          aria-label="Admin Navigation Links"
          className={`h-full overflow-y-auto overscroll-contain scrollbar-none [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none] ${
            isCollapsed ? 'px-2 py-2 space-y-2' : 'px-3 py-2 space-y-4'
          }`}
        >
          {navSections.map((section, sectionIdx) => {
            const isExpanded = expandedSections[section.key] ?? true;

            // In collapsed rail mode: render group divider if not first
            if (isCollapsed) {
              return (
                <div key={section.key} className="space-y-1">
                  {sectionIdx > 0 && (
                    <div className="my-2.5 mx-auto w-8 border-t border-white/15" />
                  )}
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isItemActive(item.href);
                    const badge = getItemBadge(item.badgeKey);

                    return (
                      <div key={item.href} className="relative group flex justify-center">
                        <Link
                          href={item.href}
                          prefetch
                          className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-150 relative active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                            active
                              ? 'bg-white text-gray-950 font-black shadow-md'
                              : 'text-white/80 hover:text-white hover:bg-white/15'
                          }`}
                        >
                          <Icon
                            className={`h-5 w-5 flex-shrink-0 transition-transform ${
                              active
                                ? 'text-[var(--color-primary,#C2185B)] scale-105'
                                : 'text-white/90 group-hover:scale-110'
                            }`}
                          />
                          {/* Item Badge Dot in Collapsed Rail */}
                          {badge && (
                            <span className="absolute -top-1 -right-1 min-w-[18px] h-4 px-1 rounded-full bg-white text-[var(--color-primary,#C2185B)] font-black text-[9px] flex items-center justify-center shadow-xs border border-[var(--color-primary,#C2185B)]">
                              {badge}
                            </span>
                          )}
                          {active && (
                            <span className="absolute left-0 inset-y-2 w-1 rounded-r-full bg-[var(--color-primary,#C2185B)]" />
                          )}
                        </Link>

                        {/* Floating Tooltip in Collapsed Rail */}
                        <div className="absolute left-[78px] top-1/2 -translate-y-1/2 z-50 px-3 py-1.5 rounded-xl bg-gray-950/95 text-white text-xs font-bold whitespace-nowrap shadow-2xl border border-white/15 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-2">
                          <span>{item.label}</span>
                          {badge && (
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-[var(--color-primary,#C2185B)] text-white">
                              {badge}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            }

            // In expanded mode: render full collapsible group
            return (
              <div key={section.key} className="space-y-1">
                {/* Group Header (Collapsible, NO duplicate badge) */}
                {section.label && (
                  <button
                    type="button"
                    onClick={() => toggleSection(section.key)}
                    aria-expanded={isExpanded}
                    className="flex items-center justify-between w-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-white/60 hover:text-white transition-colors cursor-pointer group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 rounded-lg"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">
                      {section.label}
                    </span>
                    <ChevronDown
                      className={`h-3 w-3 text-white/50 group-hover:text-white transition-transform duration-200 ${
                        isExpanded ? 'rotate-0' : '-rotate-90'
                      }`}
                    />
                  </button>
                )}

                {/* Group Items */}
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
                          prefetch
                          className={`flex items-center gap-3 px-3 h-11 rounded-xl text-[14.5px] transition-all duration-150 relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                            active
                              ? 'bg-white text-gray-950 font-black shadow-md shadow-black/10'
                              : 'text-white/85 hover:text-white hover:bg-white/12 active:bg-white/18 font-medium'
                          }`}
                        >
                          {/* Active Left Indicator Bar */}
                          {active && (
                            <span className="absolute left-0 inset-y-2 w-1 rounded-r-full bg-[var(--color-primary,#C2185B)]" />
                          )}

                          <Icon
                            className={`h-5 w-5 flex-shrink-0 transition-transform duration-150 ${
                              active
                                ? 'text-[var(--color-primary,#C2185B)] font-bold'
                                : 'text-white/80 group-hover:text-white group-hover:scale-105 group-hover:translate-x-0.5'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>

                          {/* Item Badge (ONLY on items, NO duplicates) */}
                          {badge && (
                            <span
                              className={`ml-auto text-[11px] font-black px-2 py-0.5 rounded-full leading-none transition-colors ${
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

        {/* Subtle Bottom Fade Shadow */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-black/15 to-transparent z-10" />

        {/* Sleek Navigation Scrollbar Indicator */}
        <SmartNavScrollbar containerRef={navRef} pillHeight={36} />
      </div>

      {/* 👤 Bottom Sticky Profile & Controls Area */}
      <div
        className={`border-t border-white/15 bg-black/15 flex-shrink-0 ${
          isCollapsed ? 'p-2 flex flex-col items-center gap-2' : 'p-3 space-y-2.5'
        }`}
      >
        {isCollapsed ? (
          <>
            {/* Collapsed Avatar */}
            <div className="relative group">
              <Link
                href="/admin/settings/profile"
                className="h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold text-xs ring-1 ring-white/30 transition-all cursor-pointer"
                aria-label="Admin Profile"
              >
                <User className="h-4.5 w-4.5" />
              </Link>
              <div className="absolute left-[78px] top-1/2 -translate-y-1/2 z-50 px-2.5 py-1.5 rounded-lg bg-gray-950/95 text-white text-xs font-bold whitespace-nowrap shadow-xl border border-white/15 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                {adminEmail || 'Store Admin'}
              </div>
            </div>

            {/* Collapsed Sign Out */}
            <div className="relative group">
              <button
                type="button"
                onClick={handleLogout}
                className="h-10 w-10 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="h-4.5 w-4.5 text-white" />
              </button>
              <div className="absolute left-[78px] top-1/2 -translate-y-1/2 z-50 px-2.5 py-1.5 rounded-lg bg-rose-950/95 text-rose-200 text-xs font-bold whitespace-nowrap shadow-xl border border-rose-500/30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                Sign Out
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Expanded User Profile Card */}
            <div className="p-2.5 rounded-xl bg-black/20 border border-white/10 shadow-xs flex items-center justify-between gap-2.5">
              <Link
                href="/admin/settings/profile"
                className="flex items-center gap-2.5 min-w-0 group flex-1"
                title="View Admin Profile"
              >
                <div className="h-9 w-9 rounded-full bg-white/20 group-hover:bg-white/30 text-white flex items-center justify-center font-bold text-xs ring-1 ring-white/30 shrink-0 transition-colors">
                  <User className="h-4.5 w-4.5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate group-hover:underline">
                    {adminEmail ? adminEmail.split('@')[0] : 'Store Admin'}
                  </div>
                  <div className="text-[10px] text-emerald-300 font-medium truncate">
                    Administrator
                  </div>
                </div>
              </Link>
            </div>

            {/* Expanded Safe Sign Out Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 h-10 px-3 rounded-xl text-xs font-bold text-white/90 bg-white/10 hover:bg-rose-500/25 hover:text-white border border-white/10 hover:border-rose-400/40 transition-all cursor-pointer active:scale-98 group"
            >
              <LogOut className="h-4 w-4 text-white/70 group-hover:text-rose-200 transition-colors" />
              <span>Sign Out of Console</span>
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
