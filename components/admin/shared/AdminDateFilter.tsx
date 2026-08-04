import React from 'react';
import { Calendar } from '@/components/common/Icons';

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
    { value: 'all', label: 'All Dates' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'last7', label: 'Last 7 Days' },
    { value: 'last30', label: 'Last 30 Days' },
    { value: 'custom', label: 'Custom Range' },
  ]
}: AdminDateFilterProps) {
  return (
    <div className={`flex items-center gap-1.5 bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-1 ${className}`}>
      <Calendar className="h-4 w-4 text-gray-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border-0 text-xs font-bold focus:outline-none text-gray-900 dark:text-white cursor-pointer py-1.5 pr-6"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
