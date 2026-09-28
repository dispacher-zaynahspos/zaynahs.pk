'use client';

/**
 * Accordion group + settings search (Phase 1 foundation).
 * AccordionGroup remembers its open/closed state per key in localStorage.
 */
import React, { useEffect, useState } from 'react';
import { ChevronDown, Search } from '@/components/common/Icons';

export function AccordionGroup({
  id,
  title,
  defaultOpen = true,
  badge,
  children,
}: {
  id: string;
  title: string;
  defaultOpen?: boolean;
  badge?: string;
  children: React.ReactNode;
}) {
  const storageKey = `customizer-accordion:${id}`;
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) setOpen(saved === '1');
    } catch { /* ignore */ }
  }, [storageKey]);

  const toggle = () => {
    setOpen((v) => {
      const next = !v;
      try { localStorage.setItem(storageKey, next ? '1' : '0'); } catch { /* ignore */ }
      return next;
    });
  };

  return (
    <div className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-[#16162a]">
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40 min-h-[44px]"
      >
        <span className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-200">{title}</span>
          {badge && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40">{badge}</span>}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-4 pb-3 pt-1 border-t border-gray-100 dark:border-gray-800 divide-y divide-gray-50 dark:divide-gray-800/50">{children}</div>}
    </div>
  );
}

export function SettingsSearch({ value, onChange, placeholder = 'Search settings…' }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a30] text-gray-900 dark:text-white text-sm focus:border-blue-500 focus:outline-none min-h-[40px]"
      />
    </div>
  );
}
