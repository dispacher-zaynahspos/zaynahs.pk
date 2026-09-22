'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronDown } from '@/components/common/Icons';
import { NavbarDesktopNav } from './NavbarDesktopNav';
import { NavigationItem } from '@/lib/types';

interface NavbarHeaderBarProps {
  stickyClass: string;
  isPreview: boolean;
  headerBg: string;
  headerBorderColor: string;
  headerTextColor: string;
  customTextColorStyle: React.CSSProperties;
  desktopLogoAlign: string;
  desktopSearchAlign: string;
  desktopWishlistAlign: string;
  desktopCartAlign: string;
  desktopThemeAlign: string;
  headerDesktopMenuAlign: string;
  mobileLogoAlign: string;
  mobileMenuAlign: string;
  mobileSearchAlign: string;
  mobileCartAlign: string;
  mobileWishlistAlign: string;
  logoNode: React.ReactNode;
  searchNode: React.ReactNode;
  wishlistDesktopNode: React.ReactNode;
  wishlistMobileNode: React.ReactNode;
  cartDesktopNode: React.ReactNode;
  cartMobileNode: React.ReactNode;
  accountNode: React.ReactNode;
  adminLinkNode: React.ReactNode;
  mobileMenuButtonNode: React.ReactNode;
  isAdmin: boolean;
  navItems: NavigationItem[];
  visibleCount: number;
  moreDropdownOpen: boolean;
  setMoreDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  moreOpenRef: React.MutableRefObject<boolean>;
  navContainerRef: React.RefObject<HTMLDivElement | null>;
  measureRowRef: React.RefObject<HTMLDivElement | null>;
  desktopHoverOpen: string | null;
  setDesktopHoverOpen: (id: string | null) => void;
  hoverTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
}

