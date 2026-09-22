'use client';

import React from 'react';
import {
  StickyAndTopBarSettings,
  DesktopPlacementSettings,
  MobilePlacementSettings,
  HeaderPaletteSettings
} from './header';

interface HeaderTabProps {
  headerSticky: boolean;
  setHeaderSticky: (val: boolean) => void;
  headerStickyDesktop: boolean;
  setHeaderStickyDesktop: (val: boolean) => void;
  headerStickyMobile: boolean;
  setHeaderStickyMobile: (val: boolean) => void;
  headerShowTopBar: boolean;
  setHeaderShowTopBar: (val: boolean) => void;
  headerShowNewsletter: boolean;
  setHeaderShowNewsletter: (val: boolean) => void;
  headerTopBarPhone: string;
  setHeaderTopBarPhone: (val: string) => void;
  headerTopBarEmail: string;
  setHeaderTopBarEmail: (val: string) => void;
  headerNewsletterText: string;
  setHeaderNewsletterText: (val: string) => void;

  headerDesktopLogoAlign: 'left' | 'center' | 'right';
  setHeaderDesktopLogoAlign: (val: 'left' | 'center' | 'right') => void;
  headerDesktopSearchAlign: 'left' | 'right' | 'hidden';
  setHeaderDesktopSearchAlign: (val: 'left' | 'right' | 'hidden') => void;
  headerDesktopWishlistAlign: 'left' | 'right' | 'hidden';
  setHeaderDesktopWishlistAlign: (val: 'left' | 'right' | 'hidden') => void;
  headerDesktopCartAlign: 'left' | 'right' | 'hidden';
  setHeaderDesktopCartAlign: (val: 'left' | 'right' | 'hidden') => void;
  headerDesktopThemeAlign: 'left' | 'right' | 'hidden';
  setHeaderDesktopThemeAlign: (val: 'left' | 'right' | 'hidden') => void;

  headerMobileMenuAlign: 'left' | 'right' | 'hidden';
  setHeaderMobileMenuAlign: (val: 'left' | 'right' | 'hidden') => void;
  headerMobileLogoAlign: 'left' | 'center' | 'right';
  setHeaderMobileLogoAlign: (val: 'left' | 'center' | 'right') => void;
  headerMobileSearchAlign: 'left' | 'right' | 'hidden';
  setHeaderMobileSearchAlign: (val: 'left' | 'right' | 'hidden') => void;
  headerMobileCartAlign: 'left' | 'right' | 'hidden';
  setHeaderMobileCartAlign: (val: 'left' | 'right' | 'hidden') => void;
  headerMobileWishlistAlign: 'left' | 'right' | 'hidden';
  setHeaderMobileWishlistAlign: (val: 'left' | 'right' | 'hidden') => void;

  headerTopBarBg: string;
  setHeaderTopBarBg: (val: string) => void;
  headerTopBarTextColor: string;
  setHeaderTopBarTextColor: (val: string) => void;
  headerBg: string;
  setHeaderBg: (val: string) => void;
  headerTextColor: string;
  setHeaderTextColor: (val: string) => void;
  headerBorderColor: string;
  setHeaderBorderColor: (val: string) => void;
  popularSearches: string;
  setPopularSearches: (val: string) => void;
}

