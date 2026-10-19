# AICON Smart Appliances

A responsive React/Vite website and Express API for AICON Smart Appliances.
The site serves verified category information, publishes product data only
when provided, and stores customer enquiries in SQLite. Nodemailer sends
business notifications and customer acknowledgements through a server-side
SMTP connection.

## Requirements

- Node.js 20.19 or newer.
- npm.

## Local development

Install the two packages separately:

```powershell
Set-Location server
npm install
Copy-Item .env.example .env
Set-Location ..\client
npm install
Copy-Item .env.example .env
```

Edit `server/.env` before enabling SMTP. The supplied values are placeholders
or blank; there are no working credentials in the project. Keep the frontend
variable in `client/.env` non-secret.

Start the backend in one terminal:

```powershell
Set-Location server
npm run dev
```

Start Vite in another:

```powershell
Set-Location client
npm run dev
```

The frontend is served at `http://localhost:5173`; the API is at
`http://localhost:3001/api`. Vite proxies `/api` requests to the backend.

## Environment

`server/.env.example` documents all server variables:

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | `development`, `test`, or `production`. |
| `PORT` | Express listen port; defaults to `3001`. |
| `TRUST_PROXY_HOPS` | Number of trusted reverse proxies, from `0` to `5`; configure the exact deployment topology. |
| `DATABASE_URL` | SQLite path; defaults to `./data/aicon.sqlite`, relative to `server/`. |
| `CLIENT_ORIGINS` | Comma-separated allowed browser origins. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` | SMTP host and TLS settings. |
| `SMTP_USER`, `SMTP_PASS` | SMTP authentication; keep these only in `server/.env`. |
| `SMTP_FROM_EMAIL` | Authorized sender address. |
| `BUSINESS_NOTIFICATION_EMAIL` | Recipient for new-enquiry notifications. |

Leave the SMTP fields blank to keep requests saved without attempting delivery.
When SMTP is enabled, all SMTP fields and a valid business notification address
must be set; partial configuration prevents the server from starting. SMTP
credentials are never exposed to Vite or returned by the API.

### Gmail SMTP

For Gmail, use `SMTP_HOST=smtp.gmail.com`, port `587`, and
`SMTP_SECURE=false` (STARTTLS). Port `465` uses `SMTP_SECURE=true`. The Google
account must have 2-Step Verification enabled and use a Google App Password
in `SMTP_PASS`. Do not use a regular Gmail password. Set `SMTP_USER` and
`SMTP_FROM_EMAIL` to an account/address authorized to send; set
`BUSINESS_NOTIFICATION_EMAIL` to the business inbox. Provider policy and
account configuration can affect delivery.

No SMTP credentials were available during implementation, so live SMTP
connectivity and delivery have not been verified. Automated tests use a
mocked SMTP transport.

For production, set `NODE_ENV=production`, build the client, configure
`CLIENT_ORIGINS` to include the website's exact browser origin (including
when the API and website share one host), set `TRUST_PROXY_HOPS` to the
verified ingress topology, and use a durable database path.

## Database and enquiry delivery

SQLite initializes its file and schema on first start. All 6 appliance categories and 10 flagship products are automatically seeded from `client/src/data/products.js` with verified specifications, model numbers, and local image paths. 

SQLite is suitable for a single application instance with a durable writable disk. For multi-instance or high-availability hosting, persistence can be moved to a managed database (PostgreSQL/MySQL).

Each accepted enquiry and its two email jobs (business notification and customer acknowledgement) are inserted in the same database transaction. An `Idempotency-Key` header prevents duplicate submissions. SMTP delivery is processed asynchronously by a durable outbox with exponential backoff (up to 12 retry attempts). If SMTP credentials are not yet configured, enquiries are safely persisted and email jobs remain queued until SMTP is enabled.

```powershell
Set-Location server
npm run retry:email
```

## Images and brand reference

Authentic, clean product photographs without text overlays are stored locally in `client/public/images/products/`:

| Product | Model Number | Image File | Source / Verification |
| --- | --- | --- | --- |
| AICON 55" 4K UHD Smart LED TV | ACTV-55UHD | `aicon-4k-smart-tv.jpg` | Official Facebook Post (122110917332345120) with AICON logo on bezel |
| AICON 43" Full HD Smart LED TV | ACTV-43FHD | `aicon-4k-smart-tv.jpg` | Official Facebook Post product line asset |
| AICON 8.0 kg Twin Tub Washer | ACWM-80ST | `aicon-twin-tub-washing-machine.jpg` | Commercial studio product photography |
| AICON 7.5 kg Semi-Auto Washer | ACWM-75SA | `aicon-semi-automatic-washing-machine.jpg` | Official Facebook appliance asset |
| AICON Desert Air Cooler 70L | ACDC-70 | `aicon-desert-cooler-70l.jpg` | Commercial studio product photography |
| AICON Tower Air Cooler 50L | ACTC-50 | `aicon-air-cooler.jpg` | Official Facebook cooling asset |
| AICON 1.5 Ton Inverter Split AC | ACAC-153S | `aicon-inverter-split-ac.jpg` | Commercial studio product photography |
| AICON 1.0 Ton Split AC | ACAC-103S | `aicon-split-air-conditioner.jpg` | Official Facebook air conditioning asset |
| AICON 750W Heavy Duty Mixer | ACMG-750 | `aicon-smart-mixer-grinder-750w.jpg` | Commercial studio product photography |
| AICON 25L Storage Water Heater | ACWH-25S | `aicon-storage-water-heater-25l.jpg` | Commercial studio product photography |
| AICON Aeroflow 1200mm Ceiling Fan | ACF-1200 | `aicon-aeroflow-ceiling-fan.jpg` | Commercial studio product photography |

The complete asset mapping is registered in `client/public/images/products/manifest.json`.

The visual design is bright, modern, and aligned with AICON's official brand identity:
- Primary Brand Blue: `#2463A6`
- Deep Blue: `#173B63`
- Light Blue: `#EAF4FC`
- Soft Ivory: `#F8F6F1`
- Pure White: `#FFFFFF`
- Charcoal Text: `#292929`

## Validation

Run the client build, lint, and unit tests:

```powershell
Set-Location client
npm run build
npm run lint
npm test
```

Run backend syntax checks and API/outbox tests:

```powershell
Set-Location server
npm run lint
npm test
```

The backend tests use temporary SQLite data and a mocked SMTP transport. A
real service/database deployment and SMTP delivery still require the
operator's environment and credentials.
