# Loy Payway

[![CI Status](https://github.com/molikaleak/LoyPayWay/actions/workflows/ci.yml/badge.svg)](https://github.com/molikaleak/LoyPayWay/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D20-green.svg)](package.json)

Open source KHQR payment middleware for Cambodia's Bakong ecosystem.

Loy Payway helps merchants and integrators generate KHQR payment payloads, track transaction status, and send downstream notifications without manually checking every transfer.

## Status

`v1 MVP`

This repository currently ships a working local demo flow:

- merchant registration
- KHQR-style payload generation
- transaction polling flow
- webhook signature preview
- dashboard shell for transactions and merchant operations

Demo mode is enabled by default so the project can be tested locally before real Bakong credentials are available.

## Features

- Monorepo structure for core logic, API server, and dashboard
- Express API for merchant onboarding and payment flow
- Shared core package for QR generation, polling, token handling, and dispatch logic
- Demo-first local development flow
- Next.js dashboard starter for transaction visibility
- Docker and CI scaffolding for open source distribution

## Documentation

Detailed integration and configuration guides are available:

- 📖 **[API Reference](docs/api-reference.md)** — Complete endpoint specifications, authentication methods, schemas, and rate limits.
- 🔗 **[Webhook Integration Guide](docs/webhooks.md)** — Detailed guide on receiving notifications, verifying signatures (HMAC-SHA256), and setting up Telegram alerts.
- 🏦 **[Bakong & KHQR Guide](docs/bakong-integration.md)** — In-depth architectural details, account formats, currency handling, and live integration steps.
- 🧪 **[Testing Guide](docs/TESTING.md)** — How to run unit tests, dashboard builds, and manual API smoke tests.

## Repository Structure

```text
loy-payway/
├── packages/
│   ├── core/
│   ├── server/
│   └── dashboard/
├── docker/
├── docs/
├── .github/
├── .env.example
└── README.md
```

## Tech Stack

- Node.js
- Express
- Next.js
- npm workspaces
- Axios
- Docker
- GitHub Actions

## Getting Started

### Requirements

- Node.js 20 or newer
- npm 10 or newer

### Installation

```bash
git clone https://github.com/molikaleak/LoyPayWay.git
cd LoyPayWay
cp .env.example .env
npm install
```

### Run Locally

Start the API server:

```bash
npm run dev:server
```

Start the dashboard in a second terminal:

```bash
npm run dev:dashboard
```

Default local URLs:

- API: `http://localhost:3000`
- Dashboard: `http://localhost:3001` or the Next.js port shown in terminal

## Environment Variables

Copy `.env.example` to `.env` and update values as needed.

Important settings:

- `PAYWAY_ALLOW_DEMO=true`
- `PORT=3000`
- `NEXT_PUBLIC_API_BASE=http://localhost:3000`
- `BAKONG_BEARER_TOKEN=...` for live integration

If `PAYWAY_ALLOW_DEMO` is not set to `false`, the app will run in demo mode.

## API Overview

### Merchant

- `POST /api/merchant/register`
- `GET /api/merchant`

### QR and Transactions

- `POST /api/qr/generate`
- `GET /api/qr/transactions`
- `GET /api/qr/transactions/:id`

### Webhooks

- `POST /api/webhook/preview`

## Quick Demo

### 1. Register a merchant

```bash
curl -X POST http://localhost:3000/api/merchant/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sunrise Coffee",
    "accountId": "012345678@aclb"
  }'
```

Copy the `apiKey` from the response.

### 2. Generate a QR transaction

```bash
curl -X POST http://localhost:3000/api/qr/generate \
  -H "Authorization: Bearer <merchant-api-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 4.50,
    "currency": "USD"
  }'
```

### 3. Check transaction status

```bash
curl http://localhost:3000/api/qr/transactions/<transaction-id>
```

In demo mode, transactions automatically move from `PENDING` to `SUCCESS` after a short delay.

## Testing

The standard local checks for v1 are:

```bash
npm test
npm run build:dashboard
```

For full testing steps, smoke tests, and expected results, see [docs/TESTING.md](docs/TESTING.md).

## Docker

Build and run with Docker Compose:

```bash
docker compose -f docker/docker-compose.yml up --build
```

## Roadmap

- Replace in-memory storage with Prisma and Postgres or Supabase
- Integrate live Bakong API polling
- Add OpenAPI or Swagger docs
- Add CSV export and richer analytics
- Add production-ready auth, persistence, and job processing

## Security Notes

- Do not store merchant banking passwords
- Verify webhook signatures with `X-PayWay-Signature`
- Use HTTPS in any deployed environment
- Treat demo mode as non-production only

## Contributing

Contributions are welcome.

Before opening a pull request:

```bash
npm test
npm run build:dashboard
```

Please keep changes focused, document new environment variables, and include reproduction steps for bug fixes.

## License

MIT. See [LICENSE](LICENSE).
