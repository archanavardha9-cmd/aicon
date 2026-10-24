import 'dotenv/config';
import bcrypt from 'bcryptjs';
import {AdminUser} from '../src/models/AdminUser.js';
import { createMongoDatabase } from '../src/mongo-database.js';
import { config } from '../src/config.js';

const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
const name = process.env.ADMIN_BOOTSTRAP_NAME || 'Admin';

if (!email || !password) {
  console.error('Set ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD');
  process.exit(1);
}

const db = await createMongoDatabase(config.mongodbUri);
const existing = await AdminUser.findOne({ email });
if (existing) {
  console.log('Admin already exists:', email);
  process.exit(0);
}

const passwordHash = await bcrypt.hash(password, 12);
await AdminUser.create({ _id: `admin_${Date.now()}`, email, passwordHash, name });
console.log('Admin created:', email);
process.exit(0);