'use client';

import React from 'react';
import Link from 'next/link';

interface NavbarLogoProps {
  pathname: string;
  logoUrl?: string;
  logoWidth: number;
  storeName: string;
  customTextColorStyle: React.CSSProperties;
  setSearchOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
}

export function NavbarLogo({
  pathname,
  logoUrl,
  logoWidth,
  storeName,
  customTextColorStyle,
  setSearchOpen,
  setMobileMenuOpen,
}: NavbarLogoProps) {
  return (
    <Link
      href="/"
      key="logo"
      className="flex items-center gap-2 shrink-0 select-none active:scale-95 active:opacity-80 transition-all duration-200"
      onClick={(e) => {
        setSearchOpen(false);
        setMobileMenuOpen(false);
        if (pathname === '/') {
          if (typeof window !== 'undefined' && window.scrollY > 0) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        } else {
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            setTimeout(() => {
              if (window.location.pathname === currentPath) {
                window.location.href = '/';
              }
            }, 800);
          }
        }
      }}
    >
      {logoUrl ? (
        <div
          style={{ width: `${logoWidth}px`, maxWidth: `${logoWidth}px` }}
          className="flex items-center shrink-0 transition-all duration-200"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt={storeName}
            style={{ width: `${logoWidth}px`, height: 'auto', maxWidth: '100%', display: 'block' }}
            className="object-contain max-h-16 md:max-h-20"
            fetchPriority="high"
          />
        </div>
      ) : (
        <span className="text-lg sm:text-xl font-black tracking-tight md:text-2xl" style={customTextColorStyle}>
          {storeName}
        </span>
      )}
    </Link>
  );
}
