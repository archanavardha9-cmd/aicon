import { randomUUID, createHash } from 'node:crypto';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { config as defaultConfig } from './config.js';
import { createEmailTemplates } from './email-templates.js';

const enquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  categoryId: z.string().trim().min(1).max(80).optional(),
  productId: z.string().trim().min(1).max(100).optional(),
  message: z.string().trim().min(10).max(5000),
  website: z.string().max(200).optional(),
}).strict();

const listQuerySchema = z.object({
  q: z.string().trim().max(100).default(''),
  category: z.string().trim().max(80).default(''),
  sort: z.enum(['name', 'newest']).default('name'),
  limit: z.coerce.number().int().min(1).max(100).default(24),
  offset: z.coerce.number().int().min(0).max(100_000).default(0),
});

function requestHash(input) {
  const canonical = JSON.stringify({
    kind: input.kind,
    name: input.name,
    email: input.email,
    phone: input.phone || '',
    categoryId: input.categoryId || '',
    productId: input.productId || '',
    message: input.message,
  });

  return createHash('sha256').update(canonical).digest('hex');
}

function asyncRoute(handler) {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

function invalidRequest(response, error) {
  return response.status(400).json({
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Please check the submitted information.',
      fields: error.flatten().fieldErrors,
    },
  });
}

function formatError(error) {
  if (error.status && error.code) {
    return {
      status: error.status,
      code: error.code,
      message: error.message,
    };
  }

  return {
    status: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'The request could not be completed.',
  };
}

