import React from 'react';
import Link from 'next/link';
import { ChevronRight } from '@/components/common/Icons';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface AdminPageHeaderProps {
  title: string;
  breadcrumbs?: Breadcrumb[];
  action?: React.ReactNode;
}

export default function AdminPageHeader({ title, breadcrumbs, action }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.label}>
                {index > 0 && <ChevronRight size={14} />}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-gray-900 dark:hover:text-white transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-gray-900 dark:text-white font-medium">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
      {action && (
        <div className="flex items-center gap-2">
          {action}
        </div>
      )}
    </div>
  );
}
