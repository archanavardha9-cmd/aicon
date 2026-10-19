# Environment Setup Guide — AICON Smart Appliances

This guide explains how to install, configure, and run the AICON Smart Appliances
website. It is a MERN stack application (MongoDB, Express, React, Node.js).

## 1. Requirements

- Node.js 20.19 or newer
- npm

## 2. Installation

Install both packages separately:

```powershell
# Backend
Set-Location server
npm install
Copy-Item .env.example .env

# Frontend
Set-Location ..\client
npm install
Copy-Item .env.example .env
```

## 3. Environment Variables

### Server (`server/.env`)

Copy `server/.env.example` to `server/.env` and fill in your values.

| Variable | Required? | Purpose | Example |
|----------|-----------|---------|---------|
| `NODE_ENV` | No | `development`, `test`, or `production` | `development` |
| `PORT` | No | API listen port | `3001` |
| `TRUST_PROXY_HOPS` | No | Trusted reverse proxy hops (0-5) | `0` |
| `DATABASE_URL` | No | SQLite fallback path | `./data/aicon.sqlite` |
| `MONGODB_URI` | **Yes** | MongoDB connection string (primary DB) | `mongodb+srv://...` |
| `CLIENT_ORIGINS` | No | Allowed CORS origins | `http://localhost:5173,...` |
| `SMTP_HOST` | No\* | SMTP host | `smtp.gmail.com` |
| `SMTP_PORT` | No\* | SMTP port | `587` |
| `SMTP_SECURE` | No\* | `true` or `false` | `false` |
| `SMTP_USER` | No\* | SMTP username | `user@gmail.com` |
| `SMTP_PASS` | No\* | SMTP password / App Password | `...` |
| `SMTP_FROM_EMAIL` | No\* | Sender email address | `user@gmail.com` |
| `BUSINESS_NOTIFICATION_EMAIL` | No\* | Recipient for enquiry notifications | `business@example.com` |

\* SMTP variables are optional. When all are blank, enquiries are saved but email delivery remains queued. When any SMTP value is set, ALL SMTP fields and `BUSINESS_NOTIFICATION_EMAIL` must be set.

### Client (`client/.env`)

Copy `client/.env.example` to `client/.env`.

| Variable | Required? | Purpose | Example |
|----------|-----------|---------|---------|
| `VITE_API_BASE_URL` | No | API base URL for frontend calls | `/api` |

### Secrets

Never put real credentials in `.env.example`. The `.env` file is ignored by Git
in both `server/` and `client/`. The frontend never receives MongoDB or SMTP
credentials.

## 4. Connecting MongoDB Atlas

1. Create a cluster at https://www.mongodb.com/cloud/atlas
2. Create a database user and note the username/password
3. Add your IP address to the Atlas network access list (or use `0.0.0.0/0` for development)
4. Click "Connect" → "Connect your application" → Node.js
5. Copy the connection string and paste it into `MONGODB_URI` in `server/.env`
6. Replace `<password>` in the connection string with your database user's password

Example format:
```
mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/aicon?retryWrites=true&w=majority
```

## 5. Configuring SMTP

The application uses Nodemailer with SMTP (not Resend).

1. Choose an SMTP provider (e.g. Gmail, SendGrid, Mailgun, or your own server)
2. For Gmail:
   - Enable 2-Step Verification on the Google account
   - Generate an App Password (not your regular password)
   - Set `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_SECURE=false`
3. Fill in all SMTP fields in `server/.env`
4. Set `BUSINESS_NOTIFICATION_EMAIL` to the inbox that should receive new enquiry alerts

If SMTP is not configured, the application still saves enquiries correctly.
Email jobs remain queued and are delivered once SMTP is enabled.

## 6. Starting the Application

### Development

Terminal 1 — Backend:
```powershell
Set-Location server
npm run dev
```

Terminal 2 — Frontend:
```powershell
Set-Location client
npm run dev
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:3001/api`
- Vite proxies `/api` requests to the backend automatically.

### Production

```powershell
# Build the client
Set-Location client
npm run build

# Start the backend (serves the built client)
Set-Location ..\server
npm start
```

## 7. Database Seeding

Categories and products are seeded automatically on first application start
from `client/src/data/categories.js` and `client/src/data/products.js`.
Seeding is idempotent — repeated starts do not create duplicates.

To migrate existing SQLite data to MongoDB:
```powershell
Set-Location server
node src/migrate-sqlite-to-mongo.js
```

## 8. Running Tests

Backend:
```powershell
Set-Location server
npm test
npm run lint
```

Frontend:
```powershell
Set-Location client
npm test
npm run lint
npm run build
```

## 9. Production Build

```powershell
Set-Location client
npm run build
```

The backend serves the built client statically in production mode, with SPA
fallback routing for React Router.

## 10. Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `ECONNREFUSED 127.0.0.1:3001` | Backend not running | Start `npm run dev` in `server/` |
| `MONGODB_URI is not set` | MongoDB not configured | Add `MONGODB_URI` to `server/.env` |
| `Incomplete SMTP configuration` | Partial SMTP vars | Set all SMTP fields or leave all blank |
| `CORS_ORIGIN_DENIED` | Frontend origin not allowed | Add frontend URL to `CLIENT_ORIGINS` |
| `VALIDATION_ERROR` | Invalid form input | Check field lengths and formats |
| `IDEMPOTENCY_CONFLICT` | Duplicate submission with different data | Use a new `Idempotency-Key` |

## 11. Values You Must Personally Provide

You must supply these before the application can use MongoDB or email:

1. **`MONGODB_URI`** — Your MongoDB Atlas connection string (with real credentials)
2. **SMTP credentials** (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL`, `BUSINESS_NOTIFICATION_EMAIL`) — Only if you want email delivery. Leave blank to run without email.

Do not invent credentials. Obtain them from your MongoDB Atlas account and SMTP provider.

## 12. File Locations

- `server/src/index.js` — Application entry point (database selection)
- `server/src/mongo-database.js` — MongoDB data adapter
- `server/src/database.js` — SQLite data adapter (degraded fallback)
- `server/src/app.js` — Express routes and API logic
- `server/src/config.js` — Environment configuration (Zod-validated)
- `server/src/email-templates.js` — Email HTML/text templates
- `server/src/email-outbox.js` — Async email delivery with retry
- `server/src/models/*.js` — Mongoose models
- `server/src/migrate-sqlite-to-mongo.js` — SQLite → MongoDB migration script
- `client/src/services/api.js` — Frontend API client (axios)
- `client/vite.config.js` — Vite dev server with `/api` proxy
- `client/src/data/products.js` — Product seed data
- `client/src/data/categories.js` — Category seed data
- `client/src/data/contact.js` — Business contact details
