# AICON website client

The React/Vite client is part of the full-stack AICON website. For the combined
frontend/backend setup, environment variables, API, database, SMTP, and
deployment instructions, see the project [README](../README.md).

For local development, install dependencies in this directory and run
`npm run dev`. The client uses `/api` by default; Vite proxies that path to the
Express server on port `3001`. Set `VITE_API_BASE_URL` only when the API is
hosted at a different base URL.
