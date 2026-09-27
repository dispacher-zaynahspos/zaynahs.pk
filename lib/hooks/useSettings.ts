import { useState, useEffect } from 'react';
import { StoreSettings } from '@/lib/types';
import { mapSettings } from '@/lib/services/settings/mappers/dbToSettingsMapper';

/**
 * Fetches live settings directly from the API route (no cache).
 * Pass `initialSettings` from SSR to show immediately while loading,
 * then seamlessly override with the latest live values once fetched.
 */
export const useSettings = (initialSettings?: StoreSettings) => {
  const [settings, setSettings] = useState<StoreSettings | null>(initialSettings ?? null);
  const [loading, setLoading] = useState(!initialSettings);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;

    const fetchLiveSettings = async () => {
      try {
        const res = await fetch('/api/settings', { cache: 'no-store' });
        if (!res.ok) throw new Error(`Settings API error: ${res.status}`);
        const row = await res.json();

        if (!active) return;

        // Map complete DB row to StoreSettings
        const fullSettings = mapSettings(row);
        setSettings(prev => ({
          ...fullSettings,
          ...(prev || {}),
          // Ensure live database branding and card customizations take full precedence
          store_name: fullSettings.store_name || prev?.store_name || (process.env.NEXT_PUBLIC_BRAND_NAME || 'Your Store'),
          logo_url: fullSettings.logo_url || prev?.logo_url || undefined,
          favicon_url: fullSettings.favicon_url || prev?.favicon_url || undefined,
          logo_width: fullSettings.logo_width || prev?.logo_width || 120,
          card_style: row.card_style ?? prev?.card_style ?? 'style1',
          card_show_swatches: row.card_show_swatches ?? prev?.card_show_swatches ?? true,
          card_show_sizes: row.card_show_sizes ?? prev?.card_show_sizes ?? true,
          card_show_materials: row.card_show_materials ?? prev?.card_show_materials ?? true,
          card_show_custom: row.card_show_custom ?? prev?.card_show_custom ?? true,
          card_show_custom_2: row.card_show_custom_2 ?? prev?.card_show_custom_2 ?? true,
          card_show_type_color: row.card_show_type_color ?? prev?.card_show_type_color ?? true,
          card_show_type_size: row.card_show_type_size ?? prev?.card_show_type_size ?? true,
          card_show_type_material: row.card_show_type_material ?? prev?.card_show_type_material ?? true,
          card_show_type_custom: row.card_show_type_custom ?? prev?.card_show_type_custom ?? true,
          card_show_stars: row.card_show_stars ?? prev?.card_show_stars ?? true,
          card_show_quickview: row.card_show_quickview ?? prev?.card_show_quickview ?? true,
          card_show_wishlist: row.card_show_wishlist ?? prev?.card_show_wishlist ?? true,
          card_show_quickcart: row.card_show_quickcart ?? prev?.card_show_quickcart ?? true,
          card_show_description: row.card_show_description ?? prev?.card_show_description ?? false,
          card_alignment: row.card_alignment ?? prev?.card_alignment,
          card_elements_order: row.card_elements_order ?? prev?.card_elements_order,
          card_mobile_columns: row.card_mobile_columns ?? prev?.card_mobile_columns ?? 2,
          // Variant display
          swatch_limit: row.swatch_limit ?? prev?.swatch_limit ?? 8,
          swatch_shape: row.swatch_shape ?? prev?.swatch_shape ?? 'circle',
          archive_swatch_size: row.archive_swatch_size ?? prev?.archive_swatch_size ?? 'md',
          product_swatch_size: row.product_swatch_size ?? prev?.product_swatch_size ?? 'md',
          archive_swatch_align: row.archive_swatch_align ?? prev?.archive_swatch_align ?? 'left',
          default_variant_index: row.default_variant_index ?? prev?.default_variant_index ?? 1,
          enable_variant_swatches: row.enable_variant_swatches ?? prev?.enable_variant_swatches ?? true,
          
          last_vercel_purge: row.last_vercel_purge ?? prev?.last_vercel_purge,
          last_cloudflare_purge: row.last_cloudflare_purge ?? prev?.last_cloudflare_purge,
        } as StoreSettings));

        setError(null);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchLiveSettings();
    return () => { active = false; };
  }, []);

  return { settings, loading, error };
};
