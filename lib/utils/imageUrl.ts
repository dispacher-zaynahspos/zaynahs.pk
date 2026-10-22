/**
 * Appends Supabase Storage image transformation params (?width=&quality=)
 * to display URLs so browsers download only the size they need.
 *
 * - Only transforms URLs on `*.supabase.co` (product/banner storage).
 * - Other hosts (Unsplash, custom CDN) are returned unchanged.
 * - If the URL already has a `width` param, it is left untouched.
 * - If the project does not support image transformation, Supabase simply
 *   ignores the extra params and serves the original — graceful degradation.
 */

export const IMAGE_PRESETS = {
  micro: { width: 80, quality: 60 },
  admin_thumb: { width: 100, quality: 70 },
  card: { width: 300, quality: 70 },
  banner: { width: 600, quality: 70 },
  zoom: { width: 1400, quality: 85 },
  hero: { width: 1920, quality: 80 },
  logo: { width: 250, quality: 90 }, // Higher quality for text clarity
} as const;

export type ImagePreset = keyof typeof IMAGE_PRESETS;

export const getPresetImageUrl = (url: string, preset: ImagePreset): string => {
  const p = IMAGE_PRESETS[preset];
  return getOptimizedImageUrl(url, p.width, p.quality);
};

export const getOptimizedImageUrl = (url: string, width: number, quality = 80): string => {
  if (!url || typeof url !== 'string' || url.startsWith('data:') || url.startsWith('blob:')) return url || '';
  try {
    const isSupabase = url.includes('supabase.co');
    const isRelativeStorage = url.startsWith('/storage/');

    if (!isSupabase && !isRelativeStorage) return url;

    if (isRelativeStorage) {
      const u = new URL(url, 'https://dummy.local');
      if (!u.searchParams.has('width')) u.searchParams.set('width', String(width));
      if (!u.searchParams.has('quality')) u.searchParams.set('quality', String(quality));
      const qs = u.searchParams.toString();
      return `${u.pathname}${qs ? `?${qs}` : ''}`;
    }

    const u = new URL(url);
    if (!u.hostname.includes('supabase.co')) return url;

    // Convert direct Supabase storage URL to domain-proxied edge-cached /storage/
    const publicStoragePrefix = '/storage/v1/object/public/';
    if (u.pathname.includes(publicStoragePrefix)) {
      const pathAfterPublic = u.pathname.substring(u.pathname.indexOf(publicStoragePrefix) + publicStoragePrefix.length);
      if (!u.searchParams.has('width')) u.searchParams.set('width', String(width));
      if (!u.searchParams.has('quality')) u.searchParams.set('quality', String(quality));
      const qs = u.searchParams.toString();
      return `/storage/${pathAfterPublic}${qs ? `?${qs}` : ''}`;
    }

    if (!u.searchParams.has('width')) u.searchParams.set('width', String(width));
    if (!u.searchParams.has('quality')) u.searchParams.set('quality', String(quality));
    return u.toString();
  } catch {
    return url;
  }
};
