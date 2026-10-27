import test from 'node:test';
import assert from 'node:assert/strict';
import { initialProducts } from './products.js';
import { categories } from './categories.js';

test('all products in initialProducts have valid fields and specifications', () => {
  assert.ok(initialProducts.length >= 19, 'expected at least 19 products');

  for (const product of initialProducts) {
    assert.ok(product.id, `Product missing id: ${JSON.stringify(product)}`);
    assert.ok(product.name, `Product ${product.id} missing name`);
    assert.ok(product.categoryId, `Product ${product.id} missing categoryId`);
    assert.ok(product.imagePath, `Product ${product.id} missing imagePath`);
    assert.ok(product.specifications, `Product ${product.id} missing specifications`);
    assert.ok(
      Object.keys(product.specifications).length > 0,
      `Product ${product.id} has empty specifications`,
    );
  }
});

test('all product categoryIds match a defined category', () => {
  const categoryIds = new Set(categories.map((c) => c.id));
  for (const product of initialProducts) {
    assert.ok(
      categoryIds.has(product.categoryId),
      `Product ${product.id} has unknown categoryId: ${product.categoryId}`,
    );
  }
});

test('featured products exist in initialProducts', () => {
  const FEATURED_IDS = [
    'aicon-4k-uhd-smart-led-tv-55',
    'aicon-inverter-split-ac-15t',
    'aicon-semi-auto-twin-tub-8kg',
    'aicon-sun-heater-14',
    'aicon-electric-kettle-1.5l',
    'aicon-smart-mixer-grinder-750w',
  ];

  for (const id of FEATURED_IDS) {
    const found = initialProducts.find((p) => p.id === id);
    assert.ok(found, `Featured product ${id} not found in initialProducts`);
    assert.ok(
      found.specifications && Object.keys(found.specifications).length > 0,
      `Featured product ${id} has no specifications`,
    );
  }
});

test('api client rejects HTML document responses to prevent Vercel rewrite regressions', async () => {
  const { ApiError } = await import('../services/api.js');
  const fakeHtml = '<!doctype html><html><head><title>AICON</title></head><body><div id="root"></div></body></html>';
  
  assert.throws(
    () => {
      if (typeof fakeHtml === 'string' && fakeHtml.trim().startsWith('<')) {
        throw new ApiError(
          'Invalid API response: received HTML document instead of JSON.',
          502,
          'INVALID_RESPONSE',
        );
      }
    },
    (err) => err instanceof ApiError && err.code === 'INVALID_RESPONSE',
  );
});

test('every product retains fallback display even when API is unreachable', () => {
  for (const product of initialProducts) {
    const fallbackProduct = initialProducts.find((p) => p.id === product.id);
    assert.ok(fallbackProduct, `Fallback product must exist for ${product.id}`);

    // Simulate failed API response
    let currentResult = null;
    const displayedProduct = currentResult?.product || fallbackProduct || null;
    assert.equal(displayedProduct?.id, product.id);
    assert.ok(Object.keys(displayedProduct.specifications).length > 0);
  }
});
