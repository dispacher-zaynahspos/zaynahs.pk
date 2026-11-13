/**
 * Independence + applySort unit tests for the unified sorting system.
 * Framework-free: run with `node __tests__/sorting/sortOptions.test.mjs`.
 * Imports the source directly via Node's TS type-stripping (Node >= 22.6).
 *
 * Proves (RULE SORT1/SORT2):
 *  - applySort is pure, stable, deterministic, alias-safe.
 *  - manual mode uses per-category manualPositions (NOT the global sort_order)
 *    when provided → category A order independent of category B order.
 */

import assert from 'node:assert';
import {
  applySort,
  normalizeSortKey,
  getSortLabel,
  SORT_OPTIONS,
} from '../../lib/sorting/sortOptions.ts';

let passed = 0;
function test(name, fn) {
  fn();
  passed++;
  console.log(`  ✓ ${name}`);
}

const P = (id, over = {}) => ({
  id,
  name: id,
  price: 0,
  created_at: '2026-01-01T00:00:00Z',
  sort_order: 0,
  ...over,
});

console.log('applySort / sortOptions');

test('SORT_OPTIONS has the 9 canonical keys', () => {
  assert.deepStrictEqual(
    SORT_OPTIONS.map((o) => o.value),
    ['manual', 'featured', 'best_selling', 'newest', 'oldest', 'price_desc', 'price_asc', 'alpha_asc', 'alpha_desc']
  );
});

test('normalizeSortKey maps spec + legacy aliases', () => {
  assert.strictEqual(normalizeSortKey('name_asc'), 'alpha_asc');
  assert.strictEqual(normalizeSortKey('name_desc'), 'alpha_desc');
  assert.strictEqual(normalizeSortKey('created-desc'), 'newest');
  assert.strictEqual(normalizeSortKey('price_low'), 'price_asc');
  assert.strictEqual(normalizeSortKey('recent'), 'newest');
  assert.strictEqual(normalizeSortKey('all'), 'manual');
  assert.strictEqual(normalizeSortKey('most_relevant'), 'featured');
  assert.strictEqual(normalizeSortKey('relevance'), 'featured');
  assert.strictEqual(normalizeSortKey('popular'), 'best_selling');
  assert.strictEqual(normalizeSortKey('most_selling'), 'best_selling');
  assert.strictEqual(normalizeSortKey(undefined), 'manual');
  assert.strictEqual(normalizeSortKey('garbage'), 'manual');
});

test('getSortLabel resolves through aliases', () => {
  assert.strictEqual(getSortLabel('name_asc'), 'Alphabetically: A-Z');
  assert.strictEqual(getSortLabel('price_desc'), 'Price: High to Low');
  assert.strictEqual(getSortLabel('popular'), 'Best Selling');
  assert.strictEqual(getSortLabel('relevance'), 'Featured / Most Relevant');
});

test('featured sorts by is_featured, reviews, and rating', () => {
  const items = [
    P('regular', { is_featured: false, reviews_count: 5 }),
    P('featured_top', { is_featured: true, reviews_count: 10 }),
    P('featured_low', { is_featured: true, reviews_count: 2 }),
  ];
  assert.deepStrictEqual(
    applySort(items, 'featured').map((x) => x.id),
    ['featured_top', 'featured_low', 'regular']
  );
});

test('best_selling sorts by sales_count and reviews_count', () => {
  const items = [
    P('low_sales', { sales_count: 2, reviews_count: 1 }),
    P('high_sales', { sales_count: 50, reviews_count: 10 }),
    P('mid_sales', { sales_count: 15, reviews_count: 4 }),
  ];
  assert.deepStrictEqual(
    applySort(items, 'best_selling').map((x) => x.id),
    ['high_sales', 'mid_sales', 'low_sales']
  );
});

test('applySort does not mutate input', () => {
  const input = [P('b', { price: 2 }), P('a', { price: 1 })];
  const copy = [...input];
  applySort(input, 'price_asc');
  assert.deepStrictEqual(input, copy);
});

test('price_asc / price_desc', () => {
  const items = [P('a', { price: 30 }), P('b', { price: 10 }), P('c', { price: 20 })];
  assert.deepStrictEqual(applySort(items, 'price_asc').map((x) => x.id), ['b', 'c', 'a']);
  assert.deepStrictEqual(applySort(items, 'price_desc').map((x) => x.id), ['a', 'c', 'b']);
});

test('alpha_asc / alpha_desc', () => {
  const items = [P('Banana'), P('apple'), P('Cherry')];
  assert.deepStrictEqual(applySort(items, 'alpha_asc').map((x) => x.id), ['apple', 'Banana', 'Cherry']);
  assert.deepStrictEqual(applySort(items, 'alpha_desc').map((x) => x.id), ['Cherry', 'Banana', 'apple']);
});

test('newest / oldest by created_at', () => {
  const items = [
    P('old', { created_at: '2020-01-01T00:00:00Z' }),
    P('new', { created_at: '2026-01-01T00:00:00Z' }),
    P('mid', { created_at: '2023-01-01T00:00:00Z' }),
  ];
  assert.deepStrictEqual(applySort(items, 'newest').map((x) => x.id), ['new', 'mid', 'old']);
  assert.deepStrictEqual(applySort(items, 'oldest').map((x) => x.id), ['old', 'mid', 'new']);
});

test('stable id tiebreaker on equal keys', () => {
  const items = [P('z', { price: 5 }), P('a', { price: 5 }), P('m', { price: 5 })];
  // equal price → deterministic id asc
  assert.deepStrictEqual(applySort(items, 'price_asc').map((x) => x.id), ['a', 'm', 'z']);
});

test('manual uses per-category manualPositions (not global sort_order)', () => {
  // Same products, DIFFERENT per-category order maps → independent results.
  const items = [P('p1', { sort_order: 1 }), P('p2', { sort_order: 2 }), P('p3', { sort_order: 3 })];
  const categoryA = { p1: 1, p2: 2, p3: 3 };
  const categoryB = { p1: 3, p2: 1, p3: 2 };
  assert.deepStrictEqual(applySort(items, 'manual', categoryA).map((x) => x.id), ['p1', 'p2', 'p3']);
  assert.deepStrictEqual(applySort(items, 'manual', categoryB).map((x) => x.id), ['p2', 'p3', 'p1']);
  // Reordering category B must NOT have changed category A's result (independence).
  assert.deepStrictEqual(applySort(items, 'manual', categoryA).map((x) => x.id), ['p1', 'p2', 'p3']);
});

test('manual falls back to sort_order when no positions provided', () => {
  const items = [P('a', { sort_order: 3 }), P('b', { sort_order: 1 }), P('c', { sort_order: 2 })];
  assert.deepStrictEqual(applySort(items, 'manual').map((x) => x.id), ['b', 'c', 'a']);
});

console.log(`\n✅ ${passed} tests passed\n`);
