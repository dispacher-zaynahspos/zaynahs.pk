import React from 'react';

interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export default function AdminCard({ children, className = '', noPadding = false }: AdminCardProps) {
  return (
    <div className={`bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-xs hover:shadow-sm transition-all duration-200 overflow-hidden ${className}`}>
      {noPadding ? children : <div className="p-5 sm:p-6">{children}</div>}
    </div>
  );
}

