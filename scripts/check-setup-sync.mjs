#!/usr/bin/env node
/**
 * check-setup-sync.mjs — keeps the SETUP SYSTEM in sync on every change.
 * ══════════════════════════════════════════════════════════════════════
 * One guard that FAILS LOUDLY whenever a migration / feature / env change was
 * made but a setup file was NOT updated to match. Wired into `prebuild` and the
 * optional git pre-commit hook, so drift can never ship.
 *
 * It checks THREE kinds of drift:
 *   1. Migrations ↔ master schema parity           (delegates to check-master-schema.mjs)
 *   2. revalidate-trigger tables: setup-triggers.mjs ↔ SUPER_MASTER_SCHEMA.sql
 *   3. clone-setup REQUIRED env keys ⊆ .env.example (new required var must be documented)
 *
 * Usage: node scripts/check-setup-sync.mjs   (exit 0 = in sync, 1 = drift)
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(resolve(ROOT, p), 'utf8');
const problems = [];

// ── 1. Migrations ↔ master schema parity ───────────────────────────────────
const parity = spawnSync('node', ['scripts/check-master-schema.mjs'], { cwd: ROOT, encoding: 'utf8' });
process.stdout.write(parity.stdout || '');
if (parity.status !== 0) {
  problems.push('Migrations are NOT fully reflected in SUPER_MASTER_SCHEMA.sql (see check:schema output above).');
}

// ── 2. revalidate-trigger tables: setup-triggers.mjs ↔ master schema ────────
try {
  const triggersSrc = read('scripts/setup-triggers.mjs');
  const scriptTables = new Set(
    [...triggersSrc.matchAll(/\[\s*'revalidate-[^']+'\s*,\s*'([a-z_]+)'\s*\]/g)].map((m) => m[1])
  );
  const schemaSrc = read('supabase/schema/SUPER_MASTER_SCHEMA.sql');
  const schemaTables = new Set(
    [...schemaSrc.matchAll(/CREATE TRIGGER\s+"revalidate-[^"]+"\s+AFTER[\s\S]*?ON\s+(?:public\.)?([a-z_]+)/g)].map((m) => m[1])
  );
  const onlyInScript = [...scriptTables].filter((t) => !schemaTables.has(t));
  const onlyInSchema = [...schemaTables].filter((t) => !scriptTables.has(t));
  if (onlyInScript.length)
    problems.push(`revalidate triggers in setup-triggers.mjs but MISSING in master schema: ${onlyInScript.join(', ')}`);
  if (onlyInSchema.length)
    problems.push(`revalidate triggers in master schema but MISSING in setup-triggers.mjs: ${onlyInSchema.join(', ')}`);
  if (!onlyInScript.length && !onlyInSchema.length)
    console.log(`✓ revalidate-trigger tables in sync (${scriptTables.size} tables).`);
} catch (e) {
  problems.push(`Could not cross-check revalidate triggers: ${e.message}`);
}

// ── 3. clone-setup REQUIRED env keys ⊆ .env.example ─────────────────────────
try {
  const cloneSrc = read('scripts/clone-setup.mjs');
  const reqBlock = cloneSrc.match(/const REQUIRED = \[([\s\S]*?)\];/);
  const required = reqBlock
    ? [...reqBlock[1].matchAll(/'([A-Z0-9_]+)'/g)].map((m) => m[1])
    : [];
  const exampleKeys = new Set(
    read('.env.example')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'))
      .map((l) => l.slice(0, l.indexOf('=')).trim())
      .filter(Boolean)
  );
  const missing = required.filter((k) => !exampleKeys.has(k));
  if (missing.length)
    problems.push(`clone:setup REQUIRED keys missing from .env.example: ${missing.join(', ')}`);
  else console.log(`✓ clone:setup REQUIRED env keys (${required.length}) all documented in .env.example.`);
} catch (e) {
  problems.push(`Could not cross-check env keys: ${e.message}`);
}

// ── Result ──────────────────────────────────────────────────────────────────
if (problems.length) {
  console.error('\n❌ SETUP SYSTEM OUT OF SYNC — fix before commit/build:');
  for (const p of problems) console.error(`   • ${p}`);
  console.error('\nSee RULE SYNC1 (agent-rules/05-database-supabase.md) — Definition of Done for migrations/features.');
  process.exit(1);
}
console.log('\n✅ Setup system in sync (schema + triggers + env docs).');
process.exit(0);
