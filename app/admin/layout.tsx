'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useOrderNotification } from '@/lib/hooks/useOrderNotification';
import { useSettings } from '@/lib/hooks/useSettings';
import { AdminConfirmProvider } from '@/components/admin/shared/AdminConfirmProvider';
import { getNavSections } from '@/components/admin/layout/adminNavSections';
import { AdminDesktopSidebar } from '@/components/admin/layout/AdminDesktopSidebar';
import { AdminMobileDrawer } from '@/components/admin/layout/AdminMobileDrawer';
import { AdminMobileBottomBar } from '@/components/admin/layout/AdminMobileBottomBar';
import { AdminHeader } from '@/components/admin/layout/AdminHeader';

function AdminLayoutContent({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { settings } = useSettings();
  const logoUrl = settings?.logoUrl || settings?.faviconUrl || null;
  const storeName = settings?.storeName || process.env.NEXT_PUBLIC_BRAND_NAME || 'Admin Console';

  // ⚠️ Client-only active state — avoids SSR/CSR hydration mismatch.
  const [mounted, setMounted] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  useEffect(() => {
    setMounted(true);
    setClientSearch(window.location.search || '');
    document.body.classList.add('admin-shell');
    return () => {
      document.body.classList.remove('admin-shell');
    };
  }, [pathname, searchParams]);

  // Reset admin content scroll position to top on page or tab changes
  useEffect(() => {
    const mainEl = document.getElementById('admin-main-content');
    if (mainEl) {
      mainEl.scrollTop = 0;
    }
  }, [pathname, searchParams]);

  // 🔔 Real-time order notifications (sound + browser notification)
  useOrderNotification();

  // Swap manifest for admin PWA install
  useEffect(() => {
    const storeLink = document.querySelector('link[rel="manifest"]');
    if (storeLink) storeLink.remove();

    const adminLink = document.createElement('link');
    adminLink.rel = 'manifest';
    adminLink.href = '/admin-manifest.json';
    adminLink.id = 'admin-manifest';
    document.head.appendChild(adminLink);

    return () => {
      const el = document.getElementById('admin-manifest');
      if (el) el.remove();
      if (storeLink) document.head.appendChild(storeLink.cloneNode());
    };
  }, []);

  // 📊 Today's counts for sidebar/bottom tab badges
  const [todayCounts, setTodayCounts] = useState<Record<string, number>>({});
  const [aiEnabled, setAiEnabled] = useState(false);

  useEffect(() => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startISO = startOfDay.toISOString();

    async function fetchTodayCounts() {
      try {
        const supabase = createClient();
        const [ordersRes, pendingRes, leadsRes, cartsRes, pendingCartsRes, settingsFetch] = await Promise.all([
          supabase.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', startISO),
          supabase.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', startISO).in('status', ['pending', 'placed']),
          supabase.from('whatsapp_subscribers').select('id', { count: 'exact', head: true }).gte('created_at', startISO),
          supabase.from('abandoned_carts').select('id', { count: 'exact', head: true }).gte('last_activity', startISO),
          supabase.from('abandoned_carts').select('id', { count: 'exact', head: true }).gte('last_activity', startISO).eq('email_sent', false).eq('order_placed', false),
          fetch('/api/ai-check').then(r => r.json()).catch(() => ({ ai_enabled: false }))
        ]);
        setTodayCounts({
          orders: ordersRes?.count ?? 0,
          pending: pendingRes?.count ?? 0,
          leads: leadsRes?.count ?? 0,
          carts: cartsRes?.count ?? 0,
          pendingCarts: pendingCartsRes?.count ?? 0,
        });
        setAiEnabled(settingsFetch?.ai_enabled || false);
      } catch (err) {
        console.warn('Network issue while fetching admin badges (connection closed or blocked). Retrying next time...', err);
      }
    }
    fetchTodayCounts();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Logged out successfully');
      router.refresh();
      router.push('/admin/login');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    dashboard: true,
    catalog: true,
    orders: true,
    customers: true,
    reviews: true,
    trash: true,
    reporting: true,
    settings: false,
  });

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const navSections = getNavSections(aiEnabled, settings?.meta_sync_enabled);

  const isItemActive = (href: string) => {
    if (!mounted) return false;
    const [basePath, searchQuery] = href.split('?');
    if (searchQuery) {
      const active = pathname === basePath && clientSearch === `?${searchQuery}`;
      if (pathname === '/admin/settings' && searchQuery === 'tab=general' && (!clientSearch || clientSearch === '')) {
        return true;
      }
      return active;
    }
    return pathname === href || (basePath !== '/admin/dashboard' && pathname?.startsWith(basePath) && !pathname?.startsWith('/admin/settings'));
  };

  const getPageTitle = () => {
    if (!mounted) return 'Console';
    for (const section of navSections) {
      for (const item of section.items) {
        if (isItemActive(item.href)) return item.label;
      }
    }
    return 'Console';
  };

  const cleanPathname = pathname?.replace(/\/$/, '') || '';
  if (
    cleanPathname === '/admin/login' ||
    cleanPathname === '/admin/settings/customizer/preview' ||
    cleanPathname === '/admin/settings/customizer'
  ) {
    return <>{children}</>;
  }

  return (
    <div className="admin-shell flex h-screen w-full max-w-full flex-col md:flex-row bg-slate-50 dark:bg-[#0b0b14] overflow-hidden text-[13px] font-sans antialiased">
      <AdminMobileDrawer
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        logoUrl={logoUrl}
        storeName={storeName}
        navSections={navSections}
        expandedSections={expandedSections}
        toggleSection={toggleSection}
        isItemActive={isItemActive}
        handleLogout={handleLogout}
        todayCounts={todayCounts}
      />

      <AdminDesktopSidebar
        logoUrl={logoUrl}
        storeName={storeName}
        navSections={navSections}
        expandedSections={expandedSections}
        toggleSection={toggleSection}
        isItemActive={isItemActive}
        todayCounts={todayCounts}
        handleLogout={handleLogout}
      />

      {/* Main content area */}
      <div className="admin-layout-wrapper flex-1 flex flex-col min-w-0 max-w-full overflow-hidden">
        <AdminHeader
          pageTitle={getPageTitle()}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        <main id="admin-main-content" className="flex-1 w-full max-w-full px-3 sm:px-4 md:px-5 pt-14 md:pt-4 pb-14 md:pb-6 overflow-y-auto overflow-x-hidden bg-slate-50/70 dark:bg-[#0b0b14] transition-colors duration-200">
          {children}
        </main>
      </div>

      <AdminMobileBottomBar
        pathname={pathname}
        todayCounts={todayCounts}
      />
    </div>
  );
}

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen bg-gray-50 dark:bg-[#0f0f1b] animate-pulse">
        <div className="hidden md:block w-64 bg-[#1a1a2e] h-full" />
        <div className="flex-1 flex flex-col">
          <div className="h-16 bg-white dark:bg-[#16162a] border-b border-gray-200 dark:border-gray-800" />
          <div className="flex-1 p-6 md:p-8 bg-gray-50 dark:bg-[#0f0f1b]" />
        </div>
      </div>
    }>
      <AdminConfirmProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </AdminConfirmProvider>
    </Suspense>
  );
}
