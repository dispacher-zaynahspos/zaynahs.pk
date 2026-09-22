'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MediaItem, normalizeUrl } from '../types';

export function useMediaUsageCrossReferences() {
  const [usedNormUrls, setUsedNormUrls] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadUsageCrossReferences = async () => {
      try {
        const supabase = createClient();
        const [cats, variants, sizeGuides, settings, productImgs] = await Promise.all([
          supabase.from('categories').select('image_url'),
          supabase.from('product_variants').select('image_url'),
          supabase.from('size_guides').select('image_url'),
          supabase.from('store_settings').select('logo_url, favicon_url, banner_url, exit_intent_image_url').single(),
          supabase.from('product_images').select('url'),
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
      } catch (err) {
        console.error('[MediaPreviewModal] Failed to load usage references:', err);
      }
    };
    loadUsageCrossReferences();
  }, []);

  const isMediaUsed = useCallback((item: MediaItem): boolean => {
    return usedNormUrls.has(normalizeUrl(item.file_url));
  }, [usedNormUrls]);

  return { isMediaUsed };
}
