'use client';

import { useEffect, useRef } from 'react';
import { HomepageSection, StoreSettings, Product } from '@/lib/types';

interface UseCustomizerIframeSyncProps {
  sections: HomepageSection[];
  storeSettings: StoreSettings;
  localProducts: Product[];
  activeProductSlug: string | null;
  activeSectionId: string | null;
  activePage: 'home' | 'shop' | 'product_detail' | 'product_card' | 'global' | 'appearance';
  setActivePage: (page: 'home' | 'shop' | 'product_detail' | 'product_card' | 'global' | 'appearance') => void;
  setActiveSectionId: (id: string | null) => void;
  setActiveSubTab: (subTab: string) => void;
  setActiveProductSlug: (slug: string) => void;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
}

export function useCustomizerIframeSync({
  sections,
  storeSettings,
  localProducts,
  activeProductSlug,
  activeSectionId,
  activePage,
  setActivePage,
  setActiveSectionId,
  setActiveSubTab,
  setActiveProductSlug,
  iframeRef,
}: UseCustomizerIframeSyncProps) {
  useEffect(() => {
    const handleReady = (event: MessageEvent) => {
      if (event.data && event.data.type === 'ready') {
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage({
            type: 'sync',
            sections,
            settings: storeSettings,
            products: localProducts,
            activeProductSlug,
            activeSectionId
          }, '*');
          iframeRef.current.contentWindow.postMessage({
            type: 'change_page',
            page: activePage
          }, '*');
        }
      }
    };
    window.addEventListener('message', handleReady);
    
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'sync',
        sections,
        settings: storeSettings,
        products: localProducts,
        activeProductSlug,
        activeSectionId
      }, '*');
      iframeRef.current.contentWindow.postMessage({
        type: 'change_page',
        page: activePage
      }, '*');
    }

    return () => window.removeEventListener('message', handleReady);
  }, [sections, storeSettings, activePage, localProducts, activeProductSlug, activeSectionId, iframeRef]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data) {
        if (event.data.type === 'select_section') {
          setActivePage('home');
          setActiveSectionId(event.data.sectionId);
        } else if (event.data.type === 'select_global_tab') {
          setActivePage('global');
          setActiveSubTab(event.data.subTab);
          setActiveSectionId(null);
        } else if (event.data.type === 'select_product_detail_tab') {
          setActivePage('product_detail');
          const blockId = event.data.subTab === 'swatches' ? 'details' : event.data.subTab;
          setActiveSubTab(blockId);
          setActiveSectionId(blockId);
        } else if (event.data.type === 'nav_to_page') {
          const newPage = event.data.page;
          setActivePage(newPage);
          if (newPage === 'home') {
            setActiveSectionId(sections[0]?.id || null);
            setActiveSubTab('');
          } else if (newPage === 'product_detail') {
            if (event.data.href) {
              const slug = event.data.href.replace('/product/', '').split('?')[0];
              setActiveProductSlug(slug);
            }
            const firstBlock = (storeSettings.product_page_layout || ['details', 'ticker', 'reviews', 'related', 'recently_viewed', 'social_feed'])[0];
            const blockId = firstBlock || 'details';
            setActiveSectionId(blockId);
            setActiveSubTab(blockId);
          } else if (newPage === 'shop') {
            setActiveSectionId(null);
            setActiveSubTab('layout');
          }
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [sections, storeSettings.product_page_layout, setActivePage, setActiveSectionId, setActiveSubTab, setActiveProductSlug]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (iframeRef.current?.contentWindow && activeSectionId && (activePage === 'home' || activePage === 'product_detail')) {
        iframeRef.current.contentWindow.postMessage({
          type: 'scroll_to_section',
          sectionId: activeSectionId
        }, '*');
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [activeSectionId, activePage, iframeRef]);
}
