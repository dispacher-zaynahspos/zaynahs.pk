import { Project } from 'ts-morph';

// Convert the last two JSONB-stored shapes to snake_case (RULE D13 — 100% snake, no camel).
// Symbol-based rename (declaration + all references). Safety shims (localStorage migrate +
// orders read-normalizer + non-destructive DB migration) are added separately so no data wipes.

const MAP = {
  CartItem: {
    selectedVariant: 'selected_variant',
    selectedModifiers: 'selected_modifiers',
    unitPrice: 'unit_price',
    discountAmount: 'discount_amount',
    discountType: 'discount_type',
    discountValue: 'discount_value',
    addedLater: 'added_later',
  },
  StatusLogItem: {
    createdAt: 'created_at',
  },
};

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
const sf = project.getSourceFileOrThrow('lib/types/order.ts');

let count = 0;
for (const [ifaceName, map] of Object.entries(MAP)) {
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
console.log(`Renamed ${count} props.`);
await project.save();
console.log('Saved.');
