import { config } from './config.js';
import { createDatabase } from './database.js';

const database = createDatabase(config.databasePath, { recoverInterruptedJobs: false });

try {
  const retried = database.retryFailedEmailJobs();
  console.info(JSON.stringify({ event: 'email_jobs_requeued', count: retried }));
} finally {
  database.close();
}
