import React from 'react';

interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export default function AdminCard({ children, className = '', noPadding = false }: AdminCardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {noPadding ? children : <div className="p-4 sm:p-6">{children}</div>}
    </div>
  );
}
