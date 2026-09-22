'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronDown } from '@/components/common/Icons';
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

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <Link
          href={item.url}
          onClick={() => {
            if (!hasChildren) setMobileMenuOpen(false);
          }}
          className="flex-1 py-2 text-sm font-bold text-gray-900 dark:text-white hover:text-[#e94560] transition-colors"
        >
          {item.label || (item as any).title}
        </Link>
        {hasChildren && (
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
            className="p-1.5 text-gray-400 hover:text-[#e94560] transition-colors cursor-pointer"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${isAccOpen ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>
      {hasChildren && isAccOpen && (
        <div className="ml-4 mt-1 space-y-1 border-l border-gray-200 dark:border-gray-800 pl-3 animate-fade-in">
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
