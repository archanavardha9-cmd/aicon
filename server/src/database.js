import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { categories } from '../../client/src/data/categories.js';
import { initialProducts } from '../../client/src/data/products.js';

const schema = `
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;
  PRAGMA busy_timeout = 5000;

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL UNIQUE,
    terms TEXT NOT NULL DEFAULT '',
    icon TEXT NOT NULL,
    tone TEXT NOT NULL,
    image TEXT,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL REFERENCES categories(id),
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    model_number TEXT,
    image_path TEXT,
    specifications_json TEXT NOT NULL DEFAULT '{}',
    active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );

  CREATE INDEX IF NOT EXISTS products_category_active
    ON products(category_id, active, name);

  CREATE TABLE IF NOT EXISTS enquiries (
    id TEXT PRIMARY KEY,
    kind TEXT NOT NULL CHECK (kind IN ('contact', 'product')),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    category_id TEXT REFERENCES categories(id),
    product_id TEXT REFERENCES products(id),
    message TEXT NOT NULL,
    idempotency_key TEXT UNIQUE,
    request_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );

  CREATE INDEX IF NOT EXISTS enquiries_created_at ON enquiries(created_at);

  CREATE TABLE IF NOT EXISTS email_outbox (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    enquiry_id TEXT NOT NULL REFERENCES enquiries(id),
    recipient TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('business_notification', 'customer_acknowledgement')),
    subject TEXT NOT NULL,
    html TEXT NOT NULL,
    text TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed')),
    attempts INTEGER NOT NULL DEFAULT 0,
    next_attempt_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    last_error TEXT,
    sent_at TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    UNIQUE (enquiry_id, kind, recipient)
  );

  CREATE INDEX IF NOT EXISTS email_outbox_due
    ON email_outbox(status, next_attempt_at);
`;

