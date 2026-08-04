import React from 'react';

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="hidden sm:inline text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider shrink-0">Sort by:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white shadow-sm"
      >
        <option value="manual">Manual Order</option>
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="alpha_asc">Alphabetically: A-Z</option>
        <option value="alpha_desc">Alphabetically: Z-A</option>
      </select>
    </div>
  );
}
