# Loy Payway — API Reference

> **Version:** 0.1.0 · **License:** MIT · **Status:** v1 MVP
>
> Open-source KHQR payment middleware for Cambodia's Bakong ecosystem.

---

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Demo Mode vs Live Mode](#demo-mode-vs-live-mode)
- [Endpoints](#endpoints)
  - [Health Check — `GET /health`](#get-health)
  - [API Info — `GET /api`](#get-api)
  - [Register Merchant — `POST /api/merchant/register`](#post-apimerchantregister)
  - [List Merchants — `GET /api/merchant`](#get-apimerchant)
  - [Get Merchant — `GET /api/merchant/:id`](#get-apimerchantid)
  - [Update Merchant — `PATCH /api/merchant/:id`](#patch-apimerchantid)
  - [Generate QR — `POST /api/qr/generate`](#post-apiqrgenerate)
  - [List Transactions — `GET /api/qr/transactions`](#get-apiqrtransactions)
  - [Get Transaction — `GET /api/qr/transactions/:id`](#get-apiqrtransactionsid)
  - [Webhook Preview — `POST /api/webhook/preview`](#post-apiwebhookpreview)
- [Transaction Status Lifecycle](#transaction-status-lifecycle)
- [Webhook Notifications](#webhook-notifications)
- [Error Reference](#error-reference)

---

## Base URL

```
http://localhost:3000
```

All paths in this document are relative to the base URL. In production, replace this with your deployed domain over HTTPS.

---

## Authentication

Loy Payway uses **API-key authentication**. You receive an API key when you register a merchant via [`POST /api/merchant/register`](#post-apimerchantregister). Pass the key using **either** of the two methods below — they are interchangeable.

### Method 1 — Authorization Header (recommended)

```
Authorization: Bearer <api-key>
```

### Method 2 — Custom Header

```
x-api-key: <api-key>
```

### Quick Example

```bash
# Using Authorization header
curl http://localhost:3000/api/qr/generate \
  -H "Authorization: Bearer abc123def456..." \
  -H "Content-Type: application/json" \
  -d '{"amount": 5.00}'

# Using x-api-key header
curl http://localhost:3000/api/qr/generate \
  -H "x-api-key: abc123def456..." \
  -H "Content-Type: application/json" \
  -d '{"amount": 5.00}'
```

### Authentication Errors

| Status | Body | Cause |
|--------|------|-------|
| `401` | `{"error":"Missing API key."}` | No `Authorization` or `x-api-key` header present |
| `401` | `{"error":"Invalid API key."}` | Key does not match any merchant, or the merchant is inactive |

> [!IMPORTANT]
> Store your API key securely. It is displayed **only once** — in the registration response. The [merchant list endpoint](#get-apimerchant) redacts it to a short preview.

---

## Rate Limiting

Rate limiting is applied **per IP address** to the QR generation endpoint.

| Scope | Window | Max Requests |
|-------|--------|--------------|
| `POST /api/qr/generate` | 60 seconds | 60 |

Standard `RateLimit-*` response headers are included on every QR-generation response:

| Header | Description |
|--------|-------------|
| `RateLimit-Limit` | Maximum requests allowed in the window |
| `RateLimit-Remaining` | Requests remaining in the current window |
| `RateLimit-Reset` | Seconds until the window resets |

When the limit is exceeded, the server responds with **`429 Too Many Requests`**.

> [!NOTE]
> Legacy rate-limit headers (`X-RateLimit-*`) are disabled. Use the modern `RateLimit-*` headers instead.

---

## Demo Mode vs Live Mode

Loy Payway ships with a **demo mode** for local development and testing.

| | Demo Mode | Live Mode |
|---|-----------|-----------|
| **Activation** | `PAYWAY_ALLOW_DEMO=true` (default) | `PAYWAY_ALLOW_DEMO=false` |
| **Bakong Token** | Not required | `BAKONG_BEARER_TOKEN` required |
| **QR Codes** | Valid KHQR strings (SDK-generated) | Valid KHQR strings (SDK-generated) |
| **Payment Confirmation** | Auto-confirmed after ~3 seconds | Real Bakong polling via NBC API |
| **Auto-Confirm Control** | `demoAutoConfirm` body field | Ignored |
| **Health Endpoint `mode`** | `"demo"` | `"live"` |
| **Seed Data** | Demo merchant + sample transactions | None |

> [!TIP]
> In demo mode, a pre-seeded merchant **"Sunrise Coffee"** is created automatically with the API key `demo-api-key-sunrise-coffee-premium`. You can use this key immediately to test the full flow.

---

## Endpoints

---

### `GET /health`

Server health and readiness check.

**Authentication:** None

#### Response `200 OK`

```json
{
  "status": "ok",
  "mode": "demo",
  "timestamp": "2026-06-05T09:00:00.000Z"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `status` | `string` | Always `"ok"` if the server is running |
| `mode` | `string` | `"demo"` or `"live"` — reflects `PAYWAY_ALLOW_DEMO` |
| `timestamp` | `string` | ISO 8601 timestamp of the response |

#### cURL

```bash
curl http://localhost:3000/health
```

---

### `GET /api`

Returns API metadata and a listing of available routes.

**Authentication:** None

#### Response `200 OK`

```json
{
  "name": "Loy Payway API",
  "version": "0.1.0",
  "routes": [
    "POST /api/merchant/register",
    "GET  /api/merchant",
    "POST /api/qr/generate",
    "GET  /api/qr/transactions",
    "GET  /api/qr/transactions/:id",
    "POST /api/webhook/preview"
  ]
}
```

#### cURL

```bash
curl http://localhost:3000/api
```

---

### `POST /api/merchant/register`

Register a new merchant. Returns a full merchant object including the **API key** and **secret key**.

**Authentication:** None

#### Request Headers

| Header | Value | Required |
|--------|-------|----------|
| `Content-Type` | `application/json` | Yes |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | **Yes** | Display name of the merchant |
| `accountId` | `string` | **Yes** | Bakong account ID (e.g. `merchant_name@bank_code`) |
| `webhookUrl` | `string` | No | URL to receive `payment.success` webhook POSTs |
| `telegramChatId` | `string` | No | Telegram chat ID for payment notifications |

#### Response `201 Created`

```json
{
  "merchant": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "apiKey": "4f92c8e1a3b7d605f8e2c9a1b3d7e5f94f92c8e1a3b7d605",
    "name": "Sunrise Coffee",
    "accountId": "012345678@aclb",
    "webhookUrl": null,
    "telegramChatId": null,
    "secretKey": "d8a3f1b7c9e2a4d6f8b1c3e5a7d9f2b4d8a3f1b7c9e2a4d6",
    "isActive": true,
    "createdAt": "2026-06-05T09:00:00.000Z"
  },
  "onboarding": {
    "apiKey": "4f92c8e1a3b7d605f8e2c9a1b3d7e5f94f92c8e1a3b7d605",
    "nextStep": "Use this API key as a Bearer token when calling /api/qr/generate."
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `merchant.id` | `string` | Unique merchant identifier (UUID) |
| `merchant.apiKey` | `string` | API key for Bearer authentication — **store this securely** |
| `merchant.name` | `string` | Merchant display name |
| `merchant.accountId` | `string` | Bakong account ID |
| `merchant.webhookUrl` | `string \| null` | Webhook callback URL |
| `merchant.telegramChatId` | `string \| null` | Telegram chat ID |
| `merchant.secretKey` | `string` | HMAC-SHA256 key for verifying webhook signatures |
| `merchant.isActive` | `boolean` | Whether the merchant is active |
| `merchant.createdAt` | `string` | ISO 8601 creation timestamp |
| `onboarding.apiKey` | `string` | Same API key, for convenience |
| `onboarding.nextStep` | `string` | Human-readable next step |

#### Error `400 Bad Request`

```json
{
  "error": "name and accountId are required."
}
```

#### cURL

```bash
curl -X POST http://localhost:3000/api/merchant/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sunrise Coffee",
    "accountId": "012345678@aclb",
    "webhookUrl": "https://example.com/webhook",
    "telegramChatId": "123456789"
  }'
```

> [!WARNING]
> The **`apiKey`** and **`secretKey`** are returned only in this response. There is no "reset key" endpoint in v1 — record them immediately.

---

### `GET /api/merchant`

List all registered merchants. API keys are redacted to a short preview.

**Authentication:** None

#### Response `200 OK`

```json
{
  "merchants": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "apiKey": "4f92c8e1a3b7d605f8e2c9a1b3d7e5f94f92c8e1a3b7d605",
      "apiKeyPreview": "4f92c8...",
      "name": "Sunrise Coffee",
      "accountId": "012345678@aclb",
      "webhookUrl": null,
      "telegramChatId": null,
      "secretKey": "d8a3f1b7c9e2a4d6f8b1c3e5a7d9f2b4d8a3f1b7c9e2a4d6",
      "isActive": true,
      "createdAt": "2026-06-05T09:00:00.000Z"
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `merchants` | `array` | List of merchant objects |
| `merchants[].apiKeyPreview` | `string` | First 6 characters of the API key followed by `...` |

> [!NOTE]
> The full `apiKey` and `secretKey` fields are currently included in the list response (v1 MVP). Future versions will redact these fields — rely on `apiKeyPreview` for display purposes.

#### cURL

```bash
curl http://localhost:3000/api/merchant
```

---

### `GET /api/merchant/:id`

Retrieve a single merchant by ID.

**Authentication:** None

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Merchant UUID |

#### Response `200 OK`

```json
{
  "merchant": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "apiKey": "4f92c8e1a3b7d605f8e2c9a1b3d7e5f94f92c8e1a3b7d605",
    "name": "Sunrise Coffee",
    "accountId": "012345678@aclb",
    "webhookUrl": null,
    "telegramChatId": null,
    "secretKey": "d8a3f1b7c9e2a4d6f8b1c3e5a7d9f2b4d8a3f1b7c9e2a4d6",
    "isActive": true,
    "createdAt": "2026-06-05T09:00:00.000Z"
  }
}
```

#### Error `404 Not Found`

```json
{
  "error": "Merchant not found."
}
```

#### cURL

```bash
curl http://localhost:3000/api/merchant/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

---

### `PATCH /api/merchant/:id`

Update an existing merchant. Only the fields you include in the body are changed.

**Authentication:** None

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Merchant UUID |

#### Request Headers

| Header | Value | Required |
|--------|-------|----------|
| `Content-Type` | `application/json` | Yes |

#### Request Body

All fields are optional. Only provided fields are updated.

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Updated display name |
| `accountId` | `string` | Updated Bakong account ID |
| `webhookUrl` | `string` | Updated webhook URL (send `""` to clear) |
| `telegramChatId` | `string` | Updated Telegram chat ID (send `""` to clear) |
| `isActive` | `boolean` | Enable or disable the merchant |

#### Response `200 OK`

```json
{
  "merchant": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "apiKey": "4f92c8e1a3b7d605f8e2c9a1b3d7e5f94f92c8e1a3b7d605",
    "name": "Sunrise Coffee (Updated)",
    "accountId": "012345678@aclb",
    "webhookUrl": "https://example.com/new-hook",
    "telegramChatId": null,
    "secretKey": "d8a3f1b7c9e2a4d6f8b1c3e5a7d9f2b4d8a3f1b7c9e2a4d6",
    "isActive": true,
    "createdAt": "2026-06-05T09:00:00.000Z"
  }
}
```

#### Error `404 Not Found`

```json
{
  "error": "Merchant not found."
}
```

#### cURL

```bash
curl -X PATCH http://localhost:3000/api/merchant/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sunrise Coffee (Updated)",
    "webhookUrl": "https://example.com/new-hook"
  }'
```

---

### `POST /api/qr/generate`

Generate a KHQR payment QR code and create a pending transaction. The server automatically starts background polling for payment confirmation.

**Authentication:** **Required** · **Rate Limited:** 60 req / 60 sec / IP

#### Request Headers

| Header | Value | Required |
|--------|-------|----------|
| `Content-Type` | `application/json` | Yes |
| `Authorization` | `Bearer <api-key>` | Yes (or use `x-api-key`) |
| `x-api-key` | `<api-key>` | Alternative to `Authorization` |

#### Request Body

| Field | Type | Default | Required | Description |
|-------|------|---------|----------|-------------|
| `amount` | `number` | — | **Yes** | Payment amount (must be positive) |
| `currency` | `string` | `"USD"` | No | `"USD"` or `"KHR"` |
| `externalRef` | `string` | auto-generated | No | Your own reference ID for this transaction |
| `demoAutoConfirm` | `boolean` | `true` | No | Auto-confirm in demo mode after ~3 sec (ignored in live) |

#### Response `201 Created`

```json
{
  "transaction": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "merchantId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "status": "PENDING",
    "amount": 4.50,
    "currency": "USD",
    "externalRef": "order-1001",
    "md5Hash": "e99a18c428cb38d5f260853678922e03",
    "qrString": "00020101021229180014merchant@aclb...",
    "demoAutoConfirm": true,
    "fromAccountId": null,
    "createdAt": "2026-06-05T09:01:00.000Z",
    "confirmedAt": null
  },
  "instructions": "Show qrString in the merchant UI and poll GET /api/transactions/:id for the status."
}
```

| Field | Type | Description |
|-------|------|-------------|
| `transaction.id` | `string` | Unique transaction UUID |
| `transaction.merchantId` | `string` | Owning merchant's UUID |
| `transaction.status` | `string` | Always `"PENDING"` on creation |
| `transaction.amount` | `number` | Normalized payment amount |
| `transaction.currency` | `string` | `"USD"` or `"KHR"` |
| `transaction.externalRef` | `string` | Your reference or an auto-generated 8-char ID |
| `transaction.md5Hash` | `string` | MD5 hash used internally for Bakong status checks |
| `transaction.qrString` | `string` | Full EMVCo-compliant KHQR string — render as QR code |
| `transaction.demoAutoConfirm` | `boolean` | Whether demo auto-confirm is enabled |
| `transaction.fromAccountId` | `string \| null` | Payer's Bakong account (populated after confirmation) |
| `transaction.createdAt` | `string` | ISO 8601 creation timestamp |
| `transaction.confirmedAt` | `string \| null` | ISO 8601 confirmation timestamp (`null` while pending) |
| `instructions` | `string` | Human-readable next step |

> [!IMPORTANT]
> The `qrString` value is a full EMVCo-compliant KHQR string starting with `000201`. Render it as a QR code image in your frontend using any QR library (e.g. `qrcode`, `qrcode.react`). This QR is scannable by all Cambodian banking apps: ABA, ACLEDA, Bakong, Wing, and others.

> [!TIP]
> After generating a QR, poll [`GET /api/qr/transactions/:id`](#get-apiqrtransactionsid) to check for status updates. In demo mode with `demoAutoConfirm: true`, the transaction moves to `SUCCESS` after approximately 3 seconds.

#### cURL

```bash
curl -X POST http://localhost:3000/api/qr/generate \
  -H "Authorization: Bearer demo-api-key-sunrise-coffee-premium" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 4.50,
    "currency": "USD",
    "externalRef": "order-1001"
  }'
```

---

### `GET /api/qr/transactions`

List transactions with summary statistics. Optionally scoped to a single merchant.

**Authentication:** Optional (scopes results when provided)

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `merchantId` | `string` | No | Filter by merchant UUID. When an API key is provided, this is automatically set to the authenticated merchant's ID. |

#### Scoping Behavior

| API Key Provided? | `merchantId` Param? | Result |
|--------------------|---------------------|--------|
| Yes | Ignored | Scoped to authenticated merchant |
| No | Yes | Scoped to the specified merchant |
| No | No | Returns empty array |

#### Response `200 OK`

```json
{
  "transactions": [
    {
      "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "merchantId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "status": "SUCCESS",
      "amount": 4.50,
      "currency": "USD",
      "externalRef": "order-1001",
      "md5Hash": "e99a18c428cb38d5f260853678922e03",
      "qrString": "00020101021229180014merchant@aclb...",
      "demoAutoConfirm": true,
      "fromAccountId": "demo-customer@bakong",
      "createdAt": "2026-06-05T09:01:00.000Z",
      "confirmedAt": "2026-06-05T09:01:03.000Z"
    }
  ],
  "stats": {
    "totalTransactions": 3,
    "successfulTransactions": 1,
    "pendingTransactions": 1,
    "expiredTransactions": 1,
    "totalRevenue": 4.50,
    "revenueByCurrency": {
      "USD": 4.50
    }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `transactions` | `array` | List of transaction objects (newest first) |
| `stats.totalTransactions` | `number` | Total count of all transactions |
| `stats.successfulTransactions` | `number` | Count with status `SUCCESS` |
| `stats.pendingTransactions` | `number` | Count with status `PENDING` |
| `stats.expiredTransactions` | `number` | Count with status `EXPIRED` |
| `stats.totalRevenue` | `number` | Sum of all successful transaction amounts |
| `stats.revenueByCurrency` | `object` | Revenue breakdown keyed by currency code |

#### cURL

```bash
# Authenticated — scoped to your merchant
curl http://localhost:3000/api/qr/transactions \
  -H "Authorization: Bearer demo-api-key-sunrise-coffee-premium"

# Unauthenticated — filter by merchantId
curl "http://localhost:3000/api/qr/transactions?merchantId=demo-merchant-id"
```

---

### `GET /api/qr/transactions/:id`

Retrieve a single transaction by ID.

**Authentication:** Optional (validates ownership when provided)

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Transaction UUID |

#### Response `200 OK`

```json
{
  "transaction": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "merchantId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "status": "SUCCESS",
    "amount": 4.50,
    "currency": "USD",
    "externalRef": "order-1001",
    "md5Hash": "e99a18c428cb38d5f260853678922e03",
    "qrString": "00020101021229180014merchant@aclb...",
    "demoAutoConfirm": true,
    "fromAccountId": "demo-customer@bakong",
    "createdAt": "2026-06-05T09:01:00.000Z",
    "confirmedAt": "2026-06-05T09:01:03.000Z"
  }
}
```

#### Error `404 Not Found`

```json
{
  "error": "Transaction not found."
}
```

#### Error `403 Forbidden`

Returned when an API key is provided but the transaction belongs to a different merchant.

```json
{
  "error": "Access denied. This transaction does not belong to your account."
}
```

#### cURL

```bash
curl http://localhost:3000/api/qr/transactions/f47ac10b-58cc-4372-a567-0e02b2c3d479 \
  -H "Authorization: Bearer demo-api-key-sunrise-coffee-premium"
```

---

### `POST /api/webhook/preview`

Generate a sample webhook payload with its HMAC-SHA256 signature. Useful for testing and verifying your webhook signature logic before going live.

**Authentication:** None

#### Request Headers

| Header | Value | Required |
|--------|-------|----------|
| `Content-Type` | `application/json` | Yes |

#### Request Body

All fields are optional. Defaults are used if omitted.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `secretKey` | `string` | `"preview-secret"` | The HMAC secret to sign with |
| `payload` | `object` | `{"event":"payment.success","transactionId":"demo"}` | Custom payload to sign |

#### Response `200 OK`

```json
{
  "payload": {
    "event": "payment.success",
    "transactionId": "demo"
  },
  "signature": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `payload` | `object` | The payload that was signed |
| `signature` | `string` | Hex-encoded HMAC-SHA256 signature of `JSON.stringify(payload)` |

#### cURL

```bash
# Using defaults
curl -X POST http://localhost:3000/api/webhook/preview \
  -H "Content-Type: application/json" \
  -d '{}'

# With custom secret and payload
curl -X POST http://localhost:3000/api/webhook/preview \
  -H "Content-Type: application/json" \
  -d '{
    "secretKey": "my-merchant-secret-key",
    "payload": {
      "event": "payment.success",
      "transactionId": "txn-12345",
      "amount": 10.00
    }
  }'
```

---

## Transaction Status Lifecycle

Every transaction progresses through a defined set of statuses after QR generation:

```mermaid
stateDiagram-v2
    [*] --> PENDING: QR generated

    PENDING --> SUCCESS: Payment confirmed\n(Bakong or demo auto-confirm)
    PENDING --> EXPIRED: Polling window elapsed\n(default 10 min)
    PENDING --> FAILED: Bakong reports failure\nor polling error

    SUCCESS --> [*]
    EXPIRED --> [*]
    FAILED --> [*]
```

### Status Definitions

| Status | Description |
|--------|-------------|
| `PENDING` | QR has been generated; awaiting payment. The server is actively polling for confirmation. |
| `SUCCESS` | Payment confirmed. `fromAccountId` and `confirmedAt` are populated. Webhook and Telegram notifications dispatched. |
| `EXPIRED` | The polling window (default 10 minutes, configurable via `QR_EXPIRY_SECONDS`) elapsed without payment. |
| `FAILED` | Bakong returned a terminal failure, or an unrecoverable error occurred during polling. |

> [!NOTE]
> In **demo mode** with `demoAutoConfirm: true`, transactions move from `PENDING` to `SUCCESS` automatically after approximately 3 seconds. Set `demoAutoConfirm: false` to keep transactions in `PENDING` for manual testing.

---

## Webhook Notifications

When a transaction reaches `SUCCESS`, Loy Payway sends notifications to the merchant's configured channels.

### Webhook POST

If `webhookUrl` is set on the merchant, a `POST` request is sent:

```http
POST https://your-server.com/webhook
Content-Type: application/json
X-PayWay-Signature: <hmac-sha256-hex>
```

#### Webhook Body

```json
{
  "event": "payment.success",
  "merchantId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "transaction": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "status": "SUCCESS",
    "amount": 4.50,
    "currency": "USD",
    "fromAccountId": "demo-customer@bakong",
    "externalRef": "order-1001",
    "confirmedAt": "2026-06-05T09:01:03.000Z"
  }
}
```

### Verifying the Signature

The `X-PayWay-Signature` header contains an HMAC-SHA256 hex digest of the JSON body, keyed with your merchant's `secretKey`.

```javascript
const crypto = require("node:crypto");

function verifyWebhook(secretKey, body, signatureHeader) {
  const expected = crypto
    .createHmac("sha256", secretKey)
    .update(JSON.stringify(body))
    .digest("hex");
  return expected === signatureHeader;
}

// Express example
app.post("/webhook", express.json(), (req, res) => {
  const signature = req.get("X-PayWay-Signature");
  if (!verifyWebhook(MERCHANT_SECRET_KEY, req.body, signature)) {
    return res.status(401).send("Invalid signature");
  }
  // Process the payment event
  console.log("Payment confirmed:", req.body.transaction.id);
  res.sendStatus(200);
});
```

```python
# Python example
import hmac, hashlib, json

def verify_webhook(secret_key: str, body: dict, signature_header: str) -> bool:
    expected = hmac.new(
        secret_key.encode(),
        json.dumps(body, separators=(",", ":")).encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature_header)
```

> [!CAUTION]
> Always use a **timing-safe comparison** (e.g. `crypto.timingSafeEqual` in Node.js or `hmac.compare_digest` in Python) when validating signatures to prevent timing attacks.

### Telegram Notification

If `telegramChatId` is set and `TELEGRAM_BOT_TOKEN` is configured, a text message is sent:

```
Payment received
Merchant: Sunrise Coffee
Amount: 4.50 USD
From: demo-customer@bakong
Reference: order-1001
```

---

## Error Reference

### HTTP Status Codes

| Code | Meaning | Typical Cause |
|------|---------|---------------|
| `200` | OK | Successful read or update |
| `201` | Created | Successful resource creation (merchant, transaction) |
| `400` | Bad Request | Missing required fields in request body |
| `401` | Unauthorized | Missing, invalid, or inactive API key |
| `403` | Forbidden | Authenticated user does not own the requested resource |
| `404` | Not Found | Resource (merchant or transaction) does not exist |
| `429` | Too Many Requests | Rate limit exceeded on QR generation |
| `500` | Internal Server Error | Unhandled server error |

### Error Response Format

All errors follow a consistent JSON structure:

```json
{
  "error": "<human-readable error message>"
}
```

### Error Messages Reference

| Endpoint | Status | `error` Value |
|----------|--------|---------------|
| `POST /api/merchant/register` | `400` | `"name and accountId are required."` |
| `GET /api/merchant/:id` | `404` | `"Merchant not found."` |
| `PATCH /api/merchant/:id` | `404` | `"Merchant not found."` |
| `POST /api/qr/generate` | `401` | `"Missing API key."` |
| `POST /api/qr/generate` | `401` | `"Invalid API key."` |
| `GET /api/qr/transactions/:id` | `404` | `"Transaction not found."` |
| `GET /api/qr/transactions/:id` | `403` | `"Access denied. This transaction does not belong to your account."` |
| Any | `500` | `"Internal server error."` or the caught error's message |

---

## Environment Variables

These environment variables control server behavior. Copy `.env.example` to `.env` to get started.

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server listening port |
| `PAYWAY_ALLOW_DEMO` | `true` | Enable demo mode. Set to `"false"` for live Bakong integration |
| `BAKONG_BEARER_TOKEN` | — | NBC Bakong API bearer token (required in live mode) |
| `BAKONG_ACCOUNT_ID` | `012345678@aclb` | Default Bakong account for the demo seed merchant |
| `BAKONG_API_BASE` | `https://api-bakong.nbc.gov.kh` | Bakong API base URL |
| `DATABASE_URL` | — | PostgreSQL connection string. If omitted, in-memory storage is used |
| `QR_EXPIRY_SECONDS` | `600` | QR code / polling expiry window in seconds (default 10 minutes) |
| `POLL_INTERVAL_MS` | `5000` | Interval between Bakong polling attempts in milliseconds |
| `TELEGRAM_BOT_TOKEN` | — | Telegram Bot API token for payment notifications |
| `TELEGRAM_CHAT_ID` | — | Default Telegram chat ID for the demo seed merchant |

---

## Quick-Start Integration Guide

### Full Payment Flow in 3 Steps

```bash
# ① Register your merchant
curl -s -X POST http://localhost:3000/api/merchant/register \
  -H "Content-Type: application/json" \
  -d '{"name":"My Store","accountId":"mystore@aclb"}' \
  | jq '.merchant.apiKey'
# → "4f92c8e1a3b7d605..."

# ② Generate a QR code for a $5.00 payment
curl -s -X POST http://localhost:3000/api/qr/generate \
  -H "Authorization: Bearer 4f92c8e1a3b7d605..." \
  -H "Content-Type: application/json" \
  -d '{"amount":5.00,"currency":"USD","externalRef":"invoice-42"}' \
  | jq '.transaction.id, .transaction.qrString'
# → "f47ac10b-..." , "000201..."

# ③ Poll for payment confirmation
curl -s http://localhost:3000/api/qr/transactions/f47ac10b-... \
  | jq '.transaction.status'
# → "PENDING" ... then "SUCCESS"
```

### Integration Diagram

```mermaid
sequenceDiagram
    participant Client as Your App
    participant LP as Loy Payway
    participant Bakong as Bakong / NBC
    participant WH as Your Webhook

    Client->>LP: POST /api/merchant/register
    LP-->>Client: { apiKey, secretKey }

    Client->>LP: POST /api/qr/generate (Bearer token)
    LP-->>Client: { qrString, transactionId }
    Note over Client: Render QR code in UI

    LP->>Bakong: Poll /v1/check_transaction_by_md5
    Note over LP,Bakong: Repeats every 5s for up to 10 min

    Bakong-->>LP: Payment confirmed

    LP->>WH: POST webhook (X-PayWay-Signature)
    LP->>LP: Send Telegram notification

    Client->>LP: GET /api/qr/transactions/:id
    LP-->>Client: { status: "SUCCESS" }
```

---

<p align="center">
  <sub>Loy Payway v0.1.0 · MIT License · Built for Cambodia's Bakong ecosystem 🇰🇭</sub>
</p>
