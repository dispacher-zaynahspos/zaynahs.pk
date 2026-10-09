import React from 'react';
import { StoreSettings } from '@/lib/types';
import { THEME_PRESETS, ThemePreset } from '@/lib/theme-presets';

interface ThemeStyleRegistryProps {
  settings: StoreSettings;
}

export default function ThemeStyleRegistry({ settings }: ThemeStyleRegistryProps) {
  // Get active preset configuration or fallback to classic_white
  const activePresetId = settings.theme_preset || 'classic_white';
  const defaultPreset = THEME_PRESETS.find((p: ThemePreset) => p.id === activePresetId) || THEME_PRESETS[0];

  // Merge database values with default preset values
  const themeConfig = settings.theme_config || defaultPreset.config;

  const colors = themeConfig.colors || defaultPreset.config.colors;
  const fonts = themeConfig.fonts || defaultPreset.config.fonts;
  const typography = themeConfig.typography || defaultPreset.config.typography;
  const buttons = themeConfig.buttons || defaultPreset.config.buttons;
  const cards = themeConfig.cards || defaultPreset.config.cards;

  const headingFont = fonts.heading || defaultPreset.config.fonts.heading;
  const bodyFont = fonts.body || defaultPreset.config.fonts.body;

  // Build the Google Fonts url
  const fontImportUrl = headingFont === bodyFont
    ? `https://fonts.googleapis.com/css2?family=${encodeURIComponent(headingFont)}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap`
    : `https://fonts.googleapis.com/css2?family=${encodeURIComponent(headingFont)}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=${encodeURIComponent(bodyFont)}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap`;

  const css = `
    @import url('${fontImportUrl}');

    :root, html, body {
      /* Base Theme System CSS Variables */
      --color-primary: ${colors.primary} !important;
      --color-secondary: ${colors.secondary} !important;
      --color-accent: ${colors.accent} !important;
      --color-background: ${colors.background} !important;
      --color-surface: ${colors.surface} !important;
      --color-text-primary: ${colors.textPrimary} !important;
      --color-text-secondary: ${colors.textSecondary} !important;
      --color-text-heading: ${colors.textHeading || colors.textPrimary || colors.primary} !important;
      --color-text-accent: ${colors.textAccent || colors.accent} !important;
      --color-price: ${colors.price || colors.accent || '#e94560'} !important;
      --color-sale: ${colors.sale || '#e94560'} !important;
      --color-success: ${colors.success || '#10b981'} !important;
      --color-warning: ${colors.warning || '#f59e0b'} !important;
      --color-link: ${colors.link || colors.accent || '#e94560'} !important;
      --color-border: ${colors.border} !important;
      --header-top-bar-bg: ${settings.header_top_bar_bg || colors.headerTopBarBg || colors.primary} !important;
      --header-top-bar-text: ${settings.header_top_bar_text_color || colors.headerTopBarTextColor || '#ffffff'} !important;
      --footer-bg: ${settings.footer_bg || colors.footerBg || (colors.background === '#0E0E10' || colors.background === '#0B1120' || colors.background === '#121212' ? colors.surface : '#FFFFFF')} !important;
      --footer-text: ${settings.footer_text_color || colors.footerTextColor || colors.textSecondary} !important;

      --font-heading: "${headingFont}", sans-serif !important;
      --font-body: "${bodyFont}", sans-serif !important;
      --font-size-base: ${typography.fontSizeBase || 16}px !important;

      --border-radius-btn: ${buttons.borderRadius ?? 12}px !important;
      --border-radius-card: ${Math.min(cards.borderRadius ?? 16, 28)}px !important;

      --btn-primary-bg: ${buttons.primaryBg || colors.primary} !important;
      --btn-primary-text: ${buttons.primaryText || '#ffffff'} !important;
      --btn-primary-hover: ${buttons.primaryHover || colors.secondary} !important;

      /* Map system variables to active theme variables for compatibility */
      --primary: ${colors.primary} !important;
      --primary-hover: ${buttons.primaryHover} !important;
      --secondary: ${colors.secondary} !important;
      --accent: ${colors.accent} !important;
      --surface: ${colors.surface} !important;
      --text: ${colors.textPrimary} !important;
      --text-muted: ${colors.textSecondary} !important;
      --border: ${colors.border} !important;
      --radius-btn: ${buttons.borderRadius ?? 12}px !important;
      --radius-card: ${Math.min(cards.borderRadius ?? 16, 28)}px !important;
      --radius-modal: ${Math.min(cards.borderRadius ?? 16, 24)}px !important;
    }

    /* Apply base font size & body text styles */
    html {
      font-size: ${typography.fontSizeBase || 16}px !important;
    }

    body:not(.admin-shell) {
      font-family: var(--font-body) !important;
      background-color: var(--color-background) !important;
      color: var(--color-text-primary) !important;
    }

    /* Class-based page backgrounds & text overrides (Storefront only) */
    body:not(.admin-shell) .bg-gray-50, body:not(.admin-shell).dark .bg-gray-50, 
    body:not(.admin-shell) .bg-gray-50\/50, body:not(.admin-shell).dark .bg-gray-50\/50, 
    body:not(.admin-shell) [class*="bg-gray-50"] {
      background-color: var(--color-background) !important;
      color: var(--color-text-primary) !important;
    }

    /* Surface, white backgrounds & card overrides (Storefront only) */
    body:not(.admin-shell) .bg-white, body:not(.admin-shell).dark .bg-white, 
    body:not(.admin-shell) .bg-surface, body:not(.admin-shell) .bg-surface-2, body:not(.admin-shell) .bg-surface-3, 
    body:not(.admin-shell) [class*="bg-surface"] {
      background-color: var(--color-surface) !important;
      color: var(--color-text-primary) !important;
    }

    /* Remap hardcoded dark-theme hex colors to active theme variables (Storefront only) */
    body:not(.admin-shell) [class*="bg-[#16162a]"],
    body:not(.admin-shell).dark [class*="bg-[#16162a]"] {
      background-color: var(--color-surface) !important;
    }
    body:not(.admin-shell) [class*="bg-[#0f0f1b]"],
    body:not(.admin-shell).dark [class*="bg-[#0f0f1b]"] {
      background-color: var(--color-background) !important;
    }
    /* bg-white/80 opacity variants → use surface with opacity */
    body:not(.admin-shell) [class^="bg-white/"]:not([class*="hover:"]), body:not(.admin-shell) [class*=" bg-white/"]:not([class*="hover:"]) {
      background-color: color-mix(in srgb, var(--color-surface) 80%, transparent) !important;
    }
    /* Navbar sticky bar: bg-white/80 dark:bg-[#0f0f1b]/85 */
    body:not(.admin-shell) [class^="bg-[#0f0f1b]/"]:not([class*="hover:"]), body:not(.admin-shell) [class*=" bg-[#0f0f1b]/"]:not([class*="hover:"]) {
      background-color: color-mix(in srgb, var(--color-background) 85%, transparent) !important;
    }
    body:not(.admin-shell) [class^="bg-[#16162a]/"]:not([class*="hover:"]), body:not(.admin-shell) [class*=" bg-[#16162a]/"]:not([class*="hover:"]) {
      background-color: color-mix(in srgb, var(--color-surface) 80%, transparent) !important;
    }
    body:not(.admin-shell) [class*="from-[#16162a]"] {
      --tw-gradient-from: var(--color-surface) !important;
    }
    body:not(.admin-shell) [class*="from-[#0f0f1b]"] {
      --tw-gradient-from: var(--color-background) !important;
    }
    /* Explicit white text stays crisp white on dark containers and badges */
    body:not(.admin-shell) .text-white:not(body):not(html), body:not(.admin-shell) [class~="text-white"]:not(body):not(html) {
      color: #ffffff !important;
    }

    /* Typography Overrides (Storefront only) */
    body:not(.admin-shell) :is(p, span, a, input, select, textarea, button, td, th, li, div, .font-body) {
      font-family: var(--font-body) !important;
    }
    body:not(.admin-shell) :is(h1, h2, h3, h4, h5, h6, .font-heading, [class*="font-heading"]) {
      font-family: var(--font-heading) !important;
      color: var(--color-text-heading) !important;
    }

    /* Button and CTA corner-radius overrides (Storefront only - Admin is protected) */
    body:not(.admin-shell) :is(button:not(.rounded-full):not(.swatch-btn):not([class*="rounded-full"]), .btn, [role="button"]:not(.rounded-full):not(.swatch-btn):not([class*="rounded-full"]), .btn-primary, [class*="btn-primary"], [data-theme-btn]) {
      border-radius: var(--border-radius-btn) !important;
    }

    /* Product cards & explicit theme card corner-radius overrides (Storefront only - Admin is protected) */
    body:not(.admin-shell) :is(.product-card, [data-product-card], article.product-card, .theme-card) {
      border-radius: var(--border-radius-card) !important;
    }

    /* Hardcoded color codes replacements to support saved preset styles */
    
    /* Backgrounds hardcoded to secondary navy */
    .bg-\\[\\#1a1a2e\\], .dark .bg-\\[\\#1a1a2e\\], 
    [class*="bg-[#1a1a2e]"]:not([class*="bg-[#1a1a2e]/"]):not([class*="hover:"]),
    .bg-secondary, .dark .bg-secondary,
    .btn-primary, [class*="btn-primary"] {
      background-color: var(--btn-primary-bg) !important;
      color: var(--btn-primary-text, #ffffff) !important;
    }
    .bg-\\[\\#1a1a2e\\] *, [class*="bg-[#1a1a2e]"] *:not(.badge):not([class*="bg-"]),
    .bg-secondary *, .dark .bg-secondary *,
    .btn-primary *, [class*="btn-primary"] * {
      color: var(--btn-primary-text, #ffffff) !important;
    }
    
    /* Transparent / opacity classes mapped to theme colors using color-mix */
    .bg-\\[\\#1a1a2e\\]\\/5, [class^="bg-[#1a1a2e]/5"], [class*=" bg-[#1a1a2e]/5"] {
      background-color: color-mix(in srgb, var(--btn-primary-bg) 5%, transparent) !important;
    }
    .bg-\\[\\#1a1a2e\\]\\/10, [class^="bg-[#1a1a2e]/10"], [class*=" bg-[#1a1a2e]/10"] {
      background-color: color-mix(in srgb, var(--btn-primary-bg) 10%, transparent) !important;
    }
    .bg-\\[\\#e94560\\]\\/10, [class^="bg-[#e94560]/10"], [class*=" bg-[#e94560]/10"] {
      background-color: color-mix(in srgb, var(--color-accent) 10%, transparent) !important;
    }
    .bg-\\[\\#e94560\\]\\/20, [class^="bg-[#e94560]/20"], [class*=" bg-[#e94560]/20"] {
      background-color: color-mix(in srgb, var(--color-accent) 20%, transparent) !important;
    }
    
    /* Backgrounds hardcoded to hovers */
    .hover\\:bg-\\[\\#e94560\\]:hover, [class*="hover:bg-[#e94560]"]:hover,
    .hover\\:bg-\\[\\#c73652\\]:hover, [class*="hover:bg-[#c73652]"]:hover,
    .hover\\:bg-primary-hover:hover {
      background-color: var(--btn-primary-hover) !important;
    }

    /* Primary buttons & Action CTAs linked to theme button tokens */
    button.bg-\\[\\#e94560\\],
    a.bg-\\[\\#e94560\\],
    .btn-primary,
    .btn-theme-primary,
    [data-theme-btn="primary"],
    button[class*="bg-[#e94560]"]:not([class*="bg-[#e94560]/"]):not([class*="hover:"]),
    a[class*="bg-[#e94560]"]:not([class*="bg-[#e94560]/"]):not([class*="hover:"]) {
      background-color: var(--btn-primary-bg, var(--color-primary)) !important;
      color: var(--btn-primary-text, #ffffff) !important;
    }

    button.bg-\\[\\#e94560\\]:hover,
    a.bg-\\[\\#e94560\\]:hover,
    button[class*="hover:bg-[#d8344f]"]:hover,
    a[class*="hover:bg-[#d8344f]"]:hover {
      background-color: var(--btn-primary-hover, var(--color-secondary)) !important;
    }

    /* Backgrounds hardcoded to accent red/coral */
    span.bg-\\[\\#e94560\\], div.bg-\\[\\#e94560\\], 
    [class*="bg-[#e94560]"]:not(button):not(a):not([class*="bg-[#e94560]/"]):not([class*="hover:"]):not([class*="peer-checked:"]):not(.nav-count-badge),
    .bg-accent, .dark .bg-accent {
      background-color: var(--color-accent) !important;
      color: #ffffff !important;
    }

    /* Header & bottom navigation numeric count badges (round pills only) linked to primary theme color */
    .nav-count-badge {
      background-color: var(--color-primary, #0f172a) !important;
      color: #ffffff !important;
    }

    /* Mobile bottom navigation labels: transparent background always, active tab colored by text only */
    [aria-label="Mobile Bottom Navigation"] a > span,
    #mobile-bottom-cart-icon > span:not(.nav-count-badge),
    #mobile-bottom-wishlist-icon > span:not(.nav-count-badge) {
      background-color: transparent !important;
    }
    
    /* Text color hardcoded overrides */
    .text-\\[\\#e94560\\], 
    [class~="text-[#e94560]"],
    [class*="text-[#e94560]"]:not([class*="hover:text-[#e94560]"]):not([class*="group-hover:text-[#e94560]"]):not([class*="focus:text-[#e94560]"]),
    .text-accent, .dark .text-accent {
      color: var(--color-text-accent) !important;
    }

    /* Hover text color overrides */
    .hover\\:text-\\[\\#e94560\\]:hover,
    [class*="hover:text-[#e94560]"]:hover {
      color: var(--color-primary, var(--color-text-accent)) !important;
    }
    .text-\\[\\#1a1a2e\\], [class*="text-[#1a1a2e]"],
    .text-secondary, .dark .text-secondary {
      color: var(--color-text-primary) !important;
    }

    /* Price color override */
    .product-price {
      color: var(--color-price) !important;
    }

    /* Product title color bound to appearance textPrimary token & hover to primary */
    .product-card-title {
      color: var(--color-text-primary) !important;
    }
    .group:hover .product-card-title {
      color: var(--color-primary) !important;
    }

    /* Borders hardcoded overrides */
    .border-\\[\\#e94560\\], [class*="border-[#e94560]"] {
      border-color: var(--color-accent) !important;
    }
    .border-\\[\\#1a1a2e\\], [class*="border-[#1a1a2e]"] {
      border-color: var(--btn-primary-bg) !important;
    }

    /* Success / in-stock / verified green bound to --color-success token */
    .bg-\\[\\#10b981\\], .dark .bg-\\[\\#10b981\\],
    [class*="bg-[#10b981]"]:not([class*="bg-[#10b981]/"]):not([class*="hover:"]) {
      background-color: var(--color-success) !important;
    }
    .hover\\:bg-\\[\\#059669\\]:hover, [class*="hover:bg-[#059669]"]:hover,
    .hover\\:bg-\\[\\#10b981\\]:hover, [class*="hover:bg-[#10b981]"]:hover {
      background-color: color-mix(in srgb, var(--color-success) 88%, black) !important;
    }
    .bg-\\[\\#10b981\\]\\/10, [class^="bg-[#10b981]/10"], [class*=" bg-[#10b981]/10"] {
      background-color: color-mix(in srgb, var(--color-success) 10%, transparent) !important;
    }
    .bg-\\[\\#10b981\\]\\/15, [class^="bg-[#10b981]/15"], [class*=" bg-[#10b981]/15"] {
      background-color: color-mix(in srgb, var(--color-success) 15%, transparent) !important;
    }
    .text-\\[\\#10b981\\], [class*="text-[#10b981]"] {
      color: var(--color-success) !important;
    }
    .border-\\[\\#10b981\\], [class*="border-[#10b981]"] {
      border-color: var(--color-success) !important;
    }

    /* Standard Tailwind color scales overrides - Excluded inside dark containers and heading elements to protect readability */
    .text-gray-900:not(h1):not(h2):not(h3):not(h4):not(h5):not(h6):not(.font-heading):not([class*="font-heading"]):not([class*="bg-[#1a1a2e]"] *):not(.bg-secondary *):not([class*="bg-[#e94560]"] *):not(.bg-accent *):not([class*="dark:bg-"] *):not([class*="bg-gray-9"] *):not([class*="bg-black"] *),
    .dark .text-gray-900:not(h1):not(h2):not(h3):not(h4):not(h5):not(h6):not(.font-heading):not([class*="font-heading"]):not([class*="bg-[#1a1a2e]"] *):not(.bg-secondary *):not([class*="bg-[#e94560]"] *):not(.bg-accent *):not([class*="dark:bg-"] *):not([class*="bg-gray-9"] *):not([class*="bg-black"] *), 
    .text-gray-955:not(h1):not(h2):not(h3):not(h4):not(h5):not(h6):not(.font-heading):not([class*="font-heading"]):not([class*="bg-[#1a1a2e]"] *):not(.bg-secondary *):not([class*="bg-[#e94560]"] *):not(.bg-accent *):not([class*="dark:bg-"] *):not([class*="bg-gray-9"] *):not([class*="bg-black"] *),
    .text-gray-950:not(h1):not(h2):not(h3):not(h4):not(h5):not(h6):not(.font-heading):not([class*="font-heading"]):not([class*="bg-[#1a1a2e]"] *):not(.bg-secondary *):not([class*="bg-[#e94560]"] *):not(.bg-accent *):not([class*="dark:bg-"] *):not([class*="bg-gray-9"] *):not([class*="bg-black"] *),
    .dark .text-gray-955:not(h1):not(h2):not(h3):not(h4):not(h5):not(h6):not(.font-heading):not([class*="font-heading"]):not([class*="bg-[#1a1a2e]"] *):not(.bg-secondary *):not([class*="bg-[#e94560]"] *):not(.bg-accent *):not([class*="dark:bg-"] *):not([class*="bg-gray-9"] *):not([class*="bg-black"] *),
    .text-gray-800:not(h1):not(h2):not(h3):not(h4):not(h5):not(h6):not(.font-heading):not([class*="font-heading"]):not([class*="bg-[#1a1a2e]"] *):not(.bg-secondary *):not([class*="bg-[#e94560]"] *):not(.bg-accent *):not([class*="dark:bg-"] *):not([class*="bg-gray-9"] *):not([class*="bg-black"] *),
    .dark .text-gray-800:not(h1):not(h2):not(h3):not(h4):not(h5):not(h6):not(.font-heading):not([class*="font-heading"]):not([class*="bg-[#1a1a2e]"] *):not(.bg-secondary *):not([class*="bg-[#e94560]"] *):not(.bg-accent *):not([class*="dark:bg-"] *):not([class*="bg-gray-9"] *):not([class*="bg-black"] *) {
      color: var(--color-text-primary) !important;
    }
    
    .text-gray-700:not(h1):not(h2):not(h3):not(h4):not(h5):not(h6):not(.font-heading):not([class*="font-heading"]):not([class*="bg-[#1a1a2e]"] *):not(.bg-secondary *):not([class*="bg-[#e94560]"] *):not(.bg-accent *):not([class*="dark:bg-"] *):not([class*="bg-gray-9"] *):not([class*="bg-black"] *),
    .dark .text-gray-700:not(h1):not(h2):not(h3):not(h4):not(h5):not(h6):not(.font-heading):not([class*="font-heading"]):not([class*="bg-[#1a1a2e]"] *):not(.bg-secondary *):not([class*="bg-[#e94560]"] *):not(.bg-accent *):not([class*="dark:bg-"] *):not([class*="bg-gray-9"] *):not([class*="bg-black"] *), 
    .text-gray-600:not(h1):not(h2):not(h3):not(h4):not(h5):not(h6):not(.font-heading):not([class*="font-heading"]):not([class*="bg-[#1a1a2e]"] *):not(.bg-secondary *):not([class*="bg-[#e94560]"] *):not(.bg-accent *):not([class*="dark:bg-"] *):not([class*="bg-gray-9"] *):not([class*="bg-black"] *),
    .dark .text-gray-600:not(h1):not(h2):not(h3):not(h4):not(h5):not(h6):not(.font-heading):not([class*="font-heading"]):not([class*="bg-[#1a1a2e]"] *):not(.bg-secondary *):not([class*="bg-[#e94560]"] *):not(.bg-accent *):not([class*="dark:bg-"] *):not([class*="bg-gray-9"] *):not([class*="bg-black"] *), 
    .text-gray-500:not(h1):not(h2):not(h3):not(h4):not(h5):not(h6):not(.font-heading):not([class*="font-heading"]):not([class*="bg-[#1a1a2e]"] *):not(.bg-secondary *):not([class*="bg-[#e94560]"] *):not(.bg-accent *):not([class*="dark:bg-"] *):not([class*="bg-gray-9"] *):not([class*="bg-black"] *),
    .dark .text-gray-500:not(h1):not(h2):not(h3):not(h4):not(h5):not(h6):not(.font-heading):not([class*="font-heading"]):not([class*="bg-[#1a1a2e]"] *):not(.bg-secondary *):not([class*="bg-[#e94560]"] *):not(.bg-accent *):not([class*="dark:bg-"] *):not([class*="bg-gray-9"] *):not([class*="bg-black"] *), 
    .text-gray-400:not(h1):not(h2):not(h3):not(h4):not(h5):not(h6):not(.font-heading):not([class*="font-heading"]):not([class*="bg-[#1a1a2e]"] *):not(.bg-secondary *):not([class*="bg-[#e94560]"] *):not(.bg-accent *):not([class*="dark:bg-"] *):not([class*="bg-gray-9"] *):not([class*="bg-black"] *),
    .dark .text-gray-400:not(h1):not(h2):not(h3):not(h4):not(h5):not(h6):not(.font-heading):not([class*="font-heading"]):not([class*="bg-[#1a1a2e]"] *):not(.bg-secondary *):not([class*="bg-[#e94560]"] *):not(.bg-accent *):not([class*="dark:bg-"] *):not([class*="bg-gray-9"] *):not([class*="bg-black"] *) {
      color: var(--color-text-secondary) !important;
    }
    
    .border-gray-200:not([class*="bg-[#1a1a2e]"] *):not(.bg-secondary *):not([class*="bg-[#e94560]"] *):not(.bg-accent *):not([class*="dark:bg-"] *):not([class*="bg-gray-9"] *):not([class*="bg-black"] *),
    .dark .border-gray-200:not([class*="bg-[#1a1a2e]"] *):not(.bg-secondary *):not([class*="bg-[#e94560]"] *):not(.bg-accent *):not([class*="dark:bg-"] *):not([class*="bg-gray-9"] *):not([class*="bg-black"] *), 
    .border-gray-100:not([class*="bg-[#1a1a2e]"] *):not(.bg-secondary *):not([class*="bg-[#e94560]"] *):not(.bg-accent *):not([class*="dark:bg-"] *):not([class*="bg-gray-9"] *):not([class*="bg-black"] *),
    .dark .border-gray-100:not([class*="bg-[#1a1a2e]"] *):not(.bg-secondary *):not([class*="bg-[#e94560]"] *):not(.bg-accent *):not([class*="dark:bg-"] *):not([class*="bg-gray-9"] *):not([class*="bg-black"] *) {
      border-color: var(--color-border) !important;
    }
  `;

  return (
    <style
      id="theme-style-registry"
      dangerouslySetInnerHTML={{ __html: css }}
    />
  );
}
