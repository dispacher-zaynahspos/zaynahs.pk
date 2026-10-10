'use client';

import React from 'react';
import { StoreSettings } from '@/lib/types';
import MediaField from '@/components/admin/customizer/shared/MediaField';
import HeaderAnnouncementFields from '@/components/admin/shared/HeaderAnnouncementFields';
import MobileBottomNavBuilder from '@/components/admin/customizer/pages/global/MobileBottomNavBuilder';

interface GlobalSettingsProps {
  settings: StoreSettings;
  onUpdateSettings: (updates: Partial<StoreSettings>) => void;
  subTab: 'header' | 'footer' | 'branding';
  onSelectMedia: (fieldKey: string) => void;
}

export default function GlobalSettings({
  settings,
  onUpdateSettings,
  subTab,
  onSelectMedia
}: GlobalSettingsProps) {
  if (subTab === 'branding') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block leading-none mb-1">Editing Section</span>
            <h4 className="text-sm font-black text-gray-900 dark:text-white truncate">Store Branding</h4>
          </div>
          <span className="text-[9px] font-black text-[#e94560] bg-[#e94560]/10 px-2.5 py-1 rounded-full uppercase tracking-wider flex-shrink-0">
            Branding
          </span>
        </div>

        {/* Favicon Selector */}
        <div className="space-y-1.5 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-800">
          <MediaField
            label="Favicon Icon URL"
            labelClassName="text-[11px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider"
            value={settings.favicon_url || ''}
            onChange={(v) => onUpdateSettings({ favicon_url: v })}
            onSelect={() => onSelectMedia('favicon_url')}
            placeholder="Favicon Image URL"
            hint="PNG ya ICO formats dono support hote hain. Favicon update browser cache clear karne ke baad dikhta hai."
          />
        </div>

        {/* Logo Selector */}
        <div className="space-y-1.5 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-800">
          <MediaField
            label="Logo Image URL"
            labelClassName="text-[11px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider"
            value={settings.logo_url || ''}
            onChange={(v) => onUpdateSettings({ logo_url: v })}
            onSelect={() => onSelectMedia('logo_url')}
            placeholder="Logo Image URL"
          />

          <div className="space-y-1 pt-2">
            <div className="flex justify-between text-[11px] font-bold text-gray-500">
              <span>Logo Display Width</span>
              <span className="text-[#e94560]">{settings.logo_width || 120}px</span>
            </div>
            <input
              type="range"
              min="30"
              max="300"
              step="10"
              value={settings.logo_width || 120}
              onChange={(e) => onUpdateSettings({ logo_width: parseInt(e.target.value) })}
              className="w-full accent-[#e94560]"
            />
          </div>
        </div>
      </div>
    );
  }

  if (subTab === 'header') {
    const currentTopBarBg = settings.header_top_bar_bg || settings.theme_config?.colors?.headerTopBarBg || settings.theme_config?.colors?.primary || '#0F2A5E';
    const currentTopBarText = settings.header_top_bar_text_color || settings.theme_config?.colors?.headerTopBarTextColor || '#ffffff';
    const currentHeaderBg = settings.header_bg || settings.theme_config?.colors?.surface || '#ffffff';
    const currentHeaderText = settings.header_text_color || settings.theme_config?.colors?.textPrimary || '#1a1a2e';

    const TOPBAR_PALETTES = [
      { label: 'Theme Navy', color: '#0F2A5E' },
      { label: 'Dark Slate', color: '#111827' },
      { label: 'Vibrant Coral', color: '#FF5A5F' },
      { label: 'Emerald', color: '#0F5132' },
      { label: 'Royal Blue', color: '#1E40AF' },
      { label: 'Pure White', color: '#FFFFFF', text: '#111827' },
    ];

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block leading-none mb-1">Editing Section</span>
            <h4 className="text-sm font-black text-gray-900 dark:text-white truncate">Header & Topbar</h4>
          </div>
          <span className="text-[9px] font-black text-[#e94560] bg-[#e94560]/10 px-2.5 py-1 rounded-full uppercase tracking-wider flex-shrink-0">
            Header
          </span>
        </div>

        {/* SECTION 1: Top Bar & Announcement */}
        <div className="space-y-3.5 p-3.5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200/80 dark:border-gray-800">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#e94560] block">
              Top Bar & Announcement Colors
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Top Bar Background */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">
                Top Bar Background
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentTopBarBg.startsWith('#') ? currentTopBarBg : '#0F2A5E'}
                  onChange={(e) => onUpdateSettings({ header_top_bar_bg: e.target.value })}
                  className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
                />
                <input
                  type="text"
                  value={settings.header_top_bar_bg || ''}
                  onChange={(e) => onUpdateSettings({ header_top_bar_bg: e.target.value })}
                  placeholder={currentTopBarBg}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-mono font-semibold"
                />
              </div>
              {/* Quick Preset Colors */}
              <div className="flex items-center gap-1.5 pt-1">
                {TOPBAR_PALETTES.map((p) => (
                  <button
                    key={p.color}
                    type="button"
                    title={p.label}
                    onClick={() => {
                      onUpdateSettings({
                        header_top_bar_bg: p.color,
                        ...(p.text ? { header_top_bar_text_color: p.text } : {}),
                      });
                    }}
                    style={{ backgroundColor: p.color }}
                    className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600 shadow-xs hover:scale-110 active:scale-95 transition-transform"
                  />
                ))}
              </div>
            </div>

            {/* Top Bar Text Color */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">
                Top Bar Text Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentTopBarText.startsWith('#') ? currentTopBarText : '#ffffff'}
                  onChange={(e) => onUpdateSettings({ header_top_bar_text_color: e.target.value })}
                  className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
                />
                <input
                  type="text"
                  value={settings.header_top_bar_text_color || ''}
                  onChange={(e) => onUpdateSettings({ header_top_bar_text_color: e.target.value })}
                  placeholder={currentTopBarText}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-mono font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Announcement & Top Bar Content Controls */}
          <div className="pt-2 border-t border-gray-200/80 dark:border-gray-800">
            <HeaderAnnouncementFields settings={settings} onUpdate={onUpdateSettings} />
          </div>
        </div>

        {/* SECTION 2: Main Header Bar & Stickiness */}
        <div className="space-y-3.5 p-3.5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200/80 dark:border-gray-800">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#e94560] block">
            Main Header Settings
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Header Background</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentHeaderBg.startsWith('#') ? currentHeaderBg : '#ffffff'}
                  onChange={(e) => onUpdateSettings({ header_bg: e.target.value })}
                  className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
                />
                <input
                  type="text"
                  value={settings.header_bg || ''}
                  onChange={(e) => onUpdateSettings({ header_bg: e.target.value })}
                  placeholder={currentHeaderBg}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-mono font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Header Text Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentHeaderText.startsWith('#') ? currentHeaderText : '#1a1a2e'}
                  onChange={(e) => onUpdateSettings({ header_text_color: e.target.value })}
                  className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
                />
                <input
                  type="text"
                  value={settings.header_text_color || ''}
                  onChange={(e) => onUpdateSettings({ header_text_color: e.target.value })}
                  placeholder={currentHeaderText}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-mono font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Header Border Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.header_border_color || '#e5e7eb'}
                  onChange={(e) => onUpdateSettings({ header_border_color: e.target.value })}
                  className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
                />
                <input
                  type="text"
                  value={settings.header_border_color || ''}
                  onChange={(e) => onUpdateSettings({ header_border_color: e.target.value })}
                  placeholder="#e5e7eb"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-mono font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Popular Searches (comma-separated)</label>
              <input
                type="text"
                value={settings.popular_searches || ''}
                onChange={(e) => onUpdateSettings({ popular_searches: e.target.value })}
                placeholder="e.g. Co-ord Sets, Graphic Tee, Kids"
                className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-semibold"
              />
              <p className="text-[10px] text-gray-400">Shown in the storefront search popup under "Popular Searches".</p>
            </div>
          </div>

          <div className="space-y-2 pt-1 border-t border-gray-200/80 dark:border-gray-800">
            <div className="flex justify-between items-center py-1">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Sticky Header (Desktop)</span>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.header_sticky_desktop ?? true}
                  onChange={(e) => onUpdateSettings({ header_sticky_desktop: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
              </label>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Sticky Header (Mobile)</span>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.header_sticky_mobile ?? true}
                  onChange={(e) => onUpdateSettings({ header_sticky_mobile: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
              </label>
            </div>
          </div>
        </div>

        {/* SECTION 3: Mobile Bottom Navigation & Cart Bar */}
        <div className="space-y-3.5 p-3.5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200/80 dark:border-gray-800">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#e94560] block">
            Mobile Navigation Bars
          </span>

          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Mobile Bottom Nav Bar</span>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.mobile_bottom_nav_enabled ?? true}
                onChange={(e) => onUpdateSettings({ mobile_bottom_nav_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
            </label>
          </div>

          {(settings.mobile_bottom_nav_enabled ?? true) && (
            <MobileBottomNavBuilder settings={settings} onUpdateSettings={onUpdateSettings} />
          )}

          <div className="flex justify-between items-center pt-2">
            <div className="min-w-0 pr-3">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Mobile "View Bag" Cart Bar</span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500">Sticky bottom cart summary (theme-colored). Shows when cart has items.</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
              <input
                type="checkbox"
                checked={settings.cart_bar_enabled ?? true}
                onChange={(e) => onUpdateSettings({ cart_bar_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
            </label>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="min-w-0">
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block leading-none mb-1">Editing Section</span>
          <h4 className="text-sm font-black text-gray-900 dark:text-white truncate">Footer & Social</h4>
        </div>
        <span className="text-[9px] font-black text-[#e94560] bg-[#e94560]/10 px-2.5 py-1 rounded-full uppercase tracking-wider flex-shrink-0">
          Footer
        </span>
      </div>

      {/* Footer Colors */}
      <div className="space-y-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-800">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e94560] block">
          Footer Colors
        </span>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Footer Background</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.footer_bg || settings.theme_config?.colors?.footerBg || '#ffffff'}
                onChange={(e) => onUpdateSettings({ footer_bg: e.target.value })}
                className="w-7 h-7 rounded border border-gray-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
              />
              <input
                type="text"
                value={settings.footer_bg || ''}
                onChange={(e) => onUpdateSettings({ footer_bg: e.target.value })}
                placeholder={settings.theme_config?.colors?.footerBg || '#FFFFFF'}
                className="w-full px-2 py-1 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Footer Text Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.footer_text_color || settings.theme_config?.colors?.footerTextColor || '#5B6B85'}
                onChange={(e) => onUpdateSettings({ footer_text_color: e.target.value })}
                className="w-7 h-7 rounded border border-gray-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
              />
              <input
                type="text"
                value={settings.footer_text_color || ''}
                onChange={(e) => onUpdateSettings({ footer_text_color: e.target.value })}
                placeholder={settings.theme_config?.colors?.footerTextColor || '#5B6B85'}
                className="w-full px-2 py-1 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-mono"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Footer Headings</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.footer_heading_color || '#111827'}
                onChange={(e) => onUpdateSettings({ footer_heading_color: e.target.value })}
                className="w-7 h-7 rounded border border-gray-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
              />
              <input
                type="text"
                value={settings.footer_heading_color || ''}
                onChange={(e) => onUpdateSettings({ footer_heading_color: e.target.value })}
                placeholder="#111827"
                className="w-full px-2 py-1 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-mono"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Footer Links</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.footer_link_color || '#5B6B85'}
                onChange={(e) => onUpdateSettings({ footer_link_color: e.target.value })}
                className="w-7 h-7 rounded border border-gray-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
              />
              <input
                type="text"
                value={settings.footer_link_color || ''}
                onChange={(e) => onUpdateSettings({ footer_link_color: e.target.value })}
                placeholder="#5B6B85"
                className="w-full px-2 py-1 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-mono"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Footer Divider</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.footer_border_color || '#e5e7eb'}
                onChange={(e) => onUpdateSettings({ footer_border_color: e.target.value })}
                className="w-7 h-7 rounded border border-gray-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
              />
              <input
                type="text"
                value={settings.footer_border_color || ''}
                onChange={(e) => onUpdateSettings({ footer_border_color: e.target.value })}
                placeholder="#e5e7eb"
                className="w-full px-2 py-1 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-mono"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Copyright Text</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.footer_copyright_color || '#5B6B85'}
                onChange={(e) => onUpdateSettings({ footer_copyright_color: e.target.value })}
                className="w-7 h-7 rounded border border-gray-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
              />
              <input
                type="text"
                value={settings.footer_copyright_color || ''}
                onChange={(e) => onUpdateSettings({ footer_copyright_color: e.target.value })}
                placeholder="#5B6B85"
                className="w-full px-2 py-1 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-mono"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Social Icon</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.footer_social_icon_color || '#5B6B85'}
                onChange={(e) => onUpdateSettings({ footer_social_icon_color: e.target.value })}
                className="w-7 h-7 rounded border border-gray-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
              />
              <input
                type="text"
                value={settings.footer_social_icon_color || ''}
                onChange={(e) => onUpdateSettings({ footer_social_icon_color: e.target.value })}
                placeholder="#5B6B85"
                className="w-full px-2 py-1 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-mono"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Social Icon Bg</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.footer_social_icon_bg || '#f1f1f1'}
                onChange={(e) => onUpdateSettings({ footer_social_icon_bg: e.target.value })}
                className="w-7 h-7 rounded border border-gray-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
              />
              <input
                type="text"
                value={settings.footer_social_icon_bg || ''}
                onChange={(e) => onUpdateSettings({ footer_social_icon_bg: e.target.value })}
                placeholder="#f1f1f1"
                className="w-full px-2 py-1 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-mono"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Social Hover Icon</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.footer_social_hover_color || '#ffffff'}
                onChange={(e) => onUpdateSettings({ footer_social_hover_color: e.target.value })}
                className="w-7 h-7 rounded border border-gray-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
              />
              <input
                type="text"
                value={settings.footer_social_hover_color || ''}
                onChange={(e) => onUpdateSettings({ footer_social_hover_color: e.target.value })}
                placeholder="#ffffff"
                className="w-full px-2 py-1 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-mono"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Social Hover Bg</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.footer_social_hover_bg || '#e94560'}
                onChange={(e) => onUpdateSettings({ footer_social_hover_bg: e.target.value })}
                className="w-7 h-7 rounded border border-gray-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
              />
              <input
                type="text"
                value={settings.footer_social_hover_bg || ''}
                onChange={(e) => onUpdateSettings({ footer_social_hover_bg: e.target.value })}
                placeholder="#e94560"
                className="w-full px-2 py-1 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Footer Copyright text</label>
        <input
          type="text"
          value={settings.footer_bottom_text || ''}
          onChange={(e) => onUpdateSettings({ footer_bottom_text: e.target.value })}
          className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none"
        />
      </div>

      {/* Footer Typography & Layout (shared keys with Settings -> Footer tab) */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Heading Font</label>
          <input type="text" value={settings.footer_heading_font || ''} placeholder="theme default" onChange={(e) => onUpdateSettings({ footer_heading_font: e.target.value })} className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f0f1b] px-2 py-1.5 text-xs font-semibold" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Body Font</label>
          <input type="text" value={settings.footer_body_font || ''} placeholder="theme default" onChange={(e) => onUpdateSettings({ footer_body_font: e.target.value })} className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f0f1b] px-2 py-1.5 text-xs font-semibold" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Body Size</label>
          <input type="text" value={settings.footer_body_size || ''} placeholder="e.g. 0.875rem" onChange={(e) => onUpdateSettings({ footer_body_size: e.target.value })} className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f0f1b] px-2 py-1.5 text-xs font-semibold" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Alignment</label>
          <select value={settings.footer_align || 'left'} onChange={(e) => onUpdateSettings({ footer_align: e.target.value as 'left' | 'center' })} className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f0f1b] px-2 py-1.5 text-xs font-semibold">
            <option value="left">Left</option>
            <option value="center">Center</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Heading Weight</label>
          <select value={settings.footer_heading_weight || ''} onChange={(e) => onUpdateSettings({ footer_heading_weight: e.target.value })} className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f0f1b] px-2 py-1.5 text-xs font-semibold">
            <option value="">Default</option>
            <option value="400">400</option>
            <option value="500">500</option>
            <option value="600">600</option>
            <option value="700">700</option>
            <option value="800">800</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Vertical Padding</label>
          <input type="text" value={settings.footer_padding || ''} placeholder="e.g. 3rem" onChange={(e) => onUpdateSettings({ footer_padding: e.target.value })} className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f0f1b] px-2 py-1.5 text-xs font-semibold" />
        </div>
      </div>

      <div className="space-y-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-800">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e94560] block mb-1">Social Accounts</span>
        
        <div className="space-y-1.5">
          <label className="text-[10px] text-gray-400 block">Instagram Link</label>
          <input
            type="text"
            value={settings.social_instagram || ''}
            onChange={(e) => onUpdateSettings({ social_instagram: e.target.value })}
            placeholder="e.g. https://instagram.com/username"
            className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] text-gray-400 block">Facebook Link</label>
          <input
            type="text"
            value={settings.social_facebook || ''}
            onChange={(e) => onUpdateSettings({ social_facebook: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] text-gray-400 block">TikTok Link</label>
          <input
            type="text"
            value={settings.social_tiktok || ''}
            onChange={(e) => onUpdateSettings({ social_tiktok: e.target.value })}
            placeholder="e.g. https://www.tiktok.com/@username"
            className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] text-gray-400 block">Snapchat Link</label>
          <input
            type="text"
            value={settings.social_snapchat || ''}
            onChange={(e) => onUpdateSettings({ social_snapchat: e.target.value })}
            placeholder="e.g. https://snapchat.com/add/username"
            className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] text-gray-400 block">Twitter (X) Link</label>
          <input
            type="text"
            value={settings.social_twitter || ''}
            onChange={(e) => onUpdateSettings({ social_twitter: e.target.value })}
            placeholder="e.g. https://twitter.com/username"
            className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] text-gray-400 block">YouTube Link</label>
          <input
            type="text"
            value={settings.social_youtube || ''}
            onChange={(e) => onUpdateSettings({ social_youtube: e.target.value })}
            placeholder="e.g. https://youtube.com/@channel"
            className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] text-gray-400 block">WhatsApp Contact Number</label>
          <input
            type="text"
            value={settings.social_whatsapp || ''}
            onChange={(e) => onUpdateSettings({ social_whatsapp: e.target.value })}
            placeholder="e.g. 923001234567"
            className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
          />
          <p className="text-[9px] text-gray-400 leading-normal">
            Format: 923001234567 (no spaces or +).
          </p>
        </div>
      </div>
    </div>
  );
}
