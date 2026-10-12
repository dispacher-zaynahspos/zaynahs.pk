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
  const storeName = settings?.store_name ?? propStoreName;
  const settingsTimestamp = settings?.updated_at ? new Date(settings.updated_at).getTime() : '';
  const rawLogoUrl = settings?.logo_url ?? propLogoUrl;
  const logoUrl = rawLogoUrl && settingsTimestamp ? `${rawLogoUrl}?v=${settingsTimestamp}` : rawLogoUrl;
  const logoWidth = settings?.logo_width ?? propLogoWidth;

  // Header options defaults
  const headerStickyDesktop = settings?.header_sticky_desktop ?? true;
  const headerStickyMobile = settings?.header_sticky_mobile ?? true;

  const stickyClass = (headerStickyDesktop && headerStickyMobile)
    ? 'sticky top-0'
    : headerStickyDesktop
      ? 'md:sticky md:top-0 relative'
      : headerStickyMobile
        ? 'sticky top-0 md:relative'
        : 'relative';
  const showTopBar = settings?.header_show_top_bar ?? true;
  const topBarPhone = settings?.header_top_bar_phone ?? '';
  const topBarEmail = settings?.header_top_bar_email ?? '';
  const showNewsletter = settings?.header_show_newsletter ?? true;
  const newsletterText = settings?.header_newsletter_text ?? 'Summer sale discount off 50%. Shop Sale';

  const topBarBg = settings?.header_top_bar_bg
    || settings?.theme_config?.colors?.headerTopBarBg
    || settings?.theme_config?.colors?.primary
    || '#0F2A5E';
  const topBarTextColor = settings?.header_top_bar_text_color
    || settings?.theme_config?.colors?.headerTopBarTextColor
    || '#ffffff';
  const headerBg = settings?.header_bg || settings?.theme_config?.colors?.surface || '#ffffff';
  const headerTextColor = settings?.header_text_color || settings?.theme_config?.colors?.textPrimary || '#1a1a2e';
  const headerBorderColor = settings?.header_border_color || settings?.theme_config?.colors?.border || '#e5e7eb';

  // Desktop alignments
  const desktopLogoAlign = settings?.header_desktop_logo_align ?? 'left';
  const desktopSearchAlign = settings?.header_desktop_search_align ?? 'right';
  const desktopWishlistAlign = settings?.header_desktop_wishlist_align ?? 'right';
  const desktopCartAlign = settings?.header_desktop_cart_align ?? 'right';
  const desktopThemeAlign = settings?.header_desktop_theme_align ?? 'right';

  // Mobile logo alignment
  const mobileLogoAlign = 'center';
  const mobileMenuAlign = settings?.header_mobile_menu_align ?? 'left';
  const mobileSearchAlign = settings?.header_mobile_search_align ?? 'right';
  const mobileCartAlign = settings?.header_mobile_cart_align ?? 'right';
  const mobileWishlistAlign = settings?.header_mobile_wishlist_align ?? 'hidden';

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

  const navigationMenu: NavigationItem[] = settings?.navigation_menu ?? [];
  const navItems: NavigationItem[] = useMemo(() => navigationMenu, [navigationMenu]);
  const headerDesktopMenuAlign = settings?.header_desktop_menu_align ?? 'center';

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
    (settings?.enable_search ?? true) ? (
      <NavSearchButton
        key="search"
        isAdmin={isAdmin}
        setSearchOpen={setSearchOpen}
        customTextColorStyle={customTextColorStyle}
      />
    ) : null
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

    const children = Array.from(measureRow.children) as HTMLElement[];
    const n = children.length;
    if (n === 0) {
      setVisibleCount(0);
      return;
    }
    // Real item widths + the row gap (gap-1 = 4px) between adjacent items.
    const widths = children.map((el) => el.offsetWidth);
    itemWidthsRef.current = widths;
    const GAP = 4;
    const MORE_BTN_WIDTH = 92; // More pill incl. its leading gap, measured generously
    const EPS = 1; // sub-pixel tolerance so the last item is not pushed out early

    // Total width if EVERYTHING shows inline (no MORE button).
    const totalAll = widths.reduce((s, w) => s + w, 0) + GAP * (n - 1);
    if (totalAll <= availableWidth + EPS) {
      // Everything fits — show all, hide MORE completely.
      setVisibleCount(n);
      return;
    }

    // Not everything fits: reserve space for the MORE button and pack items.
    const budget = availableWidth - MORE_BTN_WIDTH;
    let used = 0;
    let count = 0;
    for (let i = 0; i < n; i++) {
      const add = widths[i] + (i > 0 ? GAP : 0);
      if (used + add <= budget + EPS) {
        used += add;
        count++;
      } else {
        break;
      }
    }
    setVisibleCount(Math.max(0, count));
  }, [navItems]);

  useEffect(() => {
    const container = navContainerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => recalcVisibleCount());
    ro.observe(container);
    const t = setTimeout(recalcVisibleCount, 60);
    // Re-measure once web fonts finish loading (item widths change with the font).
    const fontsReady = (document as Document & { fonts?: { ready?: Promise<unknown> } })?.fonts?.ready;
    if (fontsReady && typeof fontsReady.then === 'function') {
      fontsReady.then(() => recalcVisibleCount()).catch(() => {});
    }
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
        settings={settings}
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
        logoUrl={logoUrl}
        onOpenSearch={() => setSearchOpen(true)}
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
