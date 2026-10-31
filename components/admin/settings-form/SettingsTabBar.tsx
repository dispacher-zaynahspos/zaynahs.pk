'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Settings,
  Layout,
  Navigation,
  Package,
  Zap,
  MessageCircle,
  Globe,
  ShoppingBag,
  CreditCard,
  HelpCircle,
  Mail,
  User,
  Truck,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from '@/components/common/Icons';

// Tab order groups storefront-appearance tabs first, then operations tabs,
// and pins the visual Customizer editor at the VERY LAST position (highlighted).
export const TABS = [
  // --- Storefront appearance ---
  { id: 'general', label: 'General', icon: Settings, href: '/admin/settings?tab=general' },
  { id: 'header', label: 'Header', icon: Layout, href: '/admin/settings?tab=header' },
  { id: 'footer', label: 'Footer & Social', icon: Globe, href: '/admin/settings?tab=footer' },
  { id: 'navigation', label: 'Navigation', icon: Navigation, href: '/admin/settings?tab=navigation' },
  { id: 'products', label: 'Products', icon: Package, href: '/admin/settings?tab=products' },
  { id: 'trust', label: 'Trust & Badges', icon: Zap, href: '/admin/settings?tab=trust' },
  // --- Operations ---
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, href: '/admin/settings?tab=whatsapp' },
  { id: 'shipping', label: 'Shipping & Pay', icon: ShoppingBag, href: '/admin/settings?tab=shipping' },
  { id: 'courier', label: 'Courier Manager', icon: Truck, href: '/admin/settings/courier' },
  { id: 'coupons', label: 'Coupons', icon: CreditCard, href: '/admin/settings?tab=coupons' },
  { id: 'policies', label: 'Policies & FAQ', icon: HelpCircle, href: '/admin/settings?tab=policies' },
  { id: 'profile', label: 'Profile & Account', icon: User, href: '/admin/settings/profile' },
  { id: 'premium', label: 'Premium Features', icon: Zap, href: '/admin/settings?tab=premium' },
  { id: 'pixels', label: 'Pixels & SEO', icon: Globe, href: '/admin/settings?tab=pixels' },
  { id: 'ai_settings', label: 'AI Settings', icon: Zap, href: '/admin/settings?tab=ai_settings' },
  { id: 'email', label: 'Email & SMTP', icon: Mail, href: '/admin/settings?tab=email' },
  { id: 'meta_sync', label: 'Meta Sync', icon: Globe, href: '/admin/settings?tab=meta_sync' },
  // --- Visual Storefront Editor (Pinned & Highlighted at the end) ---
  { id: 'customizer', label: 'Customizer', icon: Layout, href: '/admin/settings/customizer', isSpecial: true },
] as const;

export type TabId = typeof TABS[number]['id'];

interface SettingsTabBarProps {
  activeTab: string;
  setActiveTab?: (tab: TabId) => void;
  metaSyncEnabled?: boolean;
}

export function SettingsTabBar({ activeTab, setActiveTab }: SettingsTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll bounds to conditionally show left/right arrow buttons
  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 6);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  // Scroll active tab into view horizontally smoothly
  useEffect(() => {
    const activeBtn = document.getElementById(`tab-btn-${activeTab}`);
    const tabBar = scrollContainerRef.current;
    if (activeBtn && tabBar) {
      const containerRect = tabBar.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      if (btnRect.left < containerRect.left || btnRect.right > containerRect.right) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
      checkScroll();
    }
  }, [activeTab, checkScroll]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distance = direction === 'left' ? -280 : 280;
    el.scrollBy({ left: distance, behavior: 'smooth' });
  };

  const handleTabClick = (tab: typeof TABS[number]) => {
    if (tab.href.startsWith('/admin/settings?tab=') && pathname === '/admin/settings' && setActiveTab) {
      setActiveTab(tab.id);
    } else {
      router.push(tab.href);
    }
  };

  return (
    <div className="relative w-full bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-2xl p-1.5 shadow-xs mb-6 group">
      {/* Scroll Left Button */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => handleScroll('left')}
          className="hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 z-10 h-7 w-7 items-center justify-center rounded-xl bg-white/95 dark:bg-[#16162a]/95 text-gray-700 dark:text-gray-200 shadow-md border border-gray-200 dark:border-gray-700 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          aria-label="Scroll tabs left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      {/* Scroll Right Button */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => handleScroll('right')}
          className="hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 z-10 h-7 w-7 items-center justify-center rounded-xl bg-white/95 dark:bg-[#16162a]/95 text-gray-700 dark:text-gray-200 shadow-md border border-gray-200 dark:border-gray-700 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          aria-label="Scroll tabs right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Tabs Container — Single-Row Perfectly Aligned with Smooth Scroll */}
      <div
        ref={scrollContainerRef}
        id="settings-tab-bar"
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none touch-pan-x py-0.5 scroll-smooth"
      >
        {TABS.map((tab) => {
          const { id, label, icon: Icon } = tab;
          const isActive = activeTab === id;
          const isCustomizer = id === 'customizer';

          if (isCustomizer) {
            return (
              <button
                key={id}
                id={`tab-btn-${id}`}
                type="button"
                onClick={() => handleTabClick(tab)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 min-h-[40px] sm:min-h-[36px] ml-auto border shadow-xs ${
                  isActive
                    ? 'bg-gradient-to-r from-[#e94560] to-orange-500 text-white border-transparent shadow-md ring-2 ring-[#e94560]/50'
                    : 'bg-gradient-to-r from-[#e94560]/10 via-purple-500/10 to-amber-500/15 hover:from-[#e94560]/20 hover:to-amber-500/25 text-[#e94560] dark:text-amber-400 border-[#e94560]/35 hover:border-[#e94560]/60 active:scale-98'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0 animate-pulse" />
                <span>{label}</span>
                <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-full bg-[#e94560]/20 text-[#e94560] dark:text-white dark:bg-white/20">
                  Visual
                </span>
              </button>
            );
          }

          return (
            <button
              key={id}
              id={`tab-btn-${id}`}
              type="button"
              onClick={() => handleTabClick(tab)}
              style={isActive ? { backgroundColor: 'var(--color-primary, #C2185B)' } : undefined}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 min-h-[40px] sm:min-h-[36px] ${
                isActive
                  ? 'text-white shadow-xs font-black'
                  : 'text-gray-600 dark:text-gray-400 bg-gray-50/80 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
