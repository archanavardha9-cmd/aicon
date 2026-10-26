import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import test from 'node:test';
import { createApp } from '../src/app.js';
import { createDatabase } from '../src/database.js';
import { createEmailOutbox } from '../src/email-outbox.js';
import { createEmailTemplates } from '../src/email-templates.js';

const smtpFreeConfig = {
  environment: 'test',
  clientOrigins: ['http://localhost:5173'],
  clientDirectory: process.cwd(),
  smtp: null,
};

async function createTestServer(t, config = smtpFreeConfig, { persistent = false } = {}) {
  const directory = persistent
    ? fs.mkdtempSync(path.join(os.tmpdir(), 'aicon-api-'))
    : null;
  const databasePath = directory ? path.join(directory, 'test.sqlite') : ':memory:';
  const database = createDatabase(databasePath);
  const server = createApp({ database, config, logger: { error() {} } })
    .listen(0, '127.0.0.1');
  await once(server, 'listening');

  t.after(async () => {
    if (server.listening) {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
    if (database.open) {
      database.close();
    }
    if (directory) {
      fs.rmSync(directory, {
        recursive: true,
        force: true,
        maxRetries: 10,
        retryDelay: 100,
      });
    }
  });

  return {
    database,
    databasePath,
    baseUrl: `http://127.0.0.1:${server.address().port}`,
  };
}

async function sendJson(baseUrl, route, body, idempotencyKey) {
  return fetch(`${baseUrl}/api/${route}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
    body: JSON.stringify(body),
  });
}

const validContact = {
  name: 'Taylor Customer',
  email: 'taylor@example.com',
  message: 'Please send current product information.',
};

test('health and catalogue endpoints expose an honest empty product catalogue', async (t) => {
  const { baseUrl } = await createTestServer(t);

  const health = await fetch(`${baseUrl}/api/health`);
  assert.equal(health.status, 200);
  assert.deepEqual((await health.json()).data, {
    status: 'ok',
    database: 'connected',
    smtpConfigured: false,
  });

  const categories = await fetch(`${baseUrl}/api/categories`);
  assert.equal(categories.status, 200);
  assert.equal((await categories.json()).data.length, 9);

  const products = await fetch(`${baseUrl}/api/products?category=televisions&q=test`);
  assert.equal(products.status, 200);
  const productList = await products.json();
  assert.equal(productList.meta.total, 0);
  assert.deepEqual(productList.data, []);

  const product = await fetch(`${baseUrl}/api/products/not-a-published-product`);
  assert.equal(product.status, 404);

  const invalidCategory = await fetch(`${baseUrl}/api/products?category=unknown`);
  assert.equal(invalidCategory.status, 400);

  const missingRoute = await fetch(`${baseUrl}/api/not-a-route`);
  assert.equal(missingRoute.status, 404);
  assert.equal((await missingRoute.json()).error.code, 'ROUTE_NOT_FOUND');
});

test('contact enquiries are validated, idempotent, persisted, and queued', async (t) => {
  const { baseUrl, database, databasePath } = await createTestServer(
    t,
    smtpFreeConfig,
    { persistent: true },
  );
  const key = 'contact-123';

  const invalid = await sendJson(baseUrl, 'contact', { ...validContact, message: 'short' });
  assert.equal(invalid.status, 400);
  assert.equal((await invalid.json()).error.code, 'VALIDATION_ERROR');

  const saved = await sendJson(baseUrl, 'contact', validContact, key);
  assert.equal(saved.status, 202);
  const response = (await saved.json()).data;
  assert.equal(response.status, 'saved');
  assert.equal(response.notifications, 'pending_configuration');

  const duplicate = await sendJson(baseUrl, 'contact', validContact, key);
  assert.equal(duplicate.status, 202);
  assert.equal((await duplicate.json()).data.duplicate, true);

  const conflict = await sendJson(
    baseUrl,
    'contact',
    { ...validContact, message: 'Please send a different product catalogue.' },
    key,
  );
  assert.equal(conflict.status, 409);

  const statusesBeforeRestart = database.getEmailStatuses(response.id);
  assert.equal(statusesBeforeRestart.length, 2);
  assert.ok(statusesBeforeRestart.every((item) => item.status === 'pending' && item.count === 1));

  database.close();
  const restartedDatabase = createDatabase(databasePath);
  assert.equal(restartedDatabase.getEmailStatuses(response.id).length, 2);
  restartedDatabase.close();
});

test('product enquiries require and validate a known category or product', async (t) => {
  const { baseUrl } = await createTestServer(t);
  const missingReference = await sendJson(
    baseUrl,
    'enquiries',
    validContact,
    'missing-reference-1',
  );
  assert.equal(missingReference.status, 400);
  assert.equal((await missingReference.json()).error.code, 'PRODUCT_REFERENCE_REQUIRED');

  const valid = await sendJson(
    baseUrl,
    'enquiries',
    { ...validContact, categoryId: 'washing-machines' },
    'product-enquiry-123',
  );
  assert.equal(valid.status, 202);

  const invalidCategory = await sendJson(
    baseUrl,
    'enquiries',
    { ...validContact, categoryId: 'unknown-category' },
    'invalid-product-123',
  );
  assert.equal(invalidCategory.status, 400);
  assert.equal((await invalidCategory.json()).error.code, 'UNKNOWN_CATEGORY');
});

test('honeypot submissions are discarded and public forms are rate-limited', async (t) => {
  const { baseUrl } = await createTestServer(t);

  const trapped = await sendJson(
    baseUrl,
    'contact',
    { ...validContact, website: 'https://spam.example' },
    'honeypot-123',
  );
  assert.equal(trapped.status, 202);
  assert.equal((await trapped.json()).data.id, null);

  const accepted = await sendJson(baseUrl, 'contact', validContact, 'honeypot-123');
  assert.equal(accepted.status, 202);
  assert.equal((await accepted.json()).data.duplicate, false);

  for (let index = 0; index < 3; index += 1) {
    const result = await sendJson(
      baseUrl,
      'contact',
      { ...validContact, name: `Customer ${index}` },
      `rate-limit-${index}`,
    );
    assert.equal(result.status, 202);
  }

  const limited = await sendJson(
    baseUrl,
    'contact',
    { ...validContact, name: 'Customer fifth' },
    'rate-limit-final',
  );
  assert.equal(limited.status, 429);
});

test('API rejects browser requests from unconfigured origins', async (t) => {
  const { baseUrl } = await createTestServer(t);
  const response = await fetch(`${baseUrl}/api/categories`, {
    headers: { Origin: 'https://untrusted.example' },
  });
  assert.equal(response.status, 403);
  assert.equal((await response.json()).error.code, 'CORS_ORIGIN_DENIED');
});

test('customer-controlled email content is escaped in HTML templates', () => {
  const templates = createEmailTemplates();
  const acknowledgement = templates.customer({
    id: 'enquiry-123',
    name: '<img src=x onerror=alert(1)>',
    email: 'customer@example.com',
    category: null,
    product: null,
    message: '<script>alert(1)</script>',
    kind: 'contact',
  });

  assert.doesNotMatch(acknowledgement.html, /<script>/);
  assert.match(acknowledgement.html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(acknowledgement.text, /<script>alert\(1\)<\/script>/);
});

test('email outbox retains SMTP failures and delivers other queued notifications', async (t) => {
  const { baseUrl, database } = await createTestServer(t, {
    ...smtpFreeConfig,
    smtp: { notificationEmail: 'business@example.com' },
  });
  const submitted = await sendJson(baseUrl, 'contact', validContact, 'outbox-test-1');
  const enquiryId = (await submitted.json()).data.id;

  let failBusinessOnce = true;
  const deliveredRecipients = [];
  const outbox = createEmailOutbox({
    database,
    fromEmail: 'AICON <noreply@example.com>',
    transporter: {
      async sendMail(message) {
        deliveredRecipients.push(message.to);
        if (message.to === 'business@example.com' && failBusinessOnce) {
          failBusinessOnce = false;
          const error = new Error('SMTP credentials are unavailable.');
          error.code = 'EAUTH';
          throw error;
        }
      },
    },
    logger: { error() {} },
  });

  await outbox.processPending();
  assert.deepEqual(database.getEmailStatuses(enquiryId), [
    { kind: 'business_notification', status: 'pending', count: 1 },
    { kind: 'customer_acknowledgement', status: 'sent', count: 1 },
  ]);

  const secondSubmission = await sendJson(baseUrl, 'contact', {
    name: 'Morgan Customer',
    email: 'morgan@example.com',
    message: 'I would like current product information.',
  }, 'outbox-test-2');
  const secondEnquiryId = (await secondSubmission.json()).data.id;
  await outbox.processPending();
  assert.deepEqual(database.getEmailStatuses(secondEnquiryId), [
    { kind: 'business_notification', status: 'sent', count: 1 },
    { kind: 'customer_acknowledgement', status: 'sent', count: 1 },
  ]);
  assert.deepEqual(deliveredRecipients, [
    'business@example.com',
    'taylor@example.com',
    'business@example.com',
    'morgan@example.com',
  ]);
});
