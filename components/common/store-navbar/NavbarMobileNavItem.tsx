'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight } from '@/components/common/Icons';
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
  const lower = labelText.toLowerCase();

  let badge = null;
  if (lower.includes('sale') || lower.includes('discount') || lower.includes('off') || lower.includes('clearance')) {
    badge = (
      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/40 shrink-0 ml-2 shadow-2xs">
        SALE
      </span>
    );
  } else if (lower.includes('new') || lower.includes('arrival') || lower.includes('fresh')) {
    badge = (
      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-900/40 shrink-0 ml-2 shadow-2xs">
        NEW
      </span>
    );
  } else if (lower.includes('hot') || lower.includes('trend') || lower.includes('best')) {
    badge = (
      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/80 dark:border-amber-900/40 shrink-0 ml-2 shadow-2xs">
        HOT
      </span>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-1 px-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 active:scale-[0.99] transition-all group">
        <Link
          href={item.url}
          prefetch={true}
          onClick={() => {
            if (!hasChildren) setMobileMenuOpen(false);
          }}
          className="flex-1 flex items-center justify-between pr-2 text-[14.5px] font-bold text-gray-900 dark:text-gray-100 group-hover:text-black dark:group-hover:text-white transition-colors min-h-[40px]"
        >
          <span className="truncate">{labelText}</span>
          {badge}
        </Link>
        {hasChildren ? (
          <button
            type="button"
            onClick={() => {
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
            }}
            className="h-8 w-8 rounded-lg flex items-center justify-center bg-gray-100/80 hover:bg-gray-200/80 dark:bg-white/5 dark:hover:bg-white/10 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle category submenu"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${isAccOpen ? 'rotate-180' : ''}`}
            />
          </button>
        ) : (
          <Link
            href={item.url}
            prefetch={true}
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all"
            aria-label={`Go to ${labelText}`}
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      {hasChildren && isAccOpen && (
        <div className="ml-3 mt-1 space-y-0.5 border-l-2 border-gray-100 dark:border-gray-800/80 pl-3 py-1 animate-in fade-in slide-in-from-top-1 duration-200">
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