function serializeProduct(row) {
  const pathSegments = row.imagePath?.split('/') ?? [];
  const imagePath = row.imagePath &&
    /^\/images\/products\/[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(row.imagePath) &&
    !pathSegments.includes('..') &&
    !row.imagePath.includes('//')
    ? row.imagePath
    : null;

  return {
    ...row,
    imagePath,
    specifications: JSON.parse(row.specifications_json),
    specifications_json: undefined,
    active: Boolean(row.active),
  };
}

export function createDatabase(databasePath, { recoverInterruptedJobs = true } = {}) {
  if (databasePath !== ':memory:') {
    fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  }

  const db = new Database(databasePath);
  db.exec(schema);

  const seedCategory = db.prepare(`
    INSERT INTO categories (id, label, terms, icon, tone, image, description)
    VALUES (@id, @label, @terms, @icon, @tone, @image, @description)
    ON CONFLICT(id) DO UPDATE SET
      label = excluded.label,
      terms = excluded.terms,
      icon = excluded.icon,
      tone = excluded.tone,
      image = excluded.image,
      description = excluded.description
  `);
  const seedCategories = db.transaction((items) => {
    for (const category of items) {
      seedCategory.run(category);
    }
  });
  seedCategories(categories);

  const seedProduct = db.prepare(`
    INSERT INTO products (
      id, category_id, name, description, model_number, image_path, specifications_json, active
    )
    VALUES (
      @id, @categoryId, @name, @description, @modelNumber, @imagePath, @specificationsJson, 1
    )
    ON CONFLICT(id) DO UPDATE SET
      category_id = excluded.category_id,
      name = excluded.name,
      description = excluded.description,
      model_number = excluded.model_number,
      image_path = excluded.image_path,
      specifications_json = excluded.specifications_json,
      active = excluded.active,
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  `);
  const seedProducts = db.transaction((items) => {
    for (const item of items) {
      seedProduct.run({
        id: item.id,
        categoryId: item.categoryId,
        name: item.name,
        description: item.description,
        modelNumber: item.modelNumber || null,
        imagePath: item.imagePath || null,
        specificationsJson: JSON.stringify(item.specifications || {}),
      });
    }
  });
  seedProducts(initialProducts);

  if (recoverInterruptedJobs) {
    db.prepare("UPDATE email_outbox SET status = 'pending' WHERE status = 'sending'").run();
  }

  const categoryStatements = {
    list: db.prepare(`
      SELECT c.id, c.label, c.terms, c.icon, c.tone, c.image, c.description,
        (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.active = 1) AS productCount
      FROM categories c
      WHERE (@category = '' OR c.id = @category)
        AND (@query = '' OR lower(c.label || ' ' || c.terms) LIKE @pattern ESCAPE '\\')
      ORDER BY c.label COLLATE NOCASE
    `),
    find: db.prepare('SELECT id, label, terms, icon, tone, image, description FROM categories WHERE id = ?'),
  };

  const productStatements = {
    list: db.prepare(`
      SELECT p.id, p.category_id AS categoryId, c.label AS category, p.name,
        p.description, p.model_number AS modelNumber, p.image_path AS imagePath,
        p.specifications_json, p.created_at AS createdAt, p.updated_at AS updatedAt
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.active = 1
        AND (@category = '' OR p.category_id = @category)
        AND (@query = '' OR lower(p.name || ' ' || p.description || ' ' || coalesce(p.model_number, '')) LIKE @pattern ESCAPE '\\')
      ORDER BY CASE WHEN @sort = 'newest' THEN p.created_at END DESC,
        CASE WHEN @sort = 'name' THEN p.name END COLLATE NOCASE ASC
      LIMIT @limit OFFSET @offset
    `),
    count: db.prepare(`
      SELECT COUNT(*) AS total
      FROM products p
      WHERE p.active = 1
        AND (@category = '' OR p.category_id = @category)
        AND (@query = '' OR lower(p.name || ' ' || p.description || ' ' || coalesce(p.model_number, '')) LIKE @pattern ESCAPE '\\')
    `),
    find: db.prepare(`
      SELECT p.id, p.category_id AS categoryId, c.label AS category, p.name,
        p.description, p.model_number AS modelNumber, p.image_path AS imagePath,
        p.specifications_json, p.created_at AS createdAt, p.updated_at AS updatedAt
      FROM products p JOIN categories c ON c.id = p.category_id
      WHERE p.id = ? AND p.active = 1
    `),
  };

  const enquiryStatements = {
    insert: db.prepare(`
      INSERT INTO enquiries (
        id, kind, name, email, phone, category_id, product_id,
        message, idempotency_key, request_hash
      )
      VALUES (
        @id, @kind, @name, @email, @phone, @categoryId, @productId,
        @message, @idempotencyKey, @requestHash
      )
    `),
    findByIdempotencyKey: db.prepare(`
      SELECT id, request_hash AS requestHash FROM enquiries WHERE idempotency_key = ?
    `),
    find: db.prepare(`
      SELECT e.id, e.kind, e.name, e.email, e.phone, e.category_id AS categoryId,
        c.label AS category, e.product_id AS productId, p.name AS product,
        e.message, e.created_at AS createdAt
      FROM enquiries e
      LEFT JOIN categories c ON c.id = e.category_id
      LEFT JOIN products p ON p.id = e.product_id
      WHERE e.id = ?
    `),
  };

  const outboxStatements = {
    enqueue: db.prepare(`
      INSERT OR IGNORE INTO email_outbox (enquiry_id, recipient, kind, subject, html, text)
      VALUES (@enquiryId, @recipient, @kind, @subject, @html, @text)
    `),
    due: db.prepare(`
      SELECT id, enquiry_id AS enquiryId, recipient, kind, subject, html, text, attempts
      FROM email_outbox
      WHERE status IN ('pending', 'failed')
        AND attempts < 12
        AND next_attempt_at <= strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      ORDER BY id
      LIMIT 20
    `),
    claim: db.prepare(`
      UPDATE email_outbox
      SET status = 'sending', attempts = attempts + 1, last_error = NULL
      WHERE id = @id AND status IN ('pending', 'failed')
    `),
    sent: db.prepare(`
      UPDATE email_outbox
      SET status = 'sent', sent_at = @now, last_error = NULL
      WHERE id = @id AND status = 'sending'
    `),
    failed: db.prepare(`
      UPDATE email_outbox
      SET status = CASE WHEN attempts >= 12 THEN 'failed' ELSE 'pending' END,
        next_attempt_at = @nextAttemptAt, last_error = @lastError
      WHERE id = @id AND status = 'sending'
    `),
    statuses: db.prepare(`
      SELECT kind, status, COUNT(*) AS count
      FROM email_outbox
      WHERE enquiry_id = ?
      GROUP BY kind, status
    `),
    retryFailed: db.prepare(`
      UPDATE email_outbox
      SET status = 'pending', attempts = 0, last_error = NULL,
        next_attempt_at = @now
      WHERE status = 'failed'
    `),
  };

  const createEnquiry = db.transaction((input, { notificationEmail, templates }) => {
    const duplicate = input.idempotencyKey
      ? enquiryStatements.findByIdempotencyKey.get(input.idempotencyKey)
      : null;

    if (duplicate) {
      if (duplicate.requestHash !== input.requestHash) {
        return { conflict: true };
      }

      return { enquiry: enquiryStatements.find.get(duplicate.id), duplicate: true };
    }

    if (input.categoryId && !categoryStatements.find.get(input.categoryId)) {
      return { categoryMissing: true };
    }

    if (input.productId && !productStatements.find.get(input.productId)) {
      return { productMissing: true };
    }

    if (input.categoryId && input.productId) {
      const product = productStatements.find.get(input.productId);

      if (product.categoryId !== input.categoryId) {
        return { categoryMismatch: true };
      }
    }

    enquiryStatements.insert.run(input);
    const enquiry = enquiryStatements.find.get(input.id);
    const notification = templates.business(enquiry);
    outboxStatements.enqueue.run({
      enquiryId: enquiry.id,
      recipient: notificationEmail || '',
      kind: 'business_notification',
      ...notification,
    });

    const acknowledgement = templates.customer(enquiry);
    outboxStatements.enqueue.run({
      enquiryId: enquiry.id,
      recipient: enquiry.email,
      kind: 'customer_acknowledgement',
      ...acknowledgement,
    });

    return { enquiry, duplicate: false };
  });

  return {
    close: () => db.close(),
    checkConnection: () => db.prepare('SELECT 1 AS connected').get().connected === 1,
    listCategories: ({ q = '', query = '', category = '' } = {}) => {
      const normalizedQuery = (q || query).trim().toLowerCase();
      return categoryStatements.list.all({
        query: normalizedQuery,
        category,
        pattern: `%${normalizedQuery.replace(/[\\%_]/g, '\\$&')}%`,
      });
    },
    getCategory: (id) => categoryStatements.find.get(id),
    listProducts: ({ q = '', query = '', category = '', sort = 'name', limit = 24, offset = 0 } = {}) => {
      const normalizedQuery = (q || query).trim().toLowerCase();
      const filter = {
        category,
        sort,
        limit,
        offset,
        query: normalizedQuery,
        pattern: `%${normalizedQuery.replace(/[\\%_]/g, '\\$&')}%`,
      };

      return {
        data: productStatements.list.all(filter).map(serializeProduct),
        total: productStatements.count.get(filter).total,
      };
    },
    getProduct: (id) => {
      const product = productStatements.find.get(id);
      return product ? serializeProduct(product) : null;
    },
    createEnquiry,
    getEmailStatuses: (enquiryId) => outboxStatements.statuses.all(enquiryId),
    configureNotificationRecipient: (recipient) => {
      if (recipient) {
        db.prepare(`
          UPDATE email_outbox
          SET recipient = @recipient
          WHERE kind = 'business_notification' AND recipient = ''
        `).run({ recipient });
      }
    },
    getDueEmailJobs: () => outboxStatements.due.all(),
    claimEmailJob: (id) => outboxStatements.claim.run({ id }).changes === 1,
    markEmailSent: (id) => outboxStatements.sent.run({ id, now: new Date().toISOString() }),
    markEmailFailed: (id, attempts, errorCode) => {
      const delayMs = Math.min(12 * 60 * 60 * 1000, 30_000 * 2 ** Math.max(0, attempts - 1));
      outboxStatements.failed.run({
        id,
        nextAttemptAt: new Date(Date.now() + delayMs).toISOString(),
        lastError: String(errorCode || 'SMTP_DELIVERY_FAILED').slice(0, 100),
      });
    },
    retryFailedEmailJobs: () =>
      outboxStatements.retryFailed.run({ now: new Date().toISOString() }).changes,
  };
}
