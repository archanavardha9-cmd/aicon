export function createEmailOutbox({ database, transporter, fromEmail, logger = console }) {
  let active = false;
  let timer;

  async function processPending() {
    if (active || !transporter) {
      return;
    }

    active = true;

    try {
      const jobs = await database.getDueEmailJobs();
      for (const job of jobs) {
        const claimed = await database.claimEmailJob(job.id);
        if (!claimed) {
          continue;
        }

        try {
          await transporter.sendMail({
            from: fromEmail,
            to: job.recipient,
            subject: job.subject,
            html: job.html,
            text: job.text,
          });
          await database.markEmailSent(job.id);
        } catch (error) {
          const code = typeof error?.code === 'string' ? error.code : 'SMTP_DELIVERY_FAILED';
          await database.markEmailFailed(job.id, job.attempts + 1, code);
          logger.error(JSON.stringify({
            event: 'email_delivery_failed',
            outboxId: job.id,
            errorCode: code,
          }));
        }
      }
    } finally {
      active = false;
    }
  }

  return {
    processPending,
    start(intervalMs = 15_000) {
      if (timer) {
        return;
      }

      void processPending();
      timer = setInterval(() => void processPending(), intervalMs);
      timer.unref?.();
    },
    stop() {
      if (timer) {
        clearInterval(timer);
        timer = undefined;
      }
      return (async () => {
        while (active) {
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      })();
    },
  };
}
