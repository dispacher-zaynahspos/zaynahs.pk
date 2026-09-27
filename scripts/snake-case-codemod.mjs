import { Project, SyntaxKind } from 'ts-morph';

// Fool-proof, symbol-based (type-aware) rename of domain interface properties
// from camelCase -> snake_case. ts-morph renames the declaration AND every
// reference project-wide, so same-named properties on OTHER interfaces are NOT
// touched (they are different symbols). This is the safe way to do RULE D13.

const TARGET_TYPE_FILES = [
  'lib/types/product.ts',
  'lib/types/category.ts',
  'lib/types/order.ts',
  'lib/types/misc.ts',
];

// Properties we must NOT rename (already snake_case handled automatically; these are
// explicit safety excludes — relation/embedded values or values that must stay as-is).
const EXCLUDE = new Set([
  'chart_data', 'meta_sync_status', 'meta_sync_error', 'meta_last_synced_at',
]);

function toSnake(name) {
  if (EXCLUDE.has(name)) return name;
  // already snake or single lowercase word
  if (!/[A-Z]/.test(name)) return name;
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .toLowerCase();
}

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });

let renameCount = 0;
const renamed = [];

for (const filePath of TARGET_TYPE_FILES) {
  const sf = project.getSourceFileOrThrow(filePath);
  for (const iface of sf.getInterfaces()) {
    for (const prop of iface.getProperties()) {
      const oldName = prop.getName();
      const newName = toSnake(oldName);
      if (newName !== oldName) {
        prop.rename(newName);
        renameCount++;
        renamed.push(`${iface.getName()}.${oldName} -> ${newName}`);
      }
    }
  }
}

console.log(`Renamed ${renameCount} properties:`);
for (const r of renamed) console.log('  ' + r);

await project.save();
console.log('Saved all changes.');
