'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search } from '@/components/common/Icons';

interface CitySelectProps {
  value: string;
  cities: string[];
  loading: boolean;
  disabled?: boolean;
  onChange: (v: string) => void;
}

export default function CitySelect({
  value,
  cities,
  loading,
  disabled,
  onChange,
}: CitySelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        popRef.current && !popRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const popHeight = 260;
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow < popHeight && spaceAbove > spaceBelow) {
      setPopoverStyle({
        position: 'fixed',
        left: rect.left + 'px',
        top: Math.max(8, rect.top - popHeight) + 'px',
        width: Math.max(rect.width, 200) + 'px',
      });
    } else {
      setPopoverStyle({
        position: 'fixed',
        left: rect.left + 'px',
        top: rect.bottom + 4 + 'px',
        width: Math.max(rect.width, 200) + 'px',
      });
    }
  }, [open]);

  const filtered = cities.filter(c => c.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => { if (!disabled) setOpen(!open); }}
        disabled={disabled}
        className="w-full flex items-center justify-between gap-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f1b] px-2.5 py-1.5 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 cursor-pointer truncate"
      >
        <span className="truncate">{value || (loading ? 'Loading...' : 'Select city')}</span>
        <ChevronDown className="h-3 w-3 text-gray-400 flex-shrink-0" />
      </button>

      {open && mounted && typeof document !== 'undefined' && createPortal(
        <div
          ref={popRef}
          style={popoverStyle}
          className="z-[99999] bg-white dark:bg-[#1a1a30] border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl flex flex-col"
        >
          <div className="flex items-center gap-1.5 px-2.5 py-2 border-b border-gray-100 dark:border-gray-800">
            <Search className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search city..."
              className="w-full text-xs font-semibold bg-transparent focus:outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '220px' }}>
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-gray-400">No cities match</div>
            ) : (
              filtered.map(city => (
                <button
                  key={city}
                  type="button"
                  onClick={() => { onChange(city); setOpen(false); setSearch(''); }}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors ${
                    city === value ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {city}
                </button>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
