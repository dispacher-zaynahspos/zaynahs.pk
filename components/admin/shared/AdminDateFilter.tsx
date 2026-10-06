import React from 'react';
import { Calendar, ChevronDown } from '@/components/common/Icons';

interface AdminDateFilterProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  options?: { value: string; label: string }[];
}

export default function AdminDateFilter({
  value,
  onChange,
  className = "",
  options = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'last7', label: 'Last 7 Days' },
    { value: 'last30', label: 'Last 30 Days' },
    { value: 'custom', label: 'Custom Range' },
  ]
}: AdminDateFilterProps) {
  return (
    <div className={`flex items-center gap-1.5 min-w-0 box-border bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-1 ${className}`}>
      <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-w-0 w-full box-border bg-transparent border-0 text-xs font-bold focus:outline-none text-gray-900 dark:text-white cursor-pointer py-1.5 pr-1 appearance-none truncate"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-gray-400 pointer-events-none" />
    </div>
  );
}
