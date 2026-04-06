# Loy Payway Quickstart

1. Copy `.env.example` to `.env`.
2. Run `npm install` at the repo root.
3. Start the API with `npm run dev:server`.
4. Register a merchant through `POST /api/merchant/register`.
5. Generate a QR through `POST /api/qr/generate`.

Demo mode is enabled by default, so generated payments move from `PENDING` to `SUCCESS` automatically after a short delay.
