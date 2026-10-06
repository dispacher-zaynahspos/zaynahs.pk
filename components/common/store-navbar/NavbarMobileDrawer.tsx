'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Heart, User, X, Search, Truck, ChevronRight, WhatsAppIcon } from '@/components/common/Icons';
import { cleanWhatsAppPhone } from '@/lib/utils/whatsapp';
import { formatPrice } from '@/lib/utils/whatsapp';
import { NavigationItem, StoreSettings, Product } from '@/lib/types';

// Session-level cache so opening the menu doesn't refetch the catalog every time.
let cachedFeatured: Product[] | null = null;

interface NavbarMobileDrawerProps {
  mounted: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  isAdmin: boolean;
  navItems: NavigationItem[];
  customerSession: any;
  totalItems: number;
  wishlistCount: number;
  settings?: StoreSettings;
  topBarPhone: string;
  topBarEmail?: string;
  storeName: string;
  renderMobileNavItem: (item: NavigationItem, depth?: number) => React.ReactNode;
  logoUrl?: string;
  onOpenSearch?: () => void;
}

export function NavbarMobileDrawer({
  mounted,
  mobileMenuOpen,
  setMobileMenuOpen,
  isAdmin,
  navItems,
  customerSession,
  totalItems,
  wishlistCount,
  settings,
  topBarPhone,
  storeName,
  renderMobileNavItem,
  logoUrl,
  onOpenSearch,
}: NavbarMobileDrawerProps) {
  const [featured, setFeatured] = useState<Product[]>(cachedFeatured ?? []);

  // Lazily load a few featured products the first time the menu opens (cached for the
  // session so re-opening the menu never refetches the catalog).
  useEffect(() => {
    if (!mobileMenuOpen || isAdmin || cachedFeatured) return;
    let cancelled = false;
    (async () => {
      try {
        const { getProductsClient } = await import('@/lib/services/products-client');
        const data = await getProductsClient();
        const picks = data.filter((p) => p.is_featured).slice(0, 4);
        cachedFeatured = picks.length > 0 ? picks : data.slice(0, 4);
        if (!cancelled) setFeatured(cachedFeatured);
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [mobileMenuOpen, isAdmin]);

  if (!mounted || !mobileMenuOpen) return null;

  const whatsappNumber = settings?.whatsapp_number || settings?.floating_whatsapp_number || topBarPhone;
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${cleanWhatsAppPhone(whatsappNumber)}?text=${encodeURIComponent(
        `Hello! I am browsing ${storeName} and need some assistance.`
      )}`
    : null;

  const handleSearchClick = () => {
    setMobileMenuOpen(false);
    if (onOpenSearch) onOpenSearch();
  };

  return (
    <div className="fixed inset-0 z-[999] flex md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity duration-300 animate-in fade-in"
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Drawer Container — clean white panel, sharp edge, rounded bottom-right */}
      <div className="relative flex w-[87%] max-w-[400px] flex-1 flex-col bg-white dark:bg-[#0c0c16] text-gray-900 dark:text-white shadow-2xl h-full transition-transform duration-300 ease-in-out rounded-br-3xl animate-in slide-in-from-left duration-300 select-none">

        {/* Drawer Header — brand wordmark (from General settings) next to logo, small clean close */}
        <div className="flex items-center justify-between px-6 pt-6 pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {logoUrl && (
              <div className="relative h-9 w-9 shrink-0">
                <Image
                  src={logoUrl}
                  alt={storeName}
                  fill
                  sizes="36px"
                  className="object-contain object-left"
                />
              </div>
            )}
            <span className="font-[family-name:var(--font-heading)] text-[22px] leading-none font-black tracking-[-0.02em] text-gray-950 dark:text-white truncate">
              {storeName}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="flex h-9 w-9 -mr-1.5 items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer active:scale-90"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" strokeWidth={1.5} />
          </button>
        </div>

        {/* Quick Search Trigger — minimal underline field */}
        {onOpenSearch && (
          <div className="px-6 pt-1 pb-2">
            <button
              type="button"
              onClick={handleSearchClick}
              className="w-full flex items-center gap-2.5 py-2 border-b border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-500 transition-colors cursor-pointer group"
            >
              <Search className="h-4 w-4 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
              <span className="text-sm group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                Search products, collections, categories...
              </span>
            </button>
          </div>
        )}

        {/* Navigation Items (Main Catalog List) — big typographic rows */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pt-2 pb-4">
          {navItems.map((item) => renderMobileNavItem(item))}

          {/* Featured products — appears right after the categories end */}
          {!isAdmin && featured.length > 0 && (
            <div className="mt-5 pt-5 border-t border-gray-100 dark:border-white/5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Featured
              </span>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {featured.map((p) => {
                  const img = p.images?.find((i) => i.is_primary)?.url || p.images?.[0]?.url;
                  return (
                    <Link
                      key={p.id}
                      href={`/product/${p.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="group flex flex-col gap-1.5 active:scale-[0.98] transition-transform"
                    >
                      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-white/5">
                        {img ? (
                          <Image
                            src={img}
                            alt={p.name}
                            fill
                            sizes="160px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[10px] text-gray-400">No Image</div>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 line-clamp-1 leading-tight">
                        {p.name}
                      </span>
                      <span className="text-[11px] font-black text-gray-900 dark:text-white">
                        {formatPrice(p.price, settings?.currency_symbol)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions Row — plain icons + labels, no pills */}
        {!isAdmin && (
          <div className="px-6 py-3 border-t border-gray-100 dark:border-white/5">
            <div className="grid grid-cols-4 gap-2">
              {/* Account */}
              <Link
                href={customerSession ? '/account' : '/login'}
                onClick={() => setMobileMenuOpen(false)}
                className="flex flex-col items-center justify-center gap-1.5 py-1 active:scale-95 transition-transform text-center group"
              >
                <User className="h-5 w-5 text-gray-700 dark:text-gray-200" strokeWidth={1.5} />
                <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 truncate max-w-full">
                  {customerSession ? 'Account' : 'Sign In'}
                </span>
              </Link>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex flex-col items-center justify-center gap-1.5 py-1 active:scale-95 transition-transform text-center relative group"
              >
                <div className="relative">
                  <Heart className="h-5 w-5 text-gray-700 dark:text-gray-200" strokeWidth={1.5} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[8.5px] font-black text-white">
                      {wishlistCount}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 truncate max-w-full">
                  Wishlist
                </span>
              </Link>

              {/* Shopping Cart */}
              <Link
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex flex-col items-center justify-center gap-1.5 py-1 active:scale-95 transition-transform text-center relative group"
              >
                <div className="relative">
                  <ShoppingBag className="h-5 w-5 text-gray-700 dark:text-gray-200" strokeWidth={1.5} />
                  {totalItems > 0 && (
                    <span
                      style={{ backgroundColor: 'var(--color-primary, #0f172a)' }}
                      className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full text-[8.5px] font-black text-white"
                    >
                      {totalItems}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 truncate max-w-full">
                  Cart
                </span>
              </Link>

              {/* Track Order */}
              <Link
                href="/track-order"
                onClick={() => setMobileMenuOpen(false)}
                className="flex flex-col items-center justify-center gap-1.5 py-1 active:scale-95 transition-transform text-center group"
              >
                <Truck className="h-5 w-5 text-gray-700 dark:text-gray-200" strokeWidth={1.5} />
                <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 truncate max-w-full">
                  Track
                </span>
              </Link>
            </div>
          </div>
        )}

        {/* WhatsApp Customer Support — restyled, no live dot */}
        {whatsappUrl && (
          <div className="px-6 pb-1">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-2.5 text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <WhatsAppIcon className="h-5 w-5 fill-current shrink-0" />
                <span className="text-sm font-bold truncate">WhatsApp Support</span>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        )}

        {/* Drawer Footer — minimal */}
        <div className="border-t border-gray-100 dark:border-white/5 px-6 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom,0.75rem))] text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
          <span className="font-bold text-gray-700 dark:text-gray-300 tracking-tight">© {storeName}</span>
          {topBarPhone && (
            <a
              href={`tel:${topBarPhone.replace(/\D/g, '')}`}
              className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white font-medium transition-colors"
            >
              {topBarPhone}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
