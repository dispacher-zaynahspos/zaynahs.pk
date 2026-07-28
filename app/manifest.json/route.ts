import { getSettings } from '@/lib/services/settings';

export const revalidate = 0; // Serve dynamically to ensure dynamic branding updates

/** Auto-detect MIME type from URL extension — prevents browser rejection */
const getIconType = (url: string): string => {
  const lower = url.toLowerCase().split('?')[0]; // strip query params
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.ico')) return 'image/x-icon';
  // Default — if hosted on Supabase storage, check for known patterns
  if (lower.includes('.supabase.co/storage')) return 'image/webp';
  return 'image/png';
};

export async function GET() {
  try {
    const settings = await getSettings();
    const brandName = settings.storeName || process.env.NEXT_PUBLIC_BRAND_NAME || 'Your Store';
    const description = settings.metaDescription || settings.tagline || `${brandName} - Online Store`;

    // Use only settings-driven URLs — /favicon.ico itself reads from settings dynamically
    const faviconUrl = settings.faviconUrl || settings.logoUrl || '/favicon.ico';
    const logoUrl = settings.logoUrl || settings.faviconUrl || '/favicon.ico';

    const manifestData = {
      name: `${brandName} - Online Store`,
      short_name: brandName,
      description: description,
      start_url: '/',
      display: 'standalone',
      background_color: '#1a1a2e',
      theme_color: '#1a1a2e',
      orientation: 'portrait',
      icons: [
        {
          src: faviconUrl,
          sizes: '192x192',
          type: getIconType(faviconUrl),
          purpose: 'any maskable'
        },
        {
          src: logoUrl,
          sizes: '512x512',
          type: getIconType(logoUrl),
          purpose: 'any maskable'
        }
      ]
    };

    return new Response(JSON.stringify(manifestData), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Failed to generate dynamic manifest:', error);
    return new Response(JSON.stringify({}), { status: 500 });
  }
}

