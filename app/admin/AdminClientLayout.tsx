'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { pktStartISO } from '@/lib/utils/dateFilters';
import { toast } from 'sonner';
import { useOrderNotification } from '@/lib/hooks/useOrderNotification';
import { useSettings } from '@/lib/hooks/useSettings';
import { AdminConfirmProvider } from '@/components/admin/shared/AdminConfirmProvider';
import { getNavSections } from '@/components/admin/layout/adminNavSections';
import { AdminDesktopSidebar } from '@/components/admin/layout/AdminDesktopSidebar';
import { AdminMobileDrawer } from '@/components/admin/layout/AdminMobileDrawer';
import { AdminMobileBottomBar } from '@/components/admin/layout/AdminMobileBottomBar';
import { AdminHeader } from '@/components/admin/layout/AdminHeader';
import { AdminCommandPalette } from '@/components/admin/layout/AdminCommandPalette';

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');

  const { settings } = useSettings();
  const logoUrl = settings?.logo_url || settings?.favicon_url || null;
  const storeName = settings?.store_name || process.env.NEXT_PUBLIC_BRAND_NAME || 'Admin Console';

  // ⚠️ Client-only active state — avoids SSR/CSR hydration mismatch.
  const [mounted, setMounted] = useState(false);
  const [clientSearch, setClientSearch] = useState('');

  useEffect(() => {
    setMounted(true);
    setClientSearch(window.location.search || '');
    
    // 🌟 Enforce clean, high-contrast Light mode across Admin Console (Shopify/Stripe Standard)
    try {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.body.classList.remove('dark');
      document.body.classList.add('admin-shell', 'light');
    } catch (e) {
      // ignore
    }

    // Restore sidebar collapse state (default to collapsed on tablet 768-1023px)
    try {
      const savedCollapsed = localStorage.getItem('admin_sidebar_collapsed');
      if (savedCollapsed !== null) {
        setIsSidebarCollapsed(savedCollapsed === 'true');
      } else if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      }
    } catch (e) {
      // ignore local storage errors
    }

    // Fetch admin user email for profile card
    async function loadAdminUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setAdminEmail(user.email);
        }
      } catch (e) {
        // ignore
      }
    }
    loadAdminUser();

    return () => {
      document.body.classList.remove('admin-shell');
    };
  }, [pathname, searchParams, supabase]);

  // Global shortcut: Cmd+K / Ctrl+K opens Command Palette
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Auto-close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Reset admin content scroll position to top on page or tab changes
  useEffect(() => {
    const mainEl = document.getElementById('admin-main-content');
    if (mainEl) {
      mainEl.scrollTop = 0;
    }
  }, [pathname, searchParams]);

  // 🔔 Real-time order notifications (sound + browser notification)
  useOrderNotification();

  // Ensure manifest is set to /admin-manifest.json for PWA install
  useEffect(() => {
    const existing = document.querySelector('link[rel="manifest"]');
    if (existing) {
      if (existing.getAttribute('href') !== '/admin-manifest.json') {
        existing.setAttribute('href', '/admin-manifest.json');
        existing.id = 'admin-manifest';
      }
    } else {
      const adminLink = document.createElement('link');
      adminLink.rel = 'manifest';
      adminLink.href = '/admin-manifest.json';
      adminLink.id = 'admin-manifest';
      document.head.appendChild(adminLink);
    }

    return () => {
      // On navigating back to storefront, restore /manifest.json
      const current = document.querySelector('link[rel="manifest"]');
      if (current && window.location.pathname && !window.location.pathname.startsWith('/admin')) {
        current.setAttribute('href', '/manifest.json');
      }
    };
  }, []);

  // 📊 Today's counts for sidebar/bottom tab badges
  const [todayCounts, setTodayCounts] = useState<Record<string, number>>({});
  const [aiEnabled, setAiEnabled] = useState(false);

  useEffect(() => {
    // PKT (UTC+5) start-of-day so the header badge matches the Orders list/stats.
    const startISO = pktStartISO();

    async function fetchTodayCounts() {
      try {
        const supabase = createClient();
        const [ordersRes, pendingRes, leadsRes, cartsRes, pendingCartsRes, settingsFetch] =
          await Promise.all([
            supabase.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', startISO),
            supabase
              .from('orders')
              .select('id', { count: 'exact', head: true })
              .gte('created_at', startISO)
              .in('status', ['pending', 'placed']),
            supabase
              .from('whatsapp_subscribers')
              .select('id', { count: 'exact', head: true })
              .gte('created_at', startISO),
            supabase
              .from('abandoned_carts')
              .select('id', { count: 'exact', head: true })
              .gte('last_activity', startISO),
            supabase
              .from('abandoned_carts')
              .select('id', { count: 'exact', head: true })
              .gte('last_activity', startISO)
              .eq('email_sent', false)
              .eq('order_placed', false),
            fetch('/api/ai-check')
              .then((r) => r.json())
              .catch(() => ({ ai_enabled: false })),
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
        console.warn(
          'Network issue while fetching admin badges (connection closed or blocked). Retrying next time...',
          err
        );
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
    analytics: true,
    reviews: true,
    store: true,
  });

  // Restore expanded sections from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin_nav_expanded_sections');
      if (saved) {
        const parsed = JSON.parse(saved);
        setExpandedSections((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('admin_nav_expanded_sections', JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('admin_sidebar_collapsed', String(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  };

  const navSections = getNavSections(aiEnabled, settings?.meta_sync_enabled);

  const isItemActive = useCallback(
    (href: string) => {
      if (!mounted) return false;
      const [basePath, searchQuery] = href.split('?');
      if (searchQuery) {
        return pathname === basePath && clientSearch === `?${searchQuery}`;
      }
      if (href === '/admin/dashboard') {
        return pathname === '/admin/dashboard' || pathname === '/admin';
      }
      if (href === '/admin/settings') {
        return pathname === '/admin/settings';
      }
      return pathname === href || pathname?.startsWith(href + '/');
    },
    [mounted, pathname, clientSearch]
  );

  // Auto-expand group containing active route
  useEffect(() => {
    if (!mounted) return;
    for (const section of navSections) {
      if (section.items.some((item) => isItemActive(item.href))) {
        setExpandedSections((prev) => {
          if (prev[section.key]) return prev;
          const next = { ...prev, [section.key]: true };
          try {
            localStorage.setItem('admin_nav_expanded_sections', JSON.stringify(next));
          } catch (e) {
            // ignore
          }
          return next;
        });
        break;
      }
    }
  }, [pathname, mounted, navSections, isItemActive]);

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
    <div className="admin-shell light flex h-[100dvh] w-full max-w-full flex-col md:flex-row bg-slate-50 overflow-hidden text-[13px] font-sans antialiased text-gray-900" style={{ isolation: 'isolate' }}>
      {/* 📱 Mobile & Tablet Off-Canvas Navigation Drawer */}
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
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        adminEmail={adminEmail}
      />

      {/* 💻 Desktop & Tablet Navigation Sidebar (280px / 76px rail) */}
      <AdminDesktopSidebar
        logoUrl={logoUrl}
        storeName={storeName}
        navSections={navSections}
        expandedSections={expandedSections}
        toggleSection={toggleSection}
        isItemActive={isItemActive}
        todayCounts={todayCounts}
        handleLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={toggleSidebarCollapse}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        adminEmail={adminEmail}
      />

      {/* Main Content Area (Automatically adjusts width as sidebar expands/collapses) */}
      <div className="admin-layout-wrapper flex-1 flex flex-col min-w-0 max-w-full overflow-hidden">
        <AdminHeader
          pageTitle={getPageTitle()}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          pendingOrdersCount={todayCounts.pending}
        />

        <main
          id="admin-main-content"
          className="flex-1 w-full max-w-full px-3 sm:px-4 md:px-5 pt-[calc(3.5rem+env(safe-area-inset-top,0px))] md:pt-4 pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))] md:pb-6 overflow-y-auto overflow-x-hidden overscroll-y-none bg-slate-50 text-gray-900 transition-colors duration-200"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {children}
        </main>
      </div>

      {/* 📱 Mobile Bottom Tab Bar (5 tabs: Dashboard, Orders, Products, Customers, More) */}
      <AdminMobileBottomBar
        pathname={pathname}
        todayCounts={todayCounts}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* ⚡ Command Palette / Quick Search Modal (Cmd+K) */}
      <AdminCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        navSections={navSections}
        todayCounts={todayCounts}
      />
    </div>
  );
}

export default function AdminClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen bg-slate-50 animate-pulse">
          <div className="hidden md:block w-64 bg-slate-200 h-full" />
          <div className="flex-1 flex flex-col">
            <div className="h-16 bg-white border-b border-gray-200" />
            <div className="flex-1 p-6 md:p-8 bg-slate-50" />
          </div>
        </div>
      }
    >
      <AdminConfirmProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </AdminConfirmProvider>
    </Suspense>
  );
}
