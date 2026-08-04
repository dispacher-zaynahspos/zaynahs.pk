import React from 'react';
import { Search, X } from '@/components/common/Icons';

interface AdminSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isExpandable?: boolean; // If true, it might animate or take up space flexibly
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
    <div className={`relative ${isExpandable ? 'w-full md:w-64 transition-all duration-300' : 'w-full md:w-64'} ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-9 pr-8 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/40 dark:text-white transition-all"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
