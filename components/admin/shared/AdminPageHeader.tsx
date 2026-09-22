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
      <div className="space-y-1">
        <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">{title}</h1>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-400 font-semibold flex-wrap">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.label}>
                {index > 0 && <ChevronRight className="h-3 w-3 text-gray-300 dark:text-gray-600 shrink-0" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-gray-900 dark:hover:text-white transition-colors px-1.5 py-0.5 rounded-md hover:bg-gray-100 dark:hover:bg-white/5">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-gray-900 dark:text-white font-bold px-1">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
      </div>
      {action && (
        <div className="flex items-center gap-2.5 flex-wrap">
          {action}
        </div>
      )}
    </div>
  );
}

