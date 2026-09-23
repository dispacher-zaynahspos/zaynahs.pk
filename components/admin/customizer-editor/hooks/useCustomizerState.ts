'use client';

import React, { useState, useTransition, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Product, Category, StoreSettings, Review, HomepageSection, Collection } from '@/lib/types';
import { useConfirm } from '@/components/admin/shared/AdminConfirmProvider';
import { 
  updateHomepageSection, 
  reorderHomepageSections, 
  addHomepageSection, 
  deleteHomepageSection 
} from '@/lib/services/sections';
import { updateSettings } from '@/lib/services/settings';
import { updateProductFieldsAction as updateProductFields } from '@/lib/services/products/actions';
import { toast } from 'sonner';
import { useCustomizerIframeSync } from './useCustomizerIframeSync';

interface UseCustomizerStateProps {
  initialSections: HomepageSection[];
  products: Product[];
  categories: Category[];
  collections?: Collection[];
  settings: StoreSettings | null;
  reviews?: Review[];
}

export function useCustomizerState({
  initialSections,
  products,
  categories,
  collections = [],
  settings,
  reviews = []
}: UseCustomizerStateProps) {
  const router = useRouter();
  const { confirm } = useConfirm();
  
  const [sections, setSections] = useState<HomepageSection[]>(initialSections);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(
    initialSections.length > 0 ? initialSections[0].id : null
  );
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('mobile');
  const [mobileTab, setMobileTab] = useState<'preview' | 'sections' | 'settings'>('preview');
  const [isPending, startTransition] = useTransition();

  const [activePage, setActivePage] = useState<'home' | 'shop' | 'product_detail' | 'product_card' | 'global' | 'appearance'>('home');
  const [activeSubTab, setActiveSubTab] = useState<string>('');
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(settings!);
  const isFirstRender = useRef(true);

  const [localProducts, setLocalProducts] = useState<Product[]>(products);
  const [editedProducts, setEditedProducts] = useState<Record<string, Partial<Product>>>({});
  const [activeProductSlug, setActiveProductSlug] = useState<string | null>(null);

  const currentProduct = useMemo(() => {
    const defaultProduct = localProducts[0];
    if (!activeProductSlug) return defaultProduct;
    return localProducts.find(p => p.slug === activeProductSlug) || defaultProduct;
  }, [localProducts, activeProductSlug]);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (activePage === 'shop') {
      setActiveSubTab('swatches');
    } else if (activePage === 'product_detail') {
      setActiveSubTab('layout');
    } else if (activePage === 'global') {
      setActiveSubTab('branding');
    }
  }, [activePage]);

  useCustomizerIframeSync({
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
    iframeRef
  });

  const [containerWidth, setContainerWidth] = useState<number>(1000);
  const [containerHeight, setContainerHeight] = useState<number>(700);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(async () => {
      try {
        await updateSettings(storeSettings);
      } catch {
        // Silently fail
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [storeSettings]);

  useEffect(() => {
    if (!previewContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
        setContainerHeight(entry.contentRect.height);
      }
    });
    observer.observe(previewContainerRef.current);
    return () => observer.disconnect();
  }, []);

  const activeSection = useMemo(() => {
    return sections.find(s => s.id === activeSectionId) || null;
  }, [sections, activeSectionId]);

  const handleUpdateSection = (id: string, updates: Partial<HomepageSection>) => {
    setSections(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          ...updates,
          settings: { ...s.settings, ...(updates.settings || {}) },
          content_data: { ...s.content_data, ...(updates.content_data || {}) }
        };
      }
      return s;
    }));
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sections.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newSections = [...sections];
    
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    const reordered = newSections.map((sec, idx) => ({
      ...sec,
      sort_order: idx + 1
    }));

    setSections(reordered);
  };

  const handleDeleteSection = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Section',
      message: 'Are you sure you want to delete this section?',
      variant: 'danger',
      confirmText: 'Delete'
    });
    if (!confirmed) return;

    startTransition(async () => {
      try {
        await deleteHomepageSection(id);
        setSections(prev => prev.filter(s => s.id !== id));
        if (activeSectionId === id) {
          setActiveSectionId(sections.length > 1 ? sections.find(s => s.id !== id)?.id || null : null);
        }
        toast.success('Section deleted successfully');
      } catch (err) {
        toast.error('Failed to delete section');
      }
    });
  };

  const handleAddSection = async (type: string) => {
    const defaultTitles: Record<string, string> = {
      hero_banner: 'Promo Slider',
      product_grid: 'Featured Products',
      category_list: 'Shop By Category',
      category_grid: 'Featured Collection Highlights',
      collections_grid: 'Nested Collections Grid',
      promo_banner: 'Limited Time Deal',
      trust_badges: 'Our Promises',
      recent_reviews: 'Customer Reviews',
      brands_logos: 'Our Premium Partners',
      flash_sale: 'Super Flash Sale'
    };

    startTransition(async () => {
      try {
        const newSec = await addHomepageSection(type, defaultTitles[type] || 'New Section');
        setSections(prev => [...prev, newSec]);
        setActiveSectionId(newSec.id);
        toast.success('Section added successfully');
      } catch (err) {
        toast.error('Failed to add section');
      }
    });
  };

  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaSelectCallback, setMediaSelectCallback] = useState<((url: string) => void) | null>(null);
  const [mediaUploadTarget, setMediaUploadTarget] = useState<{
    sectionId: string;
    fieldPath: 'settings' | 'content_data';
    fieldKey: string;
    isGridItem?: boolean;
    gridIndex?: number;
    isSlide?: boolean;
    slideId?: string;
  } | null>(null);

  const handleMediaSelected = (urls: string[]) => {
    if (urls.length === 0) return;
    const url = urls[0];

    if (mediaSelectCallback) {
      mediaSelectCallback(url);
      setMediaSelectCallback(null);
      setIsMediaModalOpen(false);
      return;
    }

    if (!mediaUploadTarget) return;
    const { sectionId, fieldPath, fieldKey, isGridItem, gridIndex, isSlide, slideId } = mediaUploadTarget;

    if (sectionId === 'global') {
      setStoreSettings(prev => ({
        ...prev,
        [fieldKey]: url
      }));
      return;
    }

    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    if (isSlide && slideId) {
      const slides = section.content_data?.slides || [];
      const updatedSlides = slides.map((s: any) => s.id === slideId ? { ...s, [fieldKey]: url } : s);
      handleUpdateSection(sectionId, {
        content_data: {
          ...section.content_data,
          slides: updatedSlides
        }
      });
    } else if (isGridItem && gridIndex !== undefined) {
      const items = section.content_data?.items || [];
      const updatedItems = [...items];
      updatedItems[gridIndex] = { ...updatedItems[gridIndex], [fieldKey]: url };
      handleUpdateSection(sectionId, { content_data: { items: updatedItems } });
    } else {
      const updates: Partial<HomepageSection> = {};
      if (fieldPath === 'settings') {
        updates.settings = { ...section.settings, [fieldKey]: url };
      } else {
        updates.content_data = { ...section.content_data, [fieldKey]: url };
      }
      handleUpdateSection(sectionId, updates);
    }
  };

  const handleUpdateProductSale = (productId: string, updates: Partial<Product>) => {
    setLocalProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, ...updates };
      }
      return p;
    }));
    setEditedProducts(prev => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        ...updates
      }
    }));
  };

  const handleSaveLayout = () => {
    startTransition(async () => {
      try {
        const orderPayload = sections.map((s, idx) => ({ id: s.id, sort_order: idx + 1 }));
        await reorderHomepageSections(orderPayload);

        const updatePromises = sections.map(sec => 
          updateHomepageSection(sec.id, {
            title: sec.title,
            active: sec.active,
            settings: sec.settings,
            content_data: sec.content_data
          })
        );

        await Promise.all(updatePromises);
        await updateSettings(storeSettings);

        const productUpdates = Object.entries(editedProducts).map(([id, updates]) =>
          updateProductFields(id, updates)
        );
        await Promise.all(productUpdates);

        setEditedProducts({});
        toast.success('Customizer settings and layout saved successfully');

        try {
          await fetch('/api/revalidate-customizer', { method: 'POST' });
        } catch {
          // Silent
        }
      } catch (err) {
        toast.error('Failed to save layout adjustments and settings');
      }
    });
  };

  return {
    router,
    sections, setSections,
    activeSectionId, setActiveSectionId,
    activeSection,
    viewportMode, setViewportMode,
    mobileTab, setMobileTab,
    isPending,
    activePage, setActivePage,
    activeSubTab, setActiveSubTab,
    storeSettings, setStoreSettings,
    localProducts, setLocalProducts,
    editedProducts, setEditedProducts,
    activeProductSlug, setActiveProductSlug,
    currentProduct,
    iframeRef,
    containerWidth, setContainerWidth,
    containerHeight, setContainerHeight,
    previewContainerRef,
    handleUpdateSection,
    handleMoveSection,
    handleDeleteSection,
    handleAddSection,
    isMediaModalOpen, setIsMediaModalOpen,
    mediaSelectCallback, setMediaSelectCallback,
    mediaUploadTarget, setMediaUploadTarget,
    handleMediaSelected,
    handleUpdateProductSale,
    handleSaveLayout
  };
}
