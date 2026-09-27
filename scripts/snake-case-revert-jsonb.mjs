import { Project } from 'ts-morph';

// Reverse the codemod ONLY for JSONB-stored shapes (CartItem, StatusLogItem) that live
// inside orders.items / orders.status_logs. Those columns hold camelCase keys for existing
// orders, so their TS shapes must stay camelCase to avoid breaking historical order data.

const REVERT = {
  CartItem: {
    selected_variant: 'selectedVariant',
    selected_modifiers: 'selectedModifiers',
    unit_price: 'unitPrice',
    discount_amount: 'discountAmount',
    discount_type: 'discountType',
    discount_value: 'discountValue',
    added_later: 'addedLater',
  },
  StatusLogItem: {
    created_at: 'createdAt',
  },
};

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
const sf = project.getSourceFileOrThrow('lib/types/order.ts');

let count = 0;
for (const [ifaceName, map] of Object.entries(REVERT)) {
  const iface = sf.getInterfaceOrThrow(ifaceName);
  for (const prop of iface.getProperties()) {
    const cur = prop.getName();
    if (map[cur]) {
      prop.rename(map[cur]);
      count++;
      console.log(`  ${ifaceName}.${cur} -> ${map[cur]}`);
    }
  }
}

console.log(`Reverted ${count} JSONB-shape properties.`);
await project.save();
console.log('Saved.');
