import React from 'react';
import { Search, X } from '@/components/common/Icons';

interface AdminSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isExpandable?: boolean;
  className?: string;
}

export default function AdminSearchInput({
  value,
  onChange,
  placeholder = "Search...",
  isExpandable = false,
  className = ""
}: AdminSearchInputProps) {
  return (
    <div className={`relative group ${isExpandable ? 'w-full md:w-64 transition-all duration-200' : 'w-full md:w-64'} ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#e94560] transition-colors">
        <Search className="h-4 w-4" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-9 pr-8 py-2 bg-gray-50/80 dark:bg-white/5 border border-gray-200/80 dark:border-gray-800/80 rounded-xl text-xs font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#e94560] focus:ring-2 focus:ring-[#e94560]/15 transition-all"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
          title="Clear search"
        >
          <span className="p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <X className="h-3.5 w-3.5" />
          </span>
        </button>
      )}
    </div>
  );
}

