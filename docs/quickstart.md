# Loy Payway Quickstart & Integration Guide

Welcome to the **Loy Payway** quickstart guide. This document provides a step-by-step walkthrough to get you set up and integrating Cambodia's Bakong KHQR payments into your application.

---

## 🚀 Setup & Installation

### Requirements

- **Node.js** v20 or newer
- **npm** v10 or newer

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/molikaleak/LoyPayWay.git
cd LoyPayWay

# Copy the environment template
cp .env.example .env

# Install workspaces dependencies
npm install
```

### Step 2: Start the Servers

Start the API middleware server:
```bash
npm run dev:server
```
*(Runs on `http://localhost:3000`)*

In a separate terminal tab, start the merchant console dashboard:
```bash
npm run dev:dashboard
```
*(Runs on `http://localhost:3001`)*

---

## 🛠️ Step-by-Step Integration Flow

Here is how to connect your app to Loy Payway to accept KHQR payments:

### 1. Register a Merchant

Every transaction belongs to a registered merchant (representing a single business location or merchant account). You can register a merchant using the dashboard at `http://localhost:3001` or via the API:

```bash
curl -X POST http://localhost:3000/api/merchant/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sunrise Coffee",
    "accountId": "sunrise_coffee@aclb",
    "webhookUrl": "https://yourserver.com/hooks/payments",
    "telegramChatId": "123456789"
  }'
```

**Key response fields to store:**
- `merchant.id`: Merchant's unique UUID.
- `merchant.apiKey`: API Key to authenticate your transaction requests.
- `merchant.secretKey`: HMAC-SHA256 secret key to verify incoming webhooks.

---

### 2. Generate a Payment QR Code

When a customer checks out, request a payment QR code from the server. Include the `Authorization: Bearer <your-merchant-api-key>` header:

```bash
curl -X POST http://localhost:3000/api/qr/generate \
  -H "Authorization: Bearer demo-api-key-sunrise-coffee-premium" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 4.50,
    "currency": "USD",
    "externalRef": "order_1042"
  }'
```

**Key response fields:**
- `transaction.id`: UUID to check status later.
- `transaction.qrString`: The EMVCo-compliant KHQR payload (render this as a QR code).
- `transaction.md5Hash`: Internal transaction identifier.

#### 💡 How to Display the QR Code in React / Next.js
In your client application, install a QR rendering library:
```bash
npm install qrcode.react
```
Then render the `qrString` returned by the API:
```jsx
import { QRCodeSVG } from 'qrcode.react';

function PaymentScreen({ qrString, amount, currency }) {
  return (
    <div className="payment-card">
      <h3>Scan to Pay</h3>
      <QRCodeSVG value={qrString} size={256} level="M" />
      <p>Total: {amount} {currency}</p>
    </div>
  );
}
```

---

### 3. Check / Poll for Payment Status

While the QR code is displayed to the customer, poll the transaction status every 2 to 5 seconds to know when the payment is completed:

```bash
curl http://localhost:3000/api/qr/transactions/fb531253-7efa-4c49-a5a8-020a374ec22c \
  -H "Authorization: Bearer demo-api-key-sunrise-coffee-premium"
```

**Statuses:**
- `PENDING`: Waiting for the customer to scan and pay.
- `SUCCESS`: Payment successfully confirmed.
- `EXPIRED`: The QR code validity window (default 10 minutes) elapsed.
- `FAILED`: Payment failed.

---

### 4. Receive Webhook Delivery

When the status transitions to `SUCCESS`, Loy Payway dispatches a secure `POST` request to your registered `webhookUrl`:

```http
POST https://yourserver.com/hooks/payments
X-PayWay-Signature: <hmac-sha256-hex>
Content-Type: application/json

{
  "event": "payment.success",
  "merchantId": "demo-merchant-id",
  "transaction": {
    "id": "fb531253-7efa-4c49-a5a8-020a374ec22c",
    "status": "SUCCESS",
    "amount": 4.50,
    "currency": "USD",
    "fromAccountId": "payer@bakong"
  }
}
```

#### 🛡️ Verifying Webhook Signatures (Node.js Express)
Use the merchant's `secretKey` (obtained during registration) to verify that the request came from Loy Payway:
```javascript
const crypto = require('node:crypto');

app.post('/hooks/payments', express.json({
  verify: (req, res, buf) => { req.rawBody = buf; }
}), (req, res) => {
  const signature = req.headers['x-payway-signature'];
  const expected = crypto
    .createHmac('sha256', process.env.MERCHANT_SECRET_KEY)
    .update(req.rawBody)
    .digest('hex');

  if (signature !== expected) {
    return res.status(401).send('Signature mismatch');
  }

  // Fulfill order
  const { transaction } = req.body;
  console.log(`Payment confirmed: ${transaction.id}`);
  res.sendStatus(200);
});
```

---

## 🏦 Moving to Production (Live Bakong Mode)

To switch from the simulated demo mode to the live Bakong network:

1. Register at the official **Bakong Open API** developer portal.
2. Obtain a JWT token (`BAKONG_BEARER_TOKEN`).
3. Set your environment variables in `.env`:
   ```env
   PAYWAY_ALLOW_DEMO=false
   BAKONG_BEARER_TOKEN=your_live_jwt_token_here
   BAKONG_ACCOUNT_ID=your_merchant_account@bank_code
   ```
4. Restart your API server. The polling engine will automatically transition from simulation mode to checking real-time NBC interbank clearing statuses.

---

## 📚 Related Documentation

For detailed specifications:
- 📖 [API Reference](api-reference.md) — Endpoint JSON schemas, rate limits, and error definitions.
- 🔗 [Webhook Integration Guide](webhooks.md) — Verification code examples in Python, Go, PHP, and Node.js.
- 🏦 [Bakong & KHQR Technical Guide](bakong-integration.md) — Architectural overview, bank code references, and state machine diagrams.
