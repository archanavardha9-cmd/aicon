import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';

const serverDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

dotenv.config({ path: path.join(serverDirectory, '.env') });

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(0),
  DATABASE_URL: z.string().trim().min(1).default('./data/aicon.sqlite'),
  CLIENT_ORIGINS: z.string().default('http://localhost:5173,http://127.0.0.1:5173'),
  SMTP_HOST: z.string().trim().default(''),
  SMTP_PORT: z.string().trim().default(''),
  SMTP_SECURE: z.string().trim().default('false'),
  SMTP_USER: z.string().trim().default(''),
  SMTP_PASS: z.string().default(''),
  SMTP_FROM_EMAIL: z.string().trim().default(''),
  BUSINESS_NOTIFICATION_EMAIL: z.string().trim().default(''),
});

const parsed = configSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid server configuration: ${parsed.error.issues.map((issue) => issue.path.join('.')).join(', ')}`);
}

const env = parsed.data;
const smtpValues = [
  env.SMTP_HOST,
  env.SMTP_PORT,
  env.SMTP_USER,
  env.SMTP_PASS,
  env.SMTP_FROM_EMAIL,
  env.BUSINESS_NOTIFICATION_EMAIL,
];
const smtpConfigured = smtpValues.every(Boolean);
const smtpPartiallyConfigured = smtpValues.some(Boolean);

if (smtpPartiallyConfigured && !smtpConfigured) {
  throw new Error('Incomplete SMTP configuration. Set every SMTP_* and BUSINESS_NOTIFICATION_EMAIL value, or leave them all empty.');
}

if (
  smtpConfigured &&
  (
    !/^\d+$/.test(env.SMTP_PORT) ||
    Number(env.SMTP_PORT) < 1 ||
    Number(env.SMTP_PORT) > 65535 ||
    !['true', 'false'].includes(env.SMTP_SECURE.toLowerCase())
  )
) {
  throw new Error('SMTP_PORT must be between 1 and 65535 and SMTP_SECURE must be true or false.');
}

if (smtpConfigured && !z.string().email().safeParse(env.SMTP_FROM_EMAIL).success) {
  throw new Error('SMTP_FROM_EMAIL must be a valid email address.');
}

if (smtpConfigured && !z.string().email().safeParse(env.BUSINESS_NOTIFICATION_EMAIL).success) {
  throw new Error('BUSINESS_NOTIFICATION_EMAIL must be a valid email address.');
}

let databasePath = env.DATABASE_URL;

if (databasePath.startsWith('file:')) {
  databasePath = fileURLToPath(databasePath);
}

if (databasePath !== ':memory:' && !path.isAbsolute(databasePath)) {
  databasePath = path.resolve(serverDirectory, databasePath);
}

const clientOrigins = env.CLIENT_ORIGINS
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

for (const origin of clientOrigins) {
  try {
    const parsedOrigin = new URL(origin);

    if (!['http:', 'https:'].includes(parsedOrigin.protocol)) {
      throw new Error();
    }
  } catch {
    throw new Error(`Invalid CLIENT_ORIGINS entry: ${origin}`);
  }
}

export const config = Object.freeze({
  environment: env.NODE_ENV,
  port: env.PORT,
  trustProxyHops: env.TRUST_PROXY_HOPS,
  serverDirectory,
  clientDirectory: path.resolve(serverDirectory, '..', 'client'),
  databasePath,
  clientOrigins,
  smtp: smtpConfigured
    ? Object.freeze({
        host: env.SMTP_HOST,
        port: Number(env.SMTP_PORT),
        secure: env.SMTP_SECURE.toLowerCase() === 'true',
        user: env.SMTP_USER,
        password: env.SMTP_PASS,
        fromEmail: env.SMTP_FROM_EMAIL,
        notificationEmail: env.BUSINESS_NOTIFICATION_EMAIL,
      })
    : null,
});
