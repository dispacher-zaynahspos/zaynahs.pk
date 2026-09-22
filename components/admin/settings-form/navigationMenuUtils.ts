import { NavigationItem } from '@/lib/types';

// Helper to recursively find a node, its parent, and its siblings in the tree
export const findNodeAndParent = (
  nodes: NavigationItem[],
  targetId: string,
  parent: NavigationItem | null = null
): {
  node: NavigationItem | null;
  parent: NavigationItem | null;
  siblings: NavigationItem[];
  index: number;
} => {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === targetId) {
      return { node: nodes[i], parent, siblings: nodes, index: i };
    }
    if (nodes[i].children && nodes[i].children!.length > 0) {
      const result = findNodeAndParent(nodes[i].children!, targetId, nodes[i]);
      if (result.node) return result;
    }
  }
  return { node: null, parent: null, siblings: [], index: -1 };
};

// Helper to deep clone the menu tree to avoid direct mutation
export const deepCloneMenu = (menu: NavigationItem[]): NavigationItem[] => {
  return menu.map(item => ({
    ...item,
    children: item.children ? deepCloneMenu(item.children) : []
  }));
};
