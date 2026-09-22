'use client';

import React from 'react';
import { NavigationItem } from '@/lib/types';
import MenuItemRow from './MenuItemRow';

interface MenuTreeRendererProps {
  items: NavigationItem[];
  depth?: number;
  moveMenuItemUp: (id: string) => void;
  moveMenuItemDown: (id: string) => void;
  indentMenuItem: (id: string) => void;
  outdentMenuItem: (id: string) => void;
  openAddMenuModal: (parentId: string | null) => void;
  openEditMenuModal: (item: NavigationItem, depth: number, id: string) => void;
  deleteMenuItem: (id: string) => void;
}

export default function MenuTreeRenderer({
  items,
  depth = 0,
  moveMenuItemUp,
  moveMenuItemDown,
  indentMenuItem,
  outdentMenuItem,
  openAddMenuModal,
  openEditMenuModal,
  deleteMenuItem,
}: MenuTreeRendererProps) {
  return (
    <>
      {items.map((item, index) => {
        const hasChildren = item.children && item.children.length > 0;
        return (
          <React.Fragment key={item.id}>
            <MenuItemRow
              item={item}
              index={index}
              totalItems={items.length}
              depth={depth}
              moveMenuItemUp={moveMenuItemUp}
              moveMenuItemDown={moveMenuItemDown}
              indentMenuItem={indentMenuItem}
              outdentMenuItem={outdentMenuItem}
              openAddMenuModal={openAddMenuModal}
              openEditMenuModal={openEditMenuModal}
              deleteMenuItem={deleteMenuItem}
            />
            {hasChildren && (
              <MenuTreeRenderer
                items={item.children!}
                depth={depth + 1}
                moveMenuItemUp={moveMenuItemUp}
                moveMenuItemDown={moveMenuItemDown}
                indentMenuItem={indentMenuItem}
                outdentMenuItem={outdentMenuItem}
                openAddMenuModal={openAddMenuModal}
                openEditMenuModal={openEditMenuModal}
                deleteMenuItem={deleteMenuItem}
              />
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}
