'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, X } from '@/components/common/Icons';
import { PK_CITIES } from '@/lib/data/pk-cities';

interface CitySelectProps {
  value: string;
  onChange: (val: string) => void;
  /** Extra cities to merge in (e.g. courier-serviceable zone cities). */
  extraCities?: string[];
  required?: boolean;
  placeholder?: string;
}

/**
 * Searchable single-select city picker for storefront checkout.
 * Allows free-text (customer can type a city not in the list) while offering
 * a filtered dropdown of known PK cities. Mobile-first, keyboard + touch friendly.
 */
export default function CitySelect({
  value,
  onChange,
  extraCities = [],
  required = false,
  placeholder = 'Karachi',
}: CitySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);

  const cities = useMemo(() => {
    const merged = [...PK_CITIES, ...extraCities];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const c of merged) {
      const key = c.trim().toLowerCase();
      if (key && !seen.has(key)) { seen.add(key); out.push(c.trim()); }
    }
    return out.sort((a, b) => a.localeCompare(b));
  }, [extraCities]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter(c => c.toLowerCase().includes(q));
  }, [cities, query]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const select = (city: string) => {
    onChange(city);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-3 text-sm font-medium text-left focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
      >
        <span className={value ? 'text-gray-900 dark:text-white' : 'text-gray-400'}>
          {value || placeholder}
        </span>
        <div className="flex items-center gap-1">
          {value && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); onChange(''); }}
              className="p-0.5 text-gray-400 hover:text-[#e94560] cursor-pointer"
              aria-label="Clear city"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Hidden input keeps native required-validation working */}
      <input type="text" required={required} value={value} onChange={() => {}} tabIndex={-1} aria-hidden className="sr-only" />

      {open && (
        <div className="absolute z-30 mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] shadow-xl overflow-hidden">
          <div className="relative border-b border-gray-100 dark:border-gray-800">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search or type your city..."
              className="w-full pl-9 pr-3 py-2.5 text-sm font-medium bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
            />
          </div>
          <div className="max-h-56 overflow-y-auto overscroll-contain p-1">
            {query.trim() && !cities.some(c => c.toLowerCase() === query.trim().toLowerCase()) && (
              <button
                type="button"
                onClick={() => select(query.trim())}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-[#e94560] hover:bg-[#e94560]/10 cursor-pointer"
              >
                Use &quot;{query.trim()}&quot;
              </button>
            )}
            {filtered.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => select(c)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  c.toLowerCase() === value.trim().toLowerCase()
                    ? 'bg-[#e94560]/10 text-[#e94560]'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                {c}
              </button>
            ))}
            {filtered.length === 0 && !query.trim() && (
              <p className="text-xs text-gray-400 italic text-center py-4">No cities</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