export function NavbarHeaderBar({
  stickyClass,
  isPreview,
  headerBg,
  headerBorderColor,
  headerTextColor,
  customTextColorStyle,
  desktopLogoAlign,
  desktopSearchAlign,
  desktopWishlistAlign,
  desktopCartAlign,
  desktopThemeAlign,
  headerDesktopMenuAlign,
  mobileLogoAlign,
  mobileMenuAlign,
  mobileSearchAlign,
  mobileCartAlign,
  mobileWishlistAlign,
  logoNode,
  searchNode,
  wishlistDesktopNode,
  wishlistMobileNode,
  cartDesktopNode,
  cartMobileNode,
  accountNode,
  adminLinkNode,
  mobileMenuButtonNode,
  isAdmin,
  navItems,
  visibleCount,
  moreDropdownOpen,
  setMoreDropdownOpen,
  moreOpenRef,
  navContainerRef,
  measureRowRef,
  desktopHoverOpen,
  setDesktopHoverOpen,
  hoverTimerRef,
}: NavbarHeaderBarProps) {
  const desktopLeftElements: React.ReactNode[] = [];
  const desktopCenterElements: React.ReactNode[] = [];
  const desktopRightElements: React.ReactNode[] = [];

  const addToDesktopSlot = (align: string, element: React.ReactNode) => {
    if (align === 'left') desktopLeftElements.push(element);
    else if (align === 'center') desktopCenterElements.push(element);
    else if (align === 'right') desktopRightElements.push(element);
  };

  addToDesktopSlot(desktopLogoAlign, logoNode);
  addToDesktopSlot(
    headerDesktopMenuAlign,
    <NavbarDesktopNav
      key="desktop-nav-sub"
      isAdmin={isAdmin}
      navItems={navItems}
      headerDesktopMenuAlign={headerDesktopMenuAlign}
      headerBg={headerBg}
      visibleCount={visibleCount}
      moreDropdownOpen={moreDropdownOpen}
      setMoreDropdownOpen={setMoreDropdownOpen}
      moreOpenRef={moreOpenRef}
      navContainerRef={navContainerRef}
      measureRowRef={measureRowRef}
      customTextColorStyle={customTextColorStyle}
      desktopHoverOpen={desktopHoverOpen}
      setDesktopHoverOpen={setDesktopHoverOpen}
      hoverTimerRef={hoverTimerRef}
    />
  );
  addToDesktopSlot(desktopSearchAlign, searchNode);
  addToDesktopSlot(desktopWishlistAlign, accountNode);
  addToDesktopSlot(desktopWishlistAlign, wishlistDesktopNode);
  addToDesktopSlot(desktopCartAlign, cartDesktopNode);
  addToDesktopSlot(desktopThemeAlign, adminLinkNode);

  const mobileLeftElements: React.ReactNode[] = [];
  const mobileCenterElements: React.ReactNode[] = [];
  const mobileRightElements: React.ReactNode[] = [];

  const addToMobileSlot = (align: string, element: React.ReactNode) => {
    if (align === 'left') mobileLeftElements.push(element);
    else if (align === 'center') mobileCenterElements.push(element);
    else if (align === 'right') mobileRightElements.push(element);
  };

  addToMobileSlot(mobileMenuAlign, mobileMenuButtonNode);
  addToMobileSlot(mobileLogoAlign, logoNode);
  addToMobileSlot(mobileSearchAlign, searchNode);
  addToMobileSlot(mobileWishlistAlign, accountNode);
  addToMobileSlot(mobileWishlistAlign, wishlistMobileNode);
  addToMobileSlot(mobileCartAlign, cartMobileNode);
  addToMobileSlot('right', adminLinkNode);

  return (
    <header
      onClick={(e) => {
        if (isPreview) {
          e.preventDefault();
          e.stopPropagation();
          window.parent.postMessage({ type: 'select_global_tab', subTab: 'header' }, '*');
        }
      }}
      className={`${stickyClass} z-[100] w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f0f1b] transition-colors duration-200 shadow-xs ${
        isPreview ? 'cursor-pointer hover:ring-2 hover:ring-[#e94560] hover:ring-offset-2' : ''
      }`}
      style={{
        backgroundColor: headerBg !== '#ffffff' ? headerBg : undefined,
        borderColor: headerBorderColor !== '#e5e7eb' ? headerBorderColor : undefined,
        color: headerTextColor !== '#1a1a2e' ? headerTextColor : undefined,
      }}
    >
      {/* Desktop Header Layout */}
      <div className="mx-auto hidden md:flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-3">
        <div className="flex items-center gap-3 justify-start shrink-0">{desktopLeftElements}</div>
        <div className="flex items-center justify-center flex-1 min-w-0 overflow-visible">
          {desktopCenterElements}
        </div>
        <div className="flex items-center gap-2 justify-end shrink-0">{desktopRightElements}</div>
      </div>

      {/* Desktop Overflow Rows (Line 2, Line 3, etc.) when More is toggled open */}
      {navItems.length > visibleCount && moreDropdownOpen && (
        <div
          className="more-dropdown-container hidden md:block w-full border-t border-gray-100 dark:border-gray-800/80 animate-in fade-in slide-in-from-top-1 duration-200"
          style={{
            backgroundColor: headerBg !== '#ffffff' ? headerBg : undefined,
          }}
        >
          <nav
            className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-wrap items-center gap-1 py-1.5 ${
              headerDesktopMenuAlign === 'center'
                ? 'justify-center'
                : headerDesktopMenuAlign === 'right'
                ? 'justify-end'
                : 'justify-start'
            }`}
          >
            {navItems.slice(visibleCount).map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isHovered = desktopHoverOpen === `line2-${item.id}`;

              return (
                <div
                  key={item.id}
                  className="relative shrink-0 group/nav-item"
                  onMouseEnter={() => {
                    if (hasChildren) {
                      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
                      setDesktopHoverOpen(`line2-${item.id}`);
                    }
                  }}
                  onMouseLeave={() => {
                    if (hasChildren) {
                      hoverTimerRef.current = setTimeout(() => setDesktopHoverOpen(null), 150);
                    }
                  }}
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
                    {/* Modern subtle bottom glow line matching upper line */}
                    <span
                      className={`absolute bottom-0.5 left-3 right-3 h-[2px] bg-[var(--color-primary,#C2185B)] rounded-full transition-all duration-300 transform origin-left ${
                        isHovered
                          ? 'scale-x-100 opacity-100'
                          : 'scale-x-0 opacity-0 group-hover/nav-item:scale-x-100 group-hover/nav-item:opacity-100'
                      }`}
                    />
                  </Link>

                  {hasChildren && isHovered && (
                    <div
                      className="absolute top-full left-0 mt-1 min-w-[220px] rounded-2xl border border-gray-150/80 dark:border-gray-800 bg-white/95 dark:bg-[#121222]/95 p-2 shadow-2xl backdrop-blur-xl z-[130] animate-in fade-in zoom-in-95 duration-150"
                      onMouseEnter={() => {
                        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
                      }}
                      onMouseLeave={() => {
                        hoverTimerRef.current = setTimeout(() => setDesktopHoverOpen(null), 150);
                      }}
                    >
                      {item.children!.map((child) => (
                        <Link
                          key={child.id}
                          href={child.url}
                          className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-white/10 hover:text-[var(--color-primary,#C2185B)] transition-all"
                        >
                          {child.label || (child as any).title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      )}

      {/* Mobile Header Layout */}
      <div className="mx-auto md:hidden flex h-14 items-center justify-between px-4 relative">
        <div className="flex-1 flex items-center gap-2 justify-start shrink-0 relative z-30 pointer-events-none [&>*]:pointer-events-auto">
          {mobileLeftElements}
        </div>
        <div className="absolute inset-x-0 top-0 bottom-0 flex items-center justify-center pointer-events-none z-40">
          <div className="pointer-events-auto flex items-center max-w-[65%] justify-center">
            {mobileCenterElements}
          </div>
        </div>
        <div className="flex-1 flex items-center gap-2 justify-end shrink-0 relative z-30 pointer-events-none [&>*]:pointer-events-auto">
          {mobileRightElements}
        </div>
      </div>
    </header>
  );
}
