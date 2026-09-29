'use client';

import React from 'react';
import Link from 'next/link';
import { Plus } from '@/components/common/Icons';
import { NavigationItem } from '@/lib/types';

interface NavbarMobileNavItemProps {
  item: NavigationItem;
  depth?: number;
  mobileAccordionOpen: Record<string, boolean>;
  setMobileAccordionOpen: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setMobileMenuOpen: (open: boolean) => void;
}

const getDescendantIds = (node: NavigationItem): string[] => {
  const ids: string[] = [];
  const traverse = (n: NavigationItem) => {
    const children = n.children || [];
    children.forEach((c) => {
      ids.push(c.id);
      traverse(c);
    });
  };
  traverse(node);
  return ids;
};

export function NavbarMobileNavItem({
  item,
  depth = 0,
  mobileAccordionOpen,
  setMobileAccordionOpen,
  setMobileMenuOpen,
}: NavbarMobileNavItemProps) {
  const hasChildren = item.children && item.children.length > 0;
  const isAccOpen = mobileAccordionOpen[item.id];
  const labelText = item.label || (item as any).title || '';

  // Reference-style typographic rows: large, bold, uppercase, one line, no boxes/pills/badges.
  // Top-level rows are largest; nested children step down in size for a clear hierarchy.
  const rowTextSize =
    depth === 0 ? 'text-[19px] sm:text-xl' : depth === 1 ? 'text-[15px] sm:text-base' : 'text-sm';

  const toggleAccordion = () => {
    const nextState = !isAccOpen;
    setMobileAccordionOpen((prev) => {
      const updated = { ...prev, [item.id]: nextState };
      if (nextState) {
        getDescendantIds(item).forEach((id) => {
          updated[id] = true;
        });
      }
      return updated;
    });
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-3">
        <Link
          href={item.url}
          prefetch={true}
          onClick={() => {
            if (!hasChildren) setMobileMenuOpen(false);
          }}
          className={`flex-1 min-w-0 py-3 font-[family-name:var(--font-heading)] font-bold uppercase tracking-tight text-gray-900 dark:text-gray-100 hover:text-black dark:hover:text-white transition-colors ${rowTextSize}`}
        >
          <span className="block truncate">{labelText}</span>
        </Link>
        {hasChildren && (
          <button
            type="button"
            onClick={toggleAccordion}
            className="h-10 w-10 -mr-2 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label={isAccOpen ? 'Collapse submenu' : 'Expand submenu'}
            aria-expanded={isAccOpen}
          >
            <Plus
              className={`h-5 w-5 transition-transform duration-200 ${isAccOpen ? 'rotate-45' : ''}`}
              strokeWidth={1.5}
            />
          </button>
        )}
      </div>
      {hasChildren && isAccOpen && (
        <div className="pl-4 pb-1 animate-in fade-in slide-in-from-top-1 duration-200">
          {item.children!.map((child) => (
            <NavbarMobileNavItem
              key={child.id}
              item={child}
              depth={depth + 1}
              mobileAccordionOpen={mobileAccordionOpen}
              setMobileAccordionOpen={setMobileAccordionOpen}
              setMobileMenuOpen={setMobileMenuOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
}
