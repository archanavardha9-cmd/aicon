# Implementation Progress

## Phase 1: Fix Existing Bugs — IN PROGRESS
- [ ] Fix Contact.jsx: `contactDetails.emailSupport` does not exist (references undefined)
- [ ] Check for other frontend/backend bugs

## Phase 2: Complete MERN Backend Implementation — PENDING
- [ ] Make MongoDB primary database in index.js
- [ ] Complete MongoDB adapter operations
- [ ] Ensure seed data is idempotent (no duplicates)
- [ ] Review indexes, constraints, relationships, error handling
- [ ] Keep SQLite code available until migration verified

## Phase 3: Complete Enquiry and Email System — PENDING
- [ ] Persist enquiries to MongoDB before email processing
- [ ] SMTP failure never loses saved enquiry
- [ ] Business notification + customer acknowledgement emails
- [ ] Configurable SMTP env vars, no hardcoded credentials
- [ ] Handle SMTP not configured gracefully

## Phase 4: Prepare Environment Configuration — PENDING
- [ ] Complete server/.env.example and client/.env.example
- [ ] Include MONGODB_URI, PORT, CLIENT_ORIGINS, SMTP variables
- [ ] Create ENV_SETUP.md at project root
- [ ] Ensure .env files ignored by Git
- [ ] Document where each variable belongs

## Phase 5: Complete API and Frontend Integration — PENDING
- [ ] Verify frontend API calls vs backend endpoints
- [ ] Verify Vite proxy and backend port config
- [ ] Investigate ECONNREFUSED 127.0.0.1:3001
- [ ] Verify product listing, filtering, search, sort, pagination, details
- [ ] Preserve fallback behavior where appropriate

## Phase 6: Audit Product Images — PENDING
- [ ] Inspect existing image files and mappings
- [ ] Replace only genuinely poor-quality images
- [ ] Give 43-inch TV separate image if authentic source available

## Phase 7: Testing — PENDING
- [ ] Run frontend and backend tests
- [ ] Fix failing tests from implementation changes
- [ ] Add MongoDB tests where practical
- [ ] Verify production builds

## Phase 8: Documentation and Handover — PENDING
- [ ] Create/update documentation (install, start, configure, MongoDB, SMTP, seed, tests, errors)
