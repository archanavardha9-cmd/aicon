import nodemailer from 'nodemailer';
import { createApp } from './app.js';
import { config } from './config.js';
import { createDatabase } from './database.js';
import { createEmailOutbox } from './email-outbox.js';
import { createEmailTemplates } from './email-templates.js';

const database = createDatabase(config.databasePath);
const templates = createEmailTemplates();
let transporter = null;

if (config.smtp) {
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.password,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 30_000,
    disableFileAccess: true,
    disableUrlAccess: true,
  });

  database.configureNotificationRecipient(config.smtp.notificationEmail);
}

const outbox = createEmailOutbox({
  database,
  transporter,
  fromEmail: config.smtp?.fromEmail,
});

const app = createApp({ database, config });
const server = app.listen(config.port, () => {
  console.info(JSON.stringify({
    event: 'server_started',
    port: config.port,
    environment: config.environment,
    trustProxyHops: config.trustProxyHops,
    database: config.databasePath === ':memory:' ? 'in-memory' : 'sqlite',
    smtpConfigured: Boolean(config.smtp),
  }));
  outbox.start();
});

async function shutdown(signal) {
  console.info(JSON.stringify({ event: 'server_shutdown', signal }));
  await outbox.stop();
  server.close(() => {
    database.close();
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 10_000).unref();
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
