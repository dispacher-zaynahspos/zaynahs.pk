import { ImageResponse } from 'next/og';

export const runtime = 'edge';

/**
 * Dynamic branded Open Graph image generator.
 * Usage: /api/og?title=...&subtitle=...&brand=...
 * Returns a 1200x630 PNG. Used as an OG/Twitter image fallback so every page
 * gets a clean branded social card even without a bespoke banner.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get('title') || 'Shop Now').slice(0, 120);
  const subtitle = (searchParams.get('subtitle') || '').slice(0, 160);
  const brand = (searchParams.get('brand') || '').slice(0, 60);
  const accent = (searchParams.get('accent') || '#e94560').slice(0, 9);

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0f0f1b 0%, #1a1a2e 100%)',
          padding: '72px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: 54, height: 54, borderRadius: 14, background: accent }} />
          {brand ? (
            <div style={{ color: '#fff', fontSize: 36, fontWeight: 800, letterSpacing: '-0.5px' }}>{brand}</div>
          ) : null}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div
            style={{
              color: '#ffffff',
              fontSize: 68,
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-1.5px',
              display: 'flex',
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div style={{ color: '#c9c9d6', fontSize: 32, fontWeight: 500, lineHeight: 1.3, display: 'flex' }}>
              {subtitle}
            </div>
          ) : null}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ height: 8, width: 120, borderRadius: 999, background: accent }} />
          <div style={{ color: '#8a8aa0', fontSize: 24, fontWeight: 600 }}>
            {brand ? `${brand} • Shop Online` : 'Shop Online'}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
