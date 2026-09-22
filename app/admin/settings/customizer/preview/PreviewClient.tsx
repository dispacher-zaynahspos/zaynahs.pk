'use client';

import React, { useState, useEffect, useRef } from 'react';
import { HomepageSection, StoreSettings, Product, Category, Review } from '@/lib/types';
import StoreFront from '@/components/store/StoreFront';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import MobileBottomNav from '@/components/common/MobileBottomNav';
import FloatingContacts from '@/components/common/FloatingContacts';
import CartBar from '@/components/store/CartBar';
import PremiumFeaturesProvider from '@/components/store/PremiumFeaturesProvider';
import ShopPage from '@/components/store/ShopPage';
import ThemeStyleRegistry from '@/components/common/ThemeStyleRegistry';
import { 
  StyleGuide, 
  useLiveProducts, 
  ProductPageBlocks 
} from './preview-client';

interface PreviewClientProps {
  initialSections: HomepageSection[];
  products: Product[];
  categories: Category[];
  initialSettings: StoreSettings;
  reviews: Review[];
}

export default function PreviewClient({
  initialSections,
  products,
  categories,
  initialSettings,
  reviews
}: PreviewClientProps) {
  const [sections, setSections] = useState<HomepageSection[]>(initialSections);
  const [settings, setSettings] = useState<StoreSettings>(initialSettings);
  const [activePage, setActivePage] = useState<'home' | 'shop' | 'product_detail' | 'product_card' | 'global' | 'appearance'>('home');
  const [productsList, setProductsList] = useState<Product[]>(products);
  const [activeProductSlug, setActiveProductSlug] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const liveProducts = useLiveProducts(productsList, sections, settings);

  const currentProduct = React.useMemo(() => {
    const defaultProduct = liveProducts[0];
    if (!activeProductSlug) return defaultProduct;
    return liveProducts.find(p => p.slug === activeProductSlug) || defaultProduct;
  }, [liveProducts, activeProductSlug]);

  const lastScrolledSectionId = useRef<string | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data) {
        if (event.data.type === 'sync') {
          if (event.data.sections) {
            setSections(event.data.sections);
          }
          if (event.data.settings) {
            setSettings(event.data.settings);
          }
          if (event.data.products) {
            setProductsList(event.data.products);
          }
          if (event.data.activeProductSlug) {
            setActiveProductSlug(event.data.activeProductSlug);
          }
          if (event.data.activeSectionId !== undefined) {
            const nextActiveId = event.data.activeSectionId;
            setActiveSectionId(nextActiveId);
            if (nextActiveId && nextActiveId !== lastScrolledSectionId.current) {
              lastScrolledSectionId.current = nextActiveId;
              setTimeout(() => {
                const element = document.getElementById(nextActiveId);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }, 100);
            }
          }
        } else if (event.data.type === 'scroll_to_section') {
          lastScrolledSectionId.current = event.data.sectionId;
          const element = document.getElementById(event.data.sectionId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else if (event.data.type === 'change_page') {
          setActivePage(event.data.page);
        }
      }
    };

    const handleLinkClick = (e: MouseEvent) => {
      let target = e.target as HTMLElement | null;
      let anchor: HTMLAnchorElement | null = null;
      let curr = target;
      while (curr) {
        if (curr.tagName === 'A') {
          anchor = curr as HTMLAnchorElement;
          break;
        }
        curr = curr.parentElement;
      }
      
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (href) {
          const isRelative = href.startsWith('/') && !href.startsWith('//');
          const isSameDomain = href.startsWith(window.location.origin);
          
          if (isRelative || isSameDomain) {
            e.preventDefault();
            e.stopPropagation();
            
            const path = isRelative ? href : href.substring(window.location.origin.length);
            
            let page: 'home' | 'shop' | 'product_detail' | 'global' = 'home';
            if (path.startsWith('/product/')) {
              page = 'product_detail';
              const slug = path.replace('/product/', '').split('?')[0];
              setActiveProductSlug(slug);
            } else if (path.startsWith('/shop') || path === '/shop') {
              page = 'shop';
            } else if (path === '/' || path === '') {
              page = 'home';
            }
            
            setActivePage(page);
            window.parent.postMessage({ type: 'nav_to_page', page, href: path }, '*');
            return;
          }
        }
      }
      
      let button: HTMLButtonElement | null = null;
      curr = target;
      while (curr) {
        if (curr.tagName === 'BUTTON') {
          button = curr as HTMLButtonElement;
          break;
        }
        curr = curr.parentElement;
      }
      
      if (button) {
        const text = button.textContent?.toLowerCase() || '';
        if (text.includes('choose options') || text.includes('buy now')) {
          let card = button.parentElement;
          while (card && !card.getAttribute('href')) {
            card = card.parentElement;
          }
          if (card) {
            const href = card.getAttribute('href');
            if (href) {
              e.preventDefault();
              e.stopPropagation();
              
              let page: 'home' | 'shop' | 'product_detail' | 'global' = 'home';
              if (href.startsWith('/product/')) {
                page = 'product_detail';
                const slug = href.replace('/product/', '').split('?')[0];
                setActiveProductSlug(slug);
              }
              
              setActivePage(page);
              window.parent.postMessage({ type: 'nav_to_page', page, href }, '*');
            }
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    document.addEventListener('click', handleLinkClick, true);
    window.parent.postMessage({ type: 'ready' }, '*');

    return () => {
      window.removeEventListener('message', handleMessage);
      document.removeEventListener('click', handleLinkClick, true);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#0f0f1b] text-gray-900 dark:text-gray-100 pb-20 md:pb-0 transition-colors duration-200 overflow-x-hidden w-full">
      <ThemeStyleRegistry settings={settings} />
      <Navbar settings={settings} storeName={settings?.storeName || 'Store'} logoUrl={settings?.logoUrl} logoWidth={settings?.logoWidth} />
      <main className="flex-grow bg-gray-50 dark:bg-[#0f0f1b] transition-colors duration-200 w-full">
        {(activePage === 'home' || activePage === 'global') && (
          <StoreFront
            initialProducts={liveProducts}
            categories={categories}
            settings={settings}
            reviews={reviews}
            sections={sections}
            isPreview={true}
            activeSectionId={activeSectionId}
          />
        )}
        {(activePage === 'shop' || activePage === 'product_card') && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <ShopPage
              initialProducts={liveProducts}
              categories={categories}
              settings={settings}
              isPreview={true}
            />
          </div>
        )}
        {activePage === 'product_detail' && liveProducts.length > 0 && (
          <ProductPageBlocks
            currentProduct={currentProduct}
            products={products}
            settings={settings}
          />
        )}
        {activePage === 'appearance' && (
          <StyleGuide settings={settings} products={liveProducts} />
        )}
      </main>
      <Footer settings={settings} />
      <CartBar currencySymbol={settings.currencySymbol} />
      <MobileBottomNav />
      <FloatingContacts settings={settings} />
      <PremiumFeaturesProvider settings={settings} />
    </div>
  );
}
