import { Project } from 'ts-morph';

// 100% snake_case for StoreSettings + ThemeConfig + any other interface in settings.ts.
// Symbol-based rename (declaration + all references project-wide). Safety: theme_config JSONB
// gets a read-normalizer + backfill migration so stored camel keys never break.

function toSnake(name) {
  if (!/[A-Z]/.test(name)) return name; // already snake / single word
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .toLowerCase();
}

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
const sf = project.getSourceFileOrThrow('lib/types/settings.ts');

let count = 0;
const renamed = [];
for (const iface of sf.getInterfaces()) {
  for (const prop of iface.getProperties()) {
    const oldName = prop.getName();
    const newName = toSnake(oldName);
    if (newName !== oldName) {
      prop.rename(newName);
      count++;
      renamed.push(`${iface.getName()}.${oldName} -> ${newName}`);
    }
  }
}
console.log(`Renamed ${count} settings props.`);
for (const r of renamed) console.log('  ' + r);
await project.save();
console.log('Saved.');
