'use client';

import React, { useState, useTransition, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Product, Category, StoreSettings, Review, HomepageSection, Collection } from '@/lib/types';
import { useConfirm } from '@/components/admin/shared/AdminConfirmProvider';
import { saveHomepageSections } from '@/lib/services/sections';
import { updateSettings } from '@/lib/services/settings';
import { updateProductFieldsAction as updateProductFields } from '@/lib/services/products/actions';
import { toast } from 'sonner';
import { resolveDefaultTitle, buildSectionDefaults } from '@/lib/theme-schema';
import { arrayMove, moveItemInArray } from '@/lib/utils/arrayMove';
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

  const [localProducts, setLocalProducts] = useState<Product[]>(products);
  const [editedProducts, setEditedProducts] = useState<Record<string, Partial<Product>>>({});
  const [activeProductSlug, setActiveProductSlug] = useState<string | null>(null);

  // DRAFT dirty-tracking: last-saved baseline in state (not a ref, so reads are
  // render-safe); compare to detect unsaved changes.
  const [savedSnapshot, setSavedSnapshot] = useState<string>(
    () => JSON.stringify({ sections: initialSections, settings: settings })
  );

  const currentProduct = useMemo(() => {
    const defaultProduct = localProducts[0];
    if (!activeProductSlug) return defaultProduct;
    return localProducts.find(p => p.slug === activeProductSlug) || defaultProduct;
  }, [localProducts, activeProductSlug]);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (activePage === 'shop') {
      setActiveSubTab('layout');
    } else if (activePage === 'product_detail') {
      setActiveSubTab('details');
      setActiveSectionId('details');
    } else if (activePage === 'product_card') {
      setActiveSubTab('style');
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
    viewportMode,
    setActivePage,
    setActiveSectionId,
    setActiveSubTab,
    setActiveProductSlug,
    iframeRef
  });

  const [containerWidth, setContainerWidth] = useState<number>(1000);
  const [containerHeight, setContainerHeight] = useState<number>(700);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // DRAFT MODE (RULE): all customizer changes stay LOCAL. Nothing persists until
  // the user presses "Save Layout" (handleSaveLayout). The previous autosave
  // timers for store_settings and sections were removed so adding/editing is
  // instant and never writes to the DB on its own.



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

  const isDirty = useMemo(() => {
    const current = JSON.stringify({ sections, settings: storeSettings });
    return current !== savedSnapshot || Object.keys(editedProducts).length > 0;
  }, [sections, storeSettings, editedProducts, savedSnapshot]);

  // Unsaved-changes guard: warn before closing/reloading the tab while dirty.
  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [isDirty]);

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
    // SSOT: reuse the shared adjacent-move util instead of an inline temp swap.
    const moved = moveItemInArray(sections, index, direction);
    if (moved === sections) return; // out of range → no-op
    setSections(moved.map((sec, idx) => ({ ...sec, sort_order: idx + 1 })));
  };

  // Drag/keyboard reorder (shared system) — move a section by id to another id's slot.
  const handleReorderSections = (fromId: string, toId: string) => {
    const from = sections.findIndex((s) => s.id === fromId);
    const to = sections.findIndex((s) => s.id === toId);
    if (from === -1 || to === -1 || from === to) return;
    const moved = arrayMove(sections, from, to);
    setSections(moved.map((sec, idx) => ({ ...sec, sort_order: idx + 1 })));
  };

  // Move-to-position (shared Move modal) — 1-based target.
  const handleMoveSectionToPosition = (id: string, position1Based: number) => {
    const from = sections.findIndex((s) => s.id === id);
    if (from === -1) return;
    const to = Math.max(0, Math.min(position1Based - 1, sections.length - 1));
    if (from === to) return;
    const moved = arrayMove(sections, from, to);
    setSections(moved.map((sec, idx) => ({ ...sec, sort_order: idx + 1 })));
  };

  const handleDeleteSection = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Section',
      message: 'Are you sure you want to delete this section? It is removed on Save.',
      variant: 'danger',
      confirmText: 'Delete'
    });
    if (!confirmed) return;

    // DRAFT: remove locally only. Persisted when the user presses "Save Layout".
    setSections(prev => {
      const next = prev.filter(s => s.id !== id);
      if (activeSectionId === id) {
        setActiveSectionId(next[0]?.id || null);
      }
      return next;
    });
  };

  const handleAddSection = (type: string) => {
    // DRAFT: build the section LOCALLY with a client-generated UUID. Nothing is
    // written to the DB here — every click adds exactly one new instance and it
    // persists only when the user presses "Save Layout". Registry-driven title +
    // de-duplication (RULE SSOT1); same type can be added many times.
    const existingTitles = sections.map((s) => s.title || '').filter(Boolean);
    const title = resolveDefaultTitle(type, existingTitles);
    const { settings, content_data } = buildSectionDefaults(type);

    const newSec: HomepageSection = {
      id: (globalThis.crypto?.randomUUID?.() ?? `local-${Date.now()}-${Math.random().toString(36).slice(2)}`),
      section_type: type,
      title,
      settings,
      content_data,
      sort_order: sections.length + 1,
      active: true,
    };

    setSections(prev => [...prev, newSec]);
    setActiveSectionId(newSec.id);
    toast.success('Section added — press Save Layout to publish');
  };

  const handleDuplicateSection = (id: string) => {
    // DRAFT: clone a section locally (new UUID), insert right after the original.
    const idx = sections.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const orig = sections[idx];
    const existingTitles = sections.map((s) => s.title || '').filter(Boolean);
    const baseTitle = (orig.title || orig.section_type) + ' Copy';
    let title = baseTitle;
    let n = 2;
    while (existingTitles.includes(title)) { title = `${baseTitle} ${n}`; n++; }

    const clone: HomepageSection = {
      ...orig,
      id: (globalThis.crypto?.randomUUID?.() ?? `local-${Date.now()}-${Math.random().toString(36).slice(2)}`),
      title,
      settings: { ...orig.settings },
      content_data: { ...orig.content_data },
    };
    setSections((prev) => {
      const next = [...prev];
      next.splice(idx + 1, 0, clone);
      return next.map((s, i) => ({ ...s, sort_order: i + 1 }));
    });
    setActiveSectionId(clone.id);
    toast.success('Section duplicated — press Save Layout to publish');
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
      setMediaUploadTarget(null);
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
      if (fieldKey === 'logos') {
        const logos = [...(section.content_data?.logos || [])];
        logos[gridIndex] = url;
        handleUpdateSection(sectionId, {
          content_data: {
            ...section.content_data,
            logos,
          },
        });
      } else {
        const items = section.content_data?.items || [];
        const updatedItems = [...items];
        updatedItems[gridIndex] = { ...updatedItems[gridIndex], [fieldKey]: url };
        handleUpdateSection(sectionId, {
          content_data: {
            ...section.content_data,
            items: updatedItems,
          },
        });
      }
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

  const handleDiscard = () => {
    // Reset the entire draft back to the last-saved baseline.
    try {
      const base = JSON.parse(savedSnapshot) as { sections: HomepageSection[]; settings: StoreSettings };
      setSections(base.sections || []);
      setStoreSettings(base.settings);
      setEditedProducts({});
      setActiveSectionId(base.sections?.[0]?.id || null);
      toast.success('Changes discarded — reverted to last saved version');
    } catch {
      toast.error('Could not discard changes');
    }
  };

  const handleSaveLayout = () => {
    startTransition(async () => {
      try {
        // Persist the FULL draft layout in one reconcile call (insert new,
        // update changed, delete removed, write sort_order) — then settings.
        await saveHomepageSections(sections);
        await updateSettings(storeSettings);

        const productUpdates = Object.entries(editedProducts).map(([id, updates]) =>
          updateProductFields(id, updates)
        );
        await Promise.all(productUpdates);

        setEditedProducts({});
        // New saved baseline — clears the dirty indicator.
        setSavedSnapshot(JSON.stringify({ sections, settings: storeSettings }));

        try {
          const res = await fetch('/api/revalidate-customizer', { method: 'POST' });
          if (res.ok) {
            toast.success('Customizer settings saved & Edge cache purged successfully!');
          } else {
            toast.warning('Settings saved. Edge cache will update in background.');
          }
        } catch {
          toast.success('Customizer settings saved successfully.');
        }
      } catch (err: any) {
        console.error('[useCustomizerState] handleSaveLayout failed:', err);
        const msg = err?.message || (typeof err === 'string' ? err : 'Failed to save layout adjustments and settings');
        toast.error(msg);
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
    handleReorderSections,
    handleMoveSectionToPosition,
    handleDeleteSection,
    handleAddSection,
    handleDuplicateSection,
    isMediaModalOpen, setIsMediaModalOpen,
    mediaSelectCallback, setMediaSelectCallback,
    mediaUploadTarget, setMediaUploadTarget,
    handleMediaSelected,
    handleUpdateProductSale,
    handleSaveLayout,
    isDirty,
    handleDiscard
  };
}
