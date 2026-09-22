'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MediaItem, normalizeUrl } from './useMediaManagerData';

export function useMediaUsage() {
  const [usedNormUrls, setUsedNormUrls] = useState<Set<string>>(new Set());
  const [sectionsData, setSectionsData] = useState<any[]>([]);
  const [usageLoading, setUsageLoading] = useState(true);

  const loadUsageCrossReferences = async () => {
    try {
      setUsageLoading(true);
      const supabase = createClient();
      const [cats, variants, sizeGuides, settings, sections, productImgs] = await Promise.all([
        supabase.from('categories').select('image_url').is('deleted_at', null),
        supabase.from('product_variants').select('image_url, products!inner(deleted_at)').is('products.deleted_at', null),
        supabase.from('size_guides').select('image_url').is('deleted_at', null),
        supabase.from('store_settings').select('logo_url, favicon_url, banner_url, exit_intent_image_url').single(),
        supabase.from('homepage_sections').select('settings, content_data'),
        supabase.from('product_images').select('url, products!inner(deleted_at)').is('products.deleted_at', null),
      ]);

      const rawUrls: string[] = [];
      cats.data?.forEach(c => c.image_url && rawUrls.push(c.image_url));
      variants.data?.forEach(v => v.image_url && rawUrls.push(v.image_url));
      sizeGuides.data?.forEach(sg => sg.image_url && rawUrls.push(sg.image_url));
      productImgs.data?.forEach(pi => pi.url && rawUrls.push(pi.url));
      if (settings.data) {
        const s = settings.data;
        if (s.logo_url) rawUrls.push(s.logo_url);
        if (s.favicon_url) rawUrls.push(s.favicon_url);
        if (s.banner_url) rawUrls.push(s.banner_url);
        if (s.exit_intent_image_url) rawUrls.push(s.exit_intent_image_url);
      }

      const normalizedSet = new Set(rawUrls.map(normalizeUrl));

      setUsedNormUrls(normalizedSet);
      setSectionsData(sections.data || []);
    } catch (err) {
      console.error('[Media Manager] Failed to load usage references:', err);
    } finally {
      setUsageLoading(false);
    }
  };

  const isMediaUsed = useCallback((item: MediaItem): boolean => {
    const normItemUrl = normalizeUrl(item.file_url);

    if (usedNormUrls.has(normItemUrl)) return true;

    const itemFilename = normItemUrl.split('/').pop() || '';
    for (const usedNorm of usedNormUrls) {
      const usedFilename = usedNorm.split('/').pop() || '';
      if (itemFilename && usedFilename && itemFilename === usedFilename) return true;
    }

    return sectionsData.some(sec => {
      const settingsStr = sec.settings ? JSON.stringify(sec.settings) : '';
      const contentStr = sec.content_data ? JSON.stringify(sec.content_data) : '';
      const combined = (settingsStr + contentStr).toLowerCase();
      return combined.includes(normItemUrl) || combined.includes(itemFilename);
    });
  }, [usedNormUrls, sectionsData]);

  return {
    usedNormUrls,
    usageLoading,
    loadUsageCrossReferences,
    isMediaUsed,
  };
}
