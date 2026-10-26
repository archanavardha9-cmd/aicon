import assert from 'node:assert/strict';
import test from 'node:test';
import { categories, filterCategories } from './categories.js';

test('category filters return only the selected category', () => {
  const results = filterCategories(categories, 'washing-machines');

  assert.deepEqual(
    results.map((category) => category.label),
    ['Washing Machines'],
  );
});

test('category search is case-insensitive and matches category terms', () => {
  assert.deepEqual(
    filterCategories(categories, 'all', 'LAUNDRY').map((category) => category.id),
    ['washing-machines'],
  );
});

test('an empty search returns the selected category set', () => {
  assert.equal(filterCategories(categories).length, categories.length);
});

test('unmatched searches return an empty result', () => {
  assert.deepEqual(filterCategories(categories, 'all', 'microwave'), []);
});
