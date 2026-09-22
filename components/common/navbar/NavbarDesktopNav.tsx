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
  setMoreDropdownOpen: (open: boolean) => void;
  moreOpenRef: React.MutableRefObject<boolean>;
  navContainerRef: React.RefObject<HTMLDivElement | null>;
  measureRowRef: React.RefObject<HTMLDivElement | null>;
  customTextColorStyle: React.CSSProperties;
  desktopHoverOpen: string | null;
  setDesktopHoverOpen: (id: string | null) => void;
  hoverTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
}

export default function NavbarDesktopNav({
  isAdmin,
  navItems,
  headerDesktopMenuAlign,
  headerBg,
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
  if (isAdmin || navItems.length === 0 || headerDesktopMenuAlign === 'hidden') return null;

  const visibleItems = navItems.slice(0, visibleCount);
  const overflowItems = navItems.slice(visibleCount);
  const hasOverflow = overflowItems.length > 0;

  const renderDesktopDropdown = (item: NavigationItem) => {
    const children = item.children || [];
    if (children.length === 0) return null;

    const renderDropdownItem = (node: NavigationItem, depth = 0): React.ReactNode => {
      const nodeChildren = node.children || [];
      const hasChildren = nodeChildren.length > 0;

      let textClass = "text-sm font-bold text-gray-900 dark:text-white";
      let pyClass = "py-2.5";

      if (depth === 1) {
        textClass = "text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-[#e94560] dark:hover:text-white";
        pyClass = "py-2";
      } else if (depth >= 2) {
        textClass = "text-[11px] font-semibold text-gray-500 dark:text-gray-400 hover:text-[#e94560] dark:hover:text-white";
        pyClass = "py-1.5";
      }

      const paddingLeftValue = `${20 + depth * 16}px`;

      return (
        <React.Fragment key={node.id}>
          <div className="flex flex-col">
            <Link
              href={node.url}
              style={{ paddingLeft: paddingLeftValue }}
              className={`block w-full text-left pr-5 transition-colors hover:bg-gray-50 dark:hover:bg-white/5 whitespace-nowrap ${pyClass} ${textClass}`}
            >
              <span className="flex items-center gap-2">
                {depth > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700 shrink-0" />
                )}
                {node.label}
              </span>
            </Link>
          </div>
          {hasChildren && (
            <div className="flex flex-col">
              {nodeChildren.map((child) => renderDropdownItem(child, depth + 1))}
            </div>
          )}
        </React.Fragment>
      );
    };

    return (
      <div className="absolute top-full left-0 mt-2 min-w-[220px] bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in flex flex-col">
        {children.map((child, idx) => (
          <React.Fragment key={child.id}>
            {idx > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-800 my-1.5" />
            )}
            {renderDropdownItem(child, 0)}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderNavItem = (item: NavigationItem, compact = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = desktopHoverOpen === item.id;
    const px = compact ? 'px-2.5' : 'px-3';
    const textSize = compact ? 'text-xs' : 'text-sm';
    return (
      <div
        key={item.id}
        className="relative shrink-0"
        onMouseEnter={() => {
          if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
          setDesktopHoverOpen(item.id);
        }}
        onMouseLeave={() => {
          hoverTimerRef.current = setTimeout(() => setDesktopHoverOpen(null), 150);
        }}
      >
        <Link
          href={item.url}
          className={`flex items-center gap-1 ${px} py-2 rounded-xl ${textSize} font-semibold transition-all duration-200 whitespace-nowrap relative group/nav-item ${isOpen
            ? 'text-[#e94560] bg-gray-50 dark:bg-white/5'
            : 'text-gray-700 dark:text-gray-200 hover:text-[#e94560] hover:bg-gray-50 dark:hover:bg-white/5'
          }`}
          style={customTextColorStyle}
        >
          <span>{item.label}</span>
          {hasChildren && (
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          )}
          <span
            className={`absolute bottom-0.5 left-2 right-2 h-[2px] bg-[#e94560] rounded-full transition-all duration-300 transform origin-left ${isOpen ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0 group-hover/nav-item:scale-x-100 group-hover/nav-item:opacity-100'
            }`}
          />
        </Link>
        {hasChildren && isOpen && renderDesktopDropdown(item)}
      </div>
    );
  };

  return (
    <>
      <div ref={navContainerRef} key="desktop-nav" className="flex items-center gap-0 min-w-0 w-full">
        {/* Hidden measurement row */}
        <div
          ref={measureRowRef}
          aria-hidden="true"
          className="absolute opacity-0 pointer-events-none flex items-center gap-0 top-0 left-0"
          style={{ visibility: 'hidden', zIndex: -1 }}
        >
          {navItems.map((item) => (
            <div key={item.id} className="flex items-center gap-1 px-3 py-2 text-sm font-semibold whitespace-nowrap shrink-0">
              <span>{item.label}</span>
              {item.children && item.children.length > 0 && <ChevronDown className="h-3.5 w-3.5" />}
            </div>
          ))}
        </div>

        {/* Visible items */}
        <nav className="flex items-center gap-0">
          {visibleItems.map((item) => renderNavItem(item))}
        </nav>

        {/* More button */}
        {hasOverflow && (
          <button
            type="button"
            className="more-button-toggle flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 text-gray-700 dark:text-gray-200 hover:text-[#e94560] hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer shrink-0"
            onClick={() => {
              const next = !moreDropdownOpen;
              setMoreDropdownOpen(next);
              moreOpenRef.current = next;
            }}
            style={customTextColorStyle}
          >
            <span>More</span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${moreDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>

      {/* Overflow row */}
      {hasOverflow && moreDropdownOpen && (
        <div
          className="more-dropdown-container hidden md:block w-full border-t border-gray-100 dark:border-gray-800 animate-fade-in"
          style={{
            backgroundColor: headerBg !== '#ffffff' ? headerBg : undefined,
          }}
        >
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-center gap-0 py-1">
            {overflowItems.map((item) => renderNavItem(item))}
          </nav>
        </div>
      )}
    </>
  );
}
