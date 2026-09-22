import React from 'react';

interface AdminToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export default function AdminToolbar({ children, className = '' }: AdminToolbarProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 bg-white dark:bg-[#16162a] p-3.5 sm:p-4 rounded-2xl shadow-xs border border-gray-200/80 dark:border-gray-800/80 transition-colors ${className}`}>
      {children}
    </div>
  );
}

