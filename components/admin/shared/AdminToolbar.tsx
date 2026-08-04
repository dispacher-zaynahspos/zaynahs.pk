import React from 'react';

interface AdminToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export default function AdminToolbar({ children, className = '' }: AdminToolbarProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
}
