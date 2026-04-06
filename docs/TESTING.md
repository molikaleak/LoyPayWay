# Testing Guide v1

This document describes the standard local test workflow for the Loy Payway open source project.

## Scope

The current v1 test process focuses on:

- core unit tests
- dashboard production build verification
- API smoke testing in demo mode
- basic merchant and transaction flow validation

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- local `.env` file copied from `.env.example`

Recommended:

- keep `PAYWAY_ALLOW_DEMO=true` for local validation

## Install Dependencies

```bash
npm install
```

## Automated Checks

### Run unit tests

```bash
npm test
```

Expected result:

- all tests pass
- current coverage includes core QR generation validation

### Build the dashboard

```bash
npm run build:dashboard
```

Expected result:

- Next.js build completes successfully
- no build-time runtime errors are reported

## Manual API Smoke Test

### 1. Start the server

```bash
npm run dev:server
```

### 2. Check health endpoint

```bash
curl http://localhost:3000/health
```

Expected result:

- JSON response with `status: ok`
- `mode` should be `demo` unless demo mode was explicitly disabled

### 3. Register a merchant

```bash
curl -X POST http://localhost:3000/api/merchant/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sunrise Coffee",
    "accountId": "012345678@aclb"
  }'
```

Expected result:

- response includes `merchant`
- response includes generated `apiKey`

### 4. Generate a transaction

```bash
curl -X POST http://localhost:3000/api/qr/generate \
  -H "Authorization: Bearer <merchant-api-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 4.50,
    "currency": "USD"
  }'
```

Expected result:

- response includes `transaction`
- transaction starts with `status: PENDING`
- response includes `md5Hash` and `qrString`

### 5. Confirm status transition

Wait a few seconds, then run:

```bash
curl http://localhost:3000/api/qr/transactions/<transaction-id>
```

Expected result in demo mode:

- transaction changes from `PENDING` to `SUCCESS`
- `confirmedAt` is populated
- `fromAccountId` is set to a demo value

## Manual Dashboard Check

### 1. Start the dashboard

```bash
npm run dev:dashboard
```

### 2. Open the UI

Visit the local dashboard URL shown by Next.js.

Expected result:

- transaction list page loads
- seeded demo transactions appear
- navigation works for Transactions, QR Generator, Analytics, and Settings

## Release Checklist v1

Before publishing or opening a release PR:

```bash
npm test
npm run build:dashboard
```

Also verify:

- README examples still match the current API
- `.env.example` matches required runtime variables
- Docker files still build
- no secrets are committed

## Known Gaps

The current v1 test process does not yet include:

- integration tests against live Bakong APIs
- persistent database migration tests
- end-to-end browser automation
- webhook receiver contract tests

These should be added in later versions as the project moves from demo mode to production readiness.
