'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, CornerDownLeft, ArrowUpDown } from '@/components/common/Icons';
import { NavSection, SETTINGS_TAB_SHORTCUTS } from './adminNavSections';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';

interface AdminCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  navSections: NavSection[];
  todayCounts?: Record<string, number>;
}

interface FlatItem {
  id: string;
  label: string;
  href: string;
  icon: any;
  groupLabel: string;
  badgeCount?: number;
  keywords?: string[];
}

export function AdminCommandPalette({
  isOpen,
  onClose,
  navSections,
  todayCounts = {},
}: AdminCommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(isOpen);

  // Flatten all items from navSections + settings shortcuts
  const allItems = useMemo<FlatItem[]>(() => {
    const list: FlatItem[] = [];

    for (const section of navSections) {
      for (const item of section.items) {
        let badgeCount: number | undefined;
        if (item.badgeKey) {
          badgeCount = todayCounts[item.badgeKey];
        }
        list.push({
          id: `${section.key}-${item.href}`,
          label: item.label,
          href: item.href,
          icon: item.icon,
          groupLabel: section.label || 'OVERVIEW',
          badgeCount,
          keywords: item.keywords,
        });
      }
    }

    // Add settings sub-tabs as quick jump shortcuts
    for (const item of SETTINGS_TAB_SHORTCUTS) {
      list.push({
        id: `settings-tab-${item.href}`,
        label: item.label,
        href: item.href,
        icon: item.icon,
        groupLabel: 'SETTINGS TAB',
        keywords: item.keywords,
      });
    }

    return list;
  }, [navSections, todayCounts]);

  // Filter items
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;

    return allItems.filter((item) => {
      if (item.label.toLowerCase().includes(q)) return true;
      if (item.groupLabel.toLowerCase().includes(q)) return true;
      if (item.href.toLowerCase().includes(q)) return true;
      if (item.keywords?.some((k) => k.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [allItems, query]);

  // Auto focus input when opened & reset state
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (filteredItems.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredItems[selectedIndex];
        if (selected) {
          router.push(selected.href);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, router, onClose]);

  // Keep selected item scrolled into view
  useEffect(() => {
    if (!listRef.current) return;
    const selectedEl = listRef.current.children[selectedIndex] as HTMLElement | undefined;
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Navigation Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-3 sm:px-4"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 transition-opacity animate-in fade-in duration-200"
      />

      {/* Palette Modal Box */}
      <div className="relative w-full max-w-xl bg-white dark:bg-[#16162a] rounded-2xl shadow-2xl border border-gray-200/90 dark:border-gray-800/90 overflow-hidden flex flex-col max-h-[75vh] z-10 transition-all transform animate-in fade-in zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-black/20">
          <Search className="h-5 w-5 text-gray-400 dark:text-gray-500 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to page... (e.g. Products, Customizer, WhatsApp)"
            className="w-full bg-transparent text-sm sm:text-base font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-200/80 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1 overscroll-contain"
        >
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400 font-medium">
              No navigation items match &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    router.push(item.href);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-sm font-semibold transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--color-primary,#C2185B)] text-white shadow-xs'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-bold">{item.label}</div>
                      <div
                        className={`text-[11px] truncate ${
                          isSelected ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'
                        }`}
                      >
                        {item.href}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {item.badgeCount !== undefined && item.badgeCount > 0 && (
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-white text-[var(--color-primary,#C2185B)]'
                            : 'bg-[var(--color-primary,#C2185B)] text-white'
                        }`}
                      >
                        {item.badgeCount > 99 ? '99+' : item.badgeCount}
                      </span>
                    )}
                    <span
                      className={`text-[9.5px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-black/20 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {item.groupLabel}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Keyboard Hints */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 dark:border-gray-800/80 bg-gray-50/70 dark:bg-black/25 text-[11px] text-gray-500 dark:text-gray-400 font-medium">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <ArrowUpDown className="h-3 w-3" /> Navigate
            </span>
            <span className="inline-flex items-center gap-1">
              <CornerDownLeft className="h-3 w-3" /> Select
            </span>
          </div>
          <span>{filteredItems.length} results</span>
        </div>
      </div>
    </div>
  );
}
