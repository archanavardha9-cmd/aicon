import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import Database from 'better-sqlite3';
import { Category } from './models/Category.js';
import { Product } from './models/Product.js';
import { Enquiry } from './models/Enquiry.js';
import { EmailOutbox } from './models/EmailOutbox.js';

const serverDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export async function migrateSqliteToMongo({
  sqlitePath = path.resolve(serverDirectory, './data/aicon.sqlite'),
  mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aicon',
} = {}) {
  console.log(`Connecting to MongoDB at: ${mongoUri.replace(/:[^:]*@/, ':****@')}`);
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB.');

  const db = new Database(sqlitePath, { readonly: true });
  console.log(`Reading existing records from SQLite: ${sqlitePath}`);

  // 1. Migrate Categories
  const categories = db.prepare('SELECT id, label, terms, icon, tone FROM categories').all();
  console.log(`Migrating ${categories.length} categories...`);
  for (const cat of categories) {
    await Category.updateOne(
      { _id: cat.id },
      {
        $set: {
          label: cat.label,
          terms: cat.terms,
          icon: cat.icon,
          tone: cat.tone,
        },
      },
      { upsert: true }
    );
  }

  // 2. Migrate Products
  const products = db.prepare('SELECT id, category_id, name, description, model_number, image_path, specifications_json, active FROM products').all();
  console.log(`Migrating ${products.length} products...`);
  for (const p of products) {
    await Product.updateOne(
      { _id: p.id },
      {
        $set: {
          categoryId: p.category_id,
          name: p.name,
          description: p.description,
          modelNumber: p.model_number,
          imagePath: p.image_path,
          specifications: JSON.parse(p.specifications_json || '{}'),
          active: Boolean(p.active),
        },
      },
      { upsert: true }
    );
  }

  // 3. Migrate Enquiries
  const enquiries = db.prepare('SELECT id, kind, name, email, phone, category_id, product_id, message, idempotency_key, request_hash, created_at FROM enquiries').all();
  console.log(`Migrating ${enquiries.length} enquiries...`);
  for (const e of enquiries) {
    await Enquiry.updateOne(
      { _id: e.id },
      {
        $set: {
          kind: e.kind,
          name: e.name,
          email: e.email,
          phone: e.phone,
          categoryId: e.category_id,
          productId: e.product_id,
          message: e.message,
          idempotencyKey: e.idempotency_key,
          requestHash: e.request_hash,
          createdAt: new Date(e.created_at),
        },
      },
      { upsert: true }
    );
  }

  // 4. Migrate Email Outbox
  const outbox = db.prepare('SELECT enquiry_id, recipient, kind, subject, html, text, status, attempts, next_attempt_at, last_error, sent_at, created_at FROM email_outbox').all();
  console.log(`Migrating ${outbox.length} email outbox jobs...`);
  for (const o of outbox) {
    await EmailOutbox.updateOne(
      { enquiryId: o.enquiry_id, kind: o.kind, recipient: o.recipient },
      {
        $set: {
          subject: o.subject,
          html: o.html,
          text: o.text,
          status: o.status,
          attempts: o.attempts,
          nextAttemptAt: new Date(o.next_attempt_at),
          lastError: o.last_error,
          sentAt: o.sent_at ? new Date(o.sent_at) : null,
          createdAt: new Date(o.created_at),
        },
      },
      { upsert: true }
    );
  }

  db.close();
  console.log('Migration completed successfully.');
  await mongoose.disconnect();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrateSqliteToMongo().catch((err) => {
    console.error('Migration failed:', err.message);
    process.exit(1);
  });
}
