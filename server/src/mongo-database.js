import mongoose from 'mongoose';
import { categories as seedCategoriesList } from '../../client/src/data/categories.js';
import { initialProducts as seedProductsList } from '../../client/src/data/products.js';

function serializeProduct(doc) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject({ virtuals: true }) : { ...doc };
  const pathSegments = obj.imagePath?.split('/') ?? [];
  const imagePath =
    obj.imagePath &&
    /^\/images\/products\/[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(obj.imagePath) &&
    !pathSegments.includes('..') &&
    !obj.imagePath.includes('//')
      ? obj.imagePath
      : null;

  return {
    id: obj.id || obj._id,
    categoryId: obj.categoryId,
    category: obj.category || obj.categoryLabel || '',
    name: obj.name,
    description: obj.description || '',
    modelNumber: obj.modelNumber || null,
    imagePath,
    specifications: obj.specifications || {},
    active: Boolean(obj.active),
    createdAt: obj.createdAt ? new Date(obj.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: obj.updatedAt ? new Date(obj.updatedAt).toISOString() : new Date().toISOString(),
  };
}

export async function createMongoDatabase(mongoUri, { recoverInterruptedJobs = true } = {}) {
  // Clear cached models to ensure latest schema (including sparse indexes) is used
  for (const name of ['Category', 'Product', 'Enquiry', 'EmailOutbox']) {
    if (mongoose.models[name]) delete mongoose.models[name];
  }

  await mongoose.connect(mongoUri);

  // Dynamically import models after cache clearing
  const { Category } = await import('./models/Category.js');
  const { Product } = await import('./models/Product.js');
  const { Enquiry } = await import('./models/Enquiry.js');
  const { EmailOutbox } = await import('./models/EmailOutbox.js');

  // Seed categories idempotently
  for (const cat of seedCategoriesList) {
    await Category.updateOne(
      { _id: cat.id },
      {
        $set: {
          label: cat.label,
          terms: cat.terms,
          icon: cat.icon,
          tone: cat.tone,
          image: cat.image,
          description: cat.description,
        },
      },
      { upsert: true }
    );
  }

  // Seed products idempotently
  for (const prod of seedProductsList) {
    await Product.updateOne(
      { _id: prod.id },
      {
        $set: {
          categoryId: prod.categoryId,
          name: prod.name,
          description: prod.description,
          modelNumber: prod.modelNumber || null,
          imagePath: prod.imagePath || null,
          specifications: prod.specifications || {},
          active: true,
        },
      },
      { upsert: true }
    );
  }

  if (recoverInterruptedJobs) {
    await EmailOutbox.updateMany({ status: 'sending' }, { $set: { status: 'pending' } });
  }

  return {
    close: async () => {
      await mongoose.disconnect();
    },
    checkConnection: () => mongoose.connection.readyState === 1,
    listCategories: async ({ q = '', query = '', category = '' } = {}) => {
      const normalizedQuery = (q || query).trim();
      const filter = {};
      if (category) {
        filter._id = category;
      }
      if (normalizedQuery) {
        const regex = new RegExp(normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        filter.$or = [{ label: regex }, { terms: regex }];
      }

      const docs = await Category.find(filter).sort({ label: 1 }).lean();
      const categoriesWithCount = await Promise.all(
        docs.map(async (cat) => {
          const count = await Product.countDocuments({ categoryId: cat._id, active: true });
          return {
            id: cat._id,
            label: cat.label,
            terms: cat.terms,
            icon: cat.icon,
            tone: cat.tone,
            productCount: count,
          };
        })
      );
      return categoriesWithCount;
    },
    getCategory: async (id) => {
      const cat = await Category.findById(id).lean();
      return cat ? { id: cat._id, label: cat.label, terms: cat.terms, icon: cat.icon, tone: cat.tone } : null;
    },
    listProducts: async ({ q = '', query = '', category = '', sort = 'name', limit = 24, offset = 0 } = {}) => {
      const normalizedQuery = (q || query).trim();
      const filter = { active: true };
      if (category) {
        filter.categoryId = category;
      }
      if (normalizedQuery) {
        const regex = new RegExp(normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        filter.$or = [{ name: regex }, { description: regex }, { modelNumber: regex }];
      }

      const sortOption = sort === 'newest' ? { createdAt: -1 } : { name: 1 };
      const [docs, total] = await Promise.all([
        Product.find(filter).sort(sortOption).skip(offset).limit(limit).lean(),
        Product.countDocuments(filter),
      ]);

      const categoriesMap = new Map();
      const catDocs = await Category.find({}).lean();
      for (const c of catDocs) {
        categoriesMap.set(c._id, c.label);
      }

      const data = docs.map((doc) => {
        return serializeProduct({
          ...doc,
          category: categoriesMap.get(doc.categoryId) || '',
        });
      });

      return { data, total };
    },
    getProduct: async (id) => {
      const prod = await Product.findOne({ _id: id, active: true }).lean();
      if (!prod) return null;
      const cat = await Category.findById(prod.categoryId).lean();
      return serializeProduct({ ...prod, category: cat?.label || '' });
    },
    createEnquiry: async (input, { notificationEmail, templates }) => {
      if (input.idempotencyKey) {
        const duplicate = await Enquiry.findOne({ idempotencyKey: input.idempotencyKey }).lean();
        if (duplicate) {
          if (duplicate.requestHash !== input.requestHash) {
            return { conflict: true };
          }
          const cat = duplicate.categoryId ? await Category.findById(duplicate.categoryId).lean() : null;
          const prod = duplicate.productId ? await Product.findById(duplicate.productId).lean() : null;
          return {
            enquiry: {
              id: duplicate._id,
              kind: duplicate.kind,
              name: duplicate.name,
              email: duplicate.email,
              phone: duplicate.phone,
              categoryId: duplicate.categoryId,
              category: cat?.label || null,
              productId: duplicate.productId,
              product: prod?.name || null,
              message: duplicate.message,
              createdAt: duplicate.createdAt,
            },
            duplicate: true,
          };
        }
      }

      if (input.categoryId && !(await Category.findById(input.categoryId))) {
        return { categoryMissing: true };
      }

      if (input.productId && !(await Product.findById(input.productId))) {
        return { productMissing: true };
      }

      if (input.categoryId && input.productId) {
        const product = await Product.findById(input.productId).lean();
        if (product.categoryId !== input.categoryId) {
          return { categoryMismatch: true };
        }
      }

      const created = await Enquiry.create({
        _id: input.id,
        kind: input.kind,
        name: input.name,
        email: input.email,
        phone: input.phone,
        categoryId: input.categoryId,
        productId: input.productId,
        message: input.message,
        idempotencyKey: input.idempotencyKey,
        requestHash: input.requestHash,
      });

      const cat = input.categoryId ? await Category.findById(input.categoryId).lean() : null;
      const prod = input.productId ? await Product.findById(input.productId).lean() : null;
      const enquiry = {
        id: created._id,
        kind: created.kind,
        name: created.name,
        email: created.email,
        phone: created.phone,
        categoryId: created.categoryId,
        category: cat?.label || null,
        productId: created.productId,
        product: prod?.name || null,
        message: created.message,
        createdAt: created.createdAt,
      };

      const notification = templates.business(enquiry);
      await EmailOutbox.create({
        enquiryId: enquiry.id,
        recipient: notificationEmail || '',
        kind: 'business_notification',
        ...notification,
      }).catch(() => {});

      const acknowledgement = templates.customer(enquiry);
      await EmailOutbox.create({
        enquiryId: enquiry.id,
        recipient: enquiry.email,
        kind: 'customer_acknowledgement',
        ...acknowledgement,
      }).catch(() => {});

      return { enquiry, duplicate: false };
    },
    getEmailStatuses: async (enquiryId) => {
      const results = await EmailOutbox.aggregate([
        { $match: { enquiryId } },
        { $group: { _id: { kind: '$kind', status: '$status' }, count: { $sum: 1 } } },
      ]);
      return results.map((r) => ({
        kind: r._id.kind,
        status: r._id.status,
        count: r.count,
      }));
    },
    configureNotificationRecipient: async (recipient) => {
      if (recipient) {
        await EmailOutbox.updateMany(
          { kind: 'business_notification', recipient: '' },
          { $set: { recipient } }
        );
      }
    },
    getDueEmailJobs: async () => {
      const jobs = await EmailOutbox.find({
        status: { $in: ['pending', 'failed'] },
        attempts: { $lt: 12 },
        nextAttemptAt: { $lte: new Date() },
      })
        .sort({ _id: 1 })
        .limit(20)
        .lean();

      return jobs.map((j) => ({
        id: j._id.toString(),
        enquiryId: j.enquiryId,
        recipient: j.recipient,
        kind: j.kind,
        subject: j.subject,
        html: j.html,
        text: j.text,
        attempts: j.attempts,
      }));
    },
    claimEmailJob: async (id) => {
      const res = await EmailOutbox.updateOne(
        { _id: id, status: { $in: ['pending', 'failed'] } },
        { $set: { status: 'sending', lastError: null }, $inc: { attempts: 1 } }
      );
      return res.modifiedCount === 1;
    },
    markEmailSent: async (id) => {
      await EmailOutbox.updateOne(
        { _id: id, status: 'sending' },
        { $set: { status: 'sent', sentAt: new Date(), lastError: null } }
      );
    },
    markEmailFailed: async (id, attempts, errorCode) => {
      const delayMs = Math.min(12 * 60 * 60 * 1000, 30_000 * 2 ** Math.max(0, attempts - 1));
      await EmailOutbox.updateOne(
        { _id: id, status: 'sending' },
        {
          $set: {
            status: attempts >= 12 ? 'failed' : 'pending',
            nextAttemptAt: new Date(Date.now() + delayMs),
            lastError: String(errorCode || 'SMTP_DELIVERY_FAILED').slice(0, 100),
          },
        }
      );
    },
    retryFailedEmailJobs: async () => {
      const res = await EmailOutbox.updateMany(
        { status: 'failed' },
        { $set: { status: 'pending', attempts: 0, lastError: null, nextAttemptAt: new Date() } }
      );
      return res.modifiedCount;
    },
  };
}
