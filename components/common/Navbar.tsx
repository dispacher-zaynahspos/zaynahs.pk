'use client';

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/lib/hooks/useCart';
import { StoreSettings, NavigationItem } from '@/lib/types';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import {
  NavbarAnnouncementBar,
  NavbarSearchModal,
  NavbarMobileDrawer,
  NavbarLogo,
  NavbarMobileNavItem,
  useNavbarSearch,
  NavbarHeaderBar,
  NavSearchButton,
  NavWishlistLink,
  NavCartLink,
  NavAccountLink,
  NavAdminLink,
  NavMobileMenuButton,
} from './store-navbar';
import { useNavbarState } from './store-navbar/useNavbarState';

interface NavbarProps {
  storeName?: string;
  logoUrl?: string;
  logoWidth?: number;
  settings?: StoreSettings;
}

export default function Navbar({
  storeName: propStoreName = '',
  logoUrl: propLogoUrl,
  logoWidth: propLogoWidth = 120,
  settings,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const totalItems = useCart((state) => state.totalItems());
  const isAdmin = pathname?.startsWith('/admin') && pathname !== '/admin/settings/customizer/preview';

  // Load and fallback settings values
  const storeName = settings?.storeName ?? propStoreName;
  const settingsTimestamp = settings?.updatedAt ? new Date(settings.updatedAt).getTime() : '';
  const rawLogoUrl = settings?.logoUrl ?? propLogoUrl;
  const logoUrl = rawLogoUrl && settingsTimestamp ? `${rawLogoUrl}?v=${settingsTimestamp}` : rawLogoUrl;
  const logoWidth = settings?.logoWidth ?? propLogoWidth;

  // Header options defaults
  const headerStickyDesktop = settings?.headerStickyDesktop ?? true;
  const headerStickyMobile = settings?.headerStickyMobile ?? true;

  const stickyClass = (headerStickyDesktop && headerStickyMobile)
    ? 'sticky top-0'
    : headerStickyDesktop
      ? 'md:sticky md:top-0 relative'
      : headerStickyMobile
        ? 'sticky top-0 md:relative'
        : 'relative';
  const showTopBar = settings?.headerShowTopBar ?? true;
  const topBarPhone = settings?.headerTopBarPhone ?? '';
  const topBarEmail = settings?.headerTopBarEmail ?? '';
  const showNewsletter = settings?.headerShowNewsletter ?? true;
  const newsletterText = settings?.headerNewsletterText ?? 'Summer sale discount off 50%. Shop Sale';

  const topBarBg = settings?.headerTopBarBg ?? '#d97706';
  const topBarTextColor = settings?.headerTopBarTextColor ?? '#ffffff';
  const headerBg = settings?.headerBg ?? '#ffffff';
  const headerTextColor = settings?.headerTextColor ?? '#1a1a2e';
  const headerBorderColor = settings?.headerBorderColor ?? '#e5e7eb';

  // Desktop alignments
  const desktopLogoAlign = settings?.headerDesktopLogoAlign ?? 'left';
  const desktopSearchAlign = settings?.headerDesktopSearchAlign ?? 'right';
  const desktopWishlistAlign = settings?.headerDesktopWishlistAlign ?? 'right';
  const desktopCartAlign = settings?.headerDesktopCartAlign ?? 'right';
  const desktopThemeAlign = settings?.headerDesktopThemeAlign ?? 'right';

  // Mobile logo alignment
  const mobileLogoAlign = 'center';
  const mobileMenuAlign = settings?.headerMobileMenuAlign ?? 'left';
  const mobileSearchAlign = settings?.headerMobileSearchAlign ?? 'right';
  const mobileCartAlign = settings?.headerMobileCartAlign ?? 'right';
  const mobileWishlistAlign = settings?.headerMobileWishlistAlign ?? 'hidden';

  // Mobile menu states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const announcementLines = useMemo(() => {
    return (newsletterText || '').split('\n').map(line => line.trim()).filter(Boolean);
  }, [newsletterText]);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: false })
  ]);
  const [mobileAccordionOpen, setMobileAccordionOpen] = useState<Record<string, boolean>>({});
  const [desktopHoverOpen, setDesktopHoverOpen] = useState<string | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navContainerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState<number>(999);

  const navigationMenu: NavigationItem[] = settings?.navigationMenu ?? [];
  const navItems: NavigationItem[] = useMemo(() => navigationMenu, [navigationMenu]);
  const headerDesktopMenuAlign = settings?.headerDesktopMenuAlign ?? 'center';

  const {
    searchQuery,
    setSearchQuery,
    searchOpen,
    setSearchOpen,
    searchInputRef,
    containerRef,
    products,
    loading,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    handleCloseSearch,
  } = useNavbarSearch();

  const {
    mounted,
    wishlistCount,
    customerSession,
    isPreview,
    moreOpenRef,
    moreDropdownOpen,
    setMoreDropdownOpen,
  } = useNavbarState(mobileMenuOpen, searchOpen);

  const customTextColorStyle = headerTextColor !== '#1a1a2e' ? { color: headerTextColor } : {};

  const logoNode = (
    <NavbarLogo
      key="logo"
      pathname={pathname}
      logoUrl={logoUrl}
      logoWidth={logoWidth}
      storeName={storeName}
      customTextColorStyle={customTextColorStyle}
      setSearchOpen={setSearchOpen}
      setMobileMenuOpen={setMobileMenuOpen}
    />
  );

  const searchNode = (
    <NavSearchButton
      key="search"
      isAdmin={isAdmin}
      setSearchOpen={setSearchOpen}
      customTextColorStyle={customTextColorStyle}
    />
  );

  const wishlistDesktopNode = (
    <NavWishlistLink
      key="wishlist-desktop"
      isAdmin={isAdmin}
      mounted={mounted}
      wishlistCount={wishlistCount}
      customTextColorStyle={customTextColorStyle}
      isMobile={false}
    />
  );

  const wishlistMobileNode = (
    <NavWishlistLink
      key="wishlist-mobile"
      isAdmin={isAdmin}
      mounted={mounted}
      wishlistCount={wishlistCount}
      customTextColorStyle={customTextColorStyle}
      isMobile={true}
    />
  );

  const cartDesktopNode = (
    <NavCartLink
      key="cart-desktop"
      isAdmin={isAdmin}
      mounted={mounted}
      totalItems={totalItems}
      customTextColorStyle={customTextColorStyle}
      isMobile={false}
    />
  );

  const cartMobileNode = (
    <NavCartLink
      key="cart-mobile"
      isAdmin={isAdmin}
      mounted={mounted}
      totalItems={totalItems}
      customTextColorStyle={customTextColorStyle}
      isMobile={true}
    />
  );

  const accountNode = (
    <NavAccountLink
      key="account"
      isAdmin={isAdmin}
      customerSession={customerSession}
      customTextColorStyle={customTextColorStyle}
    />
  );

  const adminLinkNode = (
    <NavAdminLink
      key="admin-link"
      isAdmin={isAdmin}
      customTextColorStyle={customTextColorStyle}
    />
  );

  const mobileMenuButtonNode = (
    <NavMobileMenuButton
      key="mobile-menu"
      setMobileMenuOpen={setMobileMenuOpen}
      customTextColorStyle={customTextColorStyle}
    />
  );

  const itemWidthsRef = useRef<number[]>([]);
  const measureRowRef = useRef<HTMLDivElement>(null);

  const recalcVisibleCount = useCallback(() => {
    const container = navContainerRef.current;
    const measureRow = measureRowRef.current;
    if (!container || !measureRow) return;

    const availableWidth = container.offsetWidth;
    if (availableWidth <= 0) return;
    const MORE_BTN_WIDTH = 80;
    const children = Array.from(measureRow.children) as HTMLElement[];
    itemWidthsRef.current = children.map((el) => el.offsetWidth);

    let used = 0;
    let count = 0;
    for (let i = 0; i < itemWidthsRef.current.length; i++) {
      const willNeedMore = i < itemWidthsRef.current.length - 1;
      const budget = willNeedMore ? availableWidth - MORE_BTN_WIDTH : availableWidth;
      if (used + itemWidthsRef.current[i] <= budget) {
        used += itemWidthsRef.current[i];
        count++;
      } else {
        break;
      }
    }
    setVisibleCount(count);
  }, [navItems]);

  useEffect(() => {
    const container = navContainerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => recalcVisibleCount());
    ro.observe(container);
    const t = setTimeout(recalcVisibleCount, 60);
    return () => { ro.disconnect(); clearTimeout(t); };
  }, [recalcVisibleCount]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.more-dropdown-container') || target.closest('.more-button-toggle')) {
        return;
      }
      if (moreOpenRef.current) {
        setMoreDropdownOpen(false);
        moreOpenRef.current = false;
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const renderMobileNavItem = (item: NavigationItem, depth = 0) => (
    <NavbarMobileNavItem
      key={item.id}
      item={item}
      depth={depth}
      mobileAccordionOpen={mobileAccordionOpen}
      setMobileAccordionOpen={setMobileAccordionOpen}
      setMobileMenuOpen={setMobileMenuOpen}
    />
  );

  return (
    <>
      {/* Top Bar Contacts & Announcements */}
      <NavbarAnnouncementBar
        showTopBar={showTopBar}
        showNewsletter={showNewsletter}
        topBarPhone={topBarPhone}
        topBarEmail={topBarEmail}
        topBarBg={topBarBg}
        topBarTextColor={topBarTextColor}
        headerBorderColor={headerBorderColor}
        announcementLines={announcementLines}
        isPreview={isPreview}
        emblaRef={emblaRef}
        emblaApi={emblaApi}
      />

      {/* Main Header */}
      <NavbarHeaderBar
        stickyClass={stickyClass}
        isPreview={isPreview}
        headerBg={headerBg}
        headerBorderColor={headerBorderColor}
        headerTextColor={headerTextColor}
        customTextColorStyle={customTextColorStyle}
        desktopLogoAlign={desktopLogoAlign}
        desktopSearchAlign={desktopSearchAlign}
        desktopWishlistAlign={desktopWishlistAlign}
        desktopCartAlign={desktopCartAlign}
        desktopThemeAlign={desktopThemeAlign}
        headerDesktopMenuAlign={headerDesktopMenuAlign}
        mobileLogoAlign={mobileLogoAlign}
        mobileMenuAlign={mobileMenuAlign}
        mobileSearchAlign={mobileSearchAlign}
        mobileCartAlign={mobileCartAlign}
        mobileWishlistAlign={mobileWishlistAlign}
        logoNode={logoNode}
        searchNode={searchNode}
        wishlistDesktopNode={wishlistDesktopNode}
        wishlistMobileNode={wishlistMobileNode}
        cartDesktopNode={cartDesktopNode}
        cartMobileNode={cartMobileNode}
        accountNode={accountNode}
        adminLinkNode={adminLinkNode}
        mobileMenuButtonNode={mobileMenuButtonNode}
        isAdmin={isAdmin}
        navItems={navItems}
        visibleCount={visibleCount}
        moreDropdownOpen={moreDropdownOpen}
        setMoreDropdownOpen={setMoreDropdownOpen}
        moreOpenRef={moreOpenRef}
        navContainerRef={navContainerRef}
        measureRowRef={measureRowRef}
        desktopHoverOpen={desktopHoverOpen}
        setDesktopHoverOpen={setDesktopHoverOpen}
        hoverTimerRef={hoverTimerRef}
      />

      {/* MOBILE DRAWER MENU */}
      <NavbarMobileDrawer
        mounted={mounted}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        isAdmin={isAdmin}
        navItems={navItems}
        customerSession={customerSession}
        totalItems={totalItems}
        wishlistCount={wishlistCount}
        settings={settings}
        topBarPhone={topBarPhone}
        topBarEmail={topBarEmail}
        storeName={storeName}
        renderMobileNavItem={renderMobileNavItem}
      />

      {/* SEARCH POPUP MODAL */}
      <NavbarSearchModal
        mounted={mounted}
        searchOpen={searchOpen}
        isAdmin={isAdmin}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setSearchOpen={setSearchOpen}
        handleCloseSearch={handleCloseSearch}
        products={products}
        loading={loading}
        suggestions={suggestions}
        showSuggestions={showSuggestions}
        setShowSuggestions={setShowSuggestions}
        searchInputRef={searchInputRef}
        containerRef={containerRef}
        settings={settings}
        router={router}
      />
    </>
  );
}
