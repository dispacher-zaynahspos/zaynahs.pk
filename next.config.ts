import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    minimumCacheTTL: 2592000, // 30 days
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      ...(process.env.NEXT_PUBLIC_IMAGE_HOSTNAME
        ? [{
            protocol: 'https' as const,
            hostname: process.env.NEXT_PUBLIC_IMAGE_HOSTNAME as string,
            port: '',
            pathname: '/**',
          }]
        : []),
    ],
  },
  // Allow large HEIC/RAW file uploads to the image API route (up to 25MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb',
    },
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-switch',
      'embla-carousel-react',
      'embla-carousel-autoplay',
    ],
  },
  async headers() {
    const isProd = process.env.NODE_ENV === 'production';
    const rules: Array<{ source: string; headers: Array<{ key: string; value: string }> }> = [];

    if (isProd) {
      rules.push({
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      });
    }

    rules.push(
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/cart',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store',
          },
        ],
      },
      {
        source: '/checkout',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store',
          },
        ],
      },
      {
        source: '/account',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
      {
        source: '/account/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
      {
        source: '/login',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
      {
        source: '/admin',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive, nosnippet',
          },
        ],
      },
      {
        source: '/admin/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive, nosnippet',
          },
        ],
      },
      {
        source: '/storage/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'public, s-maxage=31536000, immutable',
          },
        ],
      },
      {
        source: '/((?!api|_next|static|fonts|storage|cart|checkout|account|login|admin).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=2592000, must-revalidate',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'public, s-maxage=2592000, stale-while-revalidate=86400',
          },
        ],
      },
    );

    return rules;
  },
  async rewrites() {
    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ziucrfpebpxijqhwmqre.supabase.co').replace(/\/+$/, '');
    return [
      {
        source: '/storage/v1/object/public/:path*',
        destination: `${supabaseUrl}/storage/v1/object/public/:path*`,
      },
      {
        source: '/storage/:path*',
        destination: `${supabaseUrl}/storage/v1/object/public/:path*`,
      },
      {
        source: '/:key.txt',
        destination: '/api/indexnow/key?key=:key',
      },
      {
        source: '/google:code.html',
        destination: '/api/google-verify?code=:code',
      },
      {
        source: '/catalog.xml',
        destination: '/api/meta/catalog.xml',
      },
      {
        source: '/api/meta/feed.xml',
        destination: '/api/meta/catalog.xml',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/adim',
        destination: '/admin',
        permanent: true,
      },
      {
        source: '/admi',
        destination: '/admin',
        permanent: true,
      },
      {
        source: '/admn',
        destination: '/admin',
        permanent: true,
      },
      {
        source: '/adminn',
        destination: '/admin',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