export default function HeaderTab({
  headerSticky,
  setHeaderSticky,
  headerStickyDesktop,
  setHeaderStickyDesktop,
  headerStickyMobile,
  setHeaderStickyMobile,
  headerShowTopBar,
  setHeaderShowTopBar,
  headerShowNewsletter,
  setHeaderShowNewsletter,
  headerTopBarPhone,
  setHeaderTopBarPhone,
  headerTopBarEmail,
  setHeaderTopBarEmail,
  headerNewsletterText,
  setHeaderNewsletterText,
  headerDesktopLogoAlign,
  setHeaderDesktopLogoAlign,
  headerDesktopSearchAlign,
  setHeaderDesktopSearchAlign,
  headerDesktopWishlistAlign,
  setHeaderDesktopWishlistAlign,
  headerDesktopCartAlign,
  setHeaderDesktopCartAlign,
  headerDesktopThemeAlign,
  setHeaderDesktopThemeAlign,
  headerMobileMenuAlign,
  setHeaderMobileMenuAlign,
  headerMobileLogoAlign,
  setHeaderMobileLogoAlign,
  headerMobileSearchAlign,
  setHeaderMobileSearchAlign,
  headerMobileCartAlign,
  setHeaderMobileCartAlign,
  headerMobileWishlistAlign,
  setHeaderMobileWishlistAlign,
  headerTopBarBg,
  setHeaderTopBarBg,
  headerTopBarTextColor,
  setHeaderTopBarTextColor,
  headerBg,
  setHeaderBg,
  headerTextColor,
  setHeaderTextColor,
  headerBorderColor,
  setHeaderBorderColor,
  popularSearches,
  setPopularSearches,
}: HeaderTabProps) {
  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors">
        <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Header Layout & Appearance Customizer</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Customize your storefront header's mobile and desktop structures, top bar info, newsletter, and color styling.</p>
        </div>

        <StickyAndTopBarSettings
          headerStickyDesktop={headerStickyDesktop}
          setHeaderStickyDesktop={setHeaderStickyDesktop}
          headerStickyMobile={headerStickyMobile}
          setHeaderStickyMobile={setHeaderStickyMobile}
          headerShowTopBar={headerShowTopBar}
          setHeaderShowTopBar={setHeaderShowTopBar}
          headerShowNewsletter={headerShowNewsletter}
          setHeaderShowNewsletter={setHeaderShowNewsletter}
          headerTopBarPhone={headerTopBarPhone}
          setHeaderTopBarPhone={setHeaderTopBarPhone}
          headerTopBarEmail={headerTopBarEmail}
          setHeaderTopBarEmail={setHeaderTopBarEmail}
          headerNewsletterText={headerNewsletterText}
          setHeaderNewsletterText={setHeaderNewsletterText}
        />

        <hr className="border-gray-100 dark:border-gray-800" />

        <DesktopPlacementSettings
          headerDesktopLogoAlign={headerDesktopLogoAlign}
          setHeaderDesktopLogoAlign={setHeaderDesktopLogoAlign}
          headerDesktopSearchAlign={headerDesktopSearchAlign}
          setHeaderDesktopSearchAlign={setHeaderDesktopSearchAlign}
          headerDesktopWishlistAlign={headerDesktopWishlistAlign}
          setHeaderDesktopWishlistAlign={setHeaderDesktopWishlistAlign}
          headerDesktopCartAlign={headerDesktopCartAlign}
          setHeaderDesktopCartAlign={setHeaderDesktopCartAlign}
          headerDesktopThemeAlign={headerDesktopThemeAlign}
          setHeaderDesktopThemeAlign={setHeaderDesktopThemeAlign}
        />

        <hr className="border-gray-100 dark:border-gray-800" />

        <MobilePlacementSettings
          headerMobileMenuAlign={headerMobileMenuAlign}
          setHeaderMobileMenuAlign={setHeaderMobileMenuAlign}
          headerMobileLogoAlign={headerMobileLogoAlign}
          setHeaderMobileLogoAlign={setHeaderMobileLogoAlign}
          headerMobileSearchAlign={headerMobileSearchAlign}
          setHeaderMobileSearchAlign={setHeaderMobileSearchAlign}
          headerMobileCartAlign={headerMobileCartAlign}
          setHeaderMobileCartAlign={setHeaderMobileCartAlign}
          headerMobileWishlistAlign={headerMobileWishlistAlign}
          setHeaderMobileWishlistAlign={setHeaderMobileWishlistAlign}
        />

        <hr className="border-gray-100 dark:border-gray-800" />

        <HeaderPaletteSettings
          popularSearches={popularSearches}
          setPopularSearches={setPopularSearches}
          headerTopBarBg={headerTopBarBg}
          setHeaderTopBarBg={setHeaderTopBarBg}
          headerTopBarTextColor={headerTopBarTextColor}
          setHeaderTopBarTextColor={setHeaderTopBarTextColor}
          headerBg={headerBg}
          setHeaderBg={setHeaderBg}
          headerTextColor={headerTextColor}
          setHeaderTextColor={setHeaderTextColor}
          headerBorderColor={headerBorderColor}
          setHeaderBorderColor={setHeaderBorderColor}
        />
      </div>
    </div>
  );
}

