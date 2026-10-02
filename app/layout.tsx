import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Outfit } from 'next/font/google';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/common/ThemeProvider';
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

import ThemeStyleRegistry from '@/components/common/ThemeStyleRegistry';
import { getSettings } from '@/lib/services/settings';
import { getDomainConfig } from '@/lib/config/domains';
import { getDomainBrand } from '@/lib/utils/getDomainBrand';
import Pixels from '@/components/Pixels';
import ChunkErrorListener from '@/components/common/ChunkErrorListener';
import NextTopLoader from 'nextjs-toploader';
import NavigationProgress from '@/components/common/NavigationProgress';

const getFaviconType = (url: string) => {
  const lower = url.toLowerCase();
  if (lower.includes('.png')) return 'image/png';
  if (lower.includes('.svg')) return 'image/svg+xml';
  if (lower.includes('.webp')) return 'image/webp';
  if (lower.includes('.gif')) return 'image/gif';
  if (lower.includes('.jpg') || lower.includes('.jpeg')) return 'image/jpeg';
  return 'image/x-icon';
};

import { stripHtmlTags } from "@/lib/utils/stripHtml";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getSettings();
    const brandName = settings.store_name || process.env.NEXT_PUBLIC_BRAND_NAME || 'Store';
    const siteUrl = settings.store_url?.replace(/\/+$/, '') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const tagline = settings.tagline || '';

    const rawDesc = settings.meta_description || tagline || `Discover amazing deals at ${brandName}. Quality items with fast delivery.`;
    const description = stripHtmlTags(rawDesc);
    const title = settings.meta_title || tagline || brandName;

    const timestamp = settings.updated_at ? new Date(settings.updated_at).getTime() : Date.now();

    const fav = settings.favicon_url
      ? `${settings.favicon_url}?v=${timestamp}`
      : settings.logo_url
        ? `${settings.logo_url}?v=${timestamp}`
        : `/favicon.ico?v=${timestamp}`;

    const appleTouchIcon = settings.logo_url
      ? `${settings.logo_url}?v=${timestamp}`
      : settings.favicon_url
        ? `${settings.favicon_url}?v=${timestamp}`
        : `/favicon.ico?v=${timestamp}`;

    const ogImage = settings.banner_url
      ? settings.banner_url
      : settings.logo_url
        ? settings.logo_url
        : settings.favicon_url
          ? settings.favicon_url
          : `/favicon.ico?v=${timestamp}`;

    return {
      metadataBase: new URL(siteUrl),
      manifest: '/manifest.json',
      title: {
        default: title,
        template: `%s - ${brandName}`
      },
      description,
      appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title,
      },
      icons: {
        icon: [
          {
            url: fav,
            type: getFaviconType(fav),
          },
          {
            url: fav,
            sizes: '32x32',
            type: getFaviconType(fav),
          },
          {
            url: fav,
            sizes: '16x16',
            type: getFaviconType(fav),
          },
        ],
        shortcut: fav,
        apple: appleTouchIcon,
      },
      verification: {
        google: process.env.GOOGLE_SITE_VERIFICATION || '',
      },
      other: {
        'og:locale': 'en_US',
      },
      openGraph: {
        type: 'website',
        title,
        description,
        url: siteUrl,
        siteName: brandName,
        locale: 'en_US',
        images: [{ url: ogImage, width: 1200, height: 630, alt: brandName }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage],
        site: settings.twitter_handle || process.env.NEXT_PUBLIC_TWITTER_HANDLE || '',
        creator: settings.twitter_handle || process.env.NEXT_PUBLIC_TWITTER_HANDLE || '',
      }
    };
  } catch {
    const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || 'Store';
    const tagline = process.env.NEXT_PUBLIC_BRAND_TAGLINE || 'Online Store';
    return {
      title: brandName,
      description: tagline,
      metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
      manifest: '/manifest.json',
      appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: brandName,
      },
      verification: {
        google: process.env.GOOGLE_SITE_VERIFICATION || '',
      },
      other: {
        'og:locale': 'en_US',
      },
      openGraph: {
        type: 'website',
        title: brandName,
        description: tagline,
        siteName: brandName,
        images: [{ url: '/favicon.ico' }],
      },
      twitter: {
        card: 'summary_large_image',
        title: brandName,
        description: tagline,
        images: ['/favicon.ico'],
      }
    };
  }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();
  let siteUrl = settings?.store_url?.replace(/\/+$/, '') || process.env.NEXT_PUBLIC_SITE_URL || '';

  let storeName = 'Store';
  let description = 'Premium online store.';
  try {
    const brand = await getDomainBrand();
    storeName = brand.name;
    siteUrl = `${brand.protocol}://${brand.domain}`;
    description = settings.meta_description || brand.tagline || `Discover amazing deals at ${storeName}.`;
  } catch {
    // Fallback already set above
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jakarta.variable} ${outfit.variable} h-full antialiased overflow-x-clip`}
    >
      <head>
        <ThemeStyleRegistry settings={settings} />
      </head>
      <body suppressHydrationWarning className={`${jakarta.variable} ${outfit.variable} font-body min-h-full flex flex-col bg-gray-50 dark:bg-[#0f0f1b] text-gray-900 dark:text-gray-100 overflow-x-clip`}>
        {/* Conditional Script Injection for Tracking Pixels */}
        <Pixels />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <NextTopLoader color="#e94560" showSpinner={false} height={5} shadow="0 0 10px #e94560,0 0 5px #e94560" />
          <NavigationProgress />
          <ChunkErrorListener />
          {children}
          <Toaster 
            position="bottom-center" 
            toastOptions={{
              className: 'dark:bg-[#16162a] dark:text-white dark:border-gray-800 rounded-2xl shadow-lg border border-gray-100 font-semibold',
              style: {
                fontSize: '11px',
                padding: '10px 14px',
                maxWidth: '300px',
                marginBottom: '72px',
              }
            }} 
            closeButton 
          />
        </ThemeProvider>

        {/* JSON-LD Schema — WebSite + Organization */}
        {settings && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@graph": [
                  {
                    "@type": "WebSite",
                    "@id": `${siteUrl}/#website`,
                    "url": siteUrl,
                    "name": storeName,
                    "description": description,
                    "potentialAction": [{
                      "@type": "SearchAction",
                      "target": {
                        "@type": "EntryPoint",
                        "urlTemplate": `${siteUrl}/shop?q={search_term_string}`
                      },
                      "query-input": "required name=search_term_string"
                    }]
                  },
                  {
                    "@type": "Organization",
                    "@id": `${siteUrl}/#organization`,
                    "name": storeName,
                    "url": siteUrl,
                    "logo": {
                      "@type": "ImageObject",
                      "url": settings.logo_url ? (settings.logo_url.startsWith('http') ? settings.logo_url : `${siteUrl}${settings.logo_url}`) : `${siteUrl}/icon.png`
                    },
                    ...(() => {
                      const sameAs = [
                        settings.social_facebook,
                        settings.social_instagram,
                        settings.social_youtube,
                        settings.social_tiktok,
                        settings.social_twitter,
                        settings.social_snapchat,
                      ].filter((u): u is string => typeof u === 'string' && /^https?:\/\//.test(u));
                      const telephone = settings.header_top_bar_phone || settings.whatsapp_number || settings.floating_whatsapp_number;
                      const org: Record<string, unknown> = {};
                      if (sameAs.length) org.sameAs = sameAs;
                      if (telephone || settings.header_top_bar_email) {
                        org.contactPoint = {
                          "@type": "ContactPoint",
                          "contactType": "customer service",
                          ...(telephone ? { telephone } : {}),
                          ...(settings.header_top_bar_email ? { email: settings.header_top_bar_email } : {}),
                          "areaServed": "PK",
                          "availableLanguage": ["en", "ur"],
                        };
                      }
                      if (settings.address) {
                        org.address = { "@type": "PostalAddress", "streetAddress": settings.address, "addressCountry": "PK" };
                      }
                      return org;
                    })()
                  }
                ]
              })
            }}
          />
        )}
      </body>
    </html>
  );
}
