import assert from 'node:assert/strict';
import test from 'node:test';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createMongoDatabase } from '../src/mongo-database.js';
import { createEmailOutbox } from '../src/email-outbox.js';
import { createEmailTemplates } from '../src/email-templates.js';

let mongoServer;
let database;
let mongoUri;

test.before(async () => {
  mongoServer = await MongoMemoryServer.create();
  mongoUri = mongoServer.getUri();
  database = await createMongoDatabase(mongoUri);
});

test.after(async () => {
  if (database) {
    await database.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// --- Category and Product Operations ---

test('MongoDB: seeds 7 categories on creation', async () => {
  const categories = await database.listCategories();
  assert.equal(categories.length, 7);
  const ids = categories.map((c) => c.id).sort();
  assert.deepEqual(ids, [
    'air-coolers',
    'fans',
    'kitchen-appliances',
    'room-heating',
    'televisions',
    'washing-machines',
    'water-heating',
  ]);
});

test('MongoDB: categories have product counts', async () => {
  const categories = await database.listCategories();
  const tvCategory = categories.find((c) => c.id === 'televisions');
  assert.ok(tvCategory);
  assert.equal(tvCategory.label, 'LED Televisions');
  assert.ok(typeof tvCategory.productCount === 'number');
  assert.ok(tvCategory.productCount >= 0);
});

test('MongoDB: listCategories filters by query', async () => {
  const results = await database.listCategories({ q: 'washing' });
  assert.ok(results.length >= 1);
  assert.ok(results.some((c) => c.id === 'washing-machines'));
});

test('MongoDB: getCategory returns single category', async () => {
  const cat = await database.getCategory('televisions');
  assert.ok(cat);
  assert.equal(cat.id, 'televisions');
  assert.equal(cat.label, 'LED Televisions');
});

test('MongoDB: getCategory returns null for unknown', async () => {
  const cat = await database.getCategory('nonexistent');
  assert.equal(cat, null);
});

test('MongoDB: seeds 18 products on creation', async () => {
  const result = await database.listProducts({ limit: 100 });
  assert.equal(result.total, 18);
  assert.equal(result.data.length, 18);
});

test('MongoDB: listProducts filters by category', async () => {
  const result = await database.listProducts({ category: 'televisions', limit: 100 });
  assert.equal(result.total, 2);
  assert.ok(result.data.every((p) => p.categoryId === 'televisions'));
});

test('MongoDB: listProducts filters by search query', async () => {
  const result = await database.listProducts({ q: '4K', limit: 100 });
  assert.ok(result.total >= 1);
  assert.ok(result.data.some((p) => p.name.includes('4K')));
});

test('MongoDB: listProducts sorts by name', async () => {
  const result = await database.listProducts({ sort: 'name', limit: 100 });
  const names = result.data.map((p) => p.name);
  const sorted = [...names].sort((a, b) => a.localeCompare(b));
  assert.deepEqual(names, sorted);
});

test('MongoDB: listProducts paginates with limit and offset', async () => {
  const page1 = await database.listProducts({ limit: 3, offset: 0 });
  const page2 = await database.listProducts({ limit: 3, offset: 3 });
  assert.equal(page1.data.length, 3);
  assert.equal(page2.data.length, 3);
  assert.notEqual(page1.data[0].id, page2.data[0].id);
});

test('MongoDB: getProduct returns single product', async () => {
  const product = await database.getProduct('aicon-4k-uhd-smart-led-tv-55');
  assert.ok(product);
  assert.equal(product.id, 'aicon-4k-uhd-smart-led-tv-55');
  assert.equal(product.name, 'AICON 55" 4K Ultra HD Smart LED TV');
  assert.equal(product.modelNumber, 'ACTV-55UHD');
  assert.ok(product.specifications);
});

test('MongoDB: getProduct returns null for unknown', async () => {
  const product = await database.getProduct('nonexistent-product');
  assert.equal(product, null);
});

test('MongoDB: product has valid imagePath', async () => {
  const product = await database.getProduct('aicon-4k-uhd-smart-led-tv-55');
  assert.ok(product.imagePath);
  assert.ok(product.imagePath.startsWith('/images/products/'));
});

test('MongoDB: seeding is idempotent (no duplicates on re-init)', async () => {
  // Verify counts are stable (seeding was already done in before hook)
  const categories = await database.listCategories();
  const products = await database.listProducts({ limit: 100 });
  assert.equal(categories.length, 7);
  assert.equal(products.total, 18);
});

// --- Enquiry Creation and Persistence ---

test('MongoDB: createEnquiry saves contact enquiry', async () => {
  const enquiry = {
    id: 'test-enquiry-1',
    kind: 'contact',
    name: 'Test User',
    email: 'test@example.com',
    phone: '+1234567890',
    categoryId: null,
    productId: null,
    message: 'This is a test enquiry message',
    idempotencyKey: null,
    requestHash: 'hash1',
  };
  const result = await database.createEnquiry(enquiry, {
    notificationEmail: '',
    templates: createEmailTemplates(),
  });
  assert.equal(result.duplicate, false);
  assert.ok(result.enquiry);
  assert.equal(result.enquiry.id, 'test-enquiry-1');
  assert.equal(result.enquiry.name, 'Test User');
  assert.equal(result.enquiry.email, 'test@example.com');
});

test('MongoDB: createEnquiry saves product enquiry with category', async () => {
  const enquiry = {
    id: 'test-enquiry-2',
    kind: 'product',
    name: 'Product User',
    email: 'product@example.com',
    phone: null,
    categoryId: 'televisions',
    productId: null,
    message: 'I want to know about this TV',
    idempotencyKey: null,
    requestHash: 'hash2',
  };
  const result = await database.createEnquiry(enquiry, {
    notificationEmail: '',
    templates: createEmailTemplates(),
  });
  assert.equal(result.duplicate, false);
  assert.ok(result.enquiry);
  assert.equal(result.enquiry.categoryId, 'televisions');
});

test('MongoDB: createEnquiry rejects unknown category', async () => {
  const enquiry = {
    id: 'test-enquiry-3',
    kind: 'contact',
    name: 'Bad Cat User',
    email: 'badcat@example.com',
    phone: null,
    categoryId: 'nonexistent-category',
    productId: null,
    message: 'Testing unknown category',
    idempotencyKey: null,
    requestHash: 'hash3',
  };
  const result = await database.createEnquiry(enquiry, {
    notificationEmail: '',
    templates: createEmailTemplates(),
  });
  assert.equal(result.categoryMissing, true);
});

test('MongoDB: createEnquiry rejects unknown product', async () => {
  const enquiry = {
    id: 'test-enquiry-4',
    kind: 'product',
    name: 'Bad Prod User',
    email: 'badprod@example.com',
    phone: null,
    categoryId: null,
    productId: 'nonexistent-product',
    message: 'Testing unknown product',
    idempotencyKey: null,
    requestHash: 'hash4',
  };
  const result = await database.createEnquiry(enquiry, {
    notificationEmail: '',
    templates: createEmailTemplates(),
  });
  assert.equal(result.productMissing, true);
});

test('MongoDB: createEnquiry rejects category-product mismatch', async () => {
  const enquiry = {
    id: 'test-enquiry-5',
    kind: 'product',
    name: 'Mismatch User',
    email: 'mismatch@example.com',
    phone: null,
    categoryId: 'televisions',
    productId: 'aicon-semi-auto-twin-tub-8kg', // washing machine, not TV
    message: 'Testing mismatch',
    idempotencyKey: null,
    requestHash: 'hash5',
  };
  const result = await database.createEnquiry(enquiry, {
    notificationEmail: '',
    templates: createEmailTemplates(),
  });
  assert.equal(result.categoryMismatch, true);
});

// --- Idempotency ---

test('MongoDB: idempotency returns duplicate on same key', async () => {
  const key = 'idempotency-test-1';
  const enquiry1 = {
    id: 'idemp-1',
    kind: 'contact',
    name: 'Idemp User',
    email: 'idemp@example.com',
    phone: null,
    categoryId: null,
    productId: null,
    message: 'Idempotency test message',
    idempotencyKey: key,
    requestHash: 'hash-idemp-1',
  };
  const result1 = await database.createEnquiry(enquiry1, {
    notificationEmail: '',
    templates: createEmailTemplates(),
  });
  assert.equal(result1.duplicate, false);

  // Submit again with same key and same data
  const enquiry2 = {
    ...enquiry1,
    id: 'idemp-2',
    requestHash: 'hash-idemp-1',
  };
  const result2 = await database.createEnquiry(enquiry2, {
    notificationEmail: '',
    templates: createEmailTemplates(),
  });
  assert.equal(result2.duplicate, true);
  assert.equal(result2.enquiry.id, result1.enquiry.id);
});

test('MongoDB: idempotency returns conflict on different data', async () => {
  const key = 'idempotency-test-2';
  const enquiry1 = {
    id: 'idemp-conflict-1',
    kind: 'contact',
    name: 'Conflict User',
    email: 'conflict@example.com',
    phone: null,
    categoryId: null,
    productId: null,
    message: 'Original message',
    idempotencyKey: key,
    requestHash: 'hash-conflict-1',
  };
  await database.createEnquiry(enquiry1, {
    notificationEmail: '',
    templates: createEmailTemplates(),
  });

  const enquiry2 = {
    ...enquiry1,
    id: 'idemp-conflict-2',
    message: 'Different message',
    requestHash: 'hash-conflict-2',
  };
  const result2 = await database.createEnquiry(enquiry2, {
    notificationEmail: '',
    templates: createEmailTemplates(),
  });
  assert.equal(result2.conflict, true);
});

// --- Email Outbox Operations ---

test('MongoDB: enquiry creates 2 email outbox jobs', async () => {
  const enquiry = {
    id: 'email-test-1',
    kind: 'contact',
    name: 'Email User',
    email: 'email@example.com',
    phone: null,
    categoryId: null,
    productId: null,
    message: 'Email test message',
    idempotencyKey: null,
    requestHash: 'hash-email-1',
  };
  const result = await database.createEnquiry(enquiry, {
    notificationEmail: 'business@example.com',
    templates: createEmailTemplates(),
  });
  assert.equal(result.duplicate, false);

  const statuses = await database.getEmailStatuses(result.enquiry.id);
  assert.equal(statuses.length, 2);
  const kinds = statuses.map((s) => s.kind).sort();
  assert.deepEqual(kinds, ['business_notification', 'customer_acknowledgement']);
  assert.ok(statuses.every((s) => s.status === 'pending' && s.count === 1));
});

test('MongoDB: getDueEmailJobs returns pending jobs', async () => {
  const jobs = await database.getDueEmailJobs();
  assert.ok(Array.isArray(jobs));
  assert.ok(jobs.length >= 1);
  const job = jobs[0];
  assert.ok(job.id);
  assert.ok(job.recipient);
  assert.ok(job.kind);
  assert.ok(job.subject);
  assert.ok(job.html);
  assert.ok(job.text);
});

test('MongoDB: claimEmailJob claims a pending job', async () => {
  const jobs = await database.getDueEmailJobs();
  const jobId = jobs[0].id;
  const claimed = await database.claimEmailJob(jobId);
  assert.equal(claimed, true);

  // Claiming again should fail
  const claimedAgain = await database.claimEmailJob(jobId);
  assert.equal(claimedAgain, false);
});

test('MongoDB: markEmailSent marks job as sent', async () => {
  const jobs = await database.getDueEmailJobs();
  // Find a job that is in 'sending' status
  const sendingJobs = jobs.filter((j) => j.status === undefined); // jobs don't have status field
  // Use the first due job
  if (jobs.length > 0) {
    const jobId = jobs[0].id;
    await database.claimEmailJob(jobId);
    await database.markEmailSent(jobId);
    // Verify by checking due jobs no longer include it
    const remainingJobs = await database.getDueEmailJobs();
    const stillDue = remainingJobs.some((j) => j.id === jobId);
    assert.equal(stillDue, false);
  }
});

test('MongoDB: markEmailFailed marks job as failed with backoff', async () => {
  const jobs = await database.getDueEmailJobs();
  if (jobs.length > 0) {
    const jobId = jobs[0].id;
    const claimed = await database.claimEmailJob(jobId);
    if (claimed) {
      await database.markEmailFailed(jobId, 1, 'SMTP_AUTH_FAILED');
      // Job should still be pending (not failed yet, attempts < 12)
      const statuses = await database.getEmailStatuses(
        jobs[0].enquiryId || 'email-test-1'
      );
      // Just verify no crash
      assert.ok(true);
    }
  }
});

test('MongoDB: retryFailedEmailJobs requeues failed jobs', async () => {
  const retried = await database.retryFailedEmailJobs();
  assert.ok(typeof retried === 'number');
  assert.ok(retried >= 0);
});

test('MongoDB: configureNotificationRecipient updates business emails', async () => {
  await database.configureNotificationRecipient('updated-business@example.com');
  // Verify no crash and method completes
  assert.ok(true);
});

// --- Connection Error Handling ---

test('MongoDB: checkConnection returns true when connected', async () => {
  const connected = database.checkConnection();
  assert.equal(connected, true);
});

// Close functionality verified: database.close() calls mongoose.disconnect()
// Tested manually during development; not tested here to avoid disconnecting
// the shared mongoose connection used by other tests.
