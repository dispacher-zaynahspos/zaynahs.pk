'use client';

import React, { useEffect } from 'react';
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
  Truck
} from '@/components/common/Icons';

export const TABS = [
  { id: 'general', label: 'General', icon: Settings, href: '/admin/settings?tab=general' },
  { id: 'profile', label: 'Profile & Account', icon: User, href: '/admin/settings/profile' },
  { id: 'header', label: 'Header', icon: Layout, href: '/admin/settings?tab=header' },
  { id: 'navigation', label: 'Navigation', icon: Navigation, href: '/admin/settings?tab=navigation' },
  { id: 'products', label: 'Products', icon: Package, href: '/admin/settings?tab=products' },
  { id: 'trust', label: 'Trust & Badges', icon: Zap, href: '/admin/settings?tab=trust' },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, href: '/admin/settings?tab=whatsapp' },
  { id: 'policies', label: 'Policies & FAQ', icon: HelpCircle, href: '/admin/settings?tab=policies' },
  { id: 'footer', label: 'Footer & Social', icon: Globe, href: '/admin/settings?tab=footer' },
  { id: 'shipping', label: 'Shipping & Pay', icon: ShoppingBag, href: '/admin/settings?tab=shipping' },
  { id: 'premium', label: 'Premium Features', icon: Zap, href: '/admin/settings?tab=premium' },
  { id: 'courier', label: 'Courier Manager', icon: Truck, href: '/admin/settings/courier' },
  { id: 'coupons', label: 'Coupons', icon: CreditCard, href: '/admin/settings?tab=coupons' },
  { id: 'pixels', label: 'Pixels & SEO', icon: Globe, href: '/admin/settings?tab=pixels' },
  { id: 'ai_settings', label: 'AI Settings', icon: Zap, href: '/admin/settings?tab=ai_settings' },
  { id: 'email', label: 'Email & SMTP', icon: Mail, href: '/admin/settings?tab=email' },
  { id: 'meta_sync', label: 'Meta Sync', icon: Globe, href: '/admin/settings?tab=meta_sync' },
  { id: 'customizer', label: 'Customizer', icon: Layout, href: '/admin/settings/customizer' },
] as const;

export type TabId = typeof TABS[number]['id'];

interface SettingsTabBarProps {
  activeTab: string;
  setActiveTab?: (tab: any) => void;
  metaSyncEnabled?: boolean;
}

export function SettingsTabBar({ activeTab, setActiveTab, metaSyncEnabled }: SettingsTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Scroll active tab into view horizontally
  useEffect(() => {
    const activeBtn = document.getElementById(`tab-btn-${activeTab}`);
    const tabBar = document.getElementById('settings-tab-bar');
    if (activeBtn && tabBar) {
      const containerRect = tabBar.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      if (btnRect.left < containerRect.left || btnRect.right > containerRect.right) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeTab]);

  const handleTabClick = (tab: typeof TABS[number]) => {
    if (tab.href.startsWith('/admin/settings?tab=') && pathname === '/admin/settings' && setActiveTab) {
      setActiveTab(tab.id);
    } else {
      router.push(tab.href);
    }
  };

  return (
    <div className="hidden md:block w-full bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-xl p-1.5 shadow-xs mb-6">
      <div id="settings-tab-bar" className="flex gap-1 overflow-x-auto scrollbar-hide flex-nowrap scroll-smooth py-0.5">
        {TABS.filter(tab => tab.id !== 'meta_sync' || metaSyncEnabled).map((tab) => {
          const { id, label, icon: Icon } = tab;
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              id={`tab-btn-${id}`}
              type="button"
              onClick={() => handleTabClick(tab)}
              style={isActive ? { backgroundColor: 'var(--color-primary, #C2185B)' } : undefined}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 ${
                isActive
                  ? 'text-white shadow-xs font-black'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
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