export function createApp({
  database,
  config = defaultConfig,
  logger = console,
} = {}) {
  if (!database) {
    throw new Error('createApp requires a configured database.');
  }

  const app = express();
  const allowedOrigins = new Set(config.clientOrigins);
  const templates = createEmailTemplates();
  const enquiryRateLimit = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many enquiries. Please wait a few minutes and try again.',
      },
    },
  });
  const staticDirectory = path.join(config.clientDirectory, 'dist');

  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxyHops);
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        upgradeInsecureRequests: config.environment === 'production' ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }));
  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
      } else {
        const error = new Error('This origin is not allowed to access the API.');
        error.status = 403;
        error.code = 'CORS_ORIGIN_DENIED';
        callback(error);
      }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Idempotency-Key'],
    maxAge: 600,
  }));
  app.use(express.json({ limit: '12kb', strict: true }));
  app.use('/api', (request, response, next) => {
    response.setHeader('Cache-Control', 'no-store');
    next();
  });

  app.get('/api/health', asyncRoute(async (_request, response) => {
    if (!database.checkConnection()) {
      const error = new Error('The database is not available.');
      error.code = 'DATABASE_UNAVAILABLE';
      throw error;
    }

    response.json({
      data: {
        status: 'ok',
        database: 'connected',
        smtpConfigured: Boolean(config.smtp),
      },
    });
  }));

  app.get('/api/categories', asyncRoute(async (request, response) => {
    const parsed = listQuerySchema.pick({ q: true, category: true }).safeParse(request.query);

    if (!parsed.success) {
      return invalidRequest(response, parsed.error);
    }

    const categories = await database.listCategories(parsed.data);
    return response.json({ data: categories, meta: { total: categories.length } });
  }));

  app.get('/api/products', asyncRoute(async (request, response) => {
    const parsed = listQuerySchema.safeParse(request.query);

    if (!parsed.success) {
      return invalidRequest(response, parsed.error);
    }

    if (parsed.data.category && !await database.getCategory(parsed.data.category)) {
      return response.status(400).json({
        error: { code: 'UNKNOWN_CATEGORY', message: 'The selected category does not exist.' },
      });
    }

    const result = await database.listProducts(parsed.data);
    return response.json({
      data: result.data,
      meta: {
        total: result.total,
        limit: parsed.data.limit,
        offset: parsed.data.offset,
      },
    });
  }));

  app.get('/api/products/:productId', asyncRoute(async (request, response) => {
    const product = await database.getProduct(request.params.productId);

    if (!product) {
      return response.status(404).json({
        error: { code: 'PRODUCT_NOT_FOUND', message: 'This product was not found.' },
      });
    }

    return response.json({ data: product });
  }));

  function handleEnquiry(kind) {
    return async (request, response) => {
      const parsed = enquirySchema.safeParse(request.body);

      if (!parsed.success) {
        return invalidRequest(response, parsed.error);
      }

      const input = parsed.data;

      if (input.website) {
        return response.status(202).json({
          data: {
            id: null,
            status: 'accepted',
            notifications: 'pending',
            message: 'Your enquiry has been received.',
          },
        });
      }

      if (kind === 'product' && !input.categoryId && !input.productId) {
        return response.status(400).json({
          error: {
            code: 'PRODUCT_REFERENCE_REQUIRED',
            message: 'Select a category or provide a product reference.',
          },
        });
      }

      const idempotencyKey = request.get('Idempotency-Key') || null;

      if (idempotencyKey && !/^[\w.-]{8,100}$/.test(idempotencyKey)) {
        return response.status(400).json({
          error: {
            code: 'INVALID_IDEMPOTENCY_KEY',
            message: 'The request identifier is invalid. Please try again.',
          },
        });
      }

      const enquiry = {
        ...input,
        id: randomUUID(),
        kind,
        phone: input.phone || null,
        categoryId: input.categoryId || null,
        productId: input.productId || null,
        idempotencyKey,
        requestHash: requestHash({ ...input, kind }),
      };

      const result = await database.createEnquiry(enquiry, {
        notificationEmail: config.smtp?.notificationEmail || '',
        templates,
      });

      if (result.conflict) {
        return response.status(409).json({
          error: {
            code: 'IDEMPOTENCY_CONFLICT',
            message: 'This request identifier was already used for different information.',
          },
        });
      }

      if (result.categoryMissing || result.productMissing) {
        return response.status(400).json({
          error: {
            code: result.productMissing ? 'PRODUCT_NOT_FOUND' : 'UNKNOWN_CATEGORY',
            message: result.productMissing
              ? 'This product was not found.'
              : 'The selected category does not exist.',
          },
        });
      }

      if (result.categoryMismatch) {
        return response.status(400).json({
          error: {
            code: 'PRODUCT_CATEGORY_MISMATCH',
            message: 'The product does not belong to the selected category.',
          },
        });
      }

      const statuses = await database.getEmailStatuses(result.enquiry.id);
      const allSent = statuses.length === 2 && statuses.every((item) => item.status === 'sent');

      const notifications = allSent
        ? 'sent'
        : config.smtp
          ? 'queued'
          : 'pending_configuration';

      return response.status(allSent ? 201 : 202).json({
        data: {
          id: result.enquiry.id,
          status: 'saved',
          notifications,
          duplicate: result.duplicate,
          message: allSent
            ? 'Your enquiry was saved and notifications were sent.'
            : config.smtp
              ? 'Your enquiry was saved. Email delivery is pending and will be retried automatically.'
              : 'Your enquiry was saved. Email delivery will begin once SMTP is configured.',
        },
      });
    };
  }

  app.post('/api/enquiries', enquiryRateLimit, asyncRoute(handleEnquiry('product')));
  app.post('/api/contact', enquiryRateLimit, asyncRoute(handleEnquiry('contact')));

  app.use('/api', (_request, response) => response.status(404).json({
    error: { code: 'ROUTE_NOT_FOUND', message: 'This API route was not found.' },
  }));

  if (config.environment === 'production') {
    app.use(express.static(staticDirectory, {
      index: false,
      maxAge: '1h',
      setHeaders(response, filePath) {
        if (filePath.endsWith('index.html')) {
          response.setHeader('Cache-Control', 'no-cache');
        }
      },
    }));

    app.get(/^(?!\/api(?:\/|$)).*/, (_request, response, next) => {
      response.sendFile(path.join(staticDirectory, 'index.html'), (error) => {
        if (error) {
          next(error);
        }
    });
    });
  }

  app.use((error, request, response, _next) => {
    if (response.headersSent) {
      return;
    }

    if (error?.type === 'entity.too.large') {
      return response.status(413).json({
        error: { code: 'REQUEST_TOO_LARGE', message: 'The submitted information is too large.' },
      });
    }

    if (error instanceof SyntaxError && 'body' in error) {
      return response.status(400).json({
        error: { code: 'INVALID_JSON', message: 'The request body is not valid JSON.' },
      });
    }

    const formatted = formatError(error);

    logger.error(JSON.stringify({
      event: 'api_request_failed',
      method: request.method,
      path: request.path,
      errorCode: formatted.code,
    }));

    return response.status(formatted.status).json({
      error: { code: formatted.code, message: formatted.message },
    });
  });

  return app;
}

export { requestHash };
