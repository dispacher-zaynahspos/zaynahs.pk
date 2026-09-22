'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronDown } from '@/components/common/Icons';
import { NavigationItem } from '@/lib/types';

interface NavbarDesktopNavProps {
  isAdmin: boolean;
  navItems: NavigationItem[];
  headerDesktopMenuAlign: string;
  headerBg: string;
  visibleCount: number;
  moreDropdownOpen: boolean;
  setMoreDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  moreOpenRef: React.MutableRefObject<boolean>;
  navContainerRef: React.RefObject<HTMLDivElement | null>;
  measureRowRef: React.RefObject<HTMLDivElement | null>;
  customTextColorStyle: React.CSSProperties;
  desktopHoverOpen: string | null;
  setDesktopHoverOpen: (id: string | null) => void;
  hoverTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
}

export function NavbarDesktopNav({
  isAdmin,
  navItems,
  headerDesktopMenuAlign,
  visibleCount,
  moreDropdownOpen,
  setMoreDropdownOpen,
  moreOpenRef,
  navContainerRef,
  measureRowRef,
  customTextColorStyle,
  desktopHoverOpen,
  setDesktopHoverOpen,
  hoverTimerRef,
}: NavbarDesktopNavProps) {
  if (isAdmin || navItems.length === 0) return null;

  const handleMouseEnter = (itemId: string) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setDesktopHoverOpen(itemId);
  };

  const handleMouseLeave = () => {
    hoverTimerRef.current = setTimeout(() => {
      setDesktopHoverOpen(null);
    }, 150);
  };

  const renderDropdownChildren = (items: NavigationItem[], level = 1) => {
    return (
      <div
        className={`absolute ${
          level === 1 ? 'top-full left-0 mt-2' : 'top-0 left-full ml-1.5'
        } min-w-[220px] rounded-2xl border border-gray-150/80 dark:border-gray-800 bg-white/95 dark:bg-[#121222]/95 p-2 shadow-2xl backdrop-blur-xl z-[120] animate-in fade-in zoom-in-95 duration-150`}
        onMouseEnter={() => {
          if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        }}
        onMouseLeave={handleMouseLeave}
      >
        {items.map((child) => {
          const hasChildChildren = child.children && child.children.length > 0;
          return (
            <div key={child.id} className="relative group/sub">
              <Link
                href={child.url}
                className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-white/10 hover:text-[var(--color-primary,#C2185B)] transition-all"
              >
                <span>{child.label || (child as any).title}</span>
                {hasChildChildren && <ChevronDown className="h-3 w-3 -rotate-90 text-gray-400" />}
              </Link>
              {hasChildChildren && (
                <div className="hidden group-hover/sub:block">
                  {renderDropdownChildren(child.children!, level + 1)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const effectiveVisibleCount = mounted ? visibleCount : navItems.length;
  const visibleItems = navItems.slice(0, Math.min(navItems.length, effectiveVisibleCount));
  const overflowItems = navItems.slice(Math.min(navItems.length, effectiveVisibleCount));
  const hasOverflow = mounted && overflowItems.length > 0;

  return (
    <div
      ref={navContainerRef}
      className={`relative flex items-center min-w-0 flex-1 ${
        headerDesktopMenuAlign === 'center'
          ? 'justify-center'
          : headerDesktopMenuAlign === 'right'
          ? 'justify-end'
          : 'justify-start'
      }`}
    >
      {/* Hidden measurement row for dynamic overflow calculation */}
      <div
        ref={measureRowRef}
        aria-hidden="true"
        className="absolute opacity-0 pointer-events-none flex items-center gap-1 top-0 left-0"
        style={{ visibility: 'hidden', zIndex: -1 }}
      >
        {navItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-1 px-3 py-2 text-sm font-semibold whitespace-nowrap shrink-0"
          >
            <span>{item.label || (item as any).title}</span>
            {item.children && item.children.length > 0 && <ChevronDown className="h-3.5 w-3.5" />}
          </div>
        ))}
      </div>

      {/* Visible Navigation Links on a Single Row */}
      <nav className="flex items-center gap-1 flex-nowrap whitespace-nowrap">
        {visibleItems.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const isHovered = desktopHoverOpen === item.id;

          return (
            <div
              key={item.id}
              className="relative shrink-0 group/nav-item"
              onMouseEnter={() => hasChildren && handleMouseEnter(item.id)}
              onMouseLeave={() => hasChildren && handleMouseLeave()}
            >
              <Link
                href={item.url}
                className={`flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 whitespace-nowrap relative ${
                  isHovered
                    ? 'text-[var(--color-primary,#C2185B)] bg-gray-100/80 dark:bg-white/10'
                    : 'text-gray-700 dark:text-gray-200 hover:text-[var(--color-primary,#C2185B)] hover:bg-gray-100/60 dark:hover:bg-white/5'
                }`}
                style={customTextColorStyle}
              >
                <span>{item.label || (item as any).title}</span>
                {hasChildren && (
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${
                      isHovered ? 'rotate-180 text-[var(--color-primary,#C2185B)]' : ''
                    }`}
                  />
                )}
                {/* Modern subtle bottom glow line on hover/active */}
                <span
                  className={`absolute bottom-0.5 left-3 right-3 h-[2px] bg-[var(--color-primary,#C2185B)] rounded-full transition-all duration-300 transform origin-left ${
                    isHovered
                      ? 'scale-x-100 opacity-100'
                      : 'scale-x-0 opacity-0 group-hover/nav-item:scale-x-100 group-hover/nav-item:opacity-100'
                  }`}
                />
              </Link>

              {hasChildren && isHovered && renderDropdownChildren(item.children!)}
            </div>
          );
        })}

        {/* More Button to Toggle Line 2 Overflow Bar */}
        {hasOverflow && (
          <div className="relative shrink-0 more-dropdown-container">
            <button
              type="button"
              onClick={() => {
                const next = !moreDropdownOpen;
                setMoreDropdownOpen(next);
                moreOpenRef.current = next;
              }}
              className={`more-button-toggle flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                moreDropdownOpen
                  ? 'bg-[var(--color-primary,#C2185B)] text-white shadow-xs'
                  : 'text-gray-700 dark:text-gray-200 bg-gray-100/80 dark:bg-white/10 hover:bg-gray-200/80 dark:hover:bg-white/15'
              }`}
              style={!moreDropdownOpen ? customTextColorStyle : undefined}
              aria-expanded={moreDropdownOpen}
            >
              <span>More</span>
              <ChevronDown
                className={`h-3 w-3 transition-transform duration-200 ${
                  moreDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>
        )}
      </nav>
    </div>
  );
}
